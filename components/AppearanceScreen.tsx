import React from 'react';
import { ArrowLeftIcon, PaletteIcon, SparklesIcon, WindIcon, XIcon, TypeIcon, ZapIcon, ActivityIcon } from './Icons';
import { AppSettings, DARK_THEMES, LIGHT_THEMES } from '../hooks/useSettings';
import { Theme, GreetingStyle, BackgroundEffectType, TargetLanguage } from '../types';

interface AppearanceScreenProps {
    settings: AppSettings;
    onSetFontFamily: (font: string) => void;
    onSetFontSize: (size: number) => void;
    onSetPlayfulMode: (isOn: boolean) => void;
    onSetTheme: (theme: Theme) => void;
    onSetGreetingStyle: (style: GreetingStyle) => void;
    onSetBackgroundEffect: (effect: BackgroundEffectType) => void;
    onSetTargetLanguage: (lang: TargetLanguage) => void;
    onBack: () => void;
}

const fonts = {
    'Sans-Serif': [
        { name: 'Inter', value: "'Inter', sans-serif" },
        { name: 'Roboto', value: "'Roboto', sans-serif" },
        { name: 'Poppins', value: "'Poppins', sans-serif" },
    ],
    'Serif': [
        { name: 'Playfair', value: "'Playfair Display', serif" },
        { name: 'Lora', value: "'Lora', serif" },
    ],
    'Handwriting': [
        { name: 'Caveat', value: "'Caveat', cursive" },
        { name: 'Dancing', value: "'Dancing Script', cursive" },
    ],
    'Monospace': [
        { name: 'JetBrains', value: "'JetBrains Mono', monospace" },
        { name: 'Fira Code', value: "'Fira Code', monospace" },
    ]
};

const ThemeButton: React.FC<{ theme: any, isActive: boolean, onClick: () => void }> = ({ theme, isActive, onClick }) => (
    <button 
        onClick={onClick} 
        className={`p-3 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 group ${isActive ? 'border-accent bg-card shadow-2xl scale-105' : 'border-transparent bg-card/40 hover:bg-card/60'}`}
    >
        <div className="w-10 h-10 rounded-full shadow-lg transition-transform group-hover:scale-110" style={{ background: theme.color, border: '2px solid rgba(255,255,255,0.1)' }}></div>
        <span className="text-[9px] font-black text-isabelline truncate w-full uppercase tracking-widest">{theme.name}</span>
    </button>
);

const AppearanceScreen: React.FC<AppearanceScreenProps> = ({ settings, onSetFontFamily, onSetFontSize, onSetPlayfulMode, onSetTheme, onSetBackgroundEffect, onBack }) => {
    return (
        <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-bg-primary">
            <header className="flex items-center mb-8">
                <button onClick={onBack} className="p-3 rounded-2xl bg-card border border-white/10 text-isabelline shadow-xl transition-transform active:scale-95"><ArrowLeftIcon className="w-6 h-6" /></button>
                <h2 className="text-2xl font-brand font-black mx-auto text-isabelline tracking-tighter uppercase tracking-widest">Prestige OS</h2>
                <div className="w-12"></div>
            </header>

            <div className="flex-grow overflow-y-auto space-y-10 pb-28 custom-scrollbar px-2">
                
                {/* THEME COLLECTION */}
                <div className="space-y-8">
                    <div>
                        <h3 className="text-dun text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-60">Dark Collection</h3>
                        <div className="grid grid-cols-4 gap-4">
                            {DARK_THEMES.map(t => <ThemeButton key={t.id} theme={t} isActive={settings.theme === t.id} onClick={() => onSetTheme(t.id)} />)}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-dun text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-60">Light Collection</h3>
                        <div className="grid grid-cols-4 gap-4">
                            {LIGHT_THEMES.map(t => <ThemeButton key={t.id} theme={t} isActive={settings.theme === t.id} onClick={() => onSetTheme(t.id)} />)}
                        </div>
                    </div>
                </div>

                {/* TYPOGRAPHY */}
                <div className="bg-card p-8 rounded-[3rem] border border-white/10 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-brand font-black text-isabelline flex items-center gap-2">Typography</h3>
                        <span className="text-5xl font-mono font-black text-accent">{settings.fontSize}</span>
                    </div>
                    <input 
                        type="range" min="12" max="32" step="1" 
                        value={settings.fontSize} 
                        onChange={(e) => onSetFontSize(parseInt(e.target.value))}
                        className="w-full h-2 bg-jet rounded-full appearance-none accent-amber cursor-pointer mb-10"
                    />
                    <div className="space-y-8">
                        {Object.entries(fonts).map(([cat, list]) => (
                            <div key={cat}>
                                <p className="text-[10px] text-dun uppercase font-black tracking-[0.2em] mb-4 border-b border-white/5 pb-2">{cat}</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {list.map(f => (
                                        <button 
                                            key={f.name}
                                            onClick={() => onSetFontFamily(f.value)}
                                            className={`py-4 px-4 rounded-2xl text-base transition-all border-2 ${settings.fontFamily === f.value ? 'bg-accent text-cafe border-accent shadow-lg scale-105' : 'bg-jet/50 text-isabelline border-white/10 hover:border-accent/30'}`}
                                            style={{ fontFamily: f.value }}
                                        >
                                            {f.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* VISUAL ENVIRONMENT */}
                <div className="bg-card p-8 rounded-[3rem] border border-white/10 shadow-2xl">
                    <h3 className="text-xl font-brand font-black text-isabelline mb-6">Visual Environment</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {(['auto', 'fluid', 'matrix', 'off'] as const).map(effect => (
                            <button 
                                key={effect}
                                onClick={() => onSetBackgroundEffect(effect)}
                                className={`flex items-center gap-4 p-5 rounded-2xl transition-all border-2 ${settings.backgroundEffect === effect ? 'bg-accent text-cafe border-accent shadow-lg scale-105' : 'bg-jet/50 text-isabelline border-white/10 hover:border-accent/20'}`}
                            >
                                <ZapIcon className={`w-5 h-5 ${settings.backgroundEffect === effect ? 'text-cafe' : 'text-accent'}`}/>
                                <span className="text-xs font-black uppercase tracking-widest">{effect}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-10 flex justify-between items-center bg-jet/30 p-6 rounded-3xl border border-white/5">
                        <div>
                            <h4 className="text-base font-bold text-isabelline">Haptic Feedback</h4>
                            <p className="text-[10px] text-dun uppercase font-bold mt-1">Tactile UI Response</p>
                        </div>
                        <button 
                            onClick={() => onSetPlayfulMode(!settings.isPlayfulMode)}
                            className={`w-14 h-8 rounded-full transition-colors relative flex items-center ${settings.isPlayfulMode ? 'bg-accent' : 'bg-white/10'}`}
                        >
                            <div className={`absolute w-6 h-6 rounded-full bg-isabelline shadow-xl transition-transform duration-300 ${settings.isPlayfulMode ? 'translate-x-7' : 'translate-x-1'}`}></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppearanceScreen;
