
import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, SparklesIcon, PieChartIcon, InfoIcon, XIcon, TargetIcon, LayoutIcon } from './Icons';
import { generateBusinessModel, generatePitchDeck } from '../services/geminiService';
import SwotAnalysisScreen from './SwotAnalysisScreen';
import StartupValidatorScreen from './StartupValidatorScreen';

interface StartupLabProps {
    onBack: () => void;
    initialTab?: 'Canvas' | 'SWOT' | 'Validate' | 'Pitch';
}

const StartupLab: React.FC<StartupLabProps> = ({ onBack, initialTab = 'Canvas' }) => {
    const [activeTab, setActiveTab] = useState<'Canvas' | 'SWOT' | 'Validate' | 'Pitch'>(initialTab);

    // Sync tab if initialTab changes externally
    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    return (
        <div className="flex flex-col h-full bg-jet pt-16">
            <div className="px-4 flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6"/></button>
                    <h2 className="text-xl font-serif ml-4 text-isabelline">Startup Lab</h2>
                </div>
            </div>

            <div className="flex gap-2 px-4 mb-4 overflow-x-auto no-scrollbar">
                <button onClick={() => setActiveTab('Canvas')} className={`flex-1 px-4 py-2 rounded-full font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'Canvas' ? 'bg-accent text-cafe' : 'bg-card text-dun'}`}>Canvas</button>
                <button onClick={() => setActiveTab('SWOT')} className={`flex-1 px-4 py-2 rounded-full font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'SWOT' ? 'bg-accent text-cafe' : 'bg-card text-dun'}`}>SWOT</button>
                <button onClick={() => setActiveTab('Validate')} className={`flex-1 px-4 py-2 rounded-full font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'Validate' ? 'bg-accent text-cafe' : 'bg-card text-dun'}`}>Validator</button>
                <button onClick={() => setActiveTab('Pitch')} className={`flex-1 px-4 py-2 rounded-full font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'Pitch' ? 'bg-accent text-cafe' : 'bg-card text-dun'}`}>Pitch Deck</button>
            </div>

            <div className="flex-grow overflow-hidden">
                {activeTab === 'Canvas' && <BusinessModelInner />}
                {activeTab === 'SWOT' && <SwotAnalysisScreen onBack={() => {}} />}
                {activeTab === 'Validate' && <StartupValidatorScreen onBack={() => {}} />}
                {activeTab === 'Pitch' && <PitchDeckGenerator />}
            </div>
        </div>
    );
};

// Inner BMC Component
const BusinessModelInner: React.FC = () => {
    const [idea, setIdea] = useState('');
    const [canvas, setCanvas] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!idea.trim()) return;
        setIsLoading(true);
        try {
            const result = await generateBusinessModel(idea);
            setCanvas(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-0">
            {!canvas ? (
                <div className="flex-grow flex flex-col justify-center">
                    <div className="bg-card p-6 rounded-3xl border border-white/10 shadow-xl">
                        <label className="block text-sm font-bold text-dun uppercase mb-3">Describe Your Business</label>
                        <textarea 
                            value={idea}
                            onChange={e => setIdea(e.target.value)}
                            placeholder="e.g., A subscription-based coffee delivery service for remote workers."
                            className="w-full bg-jet p-4 rounded-xl text-isabelline resize-none h-32 focus:ring-2 focus:ring-purple-400 outline-none"
                        />
                        <button 
                            onClick={handleGenerate}
                            disabled={isLoading || !idea.trim()}
                            className="w-full mt-4 py-3 bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                        >
                            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                            Generate Model
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-grow overflow-y-auto pb-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <CanvasBlock title="Key Partners" items={canvas.keyPartners} />
                        <CanvasBlock title="Key Activities" items={canvas.keyActivities} />
                        <CanvasBlock title="Value Propositions" items={canvas.valuePropositions} color="border-accent/50 bg-accent/10" />
                        <CanvasBlock title="Customer Relationships" items={canvas.customerRelationships} />
                        <CanvasBlock title="Customer Segments" items={canvas.customerSegments} />
                        <CanvasBlock title="Key Resources" items={canvas.keyResources} />
                        <CanvasBlock title="Channels" items={canvas.channels} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CanvasBlock title="Cost Structure" items={canvas.costStructure} color="border-red-500/30 bg-red-500/10" />
                        <CanvasBlock title="Revenue Streams" items={canvas.revenueStreams} color="border-green-500/30 bg-green-500/10" />
                    </div>
                    <button onClick={() => setCanvas(null)} className="w-full py-3 bg-jet rounded-xl text-sm font-bold text-dun hover:text-white">Start Over</button>
                </div>
            )}
        </div>
    );
};

