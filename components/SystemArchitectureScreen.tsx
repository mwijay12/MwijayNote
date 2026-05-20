
import React, { useState } from 'react';
import { ArrowLeftIcon, ShapesIcon, CodeIcon, ShareIcon } from './Icons';
import { generateSystemDiagram } from '../services/geminiService';

interface SystemArchitectureScreenProps {
    onBack: () => void;
}

const SystemArchitectureScreen: React.FC<SystemArchitectureScreenProps> = ({ onBack }) => {
    const [description, setDescription] = useState('');
    const [mermaidCode, setMermaidCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!description.trim()) return;
        setIsLoading(true);
        try {
            const code = await generateSystemDiagram(description);
            setMermaidCode(code);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(mermaidCode);
        alert("Mermaid code copied!");
    };

    return (
        <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-bg-primary">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-serif ml-4 flex items-center gap-2">
                    <ShapesIcon className="w-6 h-6 text-accent"/> System Architecture
                </h2>
            </header>

            <div className="flex-grow flex flex-col gap-4 overflow-y-auto pb-4">
                <div className="bg-card p-4 rounded-2xl">
                    <label className="text-sm font-bold text-dun uppercase block mb-2">System Description</label>
                    <textarea 
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="e.g., An e-commerce microservices architecture with a React frontend, Node.js API Gateway, User Service, Product Service, and PostgreSQL database."
                        className="w-full bg-bg-primary p-3 rounded-xl text-isabelline text-sm focus:outline-none focus:ring-2 focus:ring-amber resize-none h-32 border border-border-subtle"
                    />
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading || !description.trim()}
                        className="w-full mt-3 bg-accent text-cafe py-2 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50"
                    >
                        {isLoading ? 'Architecting...' : 'Generate Diagram Code'}
                    </button>
                </div>

                {mermaidCode && (
                    <div className="bg-card/40 p-4 rounded-2xl border border-border-subtle flex-grow flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xs font-bold text-green-400 flex items-center gap-2">
                                <CodeIcon className="w-4 h-4"/> Mermaid.js Code
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={copyCode} className="text-xs text-dun hover:text-white flex items-center gap-1">
                                    <ShareIcon className="w-3 h-3"/> Copy
                                </button>
                                <a 
                                    href={`https://mermaid.live/edit#base64:${btoa(unescape(encodeURIComponent(JSON.stringify({ code: mermaidCode, mermaid: { theme: 'dark' } }))))}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-xs text-accent hover:underline"
                                >
                                    Open in Live Editor
                                </a>
                            </div>
                        </div>
                        <pre className="bg-black p-3 rounded-lg text-xs font-mono text-green-300 overflow-x-auto flex-grow">
                            {mermaidCode}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemArchitectureScreen;
