
import React, { useState, useEffect } from 'react';
import { HeartIcon, RefreshCwIcon, QuoteIcon, ShareIcon } from './Icons';
import { quotes } from '../data/quotes';
import { useQuotes } from '../hooks/useQuotes';

const MotivationCard: React.FC = () => {
    const [currentQuote, setCurrentQuote] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const { likedQuotes, likeQuote, unlikeQuote } = useQuotes();

    // Initialize with a random quote
    useEffect(() => {
        const random = quotes[Math.floor(Math.random() * quotes.length)];
        setCurrentQuote(random);
    }, []);

    const nextQuote = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setIsAnimating(true);
        setTimeout(() => {
            let next;
            do {
                next = quotes[Math.floor(Math.random() * quotes.length)];
            } while (next === currentQuote);
            setCurrentQuote(next);
            setIsAnimating(false);
        }, 300); // Duration matches CSS transition
    };

    const toggleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (likedQuotes.includes(currentQuote)) {
            unlikeQuote(currentQuote);
        } else {
            likeQuote(currentQuote);
        }
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (navigator.share) {
            navigator.share({
                title: 'Motivation from Mwijay Note',
                text: currentQuote,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(currentQuote);
            alert("Quote copied to clipboard!");
        }
    };

    // Parse quote string "Text - Author"
    const quoteParts = currentQuote.split(' - ');
    const text = quoteParts[0] ? quoteParts[0].replace(/^"|"$/g, '') : '';
    const author = quoteParts[1] || 'Unknown';
    const isLiked = likedQuotes.includes(currentQuote);

    return (
        <div 
            className="relative w-full group cursor-pointer mt-2 mb-6" 
            onClick={() => nextQuote()}
        >
            {/* Card Background with Glassmorphism using Dynamic Variables */}
            <div className="relative overflow-hidden rounded-3xl bg-card border border-white/10 shadow-xl min-h-[220px] flex flex-col justify-between p-6 transition-all duration-300 hover:shadow-2xl hover:border-accent/30">
                
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                {/* Quote Icon */}
                <div className="absolute top-6 left-6 opacity-20">
                    <QuoteIcon className="w-10 h-10 text-accent" />
                </div>

                {/* Content Area */}
                <div className={`relative z-10 flex-grow flex flex-col justify-center transition-opacity duration-300 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                    <p className="font-serif text-xl sm:text-2xl text-isabelline leading-relaxed font-medium italic text-center px-4">
                        "{text}"
                    </p>
                    <div className="w-12 h-0.5 bg-accent/50 mx-auto my-4 rounded-full"></div>
                    <p className="text-center text-sm text-dun font-bold uppercase tracking-widest">
                        {author}
                    </p>
                </div>

                {/* Action Bar */}
                <div className="relative z-10 flex justify-between items-end mt-4 pt-4 border-t border-white/5">
                    <div className="text-[10px] text-dun uppercase tracking-wider font-bold flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <span className="bg-white/10 p-1 rounded-full"><RefreshCwIcon className="w-3 h-3"/></span> Tap for next
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={handleShare}
                            className="p-2 rounded-full hover:bg-white/10 text-dun hover:text-isabelline transition-colors"
                            title="Share"
                        >
                            <ShareIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={toggleLike}
                            className={`p-2 rounded-full transition-all transform active:scale-90 ${isLiked ? 'bg-accent/20 text-accent' : 'hover:bg-white/10 text-dun hover:text-red-400'}`}
                            title={isLiked ? "Unlike" : "Save to Favorites"}
                        >
                            <HeartIcon className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MotivationCard;
