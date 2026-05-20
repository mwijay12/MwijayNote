import { useState, useEffect, useCallback } from 'react';
import { Goal } from '../types';
import { db } from '../utils/db';
import { syncToCloud, pullFromCloud, deleteFromCloud } from '../lib/syncService';
import { auth } from '../lib/firebase';
import { sendGoalCompleted } from '../services/n8nEvents';

export const useFinancialGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const load = async () => {
        try {
            const data = await db.getAll('goals');
            setGoals(data);
            
            const cloudData = await pullFromCloud('goals');
            if (cloudData.length > 0) setGoals(cloudData);
        } catch (error) {
            console.error('Failed to load goals from DB', error);
        }
    };
    load();
  }, []);

  const addGoal = useCallback(async (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
      milestones: goal.category !== 'Financial' ? [] : undefined,
    };
    await db.add('goals', newGoal);
    setGoals(prev => [...prev, newGoal]);
    await syncToCloud('goals', newGoal);
  }, []);

  const updateGoal = useCallback(async (updatedGoal: Goal) => {
    const existing = await db.get('goals', updatedGoal.id);
    await db.put('goals', updatedGoal);
    setGoals(prev => prev.map((g) => g.id === updatedGoal.id ? updatedGoal : g));
    await syncToCloud('goals', updatedGoal);

    // Fire n8n event if goal just reached completed status
    if (updatedGoal.status === 'Completed' && existing?.status !== 'Completed') {
        const user = auth.currentUser;
        if (user?.email) {
            sendGoalCompleted(user.displayName || 'User', user.email, {
                title: updatedGoal.name,
                category: updatedGoal.category
            }).catch(console.warn);
        }
    }
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    await db.delete('goals', id);
    setGoals(prev => prev.filter(g => g.id !== id));
    await deleteFromCloud('goals', id);
  }, []);

  const toggleMilestone = useCallback(async (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal && goal.milestones) {
        const updatedMilestones = goal.milestones.map(m => m.id === milestoneId ? {...m, completed: !m.completed} : m);
        const updatedGoal = { ...goal, milestones: updatedMilestones };
        await db.put('goals', updatedGoal);
        setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
        await syncToCloud('goals', updatedGoal);
    }
  }, [goals]);

  return { goals, addGoal, updateGoal, deleteGoal, toggleMilestone };
};
