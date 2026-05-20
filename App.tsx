

import React, { useState, useEffect, useRef, Component } from 'react';
import { 
  AppView, 
  JournalTopic, 
  JournalEntry, 
  Expense, 
  Reminder, 
  RecurringTransaction, 
  Habit, 
  Goal, 
  FlashcardDeck, 
  CodeSnippet, 
  UserTrack, 
  Exam,
  AudioTrack
} from './types';

// Capacitor Plugins
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Device } from '@capacitor/device';
import { LocalNotifications } from '@capacitor/local-notifications';

// Hooks
import { useUser } from './hooks/useUser';
import { useSettings, DARK_THEMES } from './hooks/useSettings';
import { useJournal } from './hooks/useJournal';
import { useExpenses } from './hooks/useExpenses';
import { useReminders } from './hooks/useReminders';
import { useRecurringTransactions } from './hooks/useRecurringTransactions';
import { useHabits } from './hooks/useHabits';
import { useFinancialGoals } from './hooks/useFinancialGoals';
import { useBudgets } from './hooks/useBudgets';
import { useFlashcards } from './hooks/useFlashcards';
import { useTemplates } from './hooks/useTemplates';
import { useCodeSnippets } from './hooks/useCodeSnippets';
import { useExams } from './hooks/useExams';
import { useUserMusic } from './hooks/useUserMusic';
import { useAiCoach } from './hooks/useAiCoach';
import { useQuotes } from './hooks/useQuotes';
import { useAchievements } from './hooks/useAchievements';
import { useGlobalAudio } from './hooks/useGlobalAudio';

// Components
import SplashScreen from './components/SplashScreen';
import OnboardingScreen from './components/OnboardingScreen';
import AppLockScreen from './components/AppLockScreen';
import BottomNavBar from './components/BottomNavBar';
import Sidebar from './components/Sidebar';
import HomeScreen from './components/HomeScreen';
import ExploreScreen from './components/ExploreScreen';
import SettingsScreen from './components/SettingsScreen';
import AiScreen from './components/AiScreen';
import ProfileScreen from './components/ProfileScreen';
import CalendarScreen from './components/CalendarScreen';
import JournalEditor from './components/JournalEditor';
import JournalPreview from './components/JournalPreview';
import CreateNewModal from './components/CreateNewModal';
import ExpenseEditor from './components/ExpenseEditor';
import ReminderEditor from './components/ReminderEditor';
import ExpensesList from './components/ExpensesList';
import RemindersList from './components/RemindersList';
import AccountScreen from './components/AccountScreen';
import NotificationsScreen from './components/NotificationsScreen';
import AppearanceScreen from './components/AppearanceScreen';
import PrivacyScreen from './components/PrivacyScreen';
import AiSettingsScreen from './components/AiSettingsScreen';
import SavedContentScreen from './components/SavedContentScreen';
import HelpScreen from './components/HelpScreen';
import FeatureIdeasScreen from './components/FeatureIdeasScreen';
import RecurringTransactionsScreen from './components/RecurringTransactionsScreen';
import FinancialGoalsScreen from './components/FinancialGoalsScreen';
import BudgetsScreen from './components/BudgetsScreen';
import InsightsScreen from './components/InsightsScreen';
import AchievementsScreen from './components/AchievementsScreen';
import ZenModeScreen from './components/ZenModeScreen';
import FlashcardsListScreen from './components/FlashcardsListScreen';
import FlashcardEditorScreen from './components/FlashcardEditorScreen';
import FlashcardStudyScreen from './components/FlashcardStudyScreen';
import SearchScreen from './components/SearchScreen';
import PhotoGalleryScreen from './components/PhotoGalleryScreen';
import TemplateManagerScreen from './components/TemplateManagerScreen';
import VoiceJournalingScreen from './components/VoiceJournalingScreen';
import AiImageStudioScreen from './components/AiImageStudioScreen';
import AiLiveConversationScreen from './components/AiLiveConversationScreen';
import KodingStreetScreen from './components/KodingStreetScreen';
import CodeSnippetEditor from './components/CodeSnippetEditor';
import RubberDuckScreen from './components/RubberDuckScreen';
import AnnualReviewScreen from './components/AnnualReviewScreen';
import MoodMapScreen from './components/MoodMapScreen';
// Removed unused ThemeToggle import

// Fix: MoodIcon is a named export in Icons.tsx, not a default export.
import { MoodIcon, SparklesIcon, SearchIcon, BellIcon, SunIcon, MoonIcon, UserIcon, MusicIcon } from './components/Icons';
import NewsScreen from './components/NewsScreen';
import AiCoachScreen from './components/AiCoachScreen';
import JourneysListScreen from './components/JourneysListScreen';
import GuidedJourneyScreen from './components/GuidedJourneyScreen';
import { setGlobalApiKey } from './services/geminiService';
import { cloudinaryService } from './services/cloudinaryService';
import BackgroundEffects from './components/BackgroundEffects';
import CommandPalette from './components/CommandPalette';
import QuickCaptureModal from './components/QuickCaptureModal';
import ConfirmationModal from './components/ConfirmationModal';
import RadioScreen from './components/RadioScreen';
import MusicHubScreen from './components/MusicHubScreen';
import JournalsListScreen from './components/JournalsListScreen';
import ReportScreen from './components/ReportScreen';
import GlobalMiniPlayer from './components/GlobalMiniPlayer';
import LanguageSettingsScreen from './components/LanguageSettingsScreen';
import Confetti from './components/Confetti';
import ExamModal from './components/ExamModal';

