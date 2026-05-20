
import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, CodeIcon, PlusIcon, CheckIcon, RefreshCwIcon, TrashIcon, InfoIcon, XIcon } from './Icons';
import { LeetCodeProblem } from '../types';

interface LeetCodeTrackerProps {
    onBack: () => void;
}

const LeetCodeTracker: React.FC<LeetCodeTrackerProps> = ({ onBack }) => {
    const [problems, setProblems] = useState<LeetCodeProblem[]>(() => {
        const stored = localStorage.getItem('mwijay_leetcode');
        return stored ? JSON.parse(stored) : [];
    });
    const [newTitle, setNewTitle] = useState('');
    const [newDiff, setNewDiff] = useState<'Easy'|'Medium'|'Hard'>('Easy');
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        localStorage.setItem('mwijay_leetcode', JSON.stringify(problems));
    }, [problems]);

    const addProblem = () => {
        if (!newTitle.trim()) return;
        const p: LeetCodeProblem = {
            id: Date.now().toString(),
            title: newTitle,
            difficulty: newDiff,
            status: 'To Do',
            lastPracticed: ''
        };
        setProblems([p, ...problems]);
        setNewTitle('');
    };

    const updateStatus = (id: string, status: 'Solved' | 'Attempted') => {
        setProblems(prev => prev.map(p => p.id === id ? { ...p, status, lastPracticed: new Date().toISOString() } : p));
    };

    const getReviewColor = (dateStr?: string) => {
        if (!dateStr) return 'text-dun';
        const days = (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24);
        if (days > 7) return 'text-red-400'; // Needs review
        if (days > 3) return 'text-accent';
        return 'text-green-400';
    };

    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-jet relative">
             {showInfo && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowInfo(false)}>
                    <div className="bg-card border border-white/10 p-6 rounded-2xl max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-green-400 font-bold">Spaced Repetition (SRS)</h3>
                            <button onClick={() => setShowInfo(false)}><XIcon className="w-5 h-5"/></button>
                        </div>
                        <p className="text-sm leading-relaxed mb-4 text-isabelline">
                            SRS is a learning technique that incorporates increasing intervals of time between subsequent review of previously learned material.
                        </p>
                        <p className="text-sm leading-relaxed text-dun mb-2">
                            <strong>Why for Coding?</strong> Technical interviews require recognizing patterns instantly. Revisiting problems just as you're about to forget them strengthens long-term memory.
                        </p>
                        <p className="text-xs text-dun/50 font-mono">
                            Also: Big O notation measures the efficiency of algorithms. Always optimize for Time and Space complexity!
                        </p>
                    </div>
                </div>
            )}

            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                    <h2 className="text-xl font-serif text-green-400 font-mono ml-2">LeetCode SRS</h2>
                </div>
                <button onClick={() => setShowInfo(true)} className="text-dun hover:text-white"><InfoIcon className="w-5 h-5"/></button>
            </header>

            <div className="bg-card p-4 rounded-2xl mb-6">
                <div className="flex gap-2 mb-2">
                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Problem Name (e.g. Two Sum)" className="flex-grow bg-jet p-2 rounded text-sm focus:ring-green-500" />
                    <select value={newDiff} onChange={e => setNewDiff(e.target.value as any)} className="bg-jet p-2 rounded text-sm">
                        <option>Easy</option><option>Medium</option><option>Hard</option>
                    </select>
                </div>
                <button onClick={addProblem} className="w-full bg-green-600 text-black font-bold py-2 rounded text-sm hover:bg-green-500">Add Problem</button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-3">
                {problems.map(p => (
                    <div key={p.id} className="bg-card/50 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-isabelline">{p.title}</p>
                            <p className="text-xs text-dun flex items-center gap-2">
                                <span className={`${p.difficulty === 'Hard' ? 'text-red-400' : p.difficulty === 'Medium' ? 'text-accent' : 'text-green-400'}`}>{p.difficulty}</span>
                                &bull; Last: <span className={getReviewColor(p.lastPracticed)}>{p.lastPracticed ? new Date(p.lastPracticed).toLocaleDateString() : 'Never'}</span>
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => updateStatus(p.id, 'Solved')} className={`p-2 rounded-full ${p.status === 'Solved' ? 'bg-green-500 text-black' : 'bg-white/5 text-dun hover:bg-green-500/20'}`}><CheckIcon className="w-4 h-4"/></button>
                            <button onClick={() => setProblems(problems.filter(x => x.id !== p.id))} className="p-2 text-dun hover:text-red-400"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeetCodeTracker;
