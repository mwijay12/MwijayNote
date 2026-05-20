
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { JournalEntry, JournalType, JournalTopic, AppView, UserData, AiCoachingSuggestion, AiSettings, GreetingStyle, Exam } from '../types';
import { UserIcon, SearchIcon, BookOpenIcon, MoodIcon, SparklesIcon, PinIcon, RefreshCwIcon, FeatherIcon, WindIcon, ChevronRightIcon, QuoteIcon, HeartIcon, LockIcon, ShareIcon, TargetIcon, CodeIcon, MoonStarIcon, BellIcon, CheckSquareIcon, ListIcon, GridIcon, ClockIcon, ZapIcon, ActivityIcon, MusicIcon, NewspaperIcon } from './Icons';
import { getQuoteOfTheDay, textToSpeech } from '../services/geminiService';
import AiCoachCard from './AiCoachCard';
import { decode, decodeAudioData } from '../utils/audioUtils';
import SocialShareModal from './SocialShareModal';
import ExamCountdown from './ExamCountdown';
import MotivationCard from './MotivationCard';
import HomeFactWidget from './HomeFactWidget'; 
import FeatureGrid from './FeatureGrid';
import { useSmartNotifications } from '../hooks/useSmartNotifications';
import { patterns } from '../data/patterns';
import { useReminders } from '../hooks/useReminders';
import { ContentPreferences } from '../hooks/useSettings';

interface HomeScreenProps {
    userData: UserData | null;
    journals: JournalEntry[];
    showWelcome: boolean;
    onWelcomeDismiss: () => void;
    onCreateNew: (type: JournalType, topic: JournalTopic) => void;
    onNavigate: (view: AppView) => void;
    onPreviewJournal: (journal: JournalEntry) => void;
    aiSuggestion: AiCoachingSuggestion | null;
    onDismissAiSuggestion: () => void;
    aiSettings: AiSettings;
    isLoading: boolean;
    updateJournal: (journal: JournalEntry) => void;
    likedQuotes: string[];
    onLikeQuote: (quote: string) => void;
    onUnlikeQuote: (quote: string) => void;
    greetingStyle: GreetingStyle;
    onSaveToFlashcard: (front: string, back: string) => void;
    exams: Exam[];
    onDeleteExam: (id: string) => void;
    contentPreferences?: ContentPreferences;
    isDarkTheme: boolean;
}

