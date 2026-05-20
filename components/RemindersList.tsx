
import React, { useState } from 'react';
import { Reminder } from '../types';
import { ArrowLeftIcon, TrashIcon, CalendarIcon, RepeatIcon } from './Icons';

interface RemindersListProps {
  reminders: Reminder[];
  onUpdateReminder: (reminder: Reminder) => void;
  onDeleteReminder: (id: string) => void;
  onBack: () => void;
}

const CustomCheckbox: React.FC<{
    completed: boolean;
    onToggle: () => void;
}> = ({ completed, onToggle }) => {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = () => {
        setIsAnimating(true);
        onToggle();
    };

    return (
        <button
            onClick={handleClick}
            onAnimationEnd={() => setIsAnimating(false)}
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${completed ? 'bg-accent border-accent' : 'border-dun/50 bg-jet'} ${isAnimating ? 'animate-pop-in-soft' : ''} ${completed ? 'custom-checkbox-checked' : ''}`}
            aria-label={completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
            {completed && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline className="check-icon-path" points="20 6 9 17 4 12"></polyline></svg>}
        </button>
    );
};


const RemindersList: React.FC<RemindersListProps> = ({ reminders, onUpdateReminder, onDeleteReminder, onBack }) => {
    
    const sortedReminders = [...reminders].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const upcomingReminders = sortedReminders.filter(r => !r.completed);
    const completedReminders = sortedReminders.filter(r => r.completed);

    const toggleCompletion = (reminder: Reminder) => {
        onUpdateReminder({ ...reminder, completed: !reminder.completed });
    };

    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-jet">
            <header className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-serif">My Reminders</h2>
                <div className="w-10"></div>
            </header>

            <div className="flex-grow overflow-y-auto space-y-4 pb-32 no-scrollbar">
                {upcomingReminders.length > 0 && (
                    <div>
                        <h3 className="text-dun text-sm font-semibold px-2 mb-2">Upcoming</h3>
                        <div className="space-y-2">
                             {upcomingReminders.map((reminder, index) => (
                                <ReminderItem key={reminder.id} reminder={reminder} onToggle={toggleCompletion} onDelete={onDeleteReminder} index={index} />
                            ))}
                        </div>
                    </div>
                )}

                {completedReminders.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-dun text-sm font-semibold px-2 mb-2">Completed</h3>
                         <div className="space-y-2">
                            {completedReminders.map((reminder, index) => (
                                <ReminderItem key={reminder.id} reminder={reminder} onToggle={toggleCompletion} onDelete={onDeleteReminder} index={index} />
                            ))}
                        </div>
                    </div>
                )}
                
                {reminders.length === 0 && (
                    <div className="text-center pt-20">
                        <p className="text-dun">No reminders set yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ReminderItem: React.FC<{
    reminder: Reminder;
    onToggle: (reminder: Reminder) => void;
    onDelete: (id: string) => void;
    index: number;
}> = ({ reminder, onToggle, onDelete, index }) => {
    const handleDownloadIcs = () => {
        const formatDate = (date: Date) => date.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
        const eventDate = new Date(reminder.date);
        const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000); // 1 hour duration

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//MwijayNote//EN',
            'BEGIN:VEVENT',
            `UID:${reminder.id}@mwijay.note`,
            `DTSTAMP:${formatDate(new Date())}`,
            `DTSTART:${formatDate(eventDate)}`,
            `DTEND:${formatDate(endDate)}`,
            `SUMMARY:${reminder.title}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${reminder.title}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    return (
        <div className="flex items-center gap-4 p-3 bg-card/50 rounded-lg group animate-stagger-in" style={{ animationDelay: `${index * 50}ms`}}>
            <CustomCheckbox completed={reminder.completed} onToggle={() => onToggle(reminder)} />

            <div className="flex-grow">
                <p className={`font-semibold ${reminder.completed ? 'line-through text-dun' : 'text-isabelline'}`}>{reminder.title}</p>
                <p className="text-xs text-dun flex items-center gap-1.5">
                    {reminder.frequency && reminder.frequency !== 'none' && <RepeatIcon className="w-3 h-3"/>}
                    {new Date(reminder.date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
             <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={handleDownloadIcs} className="text-dun hover:text-accent p-1" aria-label="Add to Calendar">
                    <CalendarIcon className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(reminder.id)} className="text-dun hover:text-red-400 p-1" aria-label="Delete Reminder">
                    <TrashIcon className="w-4 h-4" />
                </button>
             </div>
        </div>
    );
}


export default RemindersList;
