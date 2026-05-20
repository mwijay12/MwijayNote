
import React, { useState } from 'react';
import { ArrowLeftIcon, RepeatIcon, PlusIcon, TrashIcon } from './Icons';
import { RecurringTransaction } from '../types';

interface RecurringTransactionsScreenProps {
  recurringTransactions: RecurringTransaction[];
  addRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id'>) => void;
  deleteRecurringTransaction: (id: string) => void;
  onBack: () => void;
}

const expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Groceries', 'Savings', 'Other'];
const incomeCategories = ['Salary', 'Investment', 'Gift', 'Freelance', 'Other'];

const SegmentedControl: React.FC<{
    options: { label: string, value: string }[];
    value: string;
    onChange: (value: string) => void;
}> = ({ options, value, onChange }) => (
    <div className="p-1 bg-bg-primary rounded-full flex gap-1 w-full">
        {options.map(opt => (
            <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={`px-2 py-1.5 text-xs font-semibold rounded-full w-full capitalize transition-colors ${value === opt.value ? 'bg-dun/50 text-isabelline' : 'text-dun hover:bg-dun/20'}`}
            >
                {opt.label}
            </button>
        ))}
    </div>
);


const RecurringTransactionsScreen: React.FC<RecurringTransactionsScreenProps> = ({ recurringTransactions, addRecurringTransaction, deleteRecurringTransaction, onBack }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState('');
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    const handleAdd = () => {
        const parsedAmount = parseFloat(amount);
        if (name.trim() && !isNaN(parsedAmount) && parsedAmount > 0) {
            addRecurringTransaction({
                name: name.trim(),
                amount: parsedAmount,
                type,
                category: category.trim() || 'General',
                frequency,
                startDate,
            });
            // Reset form
            setName('');
            setAmount('');
            setCategory('');
        }
    };
    
    const currentCategoryList = type === 'expense' ? expenseCategories : incomeCategories;

    const frequencyOptions = [
        { label: 'Daily', value: 'daily'},
        { label: 'Weekly', value: 'weekly'},
        { label: 'Monthly', value: 'monthly'},
        { label: 'Yearly', value: 'yearly'},
    ];

    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-bg-primary">
            <header className="flex items-center mb-8">
                 <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-serif mx-auto">Recurring Transactions</h2>
                <div className="w-10"></div>
            </header>

            <div className="flex-grow overflow-y-auto space-y-3 pb-40">
                {recurringTransactions.length === 0 && (
                    <div className="text-center text-dun py-20">
                        <RepeatIcon className="w-16 h-16 mx-auto mb-4 text-dun/50"/>
                        <h3 className="font-semibold text-lg text-isabelline">Automate Your Finances</h3>
                        <p>Add recurring transactions like your salary or monthly bills.</p>
                    </div>
                )}
                {recurringTransactions.map(rt => (
                    <div key={rt.id} className="bg-card p-4 rounded-2xl flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-isabelline">{rt.name}</p>
                            <p className="text-xs text-dun capitalize">{rt.frequency} &bull; {rt.category}</p>
                        </div>
                        <div className="text-right">
                             <p className={`font-semibold text-lg ${rt.type === 'income' ? 'text-green-400' : 'text-accent'}`}>
                                {rt.type === 'income' ? '+' : '-'}${rt.amount.toFixed(2)}
                            </p>
                            <button onClick={() => deleteRecurringTransaction(rt.id)} className="text-dun hover:text-red-400 mt-1">
                                <TrashIcon className="w-4 h-4 ml-auto"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="shrink-0 p-4 bg-card rounded-2xl mt-4 border border-white/5 shadow-lg">
                 <h3 className="font-semibold text-lg mb-3">Add New Recurring Transaction</h3>
                 <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                         <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="bg-bg-primary border-dun/50 rounded-md text-sm p-2 focus:ring-amber focus:border-accent"/>
                         <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="bg-bg-primary border-dun/50 rounded-md text-sm p-2 focus:ring-amber focus:border-accent"/>
                    </div>
                    <div className="p-1 bg-bg-primary rounded-full flex gap-1">
                        <button onClick={() => setType('expense')} className={`px-4 py-1.5 text-sm font-semibold rounded-full w-full ${type === 'expense' ? 'bg-accent text-cafe' : 'text-dun'}`}>Expense</button>
                        <button onClick={() => setType('income')} className={`px-4 py-1.5 text-sm font-semibold rounded-full w-full ${type === 'income' ? 'bg-green-500 text-white' : 'text-dun'}`}>Income</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" list="recurring-category-suggestions" className="bg-bg-primary border-dun/50 rounded-md text-sm p-2 focus:ring-amber focus:border-accent"/>
                        <datalist id="recurring-category-suggestions">
                            {currentCategoryList.map(cat => <option key={cat} value={cat} />)}
                        </datalist>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-bg-primary border-dun/50 rounded-md text-sm p-2 focus:ring-amber focus:border-accent"/>
                    </div>
                     <div>
                        <SegmentedControl options={frequencyOptions} value={frequency} onChange={(val) => setFrequency(val as any)} />
                    </div>
                 </div>
                <button 
                    onClick={handleAdd} 
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-accent text-cafe font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md"
                    disabled={!name.trim() || !amount}
                >
                    <PlusIcon className="w-5 h-5"/>
                    Add Recurring Transaction
                </button>
             </div>
        </div>
    );
};

export default RecurringTransactionsScreen;
