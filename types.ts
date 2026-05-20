
import React from 'react';

export enum AppView {
  SPLASH = 'SPLASH',
  ONBOARDING = 'ONBOARDING',
  APP_LOCK = 'APP_LOCK',
  HOME = 'HOME',
  AI = 'AI',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
  LANGUAGE_SETTINGS = 'LANGUAGE_SETTINGS',
  EXPLORE = 'EXPLORE',
  CALENDAR = 'CALENDAR',
  EDITOR = 'EDITOR',
  JOURNAL_PREVIEW = 'JOURNAL_PREVIEW',
  EXPENSE_EDITOR = 'EXPENSE_EDITOR',
  REMINDER_EDITOR = 'REMINDER_EDITOR',
  EXPENSES_LIST = 'EXPENSES_LIST',
  REMINDERS_LIST = 'REMINDERS_LIST',
  GUIDED_JOURNEY = 'GUIDED_JOURNEY',
  JOURNEYS_LIST = 'JOURNEYS_LIST',
  ACCOUNT = 'ACCOUNT',
  NOTIFICATIONS = 'NOTIFICATIONS',
  APPEARANCE = 'APPEARANCE',
  PRIVACY = 'PRIVACY',
  AI_SETTINGS = 'AI_SETTINGS',
  GOALS = 'GOALS',
  BUDGETS = 'BUDGETS',
  RECURRING_TRANSACTIONS = 'RECURRING_TRANSACTIONS',
  HABIT_TRACKER = 'HABIT_TRACKER',
  INSIGHTS = 'INSIGHTS',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
  ZEN_MODE = 'ZEN_MODE',
  FLASHCARDS_LIST = 'FLASHCARDS_LIST',
  FLASHCARD_EDITOR = 'FLASHCARD_EDITOR',
  FLASHCARD_STUDY = 'FLASHCARD_STUDY',
  SEARCH = 'SEARCH',
  PHOTO_GALLERY = 'PHOTO_GALLERY',
  TEMPLATES_MANAGER = 'TEMPLATES_MANAGER',
  HELP = 'HELP',
  VOICE_JOURNALING = 'VOICE_JOURNALING',
  AI_LIVE_CONVERSATION = 'AI_LIVE_CONVERSATION',
  AI_IMAGE_STUDIO = 'AI_IMAGE_STUDIO',
  ANNUAL_REVIEW = 'ANNUAL_REVIEW',
  MOOD_MAP = 'MOOD_MAP',
  NEWS = 'NEWS',
  AI_COACH = 'AI_COACH',
  SAVED_CONTENT = 'SAVED_CONTENT',
  PRAYER_TIMELINE = 'PRAYER_TIMELINE',
  SUBSCRIPTION_MANAGER = 'SUBSCRIPTION_MANAGER',
  PODCAST = 'PODCAST',
  DETOX = 'DETOX', // Kept enum but disabled in UI just in case logic uses it
  RADIO = 'RADIO',
  MUSIC_HUB = 'MUSIC_HUB',
  GLOBAL_MINI_PLAYER = 'GLOBAL_MINI_PLAYER',
  SHORTCUTS = 'SHORTCUTS',
  GENERAL_REPORT = 'GENERAL_REPORT',
  JOURNALS_LIST = 'JOURNALS_LIST',
  FILE_MANAGER = 'FILE_MANAGER',
  
  // Engineering / IT
  KODING_STREET = 'KODING_STREET',
  CODE_SNIPPET_EDITOR = 'CODE_SNIPPET_EDITOR',
  RUBBER_DUCK = 'RUBBER_DUCK',
  TERMINAL = 'TERMINAL',
  LEETCODE = 'LEETCODE',
  SYSTEM_ARCHITECTURE = 'SYSTEM_ARCHITECTURE',
  SQL_PLAYGROUND = 'SQL_PLAYGROUND',
  SMART_CONTRACT = 'SMART_CONTRACT',
  CODE_RUNNER = 'CODE_RUNNER',
  API_CLIENT = 'API_CLIENT',
  NETWORK_UTILITY = 'NETWORK_UTILITY',
  TECH_RADAR = 'TECH_RADAR',
  AR_COMPONENT_SCAN = 'AR_COMPONENT_SCAN', // Disabled in UI
  ERD_DESIGNER = 'ERD_DESIGNER',
  WHITEBOARD = 'WHITEBOARD',