// Feature Components
import PrayerTimeline from './components/PrayerTimeline';
import ProjectPortfolio from './components/ProjectPortfolio';
import SubscriptionManager from './components/SubscriptionManager';
import ContentCreatorScreen from './components/ContentCreatorScreen';
import { FileManagerScreen } from './components/FileManagerScreen';
import SystemArchitectureScreen from './components/SystemArchitectureScreen';
import ScholarshipTracker from './components/ScholarshipTracker';
import TerminalModeScreen from './components/TerminalModeScreen';
import LeetCodeTracker from './components/LeetCodeTracker';
import ResumeBuilderScreen from './components/ResumeBuilderScreen';
import PodcastNotesScreen from './components/PodcastNotesScreen';
import DigitalDetoxScreen from './components/DigitalDetoxScreen';
import SwotAnalysisScreen from './components/SwotAnalysisScreen';
import BusinessModelScreen from './components/BusinessModelScreen';
import SqlPlaygroundScreen from './components/SqlPlaygroundScreen';
import SystemWhiteboard from './components/SystemWhiteboard';
import SmartContractSandbox from './components/SmartContractSandbox';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import StartupValidatorScreen from './components/StartupValidatorScreen';
import FinancialRatioScreen from './components/FinancialRatioScreen';
import BusinessIdeasScreen from './components/BusinessIdeasScreen';
import StudyAssistantScreen from './components/StudyAssistantScreen';
import AccountingTrainerScreen from './components/AccountingTrainerScreen';
import VirtualInternshipScreen from './components/VirtualInternshipScreen';
import CodeRunnerScreen from './components/CodeRunnerScreen';
import TechGlossaryScreen from './components/TechGlossaryScreen';
import CareerMapperScreen from './components/CareerMapperScreen';
import SkillTreeScreen from './components/SkillTreeScreen';
import PomodoroScreen from './components/PomodoroScreen';
import NetworkUtilityScreen from './components/NetworkUtilityScreen';
import BusinessCardScreen from './components/BusinessCardScreen';
import CurrencyConverterScreen from './components/CurrencyConverterScreen';
import ApiClientScreen from './components/ApiClientScreen';
import GradeCalculatorScreen from './components/GradeCalculatorScreen';
import StartupNameGeneratorScreen from './components/StartupNameGeneratorScreen';
import LectureSummarizerScreen from './components/LectureSummarizerScreen';
import ElevatorPitchScreen from './components/ElevatorPitchScreen';
import TechEventRadarScreen from './components/TechEventRadarScreen';
import InterlinkScreen from './components/InterlinkScreen';
import ErdDesignerScreen from './components/ErdDesignerScreen';
import ProjectEstimatorScreen from './components/ProjectEstimatorScreen';
import TimetableScreen from './components/TimetableScreen';
import SignatureScreen from './components/SignatureScreen';
import ArComponentScreen from './components/ArComponentScreen';
import TTSPlayer, { TTSPlayerRef } from './components/TTSPlayer';
import { ReminderManager } from './components/ReminderManager';

// Hub Containers
import CareerPrepHub from './components/InterviewSimulatorScreen';
import AcademicHub from './components/SyllabusTrackerScreen';
import StartupLab from './components/BusinessModelScreen'; 

import { saveFile, exportAllNotesToPdf } from './utils/exportUtils';

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: any;
}

// Fix: Declared props and state properties to fix the 'Property state/props does not exist on type ErrorBoundary' error in some TypeScript environments.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  props: ErrorBoundaryProps;
  state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#0f172a] text-white p-6 text-center">
            <h2 className="text-2xl font-bold mb-4 text-accent-400">Something went wrong</h2>
            <p className="text-gray-400 mb-2">Mwijay Note encountered an unexpected error:</p>
            <div className="bg-black/50 p-4 rounded-lg mb-6 text-left overflow-auto max-h-48 w-full max-w-xl border border-red-500/30">
                <p className="text-red-400 font-mono text-sm">{this.state.error?.toString()}</p>
                {this.state.error?.stack && (
                    <pre className="text-gray-500 font-mono text-xs mt-2 whitespace-pre-wrap">
                        {this.state.error.stack.split('\n').slice(0, 3).join('\n')}
                    </pre>
                )}
            </div>
            <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 bg-accent-500 text-black font-bold rounded-full hover:bg-accent-400 transition-colors"
            >
                Restart App
            </button>
        </div>
      );
    }

    return this.props.children || null;
  }
}

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
        <AppContent />
    </ErrorBoundary>
  );
};

