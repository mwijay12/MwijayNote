
import React, { useState, useMemo } from 'react';
import { ArrowLeftIcon, CalendarIcon, PlusIcon, TrashIcon, BellIcon, ClockIcon } from './Icons';
import { Reminder } from '../types';

interface TimetableScreenProps {
    reminders: Reminder[];
    addReminder: (reminder: Omit<Reminder, 'id' | 'completed'>) => void;
    deleteReminder: (id: string) => void;
    onBack: () => void;
    isEmbedded?: boolean;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TimetableScreen: React.FC<TimetableScreenProps> = ({ reminders, addReminder, deleteReminder, onBack, isEmbedded }) => {
    const [selectedDay, setSelectedDay] = useState('Mon');
    const [isAdding, setIsAdding] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const [newTime, setNewTime] = useState('08:00');

    // Filter reminders that are part of the timetable for the selected day
    const daySchedule = useMemo(() => {
        return reminders.filter(r => r.isTimetable && r.timetableDay === selectedDay)
            .sort((a, b) => a.date.localeCompare(b.date)); 
    }, [reminders, selectedDay]);

    const handleAddClass = () => {
        if (!newSubject.trim()) return;

        const now = new Date();
        const standardDayIndex = selectedDay === 'Sun' ? 0 : WEEKDAYS.indexOf(selectedDay) + 1;
        const diff = (standardDayIndex + 7 - now.getDay()) % 7;
        const nextDate = new Date(now);
        nextDate.setDate(now.getDate() + (diff === 0 ? 7 : diff)); 
        
        const [hours, mins] = newTime.split(':');
        nextDate.setHours(parseInt(hours), parseInt(mins), 0, 0);

        addReminder({
            title: newSubject,
            date: nextDate.toISOString(),
            frequency: 'weekly',
            isTimetable: true,
            timetableDay: selectedDay
        });
        
        setIsAdding(false);
        setNewSubject('');
        setNewTime('08:00');
        
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    };

    return (
        <div className={`flex flex-col h-full animate-fade-in ${isEmbedded ? 'p-0' : 'bg-jet p-4 pt-16'}`}>
            {!isEmbedded && (
                <header className="flex items-center mb-6">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6"/></button>
                    <h2 className="text-xl font-serif ml-4 flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-accent"/> Student Timetable
                    </h2>
                </header>
            )}

            <div className={`flex justify-between bg-card p-1 rounded-xl mb-6 overflow-x-auto no-scrollbar ${isEmbedded ? 'mx-6 mt-6' : ''}`}>
                {WEEKDAYS.map(day => (
                    <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`px-3 py-2 rounded-lg text-sm font-bold transition-all flex-grow ${selectedDay === day ? 'bg-accent text-cafe shadow-lg' : 'text-dun hover:text-white'}`}
                    >
                        {day}
                    </button>
                ))}
            </div>

            <div className={`flex-grow overflow-y-auto space-y-3 pb-20 ${isEmbedded ? 'px-6' : ''}`}>
                {daySchedule.length === 0 ? (
                    <div className="text-center text-dun py-20 flex flex-col items-center">
                        <ClockIcon className="w-16 h-16 mb-4 text-dun/30"/>
                        <p>No classes scheduled for {selectedDay}.</p>
                        <p className="text-xs mt-2 opacity-70">Add one to get weekly reminders!</p>
                    </div>
                ) : (
                    daySchedule.map(item => (
                        <div key={item.id} className="bg-card p-4 rounded-xl border-l-4 border-accent flex justify-between items-center group">
                            <div>
                                <h3 className="font-bold text-isabelline text-lg">{item.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-accent font-mono">
                                        {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="text-xs text-dun flex items-center gap-1">
                                        <BellIcon className="w-3 h-3"/> Weekly Alarm
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => deleteReminder(item.id)} className="text-dun hover:text-red-400 p-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    ))
                )}
            </div>

            {isAdding ? (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in" onClick={() => setIsAdding(false)}>
                    <div className="bg-card w-full max-w-sm p-6 rounded-2xl border border-white/10 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-lg text-isabelline mb-4">Add Class to {selectedDay}</h3>
                        <div className="space-y-4">
                            <input 
                                value={newSubject}
                                onChange={e => setNewSubject(e.target.value)}
                                placeholder="Subject (e.g. Mathematics)"
                                className="w-full bg-jet p-3 rounded-xl border border-white/10 outline-none focus:border-accent text-isabelline focus:ring-1 focus:ring-amber"
                                autoFocus
                            />
                            <input 
                                type="time"
                                value={newTime}
                                onChange={e => setNewTime(e.target.value)}
                                className="w-full bg-jet p-3 rounded-xl border border-white/10 outline-none focus:border-accent text-isabelline"
                            />
                            <button onClick={handleAddClass} className="w-full py-3 bg-accent text-cafe font-bold rounded-xl hover:opacity-90">
                                Set Reminder
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsAdding(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-cafe rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40"
                >
                    <PlusIcon className="w-8 h-8"/>
                </button>
            )}
        </div>
    );
};

export default TimetableScreen;
    
