
import React, { useState } from 'react';
import { ArrowLeftIcon, PlayIcon, TrashIcon, TerminalIcon } from './Icons';

const CodeRunnerScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [code, setCode] = useState(`// Write JavaScript here\nconsole.log("Hello World");\n\nconst sum = (a, b) => a + b;\nconsole.log(sum(5, 10));`);
    const [logs, setLogs] = useState<string[]>([]);

    const runCode = () => {
        setLogs([]);
        const originalLog = console.log;
        const tempLogs: string[] = [];
        
        console.log = (...args) => {
            tempLogs.push(args.map(a => String(a)).join(' '));
        };

        try {
            // eslint-disable-next-line no-eval
            eval(code);
        } catch (e: any) {
            tempLogs.push(`Error: ${e.message}`);
        }

        console.log = originalLog;
        setLogs(tempLogs);
    };

    return (
        <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-[#1e1e1e] font-mono">
            <header className="flex items-center justify-between mb-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2 text-white"><ArrowLeftIcon className="w-6 h-6"/></button>
                <h2 className="text-lg text-green-400 font-bold flex gap-2"><TerminalIcon className="w-5 h-5"/> JS Sandbox</h2>
                <button onClick={runCode} className="bg-green-600 text-black px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-500 flex items-center gap-1">
                    <PlayIcon className="w-3 h-3"/> RUN
                </button>
            </header>

            <div className="flex-grow flex flex-col gap-4">
                <textarea 
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="flex-grow bg-[#252526] text-gray-300 p-4 rounded-xl resize-none outline-none text-sm border border-white/10 focus:border-green-500/50"
                    spellCheck={false}
                />
                <div className="h-40 bg-black rounded-xl border border-white/10 p-4 overflow-y-auto">
                    <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-1">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Console Output</span>
                        <button onClick={() => setLogs([])} className="text-gray-500 hover:text-white"><TrashIcon className="w-3 h-3"/></button>
                    </div>
                    {logs.map((log, i) => (
                        <div key={i} className={`text-xs ${log.startsWith('Error') ? 'text-red-400' : 'text-green-300'} font-mono mb-1`}>
                            {'> ' + log}
                        </div>
                    ))}
                    {logs.length === 0 && <span className="text-xs text-gray-600 italic">// Waiting for output...</span>}
                </div>
            </div>
        </div>
    );
};

export default CodeRunnerScreen;
