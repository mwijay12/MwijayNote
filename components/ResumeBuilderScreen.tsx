import React, { useState } from 'react';
import { ArrowLeftIcon, SparklesIcon, DownloadIcon } from './Icons';
import { generateResume } from '../services/geminiService';
import { exportAsDoc } from '../utils/exportUtils';
import { markdownToHtml } from '../utils/textUtils';

const ResumeBuilderScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [profile, setProfile] = useState('');
    const [resumeContent, setResumeContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!profile.trim()) return;
        setIsLoading(true);
        const md = await generateResume(profile);
        setResumeContent(md);
        setIsLoading(false);
    };

    const download = () => {
        if (!resumeContent) return;
        const htmlContent = `
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; color: #000; line-height: 1.5; }
                        h1, h2, h3 { font-family: 'Bitter', serif; text-transform: uppercase; }
                        h1 { font-size: 24px; border-bottom: 2px solid #000; padding-bottom: 5px; }
                        h2 { font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-top: 20px; }
                        p { margin: 5px 0; font-size: 12px; }
                        ul { padding-left: 20px; margin: 5px 0; }
                    </style>
                </head>
                <body>${resumeContent}</body>
            </html>`;
        exportAsDoc("Resume", htmlContent, "Resume");
    };

    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-bg-primary">
            <header className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                <h2 className="text-xl font-serif">Resume Builder</h2>
                <div className="w-6"></div>
            </header>

            <div className="flex-grow flex flex-col gap-4 overflow-hidden">
                {!resumeContent ? (
                    <div className="bg-card p-6 rounded-2xl border border-white/10 flex-shrink-0">
                        <label className="text-xs font-bold text-dun uppercase mb-2 block">Paste Your Details</label>
                        <textarea 
                            value={profile}
                            onChange={e => setProfile(e.target.value)}
                            placeholder="Paste your Bio, Education, Experience, and Skills here. The AI will format it into a professional resume structure."
                            className="w-full bg-bg-primary p-4 rounded-xl text-isabelline h-40 mb-4 resize-none outline-none focus:ring-2 focus:ring-amber text-sm"
                        />
                        <button 
                            onClick={handleGenerate} 
                            disabled={isLoading || !profile.trim()}
                            className="w-full py-3 bg-accent text-cafe font-bold rounded-xl flex justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                        >
                            {isLoading ? 'Drafting...' : <><SparklesIcon className="w-5 h-5"/> Generate Resume</>}
                        </button>
                    </div>
                ) : (
                    <div className="flex-grow bg-white text-black p-8 rounded-xl overflow-y-auto shadow-xl prose prose-sm max-w-none custom-scrollbar">
                        <div dangerouslySetInnerHTML={{ __html: resumeContent }} />
                    </div>
                )}

                {resumeContent && (
                    <div className="flex gap-2 shrink-0 pt-2">
                        <button onClick={() => setResumeContent('')} className="flex-1 bg-bg-primary text-dun py-3 rounded-xl font-bold hover:bg-white/5">Edit Info</button>
                        <button onClick={download} className="flex-[2] bg-green-600 text-white py-3 rounded-xl font-bold flex justify-center gap-2 hover:bg-green-500">
                            <DownloadIcon className="w-5 h-5"/> Download .DOC
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
export default ResumeBuilderScreen;
