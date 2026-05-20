import { useState, useEffect, useCallback } from 'react';
import { AppView, JournalEntry, Habit, AiCoachingSuggestion } from '../types';
import { getAiCoachingSuggestion } from '../services/geminiService';

interface UseAiCoachProps {
  journals: JournalEntry[];
  habits: Habit[];
  currentView: AppView;
}

const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

const COACH_STORAGE_KEY = 'mwijay_coach_dismissed';

export const useAiCoach = ({ journals, habits, currentView }: UseAiCoachProps) => {
  const [suggestion, setSuggestion] = useState<AiCoachingSuggestion | null>(null);

  const checkPatterns = useCallback(async () => {
    // Don't show suggestions on non-home screens or if one is already showing
    if (currentView !== AppView.HOME || suggestion) return;

    // Check for low mood streak
    const recentJournals = journals
      .slice(0, 5)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (recentJournals.length >= 3) {
      const lastThreeDays = [new Date(), new Date(Date.now() - 86400000), new Date(Date.now() - 2 * 86400000)];
      const moodEntriesOnLastThreeDays = lastThreeDays.map(day => 
          recentJournals.find(j => j.mood && isSameDay(new Date(j.date), day))
      );

      if (moodEntriesOnLastThreeDays.every(j => j && j.mood! < 3)) {
        const suggestionId = `low_mood_${new Date().toISOString().split('T')[0]}`;
        const isDismissed = localStorage.getItem(COACH_STORAGE_KEY) === suggestionId;
        if (!isDismissed) {
            const result = await getAiCoachingSuggestion({ type: 'low_mood_streak', data: { count: 3 } });
            if (result) {
                setSuggestion({ ...result, id: suggestionId });
                return; 
            }
        }
      }
    }

    // Check for journaling gap
    if (journals.length > 0) {
        const lastJournalDate = new Date(journals[0].date);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - lastJournalDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 4) {
             const suggestionId = `journal_gap_${new Date().toISOString().split('T')[0]}`;
             const isDismissed = localStorage.getItem(COACH_STORAGE_KEY) === suggestionId;
             if (!isDismissed) {
                const result = await getAiCoachingSuggestion({ type: 'journaling_gap', data: { days: diffDays } });
                if (result) {
                    setSuggestion({ ...result, id: suggestionId });
                    return;
                }
             }
        }
    }

  }, [journals, habits, currentView, suggestion]);

  useEffect(() => {
    // Run check shortly after app loads and is on home screen
    const timer = setTimeout(() => {
        checkPatterns();
    }, 3000); 

    return () => clearTimeout(timer);
  }, [checkPatterns]); 

  const dismissSuggestion = () => {
    if (suggestion) {
        localStorage.setItem(COACH_STORAGE_KEY, suggestion.id);
        setSuggestion(null);
    }
  };

  return { suggestion, dismissSuggestion };
};