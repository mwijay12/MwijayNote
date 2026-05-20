
import React, { useState, useRef } from 'react';
import { ArrowLeftIcon, UploadIcon, MicIcon, SparklesIcon, FilePdfIcon } from './Icons';
import { summarizeLecture, transcribeAudio } from '../services/geminiService';

const LectureSummarizerScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [content, setContent] = useState('');
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            if (file.type.startsWith('audio')) {
                // Audio Logic
                const reader = new FileReader();
                reader.onload = async (ev) => {
                    const data = { name: file.name, type: file.type, data: ev.target?.result as string };
                    const text = await transcribeAudio(data);
                    setContent(text); // Set raw transcript
                    const sum = await summarizeLecture(text);
                    setSummary(sum);
                    setIsLoading(false);
                };
                reader.readAsDataURL(file);
            } else {
                // Text/PDF Logic (Simulated text extraction for now as PDF parsing is complex client-side without heavy libs)
                // In a real app, use pdf.js here. For this demo, we assume the user pastes text or we pretend to read it.
                // We'll simulate extraction for the demo experience.
                setTimeout(async () => {
                    const mockText = "Lecture on Database Normalization... (Extracted Content)";
                    setContent(mockText);
                    const sum = await summarizeLecture(mockText);
                    setSummary(sum);
                    setIsLoading(false);
                }, 1500);
            }
        } catch (e) {
            console.error(e);
            setIsLoading(false);
        }
    };

    const handleSummarizeText = async () => {
        if (!content.trim()) return;
        setIsLoading(true);
        const sum = await summarizeLecture(content);
        setSummary(sum);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-full bg-bg-primary p-4 pt-16 animate-fade-in">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6"/></button>
                <h2 className="text-xl font-serif ml-4">Lecture Summarizer</h2>
            </header>

            <div className="flex-grow flex flex-col gap-4 overflow-hidden">
                {!summary ? (
                    <>
                        <div className="bg-card border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="p-4 bg-accent/10 rounded-full text-accent">
                                <UploadIcon className="w-8 h-8"/>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-isabelline">Upload Recording or PDF</p>
                                <p className="text-xs text-dun mt-1">AI will generate a study sheet</p>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="audio/*,application/pdf,text/plain"/>
                        </div>
                        
                        <div className="text-center text-dun text-xs uppercase font-bold tracking-widest">- OR -</div>

                        <textarea 
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Paste lecture notes here..."
                            className="flex-grow bg-card rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber"
                        />
                        <button onClick={handleSummarizeText} disabled={isLoading || !content.trim()} className="w-full py-3 bg-accent text-cafe font-bold rounded-xl flex justify-center gap-2 hover:opacity-90 disabled:opacity-50">
                            {isLoading ? 'Processing...' : <><SparklesIcon className="w-5 h-5"/> Summarize</>}
                        </button>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col gap-4 overflow-hidden">
                        <div className="bg-card p-6 rounded-2xl border border-white/10 overflow-y-auto custom-scrollbar flex-grow prose prose-invert prose-sm">
                            <div dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br/>') }} />
                        </div>
                        <button onClick={() => setSummary('')} className="py-3 bg-bg-primary rounded-xl text-dun font-bold hover:text-white">Summarize Another</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LectureSummarizerScreen;
