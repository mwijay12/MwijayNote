
import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeftIcon, TrashIcon, ShareIcon, ShapesIcon, SparklesIcon, MonitorIcon } from './Icons';
import { analyzeSystemDiagram } from '../services/geminiService';

const SystemWhiteboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<'pen' | 'rect' | 'circle' | 'diamond' | 'cylinder'>('pen');
    const [color, setColor] = useState('#ffffff');
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        const c = canvasRef.current;
        if(c) { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    }, []);

    const start = (e: any) => {
        const x = (e.clientX || e.touches[0].clientX) - e.target.getBoundingClientRect().left;
        const y = (e.clientY || e.touches[0].clientY) - e.target.getBoundingClientRect().top;
        setStartPos({ x, y });
        setIsDrawing(true);
        if (tool === 'pen') {
            const ctx = canvasRef.current?.getContext('2d');
            if(ctx) {
                ctx.beginPath();
                ctx.moveTo(x, y);
            }
        }
    };

    const draw = (e: any) => {
        if (!isDrawing || !canvasRef.current) return;
        const x = (e.clientX || e.touches[0].clientX) - e.target.getBoundingClientRect().left;
        const y = (e.clientY || e.touches[0].clientY) - e.target.getBoundingClientRect().top;
        
        const ctx = canvasRef.current.getContext('2d');
        if(!ctx) return;

        if (tool === 'pen') {
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = color;
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const end = (e: any) => {
        if (!isDrawing || !canvasRef.current) return;
        const x = (e.clientX || e.changedTouches?.[0].clientX) - e.target.getBoundingClientRect().left;
        const y = (e.clientY || e.changedTouches?.[0].clientY) - e.target.getBoundingClientRect().top;
        
        const ctx = canvasRef.current.getContext('2d');
        if(!ctx) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        const w = x - startPos.x;
        const h = y - startPos.y;

        if (tool === 'rect') {
            ctx.strokeRect(startPos.x, startPos.y, w, h);
        } else if (tool === 'circle') {
            const radius = Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));
            ctx.beginPath();
            ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (tool === 'diamond') {
            ctx.beginPath();
            ctx.moveTo(startPos.x + w/2, startPos.y);
            ctx.lineTo(startPos.x + w, startPos.y + h/2);
            ctx.lineTo(startPos.x + w/2, startPos.y + h);
            ctx.lineTo(startPos.x, startPos.y + h/2);
            ctx.closePath();
            ctx.stroke();
        } else if (tool === 'cylinder') {
            const ovalH = h * 0.2;
            ctx.beginPath();
            ctx.ellipse(startPos.x + w/2, startPos.y + ovalH/2, w/2, ovalH/2, 0, 0, 2 * Math.PI);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.ellipse(startPos.x + w/2, startPos.y + h - ovalH/2, w/2, ovalH/2, 0, 0, Math.PI);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(startPos.x, startPos.y + ovalH/2);
            ctx.lineTo(startPos.x, startPos.y + h - ovalH/2);
            ctx.moveTo(startPos.x + w, startPos.y + ovalH/2);
            ctx.lineTo(startPos.x + w, startPos.y + h - ovalH/2);
            ctx.stroke();
        }

        setIsDrawing(false);
        ctx.beginPath();
    };

    const handleAnalyze = async () => {
        if (!canvasRef.current) return;
        setIsAnalyzing(true);
        const image = canvasRef.current.toDataURL('image/png');
        const result = await analyzeSystemDiagram(image);
        setAnalysis(result);
        setIsAnalyzing(false);
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] text-white p-4 pt-16">
            <header className="flex justify-between items-center mb-4">
                <button onClick={onBack}><ArrowLeftIcon className="w-6 h-6"/></button>
                <h2 className="text-lg font-bold flex gap-2"><ShapesIcon className="w-6 h-6 text-accent"/> System Design</h2>
                <button onClick={() => canvasRef.current?.getContext('2d')?.clearRect(0,0,1000,1000)}><TrashIcon className="w-6 h-6 text-red-400"/></button>
            </header>
            
            <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar">
                <button onClick={() => setTool('pen')} className={`px-3 py-1 rounded-full text-xs font-bold border ${tool==='pen'?'bg-white text-black':'border-white/20'}`}>Pen</button>
                <button onClick={() => setTool('rect')} className={`px-3 py-1 rounded-full text-xs font-bold border ${tool==='rect'?'bg-white text-black':'border-white/20'}`}>Box</button>
                <button onClick={() => setTool('circle')} className={`px-3 py-1 rounded-full text-xs font-bold border ${tool==='circle'?'bg-white text-black':'border-white/20'}`}>Circle</button>
                <button onClick={() => setTool('diamond')} className={`px-3 py-1 rounded-full text-xs font-bold border ${tool==='diamond'?'bg-white text-black':'border-white/20'}`}>Decision</button>
                <button onClick={() => setTool('cylinder')} className={`px-3 py-1 rounded-full text-xs font-bold border ${tool==='cylinder'?'bg-white text-black':'border-white/20'}`}>DB</button>
                
                <button onClick={handleAnalyze} disabled={isAnalyzing} className="px-3 py-1 rounded-full text-xs font-bold bg-accent text-black flex items-center gap-1 ml-auto">
                    {isAnalyzing ? '...' : <><SparklesIcon className="w-3 h-3"/> Analyze</>}
                </button>
            </div>

            <div className="relative flex-grow">
                <canvas 
                    ref={canvasRef} 
                    className="w-full h-full bg-[#252526] rounded-lg border border-white/10 touch-none cursor-crosshair"
                    onMouseDown={start} onMouseUp={end} onMouseMove={draw}
                    onTouchStart={start} onTouchEnd={end} onTouchMove={draw}
                />
                
                {analysis && (
                    <div className="absolute bottom-4 left-4 right-4 bg-black/90 p-4 rounded-xl border border-accent/30 text-xs animate-slide-in-from-bottom">
                        <div className="flex justify-between mb-2">
                            <strong className="text-accent">AI Analysis</strong>
                            <button onClick={() => setAnalysis(null)}>x</button>
                        </div>
                        <p className="whitespace-pre-wrap">{analysis}</p>
                    </div>
                )}
            </div>

            <div className="flex justify-center gap-4 mt-4">
                {['#ffffff', '#ef4444', '#22c55e', '#3b82f6', '#eab308'].map(c => (
                    <button key={c} onClick={() => setColor(c)} style={{background: c}} className={`w-8 h-8 rounded-full border-2 ${color===c?'border-white':'border-transparent'}`}/>
                ))}
            </div>
        </div>
    );
};
export default SystemWhiteboard;
