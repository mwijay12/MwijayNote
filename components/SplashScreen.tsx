
import React from 'react';

const Logo: React.FC = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" className="w-32 h-32 drop-shadow-2xl">
        <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFBC2D" />
                <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>
        <path fill="url(#logoGrad)" d="M50 0L61.8 24.4L88.2 29.2L69.1 47.6L73.6 74L50 61.2L26.4 74L30.9 47.6L11.8 29.2L38.2 24.4L50 0Z" filter="url(#glow)" />
        <path fill="#1e1e1e" d="M50 15L57.5 34.5L78.5 37.8L63.2 52.4L66.7 72L50 62.5L33.3 72L36.8 52.4L21.5 37.8L42.5 34.5L50 15Z" />
    </svg>
);

const SplashScreen: React.FC = () => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center h-full animate-fade-in bg-jet px-4 relative overflow-hidden">
      <div className="animate-scale-in mb-8 z-10 relative">
        <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full animate-pulse-slow"></div>
        <Logo />
      </div>
      
      <div className="text-center w-full max-w-md relative z-10">
        <h1 className="text-3xl sm:text-5xl font-brand font-black tracking-widest text-[#FFBC2D] animate-fade-in-up uppercase drop-shadow-2xl whitespace-nowrap leading-tight delay-100 mb-4">
            MWIJAY NOTE
        </h1>
        
        <div className="h-1 w-20 bg-[#FFBC2D] mx-auto rounded-full mb-6"></div>
        
        <div className="flex items-center justify-center gap-3 text-xs sm:text-sm text-dun animate-fade-in-up uppercase tracking-[0.3em] font-serif opacity-0 delay-500" style={{animationFillMode: 'forwards'}}>
            <span>Reflect</span>
            <span className="text-accent">•</span>
            <span>Grow</span>
            <span className="text-accent">•</span>
            <span>Achieve</span>
        </div>
      </div>
      
      {/* Ambient Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
    </div>
  );
};

export default SplashScreen;
