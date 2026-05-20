
import React, { useState } from 'react';
import { ArrowLeftIcon, CodeIcon, PlayIcon, InfoIcon, XIcon } from './Icons';

const SmartContractSandbox: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [code, setCode] = useState(`pragma solidity ^0.8.0;\n\ncontract HelloWorld {\n    string public greet = "Hello World!";\n}`);
    const [output, setOutput] = useState('');
    const [showInfo, setShowInfo] = useState(false);

    const deploy = () => {
        setOutput("Compiling...\nDeploying to mock VM...\nAddress: 0x71C...9A\nGas Used: 124532");
    };

    return (
        <div className="flex flex-col h-full bg-[#0d1117] text-gray-300 p-4 pt-16 font-mono relative">
            {showInfo && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowInfo(false)}>
                    <div className="bg-[#161b22] border border-gray-700 p-6 rounded-xl max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-blue-400 font-bold">Smart Contracts 101</h3>
                            <button onClick={() => setShowInfo(false)}><XIcon className="w-5 h-5"/></button>
                        </div>
                        <p className="text-sm leading-relaxed mb-4">
                            Smart contracts are self-executing programs on a blockchain (like Ethereum). They automatically enforce agreements without intermediaries.
                        </p>
                        <p className="text-sm leading-relaxed text-gray-400 mb-2">
                            <strong>BBIT Context:</strong>
                            <ul className="list-disc pl-4 mt-1 space-y-1">
                                <li>Supply Chain: Automated payments on delivery.</li>
                                <li>Finance (DeFi): Lending without banks.</li>
                                <li>Records: Immutable degree verification.</li>
                            </ul>
                        </p>
                        <p className="text-xs text-gray-500">Language: Solidity</p>
                    </div>
                </div>
            )}

            <header className="flex items-center mb-4 border-b border-gray-700 pb-4 justify-between">
                <div className="flex items-center">
                    <button onClick={onBack}><ArrowLeftIcon className="w-6 h-6"/></button>
                    <h2 className="ml-4 text-blue-400 font-bold">Solidity Sandbox</h2>
                </div>
                <button onClick={() => setShowInfo(true)} className="text-gray-500 hover:text-white"><InfoIcon className="w-5 h-5"/></button>
            </header>
            <textarea 
                className="flex-grow bg-[#161b22] p-4 rounded border border-gray-700 focus:outline-none resize-none text-sm"
                value={code}
                onChange={e => setCode(e.target.value)}
            />
            <div className="h-32 mt-4 bg-black p-4 rounded border border-gray-800 text-xs text-green-400 overflow-y-auto whitespace-pre-wrap">
                {output || "// Console Output"}
            </div>
            <button onClick={deploy} className="mt-4 w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-500 flex items-center justify-center gap-2">
                <PlayIcon className="w-4 h-4"/> Deploy & Run
            </button>
        </div>
    );
};
export default SmartContractSandbox;
