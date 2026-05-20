
import React, { useState } from 'react';
import { ArrowLeftIcon, TargetIcon, SparklesIcon, GraduationCapIcon } from './Icons';
import { mapCareerPath } from '../services/geminiService';

const CareerMapperScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [skills, setSkills] = useState('');
    const [paths, setPaths] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleMap = async () => {
        if (!skills.trim()) return;
        setIsLoading(true);
        const res = await mapCareerPath(skills);
        setPaths(res);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-bg-primary">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6"/></button>
                <h2 className="text-xl font-serif ml-4">Career Mapper</h2>
            </header>

            {!paths.length ? (
                <div className="bg-card p-6 rounded-3xl border border-white/10">
                    <label className="text-sm font-bold text-dun uppercase mb-2 block">Your Skills & Interests</label>
                    <textarea 
                        value={skills} 
                        onChange={e => setSkills(e.target.value)} 
                        placeholder="e.g. Java, Accounting, Public Speaking, React..." 
                        className="w-full bg-bg-primary p-4 rounded-xl text-isabelline h-32 mb-4 resize-none outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <button onClick={handleMap} disabled={isLoading} className="w-full py-3 bg-green-500 text-black font-bold rounded-xl flex justify-center gap-2">
                        {isLoading ? 'Mapping...' : <><TargetIcon className="w-5 h-5"/> Generate Roadmap</>}
                    </button>
                </div>
            ) : (
                <div className="flex-grow overflow-y-auto space-y-4 pb-4">
                    {paths.map((path, i) => (
                        <div key={i} className="bg-card p-5 rounded-2xl border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 px-3 py-1 text-xs font-bold rounded-bl-xl">{path.salary}</div>
                            <h3 className="text-lg font-bold text-isabelline mb-2">{path.role}</h3>
                            <p className="text-sm text-dun mb-4">{path.description}</p>
                            <div className="bg-bg-primary rounded-xl p-3">
                                <p className="text-xs font-bold text-accent uppercase mb-2">Recommended Steps</p>
                                <ul className="text-xs text-isabelline space-y-1">
                                    {path.steps.map((step: string, j: number) => (
                                        <li key={j} className="flex gap-2 items-start"><span className="text-green-400">•</span> {step}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => setPaths([])} className="w-full py-3 bg-bg-primary rounded-xl text-sm font-bold text-dun">Reset</button>
                </div>
            )}
        </div>
    );
};

export default CareerMapperScreen;
