import React, { useEffect, useRef } from 'react';
import { BackgroundEffectType } from '../types';

interface BackgroundEffectsProps {
    effect: BackgroundEffectType;
    isDark: boolean;
}

const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ effect, isDark }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (effect !== 'matrix') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;

        const matrixChars = '01';
        const fontSize = 16;
        const columns = Math.ceil(w / fontSize);
        const drops: number[] = Array(columns).fill(1);

        const animate = () => {
            ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)';
            ctx.fillRect(0, 0, w, h);
            
            const accentColor = getComputedStyle(document.body).getPropertyValue('--color-accent').trim() || '#0F0';
            ctx.fillStyle = accentColor;
            ctx.font = `${fontSize}px monospace`;
            
            for (let i = 0; i < drops.length; i++) {
                const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > h && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
            requestRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [effect, isDark]);

    if (effect === 'off') return null;

    if (effect === 'fluid' || effect === 'auto') {
        const blendMode = isDark ? 'mix-blend-screen' : 'mix-blend-multiply';
        const opacity = isDark ? 'opacity-40' : 'opacity-[0.03]';
        
        return (
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transform translate-z-0">
                <div 
                    className={`absolute top-[-10%] left-[-10%] w-[120vw] h-[120vw] rounded-full ${blendMode} filter blur-[120px] ${opacity} animate-blob`}
                    style={{ backgroundColor: isDark ? 'var(--color-accent)' : '#000000' }} 
                />
                <div 
                    className={`absolute bottom-[-20%] right-[-10%] w-[100vw] h-[100vw] rounded-full ${blendMode} filter blur-[120px] ${opacity} animate-blob`}
                    style={{ backgroundColor: isDark ? '#4c1d95' : '#000000', animationDelay: '2s' }} 
                />
            </div>
        );
    }

    if (effect === 'matrix') {
        return <canvas ref={canvasRef} className="fixed inset-0 z-[-1] pointer-events-none opacity-50" />;
    }

    return null;
};

export default BackgroundEffects;
