import React from 'react';
import { SunIcon, MoonIcon } from './Icons';
import { useHaptics } from '../hooks/useHaptics';

interface DayNightSwitcherProps {
    isDark: boolean;
    onToggle: () => void;
}

const DayNightSwitcher: React.FC<DayNightSwitcherProps> = ({ isDark, onToggle }) => {
    const { triggerHaptic } = useHaptics();

    const handleToggle = () => {
        triggerHaptic('medium');
        onToggle();
    };

    return (
        <div className="w-full flex justify-center items-center py-4">
            <button 
                onClick={handleToggle}
                className={`group relative w-32 h-16 rounded-full transition-all duration-700 ease-in-out focus:outline-none shadow-[0_10px_40px_rgba(0,0,0,0.4)] border-2 overflow-hidden flex items-center ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-sky-400 border-white/50'}`}
                aria-label="Toggle Dark Mode"
            >
                {/* Background Details */}
                <div className={`absolute inset-0 transition-all duration-1000 ${isDark ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute top-3 left-8 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                    <div className="absolute bottom-5 left-12 w-0.5 h-0.5 bg-white rounded-full opacity-40 animate-pulse"></div>
                    <div className="absolute top-4 right-12 w-1 h-1 bg-white rounded-full"></div>
                </div>

                <div className={`absolute inset-0 transition-all duration-1000 ${isDark ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="absolute top-4 left-6 w-8 h-3 bg-white rounded-full opacity-40 blur-[2px]"></div>
                    <div className="absolute bottom-4 right-8 w-10 h-4 bg-white rounded-full opacity-30 blur-[2px]"></div>
                </div>

                {/* Rolling Content Container */}
                <div 
                    className={`absolute w-13 h-13 rounded-full shadow-2xl transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) flex items-center justify-center transform ${isDark ? 'translate-x-[4.2rem] bg-indigo-900 border border-indigo-400' : 'translate-x-1 bg-yellow-400 border-2 border-yellow-200'}`}
                    style={{ width: '3.25rem', height: '3.25rem' }}
                >
                    <div className={`relative w-full h-full flex items-center justify-center transition-transform duration-700 ${isDark ? 'rotate-[360deg]' : 'rotate-0'}`}>
                        {isDark ? (
                            <div className="animate-roll-in">
                                <MoonIcon className="w-7 h-7 text-indigo-100 fill-current shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                            </div>
                        ) : (
                            <div className="animate-roll-in">
                                <SunIcon className="w-8 h-8 text-orange-600 fill-current drop-shadow-md" />
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Indicator text */}
                <span className={`absolute left-5 text-[10px] font-black uppercase tracking-widest transition-opacity duration-500 ${isDark ? 'opacity-40 text-dun' : 'opacity-0'}`}>Light</span>
                <span className={`absolute right-5 text-[10px] font-black uppercase tracking-widest transition-opacity duration-500 ${isDark ? 'opacity-0' : 'opacity-40 text-white'}`}>Dark</span>
            </button>
        </div>
    );
};

export default DayNightSwitcher;
