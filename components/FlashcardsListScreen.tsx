
import React, { useState } from 'react';
import { ArrowLeftIcon, CardsIcon, PlusIcon, TrashIcon, BookOpenIcon, SparklesIcon, XIcon } from './Icons';
import { FlashcardDeck, AppView, Flashcard } from '../types';
import { generateStudyFlashcards } from '../services/geminiService';
import { useUser } from '../hooks/useUser';

interface FlashcardsListScreenProps {
  decks: FlashcardDeck[];
  onBack: () => void;
  onNavigate: (view: AppView, deckId?: string) => void;
  onDeleteDeck: (id: string) => void;
  addDeck?: (deck: Omit<FlashcardDeck, 'id'>) => Promise<any>;
}

const FlashcardsListScreen: React.FC<FlashcardsListScreenProps> = ({ decks, onBack, onNavigate, onDeleteDeck, addDeck }) => {
  const [showAiModal, setShowAiModal] = useState(false);
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { userData } = useUser();

  const handleAiGenerate = async () => {
      if (!topic.trim() || !addDeck) return;
      setIsGenerating(true);
      try {
          const cards = await generateStudyFlashcards(topic, context);
          
          if (cards && cards.length > 0) {
              const newDeck = {
                  title: `${topic} (AI Prep)`,
                  cards: cards.map((c: any) => ({
                      id: Date.now().toString() + Math.random().toString(),
                      front: c.front,
                      back: c.back
                  }))
              };
              await addDeck(newDeck);
              setShowAiModal(false);
              setTopic('');
              setContext('');
          }
      } catch (e) {
          alert("Failed to generate cards. Try again.");
      } finally {
          setIsGenerating(false);
      }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-jet">
        {showAiModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAiModal(false)}>
                <div className="bg-card w-full max-w-md p-6 rounded-3xl border border-white/10 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setShowAiModal(false)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"><XIcon className="w-5 h-5"/></button>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-accent/20 rounded-full text-accent"><SparklesIcon className="w-6 h-6"/></div>
                        <h3 className="text-xl font-serif text-isabelline">AI Exam Prep</h3>
                    </div>
                    <p className="text-sm text-dun mb-4">Generate high-probability exam questions based on your notes.</p>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-dun uppercase ml-1">Subject / Topic</label>
                            <input 
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                placeholder="e.g. Cost Accounting, C Pointers"
                                className="w-full bg-jet p-3 rounded-xl border border-white/10 focus:border-accent focus:ring-1 focus:ring-amber outline-none text-isabelline"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-dun uppercase ml-1">Paste Syllabus or Notes</label>
                            <textarea 
                                value={context}
                                onChange={e => setContext(e.target.value)}
                                placeholder="Paste your course outline, lecture notes, or key concepts here. The AI will analyze this to find likely exam questions."
                                className="w-full bg-jet p-3 rounded-xl border border-white/10 focus:border-accent focus:ring-1 focus:ring-amber outline-none text-isabelline resize-none h-32"
                            />
                        </div>
                        <button 
                            onClick={handleAiGenerate}
                            disabled={isGenerating || !topic.trim()}
                            className="w-full py-3 bg-accent text-cafe font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isGenerating ? <div className="w-5 h-5 border-2 border-cafe border-t-transparent rounded-full animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                            {isGenerating ? 'Analyzing Material...' : 'Generate Exam Deck'}
                        </button>
                    </div>
                </div>
            </div>
        )}

      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
            <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-serif ml-4">My Flashcards</h2>
        </div>
        <div className="flex gap-2">
            {addDeck && (
                <button onClick={() => setShowAiModal(true)} className="p-2 rounded-full bg-jet border border-accent/50 text-accent hover:bg-accent/10 shadow-lg" title="AI Generate">
                    <SparklesIcon className="w-6 h-6" />
                </button>
            )}
            <button onClick={() => onNavigate(AppView.FLASHCARD_EDITOR)} className="p-2 rounded-full bg-accent text-cafe hover:opacity-90 shadow-lg">
                <PlusIcon className="w-6 h-6" />
            </button>
        </div>
      </header>

      <div className="flex-grow overflow-y-auto space-y-4 pb-4">
        {decks.length === 0 && (
          <div className="text-center text-dun py-20">
            <CardsIcon className="w-16 h-16 mx-auto mb-4 text-dun/50"/>
            <h3 className="font-semibold text-lg text-isabelline">No Decks Yet</h3>
            <p>Create your first deck to start mastering new topics.</p>
          </div>
        )}
        {decks.map((deck, index) => (
          <div key={deck.id} className="relative group animate-stagger-in" style={{ animationDelay: `${index * 50}ms` }}>
            {/* Card Stack Effect */}
            <div className="absolute top-2 left-2 right-0 bottom-0 bg-white/5 rounded-xl border border-white/5 z-0"></div>
            <div className="absolute top-1 left-1 right-1 bottom-1 bg-white/10 rounded-xl border border-white/10 z-10"></div>
            
            <div className="relative z-20 bg-card p-5 rounded-xl border border-white/10 shadow-xl flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-isabelline">{deck.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold bg-jet px-2 py-1 rounded text-dun border border-white/5">{deck.cards.length} Cards</span>
                        </div>
                    </div>
                    <button onClick={() => onDeleteDeck(deck.id)} className="text-dun hover:text-red-400 p-2 hover:bg-white/5 rounded-full transition-colors">
                        <TrashIcon className="w-4 h-4"/>
                    </button>
                </div>
                
                <div className="flex gap-3 mt-2">
                    <button 
                        onClick={() => onNavigate(AppView.FLASHCARD_STUDY, deck.id)} 
                        disabled={deck.cards.length === 0}
                        className="flex-1 bg-accent text-cafe py-3 rounded-lg font-bold text-sm shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <BookOpenIcon className="w-4 h-4"/> Study Now
                    </button>
                    <button 
                        onClick={() => onNavigate(AppView.FLASHCARD_EDITOR, deck.id)} 
                        className="px-4 py-3 bg-jet border border-white/10 rounded-lg font-bold text-sm text-dun hover:text-isabelline hover:bg-white/5 transition-colors"
                    >
                        Edit
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashcardsListScreen;
