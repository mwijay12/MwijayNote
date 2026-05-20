
import React, { useState, useMemo } from 'react';
import { XIcon, SearchIcon, MoonStarIcon } from './Icons';
import { dreamDictionary } from '../data/dreamDictionary';

interface DreamDictionaryModalProps {
    onClose: () => void;
}

const DreamDictionaryModal: React.FC<DreamDictionaryModalProps> = ({ onClose }) => {
    const [search, setSearch] = useState('');

    const filteredSymbols = useMemo(() => {
        return dreamDictionary.filter(item => 
            item.symbol.toLowerCase().includes(search.toLowerCase()) ||
            item.interpretation.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    return (
        <div className="fixed inset-0 bg-bg-primary/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-card w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-accent/20 rounded-full text-accent">
                                <MoonStarIcon className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-serif text-isabelline">Dream Dictionary</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-dun transition-colors">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dun" />
                        <input 
                            type="text" 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search symbol (e.g., Snake, Flying)"
                            className="w-full bg-jet/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-isabelline placeholder-dun focus:ring-2 focus:ring-amber/50 focus:outline-none transition-all"
                            autoFocus
                        />
                    </div>
                </div>
                
                <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {filteredSymbols.length > 0 ? (
                        filteredSymbols.map((item, idx) => (
                            <div key={idx} className="bg-jet/30 p-4 rounded-xl hover:bg-jet/50 transition-colors border border-white/5">
                                <h3 className="font-bold text-accent mb-1">{item.symbol}</h3>
                                <p className="text-sm text-dun leading-relaxed">{item.interpretation}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-dun">
                            <p>No symbols found matching "{search}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DreamDictionaryModal;
