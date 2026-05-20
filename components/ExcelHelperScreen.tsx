
import React, { useState } from 'react';
import { ArrowLeftIcon, SparklesIcon, ShareIcon, RefreshCwIcon, DownloadIcon, TrashIcon } from './Icons';
import { callGemini } from '../services/geminiService';
import { saveFile } from '../utils/exportUtils';

const ExcelHelperScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [mode, setMode] = useState<'formula' | 'cleaner'>('formula');
    const [prompt, setPrompt] = useState('');
    const [formulaResult, setFormulaResult] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Cleaner State
    const [csvInput, setCsvInput] = useState('');
    const [cleanedData, setCleanedData] = useState<string[][]>([]);

    // Formula Logic
    const generateFormula = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        try {
            const systemPrompt = `You are an Excel Expert. Convert this request into a valid Excel/Google Sheets formula. Return ONLY the formula code, no explanation. Request: ${prompt}`;
            
            const result = await callGemini(systemPrompt);
            
            setFormulaResult(result.trim());
        } catch (e) {
            setFormulaResult("Error generating formula.");
        } finally {
            setIsGenerating(false);
        }
    };

    // CSV Logic
    const parseCsv = () => {
        const rows = csvInput.trim().split('\n').map(row => row.split(','));
        setCleanedData(rows);
    };

    const removeDuplicates = () => {
        const unique = cleanedData.filter((row, index, self) => 
            index === self.findIndex((t) => (
                t.join(',') === row.join(',')
            ))
        );
        setCleanedData(unique);
    };

    const trimWhitespace = () => {
        const trimmed = cleanedData.map(row => row.map(cell => cell.trim()));
        setCleanedData(trimmed);
    };

    const capitalizeHeaders = () => {
        if (cleanedData.length === 0) return;
        const headers = cleanedData[0].map(h => h.toUpperCase());
        setCleanedData([headers, ...cleanedData.slice(1)]);
    };

    const downloadCsv = () => {
        const content = cleanedData.map(row => row.join(',')).join('\n');
        const blob = new Blob([content], { type: 'text/csv' });
        saveFile(blob, 'cleaned_data.csv');
    };

    return (
        <div className="flex flex-col h-full bg-bg-primary p-4 pt-16 animate-fade-in">
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6"/></button>
                    <h2 className="text-xl font-serif ml-4 text-green-400">Excel & Data Wizard</h2>
                </div>
            </header>

            <div className="flex gap-2 mb-6 p-1 bg-card rounded-full">
                <button onClick={() => setMode('formula')} className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${mode==='formula'?'bg-green-600 text-white':'text-dun'}`}>Formula AI</button>
                <button onClick={() => setMode('cleaner')} className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${mode==='cleaner'?'bg-blue-600 text-white':'text-dun'}`}>Data Cleaner</button>
            </div>

            {mode === 'formula' ? (
                <div className="flex-grow flex flex-col gap-6">
                    <div className="bg-card p-6 rounded-3xl border border-white/10">
                        <label className="text-sm font-bold text-dun uppercase mb-2 block">Describe what you want</label>
                        <textarea 
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="e.g. Sum column A if column B says 'Pending' and column C is greater than 500."
                            className="w-full bg-bg-primary p-4 rounded-xl text-isabelline h-32 resize-none outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button onClick={generateFormula} disabled={isGenerating} className="w-full mt-4 py-3 bg-green-600 text-white rounded-xl font-bold flex justify-center gap-2 hover:bg-green-500">
                            {isGenerating ? 'Thinking...' : <><SparklesIcon className="w-5 h-5"/> Generate Formula</>}
                        </button>
                    </div>

                    {formulaResult && (
                        <div className="bg-[#1e1e1e] p-6 rounded-3xl border border-green-500/30 shadow-lg animate-slide-in-from-bottom">
                            <h3 className="text-xs font-bold text-green-400 uppercase mb-2">Result</h3>
                            <div className="flex gap-3 items-center">
                                <code className="flex-grow font-mono text-lg text-white bg-black/30 p-3 rounded-lg overflow-x-auto">{formulaResult}</code>
                                <button onClick={() => navigator.clipboard.writeText(formulaResult)} className="p-3 bg-white/10 rounded-lg hover:bg-white/20"><ShareIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-grow flex flex-col gap-4 overflow-hidden">
                    {cleanedData.length === 0 ? (
                        <textarea 
                            value={csvInput}
                            onChange={e => setCsvInput(e.target.value)}
                            placeholder="Paste CSV data here..."
                            className="flex-grow bg-card p-4 rounded-xl text-xs font-mono text-isabelline resize-none outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ) : (
                        <div className="flex-grow overflow-auto bg-card rounded-xl border border-white/10">
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr>{cleanedData[0]?.map((h, i) => <th key={i} className="p-2 border-b border-white/10 bg-white/5 font-bold text-isabelline">{h}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {cleanedData.slice(1).map((row, i) => (
                                        <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                            {row.map((c, j) => <td key={j} className="p-2 text-dun truncate max-w-[100px]">{c}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {cleanedData.length === 0 ? (
                            <button onClick={parseCsv} disabled={!csvInput.trim()} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">Load Data</button>
                        ) : (
                            <>
                                <button onClick={removeDuplicates} className="px-4 py-2 bg-bg-primary border border-white/10 rounded-lg text-xs font-bold text-dun hover:text-white whitespace-nowrap">Remove Dupes</button>
                                <button onClick={trimWhitespace} className="px-4 py-2 bg-bg-primary border border-white/10 rounded-lg text-xs font-bold text-dun hover:text-white whitespace-nowrap">Trim Spaces</button>
                                <button onClick={capitalizeHeaders} className="px-4 py-2 bg-bg-primary border border-white/10 rounded-lg text-xs font-bold text-dun hover:text-white whitespace-nowrap">Fix Headers</button>
                                <button onClick={downloadCsv} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1"><DownloadIcon className="w-3 h-3"/> CSV</button>
                                <button onClick={() => { setCleanedData([]); setCsvInput(''); }} className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg"><TrashIcon className="w-4 h-4"/></button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExcelHelperScreen;
