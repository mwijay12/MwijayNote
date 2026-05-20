
import React, { useState, useRef } from 'react';
import { ArrowLeftIcon, UploadIcon, SparklesIcon, FilePdfIcon, FileImageIcon, BookOpenIcon, CheckCircleIcon } from './Icons';
import { analyzeDocument } from '../services/geminiService';
import { FileData } from '../types';

interface StudyAssistantScreenProps {
    onBack: () => void;
}

const StudyAssistantScreen: React.FC<StudyAssistantScreenProps> = ({ onBack }) => {
    const [file, setFile] = useState<FileData | null>(null);
    const [mode, setMode] = useState<'explain' | 'quiz' | 'solve'>('explain');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    setFile({
                        name: selectedFile.name,
                        type: selectedFile.type,
                        data: ev.target.result as string
                    });
                    setResult('');
                }
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setIsLoading(true);
        // Real AI Call
        const analysis = await analyzeDocument(file, mode);
        setResult(analysis);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-jet">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                <h2 className="text-xl font-serif ml-4 flex items-center gap-2"><BookOpenIcon className="w-6 h-6 text-accent"/> Study Assistant</h2>
            </header>

            {!file ? (
                <div className="flex-grow flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 rounded-3xl bg-card/10 cursor-pointer hover:bg-card/20 transition-colors" onClick={() => fileInputRef.current?.click()}>
                    <div className="flex flex-col items-center gap-4 text-dun hover:text-accent transition-colors">
                        <UploadIcon className="w-16 h-16"/>
                        <span className="font-semibold text-lg">Upload Notes / Problems</span>
                        <span className="text-xs opacity-70">Supports PDF & Images (AI Powered)</span>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="application/pdf,image/*" className="hidden" />
                </div>
            ) : (
                <div className="flex-grow flex flex-col gap-4 overflow-hidden">
                    <div className="flex items-center justify-between bg-card p-3 rounded-xl">
                        <div className="flex items-center gap-3 overflow-hidden">
                            {file.type.includes('pdf') ? <FilePdfIcon className="w-8 h-8 text-red-400"/> : <FileImageIcon className="w-8 h-8 text-blue-400"/>}
                            <span className="truncate text-sm font-semibold">{file.name}</span>
                        </div>
                        <button onClick={() => setFile(null)} className="text-xs text-dun hover:text-red-400 p-2">Change</button>
                    </div>

                    <div className="flex gap-2 p-1 bg-card rounded-full shrink-0">
                        {(['explain', 'quiz', 'solve'] as const).map(m => (
                            <button 
                                key={m}
                                onClick={() => setMode(m)}
                                className={`flex-1 py-2 text-xs font-bold uppercase rounded-full transition-colors ${mode === m ? 'bg-accent text-cafe' : 'text-dun hover:text-white'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={handleAnalyze} 
                        disabled={isLoading}
                        className="w-full py-3 bg-accent text-cafe font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 shrink-0"
                    >
                        {isLoading ? <div className="w-5 h-5 border-2 border-cafe border-t-transparent rounded-full animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                        {mode === 'explain' ? 'Analyze Document' : mode === 'quiz' ? 'Generate Quiz' : 'Solve Problem'}
                    </button>

                    <div className="flex-grow bg-black/30 rounded-xl p-4 overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="text-dun text-sm text-center py-10 animate-pulse">AI is reading your document...<br/>This may take a few seconds.</div>
                        ) : result ? (
                            <div 
                                className="prose prose-invert prose-sm max-w-none prose-headings:text-accent prose-p:text-isabelline prose-li:text-dun"
                                dangerouslySetInnerHTML={{ __html: result }}
                            />
                        ) : (
                            <div className="text-dun text-sm text-center py-10 opacity-50">Output will appear here.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyAssistantScreen;
