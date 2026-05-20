
import React, { useState } from 'react';
import { ArrowLeftIcon, SparklesIcon, TargetIcon } from './Icons';
import { validateStartupIdea } from '../services/geminiService';

interface StartupValidatorScreenProps {
    onBack: () => void;
}

const StartupValidatorScreen: React.FC<StartupValidatorScreenProps> = ({ onBack }) => {
    const [idea, setIdea] = useState('');
    const [result, setResult] = useState<{ strengths: string, weaknesses: string, verdict: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleValidate = async () => {
        if (!idea.trim()) return;
        setIsLoading(true);
        try {
            const analysis = await validateStartupIdea(idea);
            setResult(analysis);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-bg-primary">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                <h2 className="text-xl font-serif ml-4 flex items-center gap-2"><TargetIcon className="w-6 h-6 text-accent"/> Startup Validator</h2>
            </header>

            <div className="flex-grow overflow-y-auto pb-4 space-y-6">
                <div className="bg-card p-6 rounded-3xl border border-white/10 shadow-xl">
                    <label className="block text-sm font-bold text-dun uppercase mb-3">Pitch Your Idea</label>
                    <textarea 
                        value={idea}
                        onChange={e => setIdea(e.target.value)}
                        placeholder="e.g., Uber for dog walking in rural areas..."
                        className="w-full bg-bg-primary p-4 rounded-xl text-isabelline resize-none h-32 focus:ring-2 focus:ring-amber outline-none"
                    />
                    <button 
                        onClick={handleValidate}
                        disabled={isLoading || !idea.trim()}
                        className="w-full mt-4 py-3 bg-accent text-cafe rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                    >
                        {isLoading ? <div className="w-5 h-5 border-2 border-cafe border-t-transparent rounded-full animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                        Validate Idea
                    </button>
                </div>

                {result && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl">
                            <h3 className="font-bold text-green-400 mb-2">Strengths</h3>
                            <p className="text-sm text-isabelline leading-relaxed">{result.strengths}</p>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                            <h3 className="font-bold text-red-400 mb-2">Weaknesses</h3>
                            <p className="text-sm text-isabelline leading-relaxed">{result.weaknesses}</p>
                        </div>
                        <div className="bg-card border border-accent/50 p-6 rounded-2xl text-center">
                            <h3 className="font-serif text-xl text-accent mb-2">Verdict</h3>
                            <p className="text-lg font-bold text-white">{result.verdict}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StartupValidatorScreen;
