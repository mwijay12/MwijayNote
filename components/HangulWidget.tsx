
import React, { useState, useEffect, useRef } from 'react';
import { RefreshCwIcon, CardsIcon, MicIcon, SparklesIcon } from './Icons';
import { getVocabularyWord, evaluatePronunciation } from '../services/geminiService';

interface HangulWidgetProps {
    onSaveToDeck?: (front: string, back: string) => void;
}

const HangulWidget: React.FC<HangulWidgetProps> = ({ onSaveToDeck }) => {
    const [wordData, setWordData] = useState<{ word: string; pronunciation: string; meaning: string; example: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [language, setLanguage] = useState<'Korean' | 'English'>('Korean');
    
    // Pronunciation Trainer State
    const [isRecording, setIsRecording] = useState(false);
    const [feedback, setFeedback] = useState<{score: string, feedback: string} | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    const fetchWord = async () => {
        setIsLoading(true);
        setIsSaved(false);
        setFeedback(null);
        const data = await getVocabularyWord(language);
        setWordData(data);
        setIsLoading(false);
    };

    // Auto-fetch on load or language switch
    useEffect(() => {
        fetchWord();
        return () => { mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop()); }
    }, [language]);

    const handleSave = () => {
        if (wordData && onSaveToDeck) {
            onSaveToDeck(wordData.word, `${wordData.pronunciation}\n${wordData.meaning}`);
            setIsSaved(true);
        }
    };

    const handleRecord = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            setFeedback(null);
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
                    reader.onload = async () => {
                        const result = await evaluatePronunciation(reader.result as string, wordData?.word || '');
                        setFeedback(result);
                        setIsLoading(false);
                    };
                    reader.readAsDataURL(blob);
                };
                recorder.start();
                setIsRecording(true);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'Korean' ? 'English' : 'Korean');
    };

    return (
        <div className="bg-card/50 backdrop-blur-md p-4 rounded-2xl border border-white/5 relative overflow-hidden group transition-all">
            <div className="flex justify-between items-center mb-2">
                <button onClick={toggleLanguage} className="text-xs font-bold text-accent uppercase tracking-wide flex items-center gap-1 hover:text-white">
                    <span className="text-lg">{language === 'Korean' ? '🇰🇷' : '🇺🇸'}</span> {language} Word
                </button>
                <div className="flex gap-2">
                    <button onClick={handleRecord} className={`text-dun hover:text-red-400 ${isRecording ? 'text-red-500 animate-pulse' : ''}`} title="Practice Pronunciation">
                        <MicIcon className="w-4 h-4" />
                    </button>
                    <button onClick={fetchWord} className="text-dun hover:text-white">
                        <RefreshCwIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>
            
            {wordData ? (
                <div className="space-y-1 relative animate-fade-in">
                    <p className="text-3xl font-serif font-bold text-isabelline">{wordData.word}</p>
                    <p className="text-sm text-dun italic">{wordData.pronunciation}</p>
                    <p className="text-sm font-semibold text-accent">{wordData.meaning}</p>
                    
                    {feedback ? (
                        <div className="mt-2 p-2 bg-bg-primary/50 rounded-lg border border-white/5 text-xs animate-fade-in">
                            <p className="font-bold text-green-400">Grade: {feedback.score}</p>
                            <p className="text-dun">{feedback.feedback}</p>
                        </div>
                    ) : (
                        <p className="text-xs text-dun/70 mt-2 border-t border-white/5 pt-2">{wordData.example}</p>
                    )}
                    
                    {onSaveToDeck && (
                        <button 
                            onClick={handleSave}
                            disabled={isSaved}
                            className={`absolute top-0 right-0 p-1.5 rounded-lg transition-all ${isSaved ? 'text-green-400 bg-green-400/10' : 'text-dun hover:text-accent hover:bg-white/5'}`}
                            title="Save to Flashcards"
                        >
                            <CardsIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ) : (
                <div className="h-24 flex items-center justify-center text-dun">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
};

export default HangulWidget;
