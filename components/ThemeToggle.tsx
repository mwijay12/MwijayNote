
import React from 'react';
import { SunIcon, MoonIcon } from './Icons';

interface ThemeToggleProps {
    isDark: boolean;
    onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
    return (
        <button 
            onClick={onToggle}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-isabelline transition-colors border border-white/5"
            aria-label="Toggle Theme"
        >
            {isDark ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5"/>}
        </button>
    );
};

export default ThemeToggle;
