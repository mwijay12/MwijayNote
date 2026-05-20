
import React, { useState } from 'react';
import { ArrowLeftIcon, ZapIcon } from './Icons';

interface LogicGateSimulatorProps {
    onBack: () => void;
}

const LogicGateSimulator: React.FC<LogicGateSimulatorProps> = ({ onBack }) => {
    const [inputs, setInputs] = useState({ A: false, B: false });

    const gates = [
        { name: 'AND', func: (a: boolean, b: boolean) => a && b },
        { name: 'OR', func: (a: boolean, b: boolean) => a || b },
        { name: 'XOR', func: (a: boolean, b: boolean) => a !== b },
        { name: 'NAND', func: (a: boolean, b: boolean) => !(a && b) },
        { name: 'NOR', func: (a: boolean, b: boolean) => !(a || b) },
    ];

    return (
        <div className="flex flex-col h-full bg-gray-900 text-green-400 p-4 pt-16 font-mono">
            <header className="flex items-center mb-8 border-b border-green-500/30 pb-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-green-500/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                <h2 className="text-xl ml-4 flex items-center gap-2"><ZapIcon className="w-6 h-6"/> Logic Lab</h2>
            </header>

            <div className="flex justify-around mb-8 p-4 bg-black rounded-xl border border-green-500/30">
                <button onClick={() => setInputs(p => ({...p, A: !p.A}))} className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl font-bold transition-all ${inputs.A ? 'bg-green-500 text-black border-green-500 shadow-[0_0_20px_rgba(74,222,128,0.5)]' : 'border-green-500/50 text-green-500/50'}`}>A</button>
                <button onClick={() => setInputs(p => ({...p, B: !p.B}))} className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl font-bold transition-all ${inputs.B ? 'bg-green-500 text-black border-green-500 shadow-[0_0_20px_rgba(74,222,128,0.5)]' : 'border-green-500/50 text-green-500/50'}`}>B</button>
            </div>

            <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-4">
                {gates.map(gate => {
                    const output = gate.func(inputs.A, inputs.B);
                    return (
                        <div key={gate.name} className="bg-gray-800 p-4 rounded-xl flex items-center justify-between border border-gray-700">
                            <div className="font-bold text-xl">{gate.name}</div>
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col text-[10px] text-gray-500 gap-1">
                                    <div className="flex gap-1"><span>A:{inputs.A?1:0}</span><span>B:{inputs.B?1:0}</span></div>
                                </div>
                                <div className="h-0.5 w-8 bg-gray-600"></div>
                                <div className={`w-12 h-12 rounded flex items-center justify-center font-bold text-xl transition-all ${output ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(74,222,128,0.6)]' : 'bg-gray-700 text-gray-500'}`}>
                                    {output ? 1 : 0}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LogicGateSimulator;
