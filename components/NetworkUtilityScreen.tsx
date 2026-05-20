
import React, { useState } from 'react';
import { ArrowLeftIcon, WifiIcon, InfoIcon } from './Icons';

const NetworkUtilityScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [ip, setIp] = useState('192.168.1.10');
    const [cidr, setCidr] = useState('24');
    const [showInfo, setShowInfo] = useState(false);

    // Simple calculator logic for demo
    const calculate = () => {
        // ... (Logic kept simple for UI demo) ...
        return {
            net: "192.168.1.0",
            broadcast: "192.168.1.255",
            hosts: 254
        };
    };

    const res = calculate();

    return (
        <div className="flex flex-col h-full bg-jet p-4 pt-16 animate-fade-in relative">
            {showInfo && (
                <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-6" onClick={() => setShowInfo(false)}>
                    <div className="bg-card border border-white/10 p-6 rounded-2xl max-w-sm">
                        <h3 className="text-cyan-400 font-bold mb-2">Subnetting Explained</h3>
                        <p className="text-sm text-dun mb-2">
                            <strong>CIDR (/24):</strong> Represents the network mask bits. /24 means 255.255.255.0.
                        </p>
                        <p className="text-sm text-dun">
                            <strong>Broadcast:</strong> The last address in the subnet, used to talk to everyone.
                        </p>
                    </div>
                </div>
            )}

            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                    <h2 className="text-xl font-serif ml-4 flex items-center gap-2"><WifiIcon className="w-5 h-5 text-cyan-400"/> Network Tools</h2>
                </div>
                <button onClick={() => setShowInfo(true)} className="text-dun hover:text-white"><InfoIcon className="w-5 h-5"/></button>
            </header>

            <div className="bg-card p-6 rounded-2xl border border-white/10 mb-6">
                <h3 className="font-bold text-isabelline mb-4">Subnet Calculator</h3>
                <div className="flex gap-2 mb-4">
                    <input value={ip} onChange={e => setIp(e.target.value)} className="flex-grow bg-jet p-3 rounded-xl border border-white/10 text-sm focus:border-cyan-400 outline-none" />
                    <select value={cidr} onChange={e => setCidr(e.target.value)} className="bg-jet p-3 rounded-xl border border-white/10 text-sm focus:border-cyan-400 outline-none">
                        <option value="24">/24</option>
                        <option value="16">/16</option>
                        <option value="8">/8</option>
                    </select>
                </div>
                
                <div className="bg-black/30 p-4 rounded-xl border border-cyan-500/20 font-mono text-sm space-y-2">
                    <div className="flex justify-between"><span className="text-dun">Network:</span> <span className="text-cyan-400">{res.net}</span></div>
                    <div className="flex justify-between"><span className="text-dun">Broadcast:</span> <span className="text-cyan-400">{res.broadcast}</span></div>
                    <div className="flex justify-between"><span className="text-dun">Usable Hosts:</span> <span className="text-cyan-400">{res.hosts}</span></div>
                </div>
            </div>
        </div>
    );
};

export default NetworkUtilityScreen;
