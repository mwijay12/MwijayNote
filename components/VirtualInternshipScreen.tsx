
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftIcon, UserIcon, BriefcaseIcon, SendIcon } from './Icons';
import { startInternshipSession, replyToInternship } from '../services/geminiService';

const VirtualInternshipScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [role, setRole] = useState<'Developer' | 'Analyst' | 'PM' | null>(null);
    const [messages, setMessages] = useState<{ sender: 'Boss' | 'You', text: string, grade?: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [messages]);

    const startRole = async (selectedRole: string) => {
        // @ts-ignore
        setRole(selectedRole);
        setIsLoading(true);
        const intro = await startInternshipSession(selectedRole, 'Intern');
        setMessages([{ sender: 'Boss', text: intro }]);
        setIsLoading(false);
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const newMsg = { sender: 'You' as const, text: input };
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setIsLoading(true);

        const history = [...messages, newMsg].map(m => ({ sender: m.sender, text: m.text }));
        const response = await replyToInternship(history) as any;
        
        setMessages(prev => [...prev, { 
            sender: 'Boss', 
            text: response.reply, 
            grade: response.grade 
        }]);
        setIsLoading(false);
    };

    if (!role) {
        return (
            <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-jet">
                <header className="flex items-center mb-8">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6"/></button>
                    <h2 className="text-xl font-serif ml-4">Select Internship Role</h2>
                </header>
                <div className="grid gap-4">
                    {['Developer', 'Analyst', 'PM'].map(r => (
                        <button key={r} onClick={() => startRole(r)} className="bg-card p-6 rounded-2xl text-left hover:bg-white/10 border border-white/5 transition-colors group">
                            <h3 className="font-bold text-lg text-isabelline group-hover:text-accent">{r}</h3>
                            <p className="text-sm text-dun mt-1">Simulate tasks and get graded feedback.</p>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-jet">
            <header className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                <button onClick={onBack}><ArrowLeftIcon className="w-6 h-6"/></button>
                <div className="flex flex-col items-center">
                    <h2 className="font-bold text-accent">{role} Intern</h2>
                    <span className="text-[10px] text-green-400 uppercase tracking-widest animate-pulse">● Live Simulation</span>
                </div>
                <div className="w-6"></div>
            </header>

            <div className="flex-grow overflow-y-auto space-y-4 pb-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${msg.sender === 'You' ? 'bg-accent text-cafe rounded-tr-none' : 'bg-card border border-white/10 text-isabelline rounded-tl-none'}`}>
                            {msg.sender === 'Boss' && <p className="text-[10px] font-bold text-dun uppercase mb-1">Boss</p>}
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            {msg.grade && (
                                <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-xs opacity-70">Task Grade:</span>
                                    <span className={`font-bold ${msg.grade.startsWith('A') ? 'text-green-400' : 'text-red-400'}`}>{msg.grade}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="text-xs text-dun animate-pulse ml-4">Boss is typing...</div>}
                <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
                <input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Type your response or code..."
                    className="flex-grow bg-card border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    disabled={isLoading}
                />
                <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-accent text-cafe p-3 rounded-xl disabled:opacity-50">
                    <SendIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default VirtualInternshipScreen;
