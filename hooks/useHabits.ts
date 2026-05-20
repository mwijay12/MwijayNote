
import { useState, useEffect, useCallback } from 'react';
import { Habit } from '../types';
import { db } from '../utils/db';
import { syncToCloud, pullFromCloud, deleteFromCloud } from '../lib/syncService';

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    const load = async () => {
        try {
            const data = await db.getAll('habits');
            setHabits(data);
            
            const cloudData = await pullFromCloud('habits');
            if (cloudData.length > 0) setHabits(cloudData);
        } catch (error) {
            console.error('Failed to load habits from DB', error);
        }
    };
    load();
  }, []);

  const addHabit = useCallback(async (habit: Omit<Habit, 'id' | 'completions'>) => {
    const newHabit: Habit = {
      ...habit,
      id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
      completions: {},
    };
    await db.add('habits', newHabit);
    setHabits(prev => [...prev, newHabit]);
    await syncToCloud('habits', newHabit);
  }, []);

  const deleteHabit = useCallback(async (id: string) => {
    await db.delete('habits', id);
    setHabits(prev => prev.filter(h => h.id !== id));
    await deleteFromCloud('habits', id);
  }, []);

  const toggleHabitCompletion = useCallback(async (habitId: string, date: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
        const newCompletions = { ...habit.completions };
        if (newCompletions[date]) {
            delete newCompletions[date];
        } else {
            newCompletions[date] = true;
        }
        const updatedHabit = { ...habit, completions: newCompletions };
        await db.put('habits', updatedHabit);
        setHabits(prev => prev.map(h => h.id === habitId ? updatedHabit : h));
        await syncToCloud('habits', updatedHabit);
    }
  }, [habits]);

  return { habits, addHabit, deleteHabit, toggleHabitCompletion };
};
