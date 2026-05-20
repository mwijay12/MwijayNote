import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeftIcon, TargetIcon, PlusIcon, TrashIcon, DollarSignIcon, BrainCircuitIcon, HeartHandshakeIcon, CheckIcon, XIcon, TrendingUpIcon } from './Icons';
import { Goal, Expense, GoalCategory, Milestone } from '../types';

interface GoalsScreenProps {
  goals: Goal[];
  expenses: Expense[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  onBack: () => void;
  onAddContribution: (goalId: string) => void;
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
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${completed ? 'bg-accent border-accent' : 'border-dun/50 bg-bg-primary'} ${isAnimating ? 'animate-pop-in-soft' : ''} ${completed ? 'custom-checkbox-checked' : ''}`}
            aria-label={completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
            {completed && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline className="check-icon-path" points="20 6 9 17 4 12"></polyline></svg>}
        </button>
    );
};

const getCategoryIcon = (category: GoalCategory) => {
    switch(category) {
        case 'Financial': return <DollarSignIcon className="w-5 h-5 text-green-400" />;
        case 'Academic': return <BrainCircuitIcon className="w-5 h-5 text-sky-400" />;
        case 'Personal': return <HeartHandshakeIcon className="w-5 h-5 text-rose-400" />;
        default: return null;
    }
};

const GoalCard: React.FC<{
    goal: Goal;
    saved: number;
    contributions: Expense[];
    onDelete: (id: string) => void;
    onAddContribution: (id: string) => void;
    onToggleMilestone: (goalId: string, milestoneId: string) => void;
    onUpdateGoal: (goal: Goal) => void;
}> = ({ goal, saved, contributions, onDelete, onAddContribution, onToggleMilestone, onUpdateGoal }) => {
    const [newMilestoneText, setNewMilestoneText] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    
    const completedMilestones = useMemo(() => goal.milestones?.filter(m => m.completed).length || 0, [goal.milestones]);
    const totalMilestones = goal.milestones?.length || 0;

    const progress = useMemo(() => {
        if (goal.category === 'Financial') {
            return goal.targetAmount > 0 ? Math.min((saved / goal.targetAmount) * 100, 100) : 0;
        }
        return totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
    }, [goal, saved, completedMilestones, totalMilestones]);

    const [animatedProgress, setAnimatedProgress] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedProgress(progress), 150);
        return () => clearTimeout(timer);
    }, [progress]);

    const handleAddMilestone = () => {
        if (newMilestoneText.trim() && goal.milestones) {
            const newMilestone: Milestone = {
                id: new Date().getTime().toString(),
                text: newMilestoneText.trim(),
                completed: false
            };
            onUpdateGoal({ ...goal, milestones: [...goal.milestones, newMilestone] });
            setNewMilestoneText('');
        }
    };
    
    const handleDeleteMilestone = (milestoneId: string) => {
        if (goal.milestones) {
            onUpdateGoal({ ...goal, milestones: goal.milestones.filter(m => m.id !== milestoneId) });
        }
    }

    return (
        <div className="bg-card p-4 rounded-2xl">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    {getCategoryIcon(goal.category)}
                    <span className="font-semibold text-isabelline">{goal.name}</span>
                </div>
                <button onClick={() => onDelete(goal.id)} className="text-dun hover:text-red-400">
                    <TrashIcon className="w-4 h-4"/>
                </button>
            </div>
            <div className="w-full bg-bg-primary rounded-full h-3 mb-1">
                <div 
                    className="h-3 rounded-full bg-accent transition-all duration-1000 ease-out"
                    style={{ width: `${animatedProgress}%` }}
                ></div>
            </div>
            {goal.category === 'Financial' ? (
                <>
                <div className="text-xs text-dun flex justify-between">
                    <span>TSh {saved.toLocaleString()} saved</span>
                    <span>of TSh {goal.targetAmount.toLocaleString()}</span>
                </div>
                {contributions.length > 0 && (
                     <div className="mt-3">
                        <button onClick={() => setShowHistory(!showHistory)} className="text-xs text-dun font-bold uppercase tracking-wider hover:text-white">{showHistory ? 'Hide' : 'Show'} History</button>
                        {showHistory && (
                            <div className="mt-2 space-y-1 animate-fade-in text-xs font-mono text-dun">
                                {contributions.slice(0, 5).map(c => (
                                    <div key={c.id} className="flex justify-between">
                                        <span>{new Date(c.date).toLocaleDateString()}</span>
                                        <span className="text-green-400">+TSh {c.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                <button onClick={() => onAddContribution(goal.id)} className="mt-3 w-full text-center py-2 text-xs font-semibold rounded-full bg-bg-primary hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
                    <PlusIcon className="w-4 h-4"/> Add Contribution
                </button>
                </>
            ) : (
                <>
                <div className="text-xs text-dun flex justify-between">
                    <span>{completedMilestones} of {totalMilestones} milestones</span>
                    <span>{Math.round(progress)}% Complete</span>
                </div>
                {goal.milestones && (
                    <div className="mt-3 space-y-2">
                        {goal.milestones.map(m => (
                             <div key={m.id} className="flex items-center gap-3 p-2 bg-bg-primary/50 rounded-lg group">
                                <CustomCheckbox completed={m.completed} onToggle={() => onToggleMilestone(goal.id, m.id)} />
                                <span className={`flex-grow text-sm ${m.completed ? 'line-through text-dun' : 'text-isabelline'}`}>{m.text}</span>
                                <button onClick={() => handleDeleteMilestone(m.id)} className="text-dun opacity-0 group-hover:opacity-100 hover:text-accent">
                                    <XIcon className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                         <div className="flex gap-2 pt-2">
                            <input 
                                type="text" 
                                value={newMilestoneText} 
                                onChange={e => setNewMilestoneText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddMilestone()}
                                placeholder="Add a new milestone..."
                                className="flex-grow bg-bg-primary border-dun focus:border-accent focus:ring-amber rounded-md text-xs placeholder-dun p-2"
                            />
                            <button onClick={handleAddMilestone} className="px-3 text-xs font-semibold rounded-md bg-accent text-cafe">Add</button>
                         </div>
                    </div>
                )}
                </>
            )}
        </div>
    );
};

const CategoryButton: React.FC<{
    label: GoalCategory;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 p-4 flex flex-col items-center justify-center gap-2 rounded-xl transition-colors ${isActive ? 'bg-accent text-cafe' : 'bg-bg-primary hover:bg-white/10'}`}
    >
        {icon}
        <span className="text-sm font-semibold">{label}</span>
    </button>
);


