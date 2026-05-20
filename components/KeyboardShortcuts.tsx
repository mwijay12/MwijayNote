
import React from 'react';
import { ArrowLeftIcon, KeyboardIcon } from './Icons';

const KeyboardShortcuts: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const shortcuts = [
        { key: 'Ctrl + J', action: 'New Journal' },
        { key: 'Ctrl + /', action: 'Search' },
        { key: 'Esc', action: 'Close Modal' },
        { key: 'Ctrl + S', action: 'Save Entry' },
        { key: 'Alt + Z', action: 'Zen Mode' },
    ];

    return (
        <div className="flex flex-col h-full bg-jet p-4 pt-16">
            <header className="flex items-center mb-8">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6"/></button>
                <h2 className="text-xl font-serif ml-4">Keyboard Shortcuts</h2>
            </header>
            <div className="space-y-2">
                {shortcuts.map(s => (
                    <div key={s.key} className="flex justify-between p-4 bg-card rounded-xl border border-white/5">
                        <span className="text-isabelline">{s.action}</span>
                        <code className="bg-black/40 px-2 py-1 rounded text-accent font-mono text-sm">{s.key}</code>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default KeyboardShortcuts;
