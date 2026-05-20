
import React, { useMemo } from 'react';
import { ArrowLeftIcon, HeartIcon, CheckCircleIcon, PlusIcon } from './Icons';
import { JournalEntry, JournalTopic } from '../types';

interface PrayerTimelineProps {
    journals: JournalEntry[];
    onBack: () => void;
    onNewPrayer: () => void;
    onPreview: (journal: JournalEntry) => void;
}

const PrayerTimeline: React.FC<PrayerTimelineProps> = ({ journals, onBack, onNewPrayer, onPreview }) => {
    const prayers = useMemo(() => {
        return journals
            .filter(j => j.topic === JournalTopic.PRAYER)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [journals]);

    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-jet">
            <header className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-serif mx-auto">Prayer Timeline</h2>
                <button onClick={onNewPrayer} className="p-2 rounded-full hover:bg-white/10">
                    <PlusIcon className="w-6 h-6" />
                </button>
            </header>

            <div className="flex-grow overflow-y-auto pb-4 pl-4 relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber/50 to-transparent"></div>

                {prayers.length === 0 ? (
                    <div className="text-center text-dun py-20">
                        <HeartIcon className="w-16 h-16 mx-auto mb-4 text-dun/50"/>
                        <h3 className="font-semibold text-lg text-isabelline">No Prayers Yet</h3>
                        <p>Start a prayer journal to track your spiritual journey.</p>
                    </div>
                ) : (
                    prayers.map((prayer, index) => (
                        <div key={prayer.id} className="mb-8 relative pl-8 animate-slide-in-from-bottom" style={{ animationDelay: `${index * 100}ms` }}>
                            {/* Dot */}
                            <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-accent border-2 border-jet shadow-lg z-10"></div>
                            
                            <button onClick={() => onPreview(prayer)} className="w-full text-left bg-card p-4 rounded-2xl border border-white/5 hover:border-accent/30 transition-colors group">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-isabelline group-hover:text-accent transition-colors">{prayer.title}</h3>
                                    <span className="text-xs text-dun font-mono">{new Date(prayer.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-dun mt-2 line-clamp-2 opacity-80 italic">
                                    {prayer.content.replace(/<[^>]+>/g, '')}
                                </p>
                                {prayer.tags?.includes('Answered') && (
                                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                                        <CheckCircleIcon className="w-3 h-3"/> Answered
                                    </div>
                                )}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PrayerTimeline;
