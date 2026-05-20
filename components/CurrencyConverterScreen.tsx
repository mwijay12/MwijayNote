
import React, { useState } from 'react';
import { ArrowLeftIcon, RepeatIcon } from './Icons';

const CurrencyConverterScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [amount, setAmount] = useState('1');
    const [from, setFrom] = useState('USD');
    const [to, setTo] = useState('TZS');
    
    // Mock rates for offline demo capability
    const rates: Record<string, number> = {
        USD: 1,
        TZS: 2550,
        EUR: 0.92,
        GBP: 0.79,
        KES: 130
    };

    const convert = () => {
        const val = parseFloat(amount);
        if(isNaN(val)) return 0;
        const inUsd = val / rates[from];
        return (inUsd * rates[to]).toLocaleString(undefined, { maximumFractionDigits: 2 });
    };

    return (
        <div className="flex flex-col h-full bg-jet p-4 pt-16 animate-fade-in">
            <header className="flex items-center mb-8">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                <h2 className="text-xl font-serif ml-4 flex items-center gap-2"><RepeatIcon className="w-5 h-5 text-green-400"/> Converter</h2>
            </header>

            <div className="bg-card p-6 rounded-3xl border border-white/10 shadow-lg space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-dun uppercase ml-1">Amount</label>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        className="w-full bg-jet p-4 rounded-xl text-2xl font-bold text-isabelline outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                <div className="flex gap-4 items-center">
                    <select value={from} onChange={e => setFrom(e.target.value)} className="flex-1 bg-jet p-3 rounded-xl text-lg font-bold outline-none border border-white/5">
                        {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <span className="text-dun">to</span>
                    <select value={to} onChange={e => setTo(e.target.value)} className="flex-1 bg-jet p-3 rounded-xl text-lg font-bold outline-none border border-white/5">
                        {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="bg-jet/50 p-6 rounded-2xl text-center">
                    <p className="text-sm text-dun mb-1">Result</p>
                    <h1 className="text-4xl font-bold text-green-400">{convert()} <span className="text-lg text-green-600">{to}</span></h1>
                    <p className="text-[10px] text-dun mt-2 opacity-50">*Rates are simulated for offline use</p>
                </div>
            </div>
        </div>
    );
};

export default CurrencyConverterScreen;
