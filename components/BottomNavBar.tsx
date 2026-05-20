
import React from 'react';
import { AppView } from '../types';
import { HomeIcon, CompassIcon, PlusIcon, BookIcon, SettingsIcon } from './Icons';
import { useSound } from '../hooks/useSound';
import { useHaptics } from '../hooks/useHaptics';

interface BottomNavBarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  onCreateNew: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, isActive, onClick }) => {
    const { playSound } = useSound();
    const { triggerHaptic } = useHaptics();
    
    const handleClick = () => {
        playSound('tap');
        triggerHaptic('light');
        onClick();
    };

  return (
    <button 
        onClick={handleClick} 
        className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${isActive ? 'bg-accent/10 text-accent' : 'text-dun hover:text-isabelline'}`}
    >
      <div className={`${isActive ? 'scale-110 drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]' : ''}`}>
        {icon}
      </div>
    </button>
  );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, setActiveView, onCreateNew }) => {
    const { playSound } = useSound();
    const { triggerHaptic } = useHaptics();

    const handleCreate = () => {
        playSound('pop');
        triggerHaptic('medium');
        onCreateNew();
    };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 z-30 flex justify-center items-end pb-[calc(env(safe-area-inset-bottom)+8px)] pointer-events-none md:hidden">
        <div className="flex justify-between items-center h-16 w-[92%] max-w-md mx-auto px-2 bg-bg-primary/80 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-2xl pointer-events-auto ring-1 ring-white/5">
            <NavItem icon={<HomeIcon className="w-5 h-5"/>} isActive={activeView === AppView.HOME} onClick={() => setActiveView(AppView.HOME)} />
            <NavItem icon={<CompassIcon className="w-5 h-5"/>} isActive={activeView === AppView.EXPLORE || activeView === AppView.CALENDAR} onClick={() => setActiveView(AppView.EXPLORE)} />
            
            <button 
                onClick={handleCreate} 
                className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-cafe shadow-2xl hover:scale-110 transition-all transform active:scale-90 -translate-y-2"
            >
                <PlusIcon className="w-6 h-6"/>
            </button>
            
            <NavItem icon={<BookIcon className="w-5 h-5"/>} isActive={activeView === AppView.JOURNALS_LIST} onClick={() => setActiveView(AppView.JOURNALS_LIST)} />
            <NavItem icon={<SettingsIcon className="w-5 h-5"/>} isActive={activeView === AppView.SETTINGS} onClick={() => setActiveView(AppView.SETTINGS)} />
        </div>
    </div>
  );
};

export default BottomNavBar;
