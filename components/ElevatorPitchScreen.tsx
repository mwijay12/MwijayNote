import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftIcon, MicIcon, StopIcon, SparklesIcon, FileTextIcon, WifiIcon } from './Icons';
import { analyzePitch, transcribeAudio } from '../services/geminiService';

interface ElevatorPitchScreenProps {
    onBack: () => void;
}

interface PitchTemplate {
    title: string;
    text: string;
    description: string;
}

const TEMPLATES: PitchTemplate[] = [
    {
        title: "🏍️ SalamaRide (BodaBoda Booking)",
        text: "Habari! Did you know that millions of Tanzanians rely on BodaBodas daily, yet safety remains a massive concern? SalamaRide is an offline-capable mobile booking app that verifies riders and tracks journeys. We have onboarded 500 local riders in Dar, reducing accidents by 45%. We are looking for seed partners to expand to Arusha next month.",
        description: "Transport tech pitch featuring safety statistics and traction."
    },
    {
        title: "☀️ ShambaSun (Solar Irrigation)",
        text: "Have you ever wondered how rural farmers survive during dry seasons? ShambaSun builds affordable, solar-powered drip irrigation kits for smallholders. Our kits save 60% of water and double crop yields. We have sold 150 kits in Morogoro, generating 12 million Shillings in revenue. We are looking for distributors to join our green revolution.",
        description: "Agritech pitch focusing on environmental impact and local yields."
    },
    {
        title: "🧠 SomaAI (Offline Swahili Tutor)",
        text: "Why should language be a barrier to high-quality education? SomaAI is a localized AI learning coach that works fully offline via light web views. We help high school students master programming and math in Swahili. Over 2,000 students have raised their grades by 25%. Join us in making learning accessible to all Tanzanians.",
        description: "Edtech pitch showcasing social impact and learning stats."
    }
];

