
import React, { useState } from 'react';

interface OnboardingScreenProps {
  onComplete: (name: string) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
        setError('Name must be at least 2 characters.');
        return;
    }
    if (name.trim().length > 20) {
        setError('Name is too long.');
        return;
    }
    
    setError('');
    setIsLoading(true);
    setTimeout(() => {
        onComplete(name.trim());
    }, 500); 
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center h-full animate-fade-in p-6 text-center bg-jet relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-accent/5 rounded-full blur-[80px] pointer-events-none animate-float"></div>
      
      <div className="w-20 h-20 rounded-full bg-card mb-8 flex items-center justify-center text-5xl shadow-2xl border border-white/5 animate-pop-in relative z-10">
        <span className="animate-handshake origin-bottom-right">👋</span>
      </div>
      
      <div className="relative z-10 space-y-2 mb-10">
          <h1 className="text-xl text-dun tracking-wide uppercase font-medium animate-fade-in-down delay-100">Welcome to</h1>
          <h2 className="text-4xl sm:text-6xl font-brand font-black text-gradient-gold drop-shadow-lg tracking-wide uppercase animate-scale-in delay-200">
            MWIJAY NOTE
          </h2>
          <p className="text-isabelline/80 max-w-md leading-relaxed animate-fade-in-up delay-300">Your personal AI-powered workspace for growth.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="w-full max-w-sm relative z-10 animate-fade-in-up delay-500">
        <div className="group relative">
            <label htmlFor="name-input" className="text-xs font-bold text-dun uppercase tracking-widest mb-3 block opacity-80 group-hover:text-accent transition-colors">What should we call you?</label>
            <input
              id="name-input"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="Enter your name"
              className="w-full bg-card backdrop-blur-lg text-center text-lg font-semibold p-5 focus:outline-none border-2 border-white/10 focus:border-accent rounded-2xl transition-all text-isabelline placeholder-dun/30 shadow-inner focus:shadow-[0_0_20px_rgba(251,191,36,0.15)]"
              autoFocus
              maxLength={25}
              disabled={isLoading}
            />
            {error && <p className="text-red-400 text-xs mt-3 font-bold animate-shake bg-red-500/10 py-1 px-3 rounded-full inline-block">{error}</p>}
        </div>
        
        <button
          type="submit"
          disabled={!name.trim() || isLoading}
          className="mt-10 w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-accent text-cafe font-bold uppercase tracking-wide hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-xl shadow-amber/20 hover:shadow-amber/40 animate-pulse-slow"
        >
          {isLoading ? <div className="w-5 h-5 border-2 border-cafe border-t-transparent rounded-full animate-spin"></div> : 'Start Journey'}
        </button>
      </form>
    </div>
  );
};

export default OnboardingScreen;
