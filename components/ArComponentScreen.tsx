
import React, { useRef, useState } from 'react';
import { ArrowLeftIcon, CameraIcon, CpuIcon, XIcon } from './Icons';
import { identifyComponent } from '../services/geminiService';

interface ArComponentScreenProps {
    onBack: () => void;
}

const ArComponentScreen: React.FC<ArComponentScreenProps> = ({ onBack }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [result, setResult] = useState<{name: string, description: string, pinout: string} | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const startCamera = async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setStream(s);
            if (videoRef.current) videoRef.current.srcObject = s;
        } catch (e) { alert("Camera needed for AR"); }
    };

    const stopCamera = () => {
        stream?.getTracks().forEach(t => t.stop());
        setStream(null);
    };

    React.useEffect(() => {
        startCamera();
        return stopCamera;
    }, []);

    const capture = async () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
        const data = canvas.toDataURL('image/jpeg');
        setImage(data);
        setIsAnalyzing(true);
        const info = await identifyComponent(data);
        setResult(info);
        setIsAnalyzing(false);
    };

    const reset = () => {
        setImage(null);
        setResult(null);
    };

    return (
        <div className="flex flex-col h-full bg-black relative overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className={`absolute inset-0 w-full h-full object-cover ${image ? 'hidden' : ''}`} />
            {image && <img src={image} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="captured" />}
            
            <header className="absolute top-0 left-0 right-0 p-4 pt-12 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <button onClick={onBack} className="p-2 rounded-full bg-black/40 text-white"><ArrowLeftIcon className="w-6 h-6"/></button>
                <h2 className="text-white font-mono text-sm border border-green-500 px-2 py-1 rounded bg-black/50">AR_DATASHEET_SCANNER_V1</h2>
            </header>

            {/* HUD Overlay */}
            {!image && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-green-500/50 rounded-lg relative">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-500/80 text-xs font-mono">TARGET CHIP</div>
                    </div>
                </div>
            )}

            {/* Controls / Result */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black via-black/80 to-transparent">
                {result ? (
                    <div className="bg-gray-900/90 border border-green-500/30 p-4 rounded-xl text-green-400 font-mono animate-slide-in-from-bottom">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{result.name}</h3>
                            <button onClick={reset} className="text-gray-400 hover:text-white"><XIcon className="w-5 h-5"/></button>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{result.description}</p>
                        <pre className="text-xs bg-black p-2 rounded overflow-x-auto border border-green-500/20 text-green-300 whitespace-pre-wrap">{result.pinout}</pre>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <button 
                            onClick={capture} 
                            disabled={isAnalyzing}
                            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group"
                        >
                            <div className={`w-16 h-16 rounded-full bg-white transition-all ${isAnalyzing ? 'scale-75 animate-pulse' : 'group-hover:scale-90'}`}></div>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArComponentScreen;
