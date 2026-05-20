
import React, { useState, useRef, useEffect } from 'react';
import { JournalEntry, JournalTopic } from '../types';
import { XIcon, MicIcon, StopIcon, SparklesIcon, WifiIcon, PauseIcon, PlayIcon, BellIcon } from './Icons';
import { transcribeAudio, suggestTitles } from '../services/geminiService';

interface VoiceJournalingScreenProps {
  onSave: (journal: Partial<JournalEntry>) => void;
  onCancel: () => void;
  onSaveReminder?: (text: string) => void;
}

const VoiceJournalingScreen: React.FC<VoiceJournalingScreenProps> = ({ onSave, onCancel, onSaveReminder }) => {
  const [transcribedText, setTranscribedText] = useState('');
  const [title, setTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [reminderDetected, setReminderDetected] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
        cleanupAudio();
    };
  }, []);

  useEffect(() => {
      // Regex to detect "Remind me to [action]"
      const match = transcribedText.match(/remind me to (.+)/i);
      if (match && match[1]) {
          setReminderDetected(match[1]);
      } else {
          setReminderDetected(null);
      }
  }, [transcribedText]);

  const cleanupAudio = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
      if (audioContextRef.current) audioContextRef.current.close();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
  };

  const blobToDataUrl = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  };

  const drawVisualizer = () => {
      if (!canvasRef.current || !analyserRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const draw = () => {
          if (!isRecording || isPaused) {
              if (isPaused && animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
              return;
          }
          
          animationFrameRef.current = requestAnimationFrame(draw);
          analyserRef.current!.getByteFrequencyData(dataArray);

          ctx.fillStyle = '#0f172a'; // Clear with background
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const barWidth = (canvas.width / bufferLength) * 2.5;
          let barHeight;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
              barHeight = dataArray[i] / 2; // Scale height

              // Dynamic color based on height/loudness
              const r = barHeight + 25 * (i / bufferLength);
              const g = 188 * (i / bufferLength);
              const b = 45;

              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

              x += barWidth + 1;
          }
      };

      draw();
  };

  const startVisualizer = (stream: MediaStream) => {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256; // Smaller FFT size for thicker bars
      
      drawVisualizer();
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        setIsPaused(false);
        if (timerRef.current) clearInterval(timerRef.current);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });

        startVisualizer(stream);

        let mimeType = 'audio/webm';
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus';
        }
            
        const mediaRecorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 128000 });
        mediaRecorderRef.current = mediaRecorder;
        const audioChunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(track => track.stop());
          const audioBlob = new Blob(audioChunks, { type: mimeType });
          
          if (audioBlob.size === 0) return;

          setIsTranscribing(true);
          try {
              const dataUrl = await blobToDataUrl(audioBlob);
              const transcription = await transcribeAudio({ name: 'voice.webm', type: audioBlob.type, data: dataUrl });
              const newText = (transcribedText ? transcribedText + '\n\n' : '') + transcription;
              setTranscribedText(newText);

              if (!title && transcription.length > 10) {
                  setIsGeneratingTitle(true);
                  suggestTitles(newText).then(s => { if(s.length) setTitle(s[0]); }).finally(() => setIsGeneratingTitle(false));
              }
          } catch (error) {
              console.error("Transcription failed", error);
          } finally {
              setIsTranscribing(false);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingDuration(0);
        timerRef.current = setInterval(() => setRecordingDuration(p => p + 1), 1000);

      } catch (err) {
        alert("Microphone access denied.");
      }
    }
  };

  const togglePause = () => {
      if (!mediaRecorderRef.current) return;
      if (isPaused) {
          mediaRecorderRef.current.resume();
          setIsPaused(false);
          timerRef.current = setInterval(() => setRecordingDuration(p => p + 1), 1000);
          drawVisualizer();
      } else {
          mediaRecorderRef.current.pause();
          setIsPaused(true);
          if (timerRef.current) clearInterval(timerRef.current);
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      }
  };

  const handleSave = () => {
    if (transcribedText.trim()) {
      onSave({
        title: title || `Voice Note - ${new Date().toLocaleTimeString()}`,
        content: `<p>${transcribedText.replace(/\n/g, '</p><p>')}</p>`,
        type: 'Voice Note',
        topic: JournalTopic.VOICE,
        date: new Date().toISOString(),
      });
    } else {
        onCancel();
    }
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveReminder = () => {
      if (reminderDetected && onSaveReminder) {
          onSaveReminder(reminderDetected);
      }
  };

  return (
    <div className="flex flex-col h-full animate-zoom-in p-4 pt-16 bg-bg-primary">
      <header className="flex justify-between items-center mb-6">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/10">
          <XIcon className="w-6 h-6" />
        </button>
        <div className="flex-grow mx-4 relative group">
             <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isGeneratingTitle ? "✨ Generating title..." : "Title your thought..."}
                className="w-full bg-transparent text-xl font-serif text-center text-isabelline placeholder-dun/50 focus:outline-none border-b border-transparent focus:border-accent transition-all py-1"
             />
             <SparklesIcon className={`w-4 h-4 text-accent absolute right-0 top-1/2 -translate-y-1/2 opacity-50 ${isGeneratingTitle ? 'animate-spin' : 'hidden'}`} />
        </div>
        <button onClick={handleSave} disabled={!transcribedText.trim()} className="px-5 py-2 text-sm font-semibold rounded-full bg-accent text-cafe hover:opacity-90 transition-opacity disabled:opacity-50">
          Save
        </button>
      </header>

      {reminderDetected && onSaveReminder && (
          <div className="bg-card border border-accent/30 p-4 rounded-2xl mb-4 animate-pop-in flex justify-between items-center">
              <div>
                  <p className="text-xs font-bold text-accent uppercase tracking-wider mb-1">Reminder Detected</p>
                  <p className="text-sm text-isabelline font-medium">"{reminderDetected}"</p>
              </div>
              <button onClick={handleSaveReminder} className="bg-accent text-cafe px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:opacity-90">
                  <BellIcon className="w-4 h-4"/> Create
              </button>
          </div>
      )}

      <div className="flex-grow flex flex-col gap-4">
        <div className="relative w-full h-32 bg-black/20 rounded-xl overflow-hidden border border-white/5">
            {isRecording && !isPaused ? (
                <canvas ref={canvasRef} width={600} height={128} className="w-full h-full" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-dun/30 text-sm">
                    {transcribedText ? "Processing complete" : "Frequency Visualizer"}
                </div>
            )}
            {isRecording && (
                <div className="absolute bottom-2 right-2 bg-red-500 text-white text-xs font-mono px-2 py-1 rounded animate-pulse">
                    REC {formatTime(recordingDuration)}
                </div>
            )}
        </div>

        <textarea
          value={transcribedText}
          onChange={(e) => setTranscribedText(e.target.value)}
          className="w-full flex-grow bg-card p-4 text-isabelline/90 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber text-lg leading-relaxed font-serif placeholder-dun/30"
          placeholder="Tap the mic to start speaking..."
        />
      </div>

      <div className="py-6 flex flex-col items-center gap-4">
        {isTranscribing && (
            <div className="flex items-center gap-2 text-dun">
                <SparklesIcon className="w-5 h-5 text-accent animate-pulse" />
                <span>Transcribing & Enhancing Audio...</span>
            </div>
        )}
        
        <div className="flex items-center gap-6">
            {isRecording && (
                <button 
                    onClick={togglePause}
                    className="w-14 h-14 rounded-full bg-card border border-white/10 flex items-center justify-center text-isabelline hover:text-accent transition-all"
                >
                    {isPaused ? <PlayIcon className="w-6 h-6 ml-1" /> : <PauseIcon className="w-6 h-6" />}
                </button>
            )}

            <button
                onClick={handleToggleRecording}
                disabled={isTranscribing}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all text-white shadow-lg hover:scale-105 active:scale-95 ${isRecording ? 'bg-red-500 ring-4 ring-red-500/30' : 'bg-accent'}`}
            >
                {isRecording ? <StopIcon className="w-8 h-8"/> : <MicIcon className="w-8 h-8"/>}
            </button>
            
            {isRecording && (
                 <div className="w-14 h-14 flex items-center justify-center" title="Enhancement Active">
                    <WifiIcon className="w-6 h-6 text-green-400 animate-pulse"/>
                 </div>
            )}
        </div>
        
        <p className="text-dun text-sm font-medium">
            {isRecording ? (isPaused ? "Recording Paused" : "Listening...") : "Tap to Record"}
        </p>
      </div>
    </div>
  );
};

export default VoiceJournalingScreen;
