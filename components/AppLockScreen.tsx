
import React, { useState, useEffect } from 'react';
import { LockIcon } from './Icons';

interface AppLockScreenProps {
  pin: string;
  onUnlock: () => void;
  onReset: () => void;
}

const AppLockScreen: React.FC<AppLockScreenProps> = ({ pin, onUnlock, onReset }) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (enteredPin.length === 4) {
      if (enteredPin === pin) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => {
          setError(false);
          setEnteredPin('');
        }, 500);
      }
    }
  }, [enteredPin, pin, onUnlock]);
  
  const handleKeyClick = (key: string) => {
    if (enteredPin.length < 4) {
      setEnteredPin(enteredPin + key);
    }
  };
  
  const handleDelete = () => {
    setEnteredPin(enteredPin.slice(0, -1));
  };

  const pinDots = Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${i < enteredPin.length ? 'bg-accent scale-110' : 'bg-white/10 border border-white/20'}`}></div>
  ));
  
  return (
    <div className="flex flex-col items-center justify-between h-full animate-fade-in p-8 bg-bg-primary relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="text-center mt-12 z-10">
        <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/5 animate-pop-in">
            <LockIcon className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-2xl font-serif text-isabelline mb-2 font-bold tracking-wide">Mwijay Note Locked</h1>
        <p className="text-dun text-sm mb-8">Enter your security PIN</p>
        
        <div className={`flex gap-6 justify-center ${error ? 'animate-shake' : ''}`}>
          {pinDots}
        </div>
        {error && <p className="text-red-400 mt-6 text-xs font-bold bg-red-500/10 py-1 px-3 rounded-full inline-block">Incorrect PIN</p>}
      </div>
      
      <div className="w-full max-w-xs z-10 pb-4">
          <div className="grid grid-cols-3 gap-y-4 gap-x-6 sm:gap-y-6 sm:gap-x-8">
              {[1,2,3,4,5,6,7,8,9].map(num => (
                  <KeypadButton key={num} value={num.toString()} onClick={handleKeyClick} />
              ))}
              <div className="flex items-center justify-center">
                  {/* Future Biometric Button Placeholder */}
              </div>
              <KeypadButton value="0" onClick={handleKeyClick} />
              <button 
                onClick={handleDelete} 
                className="h-16 w-16 flex items-center justify-center text-dun hover:text-white transition-colors"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
              </button>
          </div>
          <button onClick={onReset} className="w-full text-center text-[10px] text-dun/50 mt-12 hover:text-red-400 transition-colors uppercase tracking-widest font-bold">
              Forgot PIN? Reset Data
          </button>
      </div>
    </div>
  );
};

const KeypadButton: React.FC<{ value: string; onClick: (v: string) => void }> = ({ value, onClick }) => (
    <button 
      onClick={() => onClick(value)} 
      className="h-20 w-20 rounded-full bg-transparent hover:bg-white/5 flex items-center justify-center text-3xl font-light text-isabelline transition-all active:scale-90 active:bg-white/10"
    >
        {value}
    </button>
);

export default AppLockScreen;
