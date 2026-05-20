
import React, { useState, useMemo } from 'react';
import { JournalEntry, Reminder, Expense, JournalType, JournalTopic, AppView } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, FeatherIcon, BellIcon, PaperclipIcon, BookOpenIcon, CalendarIcon, GridIcon, ActivityIcon } from './Icons';

interface CalendarScreenProps {
    journals: JournalEntry[];
    reminders: Reminder[];
    expenses: Expense[];
    onNavigate: (view: AppView) => void;
    onCreateJournal: (type: JournalType, topic: JournalTopic, date: string, fromView: AppView) => void;
    onCreateReminder: (date: string, fromView: AppView) => void;
    onPreviewJournal: (journal: JournalEntry) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper to check if same date
const isSameDate = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

const HeatmapView: React.FC<{ journals: JournalEntry[], year: number }> = ({ journals, year }) => {
    // Generate all days for the year
    const days = useMemo(() => {
        const d = [];
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31);
        for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
            d.push(new Date(dt));
        }
        return d;
    }, [year]);

    const getIntensity = (date: Date) => {
        const entries = journals.filter(j => isSameDate(new Date(j.date), date));
        if (entries.length === 0) return 'bg-white/5'; // No entry
        // Check mood average if available, else count
        const moods = entries.map(j => j.mood || 3);
        const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length;
        
        if (avgMood >= 4.5) return 'bg-green-400';
        if (avgMood >= 3.5) return 'bg-green-600';
        if (avgMood >= 2.5) return 'bg-yellow-600';
        return 'bg-red-500';
    };

    return (
        <div className="p-4 bg-card rounded-2xl border border-white/5 animate-fade-in">
            <h3 className="text-sm font-bold text-isabelline mb-4">Consistency Map {year}</h3>
            <div className="flex flex-wrap gap-1 justify-center">
                {days.map((day, i) => (
                    <div 
                        key={i} 
                        className={`w-3 h-3 rounded-sm ${getIntensity(day)}`} 
                        title={day.toDateString()}
                    ></div>
                ))}
            </div>
            <div className="flex justify-center gap-4 mt-4 text-[10px] text-dun">
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-white/5 rounded-sm"></div> Empty</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-sm"></div> Low</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-600 rounded-sm"></div> Avg</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-400 rounded-sm"></div> High</span>
            </div>
        </div>
    );
};

