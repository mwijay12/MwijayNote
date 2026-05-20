
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getZenContent, searchArchiveAudio, fetchArchiveTrackUrl } from '../services/geminiService';
import { ArrowLeftIcon, SparklesIcon, PlayIcon, PauseIcon, RefreshCwIcon, Volume2Icon, HeartIcon, SearchIcon, UploadIcon, XIcon, WindIcon } from './Icons';
import { UserTrack } from '../types';
import { offlineWisdom, ZenWisdom } from '../data/zenWisdom';
import { AudioTrack } from '../hooks/useGlobalAudio';

interface ZenModeScreenProps {
  onBack: () => void;
  userTracks: UserTrack[];
  onAddTrack: (file: File) => void;
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  playTrack: (t: AudioTrack) => void;
  togglePlay: () => void;
}

const ZenAnimation: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;

        const orbs: any[] = [];
        for (let i = 0; i < 15; i++) {
            orbs.push({
                x: Math.random() * w,
                y: Math.random() * h,
                radius: Math.random() * 300 + 200,
                vx: (Math.random() - 0.5) * 0.1,
                vy: (Math.random() - 0.5) * 0.1,
                color: i % 3 === 0 ? 'rgba(251, 191, 36, 0.02)' : i % 3 === 1 ? 'rgba(56, 189, 248, 0.02)' : 'rgba(167, 139, 250, 0.02)'
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'screen';
            
            orbs.forEach(orb => {
                const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
                gradient.addColorStop(0, orb.color);
                gradient.addColorStop(1, 'transparent');
                
                ctx.beginPath();
                ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                orb.x += orb.vx;
                orb.y += orb.vy;

                if (orb.x < -orb.radius) orb.x = w + orb.radius;
                if (orb.x > w + orb.radius) orb.x = -orb.radius;
                if (orb.y < -orb.radius) orb.y = h + orb.radius;
                if (orb.y > h + orb.radius) orb.y = -orb.radius;
            });
            
            animationFrameId = requestAnimationFrame(draw);
        };

        const handleResize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        draw();
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-40" />;
};

const BreathPacer: React.FC = () => {
    const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
    
    useEffect(() => {
        let isActive = true;
        const cycle = async () => {
            while(isActive) {
                if(!isActive) break; setPhase('Inhale'); await new Promise(r => setTimeout(r, 4000));
                if(!isActive) break; setPhase('Hold'); await new Promise(r => setTimeout(r, 7000));
                if(!isActive) break; setPhase('Exhale'); await new Promise(r => setTimeout(r, 8000));
            }
        };
        cycle();
        return () => { isActive = false; };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in w-full">
            <div className={`w-64 h-64 rounded-full border-2 border-accent/10 flex items-center justify-center relative transition-all duration-[4000ms] ${phase === 'Inhale' ? 'scale-125' : phase === 'Exhale' ? 'scale-75 duration-[8000ms]' : 'scale-110 duration-[700ms]'}`}>
                <div className={`absolute inset-0 bg-accent/5 rounded-full blur-3xl transition-opacity duration-1000 ${phase === 'Hold' ? 'opacity-40' : 'opacity-10'}`}></div>
                <div className="text-center z-10">
                    <h2 className="text-2xl font-brand text-isabelline tracking-[0.3em] uppercase drop-shadow-sm">{phase}</h2>
                </div>
            </div>
            <p className="text-dun mt-12 text-[10px] uppercase tracking-[0.4em] font-bold opacity-60">Respiration Guide: 4-7-8</p>
        </div>
    );
};

const ZenModeScreen: React.FC<ZenModeScreenProps> = ({ 
  onBack, 
  userTracks, 
  onAddTrack,
  currentTrack,
  isPlaying,
  playTrack,
  togglePlay
}) => {
  const [activeTab, setActiveTab] = useState<'Focus' | 'Breathe' | 'Wisdom'>('Focus');
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryTab, setLibraryTab] = useState<'Archive' | 'Personal'>('Archive');
  const [showLibrary, setShowLibrary] = useState(false);
  const [archiveResults, setArchiveResults] = useState<any[]>([]);
  const [isArchiveLoading, setIsArchiveLoading] = useState(false);
  
  const [wisdom, setWisdom] = useState<Partial<ZenWisdom>>({});
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [likedWisdom, setLikedWisdom] = useState<string[]>(() => JSON.parse(localStorage.getItem('mwijay_zen_likes') || '[]'));
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<any>(null);

  const fetchArchive = async (query: string) => {
    setIsArchiveLoading(true);
    try {
        const results = await searchArchiveAudio(query);
        setArchiveResults(results);
    } catch(e) {
        console.error("Archive Search Failed", e);
    } finally {
        setIsArchiveLoading(false);
    }
  };

  useEffect(() => {
    fetchArchive('subject:"ambient music" OR subject:"nature sounds"');
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (libraryTab === 'Archive') {
        searchTimeoutRef.current = setTimeout(() => {
            fetchArchive(val || 'meditation');
        }, 800);
    }
  };

  const fetchWisdom = useCallback(async () => {
    setIsLoadingContent(true);
    
    // Pick a random offline wisdom first to ensure immediate display
    const randomIndex = Math.floor(Math.random() * offlineWisdom.length);
    const offlinePick = offlineWisdom[randomIndex];
    
    // Only attempt AI if online and random chance (to mix things up)
    if (navigator.onLine && Math.random() > 0.7) {
        try {
            const aiData = await getZenContent();
            if (aiData && aiData.text) {
                setWisdom({ 
                    text: aiData.text, 
                    author: aiData.author || 'Mwijay AI', 
                    category: (aiData.category as any) || 'Mindfulness',
                    id: Date.now().toString() 
                });
                setIsLoadingContent(false);
                return;
            }
        } catch (e) {
            // AI failed, fallback to offline
        }
    }
    
    // Set Offline Content
    setWisdom(offlinePick);
    setIsLoadingContent(false);
  }, []);

  const handleTrackChange = useCallback(async (track: any) => {
    let playableUrl = track.url;
    if (track.category === 'Archive' && !track.url) {
        const resolved = await fetchArchiveTrackUrl(track.id);
        if (resolved) playableUrl = resolved;
        else { alert("Could not resolve audio."); return; }
    }
    
    playTrack({
        id: track.id,
        url: playableUrl,
        title: track.name || track.title,
        artist: track.creator || 'Zen Audio',
        isLive: false
    });
  }, [playTrack]);

  // Initial fetch on mount or tab change if empty
  useEffect(() => { 
      if (activeTab === 'Wisdom' && !wisdom.text) {
          fetchWisdom();
      }
  }, [activeTab, fetchWisdom, wisdom.text]);

  const filteredPersonal = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (libraryTab !== 'Personal') return [];
    return userTracks.filter(t => t.name.toLowerCase().includes(q));
  }, [searchQuery, userTracks, libraryTab]);

  const playNext = useCallback(() => {
    if (!currentTrack) return;
    const list = libraryTab === 'Archive' ? archiveResults : filteredPersonal;
    if (list.length === 0) return;
    const currentIndex = list.findIndex(t => t.id === currentTrack.id);
    if (currentIndex !== -1 && currentIndex < list.length - 1) {
        handleTrackChange(list[currentIndex + 1]);
    }
  }, [currentTrack, libraryTab, archiveResults, filteredPersonal, handleTrackChange]);

  const playPrev = useCallback(() => {
    if (!currentTrack) return;
    const list = libraryTab === 'Archive' ? archiveResults : filteredPersonal;
    if (list.length === 0) return;
    const currentIndex = list.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
        handleTrackChange(list[currentIndex - 1]);
    }
  }, [currentTrack, libraryTab, archiveResults, filteredPersonal, handleTrackChange]);

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

  return (
    <div className="flex flex-col h-full bg-bg-primary text-isabelline relative transition-colors duration-500">
        <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" onChange={(e) => {
            if (e.target.files?.[0]) onAddTrack(e.target.files[0]);
        }} />
        
        <ZenAnimation />

        <header className="absolute top-0 left-0 right-0 p-4 pt-16 z-50 flex justify-between items-center bg-gradient-to-b from-jet/90 to-transparent">
            <button onClick={onBack} className="p-2 rounded-full bg-card/40 backdrop-blur-md border border-white/10 text-isabelline hover:text-accent transition-all shadow-xl"><ArrowLeftIcon className="w-6 h-6" /></button>
            <div className="flex bg-card/40 backdrop-blur-2xl rounded-full p-1 border border-white/10 shadow-2xl">
                <button onClick={() => setActiveTab('Focus')} className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${activeTab==='Focus'?'bg-accent text-cafe':'text-dun hover:text-isabelline'}`}>Focus</button>
                <button onClick={() => setActiveTab('Breathe')} className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${activeTab==='Breathe'?'bg-accent text-cafe':'text-dun hover:text-isabelline'}`}>Breathe</button>
                <button onClick={() => setActiveTab('Wisdom')} className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${activeTab==='Wisdom'?'bg-accent text-cafe':'text-dun hover:text-isabelline'}`}>Wisdom</button>
            </div>
            <button onClick={() => setShowLibrary(true)} className="p-2 rounded-full bg-card/40 backdrop-blur-md border border-white/10 text-accent shadow-xl animate-pulse-slow">
                <Volume2Icon className="w-6 h-6" />
            </button>
        </header>

        <div className="flex-grow overflow-y-auto z-20 pt-24 pb-10 px-6 custom-scrollbar">
            <div className="min-h-full flex flex-col justify-center items-center max-w-3xl mx-auto w-full">
            
                {activeTab === 'Breathe' && <BreathPacer />}
                
                {activeTab === 'Wisdom' && (
                    isLoadingContent ? (
                        <div className="flex flex-col items-center gap-4 animate-pulse">
                            <SparklesIcon className="w-12 h-12 text-accent animate-spin-slow"/>
                            <p className="text-dun text-[10px] tracking-[0.5em] uppercase">Channeling Serenity</p>
                        </div>
                    ) : (
                        <div className="w-full max-w-md animate-fade-in flex flex-col items-center">
                            <div className="bg-card/40 p-10 rounded-[4rem] backdrop-blur-3xl border border-white/10 shadow-2xl relative text-center min-h-[400px] flex flex-col justify-center">
                                {wisdom.category && (
                                    <div className="absolute top-8 left-0 right-0 flex justify-center">
                                        <span className="text-[9px] font-bold text-accent/80 uppercase tracking-widest border border-accent/20 px-3 py-1 rounded-full bg-accent/5">
                                            {wisdom.category}
                                        </span>
                                    </div>
                                )}

                                <div className="mt-8 mb-8">
                                    <h2 className="font-serif text-2xl md:text-3xl text-isabelline leading-relaxed italic">
                                        "{wisdom.text || ''}"
                                    </h2>
                                </div>
                                
                                <p className="text-[10px] font-black text-accent/60 uppercase tracking-[0.4em] mb-8">— {wisdom.author}</p>
                                
                                <div className="flex justify-center gap-5">
                                    <button onClick={() => {
                                        if (!wisdom.id) return;
                                        const newLikes = likedWisdom.includes(wisdom.id) ? likedWisdom.filter(id => id !== wisdom.id) : [...likedWisdom, wisdom.id];
                                        setLikedWisdom(newLikes);
                                        localStorage.setItem('mwijay_zen_likes', JSON.stringify(newLikes));
                                    }} className={`p-4 rounded-full border transition-all ${likedWisdom.includes(wisdom.id!) ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-bg-primary/50 border-white/10 text-dun hover:text-red-400'}`}>
                                        <HeartIcon className="w-5 h-5" fill={likedWisdom.includes(wisdom.id!) ? 'currentColor' : 'none'} />
                                    </button>
                                    <button onClick={fetchWisdom} className="p-4 rounded-full bg-bg-primary/50 border border-white/10 text-dun hover:text-accent transition-all hover:scale-110 active:scale-95">
                                        <RefreshCwIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                )}
                
                {activeTab === 'Focus' && (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="text-[7.5rem] sm:text-[11rem] font-mono font-bold text-isabelline tracking-tighter leading-none tabular-nums drop-shadow-2xl">25:00</div>
                        <p className="text-dun text-[11px] tracking-[1em] uppercase font-black px-8 mt-6 opacity-60">Deep Presence</p>
                        
                        {currentTrack && (
                            <div className="mt-16 flex flex-col items-center gap-4">
                                <div className="flex items-center gap-6 px-8 py-4 bg-card/40 border border-white/10 rounded-full backdrop-blur-md transition-all shadow-lg group hover:bg-card/60 min-w-[200px] justify-center">
                                <div className={`w-3 h-3 rounded-full bg-accent shadow-[0_0_15px_rgba(251,191,36,0.8)] ${isPlaying ? 'animate-pulse' : 'opacity-20'}`}></div>
                                <span className="text-xs text-isabelline font-mono truncate max-w-[150px] uppercase tracking-widest">{currentTrack.title}</span>
                                <button onClick={togglePlay} className="text-isabelline hover:text-accent transition-all transform active:scale-90">
                                    {isPlaying ? <PauseIcon className="w-6 h-6 fill-current" /> : <PlayIcon className="w-6 h-6 fill-current" />}
                                </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {showLibrary && (
            <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowLibrary(false)}>
                <div 
                    className="absolute bottom-0 left-0 right-0 bg-bg-primary rounded-t-[5rem] border-t border-white/10 p-10 flex flex-col h-[85vh] shadow-2xl animate-slide-up"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="w-16 h-1.5 bg-white/10 rounded-full mx-auto mb-10 shrink-0" />
                    
                    <div className="flex items-center justify-between mb-10 shrink-0">
                        <h2 className="text-4xl font-serif text-isabelline">Archive Hub</h2>
                        <button onClick={() => setShowLibrary(false)} className="p-3 bg-card/40 rounded-full text-dun hover:text-isabelline transition-colors"><XIcon className="w-7 h-7"/></button>
                    </div>

                    <div className="flex gap-2 mb-6 p-1 bg-card rounded-full shrink-0">
                        <button onClick={() => setLibraryTab('Archive')} className={`flex-1 py-3 rounded-full text-xs font-bold uppercase transition-all ${libraryTab==='Archive'?'bg-accent text-cafe':'text-dun'}`}>Sound Archive</button>
                        <button onClick={() => setLibraryTab('Personal')} className={`flex-1 py-3 rounded-full text-xs font-bold uppercase transition-all ${libraryTab==='Personal'?'bg-accent text-cafe':'text-dun'}`}>My resonance</button>
                    </div>

                    <div className="relative mb-6 shrink-0">
                        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-dun" />
                        <input 
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder={libraryTab === 'Archive' ? "Search Archive.org..." : "Search local tracks..."}
                            className="w-full bg-card/40 border border-white/10 rounded-3xl py-6 pl-16 pr-8 text-isabelline focus:border-accent/50 outline-none transition-all placeholder-dun/40 text-lg"
                        />
                    </div>

                    <div className="flex-grow overflow-y-auto space-y-4 no-scrollbar pb-12">
                        {libraryTab === 'Personal' && (
                             <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full p-8 rounded-[2.5rem] bg-accent/[0.02] border border-dashed border-accent/20 flex items-center justify-center gap-4 text-accent hover:bg-accent/5 transition-all mb-8 group"
                            >
                                <UploadIcon className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                                <span className="font-black text-sm uppercase tracking-[0.2em]">Add Local Resonator</span>
                            </button>
                        )}

                        {isArchiveLoading && (
                            <div className="flex flex-col items-center py-20 gap-4 text-dun animate-pulse">
                                <RefreshCwIcon className="w-10 h-10 animate-spin text-accent"/>
                                <span className="text-xs uppercase tracking-widest font-black">Syncing with Archive.org...</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                            {(libraryTab === 'Archive' ? archiveResults : filteredPersonal).map(track => (
                                <button 
                                    key={track.id}
                                    onClick={() => handleTrackChange(track)}
                                    className={`w-full p-6 rounded-[2.5rem] flex items-center justify-between border transition-all duration-500 ${currentTrack?.id === track.id ? 'bg-accent text-cafe border-accent shadow-lg scale-[1.02]' : 'bg-card/40 border-white/5 hover:border-white/20 text-isabelline'}`}
                                >
                                    <div className="flex items-center gap-6 overflow-hidden">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-all ${currentTrack?.id === track.id ? 'bg-black/10' : 'bg-bg-primary group-hover:scale-110'}`}>
                                            {track.icon || <WindIcon className="w-7 h-7 opacity-40" />}
                                        </div>
                                        <div className="text-left overflow-hidden">
                                            <h4 className="font-bold text-base truncate uppercase tracking-tighter">{track.name || track.title}</h4>
                                            <p className={`text-[9px] uppercase font-black tracking-[0.2em] mt-1 ${currentTrack?.id === track.id ? 'text-black/40' : 'text-dun'}`}>{track.creator || 'Recorded Audio'}</p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex items-center pr-2">
                                        {currentTrack?.id === track.id && isPlaying ? <PauseIcon className="w-6 h-6 fill-current"/> : <PlayIcon className="w-6 h-6 fill-current"/>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ZenModeScreen;
