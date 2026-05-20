
import React from 'react';
import { ArrowLeftIcon, SparklesIcon, WifiIcon, CpuIcon } from './Icons';
import { AiSettings, AiPersonality, AiVoice } from '../types';

interface AiSettingsScreenProps {
    settings: AiSettings;
    onUpdateSettings: (settings: Partial<AiSettings>) => void;
    onBack: () => void;
}

const personalities: AiPersonality[] = ['Friendly', 'Professional', 'Witty', 'Wise'];
const voices: { name: string; value: AiVoice }[] = [
    { name: 'Kore (Female)', value: 'Kore' },
    { name: 'Puck (Male)', value: 'Puck' },
    { name: 'Charon (Male)', value: 'Charon' },
    { name: 'Fenrir (Male)', value: 'Fenrir' },
    { name: 'Zephyr (Female)', value: 'Zephyr' },
    { name: 'Orpheus (Male)', value: 'Orpheus' },
    { name: 'Aoede (Female)', value: 'Aoede' },
    { name: 'Leto (Female)', value: 'Leto' },
];

const offlinePrompts = [
    "Go to home / Open calendar",
    "Play [Track Name] (e.g. Play Rain)",
    "Set timer for X minutes",
    "Change theme to [Name] (e.g. Sunset, Terminal)",
    "Create playlist [Name]",
    "Add [Track] to playlist [Name]",
    "Open Terminal / Resume / Ar Scan"
];

