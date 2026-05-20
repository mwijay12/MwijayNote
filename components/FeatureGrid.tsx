import React from 'react';
import { motion } from 'motion/react';
import { 
  ZapIcon, 
  BookOpenIcon, 
  RadioIcon, 
  RocketIcon, 
  SparklesIcon,
  ChevronRightIcon,
  MusicIcon,
  NewspaperIcon
} from './Icons';
import { AppView } from '../types';

interface FeatureGridProps {
  onNavigate: (view: AppView) => void;
}

const FeatureItem: React.FC<{
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  onClick: () => void;
  description: string;
}> = ({ title, icon, color, bgColor, onClick, description }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="group relative flex flex-col items-center justify-center p-6 bg-card rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-border border-opacity-10 active:scale-95 text-center overflow-hidden h-[180px]"
  >
    <div 
      className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" 
      style={{ backgroundColor: bgColor }}
    />
    
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm`} style={{ backgroundColor: bgColor, color: color }}>
      {icon}
    </div>
    
    <h3 className="text-sm font-black text-isabelline uppercase tracking-widest mb-1">{title}</h3>
    <p className="text-[10px] text-dun uppercase tracking-[0.15em] font-medium opacity-60">{description}</p>
    
    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRightIcon className="w-4 h-4 text-dun" />
    </div>
  </motion.button>
);

const FeatureGrid: React.FC<FeatureGridProps> = ({ onNavigate }) => {
  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto p-4 md:hidden">
      <div className="col-span-2 flex items-center gap-2 mb-2 px-2">
          <SparklesIcon className="w-4 h-4 text-accent" />
          <h2 className="text-[11px] font-black text-dun uppercase tracking-[0.25em]">Interactive Hub</h2>
      </div>

      <FeatureItem 
        title="Zen Mode" 
        icon={<ZapIcon className="w-6 h-6" />} 
        color="#10b981" 
        bgColor="rgba(16, 185, 129, 0.15)"
        description="Focus & Flow"
        onClick={() => onNavigate(AppView.ZEN_MODE)}
      />
      
      <FeatureItem 
        title="Study Lab" 
        icon={<BookOpenIcon className="w-6 h-6" />} 
        color="#3b82f6" 
        bgColor="rgba(59, 130, 246, 0.15)"
        description="Academic Mastery"
        onClick={() => onNavigate(AppView.ACADEMIC_HUB)}
      />
      
      <FeatureItem 
        title="Music Hub" 
        icon={<MusicIcon className="w-6 h-6" />} 
        color="#fbbf24" 
        bgColor="rgba(251, 191, 36, 0.15)"
        description="Premium Audio"
        onClick={() => onNavigate(AppView.MUSIC_HUB)}
      />
      
      <FeatureItem 
        title="Live Radio" 
        icon={<RadioIcon className="w-6 h-6" />} 
        color="#f43f5e" 
        bgColor="rgba(244, 63, 94, 0.15)"
        description="Lofi Beats"
        onClick={() => onNavigate(AppView.RADIO)}
      />
      
      <FeatureItem 
        title="Startup Lab" 
        icon={<RocketIcon className="w-6 h-6" />} 
        color="#a855f7" 
        bgColor="rgba(168, 85, 247, 0.15)"
        description="Build & Launch"
        onClick={() => onNavigate(AppView.STARTUP_LAB)}
      />

      <FeatureItem 
        title="News Hub" 
        icon={<NewspaperIcon className="w-6 h-6" />} 
        color="#06b6d4" 
        bgColor="rgba(6, 182, 212, 0.15)"
        description="Global Insights"
        onClick={() => onNavigate(AppView.NEWS)}
      />
    </div>
  );
};

export default FeatureGrid;
