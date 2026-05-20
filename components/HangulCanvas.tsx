
import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeftIcon, RefreshCwIcon, CheckIcon, SparklesIcon } from './Icons';
import { verifyObjectHunt } from '../services/geminiService'; // Reusing image verification logic for now or generic AI

interface HangulCanvasProps {
    onBack: () => void;
}

const HangulCanvas: React.FC<HangulCanvasProps> = ({ onBack }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [targetChar, setTargetChar] = useState('');

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
        ctx.strokeStyle = '#000'; // Ink color

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
        setFeedback(null);
    };

    const check = async () => {
        if (!canvasRef.current) return;
        setFeedback("Analyzing...");
        // Mocking AI check for now as we need a specific service
        setTimeout(() => setFeedback("Good attempt! Keep practicing."), 1500);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if(canvas) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#fdfbf7] p-4 pt-16 text-black">
            <header className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-black/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                <h2 className="text-xl font-serif">Writing Practice</h2>
                <button onClick={clear} className="p-2 hover:bg-black/10 rounded-full"><RefreshCwIcon className="w-5 h-5"/></button>
            </header>

            <div className="flex-grow flex flex-col items-center gap-4">
                <div className="text-sm text-gray-500">Practice writing characters or notes</div>
                <canvas 
                    ref={canvasRef}
                    className="w-full aspect-square bg-white rounded-2xl shadow-inner border-2 border-gray-200 touch-none"
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                />
                
                {feedback && <div className="bg-white/80 p-3 rounded-xl font-bold text-green-600 animate-pop-in flex items-center gap-2"><SparklesIcon className="w-4 h-4"/> {feedback}</div>}

                <div className="flex gap-4 w-full">
                    <button onClick={clear} className="flex-1 py-3 rounded-xl bg-gray-200 font-bold hover:bg-gray-300">Clear</button>
                    <button onClick={check} className="flex-1 py-3 rounded-xl bg-accent-500 text-white font-bold hover:opacity-90">Check</button>
                </div>
            </div>
        </div>
    );
};

export default HangulCanvas;
