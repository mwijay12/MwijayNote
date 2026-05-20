
import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, GraduationCapIcon, PlusIcon, TrashIcon, CalendarIcon, DollarSignIcon, LinkIcon, SparklesIcon } from './Icons';
import { Scholarship } from '../types';
import { searchScholarships } from '../services/geminiService';

interface ScholarshipTrackerProps {
    onBack: () => void;
}

const ScholarshipTracker: React.FC<ScholarshipTrackerProps> = ({ onBack }) => {
    const [scholarships, setScholarships] = useState<Scholarship[]>(() => {
        const stored = localStorage.getItem('mwijay_scholarships');
        return stored ? JSON.parse(stored) : [];
    });
    const [isAdding, setIsAdding] = useState(false);
    const [newScholarship, setNewScholarship] = useState<Partial<Scholarship>>({ status: 'To Apply' });
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        localStorage.setItem('mwijay_scholarships', JSON.stringify(scholarships));
    }, [scholarships]);

    const handleAdd = () => {
        if (newScholarship.name && newScholarship.deadline) {
            const scholarship: Scholarship = {
                id: Date.now().toString(),
                name: newScholarship.name,
                deadline: newScholarship.deadline,
                amount: newScholarship.amount || 0,
                status: newScholarship.status || 'To Apply',
                link: newScholarship.link,
                requirements: newScholarship.requirements
            };
            setScholarships([...scholarships, scholarship].sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()));
            setIsAdding(false);
            setNewScholarship({ status: 'To Apply' });
        }
    };

    const handleAiSearch = async () => {
        setIsSearching(true);
        try {
            const results = await searchScholarships();
            if (results.length > 0) {
                const newItems = results.map((r: any) => ({
                    id: (Date.now() + Math.random()).toString(),
                    name: r.name,
                    deadline: r.deadline || new Date().toISOString().split('T')[0],
                    amount: r.amount || 0,
                    status: 'To Apply' as const,
                    link: r.link,
                    requirements: r.requirements
                }));
                setScholarships(prev => [...prev, ...newItems]);
                alert(`Found ${newItems.length} relevant scholarships!`);
            } else {
                alert("No scholarships found at the moment. Try again later.");
            }
        } catch (e) {
            console.error(e);
            alert("Search failed.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleDelete = (id: string) => {
        setScholarships(scholarships.filter(s => s.id !== id));
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Won': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Applied': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'Rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-accent/20 text-accent border-accent/30';
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-bg-primary">
            <header className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-serif mx-auto flex items-center gap-2"><GraduationCapIcon className="w-6 h-6 text-accent"/> Scholarships</h2>
                <button onClick={() => setIsAdding(true)} className="p-2 rounded-full hover:bg-white/10">
                    <PlusIcon className="w-6 h-6" />
                </button>
            </header>

            {isAdding && (
                <div className="bg-card p-4 rounded-2xl mb-6 border border-accent/20 animate-slide-in-from-bottom">
                    <h3 className="font-bold text-accent mb-3">Track New Grant</h3>
                    <div className="space-y-3">
                        <input className="w-full bg-bg-primary p-2 rounded text-sm border border-white/10" placeholder="Scholarship Name" value={newScholarship.name || ''} onChange={e => setNewScholarship({...newScholarship, name: e.target.value})} />
                        <div className="flex gap-2">
                            <input type="date" className="flex-1 bg-bg-primary p-2 rounded text-sm border border-white/10 text-isabelline" value={newScholarship.deadline || ''} onChange={e => setNewScholarship({...newScholarship, deadline: e.target.value})} />
                            <input type="number" className="flex-1 bg-bg-primary p-2 rounded text-sm border border-white/10" placeholder="Amount (TSh)" value={newScholarship.amount || ''} onChange={e => setNewScholarship({...newScholarship, amount: parseFloat(e.target.value)})} />
                        </div>
                        <input className="w-full bg-bg-primary p-2 rounded text-sm border border-white/10" placeholder="Link / Requirements" value={newScholarship.link || ''} onChange={e => setNewScholarship({...newScholarship, link: e.target.value})} />
                        <div className="flex gap-2">
                            <button onClick={handleAdd} className="flex-1 bg-accent text-cafe py-2 rounded font-bold text-sm">Save</button>
                            <button onClick={() => setIsAdding(false)} className="flex-1 bg-bg-primary py-2 rounded text-sm">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-grow overflow-y-auto space-y-3 pb-4">
                <button 
                    onClick={handleAiSearch} 
                    disabled={isSearching}
                    className="w-full py-3 bg-card border border-accent/30 rounded-2xl flex items-center justify-center gap-2 text-accent font-bold hover:bg-accent/10 transition-colors mb-4"
                >
                    {isSearching ? <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5"/>}
                    AI Scout: Find Opportunities
                </button>

                {scholarships.length === 0 && !isAdding ? (
                    <div className="text-center text-dun py-20">
                        <GraduationCapIcon className="w-16 h-16 mx-auto mb-4 text-dun/50"/>
                        <p>Track engineering scholarships here.</p>
                    </div>
                ) : (
                    scholarships.map(s => (
                        <div key={s.id} className="bg-card p-4 rounded-2xl border border-white/5 group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-isabelline">{s.name}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-dun">
                                        <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> {new Date(s.deadline).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><DollarSignIcon className="w-3 h-3"/> {s.amount.toLocaleString()}</span>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(s.id)} className="text-dun hover:text-red-400 opacity-0 group-hover:opacity-100">
                                    <TrashIcon className="w-4 h-4"/>
                                </button>
                            </div>
                            {s.requirements && <p className="text-xs text-dun mt-2 italic line-clamp-2">{s.requirements}</p>}
                            <div className="flex justify-between items-center mt-3">
                                <span className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(s.status)}`}>{s.status}</span>
                                {s.link && <a href={s.link.startsWith('http') ? s.link : `https://${s.link}`} target="_blank" className="text-dun hover:text-white flex items-center gap-1 text-xs"><LinkIcon className="w-3 h-3"/> Link</a>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ScholarshipTracker;