const GoalsScreen: React.FC<GoalsScreenProps> = ({ goals, expenses, addGoal, updateGoal, deleteGoal, toggleMilestone, onBack, onAddContribution }) => {
    const [newGoalName, setNewGoalName] = useState('');
    const [newTargetAmount, setNewTargetAmount] = useState('');
    const [newCategory, setNewCategory] = useState<GoalCategory>('Personal');
    const [activeFilter, setActiveFilter] = useState<GoalCategory | 'All'>('All');


    const handleAddGoal = () => {
        const amount = newCategory === 'Financial' ? parseFloat(newTargetAmount) : 0;
        if (newGoalName.trim() && (newCategory !== 'Financial' || (!isNaN(amount) && amount > 0))) {
            addGoal({
                name: newGoalName.trim(),
                targetAmount: amount,
                category: newCategory,
            });
            setNewGoalName('');
            setNewTargetAmount('');
        }
    };

    const handleStartChallenge = () => {
        const milestones: Milestone[] = [];
        let runningTotal = 0;
        for (let i = 1; i <= 52; i++) {
            runningTotal += i * 1000; // TSh 1000 increments
            milestones.push({
                id: `week-${i}-${Date.now()}`,
                text: `Week ${i}: Save TSh ${(i * 1000).toLocaleString()}`,
                completed: false
            });
        }
        
        addGoal({
            name: '52-Week Savings Challenge',
            targetAmount: runningTotal,
            category: 'Financial',
            milestones: milestones
        });
    };

    const contributionsByGoal = useMemo(() => {
        const map = new Map<string, Expense[]>();
        expenses.forEach(e => {
            if (e.goalId) {
                if (!map.has(e.goalId)) map.set(e.goalId, []);
                map.get(e.goalId)!.push(e);
            }
        });
        return map;
    }, [expenses]);
    
    const savedAmounts = useMemo(() => {
        const map = new Map<string, number>();
        for (const [goalId, contribs] of contributionsByGoal.entries()) {
            const totalSaved = contribs.reduce((sum, c) => sum + c.amount, 0);
            map.set(goalId, totalSaved);
        }
        return map;
    }, [contributionsByGoal]);
    
    const filteredGoals = useMemo(() => {
        if (activeFilter === 'All') return goals;
        return goals.filter(g => g.category === activeFilter);
    }, [goals, activeFilter]);
    
    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-bg-primary">
            <header className="flex items-center mb-8">
                 <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-serif mx-auto">My Goals</h2>
                <div className="w-10"></div>
            </header>

            <div className="flex justify-center gap-1 mb-4 p-1 bg-card rounded-full flex-wrap">
                {(['All', 'Financial', 'Academic', 'Personal'] as const).map(f => (
                    <button key={f} onClick={() => setActiveFilter(f)} className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full capitalize flex-grow ${activeFilter === f ? 'bg-accent text-cafe' : 'text-dun'}`}>
                        {f}
                    </button>
                ))}
            </div>


            <div className="flex-grow overflow-y-auto space-y-3 pb-40 no-scrollbar">
                {filteredGoals.length === 0 && (
                    <div className="text-center text-dun py-20">
                        <TargetIcon className="w-16 h-16 mx-auto mb-4 text-dun/50"/>
                        <h3 className="font-semibold text-lg text-isabelline">Set Your First Goal</h3>
                        <p>Define what you're working towards and track your progress.</p>
                    </div>
                )}
                {filteredGoals.map(goal => (
                    <GoalCard 
                        key={goal.id} 
                        goal={goal} 
                        saved={savedAmounts.get(goal.id) || 0} 
                        contributions={contributionsByGoal.get(goal.id) || []}
                        onDelete={deleteGoal} 
                        onAddContribution={onAddContribution}
                        onToggleMilestone={toggleMilestone}
                        onUpdateGoal={updateGoal}
                    />
                ))}
                
                 <div className="p-5 bg-card rounded-2xl mt-4 border border-white/5">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg text-isabelline">Add New Goal</h3>
                        <button 
                            onClick={handleStartChallenge}
                            className="text-xs font-bold text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 hover:bg-green-500/20 flex items-center gap-1"
                        >
                            <TrendingUpIcon className="w-3 h-3"/> 52-Week Challenge
                        </button>
                     </div>
                     <div className="flex flex-col gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-dun uppercase ml-1">Goal Name</label>
                            <input 
                                type="text" 
                                value={newGoalName} 
                                onChange={e => setNewGoalName(e.target.value)}
                                placeholder="e.g. Read 20 books"
                                className="w-full bg-bg-primary text-isabelline border border-white/10 rounded-xl p-4 text-lg focus:ring-2 focus:ring-amber focus:border-accent"
                            />
                        </div>
                        
                        <div className="flex gap-2">
                            <CategoryButton label="Personal" icon={<HeartHandshakeIcon className="w-5 h-5"/>} isActive={newCategory === 'Personal'} onClick={() => setNewCategory('Personal')} />
                            <CategoryButton label="Academic" icon={<BrainCircuitIcon className="w-5 h-5"/>} isActive={newCategory === 'Academic'} onClick={() => setNewCategory('Academic')} />
                            <CategoryButton label="Financial" icon={<DollarSignIcon className="w-5 h-5"/>} isActive={newCategory === 'Financial'} onClick={() => setNewCategory('Financial')} />
                        </div>

                        {newCategory === 'Financial' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dun uppercase ml-1">Target Amount (TSh)</label>
                                <input 
                                    type="number" 
                                    value={newTargetAmount} 
                                    onChange={e => setNewTargetAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-bg-primary text-isabelline border border-white/10 rounded-xl p-4 text-lg focus:ring-2 focus:ring-amber focus:border-accent"
                                />
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={handleAddGoal} 
                        className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-accent text-cafe font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
                        disabled={!newGoalName.trim() || (newCategory === 'Financial' && !newTargetAmount.trim())}
                    >
                        <PlusIcon className="w-6 h-6"/>
                        Create Goal
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default GoalsScreen;
