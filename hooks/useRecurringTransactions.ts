import { useState, useEffect, useCallback } from 'react';
import { RecurringTransaction, Expense } from '../types';
import { db } from '../utils/db';

export const useRecurringTransactions = () => {
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);

  useEffect(() => {
    const loadAndProcess = async () => {
        // 1. Load Recurring Transactions
        const recurring = await db.getAll('recurringTransactions');
        setRecurringTransactions(recurring);

        // 2. Check for due transactions
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        let hasUpdates = false;
        const newExpenses: Expense[] = [];

        const updatedRecurring = recurring.map(rt => {
            const start = new Date(rt.startDate);
            const lastGenerated = rt.lastCreatedDate ? new Date(rt.lastCreatedDate) : null;
            
            // Calculate next due date based on start date or last generated date
            let nextDue = new Date(start);
            if (lastGenerated) {
                nextDue = new Date(lastGenerated);
                switch(rt.frequency) {
                    case 'daily': nextDue.setDate(nextDue.getDate() + 1); break;
                    case 'weekly': nextDue.setDate(nextDue.getDate() + 7); break;
                    case 'monthly': nextDue.setMonth(nextDue.getMonth() + 1); break;
                    case 'yearly': nextDue.setFullYear(nextDue.getFullYear() + 1); break;
                }
            }

            // If due date is today or in the past, generate expense
            if (nextDue <= today) {
                const newExpense: Expense = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2,5),
                    name: rt.name,
                    amount: rt.amount,
                    type: rt.type,
                    category: rt.category || 'Recurring',
                    date: nextDue.toISOString(),
                    files: []
                };
                newExpenses.push(newExpense);
                hasUpdates = true;
                
                // Update the recurring transaction's lastCreatedDate
                return { ...rt, lastCreatedDate: nextDue.toISOString() };
            }
            return rt;
        });

        if (hasUpdates) {
            // Save generated expenses
            for (const exp of newExpenses) {
                await db.add('expenses', exp);
            }
            // Update recurring transactions state and DB
            for (const rt of updatedRecurring) {
                await db.put('recurringTransactions', rt);
            }
            setRecurringTransactions(updatedRecurring);
            console.log(`Auto-generated ${newExpenses.length} recurring transactions.`);
            // Note: We rely on useExpenses hook to refresh its own state on next render/mount
            // Ideally we'd trigger a global refresh, but in this architecture, page reload or component remount handles it.
        }
    };
    
    loadAndProcess();
  }, []);

  const addRecurringTransaction = useCallback(async (transaction: Omit<RecurringTransaction, 'id'>) => {
    const newTransaction: RecurringTransaction = {
      ...transaction,
      id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
    };
    setRecurringTransactions(prev => [...prev, newTransaction]);
    await db.add('recurringTransactions', newTransaction);
  }, []);
  
  const updateRecurringTransaction = useCallback(async (updatedTransaction: RecurringTransaction) => {
    setRecurringTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    await db.put('recurringTransactions', updatedTransaction);
  }, []);

  const deleteRecurringTransaction = useCallback(async (id: string) => {
    setRecurringTransactions(prev => prev.filter(t => t.id !== id));
    await db.delete('recurringTransactions', id);
  }, []);

  return { recurringTransactions, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction };
};
