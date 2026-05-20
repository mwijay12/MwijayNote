
import { Theme, AppView } from '../types';

type AppAction = 
    | { type: 'NAVIGATE', view: AppView }
    | { type: 'CHANGE_THEME', theme: Theme }
    | { type: 'CHANGE_FONT', font: string }
    | { type: 'PLAY_MUSIC', trackName?: string }
    | { type: 'SET_TIMER', minutes: number }
    | { type: 'CREATE_PLAYLIST', name: string }
    | { type: 'ADD_TO_PLAYLIST', trackName: string, playlistName: string };

const featureMap: Record<string, { view: AppView, desc: string }> = {
    // Core
    'home': { view: AppView.HOME, desc: 'Your main dashboard.' },
    'calendar': { view: AppView.CALENDAR, desc: 'View journals, expenses, and reminders by date.' },
    'profile': { view: AppView.PROFILE, desc: 'Your stats, levels, and app settings.' },
    'settings': { view: AppView.SETTINGS, desc: 'Configure themes, fonts, and AI.' },
    'explore': { view: AppView.EXPLORE, desc: 'Discover all tools and widgets.' },
    'ai': { view: AppView.AI, desc: 'Chat with the advanced AI assistant.' },
    'radio': { view: AppView.RADIO, desc: 'Listen to 20+ global radio stations while you work.' },
    
    // Journaling
    'journal': { view: AppView.EDITOR, desc: 'Write a new journal entry.' },
    'voice': { view: AppView.VOICE_JOURNALING, desc: 'Record and transcribe audio journals.' },
    'search': { view: AppView.SEARCH, desc: 'Find past entries using keywords.' },
    'zen': { view: AppView.ZEN_MODE, desc: 'Focus mode with ambient sounds and reading.' },
    'mood': { view: AppView.MOOD_MAP, desc: 'Track your emotional trends over the year.' },
    'review': { view: AppView.ANNUAL_REVIEW, desc: 'Generate your yearly wrap-up.' },
    'gallery': { view: AppView.PHOTO_GALLERY, desc: 'View all photos from your journals.' },
    
    // Finance
    'expenses': { view: AppView.EXPENSES_LIST, desc: 'List of all your transactions.' },
    'budgets': { view: AppView.BUDGETS, desc: 'Set monthly spending limits.' },
    'goals': { view: AppView.GOALS, desc: 'Track savings goals and milestones.' },
    'recurring': { view: AppView.RECURRING_TRANSACTIONS, desc: 'Manage subscriptions and salary.' },
    'accounting': { view: AppView.ACCOUNTING_TRAINER, desc: 'Practice double-entry bookkeeping.' },
    
    // Productivity
    'habits': { view: AppView.HABIT_TRACKER, desc: 'Build streaks for daily habits.' },
    'reminders': { view: AppView.REMINDERS_LIST, desc: 'Manage your tasks and alerts.' },
    'pomodoro': { view: AppView.POMODORO, desc: 'Focus timer (25min work / 5min break).' },
    // 'timetable': { view: AppView.TIMETABLE, desc: 'Student class schedule tracker.' }, // Merged
    'detox': { view: AppView.DETOX, desc: 'Lock the app to focus on the real world.' },
    
    // Engineering & Dev
    'terminal': { view: AppView.TERMINAL, desc: 'Hackerman mode CLI interface.' },
    'snippets': { view: AppView.KODING_STREET, desc: 'Save and manage code snippets.' },
    'leetcode': { view: AppView.LEETCODE, desc: 'Track your algorithm problem progress.' },
    'architecture': { view: AppView.SYSTEM_ARCHITECTURE, desc: 'Generate Mermaid.js diagrams.' },
    'sql': { view: AppView.SQL_PLAYGROUND, desc: 'Practice SQL queries on mock data.' },
    'smart contract': { view: AppView.SMART_CONTRACT, desc: 'Solidity sandbox for blockchain.' },
    'api': { view: AppView.API_CLIENT, desc: 'Test HTTP requests (GET/POST).' },
    'network': { view: AppView.NETWORK_UTILITY, desc: 'Subnet calculator and IP tools.' },
    'runner': { view: AppView.CODE_RUNNER, desc: 'Execute JavaScript code directly.' },
    
    // Career & Business (New Hubs)
    'career': { view: AppView.CAREER_PREP, desc: 'Resume, Interview, and Elevator Pitch.' },
    'academic': { view: AppView.ACADEMIC_HUB, desc: 'Syllabus, Grades, and Timetable.' },
    'startup': { view: AppView.STARTUP_LAB, desc: 'Business Model, SWOT, and Validation.' },
    
    'business': { view: AppView.STARTUP_LAB, desc: 'Canvas for startup planning.' },
    'swot': { view: AppView.STARTUP_LAB, desc: 'Analyze strengths, weaknesses, etc.' },
    'pitch': { view: AppView.STARTUP_LAB, desc: 'Generate startup pitch slides.' },
    'card': { view: AppView.BUSINESS_CARD, desc: 'Create a digital business card.' },
    'ideas': { view: AppView.STARTUP_LAB, desc: 'Find startup ideas for Tanzania.' },
    
    // Learning
    'flashcards': { view: AppView.FLASHCARDS_LIST, desc: 'Spaced repetition study decks.' },
    'skills': { view: AppView.SKILL_TREE, desc: 'Gamified learning paths.' },
    'glossary': { view: AppView.GLOSSARY, desc: 'Tech dictionary.' },
    'scholarships': { view: AppView.SCHOLARSHIP_TRACKER, desc: 'Track grant applications.' },
    // 'study': { view: AppView.STUDY_ASSISTANT, desc: 'Analyze PDFs and generate quizzes.' }, // Merged
    
    // Tools
    'ar': { view: AppView.AR_COMPONENT_SCAN, desc: 'Identify electronics via camera.' },
    'podcast': { view: AppView.PODCAST, desc: 'Summarize audio/video files.' },
    'radar': { view: AppView.TECH_RADAR, desc: 'Find local tech events.' },
    'shortcuts': { view: AppView.SHORTCUTS, desc: 'View keyboard hotkeys.' },
};

