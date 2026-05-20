
import React, { useState } from 'react';
import { ArrowLeftIcon, SparklesIcon, TargetIcon, InfoIcon, XIcon } from './Icons';
import { generateSwotAnalysis } from '../services/geminiService';

interface SwotAnalysisScreenProps {
    onBack: () => void;
}

const SwotAnalysisScreen: React.FC<SwotAnalysisScreenProps> = ({ onBack }) => {
    const [idea, setIdea] = useState('');
    const [swot, setSwot] = useState<{ strengths: string[], weaknesses: string[], opportunities: string[], threats: string[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const handleGenerate = async () => {
        if (!idea.trim()) return;
        setIsLoading(true);
        try {
            const result = await generateSwotAnalysis(idea);
            setSwot(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-bg-primary relative">
            {showInfo && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowInfo(false)}>
                    <div className="bg-card border border-white/10 p-6 rounded-2xl max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-accent font-bold">What is SWOT?</h3>
                            <button onClick={() => setShowInfo(false)}><XIcon className="w-5 h-5"/></button>
                        </div>
                        <p className="text-sm leading-relaxed mb-4 text-isabelline">
                            SWOT stands for <strong>Strengths, Weaknesses, Opportunities, and Threats</strong>.
                        </p>
                        <p className="text-sm leading-relaxed text-dun">
                            It's a strategic planning technique used to help a person or organization identify these four critical elements related to business competition or project planning.
                        </p>
                    </div>
                </div>
            )}

            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                    <h2 className="text-xl font-serif ml-4 flex items-center gap-2"><TargetIcon className="w-6 h-6 text-accent"/> SWOT Analysis</h2>
                </div>
                <button onClick={() => setShowInfo(true)} className="text-dun hover:text-white"><InfoIcon className="w-5 h-5"/></button>
            </header>

            {!swot ? (
                <div className="flex-grow flex flex-col justify-center">
                    <div className="bg-card p-6 rounded-3xl border border-white/10 shadow-xl">
                        <label className="block text-sm font-bold text-dun uppercase mb-3">Business Idea or Project</label>
                        <textarea 
                            value={idea}
                            onChange={e => setIdea(e.target.value)}
                            placeholder="e.g., A mobile app for renting camping gear in Kenya."
                            className="w-full bg-bg-primary p-4 rounded-xl text-isabelline resize-none h-32 focus:ring-2 focus:ring-amber outline-none"
                        />
                        <button 
                            onClick={handleGenerate}
                            disabled={isLoading || !idea.trim()}
                            className="w-full mt-4 py-3 bg-accent text-cafe rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                        >
                            {isLoading ? <div className="w-5 h-5 border-2 border-cafe border-t-transparent rounded-full animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                            Generate Analysis
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-grow overflow-y-auto pb-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SwotCard title="Strengths" items={swot.strengths} color="bg-green-500/20 text-green-400 border-green-500/30" />
                        <SwotCard title="Weaknesses" items={swot.weaknesses} color="bg-red-500/20 text-red-400 border-red-500/30" />
                        <SwotCard title="Opportunities" items={swot.opportunities} color="bg-blue-500/20 text-blue-400 border-blue-500/30" />
                        <SwotCard title="Threats" items={swot.threats} color="bg-orange-500/20 text-orange-400 border-orange-500/30" />
                    </div>
                    <button onClick={() => setSwot(null)} className="w-full py-3 bg-bg-primary rounded-xl text-sm font-bold text-dun hover:text-white">Start Over</button>
                </div>
            )}
        </div>
    );
};

const SwotCard: React.FC<{ title: string, items: string[], color: string }> = ({ title, items, color }) => (
    <div className={`p-4 rounded-2xl border ${color} bg-card/50 backdrop-blur-sm`}>
        <h3 className="font-bold uppercase tracking-widest text-xs mb-3 opacity-80">{title}</h3>
        <ul className="list-disc pl-4 space-y-1 text-sm text-isabelline">
            {items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
    </div>
);

export default SwotAnalysisScreen;
