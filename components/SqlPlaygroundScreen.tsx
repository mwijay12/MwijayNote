
import React, { useState } from 'react';
import { ArrowLeftIcon, LayoutIcon, PlayIcon, TrashIcon } from './Icons';
import { executeSql } from '../services/geminiService';

interface SqlPlaygroundScreenProps {
    onBack: () => void;
}

const SqlPlaygroundScreen: React.FC<SqlPlaygroundScreenProps> = ({ onBack }) => {
    const [query, setQuery] = useState('SELECT * FROM users WHERE active = 1;');
    const [result, setResult] = useState<{ columns: string[], rows: any[], error?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleRun = async () => {
        setIsLoading(true);
        setResult(null);
        const res = await executeSql(query);
        setResult(res);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-[#0d1117] text-gray-300 font-mono">
            <header className="flex items-center mb-6 border-b border-gray-700 pb-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                <h2 className="text-xl ml-4 flex items-center gap-2 text-blue-400"><LayoutIcon className="w-6 h-6"/> SQL Playground</h2>
            </header>

            <div className="flex flex-col gap-4 h-full">
                <div className="bg-[#161b22] rounded-xl border border-gray-700 p-4 relative">
                    <textarea 
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full bg-transparent text-sm text-green-400 focus:outline-none resize-none h-32"
                        spellCheck={false}
                    />
                    <button 
                        onClick={handleRun}
                        disabled={isLoading}
                        className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-500"
                    >
                        {isLoading ? 'Running...' : <><PlayIcon className="w-3 h-3"/> Run Query</>}
                    </button>
                </div>

                <div className="flex-grow bg-black rounded-xl border border-gray-800 overflow-hidden flex flex-col">
                    <div className="bg-gray-900 px-4 py-2 text-xs font-bold text-gray-500 border-b border-gray-800 flex justify-between">
                        <span>RESULTS</span>
                        {result && <button onClick={() => setResult(null)}><TrashIcon className="w-3 h-3"/></button>}
                    </div>
                    
                    <div className="flex-grow overflow-auto p-4">
                        {result?.error ? (
                            <p className="text-red-400 text-sm">{result.error}</p>
                        ) : result ? (
                            <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                    <tr>
                                        {result.columns.map((col, i) => (
                                            <th key={i} className="p-2 border-b border-gray-700 text-blue-400">{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.rows.map((row, i) => (
                                        <tr key={i} className="hover:bg-white/5">
                                            {row.map((cell: any, j: number) => (
                                                <td key={j} className="p-2 border-b border-gray-800">{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-600 text-sm text-center mt-10">// Result set will appear here</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SqlPlaygroundScreen;
