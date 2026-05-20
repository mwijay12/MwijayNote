
import React, { useState, useRef } from 'react';
import { ArrowLeftIcon, CameraIcon, RefreshCwIcon, CheckIcon, XIcon, SparklesIcon } from './Icons';
import { verifyObjectHunt } from '../services/geminiService';

interface KoreanHuntScreenProps {
    onBack: () => void;
}

// Renamed to generic Object Hunt in concept, but kept file/logic structure
const words = [
    { ko: 'Pomme', en: 'Apple', icon: '🍎' },
    { ko: 'Eau', en: 'Water', icon: '💧' },
    { ko: 'Ordinateur', en: 'Computer', icon: '💻' },
    { ko: 'Livre', en: 'Book', icon: '📚' },
    { ko: 'Stylo', en: 'Pen', icon: '🖊️' },
    { ko: 'Chaise', en: 'Chair', icon: '🪑' },
    { ko: 'Chaussures', en: 'Shoes', icon: '👟' },
    { ko: 'Tasse', en: 'Cup', icon: '☕' },
];

const KoreanHuntScreen: React.FC<KoreanHuntScreenProps> = ({ onBack }) => {
    const [target, setTarget] = useState(words[0]);
    const [image, setImage] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'analyzing' | 'success' | 'fail'>('idle');
    const videoRef = useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(s => { if (videoRef.current) videoRef.current.srcObject = s; })
            .catch(e => console.error("Camera denied", e));
        return () => { (videoRef.current?.srcObject as MediaStream)?.getTracks().forEach(t => t.stop()); };
    }, []);

    const capture = async () => {
        if (!videoRef.current) return;
        const cvs = document.createElement('canvas');
        cvs.width = videoRef.current.videoWidth;
        cvs.height = videoRef.current.videoHeight;
        cvs.getContext('2d')?.drawImage(videoRef.current, 0, 0);
        const data = cvs.toDataURL('image/jpeg');
        setImage(data);
        setStatus('analyzing');
        
        // Real AI Verification
        const isCorrect = await verifyObjectHunt(data, target.en);
        setStatus(isCorrect ? 'success' : 'fail');
    };

    const nextWord = () => {
        let next;
        do {
            next = words[Math.floor(Math.random() * words.length)];
        } while (next === target);
        setTarget(next);
        setImage(null);
        setStatus('idle');
    };

    return (
        <div className="flex flex-col h-full bg-black relative">
            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
            {image && <img src={image} className="absolute inset-0 w-full h-full object-cover z-10" alt="Captured" />}
            
            <div className="absolute top-0 left-0 right-0 p-4 pt-12 z-20 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
                <button onClick={onBack} className="p-2 rounded-full bg-black/40 text-white"><ArrowLeftIcon className="w-6 h-6"/></button>
                <div className="bg-card/90 backdrop-blur p-4 rounded-xl border border-white/10 text-center animate-pop-in">
                    <p className="text-xs text-dun uppercase tracking-widest">Find this object</p>
                    <h1 className="text-4xl font-bold text-accent mt-1 flex items-center justify-center gap-2">
                        {target.ko} <span className="text-2xl">{target.icon}</span>
                    </h1>
                    <p className="text-sm text-isabelline mt-1 font-medium">({target.en})</p>
                </div>
                <button onClick={nextWord} className="p-2 rounded-full bg-black/40 text-white"><RefreshCwIcon className="w-6 h-6"/></button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex justify-center items-center bg-gradient-to-t from-black/80 to-transparent min-h-[150px]">
                {status === 'idle' && (
                    <button onClick={capture} className="w-20 h-20 rounded-full border-4 border-white bg-white/20 active:scale-95 transition-transform"></button>
                )}
                {status === 'analyzing' && (
                    <div className="flex flex-col items-center gap-2">
                        <SparklesIcon className="w-10 h-10 text-accent animate-spin"/>
                        <div className="text-accent font-bold animate-pulse text-xl">AI Scanning...</div>
                    </div>
                )}
                {status === 'success' && (
                    <div className="flex flex-col items-center animate-pop-in">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-green-500/50"><CheckIcon className="w-8 h-8 text-white"/></div>
                        <p className="text-green-400 font-bold text-lg">Correct!</p>
                        <button onClick={nextWord} className="mt-4 px-6 py-2 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform">Next Word</button>
                    </div>
                )}
                {status === 'fail' && (
                    <div className="flex flex-col items-center animate-shake">
                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-red-500/50"><XIcon className="w-8 h-8 text-white"/></div>
                        <p className="text-red-400 font-bold text-lg">Not a {target.en}</p>
                        <button onClick={() => { setImage(null); setStatus('idle'); }} className="mt-4 px-6 py-2 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform">Retry</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KoreanHuntScreen;
