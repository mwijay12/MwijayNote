
import React from 'react';
import { CodeIcon } from './Icons';

const GitHubStreak: React.FC<{ dates: string[] }> = ({ dates }) => {
    // Generate last 12 weeks of data
    const today = new Date();
    const weeks = 12;
    const days = 7;
    const data = [];

    const dateSet = new Set(dates.map(d => new Date(d).toDateString()));

    for (let i = 0; i < weeks; i++) {
        const weekData = [];
        for (let j = 0; j < days; j++) {
            const d = new Date(today);
            d.setDate(today.getDate() - ((weeks - 1 - i) * 7 + (6 - j)));
            weekData.push({
                date: d,
                active: dateSet.has(d.toDateString())
            });
        }
        data.push(weekData);
    }

    return (
        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 font-mono">
            <h3 className="text-xs font-bold text-green-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <CodeIcon className="w-4 h-4"/> Dev Streak
            </h3>
            <div className="flex gap-1 justify-center">
                {data.map((week, i) => (
                    <div key={i} className="flex flex-col gap-1">
                        {week.map((day, j) => (
                            <div 
                                key={j} 
                                title={day.date.toDateString()}
                                className={`w-2.5 h-2.5 rounded-sm ${day.active ? 'bg-green-500' : 'bg-white/10'}`}
                            ></div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="text-right mt-2 text-[10px] text-dun">
                {dates.length} contributions in the last 90 days
            </div>
        </div>
    );
};

export default GitHubStreak;
