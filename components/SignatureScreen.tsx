
import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeftIcon, RefreshCwIcon, CheckIcon, FeatherIcon, DownloadIcon } from './Icons';
import { saveFile, dataURLToBlob } from '../utils/exportUtils';

interface SignatureScreenProps {
    onBack: () => void;
}

const SignatureScreen: React.FC<SignatureScreenProps> = ({ onBack }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if(canvas) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            // Load existing
            const savedSig = localStorage.getItem('mwijay_signature');
            if (savedSig) {
                const img = new Image();
                img.src = savedSig;
                img.onload = () => canvas.getContext('2d')?.drawImage(img, 0, 0);
            }
        }
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if(canvas) canvas.getContext('2d')?.beginPath();
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000'; // Always black for signature

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        localStorage.removeItem('mwijay_signature');
        setSaved(false);
    };

    const save = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const data = canvas.toDataURL('image/png');
        localStorage.setItem('mwijay_signature', data);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const download = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const data = canvas.toDataURL('image/png');
        const blob = dataURLToBlob(data);
        saveFile(blob, `MySignature.png`);
    };

    return (
        <div className="flex flex-col h-full bg-[#fdfbf7] p-4 pt-16 text-black">
            <header className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-black/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                <h2 className="text-xl font-serif flex items-center gap-2"><FeatherIcon className="w-6 h-6"/> Digital Signature</h2>
                <button onClick={clear} className="p-2 hover:bg-black/10 rounded-full"><RefreshCwIcon className="w-5 h-5"/></button>
            </header>

            <div className="flex-grow flex flex-col items-center gap-4">
                <div className="text-sm text-gray-500 text-center">Draw your official signature below for documents.</div>
                <div className="w-full aspect-video bg-white rounded-2xl shadow-lg border-2 border-gray-200 relative overflow-hidden">
                    <div className="absolute bottom-10 left-10 right-10 h-px bg-gray-300 pointer-events-none"></div>
                    <canvas 
                        ref={canvasRef}
                        className="w-full h-full touch-none cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseUp={stopDrawing}
                        onMouseMove={draw}
                        onTouchStart={startDrawing}
                        onTouchEnd={stopDrawing}
                        onTouchMove={draw}
                    />
                </div>
                
                <div className="flex gap-4 w-full mt-4">
                    <button onClick={save} className={`flex-1 py-3 rounded-xl font-bold transition-all text-white flex justify-center items-center gap-2 ${saved ? 'bg-green-500' : 'bg-accent-500 hover:bg-accent-600'}`}>
                        {saved ? <CheckIcon className="w-5 h-5"/> : 'Save Locally'}
                    </button>
                    <button onClick={download} className="flex-1 py-3 rounded-xl bg-gray-200 font-bold hover:bg-gray-300 text-gray-700 flex justify-center items-center gap-2">
                        <DownloadIcon className="w-5 h-5"/> Download PNG
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignatureScreen;
    
