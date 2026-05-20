import React, { useState } from 'react';
import { ArrowLeftIcon, VideoIcon, LinkedinIcon, MicIcon, NewspaperIcon, SparklesIcon, ShareIcon } from './Icons';
import { generateContentScript } from '../services/geminiService';
import { ContentPlatform } from '../types';
import { markdownToHtml } from '../utils/textUtils';

interface ContentCreatorScreenProps {
    onBack: () => void;
}

const platforms: { id: ContentPlatform; icon: React.ReactNode; color: string }[] = [
    { id: 'LinkedIn', icon: <LinkedinIcon className="w-5 h-5"/>, color: 'text-blue-400' },
    { id: 'TikTok', icon: <VideoIcon className="w-5 h-5"/>, color: 'text-pink-400' },
    { id: 'Podcast', icon: <MicIcon className="w-5 h-5"/>, color: 'text-purple-400' },
    { id: 'Blog', icon: <NewspaperIcon className="w-5 h-5"/>, color: 'text-orange-400' },
];

const ContentCreatorScreen: React.FC<ContentCreatorScreenProps> = ({ onBack }) => {
    const [platform, setPlatform] = useState<ContentPlatform>('LinkedIn');
    const [topic, setTopic] = useState('');
    const [niche, setNiche] = useState('');
    const [tone, setTone] = useState('Professional');
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setIsLoading(true);
        const script = await generateContentScript(topic, platform, tone, niche);
        setOutput(script);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-jet">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-serif ml-4">Content Studio</h2>
            </header>

            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
                {platforms.map(p => (
                    <button 
                        key={p.id}
                        onClick={() => setPlatform(p.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${platform === p.id ? 'bg-card border-accent text-isabelline shadow-md' : 'bg-transparent border-white/10 text-dun hover:bg-white/5'}`}
                    >
                        <span className={p.color}>{p.icon}</span>
                        <span className="text-sm font-semibold">{p.id}</span>
                    </button>
                ))}
            </div>

            <div className="flex-grow flex flex-col gap-4 overflow-y-auto">
                <div className="space-y-3 bg-card/30 p-4 rounded-2xl border border-white/5">
                    <div>
                        <label className="text-xs font-bold text-dun uppercase ml-1 mb-1 block">Target Niche</label>
                        <input 
                            type="text" 
                            value={niche} 
                            onChange={e => setNiche(e.target.value)}
                            placeholder="e.g., Web Development, Finance, Lifestyle"
                            className="w-full bg-jet p-3 rounded-xl text-isabelline focus:outline-none focus:ring-1 focus:ring-amber transition-all text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-dun uppercase ml-1 mb-1 block">Content Topic</label>
                        <input 
                            type="text" 
                            value={topic} 
                            onChange={e => setTopic(e.target.value)}
                            placeholder={`What is your ${platform} post about?`}
                            className="w-full bg-jet p-3 rounded-xl text-isabelline focus:outline-none focus:ring-1 focus:ring-amber transition-all text-sm"
                        />
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-dun uppercase ml-1 mb-2 block">Tone</label>
                        <div className="flex gap-2 flex-wrap">
                            {['Professional', 'Casual', 'Inspirational', 'Educational', 'Witty'].map(t => (
                                <button 
                                    key={t} 
                                    onClick={() => setTone(t)}
                                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${tone === t ? 'bg-accent/20 border-accent text-accent' : 'border-white/10 text-dun hover:text-isabelline'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading || !topic.trim()}
                        className="w-full py-3 bg-accent text-cafe rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
                    >
                        {isLoading ? <div className="w-5 h-5 border-2 border-cafe border-t-transparent rounded-full animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                        {isLoading ? 'Analyzing Trends...' : 'Generate Content'}
                    </button>
                </div>

                {output && (
                    <div className="bg-card p-4 rounded-xl border border-white/5 animate-fade-in flex-grow flex flex-col min-h-[200px]">
                        <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2 flex-wrap gap-2">
                            <h3 className="text-xs font-bold text-accent uppercase flex items-center gap-2"><SparklesIcon className="w-3 h-3"/> AI Draft</h3>
                            <div className="flex gap-1.5 flex-wrap">
                                <button 
                                    onClick={() => { navigator.clipboard.writeText(output); alert('Copied to clipboard!'); }}
                                    className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-dun hover:text-accent flex items-center gap-1 text-[10px] font-semibold transition-all"
                                >
                                    <ShareIcon className="w-3 h-3" /> Copy Text
                                </button>
                                <button 
                                    onClick={() => {
                                        const subject = encodeURIComponent(`Content Draft: ${topic || 'Social Post'}`);
                                        const body = encodeURIComponent(output);
                                        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
                                    }}
                                    className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg flex items-center gap-1 text-[10px] font-semibold transition-all"
                                >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                                    Gmail Draft
                                </button>
                                <button 
                                    onClick={() => {
                                        const payload = JSON.stringify({ text: output }, null, 2);
                                        navigator.clipboard.writeText(payload);
                                        alert('Google Chat Webhook JSON formatted and copied to clipboard!');
                                    }}
                                    className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg flex items-center gap-1 text-[10px] font-semibold transition-all"
                                >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
                                    Google Chat
                                </button>
                            </div>
                        </div>
                        <div 
                            className="w-full text-sm leading-relaxed text-isabelline/90 resize-none focus:outline-none overflow-y-auto prose prose-invert prose-sm custom-scrollbar"
                            dangerouslySetInnerHTML={{ __html: markdownToHtml(output) }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentCreatorScreen;
