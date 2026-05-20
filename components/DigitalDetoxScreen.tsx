
import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, LockIcon, ClockIcon, AlertTriangle } from './Icons';

const DigitalDetoxScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [showQuitModal, setShowQuitModal] = useState(false);
    const [quitReason, setQuitReason] = useState('');

    useEffect(() => {
        let interval: any;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            alert("Detox Complete! Well done.");
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const startDetox = (mins: number) => {
        if(confirm(`Are you sure? All app features will be locked for ${mins} minutes.`)) {
            setTimeLeft(mins * 60);
            setIsActive(true);
        }
    };
    
    const handleEmergencyQuit = () => {
        if (!quitReason.trim()) {
            alert("Please provide a valid reason for breaking your commitment.");
            return;
        }
        setIsActive(false);
        setShowQuitModal(false);
        setQuitReason('');
    };

    return (
        <div className={`flex flex-col h-full p-4 pt-16 transition-colors duration-1000 ${isActive ? 'bg-black' : 'bg-jet'} relative`}>
            {/* Strict Modal */}
            {showQuitModal && (
                <div className="fixed inset-0 z-50 bg-red-900/90 flex items-center justify-center p-6 animate-fade-in backdrop-blur-md">
                    <div className="bg-black border border-red-500 p-6 rounded-2xl w-full max-w-sm text-center shadow-2xl">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 animate-bounce" />
                        <h3 className="text-xl font-bold text-white mb-2">Emergency Exit</h3>
                        <p className="text-sm text-gray-400 mb-4">Breaking a detox weakens your discipline. Why must you leave?</p>
                        <input 
                            value={quitReason}
                            onChange={e => setQuitReason(e.target.value)}
                            placeholder="I need to leave because..."
                            className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg text-white mb-4 focus:border-red-500 outline-none"
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowQuitModal(false)} className="flex-1 py-3 bg-gray-800 rounded-lg text-white font-bold">Stay</button>
                            <button onClick={handleEmergencyQuit} className="flex-1 py-3 bg-red-600 rounded-lg text-white font-bold">Quit</button>
                        </div>
                    </div>
                </div>
            )}

            {!isActive && (
                <header className="flex items-center mb-8">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                    <h2 className="text-xl font-serif ml-4">Digital Detox</h2>
                </header>
            )}

            <div className="flex-grow flex flex-col items-center justify-center text-center">
                {isActive ? (
                    <div className="animate-pulse flex flex-col items-center">
                        <LockIcon className="w-24 h-24 text-gray-700 mx-auto mb-8"/>
                        <h1 className="text-7xl font-mono text-white font-bold tracking-tighter">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</h1>
                        <p className="text-gray-500 mt-6 font-serif italic">"Disconnect to Reconnect."</p>
                        <p className="text-xs text-gray-800 mt-12 uppercase tracking-widest font-bold">Mwijay Note Locked</p>
                        
                        <button onClick={() => setShowQuitModal(true)} className="mt-20 text-red-900/50 hover:text-red-500 text-xs uppercase tracking-widest border border-red-900/30 px-4 py-2 rounded transition-colors">
                            Emergency Override
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 w-full max-w-xs">
                        <ClockIcon className="w-16 h-16 text-accent mx-auto"/>
                        <h3 className="text-2xl font-bold text-isabelline">Dopamine Fast</h3>
                        <p className="text-dun text-sm">Lock the app features to force focus on the real world.</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => startDetox(30)} className="py-4 bg-card border border-white/5 rounded-xl hover:bg-accent/10 hover:border-accent/50 transition-all font-bold text-isabelline">30m</button>
                            <button onClick={() => startDetox(60)} className="py-4 bg-card border border-white/5 rounded-xl hover:bg-accent/10 hover:border-accent/50 transition-all font-bold text-isabelline">1h</button>
                            <button onClick={() => startDetox(120)} className="py-4 bg-card border border-white/5 rounded-xl hover:bg-accent/10 hover:border-accent/50 transition-all font-bold text-isabelline">2h</button>
                            <button onClick={() => startDetox(360)} className="py-4 bg-card border border-white/5 rounded-xl hover:bg-accent/10 hover:border-accent/50 transition-all font-bold text-isabelline">6h</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default DigitalDetoxScreen;
