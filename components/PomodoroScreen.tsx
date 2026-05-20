import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, TimerIcon, PlayIcon, PauseIcon, RefreshCwIcon, CheckSquareIcon } from './Icons';
import { Preferences } from '@capacitor/preferences';

interface Preset {
    name: string;
    focus: number;
    break: number;
    description: string;
}

const PRESETS: Preset[] = [
    { name: 'Classic Pomodoro', focus: 25, break: 5, description: '25m work / 5m short break' },
    { name: 'Heavy Session', focus: 50, break: 10, description: '50m study / 10m long break' },
    { name: 'Sprint Booster', focus: 15, break: 3, description: '15m sprint / 3m lightning break' },
];

const PomodoroScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [presetIndex, setPresetIndex] = useState(0);
    const currentPreset = PRESETS[presetIndex];

    const [focusMinutes, setFocusMinutes] = useState(currentPreset.focus);
    const [breakMinutes, setBreakMinutes] = useState(currentPreset.break);

    const [timeLeft, setTimeLeft] = useState(focusMinutes * 60);
    const [totalDuration, setTotalDuration] = useState(focusMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'Work' | 'Break'>('Work');
    const [task, setTask] = useState('');
    const [isTaskSet, setIsTaskSet] = useState(false);
    
    // Stats persisted locally
    const [completedRounds, setCompletedRounds] = useState(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Custom Alarm Logic
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initial state loading
    useEffect(() => {
        const loadStats = async () => {
            try {
                const { value } = await Preferences.get({ key: 'mwijay_pomodoro_rounds' });
                if (value) setCompletedRounds(parseInt(value, 10));
            } catch (e) {
                console.warn('Error loading stats:', e);
            }
        };
        loadStats();
    }, []);

    // Sync timer when preset changes
    useEffect(() => {
        setFocusMinutes(currentPreset.focus);
        setBreakMinutes(currentPreset.break);
        const duration = (mode === 'Work' ? currentPreset.focus : currentPreset.break) * 60;
        setTimeLeft(duration);
        setTotalDuration(duration);
        setIsActive(false);
    }, [presetIndex, currentPreset]);

    const playAlarm = () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            if (!ctx) return;

            const t = ctx.currentTime;
            
            // Pretty Arpeggio (F# Major Seventh - high vibes)
            const notes = [369.99, 466.16, 554.37, 698.46, 739.99]; // F#4, A#4, C#5, F5, F#5
            
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, t + idx * 0.15);
                
                gain.gain.setValueAtTime(0.08, t + idx * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.15 + 1.2);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start(t + idx * 0.15);
                osc.stop(t + idx * 0.15 + 1.2);
            });
        } catch (err) {
            console.warn('Synthesizer sound play failed:', err);
        }
    };

    useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            playAlarm();
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 300]);
            
            if (mode === 'Work') {
                const newCount = completedRounds + 1;
                setCompletedRounds(newCount);
                Preferences.set({ key: 'mwijay_pomodoro_rounds', value: newCount.toString() });
                setShowSuccessModal(true);
            } else {
                // Switch back to Focus automatically
                switchMode('Work');
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode, completedRounds]);

    const toggleTimer = () => setIsActive(!isActive);
    
    const resetTimer = () => {
        setIsActive(false);
        const duration = (mode === 'Work' ? focusMinutes : breakMinutes) * 60;
        setTimeLeft(duration);
        setTotalDuration(duration);
    };

    const switchMode = (newMode: 'Work' | 'Break') => {
        setMode(newMode);
        setIsActive(false);
        const duration = (newMode === 'Work' ? focusMinutes : breakMinutes) * 60;
        setTimeLeft(duration);
        setTotalDuration(duration);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // SVG Progress Arc Calculations
    const radius = 100;
    const strokeWidth = 8;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const themeColorClass = mode === 'Work' ? 'text-rose-500' : 'text-emerald-500';
    const bgColorClass = mode === 'Work' ? 'bg-rose-950/20' : 'bg-emerald-950/20';
    const ringColor = mode === 'Work' ? 'stroke-rose-500' : 'stroke-emerald-500';

    return (
        <div className={`flex flex-col h-full p-4 pt-16 transition-all duration-700 ${bgColorClass} relative overflow-y-auto no-scrollbar`}>
            
            {/* Header */}
            <header className="flex items-center mb-6 justify-between shrink-0">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2 transition-colors">
                        <ArrowLeftIcon className="w-6 h-6 text-dun" />
                    </button>
                    <h2 className="text-xl font-brand font-black ml-4 flex items-center gap-2 text-isabelline uppercase tracking-wider">
                        <TimerIcon className="w-5 h-5 text-accent animate-pulse" /> Focus Center
                    </h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                    <span className="text-[10px] font-black text-accent uppercase tracking-widest">⏱️ Rounds:</span>
                    <span className="text-sm font-bold text-white font-mono">{completedRounds}</span>
                </div>
            </header>

            {/* Presets Grid */}
            <div className="grid grid-cols-3 gap-2 mb-6 shrink-0">
                {PRESETS.map((p, idx) => (
                    <button
                        key={idx}
                        onClick={() => { setPresetIndex(idx); }}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                            presetIndex === idx 
                                ? 'bg-accent/10 border-accent/40 shadow-lg' 
                                : 'bg-card border-white/5 opacity-60 hover:opacity-100'
                        }`}
                    >
                        <h4 className="font-bold text-xs text-white truncate">{p.name}</h4>
                        <p className="text-[9px] text-dun mt-1">{p.focus}m / {p.break}m</p>
                    </button>
                ))}
            </div>

            {/* Work vs Break Mode Selection Slider */}
            <div className="flex justify-center gap-3 mb-6 shrink-0 bg-black/20 p-1.5 rounded-full max-w-xs mx-auto border border-white/5">
                <button 
                    onClick={() => switchMode('Work')} 
                    className={`flex-1 py-2 rounded-full font-bold text-xs transition-all ${
                        mode === 'Work' 
                            ? 'bg-rose-600 text-white shadow-lg' 
                            : 'text-dun hover:text-white'
                    }`}
                >
                    🔥 Focus Mode
                </button>
                <button 
                    onClick={() => switchMode('Break')} 
                    className={`flex-1 py-2 rounded-full font-bold text-xs transition-all ${
                        mode === 'Break' 
                            ? 'bg-emerald-600 text-white shadow-lg' 
                            : 'text-dun hover:text-white'
                    }`}
                >
                    🌱 Break Mode
                </button>
            </div>

            {/* Main Interactive Ring Counter Container */}
            <div className="flex-grow flex flex-col items-center justify-center py-4 shrink-0">
                
                {/* Task Mission Statement Widget */}
                {mode === 'Work' && (
                    <div className="w-full max-w-xs mb-6 text-center animate-fade-in">
                        {!isTaskSet ? (
                            <div className="relative">
                                <input 
                                    value={task} 
                                    onChange={e => setTask(e.target.value)} 
                                    placeholder="Enter study mission..."
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-center text-sm text-isabelline outline-none focus:border-accent/40 transition-colors placeholder:text-dun/30"
                                    onKeyDown={e => { if (e.key === 'Enter') setIsTaskSet(true); }}
                                />
                                <button 
                                    onClick={() => setIsTaskSet(true)} 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-accent hover:text-white transition-colors"
                                >
                                    <CheckSquareIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        ) : (
                            <div 
                                onClick={() => setIsTaskSet(false)} 
                                className="bg-card p-3 rounded-2xl border border-white/5 shadow-md flex items-center justify-between px-5 hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                <div className="text-left">
                                    <p className="text-[9px] text-dun/50 uppercase tracking-widest font-black">Active Study Goal</p>
                                    <h3 className="text-sm font-bold text-white truncate max-w-[200px]">{task || 'Deep Study Session'}</h3>
                                </div>
                                <span className="text-[10px] text-accent font-black uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded-md">Edit</span>
                            </div>
                        )}
                    </div>
                )}

                {/* SVG Visual Timer Circle ring */}
                <div className="relative w-64 h-64 flex items-center justify-center mb-6">
                    <svg className="w-full h-full -rotate-90">
                        <circle
                            className="stroke-white/5 fill-transparent"
                            strokeWidth={strokeWidth}
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                            style={{ transform: `translate(${radius/4}px, ${radius/4}px)` }}
                        />
                        <circle
                            className={`fill-transparent transition-all duration-300 ${ringColor}`}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference + ' ' + circumference}
                            style={{
                                strokeDashoffset,
                                strokeLinecap: 'round',
                                transform: `translate(${radius/4}px, ${radius/4}px)`
                            }}
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                        />
                    </svg>
                    
                    {/* Centered Numbers */}
                    <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-[3.8rem] font-black font-mono leading-none tracking-tight text-white tabular-nums drop-shadow-lg">
                            {formatTime(timeLeft)}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-dun/40 mt-1">
                            {mode === 'Work' ? 'Focusing' : 'Resting'}
                        </span>
                    </div>
                </div>
                
                {/* Control Actions Panel */}
                <div className="flex gap-4 items-center">
                    <button 
                        onClick={resetTimer} 
                        className="w-12 h-12 bg-white/5 hover:bg-white/15 border border-white/10 rounded-full flex items-center justify-center hover:scale-105 transition-all text-dun hover:text-white"
                        title="Reset counter"
                    >
                        <RefreshCwIcon className="w-5 h-5"/>
                    </button>
                    <button 
                        onClick={toggleTimer} 
                        className={`w-20 h-20 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl ${
                            isActive 
                                ? 'bg-white text-black hover:bg-white/90' 
                                : 'bg-accent text-black hover:bg-accent/90'
                        }`}
                    >
                        {isActive ? <PauseIcon className="w-7 h-7"/> : <PlayIcon className="w-7 h-7 ml-1"/>}
                    </button>
                    <button 
                        onClick={() => {
                            // Fast forward timer by 10s for debug, or skip
                            setTimeLeft(3);
                        }}
                        className="w-12 h-12 bg-white/5 hover:bg-white/15 border border-white/10 rounded-full flex items-center justify-center hover:scale-105 transition-all text-dun/50 hover:text-white/80"
                        title="Skip to end (Debug/Test)"
                    >
                        <span className="text-xs font-black">⏩</span>
                    </button>
                </div>
            </div>

            {/* In-App Congratulations modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-6 animate-fade-in">
                    <div className="bg-card border border-accent/20 rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-accent to-emerald-500"></div>
                        <span className="text-5xl mb-4 block animate-bounce">🏆</span>
                        <h3 className="text-xl font-brand font-black text-white uppercase tracking-wider">Session Completed!</h3>
                        <p className="text-dun text-xs mt-2 px-2">
                            Congratulations! You crushed your focus target:
                        </p>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 my-3 text-xs italic text-accent truncate">
                            "{task || 'Deep Study Session'}"
                        </div>
                        <p className="text-[10px] text-dun/50 uppercase tracking-widest font-black">
                            Total Rounds Logged: {completedRounds}
                        </p>
                        <button 
                            onClick={() => {
                                setShowSuccessModal(false);
                                switchMode('Break');
                            }} 
                            className="w-full mt-4 bg-accent text-black font-black uppercase text-xs py-3 rounded-xl shadow-lg hover:bg-accent/90 transition-colors"
                        >
                            Take a Well-Earned Break
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PomodoroScreen;
