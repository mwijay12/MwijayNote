
import React, { useState } from 'react';
import { AppView } from '../types';
import { 
    HomeIcon, CompassIcon, SettingsIcon, PlusIcon, 
    UserIcon, WifiIcon, MenuIcon, ChevronLeftIcon, 
    ChevronRightIcon, SparklesIcon, ActivityIcon, SunIcon, MoonIcon,
    MusicIcon, DownloadIcon
} from './Icons';
import { useSound } from '../hooks/useSound';

interface SidebarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  onCreateNew: () => void;
  userData: any;
  isDark: boolean;
}

const SidebarItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  colorClass?: string;
}> = ({ label, icon, isActive, isCollapsed, onClick, colorClass }) => {
    const { playSound } = useSound();
    
    const handleClick = () => {
        playSound('nav');
        onClick();
    }

  return (
    <button 
        onClick={handleClick}
        title={isCollapsed ? label : ''}
        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 w-full group ${isActive ? 'bg-accent text-cafe font-bold shadow-lg shadow-amber/20' : 'text-dun hover:text-isabelline hover:bg-white/5'}`}
    >
      <div className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform shrink-0 ${!isActive && colorClass ? colorClass : ''}`}>
        {icon}
      </div>
      {!isCollapsed && (
        <span className="truncate text-sm tracking-wide animate-fade-in">
          {label}
        </span>
      )}
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onCreateNew, userData, isDark }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { playSound } = useSound();

    const handleCreate = () => {
        playSound('pop');
        onCreateNew();
    };

    const toggleCollapse = () => {
        playSound('tap');
        setIsCollapsed(!isCollapsed);
    };

  return (
    <aside 
        className={`hidden md:flex flex-col h-full bg-bg-primary/95 backdrop-blur-xl border-r border-white/10 z-50 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'} shrink-0 relative`}
    >
      {/* Header / Logo */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
            <div className="flex items-center gap-3 overflow-hidden animate-fade-in">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber to-orange-500 flex items-center justify-center text-cafe font-bold text-lg shadow-lg shrink-0">
                    M
                </div>
                <h1 className="text-lg font-brand font-black text-isabelline tracking-widest uppercase truncate">MWIJAY</h1>
            </div>
        )}
        {isCollapsed && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber to-orange-500 flex items-center justify-center text-cafe font-bold text-xl shadow-lg">
                M
            </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-grow px-3 space-y-2 mt-4">
        <SidebarItem 
            label="Home" 
            icon={<HomeIcon className="w-5 h-5"/>} 
            isActive={activeView === AppView.HOME} 
            isCollapsed={isCollapsed}
            onClick={() => setActiveView(AppView.HOME)} 
        />
        <SidebarItem 
            label="Radio" 
            icon={<WifiIcon className="w-5 h-5"/>} 
            isActive={activeView === AppView.RADIO} 
            isCollapsed={isCollapsed}
            onClick={() => setActiveView(AppView.RADIO)} 
            colorClass="text-rose-400"
        />
        <SidebarItem 
            label="Music Hub" 
            icon={<MusicIcon className="w-5 h-5"/>} 
            isActive={activeView === AppView.MUSIC_HUB} 
            isCollapsed={isCollapsed}
            onClick={() => setActiveView(AppView.MUSIC_HUB)} 
            colorClass="text-amber"
        />
        <SidebarItem 
            label="Explore" 
            icon={<CompassIcon className="w-5 h-5"/>} 
            isActive={activeView === AppView.EXPLORE || activeView === AppView.CALENDAR} 
            isCollapsed={isCollapsed}
            onClick={() => setActiveView(AppView.EXPLORE)} 
            colorClass="text-accent"
        />
        <SidebarItem 
            label="AI Assistant" 
            icon={<SparklesIcon className="w-5 h-5"/>} 
            isActive={activeView === AppView.AI} 
            isCollapsed={isCollapsed}
            onClick={() => setActiveView(AppView.AI)} 
            colorClass="text-purple-400"
        />
        <SidebarItem 
            label="Insights" 
            icon={<ActivityIcon className="w-5 h-5"/>} 
            isActive={activeView === AppView.INSIGHTS} 
            isCollapsed={isCollapsed}
            onClick={() => setActiveView(AppView.INSIGHTS)} 
            colorClass="text-indigo-400"
        />
        <SidebarItem 
            label="File Manager" 
            icon={<DownloadIcon className="w-5 h-5"/>} 
            isActive={activeView === AppView.FILE_MANAGER} 
            isCollapsed={isCollapsed}
            onClick={() => setActiveView(AppView.FILE_MANAGER)} 
            colorClass="text-emerald-400"
        />


      </div>

      {/* Bottom Actions */}
      <div className="p-3 space-y-2 mb-4">
        <button 
            onClick={handleCreate} 
            className={`flex items-center gap-3 bg-accent text-cafe rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-amber/20 w-full overflow-hidden ${isCollapsed ? 'p-3 justify-center' : 'px-4 py-3'}`}
        >
            <PlusIcon className="w-5 h-5 shrink-0"/>
            {!isCollapsed && <span className="truncate">Create New</span>}
        </button>

        <SidebarItem 
            label="Settings" 
            icon={<SettingsIcon className="w-5 h-5"/>} 
            isActive={activeView === AppView.SETTINGS} 
            isCollapsed={isCollapsed}
            onClick={() => setActiveView(AppView.SETTINGS)} 
        />

        <button 
            onClick={() => setActiveView(AppView.PROFILE)}
            className={`flex items-center gap-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all w-full overflow-hidden ${isCollapsed ? 'p-2 justify-center' : 'p-2'}`}
        >
            <div className="w-8 h-8 rounded-full bg-card overflow-hidden border border-accent/30 shrink-0">
                 {userData?.profilePicture?.startsWith('data:image') || userData?.profilePicture?.startsWith('http') ? (
                    <img src={userData.profilePicture} className="w-full h-full object-cover" alt="Profile" referrerPolicy="no-referrer" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">{userData?.profilePicture || '👤'}</div>
                 )}
            </div>
            {!isCollapsed && <span className="text-sm font-semibold text-isabelline truncate font-brand tracking-wide">{userData?.name || 'Profile'}</span>}
        </button>
      </div>

      {/* Collapse Toggle Button */}
      <button 
        onClick={toggleCollapse}
        className="absolute -right-3 top-20 w-6 h-6 bg-jet border border-white/10 rounded-full flex items-center justify-center text-dun hover:text-accent shadow-xl z-50"
      >
        {isCollapsed ? <ChevronRightIcon className="w-4 h-4"/> : <ChevronLeftIcon className="w-4 h-4"/>}
      </button>
    </aside>
  );
};

export default Sidebar;
