import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, MicIcon, StopIcon } from './Icons';
import { GoogleGenAI, Modality } from '@google/genai';
import type { LiveServerMessage, Blob as GenAIBlob } from '@google/genai';
import { decode, encode, decodeAudioData } from '../utils/audioUtils';
import { TranscriptionEntry } from '../types';
import { getCurrentKey } from '../services/geminiService';

// --- Dynamic Visualizer Component ---
const LiveVisualizer: React.FC<{ isActive: boolean; isThinking: boolean; isModelSpeaking: boolean }> = ({ isActive, isThinking, isModelSpeaking }) => {
    return (
        <div className="flex items-center justify-center gap-1.5 h-16 w-full px-12">
            {[...Array(15)].map((_, i) => (
                <div
                    key={i}
                    className="w-1.5 rounded-full transition-all duration-300"
                    style={{
                        backgroundColor: isModelSpeaking ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                        height: isActive 
                            ? (isThinking ? `${Math.sin(Date.now() / 200 + i) * 30 + 50}%` : `${Math.random() * 80 + 20}%`) 
                            : '10%',
                        opacity: isActive ? (isModelSpeaking ? 1 : 0.6) : 0.2,
                        animation: isActive ? `wave ${0.5 + (i % 5) * 0.1}s ease-in-out infinite alternate` : 'none',
                        animationDelay: `${i * 40}ms`
                    }}
                />
            ))}
        </div>
    );
};

const AiLiveConversationScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [statusText, setStatusText] = useState("Tap the mic to start");
    const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([]);
    
    // Real-time feedback states
    const [realtimeUser, setRealtimeUser] = useState('');
    const [realtimeModel, setRealtimeModel] = useState('');
    const [isModelSpeaking, setIsModelSpeaking] = useState(false);
    
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const sessionRef = useRef<any | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

    const stopSession = () => {
        setIsConnecting(false);
        setIsSessionActive(false);
        setIsModelSpeaking(false);

        sessionRef.current?.close();
        sessionRef.current = null;
        sessionPromiseRef.current = null;

        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;

        if (scriptProcessorRef.current && mediaStreamSourceRef.current && audioContextRef.current) {
            try {
                mediaStreamSourceRef.current.disconnect(scriptProcessorRef.current);
                scriptProcessorRef.current.disconnect(audioContextRef.current.destination);
            } catch (e) { console.warn("Error disconnecting audio nodes:", e); }
        }
        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current = null;
        
        audioContextRef.current?.close().then(() => audioContextRef.current = null);
        outputAudioContextRef.current?.close().then(() => outputAudioContextRef.current = null);
        
        sourcesRef.current.forEach(source => source.stop());
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        
        setStatusText("Tap the mic to start");
    };

    const handleBack = () => {
        stopSession();
        onBack();
    };

    useEffect(() => {
        return () => {
            stopSession();
        };
    }, []);

    const startSession = async () => {
        setIsConnecting(true);
        setStatusText("Connecting...");
        setTranscriptionHistory([]);

        try {
            const apiKey = getCurrentKey();

            if (!apiKey) {
                setStatusText("API Key not found.");
                setIsConnecting(false);
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const ai = new GoogleGenAI({ apiKey });

            if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                callbacks: {
                    onopen: () => {
                        console.log('Session opened.');
                        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        }
                        
                        const source = audioContextRef.current.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;
                        const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(audioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64EncodedAudioString && outputAudioContextRef.current) {
                            setIsModelSpeaking(true);
                            const outputCtx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputCtx, 24000, 1);
                            const sourceNode = outputCtx.createBufferSource();
                            sourceNode.buffer = audioBuffer;
                            sourceNode.connect(outputCtx.destination);
                            sourceNode.addEventListener('ended', () => { 
                                sourcesRef.current.delete(sourceNode); 
                                if (sourcesRef.current.size === 0) setIsModelSpeaking(false);
                            });
                            sourceNode.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(sourceNode);
                        }

                        if (message.serverContent?.inputTranscription) {
                            setRealtimeUser(prev => prev + message.serverContent.inputTranscription.text);
                        }
                        if (message.serverContent?.outputTranscription) {
                            setRealtimeModel(prev => prev + message.serverContent.outputTranscription.text);
                        }
                        if (message.serverContent?.turnComplete) {
                            const fullInput = realtimeUser;
                            const fullOutput = realtimeModel;
                            
                            setRealtimeUser('');
                            setRealtimeModel('');
                            
                            if(fullInput.trim() || fullOutput.trim()) {
                                setTranscriptionHistory(prev => [...prev, { id: Date.now(), user: fullInput, model: fullOutput }]);
                            }
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        setStatusText("Error. Please try again.");
                        stopSession();
                    },
                    onclose: (e: CloseEvent) => {
                        console.log('Session closed.');
                        stopSession();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    outputAudioTranscription: {},
                    inputAudioTranscription: {},
                },
            });
            sessionPromiseRef.current = sessionPromise;

            sessionRef.current = await sessionPromise;
            setIsConnecting(false);
            setIsSessionActive(true);
            setStatusText("Listening...");

        } catch (error) {
            console.error("Failed to start session:", error);
            setStatusText("Mic access denied. Please enable permissions.");
            setIsConnecting(false);
            stopSession();
        }
    };

    const createBlob = (data: Float32Array): GenAIBlob => {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }
        return {
            data: encode(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
        };
    };

    return (
        <div className="flex flex-col h-full bg-bg-primary animate-fade-in relative">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-accent/5 rounded-full blur-[120px] -mr-[30vw] -mt-[30vw] pointer-events-none"></div>

            <header className="flex items-center p-6 pt-12 shrink-0 z-10">
                <button onClick={handleBack} className="p-3 rounded-2xl bg-card border border-white/10 text-isabelline hover:text-accent transition-all">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div className="mx-auto text-center">
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-accent">Live Neural Stream</h2>
                    <p className="text-[10px] text-dun/50 font-bold uppercase mt-0.5">Gemini 2.5 Flash Native</p>
                </div>
                <div className="w-12"></div>
            </header>

            <div className="flex-grow p-6 overflow-y-auto space-y-6 no-scrollbar">
                 {transcriptionHistory.length === 0 && !isSessionActive && !isConnecting && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-dun/40 animate-fade-in">
                        <MicIcon className="w-12 h-12 opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-widest">Initialization Ready</p>
                    </div>
                )}

                {transcriptionHistory.map(entry => (
                    <div key={entry.id} className="space-y-3 animate-slide-up">
                        {entry.user && (
                            <div className="flex justify-end">
                                <div className="p-4 bg-accent text-cafe rounded-[2rem] rounded-tr-sm max-w-[85%] text-sm font-bold shadow-xl shadow-accent/10">
                                    {entry.user}
                                </div>
                            </div>
                        )}
                        {entry.model && (
                            <div className="flex justify-start">
                                <div className="p-4 bg-card text-isabelline rounded-[2rem] rounded-tl-sm border border-white/5 max-w-[85%] text-sm leading-relaxed shadow-xl">
                                    {entry.model}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Real-time transcription display */}
                {(realtimeUser || realtimeModel) && (
                    <div className="space-y-3 animate-pulse-slow">
                        {realtimeUser && (
                            <div className="flex justify-end opacity-70">
                                <div className="p-4 bg-accent/50 text-cafe rounded-[2rem] rounded-tr-sm max-w-[85%] text-sm font-bold italic">
                                    {realtimeUser}
                                </div>
                            </div>
                        )}
                        {realtimeModel && (
                            <div className="flex justify-start opacity-70">
                                <div className="p-4 bg-card/50 text-isabelline rounded-[2rem] rounded-tl-sm border border-white/5 max-w-[85%] text-sm italic">
                                    {realtimeModel}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-8 pb-12 flex flex-col items-center gap-8 bg-gradient-to-t from-bg-primary to-transparent">
                <div className="w-full max-w-xs bg-card rounded-3xl border border-white/10 p-4 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <LiveVisualizer isActive={isSessionActive} isThinking={isConnecting} isModelSpeaking={isModelSpeaking} />
                    <p className="text-[10px] font-black uppercase text-center tracking-[0.2em] text-dun/60 mt-2">{statusText}</p>
                </div>

                <button
                    onClick={isSessionActive ? stopSession : startSession}
                    disabled={isConnecting}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-[0_0_50px_rgba(0,0,0,0.5)] active:scale-90 ${isSessionActive ? 'bg-red-500 border-4 border-red-400/20' : 'bg-accent border-4 border-accent/20'}`}
                >
                    {isConnecting ? (
                        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        isSessionActive ? <StopIcon className="w-10 h-10 text-white fill-current"/> : <MicIcon className="w-10 h-10 text-cafe fill-current"/>
                    )}
                </button>
            </div>
            
            <style>{`
                @keyframes wave { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }
            `}</style>
        </div>
    );
};
export default AiLiveConversationScreen;
