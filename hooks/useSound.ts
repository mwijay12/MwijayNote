
import { useCallback, useRef, useEffect } from 'react';
import { useSettings } from './useSettings';

type SoundType = 'tap' | 'success' | 'nav' | 'error' | 'switch' | 'delete' | 'pop';

// Using reliable CDN sounds for demo purposes
const SOUND_URLS: Record<SoundType, string> = {
    tap: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73467.mp3', // Soft pop
    success: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3', // Chime
    nav: 'https://cdn.pixabay.com/audio/2022/03/24/audio_7849e7b231.mp3', // Swoosh
    error: 'https://cdn.pixabay.com/audio/2021/08/04/audio_c6ccf3232f.mp3', // Soft buzz
    switch: 'https://cdn.pixabay.com/audio/2022/03/15/audio_7315d0233e.mp3', // Click
    delete: 'https://cdn.pixabay.com/audio/2022/03/10/audio_55a297397b.mp3', // Crumple
    pop: 'https://cdn.pixabay.com/audio/2022/03/10/audio_1d0e51e704.mp3' // Bubble
};

export const useSound = () => {
    const { settings } = useSettings();
    const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

    // Preload sounds
    useEffect(() => {
        Object.entries(SOUND_URLS).forEach(([key, url]) => {
            if (!audioRefs.current[key]) {
                const audio = new Audio(url);
                audio.volume = 0.4; // Default decent volume
                audioRefs.current[key] = audio;
            }
        });
    }, []);

    const playSound = useCallback((type: SoundType) => {
        // Only play if Playful Mode is ON
        if (!settings.isPlayfulMode) return;

        const audio = audioRefs.current[type];
        if (audio) {
            // Reset time to allow rapid re-playing
            audio.currentTime = 0;
            audio.play().catch(e => {
                // Ignore auto-play restriction errors that might happen before first interaction
            });
        }
    }, [settings.isPlayfulMode]);

    return { playSound };
};
