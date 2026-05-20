
import React, { useState, useRef } from 'react';
import { ArrowLeftIcon, SparklesIcon, FileImageIcon, XIcon, UploadIcon } from './Icons';
import { generateImage, editImage } from '../services/geminiService';
import { FileData } from '../types';

const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`px-6 py-1.5 text-sm font-semibold rounded-full transition-colors ${isActive ? 'bg-accent text-cafe' : 'text-dun hover:bg-bg-primary/50'}`}>
        {label}
    </button>
);

const AiImageStudioScreen: React.FC<{onBack: () => void}> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'generate' | 'edit'>('generate');
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fileToGenerativePart = (file: File): Promise<FileData> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({ name: file.name, type: file.type, data: e.target?.result as string });
            };
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async () => {
        if (!prompt.trim() || isLoading) return;
        if (activeTab === 'edit' && !imageFile) return;

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        let result;
        if (activeTab === 'generate') {
            result = await generateImage(prompt);
        } else {
            const imageForApi = await fileToGenerativePart(imageFile!);
            result = await editImage(imageForApi, prompt);
        }

        if (typeof result === 'string') {
            setGeneratedImage(result);
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-full bg-bg-primary animate-slide-in-from-right">
            <header className="flex items-center p-4 pt-6 bg-bg-primary border-b border-white/10 shrink-0 z-10">
                 <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div className="flex-grow flex justify-center">
                     <div className="p-1 bg-card rounded-full flex gap-1">
                        <TabButton label="Generate" isActive={activeTab === 'generate'} onClick={() => setActiveTab('generate')} />
                        <TabButton label="Edit" isActive={activeTab === 'edit'} onClick={() => setActiveTab('edit')} />
                    </div>
                </div>
                 <div className="w-10"></div>
            </header>
            
            <div className="flex-grow flex flex-col p-4 overflow-y-auto">
                <div className="flex-grow flex items-center justify-center">
                    <div className="w-full max-w-sm aspect-square bg-card rounded-2xl flex items-center justify-center relative overflow-hidden border border-white/5 shadow-xl">
                        {/* ... UI for loading, image display ... */}
                    </div>
                </div>
                
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl mt-4 text-center">
                        <p className="text-red-400 text-xs font-bold">{error}</p>
                    </div>
                )}

                {activeTab === 'edit' && (
                     <div className="mt-4">
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => { if(e.target.files?.[0]) {setImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0]))} }} className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-dun/50 hover:border-accent text-dun hover:text-white transition-colors bg-white/5">
                            <UploadIcon className="w-5 h-5"/>
                            <span className="text-sm font-medium">{imageFile ? `Change: ${imageFile.name}` : 'Upload Reference Image'}</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="p-4 bg-bg-primary border-t border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder={activeTab === 'generate' ? "e.g., A cyberpunk cat in neon rain" : "e.g., Make it look like a Van Gogh painting"}
                        className="w-full bg-card border border-white/10 focus:border-accent focus:ring-1 focus:ring-amber rounded-full py-3 px-5 text-isabelline placeholder-dun/50 transition-all outline-none"
                        disabled={isLoading}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                    <button onClick={handleSubmit} disabled={isLoading || !prompt.trim() || (activeTab === 'edit' && !imageFile)} className="w-12 h-12 rounded-full bg-accent text-cafe hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center shadow-lg">
                        <SparklesIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AiImageStudioScreen;
