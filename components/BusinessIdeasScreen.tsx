
import React, { useState } from 'react';
import { ArrowLeftIcon, SparklesIcon, LightbulbIcon, GlobeIcon } from './Icons';
import { getBusinessIdeas } from '../services/geminiService';

interface BusinessIdeasScreenProps {
    onBack: () => void;
}

const BusinessIdeasScreen: React.FC<BusinessIdeasScreenProps> = ({ onBack }) => {
    const [location, setLocation] = useState<'Global' | 'Tanzania'>('Global');
    const [ideas, setIdeas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const results = await getBusinessIdeas(location);
            setIdeas(results);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const getSkillsArray = (skills: any): string[] => {
        if (Array.isArray(skills)) return skills;
        if (typeof skills === 'string') return skills.split(',').map(s => s.trim());
        return [];
    };

    return (
        <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-jet">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                <h2 className="text-xl font-serif ml-4 flex items-center gap-2"><LightbulbIcon className="w-6 h-6 text-yellow-400"/> Opportunity Scout</h2>
            </header>

            <div className="flex gap-2 mb-6 p-1 bg-card rounded-full">
                <button 
                    onClick={() => setLocation('Global')} 
                    className={`flex-1 py-2 rounded-full font-bold text-sm transition-colors ${location === 'Global' ? 'bg-accent text-cafe' : 'text-dun'}`}
                >
                    Global Trends
                </button>
                <button 
                    onClick={() => setLocation('Tanzania')} 
                    className={`flex-1 py-2 rounded-full font-bold text-sm transition-colors ${location === 'Tanzania' ? 'bg-green-500 text-white' : 'text-dun'}`}
                >
                    Tanzania 🇹🇿
                </button>
            </div>

            {ideas.length === 0 && (
                <div className="text-center py-20">
                    <GlobeIcon className="w-16 h-16 mx-auto mb-4 text-dun/50"/>
                    <p className="text-dun mb-4">Find self-employment ideas tailored for BBIT graduates.</p>
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading}
                        className="bg-card border border-accent/30 text-accent px-6 py-3 rounded-full font-bold hover:bg-accent/10 flex items-center gap-2 mx-auto"
                    >
                        {isLoading ? <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                        Scout Opportunities
                    </button>
                </div>
            )}

            <div className="flex-grow overflow-y-auto space-y-4 pb-4">
                {ideas.map((idea, idx) => (
                    <div key={idx} className="bg-card p-5 rounded-2xl border border-white/5 hover:border-accent/20 transition-colors animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                        <h3 className="font-bold text-lg text-isabelline mb-2">{idea.title}</h3>
                        <p className="text-sm text-dun leading-relaxed mb-3">{idea.description}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {getSkillsArray(idea.required_skills).map((skill: string, i: number) => (
                                <span key={i} className="text-[10px] bg-jet px-2 py-1 rounded border border-white/10 text-dun">{skill}</span>
                            ))}
                        </div>
                        {idea.potential_income && (
                            <p className="text-xs font-bold text-green-400 mt-2">Potential: {idea.potential_income}</p>
                        )}
                    </div>
                ))}
                {ideas.length > 0 && (
                    <button onClick={handleGenerate} className="w-full py-3 text-sm font-bold text-dun hover:text-white bg-jet rounded-xl">Generate More</button>
                )}
            </div>
        </div>
    );
};

export default BusinessIdeasScreen;
