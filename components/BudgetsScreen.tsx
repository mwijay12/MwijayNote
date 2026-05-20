
import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeftIcon, PiggyBankIcon, PlusIcon, TrashIcon } from './Icons';
import { Budget, Expense } from '../types';

interface BudgetsScreenProps {
  budgets: Budget[];
  expenses: Expense[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  onBack: () => void;
}

const expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Groceries', 'Other'];

const BudgetCard: React.FC<{
    budget: Budget;
    spent: number;
    onDelete: (id: string) => void;
}> = ({ budget, spent, onDelete }) => {
    const progress = Math.min((spent / budget.amount) * 100, 100);
    const isOverBudget = spent > budget.amount;
    const [animatedProgress, setAnimatedProgress] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedProgress(progress), 150);
        return () => clearTimeout(timer);
    }, [progress]);
    
    return (
        <div className="bg-card p-4 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-isabelline">{budget.category}</span>
                <button onClick={() => onDelete(budget.id)} className="text-dun hover:text-red-400">
                    <TrashIcon className="w-4 h-4"/>
                </button>
            </div>
            <div className="w-full bg-jet rounded-full h-3 mb-1">
                <div 
                    className={`h-3 rounded-full transition-all duration-1000 ease-out ${isOverBudget ? 'bg-red-500' : 'bg-accent'}`}
                    style={{ width: `${animatedProgress}%` }}
                ></div>
            </div>
            <div className="text-xs text-dun flex justify-between">
                <span>TSh {spent.toLocaleString()} spent</span>
                <span>of TSh {budget.amount.toLocaleString()}</span>
            </div>
            {isOverBudget && <p className="text-xs text-red-400 mt-1 font-semibold">You are TSh { (spent - budget.amount).toLocaleString() } over budget!</p>}
        </div>
    );
};


const BudgetsScreen: React.FC<BudgetsScreenProps> = ({ budgets, expenses, addBudget, deleteBudget, onBack }) => {
    const [newCategory, setNewCategory] = useState(expenseCategories[0]);
    const [newAmount, setNewAmount] = useState('');

    const handleAddBudget = () => {
        const amount = parseFloat(newAmount);
        if (newCategory && !isNaN(amount) && amount > 0) {
            if (budgets.some(b => b.category === newCategory)) {
                alert("Budget for this category already exists.");
                return;
            }
            addBudget({
                category: newCategory,
                amount: amount,
                period: 'monthly'
            });
            setNewAmount('');
        }
    };

    const monthlySpending = useMemo(() => {
        const spendingMap = new Map<string, number>();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        expenses.forEach(expense => {
            if (expense.type === 'expense' && new Date(expense.date) >= startOfMonth) {
                const category = expense.category || 'Other';
                const currentSpending = spendingMap.get(category) || 0;
                spendingMap.set(category, currentSpending + expense.amount);
            }
        });
        return spendingMap;
    }, [expenses]);
    
    const availableCategories = expenseCategories.filter(cat => !budgets.some(b => b.category === cat));
    
    useEffect(() => {
        if (availableCategories.length > 0) {
            setNewCategory(availableCategories[0]);
        }
    }, [budgets]);

    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-jet">
            <header className="flex items-center mb-8">
                 <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-serif mx-auto">Monthly Budgets</h2>
                <div className="w-10"></div>
            </header>

            <div className="flex-grow overflow-y-auto space-y-3 pb-40 no-scrollbar">
                {budgets.length === 0 && (
                    <div className="text-center text-dun py-20">
                        <PiggyBankIcon className="w-16 h-16 mx-auto mb-4 text-dun/50"/>
                        <h3 className="font-semibold text-lg text-isabelline">No Budgets Yet</h3>
                        <p>Create a budget below to start tracking your spending.</p>
                    </div>
                )}
                {budgets.map(budget => (
                   <BudgetCard 
                        key={budget.id}
                        budget={budget}
                        spent={monthlySpending.get(budget.category) || 0}
                        onDelete={deleteBudget}
                   />
                ))}
                
                {availableCategories.length > 0 && (
                     <div className="p-5 bg-card rounded-2xl mt-4 border border-white/5">
                         <h3 className="font-semibold text-lg mb-4 text-isabelline">Add New Budget</h3>
                         <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dun uppercase ml-1">Category</label>
                                <select 
                                    value={newCategory} 
                                    onChange={e => setNewCategory(e.target.value)}
                                    className="w-full bg-jet text-isabelline border border-white/10 rounded-xl p-4 text-lg focus:ring-2 focus:ring-amber focus:border-accent appearance-none"
                                >
                                    {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dun uppercase ml-1">Monthly Limit</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dun text-lg">TSh</span>
                                    <input 
                                        type="number" 
                                        value={newAmount} 
                                        onChange={e => setNewAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-jet text-isabelline border border-white/10 rounded-xl p-4 pl-12 text-lg focus:ring-2 focus:ring-amber focus:border-accent placeholder-dun/30"
                                    />
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={handleAddBudget} 
                            className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-accent text-cafe font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
                            disabled={!newCategory || !newAmount}
                        >
                            <PlusIcon className="w-6 h-6"/>
                            Create Budget
                        </button>
                     </div>
                )}
            </div>
        </div>
    );
};

export default BudgetsScreen;
