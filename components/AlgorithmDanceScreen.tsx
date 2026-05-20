
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, PlayIcon, RefreshCwIcon } from './Icons';

interface AlgorithmDanceScreenProps {
    onBack: () => void;
}

const AlgorithmDanceScreen: React.FC<AlgorithmDanceScreenProps> = ({ onBack }) => {
    const [array, setArray] = useState<number[]>([]);
    const [sorting, setSorting] = useState(false);
    const audioCtxRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        resetArray();
        return () => { audioCtxRef.current?.close(); };
    }, []);

    const playTone = (freq: number) => {
        if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.value = 0.1;
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.05);
    };

    const resetArray = () => {
        setArray(Array.from({ length: 50 }, () => Math.floor(Math.random() * 100) + 1));
    };

    const mergeSort = async (arr: number[]) => {
        if (arr.length <= 1) return arr;
        const mid = Math.floor(arr.length / 2);
        const left = await mergeSort(arr.slice(0, mid));
        const right = await mergeSort(arr.slice(mid));
        return await merge(left, right);
    };

    const merge = async (left: number[], right: number[]) => {
        let resultArray = [], leftIndex = 0, rightIndex = 0;
        while (leftIndex < left.length && rightIndex < right.length) {
            if (left[leftIndex] < right[rightIndex]) {
                resultArray.push(left[leftIndex]);
                leftIndex++; 
            } else {
                resultArray.push(right[rightIndex]);
                rightIndex++;
            }
            // Visualize
            playTone(200 + resultArray.length * 10);
            await new Promise(r => setTimeout(r, 20));
        }
        return resultArray.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
    };

    const startSort = async () => {
        setSorting(true);
        // Simple Bubble Sort for better visualization
        let arr = [...array];
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    let temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    setArray([...arr]);
                    playTone(200 + arr[j] * 5);
                    await new Promise(r => setTimeout(r, 10));
                }
            }
        }
        setSorting(false);
    };

    return (
        <div className="flex flex-col h-full bg-black text-white p-4 pt-16">
            <header className="flex justify-between items-center mb-8">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                <h2 className="text-xl font-serif">Algorithm Dance</h2>
                <div className="w-6"></div>
            </header>

            <div className="flex-grow flex items-end justify-center gap-0.5 mb-8">
                {array.map((val, idx) => (
                    <div key={idx} style={{ height: `${val}%` }} className="flex-1 bg-gradient-to-t from-purple-500 to-amber rounded-t-sm opacity-80"></div>
                ))}
            </div>

            <div className="flex justify-center gap-4">
                <button onClick={resetArray} disabled={sorting} className="p-4 rounded-full bg-white/10 hover:bg-white/20"><RefreshCwIcon className="w-6 h-6"/></button>
                <button onClick={startSort} disabled={sorting} className="p-4 rounded-full bg-accent text-black hover:scale-105 transition-transform"><PlayIcon className="w-6 h-6"/></button>
            </div>
        </div>
    );
};

export default AlgorithmDanceScreen;
