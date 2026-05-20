import { useState, useEffect, useCallback } from 'react';
import { Expense } from '../types';
import { db } from '../utils/db';
import { syncToCloud, pullFromCloud } from '../lib/syncService';
import { useSettings } from './useSettings';
import { sendNewExpense } from '../services/n8nEvents';
import { auth } from '../lib/firebase';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { settings } = useSettings();

  useEffect(() => {
    const load = async () => {
        const localData = await db.getAll('expenses');
        setExpenses(localData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        
        const cloudData = await pullFromCloud('expenses');
        if (cloudData.length > 0) {
            setExpenses(cloudData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
    };
    load();
  }, []);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
      files: expense.files || [],
      goalId: expense.goalId,
    };
    
    setExpenses(prev => [newExpense, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    await db.add('expenses', newExpense);
    await syncToCloud('expenses', newExpense);

    // Fire n8n event with budget usage (non-blocking)
    const user = auth.currentUser;
    if (user?.email) {
      // Calculate this month's budget usage
      const allExpenses = await db.getAll('expenses');
      const thisMonth = new Date().toISOString().slice(0, 7);
      const monthData = allExpenses.filter(e => e.date?.startsWith(thisMonth));
      const income = monthData.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
      const spent = monthData.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
      const budgetUsagePercent = income > 0 ? Math.min(100, Math.round((spent / income) * 100)) : 0;

      sendNewExpense(user.displayName || 'User', user.email, {
        id: newExpense.id,
        amount: newExpense.amount,
        category: newExpense.category ?? 'Other',
        type: newExpense.type,
        date: newExpense.date,
      }, budgetUsagePercent).catch(console.warn);
    }
  }, [settings.automation?.n8nWebhookUrl]);

  return { expenses, addExpense };
};
