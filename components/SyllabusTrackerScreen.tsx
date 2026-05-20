
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftIcon, BookOpenIcon, CheckCircleIcon, PlusIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, CalculatorIcon, GridIcon, CalendarIcon, CameraIcon, SparklesIcon, HeartIcon, ActivityIcon, XIcon } from './Icons';
import GradeCalculatorScreen from './GradeCalculatorScreen';
import TimetableScreen from './TimetableScreen';
import { useReminders } from '../hooks/useReminders';
import { analyzeDocument, callGemini } from '../services/geminiService';
import { FileData } from '../types';

const AcademicHub: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'Syllabus' | 'Grades' | 'Timetable' | 'Scanner' | 'Health'>('Syllabus');
    const { reminders, addReminder, deleteReminder } = useReminders();

    return (
        <div className="flex flex-col h-full bg-bg-primary pt-12">
            <header className="px-6 flex items-center mb-6">
                <button onClick={onBack} className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"><ArrowLeftIcon className="w-6 h-6"/></button>
                <div className="ml-4">
                    <h2 className="text-2xl font-brand font-black text-isabelline">Academic Hub</h2>
                    <p className="text-[10px] font-black uppercase text-accent tracking-[0.2em] opacity-80">v4.0 Student Lab</p>
                </div>
            </header>

            <div className="flex gap-3 px-6 mb-6 overflow-x-auto no-scrollbar shrink-0">
                {(['Syllabus', 'Timetable', 'Grades', 'Scanner', 'Health'] as const).map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)} 
                        className={`px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-accent text-cafe shadow-xl scale-105' : 'bg-card text-dun border border-white/5'}`}
                    >
                        {tab === 'Scanner' ? 'AI Scan' : tab}
                    </button>
                ))}
            </div>

            <div className="flex-grow overflow-hidden relative px-4 pb-4">
                <div className="h-full bg-card rounded-[2.5rem] border border-white/5 overflow-hidden relative shadow-2xl flex flex-col">
                    <div className="flex-grow overflow-y-auto no-scrollbar">
                        {activeTab === 'Syllabus' && <SyllabusList />}
                        {activeTab === 'Timetable' && <div className="h-full"><TimetableScreen reminders={reminders} addReminder={addReminder} deleteReminder={deleteReminder} onBack={() => {}} isEmbedded /></div>}
                        {activeTab === 'Scanner' && <AIExtractor />}
                        {activeTab === 'Health' && <WeightGainHub />}
                        {activeTab === 'Grades' && <div className="h-full"><GradeCalculatorScreen onBack={() => {}} isEmbedded /></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AIExtractor: React.FC = () => {
    const [file, setFile] = useState<FileData | null>(null);
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleScan = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const prompt = "Analyze this exam paper. Identify questions, provide logic, and suggest a study roadmap. Use clean HTML.";
            const res = await analyzeDocument(file, 'solve');
            setAnalysis(res);
        } catch (e) { setAnalysis("Scan failed."); }
        finally { setLoading(true); setTimeout(() => setLoading(false), 2000); } // Simulated visual "analysis" time
    };

    return (
        <div className="h-full flex flex-col animate-fade-in">
            <div className="p-8 pb-0">
                <h3 className="text-xl font-brand font-black text-isabelline">Exam Intelligence</h3>
                <p className="text-xs text-dun mt-1">Convert photos of exam papers into study guides.</p>
            </div>
            
            <div className="flex-grow flex flex-col p-8 gap-6">
                <div 
                    className={`relative w-full aspect-[4/3] rounded-[2.5rem] bg-bg-primary/50 border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/5 transition-all overflow-hidden ${loading ? 'scanning-box' : ''}`}
                    onClick={() => fileRef.current?.click()}
                >
                    {file ? (
                        <div className="relative w-full h-full p-4">
                             <img src={file.data} className="w-full h-full object-contain rounded-2xl opacity-60"/>
                             <div className="absolute inset-0 flex items-center justify-center"><p className="text-accent font-black text-xs uppercase tracking-widest">{file.name}</p></div>
                        </div>
                    ) : (
                        <>
                            <CameraIcon className="w-16 h-16 text-accent mb-4 opacity-50"/>
                            <span className="text-xs font-black uppercase tracking-widest text-dun">Upload Paper</span>
                        </>
                    )}
                    <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={(e) => {
                         const f = e.target.files?.[0];
                         if(f) {
                             const reader = new FileReader();
                             reader.onload = (ev) => setFile({ name: f.name, type: f.type, data: ev.target?.result as string });
                             reader.readAsDataURL(f);
                         }
                    }} />
                </div>

                {file && !analysis && (
                    <button onClick={handleScan} disabled={loading} className="w-full py-5 bg-accent text-cafe rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:scale-[0.98] transition-transform">
                        {loading ? 'Decrypting...' : 'Initiate AI Scan'}
                    </button>
                )}

                <div className="flex-grow bg-black/40 rounded-[2rem] p-6 overflow-y-auto custom-scrollbar border border-white/5 prose prose-invert prose-sm max-w-none">
                    {analysis ? <div dangerouslySetInnerHTML={{ __html: analysis }} /> : <p className="text-center text-dun/30 py-10">Analysis will appear here...</p>}
                </div>
            </div>
        </div>
    );
};

