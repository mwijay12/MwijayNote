import { useState, useEffect, useCallback } from 'react';
import { JournalEntry } from '../types';
import { db } from '../utils/db';
import { syncToCloud, pullFromCloud } from '../lib/syncService';
import { auth } from '../lib/firebase';
import { useSettings } from './useSettings';
import { sendNewJournal, sendStreakMilestone } from '../services/n8nEvents';

export const useJournal = () => {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const { settings } = useSettings();


  useEffect(() => {
    const load = async () => {
        try {
            // First load from local
            const localData = await db.getAll('journals');
            setJournals(localData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            
            // Wait for auth to be ready
            const user = auth.currentUser;
            if (user) {
                // Then sync from cloud
                const cloudData = await pullFromCloud('journals');
                if (cloudData.length > 0) {
                    setJournals(cloudData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                }
            }
        } catch (e) {
            console.error("Failed to load journals from DB", e);
        }
    };
    
    // Listen for auth state changes to trigger pull
    const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) load();
    });

    load();
    return () => unsubscribe();
  }, []);

  const addJournal = useCallback(async (journal: Partial<JournalEntry>) => {
    const id = journal.id || (new Date().getTime().toString() + Math.random().toString(36).substr(2, 9));
    
    const newJournal: JournalEntry = {
      title: 'Untitled',
      content: '',
      date: new Date().toISOString(),
      type: 'Gratitude Journal',
      topic: 'gratitude and thankfulness' as any,
      ...journal,
      id: id,
      files: journal.files || [],
      tasks: journal.tasks || [],
      tags: journal.tags || [],
    };
    
    setJournals(prev => {
        const existingIndex = prev.findIndex(j => j.id === newJournal.id);
        if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = { ...updated[existingIndex], ...newJournal } as JournalEntry;
            return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        return [newJournal, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    
    await db.put('journals', newJournal);
    // Sync to cloud (Firebase)
    await syncToCloud('journals', newJournal);

    // Fire n8n events (non-blocking)
    const user = auth.currentUser;
    if (user?.email) {
      const wordCount = newJournal.content
        ?.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length ?? 0;

      sendNewJournal(user.displayName || 'User', user.email, {
        id: newJournal.id,
        title: newJournal.title,
        type: newJournal.type,
        mood: newJournal.mood,
        wordCount,
        tags: newJournal.tags ?? [],
        date: newJournal.date,
      }).catch(console.warn);

      // Check for streak milestones after every save
      const allJournals = await db.getAll('journals');
      const dates = [...new Set(allJournals.map(j => j.date.split('T')[0]))].sort((a, b) => b.localeCompare(a));
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < dates.length; i++) {
        const expected = new Date(today);
        expected.setDate(today.getDate() - i);
        if (dates[i] === expected.toISOString().split('T')[0]) streak++;
        else break;
      }
      if (streak > 0) sendStreakMilestone(user.displayName || 'User', user.email, streak).catch(console.warn);
    }
  }, [settings.automation?.n8nWebhookUrl]);

  const updateJournal = useCallback(async (updatedJournal: Partial<JournalEntry>) => {
    if (!updatedJournal.id) {
        console.error("Cannot update journal without an ID");
        return;
    }
    
    // Update UI immediately for responsiveness
    setJournals(prev => 
        prev.map(j => j.id === updatedJournal.id ? { ...j, ...updatedJournal } as JournalEntry : j)
    );
    
    // Fetch full existing entry from DB to prevent data loss on partial updates
    const existing = await db.get('journals', updatedJournal.id);
    
    const finalJournal: JournalEntry = {
        // Start with default structure to be safe
        title: 'Untitled',
        content: '',
        date: new Date().toISOString(),
        type: 'Gratitude Journal',
        topic: 'gratitude and thankfulness' as any,
        files: [],
        tasks: [],
        tags: [],
        // Layer existing data from DB
        ...existing, 
        // Layer the new partial updates on top
        ...updatedJournal,
        // Ensure ID is correct
        id: updatedJournal.id,
    };
    await db.put('journals', finalJournal);
    await syncToCloud('journals', finalJournal);
  }, [settings.automation?.n8nWebhookUrl]);
  
  return { journals, addJournal, updateJournal };
};