const CalendarScreen: React.FC<CalendarScreenProps> = ({ journals, reminders, expenses, onNavigate, onCreateJournal, onCreateReminder, onPreviewJournal }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'heatmap'>('month');

    // Calendar Grid Logic
    const calendarGridDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        for (let i = firstDay; i > 0; i--) days.push(new Date(year, month, 1 - i));
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) days.push(new Date(year, month, daysInMonth + i));
        return days;
    }, [viewDate]);
    
    // Event Mapping
    const eventsByDate = useMemo(() => {
        const map = new Map<string, { journals: JournalEntry[], reminders: Reminder[], expenses: Expense[] }>();
        const addEvent = (dateStr: string, type: 'journals' | 'reminders' | 'expenses', item: any) => {
            const key = new Date(dateStr).toDateString();
            if (!map.has(key)) map.set(key, { journals: [], reminders: [], expenses: [] });
            map.get(key)![type].push(item);
        };
        journals.forEach(j => addEvent(j.date, 'journals', j));
        reminders.forEach(r => addEvent(r.date, 'reminders', r));
        expenses.forEach(e => addEvent(e.date, 'expenses', e));
        return map;
    }, [journals, reminders, expenses]);
    
    const selectedDateEvents = eventsByDate.get(selectedDate.toDateString());

    return (
        <div className="flex flex-col h-full animate-fade-in-up p-4 pt-12 pb-24 bg-bg-primary">
            <header className="flex justify-between items-center mb-6 px-2">
                <h1 className="text-2xl font-brand font-bold text-isabelline">
                    {viewMode === 'month' ? viewDate.toLocaleString('default', { month: 'long', year: 'numeric' }) : `Year Overview ${viewDate.getFullYear()}`}
                </h1>
                <div className="flex gap-2 items-center">
                    <button onClick={() => setViewMode(prev => prev === 'month' ? 'heatmap' : 'month')} className="p-2 rounded-lg bg-card border border-white/10 hover:bg-white/5">
                        {viewMode === 'month' ? <ActivityIcon className="w-5 h-5 text-accent"/> : <CalendarIcon className="w-5 h-5 text-accent"/>}
                    </button>
                    {viewMode === 'month' && (
                        <div className="flex bg-card rounded-full p-1 border border-white/5">
                            <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-1 rounded-full hover:bg-white/10"><ChevronLeftIcon className="w-5 h-5"/></button>
                            <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-1 rounded-full hover:bg-white/10"><ChevronRightIcon className="w-5 h-5"/></button>
                        </div>
                    )}
                </div>
            </header>
            
            {viewMode === 'heatmap' ? (
                <HeatmapView journals={journals} year={viewDate.getFullYear()} />
            ) : (
                <>
                    <div className="grid grid-cols-7 text-center text-xs text-dun mb-2">
                        {WEEKDAYS.map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {calendarGridDays.map((day, index) => {
                            const isToday = isSameDate(day, new Date());
                            const isSelected = isSameDate(day, selectedDate);
                            const isCurrentMonth = day.getMonth() === viewDate.getMonth();
                            const events = eventsByDate.get(day.toDateString());
                            
                            return (
                                <button 
                                    key={index} 
                                    onClick={() => setSelectedDate(day)}
                                    className={`p-2 aspect-square flex flex-col items-center justify-start rounded-lg transition-colors ${!isCurrentMonth ? 'text-dun/30' : 'text-isabelline'} ${isSelected ? 'bg-accent text-cafe' : 'hover:bg-white/10'}`}
                                >
                                    <span className={`text-sm font-semibold ${isToday && !isSelected ? 'text-accent' : ''}`}>{day.getDate()}</span>
                                    <div className="flex gap-1 mt-1">
                                        {events?.journals.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-sky-400"></div>}
                                        {events?.reminders.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>}
                                        {events?.expenses.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </>
            )}

            <div className="mt-6 flex-grow overflow-y-auto">
                <div className="flex justify-between items-center">
                    <h2 className="font-serif text-xl">
                        {selectedDate.toLocaleString('default', { month: 'long', day: 'numeric' })}
                    </h2>
                     <div className="flex gap-2">
                        <button onClick={() => onCreateJournal('Gratitude Journal', JournalTopic.GRATITUDE, selectedDate.toISOString(), AppView.CALENDAR)} className="flex items-center gap-1.5 text-sm p-2 rounded-lg bg-card hover:bg-white/10"><FeatherIcon className="w-4 h-4 text-accent"/> New Journal</button>
                        <button onClick={() => onCreateReminder(selectedDate.toISOString(), AppView.CALENDAR)} className="flex items-center gap-1.5 text-sm p-2 rounded-lg bg-card hover:bg-white/10"><BellIcon className="w-4 h-4 text-accent"/> New Reminder</button>
                     </div>
                </div>

                <div className="mt-4 space-y-3">
                    {!selectedDateEvents || (selectedDateEvents.journals.length === 0 && selectedDateEvents.reminders.length === 0 && selectedDateEvents.expenses.length === 0) ? (
                        <p className="text-dun text-center pt-8">No entries for this day.</p>
                    ) : (
                        <>
                            {selectedDateEvents.journals.map(j => (
                                <div key={j.id} onClick={() => onPreviewJournal(j)} className="p-3 rounded-lg bg-card/50 cursor-pointer hover:bg-card">
                                    <p className="font-semibold">{j.title}</p>
                                    <p className="text-xs text-dun">{j.type}</p>
                                </div>
                            ))}
                            {selectedDateEvents.reminders.map(r => (
                                <div key={r.id} className="p-3 rounded-lg bg-card/50">
                                    <p className={`font-semibold ${r.completed ? 'line-through text-dun' : ''}`}>{r.title}</p>
                                    <p className="text-xs text-dun">Reminder</p>
                                </div>
                            ))}
                            {selectedDateEvents.expenses.map(e => (
                                <div key={e.id} className="p-3 rounded-lg bg-card/50 flex justify-between">
                                    <div><p className="font-semibold">{e.name}</p><p className="text-xs text-dun capitalize">{e.category}</p></div>
                                    <p className={`font-semibold ${e.type === 'income' ? 'text-green-400' : 'text-accent'}`}>{e.type === 'income' ? '+' : '-'}TSh {e.amount.toLocaleString()}</p>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalendarScreen;
