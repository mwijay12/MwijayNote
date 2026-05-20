
import React, { useEffect, useRef } from 'react';

const Confetti: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: any[] = [];
        const colors = ['#FFBC2D', '#64FFDA', '#FF9F1C', '#F472B6', '#FFFFFF'];

        class Particle {
            x: number;
            y: number;
            color: string;
            size: number;
            speedX: number;
            speedY: number;
            rotation: number;
            rotationSpeed: number;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height - canvas!.height;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.size = Math.random() * 8 + 4;
                this.speedX = Math.random() * 4 - 2;
                this.speedY = Math.random() * 4 + 2;
                this.rotation = Math.random() * 360;
                this.rotationSpeed = Math.random() * 10 - 5;
            }

            update() {
                this.y += this.speedY;
                this.x += this.speedX;
                this.rotation += this.rotationSpeed;
                if (this.y > canvas!.height) {
                    this.y = -10;
                    this.x = Math.random() * canvas!.width;
                }
            }

            draw() {
                if(!ctx) return;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate((this.rotation * Math.PI) / 180);
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
                ctx.restore();
            }
        }

        for (let i = 0; i < 100; i++) {
            particles.push(new Particle());
        }

        let animationId: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            animationId = requestAnimationFrame(animate);
        };

        animate();

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);

        // Auto stop after 5 seconds
        const timer = setTimeout(() => {
            cancelAnimationFrame(animationId);
            if(canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 5000);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
            clearTimeout(timer);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            className="fixed inset-0 z-[60] pointer-events-none"
        />
    );
};

export default Confetti;
