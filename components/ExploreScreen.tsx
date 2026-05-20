
import React, { useState, useEffect, useRef } from 'react';
import { AppView, JournalEntry, TargetLanguage } from '../types';
import { 
    CalendarIcon, CodeIcon, BookOpenIcon, CompassIcon, 
    TerminalIcon, ShapesIcon, GraduationCapIcon, PieChartIcon, 
    TargetIcon, CalculatorIcon, LightbulbIcon, GlobeIcon, 
    DollarSignIcon, BriefcaseIcon, BrainCircuitIcon, 
    MicIcon, TimerIcon, WifiIcon, RepeatIcon, 
    SparklesIcon, LayoutIcon, FileTextIcon, 
    ActivityIcon, BarChartIcon, CpuIcon, EyeIcon,
    NewspaperIcon, RadioIcon
} from './Icons';
import LanguageWidget from './LanguageWidget';
import GitHubStreak from './GitHubStreak';
import DailyWisdomWidget from './DailyWisdomWidget'; 

interface ExploreScreenProps {
  onNavigate: (view: AppView) => void;
  journals: JournalEntry[];
  onSaveToFlashcard: (front: string, back: string) => void;
  targetLanguage: TargetLanguage;
  setTargetLanguage: (lang: TargetLanguage) => void;
}

// Reusable Tool Card Component
const ToolCard: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    desc: string; 
    onClick: () => void; 
    colorClass: string; 
    isWide?: boolean;
}> = ({ icon, label, desc, onClick, colorClass, isWide }) => (
    <button 
        onClick={onClick} 
        className={`group relative bg-card hover:bg-white/5 p-4 rounded-2xl text-left transition-all border border-white/5 hover:border-white/10 flex flex-col h-full backdrop-blur-md ${isWide ? 'col-span-2' : ''}`}
    >
        <div className={`w-10 h-10 rounded-xl bg-bg-primary/50 flex items-center justify-center mb-3 ${colorClass} group-hover:scale-110 transition-transform shadow-inner`}>
            {icon}
        </div>
        <h4 className="font-bold text-isabelline text-sm">{label}</h4>
        <p className="text-[10px] text-dun mt-1 leading-tight opacity-80">{desc}</p>
    </button>
);

const SectionHeader: React.FC<{ title: string, icon?: React.ReactNode }> = ({ title, icon }) => (
    <div className="flex items-center gap-2 mb-3 mt-6 px-1">
        {icon}
        <h3 className="text-xs font-bold text-dun uppercase tracking-widest">{title}</h3>
    </div>
);

