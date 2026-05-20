import React, { useState } from 'react';
import { Reminder } from '../types';
import { ArrowLeftIcon, CalendarIcon, ClockIcon } from './Icons';

interface ReminderEditorProps {
  reminder: Partial<Reminder>;
  onSave: (reminder: Omit<Reminder, 'id' | 'completed'>) => void;
  onCancel: () => void;
}

const ReminderEditor: React.FC<ReminderEditorProps> = ({ reminder, onSave, onCancel }) => {
  const [title, setTitle] = useState(reminder.title || '');
  const [date, setDate] = useState((reminder.date ? new Date(reminder.date) : new Date()).toISOString().slice(0, 16));
  const [frequency, setFrequency] = useState(reminder.frequency || 'none');

  const handleSave = () => {
    if (title.trim() && date) {
      onSave({
        title: title.trim(),
        date: new Date(date).toISOString(),
        frequency: frequency as 'none' | 'daily' | 'weekly' | 'monthly',
      });
    }
  };

  return (
    <div className="flex flex-col h-full animate-slide-in-from-bottom p-4 pt-16 bg-jet">
      <header className="flex justify-between items-center mb-8">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-serif">New Reminder</h2>
        <button 
            onClick={handleSave} 
            disabled={!title.trim() || !date}
            className="px-5 py-2 text-sm font-semibold rounded-full bg-accent text-cafe hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Save
        </button>
      </header>

      <div className="flex-grow flex flex-col gap-6">
        <div>
          <label htmlFor="reminder-title" className="text-sm font-medium text-dun ml-2">Reminder</label>
          <input
            id="reminder-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Call mom"
            className="w-full bg-transparent text-2xl p-2 focus:outline-none border-b-2 border-white/20 focus:border-accent transition-colors"
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="reminder-date" className="text-sm font-medium text-dun ml-2">Date & Time</label>
          <input
            id="reminder-date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent text-lg p-2 focus:outline-none border-b-2 border-white/20 focus:border-accent transition-colors"
          />
        </div>
        <div>
            <label htmlFor="reminder-frequency" className="text-sm font-medium text-dun ml-2">Frequency</label>
            <select
              id="reminder-frequency"
              value={frequency}
              // FIX: Cast value to the correct type to resolve TypeScript error.
              onChange={(e) => setFrequency(e.target.value as 'none' | 'daily' | 'weekly' | 'monthly')}
              className="w-full bg-transparent text-lg p-2 focus:outline-none border-b-2 border-white/20 focus:border-accent transition-colors appearance-none"
            >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
            </select>
        </div>
      </div>
    </div>
  );
};

export default ReminderEditor;
