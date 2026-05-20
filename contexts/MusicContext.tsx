import React, { createContext, useContext, ReactNode, RefObject } from 'react';
import { useMusicPlayer, Track, RepeatMode } from '../hooks/useMusicPlayer';

export interface MusicContextType {
    currentTrack: Track | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    playbackRate: number;
    repeatMode: RepeatMode;
    isShuffled: boolean;
    queue: Track[];
    currentIndex: number;
    audioContextRef: RefObject<AudioContext | null>;
    analyserRef: RefObject<AnalyserNode | null>;

    play: (track?: Track) => Promise<void>;
    pause: () => void;
    togglePlay: () => void;
    next: () => void;
    previous: () => void;
    seekTo: (seconds: number) => void;
    setVolume: (v: number) => void;
    toggleMute: () => void;
    setPlaybackRate: (rate: number) => void;
    setRepeatMode: () => void;
    toggleShuffle: () => void;
    loadQueue: (tracks: Track[], startIndex?: number) => void;
    addToQueue: (track: Track) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const music = useMusicPlayer();
    return (
        <MusicContext.Provider value={music}>
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = () => {
    const context = useContext(MusicContext);
    if (!context) {
        throw new Error('useMusic must be used within a MusicProvider');
    }
    return context;
};
