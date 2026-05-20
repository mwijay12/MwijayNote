
import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon, ArrowLeftIcon, CopyIcon, CheckIcon, FeatherIcon, TrashIcon } from './Icons';
import { JournalEntry, Expense, AppView, AiSettings, JournalTopic } from '../types';
import { getAiChatResponseStream } from '../services/geminiService';
import { useJournal } from '../hooks/useJournal';
import { useSettings } from '../hooks/useSettings';
import { processOfflineCommand } from '../utils/offlineAi';
import { db } from '../utils/db';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownRenderer: React.FC<{ content: string, sender: 'user' | 'ai' }> = ({ content, sender }) => {
    return (
        <div className={`markdown-body ${sender === 'ai' ? 'text-isabelline' : 'text-black'}`}>
            <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({node, ...props}) => <h1 className="text-xl font-black text-accent mb-2 mt-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-lg font-black text-accent/80 mb-2 mt-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-md font-black text-accent/60 mb-1 mt-2" {...props} />,
                    p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-black text-accent" {...props} />,
                    em: ({node, ...props}) => <em className="italic text-dun" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="ml-2" {...props} />,
                    code: ({node, ...props}) => <code className="bg-black/30 px-1 rounded font-mono text-xs" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-accent/30 pl-4 italic my-2 opacity-80" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

type Message = {
    id: number;
    sender: 'user' | 'ai';
    text: string;
}

const MessageActions: React.FC<{ text: string }> = ({ text }) => {
    const [saved, setSaved] = useState(false);
    const { addJournal } = useJournal();

    const handleCopy = () => { navigator.clipboard.writeText(text); };
    const handleSave = () => {
        addJournal({
            title: `AI Insight: ${text.substring(0, 30)}...`,
            content: text,
            type: 'Engineering Log',
            topic: JournalTopic.ENGINEERING,
            date: new Date().toISOString(),
            tags: ['AI', 'Saved']
        });
        setSaved(true);
        setTimeout(() => {
            setSaved(false), 2000;
        });
    };

    return (
        <div className="absolute bottom-1 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopy} className="p-1 text-dun hover:text-white" title="Copy"><CopyIcon className="w-3 h-3"/></button>
            <button onClick={handleSave} className={`p-1 transition-colors ${saved ? 'text-green-400' : 'text-dun hover:text-accent'}`} title="Save to Notes">
                {saved ? <CheckIcon className="w-3 h-3"/> : <FeatherIcon className="w-3 h-3"/>}
            </button>
        </div>
    );
};

const InsightsView: React.FC<any> = () => <div className="p-4 text-center text-dun">Insights Loaded</div>;

const ChatView: React.FC<{
    isThinkingMode: boolean; 
    journals: JournalEntry[]; 
    expenses: Expense[];
    aiSettings: AiSettings;
    onAiAction: (action: any) => void;
    onSpeak: (text: string) => void;
    currentView?: AppView;
    onNavigate: (view: AppView) => void;
    onSetTheme: (theme: string) => void;
}> = ({ isThinkingMode, journals, expenses, aiSettings, onAiAction, onSpeak, currentView, onNavigate, onSetTheme }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const { addJournal } = useJournal();
    const { settings } = useSettings();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load history
    useEffect(() => {
        const loadHistory = async () => {
            const savedMsgs = await db.getAll('chat_messages');
            if (savedMsgs.length > 0) {
                setMessages(savedMsgs.sort((a, b) => a.id - b.id));
            } else {
                setMessages([{ id: Date.now(), sender: 'ai', text: "Hello! I'm Mwijay AI. I can control the app and help you navigate. Try asking me to 'Open Radio' or 'Go to Zen Mode'." }]);
            }
        };
        loadHistory();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleClear = async () => {
        if(window.confirm("Clear all chat history?")) {
            await db.clear('chat_messages');
            setMessages([{ id: Date.now(), sender: 'ai', text: "Chat cleared. What's next?" }]);
        }
    };

    const saveMessage = async (msg: Message) => {
        await db.put('chat_messages', msg);
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg: Message = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        await saveMessage(userMsg);
        setInput('');
        setIsLoading(true);

        // Check Offline Command First (Fast local check)
        const offlineResult = processOfflineCommand(userMsg.text);
        
        if (offlineResult) {
            // Give it a small delay for "AI feel"
            setTimeout(async () => {
                const aiMsg: Message = { id: Date.now() + 1, sender: 'ai', text: offlineResult.text };
                setMessages(prev => [...prev, aiMsg]);
                await saveMessage(aiMsg);

                if (offlineResult.action && offlineResult.action.type === 'NAVIGATE') {
                    onNavigate(offlineResult.action.view);
                }
                
                if (aiSettings.readAloud) onSpeak(offlineResult.text);
                setIsLoading(false);
            }, 600);
            return;
        }

        if (!navigator.onLine) {
             const aiMsg: Message = { id: Date.now() + 1, sender: 'ai', text: "I am offline. Please check your internet connection for advanced queries." };
             setMessages(prev => [...prev, aiMsg]);
             setIsLoading(false);
             return;
        }

        try {
            const stream = await getAiChatResponseStream(userMsg.text, journals, expenses, { personality: aiSettings.personality, currentView });
            
            let fullText = "";
            let navigationTriggered = false;
            const aiMsgId = Date.now() + 1;
            
            setMessages(prev => [...prev, { id: aiMsgId, sender: 'ai', text: '' }]);

            for await (const chunk of stream) {
                fullText += chunk.text;
                
                // 1. Navigation: {{NAVIGATE:VIEW_NAME}}
                const navMatch = fullText.match(/{{NAVIGATE:([A-Z_]+)}}/);
                if (navMatch && !navigationTriggered) {
                    onNavigate(navMatch[1] as AppView);
                    navigationTriggered = true;
                }

                // 2. Theme: {{THEME:THEME_ID}}
                const themeMatch = fullText.match(/{{THEME:([a-z-]+)}}/);
                if (themeMatch) {
                    onSetTheme(themeMatch[1]);
                    fullText = fullText.replace(themeMatch[0], '');
                }

                // 3. Create Note: {{CREATE_NOTE:TITLE|CONTENT}}
                const noteMatch = fullText.match(/{{CREATE_NOTE:([^|]+)\|([^}]+)}}/);
                if (noteMatch) {
                    addJournal({
                        title: noteMatch[1],
                        content: noteMatch[2],
                        type: 'Daily Journal',
                        topic: JournalTopic.PERSONAL,
                        date: new Date().toISOString()
                    });
                    fullText = fullText.replace(noteMatch[0], '📝 *Note created!*');
                }

                setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullText.replace(/{{NAVIGATE:[A-Z_]+}}/g, '').replace(/{{THEME:[a-z-]+}}/g, '').replace(/{{CREATE_NOTE:[^}]+}}/g, '') } : m));
            }
            
            const cleanText = fullText.replace(/{{NAVIGATE:[A-Z_]+}}/g, '');
            await saveMessage({ id: aiMsgId, sender: 'ai', text: cleanText });

            if (aiSettings.readAloud && cleanText) {
                onSpeak(cleanText);
            }
        } catch (e) {
            console.error(e);
            const errMsg: Message = { id: Date.now(), sender: 'ai', text: "Connection error. Please check your API key or internet connection." };
            setMessages(prev => [...prev, errMsg]);
            await saveMessage(errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full relative">
            <div className="absolute top-0 right-4 z-10">
                <button onClick={handleClear} className="px-3 py-1 text-[10px] text-dun hover:text-red-400 flex items-center gap-1 bg-jet/80 rounded-b-lg border-b border-x border-white/10 hover:bg-card transition-colors">
                    <TrashIcon className="w-3 h-3"/> Clear History
                </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-4 pt-8 custom-scrollbar">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl relative group ${msg.sender === 'ai' ? 'bg-card text-isabelline rounded-tl-none' : 'bg-accent text-black rounded-tr-none'}`}>
                            <MarkdownRenderer content={msg.text} sender={msg.sender} />
                            {msg.sender === 'ai' && !isLoading && <MessageActions text={msg.text}/>}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-card text-isabelline p-3 rounded-2xl rounded-tl-none">
                            <SparklesIcon className="w-5 h-5 text-accent animate-pulse"/>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-bg-primary border-t border-border-subtle">
                <div className="flex gap-2">
                    <input 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        onKeyDown={e => e.key==='Enter' && handleSend()} 
                        className="flex-grow bg-card p-3 rounded-xl outline-none text-isabelline focus:ring-1 focus:ring-amber border border-border-subtle" 
                        placeholder="Ask Mwijay..." 
                    />
                    <button onClick={handleSend} disabled={isLoading} className="bg-accent p-3 rounded-xl text-black hover:bg-accent/90 transition-colors shadow-lg"><ArrowLeftIcon className="w-5 h-5 rotate-90"/></button>
                </div>
            </div>
        </div>
    );
};

const AiScreen: React.FC<any> = (props) => {
    const [activeTab, setActiveTab] = useState<'chat'|'insights'>('chat');
    return (
        <div className="flex flex-col h-full bg-bg-primary animate-fade-in">
            <header className="flex items-center justify-between p-4 pt-12 border-b border-border-subtle bg-bg-primary">
                <button onClick={() => props.onNavigate(AppView.HOME)}><ArrowLeftIcon className="w-6 h-6 text-dun"/></button>
                <div className="flex bg-black/5 rounded-full p-1 border border-border-subtle">
                    <button onClick={() => setActiveTab('chat')} className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${activeTab==='chat'?'bg-accent text-black shadow-sm':'text-dun hover:text-isabelline'}`}>Chat</button>
                    <button onClick={() => setActiveTab('insights')} className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${activeTab==='insights'?'bg-accent text-black shadow-sm':'text-dun hover:text-isabelline'}`}>Insights</button>
                </div>
                <div className="w-6"></div>
            </header>
            <div className="flex-grow overflow-hidden">
                {activeTab === 'chat' ? <ChatView {...props} /> : <InsightsView {...props} />}
            </div>
        </div>
    );
};

export default AiScreen;
