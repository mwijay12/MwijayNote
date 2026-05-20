
import React, { useState, useRef } from 'react';
import { ArrowLeftIcon, CardsIcon, DownloadIcon, PaletteIcon, UploadIcon, FileImageIcon, SparklesIcon } from './Icons';
import html2canvas from 'html2canvas';
import { UserData } from '../types';
import { saveFile, dataURLToBlob } from '../utils/exportUtils';
import { generateImage } from '../services/geminiService';

const BusinessCardScreen: React.FC<{ onBack: () => void, userData: UserData | null }> = ({ onBack, userData }) => {
    const [name, setName] = useState(userData?.name || '');
    const [role, setRole] = useState('BBIT Student');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState(userData?.email || '');
    const [style, setStyle] = useState<'Modern' | 'Classic' | 'Minimal'>('Modern');
    const [logo, setLogo] = useState<string | null>(userData?.customLogo || null);
    const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const downloadCard = async () => {
        if (!cardRef.current) return;
        
        // Clone the card to body to avoid scroll-container rendering issues
        const clone = cardRef.current.cloneNode(true) as HTMLElement;
        clone.style.position = 'fixed';
        clone.style.top = '-9999px';
        clone.style.left = '-9999px';
        clone.style.width = `${cardRef.current.offsetWidth}px`;
        clone.style.zIndex = '9999';
        document.body.appendChild(clone);
        
        try {
            const canvas = await html2canvas(clone, { 
                scale: 3, 
                useCORS: true, 
                backgroundColor: null,
                logging: false,
                allowTaint: true,
            });
            const dataUrl = canvas.toDataURL('image/png');
            const blob = dataURLToBlob(dataUrl);
            saveFile(blob, `BusinessCard-${(name || 'Card').replace(/\s+/g, '_')}.png`);
        } catch(e) {
            console.error('Card generation failed', e);
            alert('Failed to download card. Please try again.');
        } finally {
            document.body.removeChild(clone);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => setLogo(ev.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const generateLogo = async () => {
        if (!name) return;
        setIsGeneratingLogo(true);
        try {
            const prompt = `A professional minimalist vector logo icon for a ${role} named ${name}. High contrast, geometric, elegant, suitable for a business card. Professional white background, clean lines.`;
            const result = await generateImage(prompt);
            if (typeof result === 'string') setLogo(result);
            else alert("Couldn't generate logo. Check your API key.");
        } catch(e) {
            console.error(e);
        } finally {
            setIsGeneratingLogo(false);
        }
    };

    const renderCard = () => {
        switch (style) {
            case 'Classic':
                return (
                    <div ref={cardRef} className="w-full max-w-sm aspect-[1.75/1] bg-[#f8f5f2] text-[#2c2c2c] rounded-xl shadow-2xl p-8 relative overflow-hidden flex flex-col justify-center items-center text-center border-4 border-double border-[#d4af37]">
                        {/* Texture overlay */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none"></div>
                        
                        <div className="mb-4 relative z-10">
                            {logo ? (
                                <img src={logo} className="w-16 h-16 object-contain drop-shadow-md"/>
                            ) : (
                                <div className="w-16 h-16 border-2 border-[#d4af37] flex items-center justify-center rounded-full bg-white/50">
                                    <span className="font-serif text-3xl font-bold text-[#d4af37]">{name.charAt(0)}</span>
                                </div>
                            )}
                        </div>
                        
                        <h3 className="text-2xl font-serif font-bold tracking-widest uppercase text-[#1a1a1a] relative z-10 drop-shadow-sm">{name || 'YOUR NAME'}</h3>
                        <p className="text-xs font-medium tracking-[0.2em] mt-2 mb-4 text-[#d4af37] relative z-10 uppercase">{role || 'TITLE'}</p>
                        
                        <div className="w-24 border-t border-[#2c2c2c]/20 my-2 relative z-10"></div>
                        
                        <div className="text-[10px] space-y-1 font-serif text-[#4a4a4a] relative z-10">
                            {phone && <p>{phone}</p>}
                            {email && <p>{email}</p>}
                        </div>
                    </div>
                );
            case 'Minimal':
                return (
                    <div ref={cardRef} className="w-full max-w-sm aspect-[1.75/1] bg-white text-gray-800 rounded-xl shadow-2xl p-8 relative overflow-hidden flex flex-col justify-between border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-bold tracking-tighter text-gray-900 leading-none">{name || 'Your Name'}</h3>
                                <p className="text-sm text-gray-500 font-medium tracking-tight uppercase">{role || 'Job Title'}</p>
                            </div>
                            {logo && <img src={logo} className="w-12 h-12 object-contain grayscale opacity-80"/>}
                        </div>
                        
                        <div className="space-y-3">
                            <div className="w-8 h-1 bg-black"></div>
                            <div className="text-xs text-gray-600 font-mono tracking-wide">
                                {phone && <p>{phone}</p>}
                                {email && <p>{email}</p>}
                            </div>
                        </div>
                    </div>
                );
            default: // Modern
                return (
                    <div ref={cardRef} className="w-full max-w-sm aspect-[1.75/1] bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-xl shadow-2xl p-6 relative overflow-hidden border border-white/10 flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-serif font-bold text-accent tracking-wide">{name || 'Your Name'}</h3>
                                <p className="text-sm text-white/80 font-medium uppercase tracking-wider mt-1">{role || 'Title'}</p>
                            </div>
                            {logo && <img src={logo} className="w-12 h-12 object-contain bg-white/10 rounded p-1"/>}
                        </div>
                        <div className="text-xs text-dun space-y-1 z-10 font-sans">
                            {phone && <p>📞 {phone}</p>}
                            {email && <p>✉️ {email}</p>}
                            <p className="opacity-50 mt-2 text-[10px] uppercase tracking-widest">Mwijay Note Digital ID</p>
                        </div>
                        <div className="absolute bottom-4 right-4 w-12 h-12 bg-white p-1 rounded-lg flex items-center justify-center shadow-lg">
                            <div className="w-full h-full bg-black pattern-grid-lg opacity-80"></div> 
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col h-full bg-jet p-4 pt-16 animate-fade-in overflow-y-auto">
            <header className="flex items-center mb-8">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                <h2 className="text-xl font-serif ml-4 flex items-center gap-2"><CardsIcon className="w-5 h-5 text-accent"/> Business Card</h2>
            </header>

            <div className="flex flex-col gap-4 mb-8">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="bg-card p-3 rounded-xl text-sm border border-white/10 outline-none focus:border-accent"/>
                <input value={role} onChange={e => setRole(e.target.value)} placeholder="Job Title" className="bg-card p-3 rounded-xl text-sm border border-white/10 outline-none focus:border-accent"/>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" className="bg-card p-3 rounded-xl text-sm border border-white/10 outline-none focus:border-accent"/>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="bg-card p-3 rounded-xl text-sm border border-white/10 outline-none focus:border-accent"/>
                
                <div className="flex gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-card p-3 rounded-xl text-sm border border-white/10 hover:border-accent flex items-center justify-center gap-2 text-dun hover:text-white transition-colors">
                        <UploadIcon className="w-4 h-4"/> {logo ? 'Change Logo' : 'Upload Logo'}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*"/>
                    
                    <button 
                        onClick={generateLogo} 
                        disabled={isGeneratingLogo || !name}
                        className="flex-1 bg-accent/10 border border-accent/30 p-3 rounded-xl text-sm flex items-center justify-center gap-2 text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
                    >
                        {isGeneratingLogo ? <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"/> : <SparklesIcon className="w-4 h-4"/>}
                        AI Logo
                    </button>
                </div>
            </div>

            <div className="flex justify-center gap-2 mb-4">
                {(['Modern', 'Classic', 'Minimal'] as const).map(s => (
                    <button 
                        key={s} 
                        onClick={() => setStyle(s)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${style === s ? 'bg-accent text-cafe' : 'bg-card text-dun'}`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="flex justify-center mb-8">
                {renderCard()}
            </div>

            <button onClick={downloadCard} className="w-full bg-accent text-cafe font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 shadow-lg">
                <DownloadIcon className="w-5 h-5"/> Download Card
            </button>
        </div>
    );
};

export default BusinessCardScreen;
