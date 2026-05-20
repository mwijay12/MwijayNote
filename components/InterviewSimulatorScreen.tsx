import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, MicIcon, SendIcon, WifiIcon, SparklesIcon } from './Icons';
import { startInternshipSession, continueInterview } from '../services/geminiService';
import { useHaptics } from '../hooks/useHaptics';
import ElevatorPitchScreen from './ElevatorPitchScreen';

interface CareerPrepProps {
    onBack: () => void;
}

interface LocalTemplate {
    role: string;
    level: string;
    description: string;
}

const LOCAL_PRESETS: LocalTemplate[] = [
    { role: "Junior Software Engineer", level: "Entry-Level", description: "Practice frontend/backend tasks at Sahara Ventures." },
    { role: "Data Analyst", level: "Mid-Level", description: "Answer SQL, data metrics, and business reports at Vodacom TZ." },
    { role: "IT Support Specialist", level: "Entry-Level", description: "Troubleshoot networks, client systems, and OS flags at NIDA." }
];

const CareerPrepHub: React.FC<CareerPrepProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'Interview' | 'Pitch'>('Interview');

    return (
        <div className="flex flex-col h-full bg-bg-primary pt-16">
             <div className="px-4 flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6"/></button>
                    <h2 className="text-xl font-serif ml-4">Career Prep</h2>
                </div>
            </div>

            <div className="flex gap-2 px-4 mb-4 shrink-0">
                <button 
                    onClick={() => setActiveTab('Interview')} 
                    className={`flex-1 py-2 rounded-full font-bold text-xs transition-all ${activeTab === 'Interview' ? 'bg-accent text-cafe shadow-md' : 'bg-card text-dun hover:bg-white/5'}`}
                >
                    Mock Interview
                </button>
                <button 
                    onClick={() => setActiveTab('Pitch')} 
                    className={`flex-1 py-2 rounded-full font-bold text-xs transition-all ${activeTab === 'Pitch' ? 'bg-accent text-cafe shadow-md' : 'bg-card text-dun hover:bg-white/5'}`}
                >
                    Elevator Pitch
                </button>
            </div>

            <div className="flex-grow overflow-hidden relative">
                {activeTab === 'Interview' ? <InterviewSimulatorInner /> : <ElevatorPitchScreen onBack={() => setActiveTab('Interview')} />}
            </div>
        </div>
    );
};