const AiSettingsScreen: React.FC<AiSettingsScreenProps> = ({ settings, onUpdateSettings, onBack }) => {
    return (
        <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-bg-primary">
            <header className="flex items-center mb-8">
                 <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-serif mx-auto">AI Settings</h2>
                <div className="w-10"></div>
            </header>
            
            <div className="space-y-6 pb-32 overflow-y-auto custom-scrollbar">
                <div className="p-4 bg-card rounded-2xl">
                    <SettingsToggle
                        label="Read AI Responses Aloud"
                        description="Automatically play AI chat and summary responses."
                        isEnabled={settings.readAloud}
                        onToggle={() => onUpdateSettings({ readAloud: !settings.readAloud })}
                    />
                </div>

                <div className="p-4 bg-card rounded-2xl">
                    <label htmlFor="ai-personality" className="font-semibold text-isabelline">AI Personality</label>
                    <p className="text-sm text-dun mb-3">Choose the tone for your AI assistant.</p>
                    <select
                        id="ai-personality"
                        value={settings.personality}
                        onChange={e => onUpdateSettings({ personality: e.target.value as AiPersonality })}
                        className="w-full bg-bg-primary border-dun/50 rounded-xl p-3 text-base focus:ring-amber focus:border-accent"
                    >
                        {personalities.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                
                 <div className="p-4 bg-card rounded-2xl">
                    <label htmlFor="ai-voice" className="font-semibold text-isabelline">Text-to-Speech Voice</label>
                    <p className="text-sm text-dun mb-3">Select the voice for reading responses aloud.</p>
                    <select
                        id="ai-voice"
                        value={settings.voice}
                        onChange={e => onUpdateSettings({ voice: e.target.value as AiVoice })}
                        className="w-full bg-bg-primary border-dun/50 rounded-xl p-3 text-base focus:ring-amber focus:border-accent"
                    >
                        {voices.map(v => <option key={v.value} value={v.value}>{v.name}</option>)}
                    </select>
                </div>

                <div className="p-4 bg-card rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <CpuIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-isabelline">Experimental</h3>
                            <p className="text-xs text-dun">Advanced features for power users.</p>
                        </div>
                    </div>
                    <SettingsToggle
                        label="Local Brain (WebLLM)"
                        description="Run a small AI model directly in your browser (Offline Chat). Requires ~4GB download."
                        isEnabled={settings.useLocalLLM || false}
                        onToggle={() => onUpdateSettings({ useLocalLLM: !settings.useLocalLLM })}
                    />
                </div>

                <div className="p-4 bg-card rounded-2xl border border-accent/20 bg-accent/5">
                    <label htmlFor="custom-api-key" className="font-semibold text-isabelline flex items-center gap-2">
                        <SparklesIcon className="w-4 h-4 text-accent" />
                        Manual Gemini API Key
                    </label>
                    <p className="text-xs text-dun mb-3">Optional: Use your own Google AI Studio key to avoid system rate limits.</p>
                    <input
                        id="custom-api-key"
                        type="password"
                        value={settings.customApiKey || ''}
                        onChange={e => onUpdateSettings({ customApiKey: e.target.value })}
                        placeholder="AIzaSy..."
                        className="w-full bg-bg-primary border-dun/30 rounded-xl p-3 text-sm focus:ring-amber focus:border-accent text-isabelline placeholder:text-dun/30"
                    />
                </div>

                <div className="p-4 bg-card rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                            <CpuIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-isabelline">System Connectors</h3>
                            <p className="text-xs text-dun">External service credentials.</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-accent uppercase tracking-widest">Cloudinary (Image Hosting)</label>
                            <input
                                type="text"
                                value={settings.cloudinary?.cloudName || ''}
                                onChange={e => onUpdateSettings({ cloudinary: { ...settings.cloudinary, cloudName: e.target.value } as any })}
                                placeholder="Cloud Name"
                                className="w-full bg-bg-primary border-dun/30 rounded-xl p-3 text-xs text-isabelline"
                            />
                            <input
                                type="text"
                                value={settings.cloudinary?.uploadPreset || ''}
                                onChange={e => onUpdateSettings({ cloudinary: { ...settings.cloudinary, uploadPreset: e.target.value } as any })}
                                placeholder="Upload Preset"
                                className="w-full bg-bg-primary border-dun/30 rounded-xl p-3 text-xs text-isabelline"
                            />
                        </div>

                        <div className="space-y-2 pt-2 border-t border-white/5">
                            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Firebase (Cloud Sync)</label>
                            <input
                                type="password"
                                value={settings.firebase?.apiKey || ''}
                                onChange={e => onUpdateSettings({ firebase: { ...settings.firebase, apiKey: e.target.value } as any })}
                                placeholder="Firebase API Key"
                                className="w-full bg-bg-primary border-dun/30 rounded-xl p-3 text-xs text-isabelline"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    value={settings.firebase?.projectId || ''}
                                    onChange={e => onUpdateSettings({ firebase: { ...settings.firebase, projectId: e.target.value } as any })}
                                    placeholder="Project ID"
                                    className="w-full bg-bg-primary border-dun/30 rounded-xl p-3 text-xs text-isabelline"
                                />
                                <input
                                    type="text"
                                    value={settings.firebase?.appId || ''}
                                    onChange={e => onUpdateSettings({ firebase: { ...settings.firebase, appId: e.target.value } as any })}
                                    placeholder="App ID"
                                    className="w-full bg-bg-primary border-dun/30 rounded-xl p-3 text-xs text-isabelline"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-card rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                            <WifiIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-isabelline">Offline Capabilities</h3>
                            <p className="text-xs text-dun">Commands available without internet.</p>
                        </div>
                    </div>
                    <div className="bg-bg-primary/50 rounded-xl p-3 space-y-2">
                        {offlinePrompts.map((prompt, idx) => (
                            <div key={idx} className="text-sm text-isabelline/80 border-b border-white/5 last:border-0 pb-1 last:pb-0">
                                "{prompt}"
                            </div>
                        ))}
                    </div>
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
        className={`${checked ? 'bg-accent' : 'bg-dun/50'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-jet`}
    >
        <span
            aria-hidden="true"
            className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);


const SettingsToggle: React.FC<{ label: string; description: string; isEnabled: boolean; onToggle: () => void; }> = ({ label, description, isEnabled, onToggle }) => (
    <div className="flex justify-between items-center py-2">
        <div className="pr-4">
            <h4 className="font-semibold">{label}</h4>
            <p className="text-xs text-dun">{description}</p>
        </div>
        <ToggleSwitch checked={isEnabled} onChange={onToggle} />
    </div>
);

export default AiSettingsScreen;
