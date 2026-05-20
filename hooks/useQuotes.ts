
import { useState, useEffect, useCallback } from 'react';
import { QuoteTopic } from '../types';

const STORAGE_KEY = 'mwijay_liked_quotes';
const TOPICS_KEY = 'mwijay_favorite_topics';
const PROMPTS_KEY = 'mwijay_saved_prompts';

export interface SavedPrompt {
    id: string;
    text: string;
    createdAt: string;
}

export const useQuotes = () => {
  const [likedQuotes, setLikedQuotes] = useState<string[]>([]);
  const [favoriteTopics, setFavoriteTopics] = useState<QuoteTopic[]>([]);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLikedQuotes(JSON.parse(stored));
      }
      const storedTopics = localStorage.getItem(TOPICS_KEY);
      if (storedTopics) {
          setFavoriteTopics(JSON.parse(storedTopics));
      }
      const storedPrompts = localStorage.getItem(PROMPTS_KEY);
      if (storedPrompts) {
          setSavedPrompts(JSON.parse(storedPrompts));
      }
    } catch (error) {
      console.error('Failed to load quote/prompt data from localStorage', error);
    }
  }, []);

  const _saveToStorage = (updatedQuotes: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQuotes));
    } catch (error) {
      console.error('Failed to save liked quotes to localStorage', error);
    }
  };

  const _saveTopicsToStorage = (updatedTopics: QuoteTopic[]) => {
      try {
          localStorage.setItem(TOPICS_KEY, JSON.stringify(updatedTopics));
      } catch (error) {
          console.error('Failed to save topics to localStorage', error);
      }
  }

  const _savePromptsToStorage = (updatedPrompts: SavedPrompt[]) => {
      try {
          localStorage.setItem(PROMPTS_KEY, JSON.stringify(updatedPrompts));
      } catch (error) {
          console.error('Failed to save prompts to localStorage', error);
      }
  }

  const likeQuote = useCallback((quote: string) => {
    setLikedQuotes(prev => {
      if (prev.includes(quote)) return prev;
      const updated = [...prev, quote];
      _saveToStorage(updated);
      return updated;
    });
  }, []);

  const unlikeQuote = useCallback((quote: string) => {
    setLikedQuotes(prev => {
      const updated = prev.filter(q => q !== quote);
      _saveToStorage(updated);
      return updated;
    });
  }, []);

  const toggleTopic = useCallback((topic: QuoteTopic) => {
      setFavoriteTopics(prev => {
          let updated;
          if (prev.includes(topic)) {
              updated = prev.filter(t => t !== topic);
          } else {
              updated = [...prev, topic];
          }
          _saveTopicsToStorage(updated);
          return updated;
      });
  }, []);

  const savePrompt = useCallback((text: string) => {
      setSavedPrompts(prev => {
          const newPrompt: SavedPrompt = { id: Date.now().toString(), text, createdAt: new Date().toISOString() };
          const updated = [newPrompt, ...prev];
          _savePromptsToStorage(updated);
          return updated;
      });
  }, []);

  const deletePrompt = useCallback((id: string) => {
      setSavedPrompts(prev => {
          const updated = prev.filter(p => p.id !== id);
          _savePromptsToStorage(updated);
          return updated;
      });
  }, []);

  return { likedQuotes, likeQuote, unlikeQuote, favoriteTopics, toggleTopic, savedPrompts, savePrompt, deletePrompt };
};