  // Hubs (Merged Features)
  STARTUP_LAB = 'STARTUP_LAB',      // Merges: Business Model, SWOT, Validator, Name Gen, Ideas, Pitch Deck
  CAREER_PREP = 'CAREER_PREP',      // Merges: Interview, Elevator Pitch, Resume, Career Map
  ACADEMIC_HUB = 'ACADEMIC_HUB',    // Merges: Syllabus, Grades, Excel, Study Assistant, Timetable
  
  // Standalone Features
  BUSINESS_CARD = 'BUSINESS_CARD',
  SCHOLARSHIP_TRACKER = 'SCHOLARSHIP_TRACKER', // Disabled in UI
  VIRTUAL_INTERNSHIP = 'VIRTUAL_INTERNSHIP',
  ACCOUNTING_TRAINER = 'ACCOUNTING_TRAINER',
  PROJECT_PORTFOLIO = 'PROJECT_PORTFOLIO',
  GLOSSARY = 'GLOSSARY',
  SKILL_TREE = 'SKILL_TREE',
  COST_ESTIMATOR = 'COST_ESTIMATOR',
  INTERLINK = 'INTERLINK',
  HANGUL_CANVAS = 'HANGUL_CANVAS', // Disabled in UI
  POMODORO = 'POMODORO',

  // Restored Individual Views referenced in App.tsx
  BUSINESS_IDEAS = 'BUSINESS_IDEAS',
  PITCH_DECK = 'PITCH_DECK',
  SWOT_ANALYSIS = 'SWOT_ANALYSIS',
  STARTUP_VALIDATOR = 'STARTUP_VALIDATOR',
  LECTURE_SUMMARIZER = 'LECTURE_SUMMARIZER',
  CONTENT_CREATOR = 'CONTENT_CREATOR',
  RESUME = 'RESUME',
  BUSINESS_MODEL = 'BUSINESS_MODEL',
  FINANCIAL_RATIOS = 'FINANCIAL_RATIOS',
  STUDY_ASSISTANT = 'STUDY_ASSISTANT',
  CAREER_MAPPER = 'CAREER_MAPPER',
  INTERVIEW_SIMULATOR = 'INTERVIEW_SIMULATOR',
  CURRENCY_CONVERTER = 'CURRENCY_CONVERTER',
  GRADE_CALCULATOR = 'GRADE_CALCULATOR',
  STARTUP_NAME_GEN = 'STARTUP_NAME_GEN',
  ELEVATOR_PITCH = 'ELEVATOR_PITCH',
  SYLLABUS_TRACKER = 'SYLLABUS_TRACKER',
  TIMETABLE = 'TIMETABLE'
}

export type JournalFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export type JournalType = 
  | 'Gratitude Journal'
  | 'Lucid Dream Log'
  | 'Relationship Check'
  | 'Embrace and Commit'
  | 'Positive Psychology'
  | 'Morning Intention'
  | 'Evening Reflection'
  | 'Guided Journey'
  | 'Time Capsule'
  | 'Prayer Journal'
  | 'Engineering Log'
  | 'Content Idea'
  | 'Bible Study'
  | 'Sermon Notes'
  | 'Daily Journal'
  | 'Voice Note';

