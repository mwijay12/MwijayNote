
import React, { useState } from 'react';
import { ArrowLeftIcon, GlobeIcon, PlayIcon } from './Icons';

const ApiClientScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
    const [method, setMethod] = useState('GET');
    const [response, setResponse] = useState('');
    const [status, setStatus] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const sendRequest = async () => {
        setIsLoading(true);
        setResponse('');
        setStatus(null);
        try {
            const res = await fetch(url, { method });
            setStatus(res.status);
            const data = await res.json();
            setResponse(JSON.stringify(data, null, 2));
        } catch (e: any) {
            setResponse(`Error: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0d1117] text-gray-300 p-4 pt-16 animate-fade-in font-mono">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2 text-white"><ArrowLeftIcon className="w-6 h-6" /></button>
                <h2 className="text-xl ml-4 font-bold text-blue-400 flex items-center gap-2"><GlobeIcon className="w-5 h-5"/> API Client</h2>
            </header>

            <div className="flex gap-2 mb-4">
                <select value={method} onChange={e => setMethod(e.target.value)} className="bg-[#161b22] border border-gray-700 rounded-lg px-3 font-bold text-green-400">
                    <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
                </select>
                <input value={url} onChange={e => setUrl(e.target.value)} className="flex-grow bg-[#161b22] border border-gray-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none" />
                <button onClick={sendRequest} disabled={isLoading} className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-500">
                    {isLoading ? '...' : <PlayIcon className="w-4 h-4"/>}
                </button>
            </div>

            <div className="flex-grow bg-[#000] border border-gray-800 rounded-xl p-4 overflow-auto relative">
                {status && (
                    <span className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded ${status >= 200 && status < 300 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {status}
                    </span>
                )}
                <pre className="text-xs text-green-300 whitespace-pre-wrap">{response || '// Response will appear here...'}</pre>
            </div>
        </div>
    );
};

export default ApiClientScreen;
