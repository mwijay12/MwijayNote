import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeftIcon, PlayIcon, PauseIcon, WifiIcon, SearchIcon, HeartIcon, RefreshCwIcon, GlobeIcon, CloudOffIcon, Volume2Icon, ListIcon, HistoryIcon, UploadIcon } from './Icons';
import { AudioTrack } from '../hooks/useGlobalAudio';
import { UserTrack } from '../types';

interface RadioStation {
    stationuuid: string;
    name: string;
    url_resolved: string;
    favicon: string;
    tags: string;
    country: string;
    bitrate: number;
}

const FALLBACK_STATIONS: RadioStation[] = [
    { stationuuid: 'fb1', name: 'Lofi Girl 24/7', url_resolved: 'https://play.streamafrica.net/lofiradio', favicon: '', tags: 'study,relax,lofi', country: 'France', bitrate: 128 },
    { stationuuid: 'fb2', name: 'Capital FM London', url_resolved: 'https://media-ice.musicradio.com/CapitalMP3', favicon: '', tags: 'pop,hits', country: 'UK', bitrate: 128 },
    { stationuuid: 'fb3', name: 'Clouds FM TZ', url_resolved: 'https://shoutcast.hostingcenter.com/proxy/clouds?mp=/stream', favicon: '', tags: 'local,bongo,news', country: 'Tanzania', bitrate: 128 },
    { stationuuid: 'fb4', name: 'Smooth Chill', url_resolved: 'https://media-ice.musicradio.com/SmoothChillMP3', favicon: '', tags: 'chill,ambient', country: 'UK', bitrate: 128 },
];

const SmoothVisualizer: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => (
    <div className="flex items-center justify-center gap-1 h-12">
        {[...Array(12)].map((_, i) => (
            <div key={i}
                className="w-1.5 rounded-full bg-accent/40"
                style={{
                    height: isPlaying ? '100%' : '20%',
                    animation: isPlaying ? `radioWave ${0.6 + (i % 4) * 0.15}s ease-in-out infinite alternate` : 'none',
                    animationDelay: `${i * 60}ms`,
                    opacity: isPlaying ? 0.8 : 0.2
                }}
            />
        ))}
        <style>{`
            @keyframes radioWave { 
                0% { height: 20%; opacity: 0.3; } 
                100% { height: 100%; opacity: 1; } 
            }
        `}</style>
    </div>
);

