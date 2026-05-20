
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, GlobeIcon, BookOpenIcon, PlusIcon, Volume2Icon, TrashIcon, SparklesIcon } from './Icons';
import { TargetLanguage } from '../types';
import { textToSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';

interface LanguageSettingsScreenProps {
    currentLanguage: TargetLanguage;
    onSetLanguage: (lang: TargetLanguage) => void;
    onBack: () => void;
}

interface VocabWord {
    id: string;
    word: string;
    meaning: string;
    notes?: string;
    language: TargetLanguage;
}

const LanguageOption: React.FC<{ 
    lang: TargetLanguage; 
    flag: string; 
    isSelected: boolean; 
    onClick: () => void;
}> = ({ lang, flag, isSelected, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex-1 flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${isSelected ? 'bg-accent text-cafe border-accent shadow-lg scale-105' : 'bg-card/50 backdrop-blur-md border-white/5 text-dun hover:text-isabelline hover:bg-white/10'}`}
    >
        <span className="text-3xl mb-1">{flag}</span>
        <span className="text-xs font-bold uppercase tracking-wide">{lang}</span>
    </button>
);

const LanguageSettingsScreen: React.FC<LanguageSettingsScreenProps> = ({ currentLanguage, onSetLanguage, onBack }) => {
    const [vocabList, setVocabList] = useState<VocabWord[]>([]);
    const [newWord, setNewWord] = useState('');
    const [newMeaning, setNewMeaning] = useState('');
    const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Load from local storage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('mwijay_custom_vocab');
            if (stored) {
                setVocabList(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load vocabulary", e);
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('mwijay_custom_vocab', JSON.stringify(vocabList));
    }, [vocabList]);

    const handleAddWord = () => {
        if (!newWord.trim() || !newMeaning.trim()) return;
        const word: VocabWord = {
            id: Date.now().toString(),
            word: newWord.trim(),
            meaning: newMeaning.trim(),
            language: currentLanguage
        };
        setVocabList(prev => [word, ...prev]);
        setNewWord('');
        setNewMeaning('');
    };

    const handleDeleteWord = (id: string) => {
        setVocabList(prev => prev.filter(w => w.id !== id));
    };

    const handleSpeak = async (text: string, id: string) => {
        if (isSpeaking) return;
        setIsSpeaking(id);
        
        try {
            // Determine voice based on language roughly (Gemini voices are limited but we can try)
            const voice = 'Zephyr'; 
            const audioData = await textToSpeech(text, voice);
            
            if (audioData) {
                if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                }
                const ctx = audioContextRef.current;
                const decodedBytes = decode(audioData);
                const audioBuffer = await decodeAudioData(decodedBytes, ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.onended = () => setIsSpeaking(null);
                source.start();
            } else {
                setIsSpeaking(null);
            }
        } catch (e) {
            console.error("TTS Failed", e);
            setIsSpeaking(null);
        }
    };

    const filteredVocab = vocabList.filter(v => v.language === currentLanguage);

    return (
        <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-transparent">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                <h2 className="text-xl font-serif ml-4 flex items-center gap-2">
                    <GlobeIcon className="w-5 h-5 text-green-400"/> Language Hub
                </h2>
            </header>

            <div className="flex-grow overflow-y-auto space-y-6 pb-20 no-scrollbar">
                
                {/* Language Selection */}
                <div>
                    <h3 className="text-xs font-bold text-dun uppercase tracking-widest mb-3 px-2">Target Language</h3>
                    <div className="flex gap-3">
                        <LanguageOption lang="French" flag="🇫🇷" isSelected={currentLanguage === 'French'} onClick={() => onSetLanguage('French')} />
                        <LanguageOption lang="English" flag="🇺🇸" isSelected={currentLanguage === 'English'} onClick={() => onSetLanguage('English')} />
                        <LanguageOption lang="Swahili" flag="🇹🇿" isSelected={currentLanguage === 'Swahili'} onClick={() => onSetLanguage('Swahili')} />
                    </div>
                </div>

                {/* Dictionary Builder */}
                <div className="bg-card/60 backdrop-blur-md p-5 rounded-3xl border border-white/10">
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="font-bold text-isabelline flex items-center gap-2"><BookOpenIcon className="w-5 h-5 text-accent"/> My Dictionary</h3>
                         <span className="text-xs bg-black/20 px-2 py-1 rounded text-dun">{filteredVocab.length} words</span>
                    </div>
                    
                    <div className="flex flex-col gap-3 mb-4">
                        <input 
                            value={newWord}
                            onChange={e => setNewWord(e.target.value)}
                            placeholder={`Word in ${currentLanguage}...`}
                            className="bg-jet/60 p-3 rounded-xl text-sm border border-white/5 focus:border-accent focus:ring-1 focus:ring-amber outline-none transition-colors backdrop-blur-sm"
                        />
                        <input 
                            value={newMeaning}
                            onChange={e => setNewMeaning(e.target.value)}
                            placeholder="Meaning / Translation..."
                            className="bg-jet/60 p-3 rounded-xl text-sm border border-white/5 focus:border-accent focus:ring-1 focus:ring-amber outline-none transition-colors backdrop-blur-sm"
                        />
                        <button 
                            onClick={handleAddWord}
                            disabled={!newWord || !newMeaning}
                            className="bg-accent text-cafe font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg"
                        >
                            <PlusIcon className="w-5 h-5"/> Add to Dictionary
                        </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                        {filteredVocab.length === 0 ? (
                            <p className="text-center text-dun text-xs py-4">No words added yet. Start building your vocabulary!</p>
                        ) : (
                            filteredVocab.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-3 bg-jet/40 rounded-xl border border-white/5 group backdrop-blur-sm">
                                    <div>
                                        <p className="font-bold text-isabelline">{item.word}</p>
                                        <p className="text-xs text-dun">{item.meaning}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleSpeak(item.word, item.id)}
                                            disabled={isSpeaking !== null}
                                            className={`p-2 rounded-full hover:bg-white/10 ${isSpeaking === item.id ? 'text-accent animate-pulse' : 'text-dun hover:text-accent'}`}
                                        >
                                            <Volume2Icon className="w-4 h-4"/>
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteWord(item.id)}
                                            className="p-2 rounded-full hover:bg-white/10 text-dun hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <TrashIcon className="w-4 h-4"/>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Learning Stats / Tips */}
                <div className="bg-blue-500/10 backdrop-blur-md border border-blue-500/20 p-5 rounded-2xl flex items-start gap-4">
                    <SparklesIcon className="w-6 h-6 text-blue-400 mt-1 shrink-0"/>
                    <div>
                        <h4 className="font-bold text-blue-300 text-sm mb-1">Mastery Tip</h4>
                        <p className="text-xs text-blue-200/80 leading-relaxed">
                            Try to use your new {currentLanguage} words in your daily journal entries. Context helps memory retention!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LanguageSettingsScreen;
