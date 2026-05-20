
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    ArrowLeftIcon, PlayIcon, PauseIcon, SearchIcon, RefreshCwIcon,
    Volume2Icon, SkipForwardIcon, SkipBackIcon, SparklesIcon, MusicIcon,
    UploadIcon, HeartIcon, ListIcon, SlidersIcon
} from './Icons';
import { AudioTrack, getEqNodes } from '../hooks/useGlobalAudio';

import { useMusicLibrary, SavedTrack } from '../hooks/useMusicLibrary';

interface MusicHubScreenProps {
    onBack: () => void;
    currentTrack: AudioTrack | null;
    isPlaying: boolean;
    playTrack: (t: AudioTrack) => void;
    togglePlay: () => void;
    setVolume: (v: number) => void;
}

interface OnlineTrack {
    id: string;
    title: string;
    artist: string;
    url: string;
    artwork?: string;
    source: 'archive' | 'jamendo';
    duration?: number;
}

const WaveVisualizer: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
    return (
        <div className="flex items-center justify-center gap-[3px] h-8 mt-2 w-full max-w-[200px]">
            {[...Array(16)].map((_, i) => (
                <div 
                    key={i} 
                    className={`w-1 rounded-full transition-all duration-300 ${isPlaying ? 'bg-accent animate-pulse' : 'h-1 bg-white/20'}`} 
                    style={isPlaying ? { height: `${20 + Math.random() * 80}%`, animationDuration: `${0.3 + Math.random() * 0.5}s` } : {}}
                />
            ))}
        </div>
    );
};

const EQ_BANDS = [
    { label: '60Hz', name: 'Bass' },
    { label: '230Hz', name: 'Low-Mid' },
    { label: '910Hz', name: 'Mid' },
    { label: '3.6kHz', name: 'Hi-Mid' },
    { label: '14kHz', name: 'Treble' },
];

const PRESETS: Record<string, number[]> = {
    Flat:      [0, 0, 0, 0, 0],
    Bass:      [8, 4, 0, -2, -3],
    Pop:       [-1, 3, 5, 3, -1],
    Classical: [4, 3, -2, 3, 4],
    HipHop:    [6, 4, -1, 3, 2],
    Rock:      [4, -1, -2, 2, 4],
};

