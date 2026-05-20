
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AppView, UserData, Theme } from '../types';
import { UserIcon, SparklesIcon, MonitorIcon, BellIcon, LockIcon, HelpCircleIcon, ChevronRightIcon, BookMarkedIcon, GlobeIcon, LightbulbIcon, ActivityIcon } from './Icons';
import DayNightSwitcher from './DayNightSwitcher';
import { AppSettings, LIGHT_THEMES, DARK_THEMES, ContentPreferences, useSettings, AutomationSettings } from '../hooks/useSettings';

interface SettingsScreenProps {
    onNavigate: (view: AppView) => void;
    userData: UserData | null;
    settings: AppSettings;
    setTheme: (theme: Theme) => void;
    setAutoDarkMode: (enabled: boolean) => void;
    toggleDayNight: () => void;
    setContentPreferences?: (prefs: Partial<ContentPreferences>) => void;
    setAutomationSettings: (aut: Partial<AutomationSettings>) => void;
    setPlayfulMode: (enabled: boolean) => void;
}

const MenuItem: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void; isFirst?: boolean; isLast?: boolean; colorClass?: string }> = ({ label, icon, onClick, isFirst, isLast, colorClass = 'bg-accent/10 text-accent' }) => (
    <button onClick={onClick} className={`w-full flex justify-between items-center p-4 cursor-pointer hover:bg-white/5 transition-colors ${isFirst ? 'rounded-t-2xl' : ''} ${isLast ? 'rounded-b-2xl' : 'border-b border-white/5'}`}>
        <div className="flex items-center gap-4">
            <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${colorClass}`}>
              {icon}
            </div>
            <span className="font-medium text-isabelline">{label}</span>
        </div>
        <ChevronRightIcon className="w-5 h-5 text-dun" />
    </button>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate, userData, settings, setTheme, setAutoDarkMode, toggleDayNight, setContentPreferences, setAutomationSettings, setPlayfulMode }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [n8nUrlInput, setN8nUrlInput] = useState(settings.automation?.n8nWebhookUrl || '');
    const scrollRef = useRef<HTMLDivElement>(null);

    const isDarkTheme = useMemo(() => {
        return DARK_THEMES.some(t => t.id === settings.theme);
    }, [settings.theme]);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollRef.current) {
                setIsScrolled(scrollRef.current.scrollTop > 30);
            }
        };
        const div = scrollRef.current;
        if (div) div.addEventListener('scroll', handleScroll);
        return () => div?.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="flex flex-col h-full relative bg-transparent">
            <header 
                className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-in-out px-4 flex items-end border-b md:top-20 ${isScrolled ? 'h-20 pb-3 bg-bg-primary border-white/10 shadow-xl' : 'h-32 pb-2 border-transparent bg-gradient-to-b from-bg-primary/50 to-transparent'}`}
            >
                <div className="w-full relative h-full flex flex-col justify-end text-center">
                    <div className={`absolute left-0 right-0 bottom-2 transition-all duration-500 ease-in-out ${isScrolled ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                        <h1 className="text-3xl font-brand text-isabelline">Settings</h1>
                        <p className="text-dun text-sm">Customize your experience.</p>
                    </div>
                    
                    <div className={`absolute left-0 right-0 bottom-3 transition-all duration-500 ease-in-out ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                        <span className="text-sm font-bold text-accent uppercase tracking-widest font-brand">Settings</span>
                    </div>
                </div>
            </header>

            <div ref={scrollRef} className="flex-grow overflow-y-auto space-y-6 pb-28 p-4 pt-36 no-scrollbar">
                
                <div className="w-full flex flex-col items-center justify-center py-2 shrink-0 gap-4">
                    <DayNightSwitcher isDark={isDarkTheme} onToggle={toggleDayNight} />
                    <div className="flex items-center gap-3 bg-card/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
                        <span className="text-[10px] text-dun font-bold uppercase tracking-wide">Auto-Switch (6 PM - 6 AM)</span>
                        <ToggleSwitch checked={settings.autoDarkMode} onChange={() => setAutoDarkMode(!settings.autoDarkMode)} />
                    </div>
                </div>

                <button onClick={() => onNavigate(AppView.PROFILE)} className="w-full bg-card/60 backdrop-blur-lg border border-white/10 p-4 rounded-2xl flex items-center gap-4 hover:bg-card/80 transition-all group text-left shrink-0 shadow-lg">
                    <div className="w-14 h-14 rounded-full bg-jet flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-accent/50 transition-colors">
                         {userData?.profilePicture?.startsWith('data:image') ? 
                            <img src={userData.profilePicture} alt="Profile" className="w-full h-full object-cover" /> : 
                            <span className="text-2xl">{userData?.profilePicture || '🧘'}</span>
                         }
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-semibold text-isabelline group-hover:text-accent transition-colors">My Profile</h3>
                        <p className="text-xs text-dun">View stats, habits & content</p>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-dun group-hover:translate-x-1 transition-transform"/>
                </button>
                
                {setContentPreferences && (
                    <div className="shrink-0">
                        <h3 className="text-xs font-bold text-dun uppercase tracking-widest px-4 mb-2 font-brand">Home Content</h3>
                        <div className="bg-card/60 backdrop-blur-lg rounded-2xl border border-white/5 shadow-sm p-4 space-y-4">
                             <SettingsToggle 
                                label="Fun Facts" 
                                description="Interesting tidbits to brighten your day." 
                                isEnabled={settings.contentPreferences.showFunFacts} 
                                onToggle={() => setContentPreferences({ showFunFacts: !settings.contentPreferences.showFunFacts })} 
                             />
                             <SettingsToggle 
                                label="Life Hacks" 
                                description="Practical tips for productivity." 
                                isEnabled={settings.contentPreferences.showLifeHacks} 
                                onToggle={() => setContentPreferences({ showLifeHacks: !settings.contentPreferences.showLifeHacks })} 
                             />
                             <SettingsToggle 
                                label="Psychology Facts" 
                                description="Insights into human behavior." 
                                isEnabled={settings.contentPreferences.showPsychology} 
                                onToggle={() => setContentPreferences({ showPsychology: !settings.contentPreferences.showPsychology })} 
                             />
                        </div>
                    </div>
                )}

                <div className="shrink-0">
                    <h3 className="text-xs font-bold text-dun uppercase tracking-widest px-4 mb-2 font-brand">System & Sounds</h3>
                    <div className="bg-card/60 backdrop-blur-lg rounded-2xl border border-white/5 shadow-sm p-4 space-y-4">
                        <SettingsToggle 
                            label="Sound Effects" 
                            description="Play subtle sounds during interactions." 
                            isEnabled={settings.isPlayfulMode} 
                            onToggle={() => setPlayfulMode(!settings.isPlayfulMode)} 
                        />
                    </div>
                </div>

                <div className="shrink-0">
                    <h3 className="text-xs font-bold text-dun uppercase tracking-widest px-4 mb-2 font-brand">Automation (n8n)</h3>
                    <div className="bg-card/60 backdrop-blur-lg rounded-2xl border border-white/5 shadow-sm p-4 space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-dun uppercase tracking-tighter ml-1">Webhook URL</label>
                            <input 
                                type="text"
                                value={n8nUrlInput}
                                onChange={(e) => setN8nUrlInput(e.target.value)}
                                onBlur={() => setAutomationSettings({ n8nWebhookUrl: n8nUrlInput })}
                                placeholder="https://n8n.yourserver.com/webhook/..."
                                className="w-full bg-bg-primary/50 text-isabelline p-3 rounded-xl border border-white/10 outline-none focus:border-accent text-sm transition-all"
                            />
                            <p className="text-[10px] text-dun/70 ml-1">Automate tasks when you save journals or expenses.</p>
                        </div>
                    </div>
                </div>

                <div className="shrink-0">
                    <h3 className="text-xs font-bold text-dun uppercase tracking-widest px-4 mb-2 font-brand">Preferences</h3>
                    <div className="bg-card/60 backdrop-blur-lg rounded-2xl border border-white/5 shadow-sm">
                        <MenuItem label="Account" icon={<UserIcon className="w-5 h-5"/>} onClick={() => onNavigate(AppView.ACCOUNT)} isFirst colorClass="bg-blue-500/20 text-blue-400" />
                        <MenuItem label="Language Learning" icon={<GlobeIcon className="w-5 h-5"/>} onClick={() => onNavigate(AppView.LANGUAGE_SETTINGS)} colorClass="bg-green-500/20 text-green-400" />
                        <MenuItem label="Saved Content & Topics" icon={<BookMarkedIcon className="w-5 h-5"/>} onClick={() => onNavigate(AppView.SAVED_CONTENT)} colorClass="bg-yellow-500/20 text-yellow-400" />
                        <MenuItem label="AI Settings" icon={<SparklesIcon className="w-5 h-5"/>} onClick={() => onNavigate(AppView.AI_SETTINGS)} colorClass="bg-purple-500/20 text-purple-400" />
                        <MenuItem label="Appearance" icon={<MonitorIcon className="w-5 h-5"/>} onClick={() => onNavigate(AppView.APPEARANCE)} colorClass="bg-pink-500/20 text-pink-400" />
                        <MenuItem label="My Diary" icon={<BookMarkedIcon className="w-5 h-5"/>} onClick={() => onNavigate(AppView.JOURNALS_LIST)} colorClass="bg-rose-500/20 text-rose-400" />
                        <MenuItem label="Notifications" icon={<BellIcon className="w-5 h-5"/>} onClick={() => onNavigate(AppView.NOTIFICATIONS)} colorClass="bg-orange-500/20 text-orange-400" />
                        <MenuItem label="System Intelligence Report" icon={<ActivityIcon className="w-5 h-5"/>} onClick={() => onNavigate(AppView.GENERAL_REPORT)} colorClass="bg-indigo-500/20 text-indigo-400" />
                        <MenuItem label="Privacy & Security" icon={<LockIcon className="w-5 h-5"/>} onClick={() => onNavigate(AppView.PRIVACY)} isLast colorClass="bg-emerald-500/20 text-emerald-400" />
                    </div>
                </div>

                <div className="shrink-0">
                    <h3 className="text-xs font-bold text-dun uppercase tracking-widest px-4 mb-2 font-brand">Support</h3>
                    <div className="bg-card/60 backdrop-blur-lg rounded-2xl border border-white/5 shadow-sm">
                        <MenuItem label="Help & Support" icon={<HelpCircleIcon className="w-5 h-5"/>} onClick={() => onNavigate(AppView.HELP)} isFirst isLast colorClass="bg-slate-500/20 text-slate-300" />
                    </div>
                </div>
                
                <div className="text-center pt-8 pb-4 shrink-0">
                    <p className="text-xs text-dun/50">Mwijay Note v2.9.0</p>
                </div>
            </div>
        </div>
    );
};

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <button type="button" role="switch" aria-checked={checked} onClick={onChange} className={`${checked ? 'bg-accent' : 'bg-jet/50 border border-dun/30'} relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none`}>
        <span aria-hidden="true" className={`${checked ? 'translate-x-4 bg-cafe' : 'translate-x-0.5 bg-dun'} pointer-events-none inline-block h-4 w-4 mt-0.5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out`}/>
    </button>
);

const SettingsToggle: React.FC<{ label: string; description: string; isEnabled: boolean; onToggle: () => void; }> = ({ label, description, isEnabled, onToggle }) => (
    <div className="flex justify-between items-center">
        <div><h4 className="font-semibold text-isabelline text-sm">{label}</h4><p className="text-xs text-dun">{description}</p></div>
        <ToggleSwitch checked={isEnabled} onChange={onToggle} />
    </div>
);

export default SettingsScreen;