const PitchDeckGenerator: React.FC = () => {
    const [idea, setIdea] = useState('');
    const [slides, setSlides] = useState<{ title: string, content: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!idea.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await generatePitchDeck(idea);
            if (result && result.length > 0) {
                setSlides(result);
            } else {
                setError("Failed to generate slides. Please try a different description or check your connection.");
            }
        } catch (e) {
            setError("An error occurred while generating the deck.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-0">
            {!slides.length ? (
                <div className="flex-grow flex flex-col justify-center">
                    <div className="bg-card p-6 rounded-3xl border border-white/10">
                        <h3 className="text-lg font-bold text-accent mb-4 flex items-center gap-2"><LayoutIcon className="w-5 h-5"/> Pitch Deck Creator</h3>
                        <label className="text-sm font-bold text-dun uppercase mb-2 block">Business Idea</label>
                        <textarea 
                            value={idea}
                            onChange={e => setIdea(e.target.value)}
                            placeholder="Describe your startup idea in one sentence..."
                            className="w-full bg-jet p-4 rounded-xl text-isabelline h-32 mb-4 resize-none outline-none focus:ring-2 focus:ring-amber"
                        />
                        <button onClick={handleGenerate} disabled={isLoading} className="w-full py-3 bg-accent text-cafe font-bold rounded-xl flex justify-center gap-2">
                            {isLoading ? 'Generating...' : <><SparklesIcon className="w-5 h-5"/> Create Deck</>}
                        </button>
                        {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
                    </div>
                </div>
            ) : (
                <div className="flex-grow flex flex-col gap-4 overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                         <h3 className="text-lg font-bold text-accent">Your Deck</h3>
                         <button onClick={() => setSlides([])} className="text-xs font-bold text-dun hover:text-white bg-jet px-3 py-1 rounded-full">Reset</button>
                    </div>
                    <div className="flex-grow overflow-x-auto snap-x snap-mandatory flex gap-4 pb-4 items-center">
                        {slides.map((slide, i) => (
                            <div key={i} className="snap-center shrink-0 w-full max-w-sm bg-card aspect-[4/5] rounded-3xl p-8 flex flex-col border border-white/10 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-accent text-cafe px-4 py-2 rounded-bl-2xl font-bold text-xs">Slide {i+1}</div>
                                <h3 className="text-2xl font-bold text-accent mb-6 mt-4">{slide.title}</h3>
                                <div className="text-sm text-isabelline leading-relaxed whitespace-pre-wrap">
                                    {slide.content.split('\n').map((line, idx) => (
                                        <p key={idx} className="mb-2">{line.startsWith('-') ? line : `• ${line}`}</p>
                                    ))}
                                </div>
                                <div className="mt-auto text-center text-dun text-xs opacity-50">Mwijay Note AI</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const CanvasBlock: React.FC<{ title: string, items: string[], color?: string }> = ({ title, items, color = "border-white/10 bg-card/50" }) => (
    <div className={`p-4 rounded-xl border ${color} backdrop-blur-sm h-full`}>
        <h3 className="font-bold text-xs text-dun uppercase mb-2">{title}</h3>
        <ul className="text-sm text-isabelline space-y-1 list-disc pl-4">
            {Array.isArray(items) && items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
    </div>
);

export default StartupLab;
