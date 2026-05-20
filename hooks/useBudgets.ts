
import { useState, useEffect, useCallback } from 'react';
import { Budget } from '../types';
import { db } from '../utils/db';

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    const load = async () => {
        try {
            const data = await db.getAll('budgets');
            setBudgets(data);
        } catch (error) {
            console.error('Failed to load budgets from DB', error);
        }
    };
    load();
  }, []);

  const addBudget = useCallback(async (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
    };
    await db.add('budgets', newBudget);
    setBudgets(prev => [...prev, newBudget]);
  }, []);

  const updateBudget = useCallback(async (updatedBudget: Budget) => {
    await db.put('budgets', updatedBudget);
    setBudgets(prev => prev.map((b) => b.id === updatedBudget.id ? updatedBudget : b));
  }, []);

  const deleteBudget = useCallback(async (id: string) => {
    await db.delete('budgets', id);
    setBudgets(prev => prev.filter(b => b.id !== id));
  }, []);

  return { budgets, addBudget, updateBudget, deleteBudget };
};