const AppContent: React.FC = () => {
  // --- State ---
  const [currentView, setCurrentView] = useState<AppView>(AppView.SPLASH);
  // Navigation stack for robust "Back" behavior
  const [viewStack, setViewStack] = useState<AppView[]>([AppView.HOME]);
  const [showSplash, setShowSplash] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [confirmation, setConfirmation] = useState<{title: string, message: string, onConfirm: () => void} | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // Selection/Editing State
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);
  const [editingJournal, setEditingJournal] = useState<Partial<JournalEntry>>({});
  const [editingExpense, setEditingExpense] = useState<Partial<Expense>>({});
  const [editingReminder, setEditingReminder] = useState<Partial<Reminder>>({});
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [editingDeck, setEditingDeck] = useState<Partial<FlashcardDeck>>({});
  const [editingSnippet, setEditingSnippet] = useState<Partial<CodeSnippet>>({});
  const [selectedJourneyContext, setSelectedJourneyContext] = useState<{journeyId: string, stepIndex: number} | null>(null);
  const [selectedProfileCategory, setSelectedProfileCategory] = useState<any>(null);
  const [radioHistory, setRadioHistory] = useState<AudioTrack[]>([]);

  // --- Hooks ---
  const { userData, isOnboarded, isLoading: isUserLoading, isLocked, isLoggedIn, firebaseUser, unlockApp, lockApp, completeOnboarding, updateUserAccountDetails, updateJourneyProgress, logout, loginWithGoogle, addGrowthPoints, logActivity } = useUser();
  const { settings, setTheme, toggleDayNight, setNotificationSettings, setContentPreferences, setFontFamily, setFontSize, setAiSettings, setPlayfulMode, setGreetingStyle, setBackgroundEffect, setTargetLanguage, setAutoDarkMode, setAutomationSettings } = useSettings();
  const { journals, addJournal, updateJournal } = useJournal();
  const { expenses, addExpense } = useExpenses();
  const { reminders, addReminder, updateReminder, deleteReminder } = useReminders();
  const { recurringTransactions, addRecurringTransaction, deleteRecurringTransaction } = useRecurringTransactions();
  const { habits, addHabit, deleteHabit, toggleHabitCompletion } = useHabits();
  const { goals, addGoal, updateGoal, deleteGoal, toggleMilestone } = useFinancialGoals();
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudgets();
  const { decks, addDeck, updateDeck, deleteDeck } = useFlashcards();
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const { snippets, addSnippet, updateSnippet, deleteSnippet } = useCodeSnippets();
  const { exams, addExam, deleteExam } = useExams();
  const { userTracks, addUserTrack } = useUserMusic();
  const { likedQuotes, likeQuote, unlikeQuote } = useQuotes();
  const { currentTrack, isPlaying, isBuffering, playTrack: originalPlayTrack, togglePlay, stop, setVolume } = useGlobalAudio();
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  const [isScrolled, setIsScrolled] = useState(false);

  const handleMainScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const currentY = el.scrollTop;
    setIsScrolled(currentY > 40);
    if (currentY < 60 || currentY < lastScrollY.current) {
      setNavVisible(true);
    } else if (currentY > lastScrollY.current + 8) {
      setNavVisible(false);
    }
    lastScrollY.current = currentY;
  };

  const playTrack = (track: AudioTrack) => {
      originalPlayTrack(track);
      setRadioHistory(prev => {
          const exists = prev.find(t => t.id === track.id);
          if (exists) return prev;
          return [track, ...prev].slice(0, 50);
      });
  };

  const achievementsData = useAchievements({ journals, expenses, goals, habits, userData });
  const { achievements, newlyUnlocked, clearNewlyUnlocked } = achievementsData;
  const { suggestion: aiSuggestion, dismissSuggestion } = useAiCoach({ journals, habits, currentView });
  const ttsPlayerRef = useRef<TTSPlayerRef>(null);

  const isDarkTheme = DARK_THEMES.some(t => t.id === settings.theme);

  // --- Effects ---

  // Capacitor Back Button Handler
  useEffect(() => {
    if (!CapApp || !CapApp.addListener) return;
    
    const backListener = CapApp.addListener('backButton', () => {
      if (showCreateModal) {
        setShowCreateModal(false);
        return;
      }
      if (showQuickCapture) {
        setShowQuickCapture(false);
        return;
      }
      if (showCommandPalette) {
        setShowCommandPalette(false);
        return;
      }
      
      // If we have history, go back
      if (viewStack.length > 1) {
        handleBack();
      } else {
        // If we are at Home, show exit confirmation
        setShowExitConfirm(true);
      }
    });

    return () => {
      backListener.then(l => l.remove?.());
    };
  }, [viewStack, showCreateModal, showQuickCapture, showCommandPalette]);

  useEffect(() => {
    if (newlyUnlocked.length > 0) {
        const timer = setTimeout(() => {
            clearNewlyUnlocked();
        }, 5000); 
        return () => clearTimeout(timer);
    }
  }, [newlyUnlocked, clearNewlyUnlocked]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      if (isLocked) {
        setCurrentView(AppView.APP_LOCK);
      } else if (!isOnboarded) {
        setCurrentView(AppView.ONBOARDING);
      } else {
        setCurrentView(AppView.HOME);
      }
    }, 3000); 

    // Initialize Mobile UI
    const initMobile = async () => {
        try {
            const info = await Device.getInfo();
            if (info.platform === 'android' || info.platform === 'ios') {
                await StatusBar.setOverlaysWebView({ overlay: true });
                await StatusBar.setStyle({ style: isDarkTheme ? Style.Dark : Style.Light });
                
                // Request Notification Permission
                const perm = await LocalNotifications.checkPermissions();
                if (perm.display !== 'granted') {
                    await LocalNotifications.requestPermissions();
                }
            }
        } catch (e) {}
    };
    initMobile();

    return () => clearTimeout(timer);
  }, [isLocked, isOnboarded]);

  useEffect(() => {
      const updateStatusBar = async () => {
          try {
              const info = await Device.getInfo();
              if (info.platform === 'android' || info.platform === 'ios') {
                  await StatusBar.setStyle({ style: isDarkTheme ? Style.Dark : Style.Light });
              }
          } catch(e) {}
      };
      updateStatusBar();
  }, [isDarkTheme]);

  useEffect(() => {
      if (settings.ai.customApiKey) {
          setGlobalApiKey(settings.ai.customApiKey);
      }
      if (settings.ai.cloudinary) {
          cloudinaryService.updateConfig(settings.ai.cloudinary);
      }
  }, [settings.ai.customApiKey, settings.ai.cloudinary]);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
        window.removeEventListener('online', goOnline);
        window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            setShowCommandPalette(true);
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
            e.preventDefault();
            setEditingJournal({ type: 'Gratitude Journal', topic: JournalTopic.GRATITUDE });
            handleNavigate(AppView.EDITOR);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Navigation Logic ---
  
  const handleNavigate = (view: AppView, params?: any) => {
    // Add to stack if it's not a root view or if we're moving deeper
    setViewStack(prev => {
        // If navigating to a root view (HOME, EXPLORE, INSIGHTS, SETTINGS), reset stack
        const roots = [AppView.HOME, AppView.EXPLORE, AppView.INSIGHTS, AppView.SETTINGS];
        if (roots.includes(view)) return [view];
        return [...prev, view];
    });

    setCurrentView(view);
    
    // Pass parameters via shared state
    if (view === AppView.FLASHCARD_STUDY || view === AppView.FLASHCARD_EDITOR || view === AppView.GUIDED_JOURNEY) {
        if (typeof params === 'string') setSelectedDeckId(params);
    }
    
    if (view === AppView.PROFILE && params) {
        setSelectedProfileCategory(params);
    }
  };

  const handleBack = () => {
    if (viewStack.length > 1) {
        const newStack = [...viewStack];
        newStack.pop();
        const prevView = newStack[newStack.length - 1];
        setViewStack(newStack);
        setCurrentView(prevView);
    } else {
        setCurrentView(AppView.HOME);
        setViewStack([AppView.HOME]);
    }
  };

  const handleCreateNew = () => setShowCreateModal(true);

  const handleSelectCreateOption = (type: string) => {
      setShowCreateModal(false);
      const today = new Date().toISOString();
      switch (type) {
          case 'journal':
              setEditingJournal({ date: today, type: 'Gratitude Journal', topic: JournalTopic.GRATITUDE });
              handleNavigate(AppView.EDITOR);
              break;
          case 'expense':
              setEditingExpense({ date: today, type: 'expense' });
              handleNavigate(AppView.EXPENSE_EDITOR);
              break;
          case 'reminder':
              setEditingReminder({ date: today });
              handleNavigate(AppView.REMINDER_EDITOR);
              break;
          case 'flashcard_deck':
              setEditingDeck({});
              handleNavigate(AppView.FLASHCARD_EDITOR);
              break;
          case 'voice_journal':
              handleNavigate(AppView.VOICE_JOURNALING);
              break;
          case 'ai_image':
              handleNavigate(AppView.AI_IMAGE_STUDIO);
              break;
          case 'ai_live':
              handleNavigate(AppView.AI_LIVE_CONVERSATION);
              break;
          case 'time_capsule':
              setEditingJournal({ date: today, type: 'Time Capsule', topic: JournalTopic.CAPSULE, shouldGenerateCover: true });
              handleNavigate(AppView.EDITOR);
              break;
          case 'exam':
              setShowExamModal(true);
              break;
      }
  };

  const handleJournalSave = (journal: Partial<JournalEntry>, shouldNavigate = true) => {
      if (journal.id && journals.some(j => j.id === journal.id)) {
          updateJournal(journal as JournalEntry);
      } else {
          addJournal(journal);
          addGrowthPoints(10);
      }
      if (shouldNavigate) handleBack();
      
      if (selectedJourneyContext && journal.id) {
          updateJourneyProgress(selectedJourneyContext.journeyId, selectedJourneyContext.stepIndex);
          setSelectedJourneyContext(null);
          addGrowthPoints(50);
      }
  };

  const handleExportData = () => {
      const data = {
          user: userData,
          journals,
          expenses,
          reminders,
          habits,
          goals,
          settings,
          decks,
          snippets,
          version: 3
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      saveFile(blob, `Mwijay_Backup_${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleImportData = async (file: File) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
          try {
              const data = JSON.parse(e.target?.result as string);
              setConfirmation({
                  title: "Confirm Import",
                  message: "This will overwrite all current data in the app. This cannot be undone. Proceed?",
                  onConfirm: () => {
                      if(data.user) updateUserAccountDetails(data.user);
                      if(data.settings) setTheme(data.settings.theme);
                      alert("Import successful. Please restart the app for changes to fully apply.");
                      setConfirmation(null);
                  }
              });
          } catch (err) {
              alert("Invalid backup file.");
          }
      };
      reader.readAsDataURL(file);
  };

  const handleClearData = () => {
      setConfirmation({
          title: "Delete Everything?",
          message: "This will permanently delete all your journals, settings, and data. This action cannot be undone.",
          onConfirm: () => {
              localStorage.clear();
              window.location.reload();
          }
      });
  };

  // --- Render Content Switch ---

  const renderContent = () => {
      switch (currentView) {
          case AppView.SPLASH:
              return <SplashScreen />;
          case AppView.ONBOARDING:
              return <OnboardingScreen onComplete={completeOnboarding} />;
          case AppView.APP_LOCK:
              return <AppLockScreen pin={userData.pin || ''} onUnlock={unlockApp} onReset={handleClearData} />;
          case AppView.HOME:
              return <HomeScreen 
                  userData={userData} 
                  journals={journals} 
                  showWelcome={false} 
                  onWelcomeDismiss={() => {}} 
                  onCreateNew={(type, topic) => { setEditingJournal({ type, topic }); handleNavigate(AppView.EDITOR); }} 
                  onNavigate={handleNavigate}
                  onPreviewJournal={(j) => { setSelectedJournal(j); handleNavigate(AppView.JOURNAL_PREVIEW); }}
                  aiSuggestion={aiSuggestion}
                  onDismissAiSuggestion={dismissSuggestion}
                  aiSettings={settings.ai}
                  isLoading={isUserLoading}
                  updateJournal={updateJournal}
                  likedQuotes={likedQuotes}
                  onLikeQuote={likeQuote}
                  onUnlikeQuote={unlikeQuote}
                  greetingStyle={settings.greetingStyle}
                  onSaveToFlashcard={(front, back) => { 
                      addDeck({ title: "Quick Saves", cards: [{ id: Date.now().toString(), front, back }] }); 
                      alert("Saved to new deck 'Quick Saves'");
                  }}
                  exams={exams}
                  onDeleteExam={deleteExam}
                  contentPreferences={settings.contentPreferences}
                  isDarkTheme={isDarkTheme}
              />;
          case AppView.EXPLORE:
              return <ExploreScreen 
                  onNavigate={handleNavigate} 
                  journals={journals}
                  onSaveToFlashcard={(f, b) => addDeck({title:"Vocabulary", cards:[{id:Date.now().toString(), front:f, back:b}]})}
                  targetLanguage={settings.targetLanguage}
                  setTargetLanguage={setTargetLanguage}
              />;
          case AppView.AI:
              return <AiScreen 
                  isThinkingMode={false} 
                  journals={journals} 
                  expenses={expenses} 
                  aiSettings={settings.ai} 
                  onAiAction={() => {}} 
                  onSpeak={(text: string) => ttsPlayerRef.current?.speak(text, settings.ai.voice)}
                  currentView={currentView}
                  onNavigate={handleNavigate}
                  onSetTheme={setTheme}
              />;
          case AppView.PROFILE:
              return <ProfileScreen userData={userData} onNavigate={handleNavigate} initialCategory={selectedProfileCategory} />;
          case AppView.SETTINGS:
              return <SettingsScreen onNavigate={handleNavigate} userData={userData} settings={settings} setTheme={setTheme} setAutoDarkMode={setAutoDarkMode} toggleDayNight={toggleDayNight} setAutomationSettings={setAutomationSettings} setPlayfulMode={setPlayfulMode} />;
          case AppView.LANGUAGE_SETTINGS: 
              return <LanguageSettingsScreen currentLanguage={settings.targetLanguage} onSetLanguage={setTargetLanguage} onBack={handleBack} />;
          case AppView.CALENDAR:
              return <CalendarScreen 
                  journals={journals} 
                  reminders={reminders} 
                  expenses={expenses} 
                  onNavigate={handleNavigate}
                  onCreateJournal={(type, topic, date) => { setEditingJournal({ type, topic, date }); handleNavigate(AppView.EDITOR); }}
                  onCreateReminder={(date) => { setEditingReminder({ date }); handleNavigate(AppView.REMINDER_EDITOR); }}
                  onPreviewJournal={(j) => { setSelectedJournal(j); handleNavigate(AppView.JOURNAL_PREVIEW); }}
              />;
          case AppView.EDITOR:
              return <JournalEditor 
                  journal={editingJournal} 
                  onSave={handleJournalSave} 
                  onCancel={handleBack} 
                  templates={templates} 
                  journals={journals}
              />;
          case AppView.JOURNAL_PREVIEW:
              return selectedJournal ? <JournalPreview 
                  journal={selectedJournal} 
                  onClose={handleBack} 
                  onEdit={(j) => { setEditingJournal(j); handleNavigate(AppView.EDITOR); }} 
                  onUpdate={updateJournal} 
                  aiSettings={settings.ai}
                  onNavigateToJournalByTitle={(t) => {
                      const found = journals.find(j => j.title === t);
                      if(found) setSelectedJournal(found);
                  }}
                  onSpeak={(text) => ttsPlayerRef.current?.speak(text, settings.ai.voice)}
                  userData={userData}
              /> : <div className="p-10 text-center text-dun">Loading Entry...</div>;
          case AppView.EXPENSES_LIST:
              return <ExpensesList expenses={expenses} onBack={handleBack} userData={userData} />;
          case AppView.REMINDERS_LIST:
              return <RemindersList reminders={reminders} onUpdateReminder={updateReminder} onDeleteReminder={deleteReminder} onBack={handleBack} />;
          case AppView.EXPENSE_EDITOR:
              return <ExpenseEditor expense={editingExpense} onSave={(e) => { addExpense(e); handleNavigate(AppView.EXPENSES_LIST); }} onCancel={handleBack} />;
          case AppView.REMINDER_EDITOR:
              return <ReminderEditor reminder={editingReminder} onSave={(r) => { addReminder(r); handleNavigate(AppView.REMINDERS_LIST); }} onCancel={handleBack} />;
          case AppView.ACCOUNT:
              return <AccountScreen userData={userData} isLoggedIn={isLoggedIn} firebaseUser={firebaseUser} onUpdateUserDetails={updateUserAccountDetails} onLoginWithGoogle={loginWithGoogle} onLogout={logout} onBack={handleBack} />;
          case AppView.APPEARANCE:
              return <AppearanceScreen settings={settings} onSetFontFamily={setFontFamily} onSetFontSize={setFontSize} onSetPlayfulMode={setPlayfulMode} onSetTheme={setTheme} onSetGreetingStyle={setGreetingStyle} onSetBackgroundEffect={setBackgroundEffect} onSetTargetLanguage={setTargetLanguage} onBack={handleBack} />;
          case AppView.NOTIFICATIONS:
              return <NotificationsScreen settings={settings.notifications} onUpdateSettings={setNotificationSettings} onBack={handleBack} />;
          case AppView.PRIVACY:
              return <PrivacyScreen onClearData={handleClearData} onBack={handleBack} onExportData={handleExportData} onExportPdf={() => exportAllNotesToPdf(journals, userData)} onImportData={handleImportData} userData={userData} onUpdateUser={updateUserAccountDetails} />;
          case AppView.AI_SETTINGS:
              return <AiSettingsScreen settings={settings.ai} onUpdateSettings={setAiSettings} onBack={handleBack} />;
          case AppView.SAVED_CONTENT:
              return <SavedContentScreen likedQuotes={likedQuotes} onUnlikeQuote={unlikeQuote} onBack={handleBack} />;
          case AppView.HELP:
              return <HelpScreen onBack={handleBack} />;
          
          case AppView.HABIT_TRACKER: return <FeatureIdeasScreen onBack={handleBack} habits={habits} addHabit={addHabit} deleteHabit={deleteHabit} toggleHabitCompletion={toggleHabitCompletion} />;
          case AppView.RECURRING_TRANSACTIONS: return <RecurringTransactionsScreen recurringTransactions={recurringTransactions} addRecurringTransaction={addRecurringTransaction} deleteRecurringTransaction={deleteRecurringTransaction} onBack={handleBack} />;
          case AppView.GOALS: return <FinancialGoalsScreen goals={goals} expenses={expenses} addGoal={addGoal} updateGoal={updateGoal} deleteGoal={deleteGoal} toggleMilestone={toggleMilestone} onBack={handleBack} onAddContribution={(gid) => { setEditingExpense({ goalId: gid, type: 'expense', category: 'Savings' }); handleNavigate(AppView.EXPENSE_EDITOR); }} />;
          case AppView.BUDGETS: return <BudgetsScreen budgets={budgets} expenses={expenses} addBudget={addBudget} updateBudget={updateBudget} deleteBudget={deleteBudget} onBack={handleBack} />;
          case AppView.INSIGHTS: return <InsightsScreen journals={journals} expenses={expenses} habits={habits} userData={userData} targetLanguage={settings.targetLanguage} />;
          case AppView.ACHIEVEMENTS: return <AchievementsScreen achievements={achievements} onBack={handleBack} />;
          case AppView.ZEN_MODE: return <ZenModeScreen 
              onBack={handleBack} 
              userTracks={userTracks} 
              onAddTrack={addUserTrack}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              playTrack={playTrack}
              togglePlay={togglePlay}
          />;
          case AppView.FLASHCARDS_LIST: return <FlashcardsListScreen decks={decks} onBack={handleBack} onNavigate={handleNavigate} onDeleteDeck={deleteDeck} addDeck={addDeck} />;
          case AppView.FLASHCARD_EDITOR: return <FlashcardEditorScreen deck={decks.find(d => d.id === selectedDeckId) || {}} onSave={async (d) => { if(d.id && decks.find(existing => existing.id === d.id)) await updateDeck(d); else await addDeck(d); handleNavigate(AppView.FLASHCARDS_LIST); }} onCancel={() => handleNavigate(AppView.FLASHCARDS_LIST)} />;
          case AppView.FLASHCARD_STUDY: return <FlashcardStudyScreen deck={decks.find(d => d.id === selectedDeckId)!} onBack={() => handleNavigate(AppView.FLASHCARDS_LIST)} />;
          case AppView.SEARCH: return <SearchScreen journals={journals} onBack={handleBack} onPreview={(j) => { setSelectedJournal(j); handleNavigate(AppView.JOURNAL_PREVIEW); }} />;
          case AppView.PHOTO_GALLERY: return <PhotoGalleryScreen journals={journals} onBack={handleBack} onPreviewJournal={(j) => { setSelectedJournal(j); handleNavigate(AppView.JOURNAL_PREVIEW); }} />;
          case AppView.TEMPLATES_MANAGER: return <TemplateManagerScreen templates={templates} onSave={updateTemplate} onDelete={deleteTemplate} onAdd={addTemplate} onBack={handleBack} />;
          case AppView.VOICE_JOURNALING: return <VoiceJournalingScreen onSave={handleJournalSave} onCancel={handleBack} onSaveReminder={(t) => { setEditingReminder({ title: t }); handleNavigate(AppView.REMINDER_EDITOR); }} />;
          case AppView.AI_IMAGE_STUDIO: return <AiImageStudioScreen onBack={handleBack} />;
          case AppView.AI_LIVE_CONVERSATION: return <AiLiveConversationScreen onBack={handleBack} />;
          case AppView.KODING_STREET: return <KodingStreetScreen snippets={snippets} onBack={handleBack} onNewSnippet={() => { setEditingSnippet({}); handleNavigate(AppView.CODE_SNIPPET_EDITOR); }} onEditSnippet={(s) => { setEditingSnippet(s); handleNavigate(AppView.CODE_SNIPPET_EDITOR); }} onDeleteSnippet={deleteSnippet} />;
          case AppView.CODE_SNIPPET_EDITOR: return <CodeSnippetEditor snippet={editingSnippet} onSave={(s) => { if(s.id) updateSnippet(s as CodeSnippet); else addSnippet(s as any); handleNavigate(AppView.KODING_STREET); }} onCancel={() => handleNavigate(AppView.KODING_STREET)} />;
          case AppView.RUBBER_DUCK: return <RubberDuckScreen onBack={handleBack} />;
          case AppView.ANNUAL_REVIEW: return <AnnualReviewScreen journals={journals} expenses={expenses} goals={goals} habits={habits} userData={userData} onBack={handleBack} />;
          case AppView.MOOD_MAP: return <MoodMapScreen journals={journals} onBack={handleBack} onPreviewJournal={(j) => { setSelectedJournal(j); handleNavigate(AppView.JOURNAL_PREVIEW); }} />;
          case AppView.NEWS: return <NewsScreen onBack={handleBack} />;
          case AppView.AI_COACH: return <AiCoachScreen journals={journals} onBack={handleBack} />;
          case AppView.JOURNEYS_LIST: return <JourneysListScreen userData={userData} onBack={handleBack} onNavigateToJourney={(id) => handleNavigate(AppView.GUIDED_JOURNEY, id)} />;
          case AppView.GUIDED_JOURNEY: return <GuidedJourneyScreen journeyId={currentView === AppView.GUIDED_JOURNEY ? (selectedDeckId || '') : ''} userData={userData} onBack={handleBack} onStartJournal={(type, topic, date, from, context, title) => { setEditingJournal({ type, topic, date, title }); setSelectedJourneyContext(context); handleNavigate(AppView.EDITOR); }} />;

          case AppView.RADIO: return <RadioScreen 
              onBack={handleBack} 
              currentTrack={currentTrack} 
              isPlaying={isPlaying} 
              playTrack={playTrack} 
              togglePlay={togglePlay}
              userTracks={userTracks}
              onUpload={addUserTrack}
              setVolume={setVolume}
          />;
          case AppView.MUSIC_HUB: return <MusicHubScreen 
              onBack={handleBack}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              playTrack={playTrack}
              togglePlay={togglePlay}
              setVolume={setVolume}
          />;
          case AppView.GENERAL_REPORT: return <ReportScreen 
              journals={journals} 
              expenses={expenses} 
              goals={goals} 
              habits={habits} 
              userData={userData} 
              radioHistory={radioHistory}
              onBack={handleBack} 
          />;
          case AppView.JOURNALS_LIST: return <JournalsListScreen 
              journals={journals} 
              onBack={handleBack} 
              onPreviewJournal={(j) => { setSelectedJournal(j); handleNavigate(AppView.JOURNAL_PREVIEW); }}
              onCreateNew={(type, topic) => { setEditingJournal({ type, topic }); handleNavigate(AppView.EDITOR); }}
          />;
          case AppView.FILE_MANAGER: return <FileManagerScreen 
              onBack={handleBack} 
              journals={journals} 
              expenses={expenses} 
              userData={userData} 
          />;
          
          case AppView.PRAYER_TIMELINE: return <PrayerTimeline journals={journals} onBack={handleBack} onNewPrayer={() => { setEditingJournal({ type: 'Prayer Journal', topic: JournalTopic.PRAYER }); handleNavigate(AppView.EDITOR); }} onPreview={(j) => { setSelectedJournal(j); handleNavigate(AppView.JOURNAL_PREVIEW); }} />;
          case AppView.PROJECT_PORTFOLIO: return <ProjectPortfolio onBack={handleBack} />;
          case AppView.SUBSCRIPTION_MANAGER: return <SubscriptionManager recurringTransactions={recurringTransactions} onBack={handleBack} onManage={() => handleNavigate(AppView.RECURRING_TRANSACTIONS)} />;
          case AppView.CONTENT_CREATOR: return <ContentCreatorScreen onBack={handleBack} />;
          case AppView.SYSTEM_ARCHITECTURE: return <SystemArchitectureScreen onBack={handleBack} />;
          case AppView.SCHOLARSHIP_TRACKER: return <ScholarshipTracker onBack={handleBack} />;
          case AppView.TERMINAL: return <TerminalModeScreen onNavigate={handleNavigate} onThemeChange={setTheme} />;
          case AppView.LEETCODE: return <LeetCodeTracker onBack={handleBack} />;
          case AppView.RESUME: return <ResumeBuilderScreen onBack={handleBack} />;
          case AppView.PODCAST: return <PodcastNotesScreen onBack={handleBack} />;
          case AppView.DETOX: return <DigitalDetoxScreen onBack={handleBack} />;
          case AppView.SWOT_ANALYSIS: return <SwotAnalysisScreen onBack={handleBack} />;
          case AppView.BUSINESS_MODEL: return <BusinessModelScreen onBack={handleBack} />;
          case AppView.SQL_PLAYGROUND: return <SqlPlaygroundScreen onBack={handleBack} />;
          case AppView.WHITEBOARD: return <SystemWhiteboard onBack={handleBack} />;
          case AppView.SMART_CONTRACT: return <SmartContractSandbox onBack={handleBack} />;
          case AppView.SHORTCUTS: return <KeyboardShortcuts onBack={handleBack} />;
          case AppView.STARTUP_VALIDATOR: return <StartupValidatorScreen onBack={handleBack} />;
          case AppView.FINANCIAL_RATIOS: return <FinancialRatioScreen onBack={handleBack} />;
          case AppView.BUSINESS_IDEAS: return <BusinessIdeasScreen onBack={handleBack} />;
          case AppView.STUDY_ASSISTANT: return <StudyAssistantScreen onBack={handleBack} />;
          case AppView.ACCOUNTING_TRAINER: return <AccountingTrainerScreen onBack={handleBack} />;
          case AppView.VIRTUAL_INTERNSHIP: return <VirtualInternshipScreen onBack={handleBack} />;
          case AppView.CODE_RUNNER: return <CodeRunnerScreen onBack={handleBack} />;
          case AppView.PITCH_DECK: return <StartupLab onBack={handleBack} initialTab="Pitch" />;
          case AppView.GLOSSARY: return <TechGlossaryScreen onBack={handleBack} />;
          case AppView.CAREER_MAPPER: return <CareerMapperScreen onBack={handleBack} />;
          case AppView.SKILL_TREE: return <SkillTreeScreen onBack={handleBack} />;
          case AppView.POMODORO: return <PomodoroScreen onBack={handleBack} />;
          case AppView.NETWORK_UTILITY: return <NetworkUtilityScreen onBack={handleBack} />;
          case AppView.BUSINESS_CARD: return <BusinessCardScreen onBack={handleBack} userData={userData} />;
          case AppView.CURRENCY_CONVERTER: return <CurrencyConverterScreen onBack={handleBack} />;
          case AppView.API_CLIENT: return <ApiClientScreen onBack={handleBack} />;
          case AppView.GRADE_CALCULATOR: return <GradeCalculatorScreen onBack={handleBack} />;
          case AppView.STARTUP_NAME_GEN: return <StartupNameGeneratorScreen onBack={handleBack} />;
          case AppView.LECTURE_SUMMARIZER: return <LectureSummarizerScreen onBack={handleBack} />;
          case AppView.ELEVATOR_PITCH: return <ElevatorPitchScreen onBack={handleBack} />;
          case AppView.TECH_RADAR: return <TechEventRadarScreen onBack={handleBack} />;
          case AppView.INTERLINK: return <InterlinkScreen onBack={handleBack} />;
          case AppView.ERD_DESIGNER: return <ErdDesignerScreen onBack={handleBack} />;
          case AppView.COST_ESTIMATOR: return <ProjectEstimatorScreen onBack={handleBack} />;
          case AppView.TIMETABLE: return <TimetableScreen reminders={reminders} addReminder={addReminder} deleteReminder={deleteReminder} onBack={handleBack} />;
          case AppView.HANGUL_CANVAS: return <SignatureScreen onBack={handleBack} />;
          case AppView.AR_COMPONENT_SCAN: return <ArComponentScreen onBack={handleBack} />;
          
          // Hub Containers
          case AppView.CAREER_PREP: return <CareerPrepHub onBack={handleBack} />;
          case AppView.ACADEMIC_HUB: return <AcademicHub onBack={handleBack} />;
          case AppView.STARTUP_LAB: return <StartupLab onBack={handleBack} />;
          
          case AppView.INTERVIEW_SIMULATOR: return <CareerPrepHub onBack={handleBack} />; 
          case AppView.SYLLABUS_TRACKER: return <AcademicHub onBack={handleBack} />; 
          
          default: return <div className="p-4 text-center text-dun">View not found</div>;
      }
  };

    const getViewTitle = (view: AppView) => {
        switch (view) {
            case AppView.HOME: return 'Home';
            case AppView.RADIO: return 'Radio';
            case AppView.MUSIC_HUB: return 'Music Hub';
            case AppView.EXPLORE: return 'Explore';
            case AppView.AI: return 'AI Assistant';
            case AppView.INSIGHTS: return 'Insights';
            case AppView.SETTINGS: return 'Settings';
            case AppView.PROFILE: return 'Profile';
            case AppView.CALENDAR: return 'Calendar';
            case AppView.JOURNALS_LIST: return 'Diary';
            case AppView.GENERAL_REPORT: return 'System Report';
            case AppView.ACADEMIC_HUB: return 'Academic Hub';
            case AppView.CAREER_PREP: return 'Career Prep';
            case AppView.STARTUP_LAB: return 'Startup Lab';
            default: return 'Mwijay Note';
        }
    };

  return (
    <>
      <BackgroundEffects effect={settings.backgroundEffect} isDark={isDarkTheme} />
      <Confetti />
      
      {/* Offline Banner */}
      {isOffline && (
        <div className="offline-banner">
          Offline Mode - Limited Functionality
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
          <ConfirmationModal 
              title="Quit Mwijay Note?"
              message="Are you sure you want to close the application?"
              onConfirm={() => CapApp.exitApp()}
              onCancel={() => setShowExitConfirm(false)}
          />
      )}

      <div className={`flex h-full w-full bg-bg-primary overflow-hidden relative ${isOffline ? 'offline-mode' : ''}`}>
        <ReminderManager />
        <TTSPlayer ref={ttsPlayerRef} />
        

        {/* Sidebar for Desktop */}
        <Sidebar 
            activeView={currentView}
            setActiveView={handleNavigate}
            onCreateNew={handleCreateNew}
            userData={userData}
            isDark={isDarkTheme}
        />

        <div className="flex-grow flex flex-col h-full overflow-hidden relative">
            {/* Mobile Header - Scroll-Aware */}
            {(currentView === AppView.HOME || currentView === AppView.AI || currentView === AppView.INSIGHTS) && (
                <header
                  className="md:hidden flex flex-col pt-safe-top border-b border-white/5 bg-bg-primary/90 backdrop-blur-xl shrink-0 z-40 transition-all duration-300 ease-in-out"
                  style={{ transform: navVisible ? 'translateY(0)' : 'translateY(-100%)' }}
                >
                    <div className="flex items-center justify-between px-6 h-14">
                        {/* When scrolled, show view title; when at top show brand */}
                        <div className="flex flex-col justify-center overflow-hidden">
                            <h1 className={`font-brand font-black text-isabelline tracking-tighter uppercase transition-all duration-300 ${isScrolled ? 'text-[10px] text-accent opacity-70' : 'text-xl opacity-100'}`}>
                                {isScrolled ? getViewTitle(currentView) : 'Mwijay Note'}
                            </h1>
                            {!isScrolled && (
                                <p className="text-[9px] text-dun/50 font-black uppercase tracking-[0.15em]">
                                    {getViewTitle(currentView)}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => handleNavigate(AppView.MUSIC_HUB)} className="text-dun hover:text-accent transition-all"><MusicIcon className="w-5 h-5"/></button>
                            <button onClick={() => handleNavigate(AppView.SEARCH)} className="text-dun hover:text-accent transition-all"><SearchIcon className="w-5 h-5"/></button>
                            <button onClick={() => handleNavigate(AppView.PROFILE)} className="w-8 h-8 rounded-full bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center">
                                {userData?.profilePicture ? (
                                    (userData.profilePicture.startsWith('http') || userData.profilePicture.startsWith('data:')) ? (
                                        <img src={userData.profilePicture} className="w-full h-full object-cover" alt="Profile" referrerPolicy="no-referrer" />
                                    ) : (
                                        <span className="text-lg">{userData.profilePicture}</span>
                                    )
                                ) : (
                                    <UserIcon className="w-5 h-5 text-dun m-auto mt-1" />
                                )}
                            </button>
                        </div>
                    </div>
                </header>
            )}
            {/* Top Bar for Context */}
            {(currentView === AppView.HOME || currentView === AppView.AI || currentView === AppView.INSIGHTS) && (
                <header className="hidden md:flex h-16 items-center px-8 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-xl shrink-0 z-40">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-brand font-black text-isabelline tracking-widest uppercase">{getViewTitle(currentView)}</h2>
                        {currentView === AppView.HOME && (
                            <div className="flex items-center gap-2 ml-4 px-4 py-1.5 bg-white/5 rounded-full border border-white/5 animate-fade-in">
                                <SparklesIcon className="w-4 h-4 text-accent animate-pulse" />
                                <span className="text-[10px] font-black text-dun uppercase tracking-widest">System Active</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="ml-auto flex items-center gap-6">
                        {currentView === AppView.HOME && (
                            <div className="flex items-center gap-3 mr-4 animate-fade-in">
                                <button onClick={() => handleNavigate(AppView.SEARCH)} className="p-2 rounded-xl bg-white/5 text-dun hover:text-accent transition-all">
                                    <SearchIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleNavigate(AppView.NOTIFICATIONS)} className="p-2 rounded-xl bg-white/5 text-dun hover:text-accent transition-all relative">
                                    <BellIcon className="w-5 h-5" />
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-bg-primary"></span>
                                </button>
                            </div>
                        )}


                        {/* Global Floating Mini Player integrated into header for desktop */}
                        <GlobalMiniPlayer 
                            track={currentTrack} 
                            isPlaying={isPlaying} 
                            isBuffering={isBuffering}
                            onTogglePlay={togglePlay}
                            onStop={stop}
                            onNavigateToSource={() => {
                                if (currentTrack?.isLive) handleNavigate(AppView.RADIO);
                                else handleNavigate(AppView.MUSIC_HUB);
                            }}
                        />
                    </div>
                </header>
            )}

            {/* Main Content Area */}
            <main
              className="flex-grow overflow-auto relative z-10 pb-[env(safe-area-inset-bottom)] no-scrollbar"
              onScroll={handleMainScroll}
              ref={mainScrollRef}
            >
                <div className="h-full w-full mx-auto relative bg-bg-primary">
                   <div key={currentView} className="h-full w-full animate-fade-in">
                       {renderContent()}
                   </div>
                </div>
            </main>

            {/* Bottom Nav for Mobile */}
            {[AppView.HOME, AppView.EXPLORE, AppView.INSIGHTS, AppView.SETTINGS].includes(currentView) && (
                <div className="md:hidden">
                    <BottomNavBar 
                        activeView={currentView} 
                        setActiveView={handleNavigate} 
                        onCreateNew={handleCreateNew} 
                    />
                </div>
            )}
        </div>

        {/* Floating Offline Indicator */}
        {isOffline && (
            <div className="fixed top-4 left-0 right-0 mx-auto w-fit z-[100] animate-fade-in-down">
                <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-xs px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md">
                    You are currently offline.
                </div>
            </div>
        )}
        
        {newlyUnlocked.length > 0 && (
            <div className="fixed top-24 left-0 right-0 mx-auto w-fit z-[100] animate-pop-in">
                <div className="bg-card/95 backdrop-blur-xl border border-accent/50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-[90vw]">
                    <div className="text-3xl animate-bounce-custom">🏆</div>
                    <div>
                        <h3 className="font-bold text-accent">Achievement Unlocked!</h3>
                        <p className="text-xs text-isabelline">{newlyUnlocked[0].title}</p>
                    </div>
                    <button onClick={clearNewlyUnlocked} className="ml-2 text-dun hover:text-white p-2">✕</button>
                </div>
            </div>
        )}

        {showCreateModal && <CreateNewModal onClose={() => setShowCreateModal(false)} onSelect={handleSelectCreateOption} />}
        {showQuickCapture && <QuickCaptureModal onClose={() => setShowQuickCapture(false)} />}
        <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} onNavigate={handleNavigate} onThemeChange={setTheme} />
        {confirmation && (
            <ConfirmationModal 
                {...confirmation}
                onCancel={() => setConfirmation(null)}
                onConfirm={() => {
                    confirmation.onConfirm();
                    setConfirmation(null);
                }}
            />
        )}
      </div>
      <ExamModal 
          isOpen={showExamModal} 
          onClose={() => setShowExamModal(false)} 
          onSave={(subject, date) => addExam(subject, date)} 
      />
    </>
  );
};