export const processOfflineCommand = (input: string): { text: string; action?: AppAction } | null => {
    const lower = input.toLowerCase().trim();

    // 1. Identity
    if (lower.includes('who are you') || lower.includes('your name')) {
        return { text: "I am Mwijay Note, your personal AI companion for growth, coding, and life management." };
    }

    // 2. Achievements Query
    if (lower.includes('achievement') || lower.includes('trophies') || lower.includes('badges')) {
        const stored = localStorage.getItem('mwijay_achievements');
        const count = stored ? JSON.parse(stored).length : 0;
        return { 
            text: `You have unlocked ${count} achievements so far! Keep exploring to find more secrets.`,
            action: { type: 'NAVIGATE', view: AppView.ACHIEVEMENTS }
        };
    }

    // 3. Feature Explanations ("What is X?", "How does X work?")
    if (lower.startsWith('what is') || lower.startsWith('how does') || lower.startsWith('explain')) {
        const query = lower.replace('what is', '').replace('how does', '').replace('explain', '').replace('work', '').trim();
        // Fuzzy match
        const match = Object.keys(featureMap).find(key => query.includes(key));
        if (match) {
            return { 
                text: `${featureMap[match].desc} Would you like to open it?`,
                action: { type: 'NAVIGATE', view: featureMap[match].view }
            };
        }
    }

    // 4. Navigation & "Open" Commands
    // Check specific keywords first
    for (const [key, feature] of Object.entries(featureMap)) {
        if (lower.includes(key) && (lower.includes('open') || lower.includes('go') || lower.includes('show') || lower === key)) {
            return { text: `Opening ${key}...`, action: { type: 'NAVIGATE', view: feature.view } };
        }
    }

    // 5. Themes
    if (lower.includes('theme')) {
        if (lower.includes('sunset')) return { text: "Applying Sunset.", action: { type: 'CHANGE_THEME', theme: 'sunset' } };
        if (lower.includes('forest')) return { text: "Applying Forest.", action: { type: 'CHANGE_THEME', theme: 'forest' } };
        if (lower.includes('matrix') || lower.includes('terminal')) return { text: "Entering the Matrix.", action: { type: 'CHANGE_THEME', theme: 'terminal' } };
        if (lower.includes('dark')) return { text: "Going Dark.", action: { type: 'CHANGE_THEME', theme: 'default-dark' } };
        if (lower.includes('light') || lower.includes('coffee')) return { text: "Lights on.", action: { type: 'CHANGE_THEME', theme: 'coffee' } };
    }

    // 6. Music / Radio
    if (lower.includes('radio') || lower.includes('station') || lower.includes('music')) {
        return { text: "Opening Mwijay Radio.", action: { type: 'NAVIGATE', view: AppView.RADIO } };
    }

    // 7. Timer
    const timerMatch = lower.match(/timer.*(\d+)/);
    if (timerMatch) {
        return { text: `Timer set for ${timerMatch[1]} minutes.`, action: { type: 'SET_TIMER', minutes: parseInt(timerMatch[1]) } };
    }

    // 8. Help Fallback
    if (lower === 'help' || lower === 'features') {
        return { text: "I can help you navigate! Try 'Open Zen Mode', 'Explain Flashcards', 'Show my budget', or 'Start Radio'." };
    }

    return null;
};