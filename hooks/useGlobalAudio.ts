
import { useState, useEffect, useRef, useCallback } from 'react';

export interface AudioTrack {
    id: string;
    url: string;
    title: string;
    artist?: string;
    artwork?: string;
    isLive?: boolean;
}

/** Shared AudioContext & EQ nodes – created once, exposed app-wide */
export interface EqNodes {
    context: AudioContext;
    source: MediaElementAudioSourceNode | null;
    bands: BiquadFilterNode[]; // 60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz
    analyser: AnalyserNode;
}

// Singleton so the audio context survives re-renders
let _eqNodes: EqNodes | null = null;
let _sourceConnected = false;

export const getEqNodes = (): EqNodes | null => _eqNodes;

const EQ_FREQUENCIES = [60, 230, 910, 3600, 14000];

const initEqGraph = (audio: HTMLAudioElement): EqNodes => {
    if (_eqNodes) return _eqNodes;

    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = context.createMediaElementSource(audio);
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;

    // Create 5-band EQ
    const bands: BiquadFilterNode[] = EQ_FREQUENCIES.map((freq, i) => {
        const filter = context.createBiquadFilter();
        filter.type = i === 0 ? 'lowshelf' : i === EQ_FREQUENCIES.length - 1 ? 'highshelf' : 'peaking';
        filter.frequency.value = freq;
        filter.gain.value = 0;
        filter.Q.value = 1.0;
        return filter;
    });

    // Chain: source → band0 → band1 → ... → analyser → destination
    source.connect(bands[0]);
    for (let i = 0; i < bands.length - 1; i++) {
        bands[i].connect(bands[i + 1]);
    }
    bands[bands.length - 1].connect(analyser);
    analyser.connect(context.destination);
    _sourceConnected = true;

    _eqNodes = { context, source, bands, analyser };
    return _eqNodes;
};

