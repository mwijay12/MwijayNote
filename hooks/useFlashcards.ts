
import { useState, useEffect, useCallback } from 'react';
import { FlashcardDeck } from '../types';
import { db } from '../utils/db';

export const useFlashcards = () => {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);

  useEffect(() => {
    const load = async () => {
        try {
            const data = await db.getAll('flashcards');
            setDecks(data);
        } catch (error) {
            console.error('Failed to load flashcard decks from DB', error);
        }
    };
    load();
  }, []);

  const addDeck = useCallback(async (deck: Omit<FlashcardDeck, 'id'>) => {
    const newDeck: FlashcardDeck = {
      ...deck,
      id: new Date().getTime().toString(),
    };
    await db.add('flashcards', newDeck);
    setDecks(prev => [...prev, newDeck]);
    return newDeck;
  }, []);

  const updateDeck = useCallback(async (updatedDeck: FlashcardDeck) => {
    await db.put('flashcards', updatedDeck);
    setDecks(prev => prev.map((d) => d.id === updatedDeck.id ? updatedDeck : d));
  }, []);

  const deleteDeck = useCallback(async (id: string) => {
    await db.delete('flashcards', id);
    setDecks(prev => prev.filter(d => d.id !== id));
  }, []);

  return { decks, addDeck, updateDeck, deleteDeck };
};
