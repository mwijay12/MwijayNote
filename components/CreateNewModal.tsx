
import React from 'react';
import { DollarSignIcon, BellIcon, FeatherIcon, CardsIcon, MicIcon, WaveformIcon, ClockIcon, GraduationCapIcon } from './Icons';

interface CreateNewModalProps {
  onClose: () => void;
  onSelect: (type: 'expense' | 'reminder' | 'journal' | 'flashcard_deck' | 'voice_journal' | 'ai_live' | 'time_capsule' | 'exam') => void;
}

const options = [
    { type: 'journal', label: 'New Entry', icon: <FeatherIcon className="w-8 h-8 mx-auto" /> },
    { type: 'exam', label: 'Add Exam', icon: <GraduationCapIcon className="w-8 h-8 mx-auto" /> },
    { type: 'time_capsule', label: 'Time Capsule', icon: <ClockIcon className="w-8 h-8 mx-auto" /> },
    { type: 'voice_journal', label: 'Voice Journal', icon: <MicIcon className="w-8 h-8 mx-auto" /> },
    { type: 'ai_live', label: 'Live Chat', icon: <WaveformIcon className="w-8 h-8 mx-auto" /> },
    { type: 'flashcard_deck', label: 'Flashcards', icon: <CardsIcon className="w-8 h-8 mx-auto" /> },
    { type: 'expense', label: 'Transaction', icon: <DollarSignIcon className="w-8 h-8 mx-auto" /> },
    { type: 'reminder', label: 'Reminder', icon: <BellIcon className="w-8 h-8 mx-auto" /> },
] as const;


const CreateNewModal: React.FC<CreateNewModalProps> = ({ onClose, onSelect }) => {
  return (
    <div 
        className="fixed inset-0 bg-bg-primary/70 backdrop-blur-sm z-40 flex items-end justify-center animate-fade-in" 
        onClick={onClose}
    >
      <div 
        className="bg-card w-full max-w-lg pt-4 pb-28 rounded-t-3xl border-t border-border"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-dun/50 rounded-full mx-auto mb-6"></div>
        <div className="snap-scroll-container no-scrollbar flex w-full gap-4 overflow-x-auto px-4">
            {options.map((opt, index) => (
                <OptionButton
                    key={opt.type}
                    icon={opt.icon}
                    label={opt.label}
                    // @ts-ignore
                    onClick={() => onSelect(opt.type)}
                    style={{ animationDelay: `${50 + index * 30}ms`, animationFillMode: 'backwards' }}
                />
            ))}
        </div>
      </div>
    </div>
  );
};

const OptionButton: React.FC<{icon: React.ReactNode, label: string, onClick: () => void, style?: React.CSSProperties}> = ({ icon, label, onClick, style}) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 space-y-2 rounded-2xl bg-bg-primary/50 border border-border-subtle hover:bg-accent/10 transition-colors snap-center flex-shrink-0 w-28 h-28 animate-slide-in-from-bottom" style={style}>
        <div className="text-accent">{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-widest text-isabelline text-center">{label}</span>
    </button>
);

export default CreateNewModal;