export const useGlobalAudio = () => {
    const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentTrackRef = useRef<AudioTrack | null>(null);
    const isPlayingRef = useRef(false);

    // Keep refs in sync for use inside callbacks
    useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

    // Initialize Audio Element once
    useEffect(() => {
        if (!audioRef.current) {
            try {
                const a = new Audio();
                a.crossOrigin = 'anonymous';
                a.preload = 'auto';
                audioRef.current = a;
            } catch (e) {
                console.error('Audio init failed', e);
            }
        }

        const audio = audioRef.current;
        if (!audio) return;

        const handlePlay = () => {
            setIsPlaying(true);
            updateMediaSessionState('playing');
        };
        const handlePause = () => {
            setIsPlaying(false);
            updateMediaSessionState('paused');
        };
        const handleWaiting = () => setIsBuffering(true);
        const handleCanPlay = () => setIsBuffering(false);
        const handleEnded = () => {
            setIsPlaying(false);
            updateMediaSessionState('paused');
        };

        let retryCount = 0;
        const MAX_RETRIES = 3;
        const handleError = () => {
            setIsBuffering(false);
            if (retryCount < MAX_RETRIES && currentTrackRef.current) {
                retryCount++;
                console.log(`Stream error – retrying (${retryCount}/${MAX_RETRIES})`);
                setTimeout(() => {
                    audio.load();
                    audio.play().catch(err => console.warn('Retry failed:', err));
                }, 2000);
            } else {
                setIsPlaying(false);
            }
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('playing', handleCanPlay);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        // Network monitoring
        import('@capacitor/network').then(({ Network }) => {
            Network.addListener('networkStatusChange', status => {
                if (!status.connected) {
                    audio.pause();
                } else if (isPlayingRef.current && audio.paused) {
                    audio.play().catch(e => console.warn('Resume after reconnect failed:', e));
                }
            });
        }).catch(() => {});

        // Setup Media Session handlers
        setupSessionHandlers();

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('playing', handleCanPlay);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, []);

    const setupSessionHandlers = useCallback(() => {
        if (!('mediaSession' in navigator)) return;
        const audio = audioRef.current;
        if (!audio) return;
        try {
            navigator.mediaSession.setActionHandler('play', () => {
                audio.play().catch(e => console.warn('Native play error:', e));
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                audio.pause();
            });
            navigator.mediaSession.setActionHandler('stop', () => {
                audio.pause();
                audio.currentTime = 0;
                setIsPlaying(false);
            });
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                window.dispatchEvent(new CustomEvent('media-prev'));
            });
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                window.dispatchEvent(new CustomEvent('media-next'));
            });
            navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                try { audio.currentTime = Math.max(audio.currentTime - (details.seekOffset || 10), 0); } catch (e) {}
            });
            navigator.mediaSession.setActionHandler('seekforward', (details) => {
                try { audio.currentTime = Math.min(audio.currentTime + (details.seekOffset || 10), audio.duration || 0); } catch (e) {}
            });
            try {
                (navigator.mediaSession as any).setActionHandler('seekto', (details: any) => {
                    if (details.seekTime !== undefined && audio.duration) {
                        audio.currentTime = details.seekTime;
                    }
                });
            } catch (e) {}
        } catch (e) {
            console.warn('Media Session API Setup Failed', e);
        }
    }, []);

    const updateMediaSessionState = (state: 'playing' | 'paused' | 'none') => {
        if ('mediaSession' in navigator) {
            try { navigator.mediaSession.playbackState = state; } catch (e) {}
        }
    };

    // Update Lock Screen / Notification Metadata whenever track changes
    useEffect(() => {
        if (!currentTrack || !('mediaSession' in navigator)) return;
        try {
            if ('MediaMetadata' in window) {
                const artwork = currentTrack.artwork
                    ? [
                        { src: currentTrack.artwork, sizes: '96x96', type: 'image/jpeg' },
                        { src: currentTrack.artwork, sizes: '512x512', type: 'image/jpeg' },
                      ]
                    : [{ src: 'https://cdn-icons-png.flaticon.com/512/1251/1251671.png', sizes: '512x512', type: 'image/png' }];

                navigator.mediaSession.metadata = new (window as any).MediaMetadata({
                    title: currentTrack.title,
                    artist: currentTrack.artist || 'Mwijay Note',
                    album: currentTrack.isLive ? '🔴 Live Radio' : '🎵 Music Hub',
                    artwork,
                });

                if (isPlaying) {
                    navigator.mediaSession.playbackState = 'playing';
                }

                // Re-sync handlers after metadata update
                setupSessionHandlers();
            }
        } catch (e) {
            console.warn('Metadata update failed', e);
        }
    }, [currentTrack, isPlaying, setupSessionHandlers]);

    // Update Android foreground service notification with track info
    useEffect(() => {
        import('@capacitor/core').then(({ registerPlugin, Capacitor }) => {
            if (!Capacitor.isNativePlatform()) return;
            const MediaControl = registerPlugin<any>('MediaControl');
            if (!MediaControl) return;
            if (currentTrack) {
                MediaControl.startService({
                    title: currentTrack.title,
                    artist: currentTrack.artist || 'Mwijay Note',
                    artwork: currentTrack.artwork || '',
                    isPlaying: isPlaying,
                }).catch(() => MediaControl.startService({ isPlaying }));
            } else {
                MediaControl.stopService().catch(() => {});
            }
        }).catch(() => {});
    }, [isPlaying, currentTrack]);

    // Listen for Native Controls (lock screen / notification buttons)
    useEffect(() => {
        let listener: any;
        import('@capacitor/core').then(({ registerPlugin, Capacitor }) => {
            if (!Capacitor.isNativePlatform()) return;
            const MediaControl = registerPlugin<any>('MediaControl');
            if (MediaControl && (MediaControl as any).addListener) {
                listener = (MediaControl as any).addListener('mediaAction', (data: { action: string }) => {
                    if (data.action === 'play') {
                        audioRef.current?.play().catch(console.warn);
                    } else if (data.action === 'pause') {
                        audioRef.current?.pause();
                    } else if (data.action === 'next') {
                        window.dispatchEvent(new CustomEvent('media-next'));
                    } else if (data.action === 'previous') {
                        window.dispatchEvent(new CustomEvent('media-prev'));
                    }
                });
            }
        }).catch(() => {});
        return () => { if (listener) listener.remove(); };
    }, []);

    const playTrack = useCallback(async (track: AudioTrack) => {
        const audio = audioRef.current;
        if (!audio) return;

        // Resume context on user gesture (required by browsers)
        if (_eqNodes?.context.state === 'suspended') {
            _eqNodes.context.resume().catch(() => {});
        }

        if (currentTrackRef.current?.id === track.id) {
            if (isPlayingRef.current) {
                audio.pause();
            } else {
                audio.play().catch(e => console.error('Resume failed:', e));
            }
            return;
        }

        try {
            setIsBuffering(true);
            setCurrentTrack(track);

            audio.pause();
            audio.src = track.url;
            audio.load();

            // Initialize EQ graph (only first time)
            try {
                if (!_eqNodes) initEqGraph(audio);
            } catch (e) {
                console.warn('EQ graph init failed (likely already connected):', e);
            }

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Auto-play prevented or stream failed:', error);
                    setIsBuffering(false);
                    setIsPlaying(false);
                });
            }
        } catch (e) {
            console.error('Playback init failed', e);
            setIsBuffering(false);
        }
    }, []);

    const togglePlay = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // Resume context on user gesture
        if (_eqNodes?.context.state === 'suspended') {
            _eqNodes.context.resume().catch(() => {});
        }

        if (isPlayingRef.current) {
            audio.pause();
        } else {
            audio.play().catch(console.warn);
        }
    }, []);

    const stop = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.src = '';
        }
        setCurrentTrack(null);
        setIsPlaying(false);
        updateMediaSessionState('none');

        import('@capacitor/core').then(({ registerPlugin, Capacitor }) => {
            if (Capacitor.isNativePlatform()) {
                const MediaControl = registerPlugin<any>('MediaControl');
                if (MediaControl) MediaControl.stopService().catch(() => {});
            }
        }).catch(() => {});
    }, []);

    const setVolume = useCallback((volume: number) => {
        if (audioRef.current) {
            audioRef.current.volume = Math.max(0, Math.min(1, volume));
        }
    }, []);

    return {
        currentTrack,
        isPlaying,
        isBuffering,
        playTrack,
        togglePlay,
        stop,
        setVolume,
        audioRef,
    };
};
