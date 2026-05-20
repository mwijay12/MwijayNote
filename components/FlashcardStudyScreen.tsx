
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, AwardIcon, CheckIcon, EyeIcon, Volume2Icon, SparklesIcon, XIcon, WindIcon, ChevronRightIcon, RefreshCwIcon } from './Icons';
import { FlashcardDeck, Flashcard } from '../types';
import { db } from '../utils/db'; 
import { textToSpeech, callGemini } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';

interface FlashcardStudyScreenProps {
  deck: FlashcardDeck;
  onBack: () => void;
}

const FlashcardStudyScreen: React.FC<FlashcardStudyScreenProps> = ({ deck, onBack }) => {
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    setSessionCards(shuffled);
  }, [deck]);

  const currentCard = sessionCards[currentIndex];

  const handleAudioStudy = async () => {
    if (isSpeaking || !currentCard) return;
    setIsSpeaking(true);
    const textToRead = isFlipped ? `Answer: ${currentCard.back}` : `Question: ${currentCard.front}`;
    try {
        const audioData = await textToSpeech(textToRead, 'Zephyr');
        if (audioData) {
            if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const ctx = audioContextRef.current;
            const audioBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.onended = () => setIsSpeaking(false);
            source.start();
        }
    } catch (e) { setIsSpeaking(false); }
  };

  const handleDeepDive = async () => {
      if (!currentCard) return;
      setIsExplaining(true);
      try {
          const prompt = `Act as an expert professor. Deep dive into this flashcard concept: "${currentCard.front}". Explain why the answer is "${currentCard.back}". Use examples and keep it highly educational. Use clean HTML.`;
          const result = await callGemini(prompt);
          setExplanation(result);
      } catch (e) { setExplanation("Could not generate expansion."); }
      finally { setIsExplaining(false); }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setExplanation(null);
    if (currentIndex + 1 >= sessionCards.length) setIsSessionComplete(true);
    else setCurrentIndex(prev => prev + 1);
  };

  if (isSessionComplete) {
     return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in p-8 text-center bg-bg-primary">
            <AwardIcon className="w-24 h-24 text-accent mb-6 animate-bounce-custom" />
            <h1 className="text-4xl font-brand font-black text-isabelline mb-2">Session Complete</h1>
            <p className="text-dun mb-10 text-lg">You've mastered {deck.cards.length} concepts in "{deck.title}".</p>
            <button onClick={onBack} className="w-full max-w-xs py-5 rounded-[2rem] bg-accent text-cafe font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform">Back to Deck</button>
        </div>
    );
  }

  if (!currentCard) return <div className="p-16 text-center text-dun">Loading cards...</div>;

  return (
    <div className="flex flex-col h-full bg-bg-primary relative">
        <header className="flex items-center p-6 pt-16 mb-4">
            <button onClick={onBack} className="p-3 rounded-full bg-white/5 border border-white/10 text-isabelline"><ArrowLeftIcon className="w-6 h-6" /></button>
            <div className="flex-grow px-8">
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                    <div className="bg-accent h-full rounded-full transition-all duration-700 shadow-[0_0_10px_#FFBC2D]" style={{width: `${((currentIndex + 1) / sessionCards.length) * 100}%`}}></div>
                </div>
            </div>
            <span className="text-xs font-mono font-black text-accent">{currentIndex + 1}/{sessionCards.length}</span>
        </header>

        <div className="flex-grow flex flex-col items-center justify-center w-full max-w-lg mx-auto p-6">
            {/* Tactile Card Flip UI */}
            <div 
                className="w-full relative h-[450px] perspective-1000 group cursor-pointer"
                onClick={() => !isFlipped && setIsFlipped(true)}
            >
                <div className={`relative w-full h-full duration-700 preserve-3d transition-all ${isFlipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
                    
                    {/* Front of Card */}
                    <div className="absolute inset-0 bg-card border border-white/10 rounded-[3rem] p-10 flex flex-col justify-center items-center text-center backface-hidden shadow-2xl" style={{ backfaceVisibility: 'hidden' }}>
                        <span className="absolute top-8 left-0 right-0 text-[10px] font-black text-accent uppercase tracking-[0.3em]">Concept</span>
                        <h2 className="text-3xl font-brand text-isabelline leading-tight italic">{currentCard.front}</h2>
                        <div className="mt-12 flex items-center gap-2 text-dun text-xs font-bold uppercase tracking-widest opacity-50"><EyeIcon className="w-4 h-4"/> Tap to Reveal</div>
                    </div>

                    {/* Back of Card */}
                    <div className="absolute inset-0 bg-card border border-accent/30 rounded-[3rem] p-10 flex flex-col justify-center items-center text-center backface-hidden shadow-2xl rotate-y-180" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                         <span className="absolute top-8 left-0 right-0 text-[10px] font-black text-green-400 uppercase tracking-[0.3em]">The Breakdown</span>
                         <h2 className="text-3xl font-brand text-isabelline leading-tight">{currentCard.back}</h2>
                    </div>
                </div>
            </div>

            {/* AI Deep Dive Overlay */}
            {explanation && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl animate-fade-in p-6 flex flex-col justify-center items-center">
                    <div className="bg-card w-full max-w-xl rounded-[3rem] p-8 border border-accent/20 shadow-2xl max-h-[80vh] overflow-y-auto custom-scrollbar relative">
                        <button onClick={() => setExplanation(null)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full"><XIcon className="w-5 h-5"/></button>
                        <div className="flex items-center gap-3 mb-6 text-accent">
                            <SparklesIcon className="w-6 h-6"/>
                            <h3 className="text-xl font-brand font-black uppercase">Deep Dive Lesson</h3>
                        </div>
                        <div className="prose prose-invert prose-sm text-isabelline/90 leading-relaxed" dangerouslySetInnerHTML={{ __html: explanation }} />
                        <button onClick={() => setExplanation(null)} className="w-full mt-10 py-4 bg-bg-primary border border-white/10 rounded-2xl font-bold uppercase tracking-widest text-xs">Got it, Coach</button>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="mt-12 flex w-full gap-4">
                <button 
                    onClick={handleAudioStudy} 
                    disabled={isSpeaking}
                    className={`w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all ${isSpeaking ? 'text-accent animate-pulse border-accent' : 'text-dun hover:text-white'}`}
                >
                    <Volume2Icon className="w-6 h-6"/>
                </button>
                
                {isFlipped ? (
                    <>
                        <button 
                            onClick={handleDeepDive} 
                            disabled={isExplaining}
                            className="flex-grow py-5 bg-card border border-accent/30 text-accent font-black uppercase tracking-widest rounded-[2rem] flex items-center justify-center gap-2 hover:bg-accent/10 transition-colors"
                        >
                            {isExplaining ? <RefreshCwIcon className="w-5 h-5 animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                            {isExplaining ? 'Thinking...' : 'AI Deep Dive'}
                        </button>
                        <button 
                            onClick={nextCard}
                            className="w-16 h-16 rounded-full bg-accent text-cafe flex items-center justify-center hover:scale-110 transition-all shadow-lg"
                        >
                            <ChevronRightIcon className="w-8 h-8"/>
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => setIsFlipped(true)}
                        className="flex-grow py-5 bg-accent text-cafe font-black uppercase tracking-widest rounded-[2rem] shadow-xl hover:scale-[0.98] transition-all"
                    >
                        Reveal Answer
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};

export default FlashcardStudyScreen;
