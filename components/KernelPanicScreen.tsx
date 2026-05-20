
import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCwIcon } from './Icons';

interface KernelPanicScreenProps {
    onBack: () => void;
}

const KernelPanicScreen: React.FC<KernelPanicScreenProps> = ({ onBack }) => {
    const [step, setStep] = useState<'panic' | 'dump' | 'reboot' | 'safe'>('panic');
    const [text, setText] = useState('');
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        if (step === 'panic') {
            const interval = setInterval(() => {
                setLogs(prev => [...prev, `ERROR: Anxiety overflow at 0x${Math.floor(Math.random()*100000).toString(16)}`, `WARNING: Cortisol levels critical`, `SYSTEM UNSTABLE...`]);
            }, 200);
            return () => clearInterval(interval);
        }
    }, [step]);

    const handleDump = () => {
        if (text.trim()) {
            setStep('reboot');
            setLogs([]);
        }
    };

    const handleReboot = () => {
        setStep('safe');
    };

    return (
        <div className="flex flex-col h-full bg-blue-900 text-white p-8 font-mono animate-fade-in overflow-hidden">
            {step === 'panic' && (
                <div className="flex flex-col h-full justify-center items-center text-center">
                    <div className="text-6xl mb-4">:(</div>
                    <h1 className="text-2xl mb-4">Your system ran into a problem.</h1>
                    <div className="h-32 overflow-hidden w-full max-w-md text-left opacity-50 text-xs bg-blue-950 p-2 rounded mb-4">
                        {logs.map((l, i) => <div key={i}>{l}</div>)}
                    </div>
                    <p className="mb-8 text-sm">We need to dump the emotional core to prevent crash.</p>
                    <button onClick={() => setStep('dump')} className="bg-white text-blue-900 px-6 py-3 font-bold rounded hover:opacity-90">INITIATE CORE DUMP</button>
                </div>
            )}

            {step === 'dump' && (
                <div className="flex flex-col h-full animate-slide-in-from-bottom">
                    <h2 className="text-xl mb-4">CORE DUMP IN PROGRESS...</h2>
                    <p className="text-sm mb-2 opacity-80">Type out everything stressing you out. Don't filter.</p>
                    <textarea 
                        className="flex-grow bg-blue-950 p-4 text-white outline-none resize-none border border-blue-400 rounded"
                        placeholder="System log..."
                        value={text}
                        onChange={e => setText(e.target.value)}
                        autoFocus
                    />
                    <button onClick={handleDump} className="mt-4 bg-white text-blue-900 px-6 py-3 font-bold rounded self-end">PURGE & RESTART</button>
                </div>
            )}

            {step === 'reboot' && (
                <div className="flex flex-col h-full justify-center items-center animate-pulse">
                    <RefreshCwIcon className="w-16 h-16 mb-4 animate-spin-slow"/>
                    <h2 className="text-2xl">Rebooting System...</h2>
                    <p className="mt-4 text-sm">Breathe in... Breathe out...</p>
                    <button onClick={handleReboot} className="mt-8 border border-white px-6 py-2 rounded hover:bg-white/10">Enter Safe Mode</button>
                </div>
            )}

            {step === 'safe' && (
                <div className="flex flex-col h-full justify-center items-center animate-fade-in">
                    <div className="text-green-400 text-6xl mb-4">OK</div>
                    <h2 className="text-2xl">System Stable</h2>
                    <p className="mt-2 opacity-80">You are safe now.</p>
                    <button onClick={onBack} className="mt-8 bg-white text-blue-900 px-6 py-3 font-bold rounded">Return to OS</button>
                </div>
            )}
        </div>
    );
};

export default KernelPanicScreen;
