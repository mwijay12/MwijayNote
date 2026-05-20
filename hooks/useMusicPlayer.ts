import { useState, useEffect, useRef, useCallback, RefObject } from 'react';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { MusicControl } from '../plugins/MusicControlPlugin';
import { useMediaSession } from './useMediaSession';

export interface Track {
    id: string;
    title: string;
    artist: string;
    album: string;
    src: string;
    artwork: string;
    duration?: number;
}

export type RepeatMode = 'none' | 'one' | 'all';

export const useMusicPlayer = () => {
    // Refs for non-rendering variables
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

    // React State elements
    const [queue, setQueue] = useState<Track[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [volume, setVolumeState] = useState<number>(0.8);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [playbackRate, setPlaybackRateState] = useState<number>(1.0);
    const [repeatMode, setRepeatModeState] = useState<RepeatMode>('none');
    const [isShuffled, setIsShuffled] = useState<boolean>(false);

    // Helper references to prevent stale states in event handlers
    const queueRef = useRef<Track[]>([]);
    const currentIndexRef = useRef<number>(-1);
    const currentTimeRef = useRef<number>(0);
    const repeatModeRef = useRef<RepeatMode>('none');
    const isShuffledRef = useRef<boolean>(false);
    const volumeRef = useRef<number>(0.8);

    useEffect(() => { queueRef.current = queue; }, [queue]);
    useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
    useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);
    useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
    useEffect(() => { isShuffledRef.current = isShuffled; }, [isShuffled]);
    useEffect(() => { volumeRef.current = volume; }, [volume]);

    // Initialize HTML5 Audio Element
    useEffect(() => {
        const audio = new Audio();
        audio.preload = 'metadata';
        audio.crossOrigin = 'anonymous';
        audioRef.current = audio;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            syncPositionState();
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration || 0);
            syncPositionState();
        };

        const handlePlay = () => {
            setIsPlaying(true);
            updateNativePlaybackState('playing');
        };

        const handlePause = () => {
            setIsPlaying(false);
            updateNativePlaybackState('paused');
        };

        const handleEnded = () => {
            handleTrackEnded();
        };

        const handleVolumeChange = () => {
            setVolumeState(audio.volume);
            setIsMuted(audio.muted);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('volumechange', handleVolumeChange);

        // Load saved state on start
        restoreSavedState();

        return () => {
            audio.pause();
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('volumechange', handleVolumeChange);
            
            if (Capacitor.isNativePlatform()) {
                MusicControl.destroy().catch(() => {});
            }
        };
    }, []);

    // Initial AudioContext Setup (Triggers after first user interaction to bypass autoplay)
    const initAudioGraph = useCallback(() => {
        if (audioContextRef.current || !audioRef.current) return;
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = context.createAnalyser();
            analyser.fftSize = 256;

            const source = context.createMediaElementSource(audioRef.current);
            source.connect(analyser);
            analyser.connect(context.destination);

            audioContextRef.current = context;
            analyserRef.current = analyser;
            sourceNodeRef.current = source;
            console.log('AudioGraph initialized successfully');
        } catch (e) {
            console.warn('Web Audio Graph connection bypassed:', e);
        }
    }, []);

    // Storage state saving triggers
    const saveState = useCallback(async () => {
        try {
            await Preferences.set({ key: 'music_queue', value: JSON.stringify(queueRef.current) });
            await Preferences.set({ key: 'music_index', value: String(currentIndexRef.current) });
            await Preferences.set({ key: 'music_volume', value: String(volumeRef.current) });
            await Preferences.set({ key: 'music_repeat', value: repeatModeRef.current });
            await Preferences.set({ key: 'music_shuffle', value: String(isShuffledRef.current) });
        } catch (e) {
            console.warn('Failed to save music settings:', e);
        }
    }, []);

    const restoreSavedState = useCallback(async () => {
        try {
            const savedQueue = await Preferences.get({ key: 'music_queue' });
            const savedIndex = await Preferences.get({ key: 'music_index' });
            const savedVol = await Preferences.get({ key: 'music_volume' });
            const savedRep = await Preferences.get({ key: 'music_repeat' });
            const savedShuf = await Preferences.get({ key: 'music_shuffle' });

            if (savedQueue.value) {
                const parsedQueue = JSON.parse(savedQueue.value);
                setQueue(parsedQueue);
                queueRef.current = parsedQueue;
            }

            if (savedIndex.value) {
                const index = parseInt(savedIndex.value, 10);
                if (index >= 0 && queueRef.current[index]) {
                    setCurrentIndex(index);
                    currentIndexRef.current = index;
                    setCurrentTrack(queueRef.current[index]);
                    if (audioRef.current) {
                        audioRef.current.src = queueRef.current[index].src;
                    }
                }
            }

            if (savedVol.value) {
                const vol = parseFloat(savedVol.value);
                setVolumeState(vol);
                if (audioRef.current) audioRef.current.volume = vol;
            }

            if (savedRep.value) {
                setRepeatModeState(savedRep.value as RepeatMode);
            }

            if (savedShuf.value) {
                setIsShuffled(savedShuf.value === 'true');
            }
        } catch (e) {
            console.warn('Failed to restore music settings:', e);
        }
    }, []);

    // Save playback position periodically
    useEffect(() => {
        const interval = setInterval(async () => {
            if (audioRef.current && isPlaying) {
                await Preferences.set({ key: 'music_position', value: String(audioRef.current.currentTime) });
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [isPlaying]);

    // Sync state with native plugins & MediaSession
    const updateNativeMetadata = useCallback((track: Track) => {
        if (Capacitor.isNativePlatform()) {
            MusicControl.updateMetadata({
                title: track.title,
                artist: track.artist,
                album: track.album,
                artworkUrl: track.artwork || '',
                duration: audioRef.current?.duration || 0
            }).catch(() => {});
        }
        updateSessionMetadata(track);
    }, []);

    const updateNativePlaybackState = useCallback((state: 'playing' | 'paused' | 'stopped') => {
        if (Capacitor.isNativePlatform()) {
            MusicControl.setPlaybackState({
                state,
                position: audioRef.current?.currentTime || 0,
                speed: audioRef.current?.playbackRate || 1.0
            }).catch(() => {});
        }
        updateSessionPlaybackState(state === 'playing' ? 'playing' : state === 'paused' ? 'paused' : 'none');
    }, []);

    // Core Playback Controls
    const play = useCallback(async (track?: Track) => {
        initAudioGraph();
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        const audio = audioRef.current;
        if (!audio) return;

        if (track) {
            // Find track in queue
            const index = queueRef.current.findIndex(t => t.id === track.id);
            if (index !== -1) {
                setCurrentIndex(index);
                currentIndexRef.current = index;
            } else {
                // Add to queue and play
                const newQueue = [...queueRef.current, track];
                setQueue(newQueue);
                queueRef.current = newQueue;
                const newIdx = newQueue.length - 1;
                setCurrentIndex(newIdx);
                currentIndexRef.current = newIdx;
            }

            setCurrentTrack(track);
            audio.src = track.src;
            audio.load();
            updateNativeMetadata(track);
        }

        try {
            await audio.play();
            updateNativePlaybackState('playing');
        } catch (e) {
            console.warn('Playback request aborted:', e);
        }
    }, [initAudioGraph, updateNativeMetadata, updateNativePlaybackState]);

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            updateNativePlaybackState('paused');
        }
    }, [updateNativePlaybackState]);

    const togglePlay = useCallback(() => {
        if (isPlaying) {
            pause();
        } else {
            if (currentTrack) {
                play();
            } else if (queueRef.current.length > 0) {
                play(queueRef.current[0]);
            }
        }
    }, [isPlaying, currentTrack, play, pause]);

    const next = useCallback(() => {
        if (queueRef.current.length === 0) return;

        let nextIdx = currentIndexRef.current + 1;
        if (isShuffledRef.current) {
            nextIdx = Math.floor(Math.random() * queueRef.current.length);
        } else if (nextIdx >= queueRef.current.length) {
            nextIdx = repeatModeRef.current === 'all' ? 0 : -1;
        }

        if (nextIdx !== -1 && queueRef.current[nextIdx]) {
            play(queueRef.current[nextIdx]);
        } else {
            pause();
        }
    }, [play, pause]);

    const previous = useCallback(() => {
        if (queueRef.current.length === 0) return;

        let prevIdx = currentIndexRef.current - 1;
        if (isShuffledRef.current) {
            prevIdx = Math.floor(Math.random() * queueRef.current.length);
        } else if (prevIdx < 0) {
            prevIdx = repeatModeRef.current === 'all' ? queueRef.current.length - 1 : 0;
        }

        if (queueRef.current[prevIdx]) {
            play(queueRef.current[prevIdx]);
        }
    }, [play]);

    const seekTo = useCallback((seconds: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = seconds;
            setCurrentTime(seconds);
            syncPositionState();
        }
    }, []);

    const setVolume = useCallback((v: number) => {
        const bounded = Math.max(0, Math.min(1, v));
        setVolumeState(bounded);
        if (audioRef.current) {
            audioRef.current.volume = bounded;
            audioRef.current.muted = bounded === 0;
        }
        saveState();
    }, [saveState]);

    const toggleMute = useCallback(() => {
        if (audioRef.current) {
            const nextMuted = !audioRef.current.muted;
            audioRef.current.muted = nextMuted;
            setIsMuted(nextMuted);
        }
    }, []);

    const setPlaybackRate = useCallback((rate: number) => {
        setPlaybackRateState(rate);
        if (audioRef.current) {
            audioRef.current.playbackRate = rate;
            syncPositionState();
        }
    }, []);

    const setRepeatMode = useCallback(() => {
        const modes: RepeatMode[] = ['none', 'all', 'one'];
        const nextIdx = (modes.indexOf(repeatModeRef.current) + 1) % modes.length;
        const nextMode = modes[nextIdx];
        setRepeatModeState(nextMode);
        repeatModeRef.current = nextMode;
        saveState();
    }, [saveState]);

    const toggleShuffle = useCallback(() => {
        const nextShuf = !isShuffledRef.current;
        setIsShuffled(nextShuf);
        isShuffledRef.current = nextShuf;
        saveState();
    }, [saveState]);

    const loadQueue = useCallback((tracks: Track[], startIndex = 0) => {
        setQueue(tracks);
        queueRef.current = tracks;
        if (tracks[startIndex]) {
            setCurrentIndex(startIndex);
            currentIndexRef.current = startIndex;
            play(tracks[startIndex]);
        }
        saveState();
    }, [play, saveState]);

    const addToQueue = useCallback((track: Track) => {
        const exists = queueRef.current.find(t => t.id === track.id);
        if (!exists) {
            const newQueue = [...queueRef.current, track];
            setQueue(newQueue);
            queueRef.current = newQueue;
            saveState();
        }
    }, [saveState]);

    const handleTrackEnded = useCallback(() => {
        if (repeatModeRef.current === 'one') {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => {});
            }
        } else {
            next();
        }
    }, [next]);

    // Setup MediaSession handlers
    const { updateMetadata: updateSessionMetadata, updatePlaybackState: updateSessionPlaybackState, updatePositionState: updateSessionPositionState } = useMediaSession(
        useCallback(() => { play(); }, [play]),
        useCallback(() => { pause(); }, [pause]),
        useCallback(() => { next(); }, [next]),
        useCallback(() => { previous(); }, [previous]),
        useCallback((seconds: number) => { seekTo(seconds); }, [seekTo])
    );

    const syncPositionState = useCallback(() => {
        if (audioRef.current) {
            updateSessionPositionState({
                duration: audioRef.current.duration || 0,
                playbackRate: audioRef.current.playbackRate,
                position: audioRef.current.currentTime
            });
        }
    }, [updateSessionPositionState]);

    // Register Capacitor Native Event Listeners
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        let playListener: any;
        let pauseListener: any;
        let nextListener: any;
        let prevListener: any;
        let seekListener: any;
        let focusLossListener: any;
        let focusDuckListener: any;

        const setupListeners = async () => {
            const mc = MusicControl as any;
            if (mc.addListener) {
                playListener = await mc.addListener('play', () => {
                    play();
                });
                pauseListener = await mc.addListener('pause', () => {
                    pause();
                });
                nextListener = await mc.addListener('next', () => {
                    next();
                });
                prevListener = await mc.addListener('previous', () => {
                    previous();
                });
                seekListener = await mc.addListener('seek', (data: { position: number }) => {
                    seekTo(data.position);
                });
                focusLossListener = await mc.addListener('audioFocusLoss', () => {
                    pause();
                });
                focusDuckListener = await mc.addListener('audioFocusDuck', (data: { volume: number }) => {
                    if (audioRef.current) {
                        audioRef.current.volume = data.volume;
                    }
                });
            }
        };

        setupListeners();

        return () => {
            if (playListener) playListener.remove();
            if (pauseListener) pauseListener.remove();
            if (nextListener) nextListener.remove();
            if (prevListener) prevListener.remove();
            if (seekListener) seekListener.remove();
            if (focusLossListener) focusLossListener.remove();
            if (focusDuckListener) focusDuckListener.remove();
        };
    }, [play, pause, next, previous, seekTo]);

    return {
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playbackRate,
        repeatMode,
        isShuffled,
        queue,
        currentIndex,
        audioContextRef,
        analyserRef,

        play,
        pause,
        togglePlay,
        next,
        previous,
        seekTo,
        setVolume,
        toggleMute,
        setPlaybackRate,
        setRepeatMode,
        toggleShuffle,
        loadQueue,
        addToQueue
    };
};