const InterviewSimulatorInner: React.FC = () => {
    const [role, setRole] = useState('');
    const [level, setLevel] = useState('Entry-Level');
    const [started, setStarted] = useState(false);
    const [messages, setMessages] = useState<{ sender: 'Interviewer' | 'You', text: string, feedback?: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { triggerHaptic } = useHaptics();

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleStart = async () => {
        if (!role.trim()) return;
        setIsLoading(true);
        triggerHaptic('medium');
        try {
            const intro = await startInternshipSession(role, level);
            setStarted(true);
            setMessages([{ sender: 'Interviewer', text: intro }]);
        } catch (e) {
            setStarted(true);
            setMessages([{ sender: 'Interviewer', text: `Welcome to your mock interview for the ${role} position! Tell me about yourself.` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        triggerHaptic('light');
        const newMsg = { sender: 'You' as const, text: input };
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const history = [...messages, newMsg].map(m => ({ sender: m.sender, text: m.text }));
            const response = await continueInterview(history, level);
            
            setMessages(prev => [...prev, { 
                sender: 'Interviewer', 
                text: response.reply, 
                feedback: response.feedback 
            }]);
        } catch (e) {
            // Local fallback logic
            setMessages(prev => [...prev, { 
                sender: 'Interviewer', 
                text: "Thank you for that response. Can you tell me about a major technical challenge you've overcome?",
                feedback: "Good communication. Make sure to clearly state your direct contributions."
            }]);
        } finally {
            setIsLoading(false);
            triggerHaptic('success');
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden p-4">
            {/* CONNECTION STATE ALERTS */}
            <div className={`mb-3 flex items-center gap-2 p-2.5 rounded-xl border text-[10px] font-bold uppercase shrink-0 ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                <WifiIcon className="w-3.5 h-3.5"/>
                <span>{isOnline ? 'Interviewer Online Agent Synced' : '⚡ Offline Simulator Active'}</span>
            </div>

            {!started ? (
                <div className="flex-grow flex flex-col gap-4 overflow-y-auto no-scrollbar pb-16">
                    <div className="bg-card p-5 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5"><SparklesIcon className="w-3.5 h-3.5"/> Setup Mock Interview</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold text-dun uppercase tracking-tighter ml-1 mb-1 block">Target Role</label>
                                <input 
                                    value={role} 
                                    onChange={e => setRole(e.target.value)} 
                                    placeholder="e.g. Junior Developer, IT Officer"
                                    className="w-full bg-jet p-3 rounded-xl border border-white/10 outline-none focus:border-accent text-sm text-isabelline"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-dun uppercase tracking-tighter ml-1 mb-1 block">Experience Level</label>
                                <select 
                                    value={level} 
                                    onChange={e => setLevel(e.target.value)}
                                    className="w-full bg-jet p-3 rounded-xl border border-white/10 outline-none focus:border-accent text-sm text-isabelline"
                                >
                                    <option>Entry-Level</option>
                                    <option>Mid-Level</option>
                                    <option>Senior</option>
                                    <option>Manager</option>
                                </select>
                            </div>
                            <button 
                                onClick={handleStart} 
                                disabled={isLoading || !role.trim()}
                                className="w-full py-3 bg-accent text-cafe font-bold rounded-xl hover:opacity-90 disabled:opacity-50 text-sm mt-2 transition-opacity"
                            >
                                {isLoading ? 'Preparing session...' : 'Start Session'}
                            </button>
                        </div>
                    </div>

                    {/* INTERVIEW TEMPLATES */}
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-dun uppercase tracking-wider px-1">East African Job Presets</h4>
                        <div className="grid grid-cols-1 gap-2">
                            {LOCAL_PRESETS.map((pst, i) => (
                                <button 
                                    key={i}
                                    onClick={() => {
                                        setRole(pst.role);
                                        setLevel(pst.level);
                                    }}
                                    className="bg-card p-3 rounded-xl border border-white/5 hover:border-accent/40 text-left transition-all hover:bg-white/5"
                                >
                                    <div className="flex justify-between items-center">
                                        <h5 className="text-xs font-bold text-accent">{pst.role}</h5>
                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-dun font-bold uppercase">{pst.level}</span>
                                    </div>
                                    <p className="text-[10px] text-dun mt-1">{pst.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-grow flex flex-col overflow-hidden">
                    <div className="flex-grow overflow-y-auto space-y-4 pb-4 custom-scrollbar pr-1">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${msg.sender === 'You' ? 'bg-accent text-cafe rounded-tr-none' : 'bg-card border border-white/10 text-isabelline rounded-tl-none'}`}>
                                    <p className="font-black text-[9px] uppercase mb-1 opacity-70 tracking-widest">{msg.sender}</p>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                    {msg.feedback && (
                                        <div className="mt-2 pt-2 border-t border-black/10 text-[10px] italic opacity-85">
                                            <strong>Review Feedback:</strong> {msg.feedback}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && <div className="text-[10px] text-dun animate-pulse ml-4 italic">Interviewer is formulating reply...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-white/5 shrink-0 bg-bg-primary">
                        <input 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder={isLoading ? "Please wait..." : "Type your professional answer..."}
                            className="flex-grow bg-card border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-accent text-isabelline"
                            disabled={isLoading}
                        />
                        <button 
                            onClick={handleSend} 
                            disabled={isLoading || !input.trim()} 
                            className="bg-accent text-cafe p-3 rounded-xl disabled:opacity-50 hover:opacity-90 transition-opacity"
                        >
                            <SendIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CareerPrepHub;