const Equalizer: React.FC<{ audioRef: React.RefObject<HTMLAudioElement | null> }> = () => {
    const [gains, setGains] = useState<number[]>([0, 0, 0, 0, 0]);
    const [activePreset, setActivePreset] = useState('Flat');

    const applyGains = (newGains: number[]) => {
        const eq = getEqNodes();
        if (eq) {
            eq.bands.forEach((band, i) => {
                band.gain.value = newGains[i] ?? 0;
            });
        }
        setGains(newGains);
    };

    const handleBandChange = (index: number, value: number) => {
        setActivePreset('Custom');
        const updated = [...gains];
        updated[index] = value;
        applyGains(updated);
    };

    const applyPreset = (name: string) => {
        setActivePreset(name);
        applyGains(PRESETS[name] || [0,0,0,0,0]);
    };

    return (
        <div className="flex flex-col gap-4 bg-white/5 rounded-2xl p-5 border border-white/10 w-full mb-6">
            <h4 className="text-[10px] font-black uppercase text-accent tracking-[0.2em] flex items-center gap-2">
                <SlidersIcon className="w-3 h-3" /> 5-Band Equalizer
            </h4>

            {/* Presets */}
            <div className="flex gap-1.5 flex-wrap">
                {Object.keys(PRESETS).map(preset => (
                    <button
                        key={preset}
                        onClick={() => applyPreset(preset)}
                        className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all border ${
                            activePreset === preset
                                ? 'bg-accent/20 border-accent text-accent'
                                : 'bg-black/20 border-white/5 text-dun hover:border-white/20'
                        }`}
                    >{preset}</button>
                ))}
            </div>

            {/* Vertical sliders */}
            <div className="flex items-end justify-between gap-2 pt-2">
                {EQ_BANDS.map((band, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1">
                        <span className="text-[9px] font-bold text-accent">
                            {gains[i] > 0 ? '+' : ''}{gains[i]}dB
                        </span>
                        <div className="relative flex items-center justify-center" style={{ height: 100 }}>
                            <input
                                type="range"
                                min="-12"
                                max="12"
                                step="0.5"
                                value={gains[i]}
                                onChange={e => handleBandChange(i, parseFloat(e.target.value))}
                                className="appearance-none cursor-pointer"
                                style={{
                                    writingMode: 'vertical-lr' as any,
                                    direction: 'rtl',
                                    height: 90,
                                    width: 24,
                                    accentColor: '#FFBC2D',
                                }}
                            />
                        </div>
                        <span className="text-[8px] text-dun/50 font-bold text-center leading-tight">{band.label}</span>
                        <span className="text-[7px] text-dun/30 uppercase tracking-widest">{band.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MusicHubScreen: React.FC<MusicHubScreenProps> = ({ onBack, currentTrack, isPlaying, playTrack, togglePlay, setVolume }) => {
    const [tab, setTab] = useState<'player' | 'library' | 'local'>('player');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<OnlineTrack[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [localTracks, setLocalTracks] = useState<OnlineTrack[]>([]);
    const [volume, setLocalVolume] = useState(0.7);
    const [showEq, setShowEq] = useState(false);
    
    const { savedTracks, toggleLike, isLiked } = useMusicLibrary();
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Get the real audio element from the page
    useEffect(() => {
        const el = document.querySelector('audio');
        if (el) (audioRef as any).current = el;
    }, [currentTrack]);

    // Search Archive.org
    const searchArchive = async (q: string) => {
        setIsSearching(true);
        try {
            const encoded = encodeURIComponent(`(${q || 'jazz lofi ambient'}) AND mediatype:audio AND format:mp3`);
            const url = `https://archive.org/advancedsearch.php?q=${encoded}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=year&sort[]=downloads+desc&rows=20&output=json`;
            const res = await fetch(url);
            const data = await res.json();
            const docs = data?.response?.docs || [];
            const tracks: OnlineTrack[] = docs.map((d: any) => ({
                id: d.identifier,
                title: d.title || 'Untitled',
                artist: d.creator || 'Archive.org',
                url: `https://archive.org/download/${d.identifier}`,
                artwork: `https://archive.org/services/img/${d.identifier}`,
                source: 'archive' as const,
            }));
            setResults(tracks);
        } catch (e) {
            console.error('Archive search failed', e);
        }
        setIsSearching(false);
    };

    // Resolve actual mp3 URL from Archive identifier
    const resolveAndPlay = useCallback(async (track: OnlineTrack | SavedTrack) => {
        if (track.source === 'local') {
            playTrack({ id: track.id, url: track.url, title: track.title, artist: track.artist });
            return;
        }
        try {
            const res = await fetch(`https://archive.org/metadata/${track.id}`);
            const meta = await res.json();
            const mp3 = (meta.files || []).find((f: any) => f.format === 'VBR MP3' || (f.name || '').endsWith('.mp3'));
            const url = mp3 ? `https://archive.org/download/${track.id}/${encodeURIComponent(mp3.name)}` : track.url;
            playTrack({ id: track.id, url, title: track.title, artist: track.artist, artwork: track.artwork });
        } catch {
            playTrack({ id: track.id, url: track.url, title: track.title, artist: track.artist });
        }
    }, [playTrack]);

    const getTrackList = useCallback(() => {
        if (tab === 'player') return results;
        if (tab === 'library') return savedTracks;
        return localTracks;
    }, [tab, results, savedTracks, localTracks]);

    const playNext = useCallback(() => {
        if (!currentTrack) return;
        const list = getTrackList();
        if (list.length === 0) return;
        const currentIndex = list.findIndex(t => t.id === currentTrack.id);
        if (currentIndex !== -1 && currentIndex < list.length - 1) {
            resolveAndPlay(list[currentIndex + 1]);
        }
    }, [currentTrack, getTrackList, resolveAndPlay]);

    const playPrev = useCallback(() => {
        if (!currentTrack) return;
        const list = getTrackList();
        if (list.length === 0) return;
        const currentIndex = list.findIndex(t => t.id === currentTrack.id);
        if (currentIndex > 0) {
            resolveAndPlay(list[currentIndex - 1]);
        }
    }, [currentTrack, getTrackList, resolveAndPlay]);

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

    // Local file scanner
    const handleLocalFiles = async (files: FileList | null) => {
        if (!files) return;
        const tracks: OnlineTrack[] = Array.from(files).filter(f => f.type.startsWith('audio/')).map(f => ({
            id: URL.createObjectURL(f),
            title: f.name.replace(/\.[^.]+$/, ''),
            artist: 'Local File',
            url: URL.createObjectURL(f),
            source: 'archive' as const,
        }));
        setLocalTracks(prev => [...prev, ...tracks]);
        setTab('local');
    };

    const handleVolumeChange = (v: number) => {
        setLocalVolume(v);
        setVolume(v);
    };

    useEffect(() => { searchArchive(''); }, []);

    const isCurrentTrack = (t: OnlineTrack | SavedTrack) => currentTrack?.id === t.id;

    return (
        <div className="flex flex-col h-full bg-bg-primary animate-fade-in overflow-hidden">
            {/* Background gradient art */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />
            </div>

            {/* Header */}
            <header className="relative z-10 px-6 pt-12 pb-4 flex items-center justify-between">
                <button onClick={onBack} className="p-3 rounded-2xl bg-card border border-white/10 text-isabelline hover:text-accent transition-all">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div className="text-center">
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-isabelline">Music Hub</h2>
                    <p className="text-[10px] text-dun/50 font-bold">Your Personal Sound Engine</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowEq(p => !p)} className={`p-3 rounded-2xl border transition-all ${showEq ? 'bg-accent text-cafe border-accent' : 'bg-card border-white/10 text-dun hover:text-accent'}`}>
                        <SlidersIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-2xl bg-card border border-white/10 text-dun hover:text-accent transition-all">
                        <UploadIcon className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <input ref={fileInputRef} type="file" accept="audio/*" multiple className="hidden" onChange={e => handleLocalFiles(e.target.files)} />

            <div className="flex-grow overflow-y-auto no-scrollbar px-6 pb-32 space-y-5 relative z-10">

                {/* NOW PLAYING CARD */}
                {currentTrack && (
                    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-card shadow-2xl p-6">
                        {currentTrack.artwork && (
                            <div className="absolute inset-0 opacity-10">
                                <img src={currentTrack.artwork} className="w-full h-full object-cover blur-3xl scale-110" />
                            </div>
                        )}
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className={`w-24 h-24 rounded-3xl overflow-hidden border-2 shadow-xl transition-all duration-700 ${isPlaying ? 'border-accent scale-110 shadow-accent/30' : 'border-white/10'}`}>
                                    {currentTrack.artwork ? (
                                        <img src={currentTrack.artwork} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display='none')} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-bg-primary text-4xl">🎵</div>
                                    )}
                                </div>
                                {isPlaying && <div className="absolute -inset-1 rounded-3xl border-2 border-accent/30 animate-ping" />}
                            </div>
                            <div className="text-center">
                                <h3 className="font-black text-isabelline text-base truncate max-w-[240px]">{currentTrack.title}</h3>
                                <p className="text-xs text-dun/60 font-bold mt-1">{currentTrack.artist}</p>
                            </div>
                            <WaveVisualizer isPlaying={isPlaying} />
                            {/* Controls */}
                            <div className="flex items-center gap-5 mt-1">
                                <button 
                                    onClick={() => toggleLike({
                                        id: currentTrack.id,
                                        title: currentTrack.title,
                                        artist: currentTrack.artist || 'Unknown',
                                        url: currentTrack.url,
                                        artwork: currentTrack.artwork,
                                        source: 'archive'
                                    })}
                                    className={`p-2 transition-all ${isLiked(currentTrack.id) ? 'text-red-500 scale-125' : 'text-dun/40 hover:text-red-400'}`}
                                >
                                    <HeartIcon className={`w-6 h-6 ${isLiked(currentTrack.id) ? 'fill-current' : ''}`} />
                                </button>
                                <button 
                                    onClick={playPrev} 
                                    className="p-2 text-dun/40 hover:text-accent transition-all hover:scale-110 active:scale-90"
                                    title="Previous Track"
                                >
                                    <SkipBackIcon className="w-6 h-6 fill-current" />
                                </button>
                                <button onClick={togglePlay} className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 ${isPlaying ? 'bg-isabelline text-jet' : 'bg-accent text-cafe'}`}>
                                    {isPlaying ? <PauseIcon className="w-8 h-8 fill-current" /> : <PlayIcon className="w-8 h-8 fill-current ml-1" />}
                                </button>
                                <button 
                                    onClick={playNext} 
                                    className="p-2 text-dun/40 hover:text-accent transition-all hover:scale-110 active:scale-90"
                                    title="Next Track"
                                >
                                    <SkipForwardIcon className="w-6 h-6 fill-current" />
                                </button>
                                <button className="text-dun/40 hover:text-dun transition-colors"><ListIcon className="w-5 h-5" /></button>
                            </div>
                            {/* Volume */}
                            <div className="w-full flex items-center gap-3 px-2">
                                <Volume2Icon className="w-4 h-4 text-dun/40 shrink-0" />
                                <input
                                    type="range" min="0" max="1" step="0.01" value={volume}
                                    onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                                    className="flex-1 h-1 rounded-full appearance-none cursor-pointer accent-amber"
                                    style={{ background: `linear-gradient(to right, #f59e0b ${volume*100}%, rgba(255,255,255,0.1) ${volume*100}%)` }}
                                />
                                <span className="text-[10px] text-dun/40 font-mono w-8">{Math.round(volume*100)}%</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* EQ Panel */}
                {showEq && <Equalizer audioRef={audioRef as React.RefObject<HTMLAudioElement | null>} />}

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-card rounded-2xl">
                    {(['player', 'library', 'local'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${tab === t ? 'bg-accent text-cafe shadow-lg' : 'text-dun hover:bg-white/5'}`}>
                            {t === 'player' ? '🌐 Online' : t === 'library' ? '❤️ Saved' : '📱 Local'}
                        </button>
                    ))}
                </div>

                {tab === 'player' && (
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dun/40" />
                            <input
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && searchArchive(query)}
                                placeholder="Search music on Archive.org..."
                                className="w-full bg-card border border-white/5 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-isabelline outline-none focus:border-accent/40 placeholder-dun/30 font-bold"
                            />
                            <button onClick={() => searchArchive(query)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-accent text-cafe rounded-xl">
                                {isSearching ? <RefreshCwIcon className="w-3 h-3 animate-spin" /> : <SearchIcon className="w-3 h-3" />}
                            </button>
                        </div>
                        {/* Quick genre filters */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            {['Jazz', 'LoFi', 'Classical', 'Ambient', 'Afrobeats', 'Gospel', 'Bongo'].map(g => (
                                <button key={g} onClick={() => { setQuery(g); searchArchive(g); }}
                                    className="px-3 py-1.5 text-[10px] font-black uppercase bg-card border border-white/5 text-dun rounded-xl hover:border-accent/30 hover:text-accent whitespace-nowrap transition-all">
                                    {g}
                                </button>
                            ))}
                        </div>
                        {/* Results */}
                        {isSearching ? (
                            <div className="flex flex-col items-center py-10 gap-3 text-dun">
                                <SparklesIcon className="w-7 h-7 text-accent animate-pulse" />
                                <p className="text-xs font-bold">Scanning Archive.org...</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {results.map((track, i) => {
                                    const active = isCurrentTrack(track);
                                    const liked = isLiked(track.id);
                                    return (
                                        <div key={track.id} className="relative group animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
                                            <button onClick={() => resolveAndPlay(track)}
                                                className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${active ? 'bg-accent/10 border-accent/40' : 'bg-card/60 border-white/5 hover:border-white/20'}`}>
                                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-black shrink-0 ${active && isPlaying ? 'bg-accent text-cafe animate-pulse' : 'bg-bg-primary'}`}>
                                                    {active && isPlaying ? '▶' : track.title.charAt(0)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className={`font-bold text-sm truncate ${active ? 'text-accent' : 'text-isabelline'}`}>{track.title}</h4>
                                                    <p className="text-[10px] text-dun/50 truncate">{track.artist}</p>
                                                </div>
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleLike({...track, source: 'archive'}); }}
                                                className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 transition-all ${liked ? 'text-red-500 scale-110' : 'text-dun/20 hover:text-red-400 group-hover:text-dun/40'}`}
                                            >
                                                <HeartIcon className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'library' && (
                    <div className="space-y-4">
                        {savedTracks.length === 0 ? (
                            <div className="flex flex-col items-center py-16 gap-4 text-center">
                                <div className="text-4xl grayscale opacity-30">❤️</div>
                                <div>
                                    <p className="font-bold text-isabelline">Your Collection is Empty</p>
                                    <p className="text-xs text-dun/50 mt-1">Like tracks from Online to save them here</p>
                                </div>
                                <button onClick={() => setTab('player')} className="px-6 py-2.5 bg-accent text-cafe font-black text-[10px] uppercase rounded-xl">
                                    Explore Music
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {savedTracks.map((track, i) => {
                                    const active = isCurrentTrack(track);
                                    return (
                                        <div key={track.id} className="relative group animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
                                            <button onClick={() => resolveAndPlay(track)}
                                                className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${active ? 'bg-accent/10 border-accent/40' : 'bg-card/60 border-white/5 hover:border-white/20'}`}>
                                                <div className={`w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-bg-primary flex items-center justify-center`}>
                                                    {track.artwork ? <img src={track.artwork} className="w-full h-full object-cover" /> : <div className="text-lg">🎵</div>}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className={`font-bold text-sm truncate ${active ? 'text-accent' : 'text-isabelline'}`}>{track.title}</h4>
                                                    <p className="text-[10px] text-dun/50 truncate">{track.artist}</p>
                                                </div>
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-red-500 hover:scale-110 transition-all"
                                            >
                                                <HeartIcon className="w-4 h-4 fill-current" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'local' && (
                    <div className="space-y-4">
                        {localTracks.length === 0 ? (
                            <div className="flex flex-col items-center py-16 gap-4 text-center">
                                <div className="w-16 h-16 rounded-3xl bg-card border border-white/10 flex items-center justify-center text-3xl">📱</div>
                                <div>
                                    <p className="font-bold text-isabelline">No local music yet</p>
                                    <p className="text-xs text-dun/50 mt-1">Tap the upload button above to scan music from your phone</p>
                                </div>
                                <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-accent text-cafe font-black text-xs uppercase rounded-2xl hover:opacity-90">
                                    Browse Files
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {localTracks.map((track, i) => {
                                    const active = isCurrentTrack(track);
                                    return (
                                        <button key={track.id} onClick={() => playTrack({ id: track.id, url: track.url, title: track.title, artist: track.artist })}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${active ? 'bg-accent/10 border-accent/40' : 'bg-card/60 border-white/5 hover:border-white/20'}`}>
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 ${active && isPlaying ? 'bg-accent text-cafe animate-pulse' : 'bg-bg-primary'}`}>
                                                {active && isPlaying ? '▶' : '🎵'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className={`font-bold text-sm truncate ${active ? 'text-accent' : 'text-isabelline'}`}>{track.title}</h4>
                                                <p className="text-[10px] text-dun/50">Local File</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes wave { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }
            `}</style>
        </div>
    );
};
export default MusicHubScreen;