const ProfileAvatar: React.FC<{ profilePicture?: string }> = ({ profilePicture }) => {
    if (!profilePicture) return <UserIcon className="w-6 h-6 text-dun" />;
    if (profilePicture.startsWith('data:image')) {
        return <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />;
    }
    return <span className="text-xl">{profilePicture}</span>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ userData, journals, onCreateNew, onNavigate, onPreviewJournal, aiSuggestion, onDismissAiSuggestion, aiSettings, isLoading, likedQuotes, exams, onDeleteExam, contentPreferences, isDarkTheme }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const notifications = useSmartNotifications({ userData, journals, onNavigate, onCreateNew }) || [];

    useEffect(() => {
        const handleScroll = () => {
            if (scrollRef.current) setIsScrolled(scrollRef.current.scrollTop > 30);
        };
        const div = scrollRef.current;
        div?.addEventListener('scroll', handleScroll);
        return () => div?.removeEventListener('scroll', handleScroll);
    }, []);

    const recentJournals = useMemo(() => journals.slice(0, 6), [journals]);

    return (
        <div className="flex flex-col h-full relative">

            <div ref={scrollRef} className="flex-grow p-6 pt-6 md:pt-12 pb-32 overflow-y-auto no-scrollbar space-y-8">
                {/* 1. Immersive Bento Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Routine Card */}
                    <button 
                        onClick={() => onCreateNew('Gratitude Journal', JournalTopic.GRATITUDE)}
                        className="col-span-1 md:col-span-2 bg-gradient-to-br from-amber to-orange-600 rounded-[2.5rem] p-8 text-left shadow-2xl relative overflow-hidden group hover:scale-[0.98] transition-transform"
                    >
                        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative z-10">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white">Daily Focus</span>
                            <h2 className="text-4xl font-black text-white mt-4 mb-2 tracking-tighter leading-none">Ready for your<br/>Reflection?</h2>
                            <p className="text-white/80 text-sm font-medium">Capture your wins and clear your mind.</p>
                            <div className="mt-8 w-12 h-12 bg-white rounded-full flex items-center justify-center text-orange-600 shadow-xl"><FeatherIcon className="w-6 h-6"/></div>
                        </div>
                    </button>

                    {/* AI Coach Card */}
                    <div className="bg-card rounded-[2.5rem] p-6 border border-white/5 flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-accent">
                            <SparklesIcon className="w-5 h-5"/>
                            <span className="text-[10px] font-black uppercase tracking-widest">AI Coach</span>
                        </div>
                        <p className="text-isabelline text-sm leading-relaxed font-medium mt-4">
                            {aiSuggestion?.suggestion || "Maintain your streak! You've journaled 4 days this week. Keep the momentum."}
                        </p>
                        <button onClick={() => onNavigate(AppView.AI)} className="mt-6 text-xs font-bold text-accent hover:underline flex items-center gap-1">Open Chat <ChevronRightIcon className="w-4 h-4"/></button>
                    </div>
                </div>

                {/* 2. Utility Grid - Responsive Hub */}
                <FeatureGrid onNavigate={onNavigate} />
                
                <div className="hidden md:grid grid-cols-6 gap-4">
                    <button onClick={() => onNavigate(AppView.ZEN_MODE)} className="bg-card p-6 rounded-[2rem] hover-lift group">
                        <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4 group-hover:bg-teal-500 group-hover:text-white transition-colors"><WindIcon className="w-6 h-6"/></div>
                        <span className="text-xs font-bold text-isabelline">Zen Mode</span>
                    </button>
                    <button onClick={() => onNavigate(AppView.ACADEMIC_HUB)} className="bg-card p-6 rounded-[2rem] hover-lift group">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors"><GraduationCapIcon className="w-6 h-6"/></div>
                        <span className="text-xs font-bold text-isabelline">Study Lab</span>
                    </button>
                    <button onClick={() => onNavigate(AppView.MUSIC_HUB)} className="bg-card p-6 rounded-[2rem] hover-lift group">
                        <div className="w-12 h-12 rounded-2xl bg-amber/20 text-accent flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-colors"><MusicIcon className="w-6 h-6"/></div>
                        <span className="text-xs font-bold text-isabelline">Music Hub</span>
                    </button>
                    <button onClick={() => onNavigate(AppView.RADIO)} className="bg-card p-6 rounded-[2rem] hover-lift group">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 group-hover:bg-rose-500 group-hover:text-white transition-colors"><RadioIcon className="w-6 h-6"/></div>
                        <span className="text-xs font-bold text-isabelline">Live Radio</span>
                    </button>
                    <button onClick={() => onNavigate(AppView.STARTUP_LAB)} className="bg-card p-6 rounded-[2rem] hover-lift group">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:text-white transition-colors"><ActivityIcon className="w-6 h-6"/></div>
                        <span className="text-xs font-bold text-isabelline">Startup Lab</span>
                    </button>
                    <button onClick={() => onNavigate(AppView.NEWS)} className="bg-card p-6 rounded-[2rem] hover-lift group">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><NewspaperIcon className="w-6 h-6"/></div>
                        <span className="text-xs font-bold text-isabelline">News Hub</span>
                    </button>
                </div>

                {/* 3. Personalized Feed */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-brand font-bold text-isabelline">Recent Reflections</h3>
                        <button onClick={() => onNavigate(AppView.JOURNALS_LIST)} className="text-xs font-bold text-accent hover:underline">View All</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recentJournals.map(j => (
                            <button 
                                key={j.id} 
                                onClick={() => onPreviewJournal(j)}
                                className="w-full text-left bg-card p-5 rounded-[2rem] border border-white/5 hover:border-accent/30 transition-all flex items-center gap-4 group"
                            >
                                <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center ${patterns[j.patternIndex || 0]} shadow-lg group-hover:scale-110 transition-transform overflow-hidden`}>
                                    {j.coverImage && <img src={j.coverImage} className="w-full h-full object-cover"/>}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-isabelline text-sm truncate">{j.title}</h4>
                                    <p className="text-xs text-dun truncate mt-1">{new Date(j.date).toLocaleDateString()}</p>
                                </div>
                                <ChevronRightIcon className="w-5 h-5 text-dun ml-auto group-hover:translate-x-1 transition-transform"/>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Daily Wisdom Widget */}
                <HomeFactWidget preferences={contentPreferences} />
            </div>
        </div>
    );
};
const RadioIcon: React.FC<{className?:string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>
);
const GraduationCapIcon: React.FC<{className?:string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
);

export default HomeScreen;
