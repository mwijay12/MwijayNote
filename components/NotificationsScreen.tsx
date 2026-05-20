import React from 'react';
import { ArrowLeftIcon, BellIcon, SparklesIcon, CalendarIcon, ZapIcon } from './Icons';
import { NotificationSettings } from '../hooks/useSettings';

interface NotificationsScreenProps {
    settings: NotificationSettings;
    onUpdateSettings: (settings: Partial<NotificationSettings>) => void;
    onBack: () => void;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ settings, onUpdateSettings, onBack }) => {
    return (
        <div className="flex flex-col h-full animate-slide-in-from-right bg-jet overflow-y-auto no-scrollbar">
            <header className="sticky top-0 z-10 bg-jet/80 backdrop-blur-xl border-b border-white/10 p-4 pt-12 flex items-center">
                 <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
                    <ArrowLeftIcon className="w-6 h-6 text-isabelline" />
                </button>
                <h2 className="text-xl font-brand font-bold text-isabelline mx-auto">Alert Center</h2>
                <div className="w-10"></div>
            </header>
            
            <div className="p-6 space-y-8">
                <div className="bg-gradient-to-br from-amber/20 to-orange-600/20 p-6 rounded-[2.5rem] border border-accent/20 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-jet shadow-lg">
                        <BellIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-isabelline">Smart Alerts</h3>
                        <p className="text-xs text-dun">AI-powered reminders tailored to your rhythm.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-black text-accent uppercase tracking-widest px-2">Preferences</h3>
                    
                    <NotificationToggle
                        icon={<SparklesIcon className="w-5 h-5 text-accent" />}
                        label="Daily Reflection"
                        description="Gentle nudge to capture your day's wins."
                        isEnabled={settings.dailyReminder}
                        onToggle={() => onUpdateSettings({ dailyReminder: !settings.dailyReminder })}
                    />
                    <NotificationToggle
                        icon={<CalendarIcon className="w-5 h-5 text-blue-400" />}
                        label="Weekly Intelligence"
                        description="Deep dive into your habits and growth."
                        isEnabled={settings.weeklySummary}
                        onToggle={() => onUpdateSettings({ weeklySummary: !settings.weeklySummary })}
                    />
                    <NotificationToggle
                        icon={<ZapIcon className="w-5 h-5 text-purple-400" />}
                        label="System Updates"
                        description="New tools and intelligence features."
                        isEnabled={settings.newFeatures}
                        onToggle={() => onUpdateSettings({ newFeatures: !settings.newFeatures })}
                    />
                </div>

                <div className="bg-card p-6 rounded-3xl border border-white/5">
                    <p className="text-[10px] text-dun text-center leading-relaxed">
                        Notifications are delivered via your browser or device system. 
                        Ensure permissions are enabled in your OS settings for the best experience.
                    </p>
                </div>
            </div>
        </div>
    );
};

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`${checked ? 'bg-accent' : 'bg-white/10'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2 focus:ring-offset-jet`}
    >
        <span
            aria-hidden="true"
            className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-isabelline shadow-lg ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);


const NotificationToggle: React.FC<{ icon: React.ReactNode; label: string; description: string; isEnabled: boolean; onToggle: () => void; }> = ({ icon, label, description, isEnabled, onToggle }) => (
    <div className="flex justify-between items-center p-5 bg-card rounded-[2rem] border border-white/5 hover:border-white/10 transition-colors">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-jet/50 flex items-center justify-center border border-white/5">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-isabelline text-sm">{label}</h4>
                <p className="text-[10px] text-dun opacity-70">{description}</p>
            </div>
        </div>
        <ToggleSwitch checked={isEnabled} onChange={onToggle} />
    </div>
);

export default NotificationsScreen;
