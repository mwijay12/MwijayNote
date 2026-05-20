
import React, { useState } from 'react';
import { SparklesIcon } from './Icons';

const affirmations = [
    "I turn bugs into features and obstacles into opportunities.",
    "My mind is as organized as optimized code.",
    "I walk in faith, not by sight.",
    "Every line of code I write brings me closer to mastery.",
    "Rest is part of the development cycle.",
    "I am debuggable, improveable, and scalable.",
    "God's grace is sufficient for me.",
    "I speak the language of innovation.",
    "Small commits add up to major releases.",
    "I am the architect of my future.",
    "My potential is infinite, like a while loop (but better).",
    "I embrace the unknown with curiosity, not fear."
];

const AffirmationDeck: React.FC = () => {
    const [index, setIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const nextCard = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setTimeout(() => {
            setIndex((prev) => (prev + 1) % affirmations.length);
            setIsAnimating(false);
        }, 300);
    };

    return (
        <div className="relative h-48 w-full perspective-1000 group cursor-pointer mt-4" onClick={nextCard}>
            {/* Stack effect cards behind */}
            <div className="absolute inset-0 bg-accent/10 rounded-3xl transform translate-y-3 scale-90 z-0 border border-accent/5"></div>
            <div className="absolute inset-0 bg-accent/20 rounded-3xl transform translate-y-1.5 scale-95 z-10 border border-accent/10"></div>
            
            {/* Main Card */}
            <div 
                className={`absolute inset-0 bg-card backdrop-blur-md border border-accent/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-xl z-20 transition-all duration-300 ease-in-out hover:-translate-y-1 ${isAnimating ? 'opacity-0 translate-x-full rotate-12' : 'opacity-100 translate-x-0 rotate-0'}`}
            >
                <SparklesIcon className="w-6 h-6 text-accent mb-3 opacity-80" />
                <p className="font-serif text-lg text-isabelline leading-relaxed font-medium">
                    "{affirmations[index]}"
                </p>
                <p className="text-[10px] text-dun mt-4 uppercase tracking-widest opacity-50">Tap for next</p>
            </div>
        </div>
    );
};

export default AffirmationDeck;
