
import React, { useState } from 'react';
import { ArrowLeftIcon, DollarSignIcon, CheckCircleIcon, SparklesIcon, TrashIcon, BookOpenIcon, PlusIcon } from './Icons';
import { solveAccountingProblem } from '../services/geminiService';

interface AccountingTrainerScreenProps {
    onBack: () => void;
}

type AccountType = 'Cash' | 'Bank' | 'Sales' | 'Capital';

interface TransactionLine {
    account: string;
    debit: string;
    credit: string;
}

const TAccount: React.FC<{ name: string, debit: number, credit: number }> = ({ name, debit, credit }) => (
    <div className="bg-white text-black p-2 rounded-lg border border-gray-300 w-full font-mono text-xs">
        <div className="text-center font-bold border-b border-black mb-1 pb-1">{name}</div>
        <div className="grid grid-cols-2 h-20">
            <div className="border-r border-black pr-1 text-right">
                <div className="text-gray-500 text-[10px]">Dr</div>
                {debit > 0 && <div>{debit}</div>}
            </div>
            <div className="pl-1 text-right">
                <div className="text-gray-500 text-[10px]">Cr</div>
                {credit > 0 && <div>{credit}</div>}
            </div>
        </div>
    </div>
);

const AccountingTrainerScreen: React.FC<AccountingTrainerScreenProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'entry' | 'playground'>('entry');
    const [question, setQuestion] = useState('');
    const [rows, setRows] = useState<TransactionLine[]>([{ account: '', debit: '', credit: '' }, { account: '', debit: '', credit: '' }]);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Playground State (Simple ledger sim)
    const [ledger, setLedger] = useState<{name: string, dr: number, cr: number}[]>([
        { name: 'Cash', dr: 10000, cr: 0 },
        { name: 'Bank', dr: 50000, cr: 0 },
        { name: 'Sales', dr: 0, cr: 20000 }
    ]);

    const handleSolve = async () => {
        if (!question.trim()) return;
        setIsLoading(true);
        const result = await solveAccountingProblem(question);
        setFeedback(result);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-jet">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                <h2 className="text-xl font-serif ml-4 flex items-center gap-2"><DollarSignIcon className="w-6 h-6 text-green-400"/> Accounting Lab</h2>
            </header>

            <div className="flex gap-2 mb-4 p-1 bg-card rounded-full">
                <button onClick={() => setActiveTab('entry')} className={`flex-1 py-2 text-xs font-bold rounded-full transition-colors ${activeTab === 'entry' ? 'bg-accent text-cafe' : 'text-dun'}`}>Journal Entry</button>
                <button onClick={() => setActiveTab('playground')} className={`flex-1 py-2 text-xs font-bold rounded-full transition-colors ${activeTab === 'playground' ? 'bg-green-500 text-white' : 'text-dun'}`}>Ledger Playground</button>
            </div>

            {activeTab === 'entry' ? (
                <div className="flex-grow flex flex-col gap-4 overflow-y-auto">
                    <div className="bg-card p-4 rounded-xl border border-white/10">
                        <label className="text-xs font-bold text-dun uppercase mb-2 block">Practice Problem</label>
                        <textarea 
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            placeholder="e.g. Started business with Cash 10,000 and Bank 50,000."
                            className="w-full bg-jet p-3 rounded-xl text-sm h-24 resize-none focus:ring-1 focus:ring-green-400 outline-none"
                        />
                        <button onClick={handleSolve} disabled={isLoading || !question} className="w-full mt-2 py-2 bg-green-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                             {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <SparklesIcon className="w-4 h-4"/>}
                             Ask AI Tutor
                        </button>
                    </div>
                    {feedback && (
                        <div className="bg-jet/50 p-4 rounded-xl border border-accent/20 text-sm whitespace-pre-wrap animate-slide-in-from-bottom">
                            {feedback}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-grow flex flex-col gap-4 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                        {ledger.map((acc, i) => (
                            <TAccount key={i} name={acc.name} debit={acc.dr} credit={acc.cr} />
                        ))}
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-white/5">
                        <h3 className="text-xs font-bold text-dun uppercase mb-2">Quick Post</h3>
                        <div className="flex gap-2 mb-2">
                             <input placeholder="Account Name" className="flex-1 bg-jet p-2 rounded text-xs"/>
                             <input placeholder="Dr" type="number" className="w-16 bg-jet p-2 rounded text-xs"/>
                             <input placeholder="Cr" type="number" className="w-16 bg-jet p-2 rounded text-xs"/>
                        </div>
                        <button className="w-full py-2 bg-white/10 text-dun rounded-lg text-xs font-bold hover:bg-white/20">Add to Ledger (Demo)</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountingTrainerScreen;
