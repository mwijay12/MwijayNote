
import React, { useState } from 'react';
import { ArrowLeftIcon, BookMarkedIcon, HeartIcon, SparklesIcon, TagIcon, TrashIcon, PlusIcon, RefreshCwIcon } from './Icons';
import { useQuotes } from '../hooks/useQuotes';
import { QuoteTopic } from '../types';
import { getDailyPrompt } from '../services/geminiService';

interface SavedContentScreenProps {
  likedQuotes: string[];
  onUnlikeQuote: (quote: string) => void;
  onBack: () => void;
}

const AVAILABLE_TOPICS: QuoteTopic[] = [
    'Motivation', 'Stoicism', 'Love', 'Success', 'Discipline', 
    'Happiness', 'Wisdom', 'Mindfulness', 'Creativity', 'Gratitude'
];

const SavedContentScreen: React.FC<SavedContentScreenProps> = ({ likedQuotes, onUnlikeQuote, onBack }) => {
  const { favoriteTopics, toggleTopic, savedPrompts, savePrompt, deletePrompt } = useQuotes();
  const [isGenerating, setIsGenerating] = useState(false);
  const [newPromptInput, setNewPromptInput] = useState('');

  const handleGeneratePrompt = async () => {
      setIsGenerating(true);
      try {
          const prompt = await getDailyPrompt();
          savePrompt(prompt);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGenerating(false);
      }
  };

  const handleAddManualPrompt = () => {
      if (newPromptInput.trim()) {
          savePrompt(newPromptInput.trim());
          setNewPromptInput('');
      }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-bg-primary">
      <header className="flex items-center mb-8">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-serif mx-auto">Saved Content & Topics</h2>
        <div className="w-10"></div>
      </header>

      <div className="flex-grow overflow-y-auto space-y-8 pb-4">
        
        {/* Favorite Topics Section */}
        <div>
            <h3 className="text-dun text-sm font-semibold px-2 mb-3 flex items-center gap-2">
                <TagIcon className="w-4 h-4" />
                Favorite Topics
            </h3>
            <div className="flex flex-wrap gap-2 px-1">
                {AVAILABLE_TOPICS.map(topic => {
                    const isSelected = favoriteTopics.includes(topic);
                    return (
                        <button 
                            key={topic}
                            onClick={() => toggleTopic(topic)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                isSelected 
                                ? 'bg-accent text-cafe shadow-lg scale-105' 
                                : 'bg-card text-isabelline hover:bg-white/10'
                            }`}
                        >
                            {topic}
                        </button>
                    );
                })}
            </div>
            <p className="text-xs text-dun px-2 mt-2">These topics help tailor your AI generated quotes and prompts.</p>
        </div>

        {/* Saved Prompts Section */}
        <div>
            <div className="flex justify-between items-center px-2 mb-3">
                <h3 className="text-dun text-sm font-semibold flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4" />
                    Saved Prompts
                </h3>
                <button 
                    onClick={handleGeneratePrompt} 
                    disabled={isGenerating}
                    className="text-xs text-accent hover:text-white flex items-center gap-1 disabled:opacity-50"
                >
                    <RefreshCwIcon className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`}/> Generate New
                </button>
            </div>
            
            <div className="space-y-3">
                {/* Add New Input */}
                <div className="flex gap-2 px-1 mb-4">
                    <input 
                        type="text" 
                        value={newPromptInput} 
                        onChange={e => setNewPromptInput(e.target.value)}
                        placeholder="Add your own prompt..."
                        className="flex-grow bg-card/50 rounded-xl px-4 py-2 text-sm text-isabelline focus:outline-none focus:ring-1 focus:ring-amber"
                        onKeyDown={e => e.key === 'Enter' && handleAddManualPrompt()}
                    />
                    <button onClick={handleAddManualPrompt} disabled={!newPromptInput.trim()} className="p-2 bg-accent text-cafe rounded-xl hover:opacity-90 disabled:opacity-50">
                        <PlusIcon className="w-5 h-5"/>
                    </button>
                </div>

                {savedPrompts.length > 0 ? (
                    savedPrompts.map(prompt => (
                        <div key={prompt.id} className="bg-card p-4 rounded-2xl flex justify-between items-start gap-4 border border-white/5 group hover:border-accent/20 transition-colors">
                            <div>
                                <p className="text-isabelline font-medium text-sm">{prompt.text}</p>
                                <p className="text-[10px] text-dun mt-1">{new Date(prompt.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => deletePrompt(prompt.id)} className="text-dun hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <TrashIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-dun py-8 bg-card/30 rounded-2xl border border-dashed border-white/10">
                        <p className="text-sm">No saved prompts yet.</p>
                        <button onClick={handleGeneratePrompt} className="text-accent text-xs font-bold mt-2 hover:underline">Generate one with AI</button>
                    </div>
                )}
            </div>
        </div>

        {/* Liked Quotes Section */}
        <div>
            <h3 className="text-dun text-sm font-semibold px-2 mb-2 flex items-center gap-2">
                <HeartIcon className="w-4 h-4" />
                Liked Quotes
            </h3>
            <div className="space-y-3">
                {likedQuotes.length > 0 ? (
                    [...likedQuotes].reverse().map(quote => (
                        <div key={quote} className="bg-card p-4 rounded-2xl flex items-start gap-4 border border-white/5 hover:border-accent/20 transition-colors">
                            <p className="flex-grow text-isabelline italic font-serif">"{quote.split('" - ')[0]}" <span className="not-italic text-dun text-sm block mt-1">- {quote.split('" - ')[1]}</span></p>
                            <button onClick={() => onUnlikeQuote(quote)} className="text-accent shrink-0 p-1">
                                <HeartIcon className="w-5 h-5" fill="currentColor"/>
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-dun py-10 bg-card/30 rounded-2xl">
                        <HeartIcon className="w-12 h-12 mx-auto mb-4 text-dun/50"/>
                        <p>Your liked quotes will appear here.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SavedContentScreen;
