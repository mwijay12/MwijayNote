
import React, { useState, useEffect } from 'react';
import { FeatherIcon, RefreshCwIcon, ShareIcon, GlobeIcon } from './Icons';
import { methaliData, Methali } from '../data/methali';
import { getDailyWisdom } from '../services/geminiService';

const SAVED_WISDOM_KEY = 'mwijay_saved_wisdom';

const DailyWisdomWidget: React.FC = () => {
    const [content, setContent] = useState<{ origin: string, text: string, subtext: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Robust function to get proverbs without crashing
    const getAllProverbs = (): Methali[] => {
        try {
            // 1. Get Static Data (safely)
            const staticList = Array.isArray(methaliData) ? methaliData : [];
            
            // 2. Get Saved Data (safely)
            let savedList: Methali[] = [];
            try {
                const savedRaw = localStorage.getItem(SAVED_WISDOM_KEY);
                if (savedRaw) {
                    const parsed = JSON.parse(savedRaw);
                    if (Array.isArray(parsed)) {
                        savedList = parsed;
                    }
                }
            } catch (storageError) {
                console.warn("Failed to parse saved wisdom", storageError);
                // If storage is corrupt, clear it to prevent future crashes
                localStorage.removeItem(SAVED_WISDOM_KEY);
            }

            // 3. Combine
            const combined = [...staticList, ...savedList];
            
            // 4. Fallback if empty
            if (combined.length === 0) {
                return [{ 
                    text: "Every journey begins with a single step.", 
                    origin: "Global", 
                    meaning: "Start now." 
                }];
            }
            
            return combined;
        } catch (e) {
            console.error("Critical error in getAllProverbs", e);
            return [{ text: "Keep moving forward.", origin: "System", meaning: "Resilience." }];
        }
    };

    const getRandomOffline = () => {
        const list = getAllProverbs();
        const proverb = list[Math.floor(Math.random() * list.length)];
        // Safety check for malformed proverb objects
        if (!proverb || !proverb.text) return {
            origin: "Mwijay Note",
            text: "Focus on the present.",
            subtext: "💡 Mindfulness"
        };

        return {
            origin: proverb.origin || "Wisdom",
            text: proverb.text,
            subtext: `${proverb.translation && proverb.translation !== proverb.text ? `"${proverb.translation}"\n` : ''}💡 ${proverb.meaning || ''}`
        };
    };

    const saveNewProverb = (proverb: Methali) => {
        try {
            const savedRaw = localStorage.getItem(SAVED_WISDOM_KEY);
            const saved: Methali[] = savedRaw ? JSON.parse(savedRaw) : [];
            
            if (!saved.some(p => p.text === proverb.text)) {
                // Limit saved history to 50 to prevent storage bloat
                const newSaved = [proverb, ...saved].slice(0, 50);
                localStorage.setItem(SAVED_WISDOM_KEY, JSON.stringify(newSaved));
            }
        } catch (e) {
            console.error("Failed to save wisdom offline", e);
        }
    };

    const fetchWisdom = async (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setIsLoading(true);
        
        let proverbData = null;

        // Try AI if online
        if (navigator.onLine) { 
             try {
                 // Race AI against a 4s timeout so we don't keep user waiting
                 const aiPromise = getDailyWisdom();
                 const timeoutPromise = new Promise<any>((_, reject) => 
                     setTimeout(() => reject("timeout"), 4000)
                 );
                 
                 const data = await Promise.race([aiPromise, timeoutPromise]);
                 
                 if (data && data.text) {
                     proverbData = {
                         origin: data.origin || "Global Wisdom",
                         text: data.text,
                         subtext: `💡 ${data.meaning}`
                     };
                     
                     saveNewProverb({
                         origin: data.origin,
                         text: data.text,
                         meaning: data.meaning,
                         translation: data.text // Assuming translation matches for AI response structure
                     });
                 }
             } catch(err) {
                 // Silent fail to offline
             }
        }

        if (!proverbData) {
            proverbData = getRandomOffline();
        }

        setContent(proverbData);
        setIsLoading(false);
    };

    useEffect(() => { 
        // Initial load should be instant and offline-first
        setContent(getRandomOffline());
    }, []);

    const share = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (content) {
            const text = `${content.origin} Wisdom:\n"${content.text}"\n\n${content.subtext}\n\nShared from Mwijay Note`;
            if (navigator.share) {
                navigator.share({ title: 'Daily Wisdom', text }).catch(() => {});
            } else {
                navigator.clipboard.writeText(text);
                alert("Copied!");
            }
        }
    };

    // Render safety
    if (!content) return null;

    return (
        <div 
            onClick={fetchWisdom}
            className="bg-card border border-accent/30 p-5 rounded-2xl relative overflow-hidden group hover:border-accent/50 transition-all duration-500 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] animate-fade-in-up cursor-pointer"
        >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
            
            <div className="absolute top-0 right-0 p-3 flex gap-2 z-10">
                <button onClick={fetchWisdom} disabled={isLoading} className="p-1.5 bg-black/10 dark:bg-black/50 rounded-full text-accent/80 hover:text-white transition-colors transform hover:rotate-180 duration-500">
                    <RefreshCwIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}/>
                </button>
                <button onClick={share} className="p-1.5 bg-black/10 dark:bg-black/50 rounded-full text-accent/80 hover:text-white transition-colors hover:scale-110">
                    <ShareIcon className="w-4 h-4"/>
                </button>
            </div>

            <div className="flex items-center gap-2 mb-3 relative z-10">
                <div className="p-1.5 bg-accent/10 rounded-full animate-pulse-slow">
                    {content.origin === 'Swahili' ? <FeatherIcon className="w-5 h-5 text-accent"/> : <GlobeIcon className="w-5 h-5 text-accent"/>}
                </div>
                <h3 className="text-xs font-bold text-accent uppercase tracking-widest">{content.origin || 'Daily Wisdom'}</h3>
            </div>

            <div className={`animate-fade-in ${isLoading ? 'opacity-50 blur-sm' : 'opacity-100 blur-0'} transition-all duration-300 relative z-10`}>
                <p className="text-lg font-serif font-bold text-isabelline italic leading-relaxed">"{content.text}"</p>
                <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-dun font-medium whitespace-pre-wrap leading-relaxed">
                        {content.subtext}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DailyWisdomWidget;