export enum JournalTopic {
    GRATITUDE = 'gratitude and thankfulness',
    DREAM = 'dreams and subconscious thoughts',
    RELATIONSHIP = 'relationships with loved ones',
    COMMITMENT = 'personal commitments and change',
    POSITIVE = 'positive psychology and optimism',
    MORNING = 'morning intentions and goals for the day',
    EVENING = 'evening reflections and review of the day',
    GUIDED = 'a specific guided theme',
    CAPSULE = 'a message to my future self',
    PRAYER = 'prayer and spiritual reflection',
    ENGINEERING = 'coding challenges and engineering concepts',
    CONTENT = 'content creation ideas and scripts',
    BIBLE = 'scripture study and reflection',
    SERMON = 'sermon notes and application',
    PERSONAL = 'personal growth and daily life',
    VOICE = 'voice notes and spoken thoughts'
}


export interface FileData {
  name: string;
  type: string; // MIME type
  data?: string; // base64 encoded data
  url?: string; // remote storage URL (Cloudinary)
}

export interface ToDo {
  id: string;
  text: string;
  completed: boolean;
}

export interface WeatherData {
    temperature: number;
    condition: string; // e.g., 'Sunny', 'Rainy'
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string; // Will store HTML content
  date: string;
  type: JournalType;
  topic: JournalTopic;
  files?: FileData[];
  mood?: number; // 1-5 scale for mood
  tasks?: ToDo[];
  tags?: string[];
  background?: string;
  isPinned?: boolean;
  isDraft?: boolean; // true = auto-saved draft, not yet published
  coverImage?: string;
  patternIndex?: number;
  location?: string;
  shouldGenerateCover?: boolean;
  unlockDate?: string; // ISO Date string for Time Capsules
  weather?: WeatherData;
  sleepHours?: number;
  scriptureReference?: string; // For Bible Study
  speaker?: string; // For Sermon Notes
  isLocked?: boolean; // New: Biometric/PIN Lock specific entry
}

// Represents a financial transaction, which can be an expense or income.
export interface Expense {
    id: string;
    name: string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
    category?: string;
    files?: FileData[];
    goalId?: string;
}

export interface Reminder {
    id: string;
    title: string;
    date: string;
    completed: boolean;
    frequency?: 'none' | 'daily' | 'weekly' | 'monthly';
    isTimetable?: boolean;
    timetableDay?: string; // e.g., 'Mon'
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly';
}

export type GoalCategory = 'Financial' | 'Academic' | 'Personal';

export interface Milestone {
  id: string;
  text: string;
  completed: boolean;
}

export interface Goal {
  id:string;
  name: string;
  targetAmount: number;
  category: GoalCategory;
  milestones?: Milestone[];
  createdAt?: string;
  completedAt?: string;
  status?: 'In Progress' | 'Completed' | 'On Hold';
}

export interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string; // ISO string
  lastCreatedDate?: string; // ISO string to track when the last transaction was made
}

export interface Exam {
    id: string;
    subject: string;
    date: string;
}

export interface UserActivity {
    lastNewsRead?: string;
    lastPlanningSession?: string;
}

export interface UserData {
  name: string;
  email?: string;
  password?: string;
  profilePicture?: string; // Emoji or base64 image data url
  customLogo?: string; // Base64 image for reports/branding
  pin?: string; // 4-digit PIN
  journeyProgress?: {
    [journeyId: string]: number; // key is journeyId, value is last completed step index
  }
  growthPoints?: number;
  exams?: Exam[];
  activityLog?: UserActivity;
  streakFreezes?: number;
  onboardedAt?: string;
}

export interface JournalRoutine {
    type: JournalType;
    topic: JournalTopic;
    description: string;
    frequency: JournalFrequency;
    icon: React.ReactNode;
}

export interface JourneyStep {
  day: number;
  title: string;
  prompt: string;
}

export interface Journey {
  id: string;
  title: string;
  description: string;
  steps: JourneyStep[];
}

export interface HabitCompletion {
  [date: string]: boolean; // key is YYYY-MM-DD
}

export interface Habit {
  id: string;
  name: string;
  icon: string; // emoji
  frequency: 'daily';
  completions: HabitCompletion;
  streak?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isUnlocked: boolean;
}

