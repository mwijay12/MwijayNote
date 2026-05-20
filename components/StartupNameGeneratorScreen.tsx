import React, { useState } from 'react';
import { ArrowLeftIcon, SparklesIcon, LightbulbIcon } from './Icons';
import { callGemini } from '../services/geminiService';

const StartupNameGeneratorScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [keywords, setKeywords] = useState('');
    const [names, setNames] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const generate = async () => {
        if (!keywords.trim()) return;
        setIsLoading(true);
        
        try {
            const prompt = `Generate 5 catchy, modern startup names for a business about: "${keywords}". Return ONLY the names separated by commas. Check availability for .co.tz implicitly by suggesting unique names.`;
            const text = await callGemini(prompt, 'gemini-3-flash-preview');
            if (text) {
                setNames(text.split(',').map(s => s.trim()));
            }
        } catch (e) {
            console.error(e);
            alert("Failed to generate names. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-jet p-4 pt-16 animate-fade-in">
            <header className="flex items-center mb-8">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                <h2 className="text-xl font-serif ml-4 flex items-center gap-2"><LightbulbIcon className="w-5 h-5 text-purple-400"/> Name Gen</h2>
            </header>

            <div className="bg-card p-6 rounded-3xl border border-white/10 mb-6">
                <label className="text-xs font-bold text-dun uppercase mb-2 block">Keywords</label>
                <input 
                    value={keywords} 
                    onChange={e => setKeywords(e.target.value)}
                    placeholder="e.g. Fintech, Coffee, AI, Arusha"
                    className="w-full bg-jet p-4 rounded-xl text-isabelline focus:outline-none focus:ring-2 focus:ring-purple-400 mb-4"
                />
                <button 
                    onClick={generate} 
                    disabled={isLoading}
                    className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl flex justify-center gap-2 hover:bg-purple-500 disabled:opacity-50"
                >
                    {isLoading ? 'Thinking...' : <><SparklesIcon className="w-5 h-5"/> Generate Names</>}
                </button>
            </div>

            <div className="flex-grow space-y-3 overflow-y-auto pb-4">
                {names.map((name, i) => (
                    <div key={i} className="bg-card/50 p-4 rounded-xl border border-white/5 flex justify-between items-center animate-slide-in-from-bottom" style={{animationDelay: `${i*100}ms`}}>
                        <span className="font-bold text-lg text-isabelline">{name}</span>
                        <span className="text-xs text-green-400 border border-green-500/30 px-2 py-1 rounded bg-green-500/10">Available?</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StartupNameGeneratorScreen;
