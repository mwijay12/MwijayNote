
import React, { useState, useMemo } from 'react';
import { JournalEntry, JournalType } from '../types';
import { ArrowLeftIcon, SearchIcon, FilterIcon, XIcon, FileImageIcon, FileAudioIcon, FilePdfIcon } from './Icons';

interface SearchScreenProps {
  journals: JournalEntry[];
  onBack: () => void;
  onPreview: (journal: JournalEntry) => void;
}

const journalTypes: JournalType[] = [
    'Gratitude Journal', 'Lucid Dream Log', 'Relationship Check', 'Embrace and Commit',
    'Positive Psychology', 'Morning Intention', 'Evening Reflection', 'Guided Journey'
];

// Utility to safely escape regex characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const HighlightText: React.FC<{ text: string, highlight: string }> = ({ text, highlight }) => {
    if (!highlight.trim()) {
        return <span>{text}</span>;
    }
    const escapedHighlight = escapeRegExp(highlight.trim());
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) => 
                regex.test(part) ? <span key={i} className="bg-accent text-black font-semibold rounded px-0.5 shadow-sm">{part}</span> : part
            )}
        </span>
    );
};

const JournalResultCard: React.FC<{ journal: JournalEntry; onClick: () => void; searchTerm: string }> = ({ journal, onClick, searchTerm }) => {
    const attachmentIcons = useMemo(() => {
        const icons = { image: false, audio: false, pdf: false };
        if (journal.content.includes('<img')) icons.image = true;
        if (journal.content.includes('<audio')) icons.audio = true;
        if (journal.files?.some(f => f.type === 'application/pdf')) icons.pdf = true;
        return icons;
    }, [journal]);

    return (
        <button onClick={onClick} className="w-full text-left bg-card/50 p-4 rounded-lg hover:bg-card transition-colors">
            <div className="flex justify-between items-start">
                <div className="flex-grow min-w-0 pr-2">
                    <p className="text-xs text-dun">{new Date(journal.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <h4 className="font-semibold text-isabelline truncate mt-1">
                        <HighlightText text={journal.title} highlight={searchTerm} />
                    </h4>
                    {searchTerm && (
                        <p className="text-xs text-dun mt-1 truncate opacity-70">
                             <HighlightText text={journal.content.replace(/<[^>]+>/g, '').substring(0, 100)} highlight={searchTerm} />...
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-1.5 text-dun shrink-0">
                    {attachmentIcons.image && <FileImageIcon className="w-4 h-4" />}
                    {attachmentIcons.audio && <FileAudioIcon className="w-4 h-4" />}
                    {attachmentIcons.pdf && <FilePdfIcon className="w-4 h-4" />}
                </div>
            </div>
            {journal.tags && journal.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {journal.tags.map(tag => (
                        <span key={tag} className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                            #<HighlightText text={tag} highlight={searchTerm} />
                        </span>
                    ))}
                </div>
            )}
        </button>
    );
};


const SearchScreen: React.FC<SearchScreenProps> = ({ journals, onBack, onPreview }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    // Filter states
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [journalType, setJournalType] = useState<JournalType | ''>('');
    const [mood, setMood] = useState<number | ''>('');
    const [hasAttachments, setHasAttachments] = useState<boolean | ''>('');

    const resetFilters = () => {
        setDateFrom('');
        setDateTo('');
        setJournalType('');
        setMood('');
        setHasAttachments('');
    };

    const filteredJournals = useMemo(() => {
        return journals.filter(j => {
            const lowerCaseSearch = searchTerm.toLowerCase().trim();
            if (lowerCaseSearch) {
                const titleMatch = j.title.toLowerCase().includes(lowerCaseSearch);
                const contentMatch = j.content.toLowerCase().includes(lowerCaseSearch);
                const tagMatch = j.tags?.some(t => t.toLowerCase().includes(lowerCaseSearch));
                if (!titleMatch && !contentMatch && !tagMatch) return false;
            }
            if (dateFrom) {
                if (new Date(j.date) < new Date(dateFrom)) return false;
            }
            if (dateTo) {
                if (new Date(j.date) > new Date(dateTo)) return false;
            }
            if (journalType && j.type !== journalType) return false;
            if (mood && j.mood !== mood) return false;
            if (hasAttachments === true && (!j.files || j.files.length === 0) && !j.content.match(/<(img|audio)/)) return false;
            if (hasAttachments === false && ((j.files && j.files.length > 0) || j.content.match(/<(img|audio)/))) return false;

            return true;
        });
    }, [journals, searchTerm, dateFrom, dateTo, journalType, mood, hasAttachments]);
    
    const activeFilterCount = [dateFrom, dateTo, journalType, mood, hasAttachments].filter(val => val !== '' && val !== false).length;


    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-jet">
            <header className="flex items-center mb-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div className="relative flex-grow mx-2">
                     <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dun z-10 pointer-events-none" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search all journals..."
                        className="w-full bg-card border border-transparent focus:border-accent focus:ring-0 rounded-full py-2 pl-10 pr-4 text-isabelline placeholder-dun transition-colors"
                        autoFocus
                    />
                </div>
                <button onClick={() => setShowFilters(!showFilters)} className="p-2 rounded-full hover:bg-white/10 relative">
                    <FilterIcon className="w-6 h-6" />
                    {activeFilterCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-cafe text-xs font-bold rounded-full">{activeFilterCount}</span>}
                </button>
            </header>
            
            {showFilters && (
                <div className="bg-card/50 p-4 rounded-lg mb-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-jet text-isabelline border-dun/50 rounded-md p-1.5 text-sm w-full focus:ring-amber focus:border-accent" />
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-jet text-isabelline border-dun/50 rounded-md p-1.5 text-sm w-full focus:ring-amber focus:border-accent" />
                    </div>
                    <select value={journalType} onChange={e => setJournalType(e.target.value as JournalType | '')} className="w-full bg-jet border-dun/50 rounded-md p-2 text-sm focus:ring-amber focus:border-accent">
                        <option value="">Any Journal Type</option>
                        {journalTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                     <div className="grid grid-cols-2 gap-4">
                        <select value={mood} onChange={e => setMood(e.target.value ? parseInt(e.target.value) : '')} className="w-full bg-jet border-dun/50 rounded-md p-2 text-sm focus:ring-amber focus:border-accent">
                            <option value="">Any Mood</option>
                            <option value="1">Very Sad</option>
                            <option value="2">Sad</option>
                            <option value="3">Neutral</option>
                            <option value="4">Happy</option>
                            <option value="5">Very Happy</option>
                        </select>
                        <select value={String(hasAttachments)} onChange={e => setHasAttachments(e.target.value === '' ? '' : e.target.value === 'true')} className="w-full bg-jet border-dun/50 rounded-md p-2 text-sm focus:ring-amber focus:border-accent">
                            <option value="">Attachments</option>
                            <option value="true">Has Attachments</option>
                            <option value="false">No Attachments</option>
                        </select>
                     </div>
                     <button onClick={resetFilters} className="text-xs text-dun hover:text-accent">Reset Filters</button>
                </div>
            )}

            <div className="flex-grow overflow-y-auto space-y-2">
                {searchTerm.trim() === '' && activeFilterCount === 0 ? (
                    <p className="text-center text-dun pt-20">Start typing to search your journals.</p>
                ) : filteredJournals.length > 0 ? (
                    filteredJournals.map(journal => <JournalResultCard key={journal.id} journal={journal} onClick={() => onPreview(journal)} searchTerm={searchTerm} />)
                ) : (
                    <p className="text-center text-dun pt-20">No entries found for your search.</p>
                )}
            </div>
        </div>
    );
};

export default SearchScreen;
