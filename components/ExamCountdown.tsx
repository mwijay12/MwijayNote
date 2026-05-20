
import React from 'react';
import { ClockIcon, XIcon } from './Icons';
import { Exam } from '../types';

interface ExamCountdownProps {
    exams: Exam[];
    onDelete: (id: string) => void;
}

const ExamCountdown: React.FC<ExamCountdownProps> = ({ exams, onDelete }) => {
    
    const getDaysLeft = (dateStr: string) => {
        const diff = new Date(dateStr).getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    };

    const getUrgencyColor = (days: number) => {
        if (days < 0) return 'text-dun';
        if (days <= 3) return 'text-red-500 animate-pulse';
        if (days <= 7) return 'text-yellow-400';
        return 'text-green-400';
    };

    const getUrgencyBg = (days: number) => {
        if (days < 0) return 'bg-gray-500/10 border-gray-500/20';
        if (days <= 3) return 'bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
        if (days <= 7) return 'bg-yellow-500/10 border-yellow-500/30';
        return 'bg-green-500/10 border-green-500/30';
    };

    return (
        <div className="bg-card/50 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-lg">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wide flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" /> Study Countdown
                </h3>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-mono">
                    {exams.length}
                </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {exams.map(exam => {
                    const days = getDaysLeft(exam.date);
                    const urgencyClass = getUrgencyColor(days);
                    const bgClass = getUrgencyBg(days);
                    
                    return (
                        <div key={exam.id} className={`flex justify-between items-center p-3 rounded-xl border transition-all ${bgClass} group`}>
                            <div>
                                <p className="font-bold text-sm text-isabelline">{exam.subject}</p>
                                <p className={`text-xs font-bold uppercase tracking-wide ${urgencyClass}`}>
                                    {days < 0 ? 'Completed' : days === 0 ? 'TODAY!' : `${days} DAYS LEFT`}
                                </p>
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(exam.id);
                                }} 
                                className="opacity-0 group-hover:opacity-100 text-dun hover:text-red-400 transition-opacity p-2"
                                aria-label="Delete Exam"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ExamCountdown;
