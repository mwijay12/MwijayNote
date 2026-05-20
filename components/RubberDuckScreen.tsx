
import React, { useState } from 'react';
import { ArrowLeftIcon, CodeIcon, TrashIcon } from './Icons';
import { getAiChatResponseStream } from '../services/geminiService';

interface RubberDuckScreenProps {
    onBack: () => void;
}

const RubberDuckScreen: React.FC<RubberDuckScreenProps> = ({ onBack }) => {
    const [messages, setMessages] = useState<{sender: 'user'|'duck', text: string}[]>([
        {sender: 'duck', text: "Quack! I'm your Rubber Duck. Explain your code problem to me simply, line by line. I'm listening."}
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = { sender: 'user' as const, text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        let fullResponse = "";
        try {
            const stream = await getAiChatResponseStream(
                `[SYSTEM: You are a Rubber Duck debugger. The user is a Computer Engineering student explaining code. 
                Do NOT give the answer immediately. Ask clarifying questions. 
                Force them to explain their logic. 
                Be supportive but act dumb to make them realize their mistake. 
                Use duck puns occasionally.]
                
                User says: ${input}`, 
                [], [], { personality: 'Witty' }
            );

            const duckMsg = { sender: 'duck' as const, text: '' };
            setMessages(prev => [...prev, duckMsg]);

            for await (const chunk of stream) {
                fullResponse += chunk.text;
                setMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1].text = fullResponse;
                    return newArr;
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-gray-900 font-mono text-green-400">
            <header className="flex items-center mb-6 border-b border-green-500/30 pb-4">
                <button onClick={onBack} className="p-2 hover:bg-green-500/10 rounded-full -ml-2">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl ml-4 flex items-center gap-2">
                    <span className="text-2xl">🦆</span> Rubber Duck Debug
                </h2>
            </header>

            <div className="flex-grow overflow-y-auto space-y-4 pb-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-green-500/20 border border-green-500/50' : 'bg-gray-800 border border-gray-700'}`}>
                            <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && <div className="text-xs text-green-500/50 animate-pulse">Duck is thinking...</div>}
            </div>

            <div className="flex gap-2 mt-2">
                <textarea 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    className="flex-grow bg-black border border-green-500/50 rounded p-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 resize-none h-12"
                    placeholder="Explain the bug..."
                />
                <button onClick={handleSend} disabled={isLoading} className="bg-green-600 text-black font-bold px-4 rounded hover:bg-green-500 disabled:opacity-50">
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default RubberDuckScreen;
