
import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, CalendarIcon, GlobeIcon, RefreshCwIcon } from './Icons';
import { fetchTechEvents } from '../services/geminiService';

const TechEventRadarScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadEvents = async () => {
        setIsLoading(true);
        try {
            const data = await fetchTechEvents();
            if (data.length > 0) setEvents(data);
        } catch (e) { console.error(e); }
        setIsLoading(false);
    };

    useEffect(() => { loadEvents(); }, []);

    return (
        <div className="flex flex-col h-full bg-jet p-4 pt-16 animate-fade-in">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6"/></button>
                    <h2 className="text-xl font-serif ml-4">Tech Radar TZ</h2>
                </div>
                <button onClick={loadEvents} className={`p-2 rounded-full hover:bg-white/10 ${isLoading ? 'animate-spin' : ''}`}><RefreshCwIcon className="w-5 h-5"/></button>
            </header>

            <div className="flex-grow overflow-y-auto space-y-4 pb-4">
                {isLoading && <p className="text-center text-dun">Scanning East African Tech Scene...</p>}
                
                {!isLoading && events.length === 0 && (
                    <div className="text-center text-dun py-10">
                        <p>No events found right now.</p>
                        <button onClick={loadEvents} className="text-accent mt-2 hover:underline">Retry AI Scan</button>
                    </div>
                )}

                {events.map((evt, i) => (
                    <div key={i} className="bg-card p-4 rounded-2xl border border-white/5 hover:border-accent/30 transition-colors group animate-slide-in-from-bottom" style={{animationDelay: `${i*100}ms`}}>
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded uppercase font-bold">{evt.tag || 'Tech'}</span>
                                <h3 className="text-lg font-bold text-isabelline mt-1">{evt.title}</h3>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-isabelline block">{evt.date}</span>
                                <span className="text-xs text-dun">{evt.loc}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TechEventRadarScreen;
