
import React, { useState } from 'react';
import { ArrowLeftIcon, CalculatorIcon } from './Icons';

interface FinancialRatioScreenProps {
    onBack: () => void;
}

const ratios = [
    { id: 'roi', name: 'ROI (Return on Investment)', inputs: ['Net Profit', 'Total Investment'] },
    { id: 'margin', name: 'Net Profit Margin', inputs: ['Net Profit', 'Revenue'] },
    { id: 'breakeven', name: 'Break-Even Point', inputs: ['Fixed Costs', 'Price per Unit', 'Variable Cost per Unit'] },
];

const FinancialRatioScreen: React.FC<FinancialRatioScreenProps> = ({ onBack }) => {
    const [selectedRatio, setSelectedRatio] = useState(ratios[0]);
    const [values, setValues] = useState<Record<string, string>>({});
    const [result, setResult] = useState<string | null>(null);

    const calculate = () => {
        const nums = selectedRatio.inputs.map(key => parseFloat(values[key] || '0'));
        if (nums.some(isNaN)) return;

        let res = 0;
        if (selectedRatio.id === 'roi') {
            res = (nums[0] / nums[1]) * 100;
            setResult(`${res.toFixed(2)}%`);
        } else if (selectedRatio.id === 'margin') {
            res = (nums[0] / nums[1]) * 100;
            setResult(`${res.toFixed(2)}%`);
        } else if (selectedRatio.id === 'breakeven') {
            const contributionMargin = nums[1] - nums[2];
            if (contributionMargin <= 0) setResult("Infinite (Loss per unit)");
            else {
                res = nums[0] / contributionMargin;
                setResult(`${Math.ceil(res)} Units`);
            }
        }
    };

    return (
        <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-jet">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                <h2 className="text-xl font-serif ml-4 flex items-center gap-2"><CalculatorIcon className="w-6 h-6 text-blue-400"/> Financial Ratios</h2>
            </header>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                {ratios.map(r => (
                    <button 
                        key={r.id} 
                        onClick={() => { setSelectedRatio(r); setValues({}); setResult(null); }}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${selectedRatio.id === r.id ? 'bg-blue-500 text-white' : 'bg-card text-dun hover:text-white'}`}
                    >
                        {r.name}
                    </button>
                ))}
            </div>

            <div className="bg-card p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
                {selectedRatio.inputs.map((label, idx) => (
                    <div key={idx}>
                        <label className="block text-xs font-bold text-dun uppercase mb-1">{label}</label>
                        <input 
                            type="number" 
                            value={values[label] || ''}
                            onChange={e => setValues({...values, [label]: e.target.value})}
                            className="w-full bg-jet p-3 rounded-xl text-isabelline focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>
                ))}
                <button onClick={calculate} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors">Calculate</button>
            </div>

            {result && (
                <div className="mt-6 text-center animate-pop-in">
                    <p className="text-dun text-sm uppercase tracking-widest font-bold">Result</p>
                    <h1 className="text-5xl font-mono font-bold text-white mt-2">{result}</h1>
                </div>
            )}
        </div>
    );
};

export default FinancialRatioScreen;