const WeightGainHub: React.FC = () => {
    const [tip, setTip] = useState('');
    const [loading, setLoading] = useState(false);

    const generatePlan = async () => {
        setLoading(true);
        try {
            const prompt = "Tanzanian weight gain diet using local foods. HTML format.";
            const res = await callGemini(prompt);
            setTip(res);
        } catch (e) { setTip("Failed to fetch."); }
        finally { setLoading(false); }
    };

    return (
        <div className="h-full flex flex-col p-8 animate-fade-in overflow-y-auto no-scrollbar">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-900/40 p-8 rounded-[2.5rem] border border-green-500/20 mb-8 flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-brand font-black text-white">The Gains Lab</h3>
                    <p className="text-green-300 text-[10px] font-black uppercase tracking-widest mt-1">Weight & Body Mastery 🇹🇿</p>
                </div>
                <ActivityIcon className="w-12 h-12 text-green-400 opacity-40"/>
            </div>

            {!tip ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center">
                    <HeartIcon className="w-20 h-20 text-rose-500/10 mb-6 animate-pulse-slow"/>
                    <h4 className="text-xl font-bold text-isabelline">Need to gain weight, Mzee?</h4>
                    <p className="text-sm text-dun mt-3 mb-10 max-w-xs mx-auto">Get a high-calorie nutrition roadmap based on affordable Tanzanian ingredients.</p>
                    <button onClick={generatePlan} disabled={loading} className="px-10 py-5 bg-green-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-green-500 transition-all flex items-center gap-3">
                         {loading ? 'Calculating...' : 'Get 2026 Plan'}
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-bg-primary/50 rounded-[2rem] p-6 border border-white/5 prose prose-invert prose-sm max-w-none">
                         <div dangerouslySetInnerHTML={{ __html: tip }} />
                    </div>
                    <button onClick={() => setTip('')} className="w-full text-xs font-black uppercase tracking-widest text-dun hover:text-white transition-colors py-4">Restart Nutritionist</button>
                </div>
            )}
        </div>
    );
};

const SyllabusList: React.FC = () => {
    const [modules] = useState(() => {
        const stored = localStorage.getItem('mwijay_syllabus');
        return stored ? JSON.parse(stored) : [];
    });

    return (
        <div className="h-full flex flex-col p-8">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-brand font-black text-isabelline">Active Modules</h3>
                <button className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center"><PlusIcon className="w-5 h-5"/></button>
            </div>
            <div className="space-y-4 overflow-y-auto no-scrollbar">
                {modules.length === 0 ? (
                    <div className="text-center py-20 text-dun opacity-40">No modules tracked yet.</div>
                ) : (
                    modules.map((mod: any) => (
                        <div key={mod.id} className="bg-bg-primary/40 p-5 rounded-[2rem] border border-white/5 flex items-center justify-between">
                            <div>
                                <span className="text-[9px] font-black bg-accent/20 text-accent px-2 py-0.5 rounded tracking-widest uppercase">{mod.code}</span>
                                <h4 className="font-bold text-isabelline mt-1">{mod.name}</h4>
                            </div>
                            <ChevronRightIcon className="w-5 h-5 text-dun opacity-30"/>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AcademicHub;
