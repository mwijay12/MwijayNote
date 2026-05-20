
import React, { useState, useEffect } from 'react';
import { RefreshCwIcon, ShareIcon, SparklesIcon, LightbulbIcon, BrainCircuitIcon } from './Icons';
import { psychologyFacts, funFacts, lifeHacks } from '../data/content';
import { ContentPreferences } from '../hooks/useSettings';
import { getFreshFact } from '../services/geminiService';

interface HomeFactWidgetProps {
    preferences?: ContentPreferences;
}

const HomeFactWidget: React.FC<HomeFactWidgetProps> = ({ preferences }) => {
    const [content, setContent] = useState<{ type: string, text: string, icon: React.ReactNode } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Safely determine categories even if preferences is undefined
    const getEnabledCategories = () => {
        const cats: string[] = [];
        // Default to all if preferences aren't loaded yet
        if (!preferences) {
            return ['Fun Fact', 'Life Hack', 'Psychology'];
        }

        if (preferences.showPsychology) cats.push('Psychology');
        if (preferences.showFunFacts) cats.push('Fun Fact');
        if (preferences.showLifeHacks) cats.push('Life Hack');
        
        // Ensure at least one category is available
        if (cats.length === 0) cats.push('Fun Fact'); 
        return cats;
    };

    const getOfflineContent = (category: string) => {
        try {
            if (category === 'Psychology') return psychologyFacts[Math.floor(Math.random() * psychologyFacts.length)];
            if (category === 'Life Hack') return lifeHacks[Math.floor(Math.random() * lifeHacks.length)];
            return funFacts[Math.floor(Math.random() * funFacts.length)];
        } catch (e) {
            return "Did you know? Mwijay Note works offline.";
        }
    };

    const getIcon = (category: string) => {
        switch(category) {
            case 'Psychology': return <BrainCircuitIcon className="w-5 h-5 text-purple-400"/>;
            case 'Life Hack': return <LightbulbIcon className="w-5 h-5 text-green-400"/>;
            default: return <SparklesIcon className="w-5 h-5 text-blue-400"/>;
        }
    };

    const fetchContent = async (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (e) setIsLoading(true);

        const categories = getEnabledCategories();
        const selectedCat = categories[Math.floor(Math.random() * categories.length)];
        
        let text = "";

        // Attempt AI fetch with a strict timeout (2.5s) to prevent boredom
        if (navigator.onLine && Math.random() > 0.3) { // 30% chance for AI to save quota
            try {
                const aiPromise = getFreshFact(selectedCat as any);
                const timeoutPromise = new Promise<string>((_, reject) => 
                    setTimeout(() => reject("timeout"), 2500)
                );
                
                text = await Promise.race([aiPromise, timeoutPromise]);
            } catch (err) {
                // Ignore
            }
        }

        if (!text) {
            text = getOfflineContent(selectedCat);
        }

        setContent({ 
            type: selectedCat, 
            text, 
            icon: getIcon(selectedCat) 
        });
        setIsLoading(false);
    };

    // Initial load: Load offline content immediately for instant render
    useEffect(() => {
        try {
            const categories = getEnabledCategories();
            const selectedCat = categories[Math.floor(Math.random() * categories.length)];
            setContent({
                type: selectedCat,
                text: getOfflineContent(selectedCat),
                icon: getIcon(selectedCat)
            });
            // Optional: Background refresh
            // fetchContent();
        } catch (e) {
            console.error("Widget crash prevention", e);
        }
    }, [preferences]);

    const share = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (content) {
            const text = `${content.type}: "${content.text}"\n\nShared from Mwijay Note`;
            if (navigator.share) {
                navigator.share({ title: 'Daily Spark', text }).catch(() => {});
            } else {
                navigator.clipboard.writeText(text);
                alert("Copied!");
            }
        }
    };

    if (!content) return null;

    return (
        <div 
            onClick={fetchContent}
            className="bg-card border border-white/10 p-5 rounded-2xl relative overflow-hidden group hover:border-accent/30 transition-all duration-500 hover:shadow-lg animate-fade-in-up cursor-pointer"
        >
            <div className="absolute top-0 right-0 p-3 flex gap-2 z-10">
                <button onClick={fetchContent} disabled={isLoading} className="p-1.5 bg-black/10 dark:bg-black/50 rounded-full text-accent/80 hover:text-white transition-colors transform hover:rotate-180 duration-500">
                    <RefreshCwIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}/>
                </button>
                <button onClick={share} className="p-1.5 bg-black/10 dark:bg-black/50 rounded-full text-accent/80 hover:text-white transition-colors hover:scale-110">
                    <ShareIcon className="w-4 h-4"/>
                </button>
            </div>

            <div className="flex items-center gap-2 mb-3 relative z-10">
                <div className="p-1.5 bg-white/5 rounded-full animate-pulse-slow">
                    {content.icon}
                </div>
                <h3 className="text-xs font-bold text-dun uppercase tracking-widest">{content.type}</h3>
            </div>

            <div className={`animate-fade-in ${isLoading ? 'opacity-50 blur-sm' : 'opacity-100 blur-0'} transition-all duration-300 relative z-10`}>
                <p className="text-base font-medium text-isabelline leading-relaxed min-h-[3rem]">
                    {content.text}
                </p>
            </div>
        </div>
    );
};

export default HomeFactWidget;
