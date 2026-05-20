import { useState, useEffect, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';
import { AiSettings, AiPersonality, AiVoice, VALID_TTS_VOICES, Theme, GreetingStyle, BackgroundEffectType, TargetLanguage } from '../types';

const SETTINGS_KEY = 'mwijay_settings';

export interface NotificationSettings {
    dailyReminder: boolean;
    weeklySummary: boolean;
    newFeatures: boolean;
}

export interface ContentPreferences {
    showPsychology: boolean;
    showFunFacts: boolean;
    showLifeHacks: boolean;
}

export interface AutomationSettings {
    n8nWebhookUrl?: string;
}

export interface AppSettings {
    theme: Theme;
    notifications: NotificationSettings;
    contentPreferences: ContentPreferences;
    fontFamily: string;
    fontSize: number;
    ai: AiSettings;
    automation: AutomationSettings;
    isPlayfulMode: boolean;
    greetingStyle: GreetingStyle;
    backgroundEffect: BackgroundEffectType;
    targetLanguage: TargetLanguage;
    autoDarkMode: boolean;
}

const defaultSettings: AppSettings = {
    theme: 'default-dark',
    notifications: { dailyReminder: true, weeklySummary: false, newFeatures: true },
    contentPreferences: { showPsychology: true, showFunFacts: true, showLifeHacks: true },
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    ai: { personality: 'Friendly', voice: 'Kore', readAloud: false },
    automation: {},
    isPlayfulMode: true,
    greetingStyle: 'time-based',
    backgroundEffect: 'fluid',
    targetLanguage: 'French',
    autoDarkMode: false,
};

// PRESTIGE SYMMETRIC PAIRS MAP
const THEME_PAIRS: Record<string, Theme> = {
    'obsidian': 'moleskine',
    'moleskine': 'obsidian',
    'deep-space': 'polar',
    'polar': 'deep-space',
    'cyber': 'sakura',
    'sakura': 'cyber',
    'chocolate': 'coffee',
    'coffee': 'chocolate',
    'slate': 'cloudy',
    'cloudy': 'slate',
    'terminal': 'mint',
    'mint': 'terminal',
    'default-dark': 'sunny',
    'sunny': 'default-dark',
    'sunset': 'peach',
    'peach': 'sunset',
};

export const DARK_THEMES: { id: Theme; name: string; color: string }[] = [
    { id: 'default-dark', name: 'Midnight', color: '#080a0f' },
    { id: 'obsidian', name: 'Obsidian', color: '#000000' },
    { id: 'deep-space', name: 'Deep Space', color: '#020617' },
    { id: 'cyber', name: 'Pink Dark', color: '#0f0b18' },
    { id: 'chocolate', name: 'Chocolate', color: '#1c1917' },
    { id: 'slate', name: 'Grey Dark', color: '#0f172a' },
    { id: 'terminal', name: 'Green Dark', color: '#000000' },
    { id: 'sunset', name: 'Orange Dark', color: '#451a03' },
];

export const LIGHT_THEMES: { id: Theme; name: string; color: string }[] = [
    { id: 'sunny', name: 'High Noon', color: '#fffbeb' },
    { id: 'moleskine', name: 'Classic White', color: '#f5f5f5' },
    { id: 'polar', name: 'Cold Light', color: '#f0f9ff' },
    { id: 'sakura', name: 'Pink Light', color: '#fff1f2' },
    { id: 'coffee', name: 'Morning Coffee', color: '#fdfbf7' },
    { id: 'cloudy', name: 'Grey Light', color: '#f8fafc' },
    { id: 'mint', name: 'Green Light', color: '#f0fdf4' },
    { id: 'peach', name: 'Orange Light', color: '#fff7ed' },
];

export const ALL_THEMES = [...DARK_THEMES, ...LIGHT_THEMES];

export const useSettings = () => {
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            const { value } = await Preferences.get({ key: SETTINGS_KEY });
            if (value) {
                setSettings({ ...defaultSettings, ...JSON.parse(value) });
            } else {
                // System dark mode detection for first load
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (prefersDark) {
                    setSettings(s => ({ ...s, theme: 'default-dark' }));
                }
            }
            setIsLoading(false);
        };
        loadSettings();
    }, []);

    const save = async (s: AppSettings) => {
        await Preferences.set({
            key: SETTINGS_KEY,
            value: JSON.stringify(s)
        });
        setSettings(s);
    };

    const setTheme = useCallback((t: Theme) => save({ ...settings, theme: t }), [settings]);

    const toggleDayNight = useCallback(() => {
        const current = settings.theme;
        // Find the pair or fallback to a sensible default
        const next = THEME_PAIRS[current] || (DARK_THEMES.some(t => t.id === current) ? 'sunny' : 'default-dark');
        setTheme(next);
    }, [settings.theme, setTheme]);

    // Auto Dark Mode Logic (6 PM - 6 AM)
    useEffect(() => {
        if (!settings.autoDarkMode) return;

        const checkTime = () => {
            const hour = new Date().getHours();
            const isNight = hour >= 18 || hour < 6;
            const isCurrentlyDark = DARK_THEMES.some(t => t.id === settings.theme);

            if (isNight && !isCurrentlyDark) {
                // Switch to dark version of current theme if possible, else default dark
                const next = THEME_PAIRS[settings.theme] || 'default-dark';
                if (DARK_THEMES.some(t => t.id === next)) setTheme(next);
            } else if (!isNight && isCurrentlyDark) {
                // Switch to light version of current theme if possible, else sunny
                const next = THEME_PAIRS[settings.theme] || 'sunny';
                if (LIGHT_THEMES.some(t => t.id === next)) setTheme(next);
            }
        };

        checkTime();
        const interval = setInterval(checkTime, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [settings.autoDarkMode, settings.theme, setTheme]);

    useEffect(() => {
        document.body.className = `theme-${settings.theme}`;

        // Inject a <style> element with !important — this is the ONLY reliable way to
        // override Tailwind v4 utility classes for font-family globally.
        let styleEl = document.getElementById('mwijay-dynamic-style') as HTMLStyleElement | null;
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'mwijay-dynamic-style';
            document.head.appendChild(styleEl);
        }
        styleEl.textContent = `
            :root {
                --font-primary: ${settings.fontFamily};
                --font-sans: ${settings.fontFamily};
            }
            body, body *:not(.font-brand):not(.font-serif):not(.font-mono) {
                font-family: ${settings.fontFamily} !important;
            }
            body { font-size: ${settings.fontSize}px !important; }
        `;
    }, [settings.theme, settings.fontFamily, settings.fontSize]);

    return { 
        settings, 
        setTheme, 
        toggleDayNight,
        setNotificationSettings: (n: any) => save({ ...settings, notifications: { ...settings.notifications, ...n } }),
        setContentPreferences: (c: any) => save({ ...settings, contentPreferences: { ...settings.contentPreferences, ...c } }),
        setFontFamily: (f: string) => save({ ...settings, fontFamily: f }),
        setFontSize: (s: number) => save({ ...settings, fontSize: s }),
        setAiSettings: (a: any) => save({ ...settings, ai: { ...settings.ai, ...a } }),
        setPlayfulMode: (p: boolean) => save({ ...settings, isPlayfulMode: p }),
        setGreetingStyle: (g: GreetingStyle) => save({ ...settings, greetingStyle: g }),
        setBackgroundEffect: (e: BackgroundEffectType) => save({ ...settings, backgroundEffect: e }),
        setTargetLanguage: (l: TargetLanguage) => save({ ...settings, targetLanguage: l }),
        setAutoDarkMode: (a: boolean) => save({ ...settings, autoDarkMode: a }),
        setAutomationSettings: (aut: any) => save({ ...settings, automation: { ...settings.automation, ...aut } })
    };
};