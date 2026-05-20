
import { useState, useEffect, useCallback } from 'react';

export interface SavedTrack {
    id: string;
    title: string;
    artist: string;
    url: string;
    artwork?: string;
    source: 'archive' | 'local';
    savedAt: string;
}

const STORAGE_KEY = 'mwijay_music_library';

export const useMusicLibrary = () => {
    const [savedTracks, setSavedTracks] = useState<SavedTrack[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setSavedTracks(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse music library", e);
            }
        }
    }, []);

    const saveTracks = (tracks: SavedTrack[]) => {
        setSavedTracks(tracks);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
    };

    const toggleLike = useCallback((track: Omit<SavedTrack, 'savedAt'>) => {
        setSavedTracks(prev => {
            const exists = prev.find(t => t.id === track.id);
            let next;
            if (exists) {
                next = prev.filter(t => t.id !== track.id);
            } else {
                next = [{ ...track, savedAt: new Date().toISOString() }, ...prev];
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const isLiked = useCallback((id: string) => {
        return savedTracks.some(t => t.id === id);
    }, [savedTracks]);

    return {
        savedTracks,
        toggleLike,
        isLiked
    };
};