export type AiCoachAction = 'gratitude_journal' | 'zen_mode' | 'start_journey';

export interface AiCoachingSuggestion {
    id: string; // Unique ID for the suggestion (e.g., 'low_mood_streak_1')
    suggestion: string;
    actionLabel: string;
    action: AiCoachAction;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  interval?: number; // Days until next review
  repetition?: number; // Consecutive successful reviews
  efactor?: number; // Easiness factor (SM-2)
  nextReviewDate?: string; // ISO date string
}

export interface FlashcardDeck {
  id: string;
  title: string;
  cards: Flashcard[];
}
export interface CustomTemplate {
  id: string;
  name: string;
  content: string;
}

export interface UserTrack {
  id?: string;
  name: string;
  url: string; // base64 data URL
}

export interface Playlist {
    id: string;
    name: string;
    trackIds: string[];
}

export type AiPersonality = 'Friendly' | 'Professional' | 'Witty' | 'Wise';

export const VALID_TTS_VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr', 'Orpheus', 'Aoede', 'Leto'] as const;
export type AiVoice = typeof VALID_TTS_VOICES[number];

export interface AiSettings {
    personality: AiPersonality;
    voice: AiVoice;
    readAloud: boolean;
    useLocalLLM?: boolean; 
    customApiKey?: string;
    cloudinary?: {
        cloudName: string;
        uploadPreset: string;
    };
    firebase?: {
        apiKey: string;
        authDomain: string;
        projectId: string;
        storageBucket: string;
        messagingSenderId: string;
        appId: string;
    };
}

export interface TranscriptionEntry {
    id: number;
    user: string;
    model: string;
}

export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  createdAt: string;
}

export interface NewsArticle {
    title: string;
    url: string;
    snippet: string;
    source: string;
}

export type Theme = 
  | 'default-dark' | 'sunset' | 'forest' | 'lavender' | 'obsidian' | 'deep-space' | 'cyber' | 'chocolate' | 'slate'
  | 'coffee' | 'polar' | 'rose' | 'mint' | 'sunny' | 'cloudy' | 'classic' | 'mist' | 'peach' | 'classic' | 'parchment' | 'moleskine' | 'sakura'
  | 'terminal' | 'hangul';

export type GreetingStyle = 'time-based' | 'simple';

export type QuoteTopic = 
    | 'Motivation' | 'Stoicism' | 'Love' | 'Success' | 'Discipline' 
    | 'Happiness' | 'Wisdom' | 'Mindfulness' | 'Creativity' | 'Gratitude' 
    | 'Faith' | 'Engineering';

export interface SocialShareConfig {
    text: string;
    authorOrTitle?: string;
    type: 'quote' | 'journal' | 'code';
    theme?: string;
    language?: string; // For code highlighting
}

export type BackgroundEffectType = 'auto' | 'matrix' | 'particles' | 'fluid' | 'off';
export type TargetLanguage = 'French' | 'English' | 'Swahili';

export interface ActionItem {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    action: () => void;
    priority: 'high' | 'medium' | 'low';
}

export type ContentPlatform = 'LinkedIn' | 'TikTok' | 'Podcast' | 'Blog';

export interface Project {
    id: string;
    name: string;
    description: string;
    techStack: string[];
    status: 'To Do' | 'In Progress' | 'Completed';
    repoUrl?: string;
}

export interface Scholarship {
    id: string;
    name: string;
    deadline: string;
    amount: number;
    status: 'To Apply' | 'Applied' | 'Won' | 'Rejected';
    link?: string;
    requirements?: string;
}

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration?: number;
  isLive?: boolean;
  cover?: string;
}

export interface LeetCodeProblem {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    status: 'To Do' | 'Attempted' | 'Solved';
    lastPracticed?: string;
}

export interface ManagedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  dateAdded: string;
  data: string; // base64 data URI
}