const RadioScreen: React.FC<{ 
    onBack: () => void, 
    currentTrack: AudioTrack | null, 
    isPlaying: boolean, 
    playTrack: (t: AudioTrack) => void, 
    togglePlay: () => void,
    userTracks: UserTrack[],
    onUpload: (file: File) => Promise<void>,
    setVolume: (v: number) => void
}> = ({ onBack, currentTrack, isPlaying, playTrack, togglePlay, userTracks, onUpload, setVolume }) => {
    const [stations, setStations] = useState<RadioStation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Top');
    const [tab, setTab] = useState<'browse' | 'recent' | 'my-music'>('browse');
    const [recentStations, setRecentStations] = useState<RadioStation[]>([]);
    const searchTimeout = useRef<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem('mwijay_recent_radio');
        if (stored) {
            try { setRecentStations(JSON.parse(stored)); } catch (e) {}
        }
    }, []);

    const saveRecent = useCallback((station: RadioStation) => {
        setRecentStations(prev => {
            const next = [station, ...prev.filter(s => s.stationuuid !== station.stationuuid)].slice(0, 10);
            localStorage.setItem('mwijay_recent_radio', JSON.stringify(next));
            return next;
        });
    }, []);

    const fetchStations = async (query: string = '') => {
        setIsLoading(true);
        try {
            const url = query 
                ? `https://de1.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(query)}&limit=25&hidebroken=true&is_https=true`
                : `https://de1.api.radio-browser.info/json/stations/search?tag=${encodeURIComponent(activeFilter === 'Top' ? 'hits' : activeFilter.toLowerCase())}&limit=40&hidebroken=true&order=clickcount&reverse=true&is_https=true`;
            
            const res = await fetch(url);
            const data = await res.json();
            setStations(data.length ? data : FALLBACK_STATIONS);
        } catch (e) {
            setStations(FALLBACK_STATIONS);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchStations(); }, [activeFilter]);

    const handleSearch = (q: string) => {
        setSearchQuery(q);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (q.length > 2) {
            searchTimeout.current = setTimeout(() => fetchStations(q), 800);
        }
    };

    const handlePlay = useCallback((s: RadioStation) => {
        saveRecent(s);
        playTrack({
            id: s.stationuuid,
            url: s.url_resolved,
            title: s.name,
            artist: s.country,
            artwork: s.favicon || undefined,
            isLive: true
        });
    }, [saveRecent, playTrack]);

    const playNext = useCallback(() => {
        if (!currentTrack) return;
        const list = tab === 'browse' ? stations : tab === 'recent' ? recentStations : [];
        if (list.length === 0) return;
        const currentIndex = list.findIndex(s => s.stationuuid === currentTrack.id);
        if (currentIndex !== -1 && currentIndex < list.length - 1) {
            handlePlay(list[currentIndex + 1]);
        }
    }, [currentTrack, tab, stations, recentStations, handlePlay]);

    const playPrev = useCallback(() => {
        if (!currentTrack) return;
        const list = tab === 'browse' ? stations : tab === 'recent' ? recentStations : [];
        if (list.length === 0) return;
        const currentIndex = list.findIndex(s => s.stationuuid === currentTrack.id);
        if (currentIndex > 0) {
            handlePlay(list[currentIndex - 1]);
        }
    }, [currentTrack, tab, stations, recentStations, handlePlay]);

    useEffect(() => {
        const handleNext = () => playNext();
        const handlePrev = () => playPrev();
        window.addEventListener('media-next', handleNext);
        window.addEventListener('media-prev', handlePrev);
        return () => {
            window.removeEventListener('media-next', handleNext);
            window.removeEventListener('media-prev', handlePrev);
        };
    }, [playNext, playPrev]);

    const isActive = (id: string) => currentTrack?.id === id;

    return (
        <div className="flex flex-col h-full bg-bg-primary animate-fade-in relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-accent/5 rounded-full blur-[120px] -mr-[30vw] -mt-[30vw] pointer-events-none"></div>
            
            <header 
                className="relative z-50 px-6 pb-4 flex justify-between items-center bg-bg-primary/40 backdrop-blur-md border-b border-white/5"
                style={{ paddingTop: 'calc(var(--safe-area-top) + 1.5rem)' }}
            >
                <button onClick={onBack} className="p-3 rounded-2xl bg-card border border-white/10 text-isabelline hover:text-accent transition-all shadow-xl">
                    <ArrowLeftIcon className="w-6 h-6"/>
                </button>
                <div className="text-center">
                    <h2 className="text-sm font-black uppercase tracking-[0.4em] text-accent">Radio Suite</h2>
                    <p className="text-[10px] text-dun font-bold opacity-50">ANALOG FIDELITY v4.5</p>
                </div>
                <button onClick={() => fetchStations()} className="p-3 rounded-2xl bg-card border border-white/10 text-isabelline hover:text-accent">
                    <RefreshCwIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}/>
                </button>
            </header>

            <div className="flex-grow overflow-y-auto no-scrollbar px-6 pt-8 pb-32">
                
                {/* HIGH-END DASHBOARD */}
                <div className="w-full bg-card rounded-[3.5rem] p-8 mb-10 shadow-2xl relative overflow-hidden border border-white/10 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                    
                    <div className="flex flex-col items-center text-center relative z-10">
                        <div className="relative mb-8 group">
                            <div className={`w-32 h-32 rounded-full bg-bg-primary border-4 transition-all duration-1000 ${isPlaying && currentTrack?.isLive ? 'border-accent shadow-[0_0_50px_rgba(251,191,36,0.3)] scale-105' : 'border-white/10'}`}>
                                {currentTrack?.artwork ? (
                                    <img src={currentTrack.artwork} className="w-full h-full object-cover rounded-full opacity-60" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-dun">
                                        <GlobeIcon className={`w-12 h-12 ${isPlaying ? 'animate-pulse' : ''}`}/>
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-accent text-cafe p-2.5 rounded-full border-4 border-jet shadow-lg">
                                <WifiIcon className="w-5 h-5"/>
                            </div>
                        </div>

                        <h3 className="text-2xl font-brand font-black text-isabelline truncate w-full px-4 mb-2">
                            {currentTrack?.isLive ? currentTrack.title : "Ready to Tune"}
                        </h3>
                        <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-8">
                            {currentTrack?.isLive ? currentTrack.artist : "Select Frequency Below"}
                        </p>

                        <SmoothVisualizer isPlaying={isPlaying && !!currentTrack?.isLive} />

                        <div className="mt-10 flex flex-col items-center gap-6 w-full max-w-xs">
                            <div className="flex items-center gap-8">
                                <button className="text-dun hover:text-red-400 transition-colors"><HeartIcon className="w-6 h-6"/></button>
                                <button 
                                    onClick={togglePlay}
                                    disabled={!currentTrack}
                                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl hover:scale-105 active:scale-95 ${isPlaying ? 'bg-isabelline text-jet' : 'bg-accent text-cafe'}`}
                                >
                                    {isPlaying ? <PauseIcon className="w-10 h-10 fill-current" /> : <PlayIcon className="w-10 h-10 fill-current ml-2" />}
                                </button>
                                <button className="text-dun hover:text-white transition-colors"><ListIcon className="w-6 h-6"/></button>
                            </div>
                            
                            {/* Volume Slider */}
                            <div className="w-full flex items-center gap-4 bg-jet/50 px-6 py-4 rounded-3xl border border-white/5">
                                <Volume2Icon className="w-4 h-4 text-dun shrink-0"/>
                                <input 
                                    type="range" min="0" max="1" step="0.01" defaultValue="0.7"
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex gap-2 p-1 bg-card rounded-2xl border border-white/5 mb-6">
                    {(['browse', 'recent', 'my-music'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${tab === t ? 'bg-accent text-cafe shadow-lg' : 'text-dun hover:bg-white/5'}`}>
                            {t === 'browse' ? 'Browse' : t === 'recent' ? 'Recent' : 'Files'}
                        </button>
                    ))}
                </div>

                {tab === 'browse' && (
                    <div className="space-y-6">
                        <div className="relative group">
                            <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-dun group-focus-within:text-accent transition-colors"/>
                            <input 
                                value={searchQuery} 
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Find Station..." 
                                className="w-full bg-card border border-white/5 rounded-[2.5rem] py-6 pl-16 pr-8 text-sm text-isabelline focus:border-accent/40 outline-none transition-all placeholder-dun/40 font-bold" 
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                            {['Top', 'Jazz', 'LoFi', 'News', 'Techno', 'TZ', 'Classic'].map(cat => (
                                <button key={cat} onClick={() => setActiveFilter(cat)}
                                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === cat ? 'bg-accent text-cafe shadow-xl scale-105' : 'bg-card text-dun border border-white/5 hover:bg-white/5'}`}>
                                    {cat === 'TZ' ? 'Tanzania 🇹🇿' : cat}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {isLoading ? (
                                <div className="py-20 flex flex-col items-center gap-4 text-dun opacity-40">
                                    <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Scanning Waves...</span>
                                </div>
                            ) : stations.map((station, i) => {
                                const active = isActive(station.stationuuid);
                                return (
                                    <button key={station.stationuuid} onClick={() => handlePlay(station)}
                                        className={`flex items-center gap-5 p-6 rounded-[2.5rem] border text-left transition-all animate-slide-up hover-lift ${active ? 'bg-accent/10 border-accent/50 shadow-lg' : 'bg-card/40 border-white/5'}`}
                                        style={{ animationDelay: `${i * 30}ms` }}>
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-brand font-black shrink-0 shadow-inner ${active && isPlaying ? 'bg-accent text-cafe animate-pulse' : 'bg-bg-primary text-dun'}`}>
                                            {station.favicon ? <img src={station.favicon} className="w-full h-full object-cover" /> : station.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0 flex-grow">
                                            <h4 className={`font-black text-sm truncate uppercase tracking-tighter ${active ? 'text-accent' : 'text-isabelline'}`}>{station.name}</h4>
                                            <p className="text-[9px] font-bold text-dun uppercase tracking-widest opacity-60 mt-1">{station.country} • {station.bitrate}kbps</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {tab === 'recent' && (
                    <div className="space-y-4">
                        {recentStations.length === 0 ? (
                            <div className="py-20 text-center space-y-4">
                                <HistoryIcon className="w-12 h-12 text-dun/20 mx-auto" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-dun/40">Your tuning history is empty</p>
                            </div>
                        ) : recentStations.map((s, i) => (
                            <button key={s.stationuuid} onClick={() => handlePlay(s)}
                                className={`flex items-center gap-5 p-6 rounded-[2.5rem] border text-left transition-all animate-slide-up ${isActive(s.stationuuid) ? 'bg-accent/10 border-accent/50 shadow-lg' : 'bg-card/40 border-white/5'}`}
                                style={{ animationDelay: `${i * 30}ms` }}>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-brand font-black shrink-0 ${isActive(s.stationuuid) && isPlaying ? 'bg-accent text-cafe animate-pulse' : 'bg-bg-primary text-dun'}`}>
                                    {s.favicon ? <img src={s.favicon} className="w-full h-full object-cover" /> : s.name.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-grow">
                                    <h4 className={`font-black text-sm truncate uppercase tracking-tighter ${isActive(s.stationuuid) ? 'text-accent' : 'text-isabelline'}`}>{s.name}</h4>
                                    <p className="text-[9px] font-bold text-dun uppercase tracking-widest opacity-60 mt-1">{s.country}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {tab === 'my-music' && (
                    <div className="space-y-4">
                        <button onClick={() => fileInputRef.current?.click()} className="w-full p-8 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center gap-3 text-dun hover:border-accent/40 hover:text-accent transition-all">
                            <UploadIcon className="w-8 h-8 opacity-40" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Upload Local Tracks</span>
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
                        {userTracks.map(t => (
                            <div key={t.id} className="p-4 bg-card rounded-2xl border border-white/5 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-bg-primary flex items-center justify-center">🎵</div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-xs text-isabelline truncate">{t.name}</h4>
                                    <p className="text-[9px] text-dun/50 uppercase font-black">Personal File</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const fileInputRef = React.createRef<HTMLInputElement>();

export default RadioScreen;
