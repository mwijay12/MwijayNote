import React, { useState, useMemo } from 'react';
import { ArrowLeftIcon, SmilePlusIcon, PlusIcon, TrashIcon } from './Icons';
import { Habit, HabitCompletion } from '../types';

interface HabitTrackerScreenProps {
  onBack: () => void;
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'completions'>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
}

const EMOJI_OPTIONS = ['💪', '🧘', '📖', '💧', '🥗', '🎨', '🧹', '🏃', '☀️', '🌙', '✅', '❤️'];

const HabitCheckbox: React.FC<{
    isCompleted: boolean;
    onToggle: () => void;
}> = ({ isCompleted, onToggle }) => {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = () => {
        setIsAnimating(true);
        onToggle();
    };
    
    return (
        <button 
            onClick={handleClick}
            onAnimationEnd={() => setIsAnimating(false)}
            className={`w-full aspect-square rounded-lg transition-all duration-200 flex items-center justify-center ${isCompleted ? 'bg-accent scale-100' : 'bg-bg-primary hover:bg-white/10'} ${isAnimating ? 'animate-pop-in-soft' : ''} ${isCompleted ? 'custom-checkbox-checked' : ''}`}
        >
             {isCompleted && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline className="check-icon-path" points="20 6 9 17 4 12"></polyline></svg>}
        </button>
    );
};


const HabitTrackerScreen: React.FC<HabitTrackerScreenProps> = ({ onBack, habits, addHabit, deleteHabit, toggleHabitCompletion }) => {
    const [newHabitName, setNewHabitName] = useState('');
    const [newHabitIcon, setNewHabitIcon] = useState('💪');

    const handleAddHabit = () => {
        if (newHabitName.trim()) {
            addHabit({
                name: newHabitName.trim(),
                icon: newHabitIcon,
                frequency: 'daily',
            });
            setNewHabitName('');
            setNewHabitIcon('💪');
        }
    };
    
    const weekDates = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date;
        }).reverse();
    }, []);

    const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

    const calculateStreaks = (completions: HabitCompletion) => {
        const dates = Object.keys(completions).sort();
        if (dates.length === 0) return { current: 0, longest: 0 };

        let longestStreak = 0;
        let currentStreak = 0;
        let today = new Date();
        
        // Calculate current streak
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateKey = formatDateKey(date);
            if (completions[dateKey]) {
                currentStreak++;
            } else {
                break;
            }
        }

        // Calculate longest streak
        let tempCurrent = 0;
        for (let i = 0; i < dates.length; i++) {
            const currentDate = new Date(dates[i]);
            if (i > 0) {
                const prevDate = new Date(dates[i-1]);
                const diff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);
                if (diff > 1) {
                    tempCurrent = 0; // Reset streak
                }
            }
            tempCurrent++;
            if (tempCurrent > longestStreak) {
                longestStreak = tempCurrent;
            }
        }
        
        return { current: currentStreak, longest: longestStreak };
    };

    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-bg-primary">
            <header className="flex items-center mb-8">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-serif mx-auto">Habit Tracker</h2>
                <div className="w-10"></div>
            </header>

            <div className="flex-grow overflow-y-auto space-y-3 pb-32 no-scrollbar">
                {habits.length === 0 && (
                    <div className="text-center text-dun py-20">
                        <SmilePlusIcon className="w-16 h-16 mx-auto mb-4 text-dun/50"/>
                        <h3 className="font-semibold text-lg text-isabelline">Build a New Routine</h3>
                        <p>Add your first habit to start tracking your progress.</p>
                    </div>
                )}
                {habits.map(habit => {
                    const streaks = calculateStreaks(habit.completions);
                    return (
                        <div key={habit.id} className="bg-card p-4 rounded-2xl">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{habit.icon}</span>
                                    <div>
                                        <p className="font-semibold text-isabelline">{habit.name}</p>
                                        <div className="text-xs text-dun flex gap-3 mt-1">
                                            <span>🔥 Current: {streaks.current} days</span>
                                            <span>🏆 Longest: {streaks.longest} days</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => deleteHabit(habit.id)} className="text-dun hover:text-red-400">
                                    <TrashIcon className="w-4 h-4"/>
                                </button>
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {weekDates.map(date => {
                                    const dateKey = formatDateKey(date);
                                    const isCompleted = habit.completions[dateKey];
                                    return (
                                        <div key={dateKey} className="text-center">
                                            <span className="text-xs text-dun">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                            <div className="mt-1">
                                                <HabitCheckbox isCompleted={!!isCompleted} onToggle={() => toggleHabitCompletion(habit.id, dateKey)} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    );
                })}
                
                <div className="shrink-0 p-4 bg-card rounded-2xl mt-4">
                     <h3 className="font-semibold text-lg mb-3">Add New Habit</h3>
                     <div className="flex gap-2">
                        <div className="p-2 bg-bg-primary rounded-md">
                            <select value={newHabitIcon} onChange={e => setNewHabitIcon(e.target.value)} className="bg-transparent text-2xl focus:outline-none appearance-none">
                                {EMOJI_OPTIONS.map(emoji => <option key={emoji} value={emoji}>{emoji}</option>)}
                            </select>
                        </div>
                        <input 
                            type="text" 
                            value={newHabitName} 
                            onChange={e => setNewHabitName(e.target.value)}
                            placeholder="e.g., Read for 15 minutes"
                            className="w-full bg-bg-primary border-dun/50 focus:border-accent focus:ring-amber rounded-md text-sm placeholder-dun"
                        />
                    </div>
                    <button 
                        onClick={handleAddHabit} 
                        className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-accent text-cafe font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                        disabled={!newHabitName.trim()}
                    >
                        <PlusIcon className="w-5 h-5"/>
                        Add Habit
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default HabitTrackerScreen;
