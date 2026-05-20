
import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, ArrowLeftIcon, TerminalIcon, HomeIcon, CalendarIcon, UserIcon, SettingsIcon } from './Icons';
import { AppView, Theme } from '../types';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (view: AppView) => void;
    onThemeChange: (theme: Theme) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate, onThemeChange }) => {
    const [input, setInput] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const commands = [
        { id: 'home', label: 'Go to Home', icon: <HomeIcon className="w-4 h-4"/>, action: () => onNavigate(AppView.HOME) },
        { id: 'zen', label: 'Open Zen Mode', icon: <TerminalIcon className="w-4 h-4"/>, action: () => onNavigate(AppView.ZEN_MODE) },
        { id: 'terminal', label: 'Open Terminal', icon: <TerminalIcon className="w-4 h-4"/>, action: () => onNavigate(AppView.TERMINAL) },
        { id: 'calendar', label: 'Open Calendar', icon: <CalendarIcon className="w-4 h-4"/>, action: () => onNavigate(AppView.CALENDAR) },
        { id: 'profile', label: 'Open Profile', icon: <UserIcon className="w-4 h-4"/>, action: () => onNavigate(AppView.PROFILE) },
        { id: 'settings', label: 'Open Settings', icon: <SettingsIcon className="w-4 h-4"/>, action: () => onNavigate(AppView.SETTINGS) },
        { id: 'theme-matrix', label: 'Theme: Matrix', icon: <span className="w-4 h-4 rounded-full bg-green-500"/>, action: () => onThemeChange('terminal') },
        { id: 'theme-sunset', label: 'Theme: Sunset', icon: <span className="w-4 h-4 rounded-full bg-orange-500"/>, action: () => onThemeChange('sunset') },
        { id: 'theme-default', label: 'Theme: Default', icon: <span className="w-4 h-4 rounded-full bg-blue-900"/>, action: () => onThemeChange('default-dark') },
    ];

    const filteredCommands = commands.filter(c => c.label.toLowerCase().includes(input.toLowerCase()));

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setInput('');
            setActiveIndex(0);
        }
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[activeIndex]) {
                filteredCommands[activeIndex].action();
                onClose();
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="cmd-palette-overlay" onClick={onClose}>
            <div className="cmd-palette-modal" onClick={e => e.stopPropagation()}>
                <div className="flex items-center p-4 border-b border-white/10">
                    <SearchIcon className="w-5 h-5 text-dun mr-3" />
                    <input 
                        ref={inputRef}
                        type="text" 
                        className="flex-grow bg-transparent text-isabelline placeholder-dun focus:outline-none text-lg"
                        placeholder="Type a command..."
                        value={input}
                        onChange={e => { setInput(e.target.value); setActiveIndex(0); }}
                        onKeyDown={handleKeyDown}
                    />
                    <button onClick={onClose} className="text-xs bg-white/10 px-2 py-1 rounded text-dun">ESC</button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto py-2">
                    {filteredCommands.length === 0 ? (
                        <div className="p-4 text-center text-dun text-sm">No commands found.</div>
                    ) : (
                        filteredCommands.map((cmd, idx) => (
                            <button
                                key={cmd.id}
                                onClick={() => { cmd.action(); onClose(); }}
                                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${idx === activeIndex ? 'bg-accent/20 text-accent border-l-4 border-accent' : 'text-isabelline hover:bg-white/5'}`}
                                onMouseEnter={() => setActiveIndex(idx)}
                            >
                                <div className="text-dun">{cmd.icon}</div>
                                <span className="font-medium">{cmd.label}</span>
                            </button>
                        ))
                    )}
                </div>
                <div className="p-2 bg-black/20 text-[10px] text-dun flex justify-between px-4">
                    <span>Navigate with arrows</span>
                    <span>Enter to select</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
