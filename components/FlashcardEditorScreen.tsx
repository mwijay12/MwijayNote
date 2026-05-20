import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from './Icons';
import { FlashcardDeck, Flashcard } from '../types';

interface FlashcardEditorScreenProps {
  deck: Partial<FlashcardDeck>;
  onSave: (deck: FlashcardDeck) => void;
  onCancel: () => void;
}

const FlashcardEditorScreen: React.FC<FlashcardEditorScreenProps> = ({ deck, onSave, onCancel }) => {
  const [title, setTitle] = useState(deck.title || '');
  const [cards, setCards] = useState<Flashcard[]>(deck.cards || []);

  const handleSave = () => {
    if (title.trim()) {
      onSave({
        id: deck.id || '', // Will be replaced by hook if new
        title: title.trim(),
        cards: cards,
      });
    }
  };

  const addCard = () => {
    const newCard: Flashcard = {
      id: new Date().getTime().toString(),
      front: '',
      back: '',
    };
    setCards([...cards, newCard]);
  };
  
  const updateCard = (id: string, field: 'front' | 'back', value: string) => {
    setCards(cards.map(card => card.id === id ? { ...card, [field]: value } : card));
  };
  
  const deleteCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id));
  };

  return (
    <div className="flex flex-col h-full animate-slide-in-from-bottom p-4 pt-16 bg-bg-primary">
      <header className="flex justify-between items-center mb-6">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-serif">{deck.id ? 'Edit Deck' : 'New Deck'}</h2>
        <button onClick={handleSave} className="px-5 py-2 text-sm font-semibold rounded-full bg-accent text-cafe hover:opacity-90 transition-opacity">
          Save
        </button>
      </header>

      <div className="flex-grow flex flex-col gap-4 overflow-y-auto pb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Deck Title..."
          className="w-full bg-transparent text-3xl font-serif p-2 focus:outline-none"
        />
        
        <div className="space-y-3">
            {cards.map((card, index) => (
                <div key={card.id} className="bg-card p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-dun">Card {index + 1}</span>
                        <button onClick={() => deleteCard(card.id)} className="text-dun hover:text-red-400">
                            <TrashIcon className="w-4 h-4"/>
                        </button>
                    </div>
                    <textarea 
                        value={card.front}
                        onChange={e => updateCard(card.id, 'front', e.target.value)}
                        placeholder="Front"
                        rows={3}
                        className="w-full bg-bg-primary border-dun/50 focus:border-accent focus:ring-amber rounded-md text-sm placeholder-dun resize-none"
                    />
                    <textarea 
                        value={card.back}
                        onChange={e => updateCard(card.id, 'back', e.target.value)}
                        placeholder="Back"
                        rows={3}
                        className="w-full bg-bg-primary border-dun/50 focus:border-accent focus:ring-amber rounded-md text-sm placeholder-dun resize-none"
                    />
                </div>
            ))}
        </div>
        
        <button 
            onClick={addCard}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-dun/50 hover:border-accent text-dun hover:text-accent transition-colors"
        >
          <PlusIcon className="w-5 h-5"/>
          Add Card
        </button>
      </div>
    </div>
  );
};

export default FlashcardEditorScreen;