const ExploreScreen: React.FC<ExploreScreenProps> = ({ onNavigate, journals, onSaveToFlashcard, targetLanguage, setTargetLanguage }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollRef.current) {
                setIsScrolled(scrollRef.current.scrollTop > 30);
            }
        };
        const div = scrollRef.current;
        if (div) div.addEventListener('scroll', handleScroll);
        return () => div?.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="flex flex-col h-full relative bg-transparent">
            <header 
                className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-in-out px-4 flex items-end border-b md:hidden ${isScrolled ? 'h-24 pb-3 bg-bg-primary border-white/10 shadow-xl' : 'h-36 pb-2 border-transparent bg-gradient-to-b from-bg-primary/50 to-transparent'} pt-[env(safe-area-inset-top)]`}
            >
                <div className="w-full relative h-full flex flex-col justify-end">
                    <div className={`absolute left-0 bottom-2 flex items-center gap-3 transition-all duration-500 ease-in-out origin-left ${isScrolled ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                        <div className="p-2 bg-accent/10 rounded-xl">
                            <CompassIcon className="w-8 h-8 text-accent" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-brand font-bold text-isabelline">Tools & Apps</h1>
                            <p className="text-xs text-dun">Your productivity arsenal.</p>
                        </div>
                    </div>
                    
                    <div className={`absolute left-0 right-0 bottom-3 text-center transition-all duration-500 ease-in-out ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                        <span className="text-sm font-bold text-accent uppercase tracking-widest font-brand">All Tools</span>
                    </div>
                </div>
            </header>

            <div ref={scrollRef} className="flex-grow overflow-y-auto pb-24 space-y-2 no-scrollbar p-4 pt-[calc(env(safe-area-inset-top)+9rem)] md:pt-12">
                
                {/* WIDGETS SECTION */}
                <DailyWisdomWidget />
                <LanguageWidget language={targetLanguage} onLanguageChange={setTargetLanguage} onSaveToDeck={onSaveToFlashcard} />
                <div className="mt-4">
                    <GitHubStreak dates={journals.map(j => j.date)} />
                </div>
                
                {/* MEDIA & UPDATES */}
                <SectionHeader title="Media & Updates" icon={<WifiIcon className="w-4 h-4 text-rose-400"/>} />
                <div className="grid grid-cols-2 gap-3">
                    <ToolCard 
                        label="Live Radio" 
                        desc="Global stations & Lofi." 
                        icon={<RadioIcon className="w-5 h-5"/>} 
                        onClick={() => onNavigate(AppView.RADIO)} 
                        colorClass="text-rose-400 bg-rose-500/10"
                        isWide
                    />
                    <ToolCard 
                        label="News Hub" 
                        desc="Tech & Business radar." 
                        icon={<NewspaperIcon className="w-5 h-5"/>} 
                        onClick={() => onNavigate(AppView.NEWS)} 
                        colorClass="text-blue-400 bg-blue-500/10"
                        isWide
                    />
                </div>

                {/* CAREER & BUSINESS */}
                <SectionHeader title="Business & Startups" icon={<BriefcaseIcon className="w-4 h-4 text-purple-400"/>} />
                <div className="grid grid-cols-2 gap-3">
                    <ToolCard 
                        label="Startup Lab" 
                        desc="Model, Pitch, SWOT & Validator." 
                        icon={<RocketIcon />} 
                        onClick={() => onNavigate(AppView.STARTUP_LAB)} 
                        colorClass="text-purple-400 bg-purple-500/10"
                        isWide
                    />
                    <ToolCard 
                        label="Career Prep" 
                        desc="Mock Interview & Pitch." 
                        icon={<MicIcon className="w-5 h-5"/>} 
                        onClick={() => onNavigate(AppView.CAREER_PREP)} 
                        colorClass="text-pink-400 bg-pink-500/10"
                    />
                    <ToolCard 
                        label="Biz Ideas" 
                        desc="Local opportunities." 
                        icon={<LightbulbIcon className="w-5 h-5"/>} 
                        onClick={() => onNavigate(AppView.BUSINESS_IDEAS)} 
                        colorClass="text-yellow-400 bg-yellow-500/10"
                    />
                </div>

                {/* ACADEMIC & LEARNING */}
                <SectionHeader title="Academic & Skills" icon={<GraduationCapIcon className="w-4 h-4 text-green-400"/>} />
                <div className="grid grid-cols-2 gap-3">
                    <ToolCard 
                        label="Academic Hub" 
                        desc="Syllabus, Grades & Timetable." 
                        icon={<GraduationCapIcon className="w-5 h-5"/>} 
                        onClick={() => onNavigate(AppView.ACADEMIC_HUB)} 
                        colorClass="text-green-400 bg-green-500/10"
                        isWide
                    />
                    <ToolCard 
                        label="Flashcards" 
                        desc="Spaced Repetition Study." 
                        icon={<BookOpenIcon className="w-5 h-5"/>} 
                        onClick={() => onNavigate(AppView.FLASHCARDS_LIST)} 
                        colorClass="text-teal-400 bg-teal-500/10"
                    />
                    <ToolCard 
                        label="Skill Tree" 
                        desc="Gamified Learning Paths." 
                        icon={<BrainCircuitIcon className="w-5 h-5"/>} 
                        onClick={() => onNavigate(AppView.SKILL_TREE)} 
                        colorClass="text-emerald-400 bg-emerald-500/10"
                    />
                </div>

                {/* ENGINEERING & IT */}
                <SectionHeader title="Engineering & Code" icon={<CodeIcon className="w-4 h-4 text-blue-400"/>} />
                <div className="grid grid-cols-2 gap-3">
                    <ToolCard 
                        label="Koding Street" 
                        desc="Snippets & Algorithms." 
                        icon={<CodeIcon className="w-5 h-5"/>} 
                        onClick={() => onNavigate(AppView.KODING_STREET)} 
                        colorClass="text-blue-400 bg-blue-500/10"
                    />
                    <ToolCard 
                        label="Terminal" 
                        desc="CLI Environment." 
                        icon={<TerminalIcon className="w-5 h-5"/>} 
                        onClick={() => onNavigate(AppView.TERMINAL)} 
                        colorClass="text-green-500 bg-green-500/10"
                    />
                    <ToolCard 
                        label="System Arch" 
                        desc="Design Diagrams." 
                        icon={<ShapesIcon className="w-5 h-5"/>} 
                        onClick={() => onNavigate(AppView.SYSTEM_ARCHITECTURE)} 
                        colorClass="text-orange-400 bg-orange-500/10"
                    />
                    <ToolCard 
                        label="DB Architect" 
                        desc="ERD Designer." 
                        icon={<LayoutIcon className="w-5 h-5"/>} 
                        onClick={() => onNavigate(AppView.ERD_DESIGNER)} 
                        colorClass="text-indigo-400 bg-indigo-500/10"
                    />
                    <ToolCard 
                        label="Network Util" 
                        desc="IP & Subnet Calc." 
                        icon={<WifiIcon className="w-5 h-5"/>} 
                        onClick={() => onNavigate(AppView.NETWORK_UTILITY)} 
                        colorClass="text-cyan-400 bg-cyan-500/10"
                    />
                    <ToolCard 
                        label="Tech Radar" 
                        desc="Local Events." 
                        icon={<GlobeIcon className="w-5 h-5"/>} 
                        onClick={() => onNavigate(AppView.TECH_RADAR)} 
                        colorClass="text-red-400 bg-red-500/10"
                    />
                </div>

                {/* LIFESTYLE & UTILS */}
                <SectionHeader title="Focus & Tools" icon={<ActivityIcon className="w-4 h-4 text-accent"/>} />
                <div className="grid grid-cols-2 gap-3">
                    <ToolCard 
                        label="Pomodoro" 
                        desc="Focus Timer." 
                        icon={<TimerIcon className="w-5 h-5"/>} 
                        onClick={() => onNavigate(AppView.POMODORO)} 
                        colorClass="text-red-400 bg-red-500/10"
                    />
                    <ToolCard 
                        label="File Manager" 
                        desc="Vault & Doc exports." 
                        icon={<FileTextIcon className="w-5 h-5"/>} 
                        onClick={() => onNavigate(AppView.FILE_MANAGER)} 
                        colorClass="text-emerald-400 bg-emerald-500/10"
                    />
                    <ToolCard 
                        label="Connect Hub" 
                        desc="Quick Actions." 
                        icon={<WifiIcon className="w-5 h-5"/>} 
                        onClick={() => onNavigate(AppView.INTERLINK)} 
                        colorClass="text-accent bg-accent/10"
                        isWide
                    />
                </div>
            </div>
        </div>
    );
};

const RocketIcon: React.FC<{className?:string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
);

export default ExploreScreen;
