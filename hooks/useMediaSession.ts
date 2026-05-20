import { useEffect, useCallback } from 'react';

export interface MediaSessionTrack {
    title: string;
    artist: string;
    album: string;
    artwork: string;
}

export const useMediaSession = (
    onPlay: () => void,
    onPause: () => void,
    onNext: () => void,
    onPrevious: () => void,
    onSeek: (seconds: number) => void
) => {
    const isSupported = typeof window !== 'undefined' && 'mediaSession' in navigator;

    const updateMetadata = useCallback((track: MediaSessionTrack) => {
        if (!isSupported) return;
        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title,
                artist: track.artist,
                album: track.album,
                artwork: [
                    { src: track.artwork || 'https://cdn-icons-png.flaticon.com/512/1251/1251671.png', sizes: '96x96', type: 'image/png' },
                    { src: track.artwork || 'https://cdn-icons-png.flaticon.com/512/1251/1251671.png', sizes: '128x128', type: 'image/png' },
                    { src: track.artwork || 'https://cdn-icons-png.flaticon.com/512/1251/1251671.png', sizes: '192x192', type: 'image/png' },
                    { src: track.artwork || 'https://cdn-icons-png.flaticon.com/512/1251/1251671.png', sizes: '256x256', type: 'image/png' },
                    { src: track.artwork || 'https://cdn-icons-png.flaticon.com/512/1251/1251671.png', sizes: '384x384', type: 'image/png' },
                    { src: track.artwork || 'https://cdn-icons-png.flaticon.com/512/1251/1251671.png', sizes: '512x512', type: 'image/png' },
                ]
            });
        } catch (e) {
            console.warn('Failed to update MediaSession metadata:', e);
        }
    }, [isSupported]);

    const updatePlaybackState = useCallback((state: 'playing' | 'paused' | 'none') => {
        if (!isSupported) return;
        try {
            navigator.mediaSession.playbackState = state;
        } catch (e) {
            console.warn('Failed to update MediaSession playbackState:', e);
        }
    }, [isSupported]);

    const updatePositionState = useCallback((positionDetails: { duration: number; playbackRate: number; position: number }) => {
        if (!isSupported) return;
        if (!('setPositionState' in navigator.mediaSession)) return;
        try {
            // Ensure no NaN or infinite values are passed to native layer
            const duration = isFinite(positionDetails.duration) && positionDetails.duration > 0 ? positionDetails.duration : 0;
            const position = isFinite(positionDetails.position) && positionDetails.position >= 0 ? positionDetails.position : 0;
            const playbackRate = isFinite(positionDetails.playbackRate) && positionDetails.playbackRate > 0 ? positionDetails.playbackRate : 1.0;

            if (position <= duration) {
                navigator.mediaSession.setPositionState({
                    duration,
                    playbackRate,
                    position
                });
            }
        } catch (e) {
            console.warn('Failed to set position state in MediaSession:', e);
        }
    }, [isSupported]);

    // Connect navigator actions to JS triggers
    useEffect(() => {
        if (!isSupported) return;

        try {
            navigator.mediaSession.setActionHandler('play', onPlay);
            navigator.mediaSession.setActionHandler('pause', onPause);
            navigator.mediaSession.setActionHandler('stop', onPause);
            navigator.mediaSession.setActionHandler('nexttrack', onNext);
            navigator.mediaSession.setActionHandler('previoustrack', onPrevious);
            
            navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                const offset = details.seekOffset || 10;
                onSeek(Math.max(0, offset)); // Custom seek trigger
            });

            navigator.mediaSession.setActionHandler('seekforward', (details) => {
                const offset = details.seekOffset || 10;
                onSeek(offset); // Custom forward trigger
            });

            try {
                navigator.mediaSession.setActionHandler('seekto', (details) => {
                    if (details.seekTime !== undefined) {
                        onSeek(details.seekTime);
                    }
                });
            } catch (e) {
                // seekto is not supported on older browsers/webviews
            }
        } catch (e) {
            console.warn('Error setting MediaSession handlers:', e);
        }

        return () => {
            if (!isSupported) return;
            const actions: MediaSessionAction[] = ['play', 'pause', 'stop', 'nexttrack', 'previoustrack', 'seekbackward', 'seekforward', 'seekto'];
            actions.forEach(act => {
                try {
                    navigator.mediaSession.setActionHandler(act, null);
                } catch (e) {}
            });
        };
    }, [isSupported, onPlay, onPause, onNext, onPrevious, onSeek]);

    return {
        updateMetadata,
        updatePlaybackState,
        updatePositionState
    };
};
