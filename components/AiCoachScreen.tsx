import React, { useState } from 'react';
import { ArrowLeftIcon, BrainCircuitIcon, SparklesIcon, HeartHandshakeIcon, BookOpenIcon } from './Icons';
import { JournalEntry } from '../types';
import { getAiCoachResponse } from '../services/geminiService';

interface AiCoachScreenProps {
  journals: JournalEntry[];
  onBack: () => void;
}

const AiCoachScreen: React.FC<AiCoachScreenProps> = ({ journals, onBack }) => {
  const [activeCoach, setActiveCoach] = useState<'social' | 'books' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<{ title: string; content: string } | null>(null);

  const handleGetAdvice = async (type: 'social' | 'books') => {
    setActiveCoach(type);
    setIsLoading(true);
    setResponse(null);
    const result = await getAiCoachResponse(type, journals);
    setResponse(result);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-jet">
      <header className="flex items-center mb-8">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-serif mx-auto">AI Coach</h2>
        <div className="w-10"></div>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <CoachButton
          label="Social Skills"
          icon={<HeartHandshakeIcon className="w-8 h-8" />}
          onClick={() => handleGetAdvice('social')}
          isActive={activeCoach === 'social'}
        />
        <CoachButton
          label="Book Suggestions"
          icon={<BookOpenIcon className="w-8 h-8" />}
          onClick={() => handleGetAdvice('books')}
          isActive={activeCoach === 'books'}
        />
      </div>

      <div className="flex-grow overflow-y-auto pb-4">
        {isLoading ? (
          <div className="text-center text-dun py-20 flex flex-col items-center">
            <SparklesIcon className="w-12 h-12 text-accent animate-pulse mb-4"/>
            <h3 className="font-semibold text-lg text-isabelline">Your coach is thinking...</h3>
            <p>Analyzing your recent entries for personalized advice.</p>
          </div>
        ) : response ? (
          <div className="bg-card p-6 rounded-2xl animate-fade-in prose prose-p:text-isabelline/90 prose-headings:text-accent prose-strong:text-isabelline">
            <h3 className="font-serif">{response.title}</h3>
            <div dangerouslySetInnerHTML={{ __html: response.content.replace(/\n/g, '<br />') }} />
          </div>
        ) : (
          <div className="text-center text-dun py-20">
            <BrainCircuitIcon className="w-16 h-16 mx-auto mb-4 text-dun/50"/>
            <h3 className="font-semibold text-lg text-isabelline">Your Personal AI Coach</h3>
            <p>Select a topic above to get personalized advice based on your recent journal entries.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CoachButton: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void; isActive: boolean; }> = ({ label, icon, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-all duration-200 border-2 ${isActive ? 'border-accent bg-card' : 'border-transparent bg-card/50 hover:border-dun/50'}`}
  >
    <div className="text-accent">{icon}</div>
    <span className="font-semibold text-sm">{label}</span>
  </button>
);

export default AiCoachScreen;
