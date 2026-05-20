import { useState, useEffect, useCallback } from 'react';
import { Reminder } from '../types';
import { db } from '../utils/db';
import { syncToCloud, pullFromCloud, deleteFromCloud } from '../lib/syncService';

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const load = async () => {
        const data = await db.getAll('reminders');
        setReminders(data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        
        const cloudData = await pullFromCloud('reminders');
        if (cloudData.length > 0) {
            setReminders(cloudData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        }
    };
    load();
  }, []);

  const addReminder = useCallback(async (reminder: Omit<Reminder, 'id' | 'completed'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
      completed: false,
    };
    setReminders(prev => [newReminder, ...prev].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    await db.add('reminders', newReminder);
    await syncToCloud('reminders', newReminder);
  }, []);
  
  const updateReminder = useCallback(async (updatedReminder: Reminder) => {
    let finalReminder = updatedReminder;
    
    // Handle recurring logic immediately upon completion
    if (updatedReminder.completed && updatedReminder.frequency && updatedReminder.frequency !== 'none') {
        const nextDate = new Date(updatedReminder.date);
        switch (updatedReminder.frequency) {
            case 'daily': nextDate.setDate(nextDate.getDate() + 1); break;
            case 'weekly': nextDate.setDate(nextDate.getDate() + 7); break;
            case 'monthly': nextDate.setMonth(nextDate.getMonth() + 1); break;
        }
        // We actually create a NEW reminder for the next occurrence and keep the old one completed
        // BUT current logic suggests updating the existing one to save space/complexity for now.
        // Let's stick to unchecking and moving date forward for simplicity as per original app logic
        finalReminder = { ...updatedReminder, completed: false, date: nextDate.toISOString() };
    }

    setReminders(prev => prev.map(r => r.id === finalReminder.id ? finalReminder : r).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    await db.put('reminders', finalReminder);
    await syncToCloud('reminders', finalReminder);
  }, []);

  const deleteReminder = useCallback(async (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    await db.delete('reminders', id);
    await deleteFromCloud('reminders', id);
  }, []);

  return { reminders, addReminder, updateReminder, deleteReminder };
};
