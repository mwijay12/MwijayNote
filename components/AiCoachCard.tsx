import React from 'react';
import { AiCoachingSuggestion } from '../types';
import { SparklesIcon, XIcon } from './Icons';

interface AiCoachCardProps {
  suggestion: AiCoachingSuggestion;
  onAction: () => void;
  onDismiss: () => void;
}

const AiCoachCard: React.FC<AiCoachCardProps> = ({ suggestion, onAction, onDismiss }) => {
  return (
    <div className="bg-card backdrop-blur-lg p-4 rounded-2xl relative border-2 border-accent/50">
      <button onClick={onDismiss} className="absolute top-2 right-2 p-1 text-dun hover:text-white">
        <XIcon className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-bg-primary flex items-center justify-center shrink-0 mt-1">
            <SparklesIcon className="w-5 h-5 text-accent"/>
        </div>
        <div>
            <h3 className="font-semibold text-accent text-sm">A Suggestion from Your Coach</h3>
            <p className="text-isabelline text-sm mt-1">{suggestion.suggestion}</p>
            <button onClick={onAction} className="mt-3 px-4 py-1.5 text-xs font-semibold rounded-full bg-accent text-cafe hover:opacity-90 transition-opacity">
                {suggestion.actionLabel}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AiCoachCard;