const ElevatorPitchScreen: React.FC<ElevatorPitchScreenProps> = ({ onBack }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [analysis, setAnalysis] = useState<{ score: number, clarity: string, hook: string, advice: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Offline Input Mode
    const [inputMode, setInputMode] = useState<'Voice' | 'Text'>('Text');
    const [textPitch, setTextPitch] = useState('');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Local Grader for offline use
    const analyzePitchLocally = (pitch: string) => {
        const text = pitch.toLowerCase().trim();
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        
        let score = 40;
        let hasHook = false;
        let hasClarity = false;
        let hasMetrics = false;
        let hasCta = false;

        // Hook detector
        if (
            text.includes('did you know') || 
            text.includes('have you ever') || 
            text.includes('imagine') || 
            text.includes('what if') || 
            text.includes('million') || 
            text.includes('percent') || 
            text.includes('tanzania') ||
            text.includes('habari')
        ) {
            hasHook = true;
            score += 15;
        }

        // Clarity/Solution detector
        if (
            text.includes('solution') || 
            text.includes('we build') || 
            text.includes('we create') || 
            text.includes('provide') || 
            text.includes('platform') || 
            text.includes('app') || 
            text.includes('software') || 
            text.includes('help') || 
            text.includes('solve')
        ) {
            hasClarity = true;
            score += 20;
        }

        // Metrics/Numbers detector
        if (
            text.includes('percent') || 
            text.includes('%') || 
            text.includes('shilingi') || 
            text.includes('tsh') || 
            text.includes('$') || 
            text.includes('usd') || 
            text.includes('customers') || 
            text.includes('users') || 
            text.includes('revenue') || 
            text.includes('profit')
        ) {
            hasMetrics = true;
            score += 10;
        }

        // Call to action detector
        if (
            text.includes('join') || 
            text.includes('invest') || 
            text.includes('partner') || 
            text.includes('contact') || 
            text.includes('email') || 
            text.includes('website') || 
            text.includes('call')
        ) {
            hasCta = true;
            score += 10;
        }

        // Length grading
        if (wordCount >= 30 && wordCount <= 120) {
            score += 15;
        } else if (wordCount > 120 && wordCount < 180) {
            score += 5;
        } else if (wordCount < 15) {
            score -= 10;
        }

        // Keep bounds
        score = Math.max(20, Math.min(98, score));

        // Generate tailored reports
        const hookReport = hasHook 
            ? "Vibrant opening hook! Starting with a prompt or statistic captures attention immediately."
            : "Your opening is a bit flat. Try starting with a bold question (e.g. 'Did you know that...?') or an interesting market statistic.";

        const clarityReport = hasClarity
            ? "Excellent clarity. The listener understands your product or service and the core value you provide."
            : "Your value proposition is slightly vague. State clearly what solution you build early in the pitch.";

        let adviceReport = "";
        if (!hasCta) {
            adviceReport += "⚠️ Add a clear Call to Action at the end (e.g. 'Join our beta' or 'Here is my email'). ";
        }
        if (!hasMetrics) {
            adviceReport += "📈 Include simple target numbers or profit statistics to build instant credibility. ";
        }
        if (wordCount < 25) {
            adviceReport += "⏳ Your pitch is very short. Elaborate slightly more on the problem and target audience.";
        }
        if (hasHook && hasClarity && hasMetrics && hasCta) {
            adviceReport = "🌟 Outstanding Pitch! You have beautifully balanced an opening hook, clear solution statement, solid business metrics, and a direct call to action.";
        }

        return {
            score,
            hook: hookReport,
            clarity: clarityReport,
            advice: adviceReport || "Good pitch! Refine your delivery and pacing to sound extremely confident."
        };
    };

    const handleTextSubmit = async () => {
        if (!textPitch.trim()) return;
        setIsLoading(true);
        setTranscript(textPitch);
        
        if (!isOnline) {
            // Smart local grading simulation when offline
            setTimeout(() => {
                const localResult = analyzePitchLocally(textPitch);
                setAnalysis(localResult);
                setIsLoading(false);
            }, 800);
        } else {
            try {
                const result = await analyzePitch(textPitch);
                setAnalysis(result);
            } catch (e) {
                // Fail-safe to local grading
                const localResult = analyzePitchLocally(textPitch);
                setAnalysis(localResult);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const toggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            if (!isOnline) {
                alert("⚡ Online transcription requires a connection. Please use 'Type/Paste Pitch' mode below!");
                return;
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream);
                mediaRecorderRef.current = recorder;
                const chunks: Blob[] = [];
                recorder.ondataavailable = e => chunks.push(e.data);
                recorder.onstop = async () => {
                    stream.getTracks().forEach(t => t.stop());
                    const blob = new Blob(chunks, { type: 'audio/webm' });
                    setIsLoading(true);
                    
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        try {
                            const data = { name: 'pitch.webm', type: 'audio/webm', data: e.target?.result as string };
                            const text = await transcribeAudio(data);
                            setTranscript(text);
                            const result = await analyzePitch(text);
                            setAnalysis(result);
                        } catch (err) {
                            alert("API limit or connection issue. Defaulting to typed text grading.");
                        } finally {
                            setIsLoading(false);
                        }
                    };
                    reader.readAsDataURL(blob);
                };
                recorder.start();
                setIsRecording(true);
            } catch (e) {
                alert("Microphone access denied or unsupported.");
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-bg-primary p-4 pt-16 animate-fade-in relative overflow-y-auto pb-24">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6"/></button>
                <h2 className="text-xl font-serif ml-4">Elevator Pitch Coach</h2>
            </header>

            {/* CONNECTION STATE ALERTS */}
            <div className={`mb-4 flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                <WifiIcon className="w-4 h-4"/>
                <span>{isOnline ? 'Google Gemini AI Connected' : '⚡ Offline Smart Prep Mode Enabled'}</span>
            </div>

            {!analysis ? (
                <div className="flex-grow flex flex-col gap-6">
                    {/* TABS FOR INPUT */}
                    <div className="flex gap-2 bg-card/50 p-1.5 rounded-full border border-white/5 shrink-0">
                        <button 
                            onClick={() => setInputMode('Text')} 
                            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${inputMode === 'Text' ? 'bg-accent text-cafe' : 'text-dun hover:text-white'}`}
                        >
                            <FileTextIcon className="w-3.5 h-3.5"/> Type/Paste Pitch
                        </button>
                        <button 
                            onClick={() => {
                                if (!isOnline) {
                                    alert("⚡ Online connection needed to compile audio files. Let's use typed text pitch coaching!");
                                    return;
                                }
                                setInputMode('Voice');
                            }} 
                            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${inputMode === 'Voice' ? 'bg-accent text-cafe' : 'text-dun hover:text-white'} ${!isOnline ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                            <MicIcon className="w-3.5 h-3.5"/> Speak 30s Pitch
                        </button>
                    </div>

                    {inputMode === 'Voice' ? (
                        <div className="flex-grow flex flex-col items-center justify-center gap-6 py-8 bg-card/20 rounded-2xl border border-white/5">
                            <div className="text-center space-y-2 px-6">
                                <h3 className="text-xl font-bold text-isabelline">30 Seconds. Go.</h3>
                                <p className="text-dun text-xs">Record your startup idea or self-introduction now.</p>
                            </div>

                            <button 
                                onClick={toggleRecording}
                                className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-accent text-cafe hover:scale-105 shadow-xl'}`}
                            >
                                {isRecording ? <StopIcon className="w-10 h-10 text-white"/> : <MicIcon className="w-10 h-10"/>}
                            </button>

                            {isLoading && <div className="text-accent font-bold animate-pulse text-xs">Compiling & grading pitch...</div>}
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col gap-4">
                            <textarea 
                                value={textPitch}
                                onChange={e => setTextPitch(e.target.value)}
                                placeholder="Type or paste your elevator pitch here (e.g. 'Hello, my startup builds...')"
                                className="w-full h-40 bg-card p-4 rounded-2xl border border-white/15 outline-none focus:border-accent text-sm text-isabelline resize-none leading-relaxed"
                            />
                            
                            <button 
                                onClick={handleTextSubmit}
                                disabled={isLoading || !textPitch.trim()}
                                className="w-full py-3 bg-accent text-cafe font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-cafe border-t-transparent rounded-full animate-spin"/>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-4 h-4"/> Grade My Written Pitch
                                    </>
                                )}
                            </button>

                            {/* PITCH INSPIRATION TEMPLATES */}
                            <div className="space-y-2 mt-2">
                                <h4 className="text-xs font-bold text-dun uppercase tracking-wider px-1">Startup Ideas Templates</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {TEMPLATES.map((tpl, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => setTextPitch(tpl.text)}
                                            className="bg-card p-3 rounded-xl border border-white/5 hover:border-accent/40 text-left transition-all hover:bg-white/5"
                                        >
                                            <h5 className="text-xs font-bold text-accent">{tpl.title}</h5>
                                            <p className="text-[10px] text-dun mt-0.5">{tpl.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-grow overflow-y-auto space-y-6">
                    <div className="text-center">
                        <div className="inline-block p-6 rounded-full border-4 border-accent mb-4">
                            <span className="text-4xl font-bold text-isabelline">{analysis.score}</span>
                            <span className="text-sm text-dun block font-brand">/100</span>
                        </div>
                        <h3 className="text-xl font-serif text-accent">Pitch Coach Report</h3>
                    </div>

                    <div className="bg-card p-5 rounded-2xl border border-white/5 space-y-4">
                        <div>
                            <span className="text-[10px] font-bold text-dun uppercase tracking-wider block">Opening Hook</span>
                            <p className="text-sm text-isabelline mt-1 leading-relaxed">{analysis.hook}</p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-dun uppercase tracking-wider block">Value & Clarity</span>
                            <p className="text-sm text-isabelline mt-1 leading-relaxed">{analysis.clarity}</p>
                        </div>
                        <div className="bg-accent/10 p-4 rounded-xl border border-accent/20">
                            <span className="text-xs font-bold text-accent uppercase flex items-center gap-1"><SparklesIcon className="w-3.5 h-3.5"/> AI Career Advice</span>
                            <p className="text-sm text-isabelline mt-1.5 leading-relaxed">{analysis.advice}</p>
                        </div>
                    </div>

                    <div className="bg-card/45 p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] font-bold text-dun uppercase tracking-wider mb-2">Transcripted Pitch</p>
                        <p className="text-xs text-dun italic leading-relaxed">"{transcript}"</p>
                    </div>

                    <button onClick={() => setAnalysis(null)} className="w-full py-3 bg-accent text-cafe rounded-xl font-bold hover:opacity-90 shadow-md">Try Again</button>
                </div>
            )}
        </div>
    );
};

export default ElevatorPitchScreen;
