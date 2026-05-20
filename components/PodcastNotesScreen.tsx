import React, { useState, useRef } from 'react';
import { ArrowLeftIcon, UploadIcon, VideoIcon, SparklesIcon } from './Icons';
import { transcribePodcast, analyzeYouTubeVideo } from '../services/geminiService';
import { markdownToHtml } from '../utils/textUtils';
import { FileData } from '../types';

const PodcastNotesScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [result, setResult] = useState<{summary: string, keyPoints: string[]} | null>(null);
    const [videoAnalysis, setVideoAnalysis] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setIsLoading(true);
            setResult(null);
            setVideoAnalysis(null);
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const data: FileData = { name: file.name, type: file.type, data: ev.target?.result as string };
                try {
                    const res = await transcribePodcast(data);
                    setResult(res);
                } catch(err) {
                    alert("Analysis failed. Please try a smaller file or check your API Key.");
                } finally {
                    setIsLoading(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleYoutubeAnalyze = async () => {
        if(!youtubeUrl.trim()) return;
        setIsLoading(true);
        setResult(null);
        setVideoAnalysis(null);
        try {
            const analysis = await analyzeYouTubeVideo(youtubeUrl);
            setVideoAnalysis(analysis);
        } catch(err) {
            alert("Analysis failed. Please check the URL or your API Key.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-jet">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                <h2 className="text-xl font-serif ml-4">Content Analyzer</h2>
            </header>
            
            {(!result && !videoAnalysis && !isLoading) && (
                <div className="flex-grow flex flex-col gap-6 p-4">
                     <input type="file" accept="audio/*,video/*" ref={fileInputRef} onChange={handleFile} className="hidden"/>
                    <div className="bg-card p-6 rounded-2xl border border-white/5 text-center hover:border-accent/30 transition-colors cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-16 h-16 bg-jet rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border border-white/10">
                            <UploadIcon className="w-8 h-8 text-dun group-hover:text-accent"/>
                        </div>
                        <h3 className="font-bold text-isabelline">Upload Audio/Video</h3>
                        <p className="text-xs text-dun mt-1">AI extracts summary & key points</p>
                    </div>

                    <div className="bg-card p-6 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 mb-4 justify-center text-red-400">
                            <VideoIcon className="w-5 h-5"/>
                            <h3 className="font-bold text-isabelline">YouTube Analysis</h3>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                value={youtubeUrl}
                                onChange={e => setYoutubeUrl(e.target.value)}
                                placeholder="Paste YouTube Link..."
                                className="flex-grow bg-jet rounded-lg px-3 py-2 text-sm text-isabelline outline-none focus:ring-1 focus:ring-red-500"
                            />
                            <button onClick={handleYoutubeAnalyze} className="bg-red-500 text-white px-4 rounded-lg font-bold text-sm hover:bg-red-600 transition-colors">Go</button>
                        </div>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="flex-grow flex flex-col items-center justify-center gap-4 text-accent animate-pulse">
                    <SparklesIcon className="w-12 h-12"/>
                    <span className="text-sm font-semibold">AI is analyzing content...</span>
                    <span className="text-xs text-dun">This may take a moment for large files</span>
                </div>
            )}

            {(result || videoAnalysis) && (
                <div className="flex-grow overflow-y-auto space-y-4 bg-card p-6 rounded-2xl border border-white/5 shadow-xl animate-fade-in">
                    <h3 className="font-bold text-lg text-accent mb-2 flex items-center gap-2"><SparklesIcon className="w-4 h-4"/> Analysis Result</h3>
                    
                    {result && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-dun uppercase mb-1">Summary</h4>
                                <div className="prose prose-sm prose-invert text-isabelline/90" dangerouslySetInnerHTML={{ __html: result.summary }}/>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-dun uppercase mb-1">Key Points</h4>
                                <ul className="list-disc pl-4 space-y-1 text-sm text-isabelline/90">
                                    {result.keyPoints.map((kp, i) => <li key={i}>{kp}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}

                    {videoAnalysis && (
                        <div className="prose prose-sm prose-invert text-isabelline/90" dangerouslySetInnerHTML={{ __html: videoAnalysis }}/>
                    )}
                    
                    <button onClick={() => { setResult(null); setVideoAnalysis(null); setYoutubeUrl(''); }} className="w-full mt-6 py-3 bg-jet rounded-xl text-sm font-bold hover:bg-white/5 transition-colors text-dun hover:text-white">Analyze Another</button>
                </div>
            )}
        </div>
    );
};
export default PodcastNotesScreen;
