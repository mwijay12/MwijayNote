
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { PlayIcon, PauseIcon, XIcon, Volume2Icon, RefreshCwIcon } from './Icons';
import { textToSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { AiVoice } from '../types';

export interface TTSPlayerRef {
    speak: (text: string, voice: AiVoice) => Promise<void>;
    stop: () => void;
}

const TTSPlayer = forwardRef<TTSPlayerRef, {}>((props, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const startedAtRef = useRef(0);
    const pausedAtRef = useRef(0);
    const bufferRef = useRef<AudioBuffer | null>(null);

    useImperativeHandle(ref, () => ({
        speak: async (text: string, voice: AiVoice) => {
            stopPlayback(); // Stop any current audio
            setIsVisible(true);
            setIsLoading(true);

            try {
                const audioData = await textToSpeech(text, voice);
                if (audioData) {
                    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                    }
                    const ctx = audioContextRef.current;
                    const decodedBytes = decode(audioData);
                    const audioBuffer = await decodeAudioData(decodedBytes, ctx, 24000, 1);
                    bufferRef.current = audioBuffer;
                    playFrom(0);
                }
            } catch (error) {
                console.error("TTS Error:", error);
                setIsVisible(false);
            } finally {
                setIsLoading(false);
            }
        },
        stop: stopPlayback
    }));

    const playFrom = (offset: number) => {
        if (!audioContextRef.current || !bufferRef.current) return;
        
        const ctx = audioContextRef.current;
        
        // Ensure context is running
        if(ctx.state === 'suspended') {
            ctx.resume();
        }

        const source = ctx.createBufferSource();
        source.buffer = bufferRef.current;
        source.playbackRate.value = playbackRate;
        source.connect(ctx.destination);
        
        source.onended = () => {
            setIsPlaying(false);
            // Only hide if we reached the end naturally, not paused
            // Note: playbackRate affects duration check, simplifying here
            if (!audioSourceRef.current) {
                 setIsVisible(false);
            }
        };

        source.start(0, offset);
        audioSourceRef.current = source;
        startedAtRef.current = ctx.currentTime - (offset / playbackRate);
        pausedAtRef.current = 0;
        setIsPlaying(true);
    };

    const pausePlayback = () => {
        if (audioSourceRef.current && audioContextRef.current) {
            audioSourceRef.current.stop();
            audioSourceRef.current = null;
            pausedAtRef.current = (audioContextRef.current.currentTime - startedAtRef.current) * playbackRate;
            setIsPlaying(false);
        }
    };

    const resumePlayback = () => {
        if (bufferRef.current) {
            playFrom(pausedAtRef.current);
        }
    };

    function stopPlayback() {
        if (audioSourceRef.current) {
            try {
                audioSourceRef.current.stop();
            } catch(e) {} // Ignore if already stopped
        }
        audioSourceRef.current = null;
        setIsPlaying(false);
        setIsVisible(false);
        pausedAtRef.current = 0;
        bufferRef.current = null;
    }

    const togglePlay = () => {
        if (isPlaying) {
            pausePlayback();
        } else {
            resumePlayback();
        }
    };

    const cycleSpeed = () => {
        const speeds = [1, 1.25, 1.5, 2];
        const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
        const newRate = speeds[nextIndex];
        setPlaybackRate(newRate);
        
        if (isPlaying && audioSourceRef.current) {
            // Update rate on the fly if supported, else restart
            audioSourceRef.current.playbackRate.value = newRate;
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 left-0 right-0 flex justify-center z-50 pointer-events-none animate-slide-in-from-bottom">
            <div className="bg-card/80 backdrop-blur-xl border border-accent/20 shadow-2xl rounded-full px-4 py-2 flex items-center gap-4 pointer-events-auto min-w-[200px]">
                
                {/* Visualizer / Loading Indicator */}
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <div className={`flex gap-0.5 items-end h-4 ${isPlaying ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`w-1 bg-accent rounded-full ${isPlaying ? 'animate-music-bar-1' : 'h-2'}`}></div>
                            <div className={`w-1 bg-accent rounded-full ${isPlaying ? 'animate-music-bar-2' : 'h-3'}`}></div>
                            <div className={`w-1 bg-accent rounded-full ${isPlaying ? 'animate-music-bar-3' : 'h-1.5'}`}></div>
                            <div className={`w-1 bg-accent rounded-full ${isPlaying ? 'animate-music-bar-1' : 'h-4'}`}></div>
                        </div>
                    )}
                </div>

                <div className="flex-grow flex flex-col justify-center mr-2">
                    <span className="text-xs font-bold text-accent uppercase tracking-wide">Mwijay AI</span>
                    <span className="text-[10px] text-isabelline/70">{isPlaying ? 'Reading...' : 'Paused'}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                    <button onClick={cycleSpeed} className="text-[10px] font-bold text-dun hover:text-white w-8">{playbackRate}x</button>
                    <button 
                        onClick={togglePlay} 
                        disabled={isLoading}
                        className="p-2 rounded-full bg-isabelline text-jet hover:scale-105 transition-transform"
                    >
                        {isPlaying ? <PauseIcon className="w-4 h-4 fill-current" /> : <PlayIcon className="w-4 h-4 fill-current" />}
                    </button>
                    <button 
                        onClick={stopPlayback} 
                        className="p-2 rounded-full hover:bg-white/10 text-dun transition-colors"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
});

export default TTSPlayer;
