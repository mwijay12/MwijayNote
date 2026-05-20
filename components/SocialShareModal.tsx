
import React, { useRef, useState } from 'react';
import { XIcon, DownloadIcon } from './Icons';
import { SocialShareConfig } from '../types';

interface SocialShareModalProps {
    config: SocialShareConfig;
    onClose: () => void;
}

const gradients = [
    'from-rose-400 to-orange-300',
    'from-blue-400 to-indigo-500',
    'from-emerald-400 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-amber-200 to-yellow-500',
    'from-slate-800 to-slate-900'
];

const SocialShareModal: React.FC<SocialShareModalProps> = ({ config, onClose }) => {
    const [selectedGradient, setSelectedGradient] = useState(gradients[0]);
    const [isExporting, setIsExporting] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsExporting(true);
        try {
            const html2canvas = (window as any).html2canvas;
            if (!html2canvas) {
                alert("Image generation library failed to load.");
                return;
            }
            const canvas = await html2canvas(cardRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: null,
            });
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `mwijay-share-${Date.now()}.png`;
            link.click();
        } catch (e) {
            console.error("Share export failed", e);
        } finally {
            setIsExporting(false);
        }
    };

    const renderContent = () => {
        if (config.type === 'code') {
            return (
                <div className="w-full bg-[#1e1e1e] rounded-xl p-4 text-left shadow-lg border border-white/10 relative overflow-hidden">
                    <div className="flex gap-1.5 mb-3">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <pre className="font-mono text-xs text-blue-300 overflow-hidden whitespace-pre-wrap break-words leading-relaxed">
                        <code>{config.text}</code>
                    </pre>
                    <div className="absolute top-3 right-4 text-[10px] text-white/30 font-mono uppercase">{config.language || 'CODE'}</div>
                </div>
            );
        }
        
        return (
            <div className="relative z-10">
                <span className="text-6xl font-serif opacity-30 mb-4 block">"</span>
                <p className={`font-serif text-white drop-shadow-sm ${config.text.length > 100 ? 'text-lg' : 'text-2xl'} leading-relaxed`}>
                    {config.text}
                </p>
                {config.authorOrTitle && (
                    <div className="mt-6">
                        <div className="w-10 h-0.5 bg-white/50 mx-auto mb-3 rounded-full"></div>
                        <p className="text-xs font-bold uppercase tracking-widest text-white/90">{config.authorOrTitle}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-md flex flex-col items-center gap-6" onClick={e => e.stopPropagation()}>
                <div 
                    ref={cardRef}
                    className={`aspect-[4/5] w-full max-w-[320px] rounded-3xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden shadow-2xl bg-gradient-to-br ${selectedGradient}`}
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise.png')] opacity-10 pointer-events-none"></div>
                    
                    {renderContent()}

                    <div className="absolute bottom-6 text-[10px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
                        <span>Mwijay Note</span>
                        {config.type === 'code' && <span className="px-1.5 py-0.5 bg-white/20 rounded text-[8px]">Koding Street</span>}
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto w-full justify-center py-2 no-scrollbar">
                    {gradients.map(grad => (
                        <button 
                            key={grad}
                            onClick={() => setSelectedGradient(grad)}
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${grad} border-2 ${selectedGradient === grad ? 'border-white scale-110' : 'border-transparent opacity-70'} transition-all`}
                        />
                    ))}
                </div>

                <div className="flex gap-4 w-full max-w-[320px]">
                    <button onClick={onClose} className="flex-1 py-3 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleDownload} disabled={isExporting} className="flex-1 py-3 rounded-full bg-white text-black font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                        {isExporting ? 'Saving...' : <><DownloadIcon className="w-5 h-5"/> Save Image</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SocialShareModal;
