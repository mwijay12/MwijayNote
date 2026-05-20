
import React, { useState, useMemo } from 'react';
import { JournalEntry, AppView, JournalType, JournalTopic } from '../types';
import { ArrowLeftIcon, SearchIcon, FilterIcon, PlusIcon, CalendarIcon, GridIcon, ListIcon, ChevronRightIcon, BookIcon, DownloadIcon } from './Icons';
import { patterns } from '../data/patterns';
import { exportAllNotesToPdf } from '../utils/exportUtils';

interface JournalsListScreenProps {
    journals: JournalEntry[];
    onBack: () => void;
    onPreviewJournal: (journal: JournalEntry) => void;
    onCreateNew: (type: JournalType, topic: JournalTopic) => void;
}

const JournalsListScreen: React.FC<JournalsListScreenProps> = ({ journals, onBack, onPreviewJournal, onCreateNew }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedType, setSelectedType] = useState<string | 'all'>('all');

    const filteredJournals = useMemo(() => {
        return journals.filter(j => {
            const matchesSearch = j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                j.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = selectedType === 'all' 
                ? true 
                : selectedType === 'drafts' 
                    ? j.isDraft === true 
                    : j.type === selectedType;
            return matchesSearch && matchesType;
        }).sort((a, b) => {
            // Pinned first, then by date descending
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    }, [journals, searchQuery, selectedType]);

    const journalTypes = useMemo(() => {
        const types = new Set(journals.map(j => j.type));
        return Array.from(types);
    }, [journals]);

    return (
        <div className="flex flex-col h-full bg-jet animate-fade-in overflow-hidden">
            <header className="p-4 pt-12 border-b border-white/10 bg-jet/80 backdrop-blur-xl sticky top-0 z-10">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
                        <ArrowLeftIcon className="w-6 h-6 text-isabelline" />
                    </button>

                    <h2 className="text-xl font-brand font-bold text-isabelline">My Reflections</h2>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => exportAllNotesToPdf(journals)}
                            className="p-2 rounded-full bg-white/5 border border-white/10 text-isabelline hover:text-accent transition-colors"
                            title="Export All to PDF"
                        >
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => onCreateNew('Gratitude Journal', JournalTopic.GRATITUDE)}
                            className="p-2 rounded-full bg-accent text-jet shadow-lg hover:scale-110 transition-transform"
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 items-center">
                    <div className="relative flex-grow">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dun" />
                        <input 
                            type="text" 
                            placeholder="Search entries..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-isabelline focus:outline-none focus:border-accent transition-colors"
                        />
                    </div>
                    <button 
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-dun"
                    >
                        {viewMode === 'grid' ? <ListIcon className="w-5 h-5" /> : <GridIcon className="w-5 h-5" />}
                    </button>
                </div>

                <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
                    <button 
                        onClick={() => setSelectedType('all')}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedType === 'all' ? 'bg-accent text-jet' : 'bg-white/5 text-dun border border-white/10'}`}
                    >
                        All
                    </button>
                    {journals.some(j => j.isDraft) && (
                        <button 
                            onClick={() => setSelectedType('drafts')}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedType === 'drafts' ? 'bg-amber-500 text-black' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}
                        >
                            ✏️ Drafts ({journals.filter(j => j.isDraft).length})
                        </button>
                    )}
                    {journalTypes.map(type => (
                        <button 
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedType === type ? 'bg-accent text-jet' : 'bg-white/5 text-dun border border-white/10'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex-grow overflow-y-auto p-4 pb-32 no-scrollbar">
                {filteredJournals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center opacity-50">
                        <BookIcon className="w-12 h-12 mb-4 text-dun" />
                        <p className="text-sm font-medium text-dun">No entries found.</p>
                        <p className="text-xs text-dun/60 mt-1">Start writing to capture your journey.</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 gap-4">
                        {filteredJournals.map(j => (
                        <button 
                            key={j.id}
                            onClick={() => onPreviewJournal(j)}
                            className="bg-card rounded-3xl border border-white/5 overflow-hidden flex flex-col hover:border-accent/30 transition-all group"
                        >
                            <div className={`h-24 w-full ${patterns[j.patternIndex || 0]} relative`}>
                                {j.coverImage && <img src={j.coverImage} className="w-full h-full object-cover" />}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-2 left-3 right-3">
                                    <p className="text-[10px] font-black text-white/80 uppercase tracking-widest truncate">{j.type}</p>
                                </div>
                                {j.isDraft && (
                                    <div className="absolute top-2 right-2 bg-amber-500/90 text-black text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                        Draft
                                    </div>
                                )}
                                {j.isPinned && (
                                    <div className="absolute top-2 left-2 text-amber-400 text-xs">📌</div>
                                )}
                            </div>
                            <div className="p-4 flex-grow flex flex-col">
                                <h4 className="font-bold text-isabelline text-sm line-clamp-2 mb-2">{j.title}</h4>
                                <div className="mt-auto flex items-center justify-between">
                                    <span className="text-[10px] text-dun font-medium">{new Date(j.date).toLocaleDateString()}</span>
                                    <ChevronRightIcon className="w-4 h-4 text-dun group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </button>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredJournals.map(j => (
                            <button 
                                key={j.id}
                                onClick={() => onPreviewJournal(j)}
                                className="w-full bg-card p-4 rounded-2xl border border-white/5 flex items-center gap-4 hover:border-accent/30 transition-all group"
                            >
                                <div className={`w-12 h-12 rounded-xl shrink-0 ${patterns[j.patternIndex || 0]} overflow-hidden relative`}>
                                    {j.coverImage && <img src={j.coverImage} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-isabelline text-sm truncate">{j.title}</h4>
                                        {j.isPinned && <span className="text-xs">📌</span>}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className="text-[10px] text-accent font-black uppercase tracking-widest">{j.type}</span>
                                        <span className="text-[10px] text-dun">•</span>
                                        <span className="text-[10px] text-dun">{new Date(j.date).toLocaleDateString()}</span>
                                        {j.isDraft && <span className="text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Draft</span>}
                                    </div>
                                </div>
                                <ChevronRightIcon className="w-5 h-5 text-dun group-hover:translate-x-1 transition-transform" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JournalsListScreen;
