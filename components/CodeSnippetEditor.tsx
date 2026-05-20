
import React, { useState, useRef } from 'react';
import { ArrowLeftIcon, BugIcon, XIcon, MicIcon, ShareIcon, SparklesIcon } from './Icons';
import { CodeSnippet } from '../types';
import { reviewCode, voiceToCode } from '../services/geminiService';
import SocialShareModal from './SocialShareModal';

interface CodeSnippetEditorProps {
  snippet: Partial<CodeSnippet>;
  onSave: (snippet: Partial<CodeSnippet>) => void;
  onCancel: () => void;
}

const languages = [
    "JavaScript", "TypeScript", "Python", "HTML", "CSS", "SQL", "JSON", "Markdown",
    "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Shell", "Plain Text"
];

const CodeSnippetEditor: React.FC<CodeSnippetEditorProps> = ({ snippet, onSave, onCancel }) => {
  const [title, setTitle] = useState(snippet.title || '');
  const [language, setLanguage] = useState(snippet.language || 'JavaScript');
  const [code, setCode] = useState(snippet.code || '');
  const [review, setReview] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleSave = () => {
    if (title.trim()) {
      onSave({ ...snippet, title: title.trim(), language, code });
    }
  };

  const handleReview = async () => {
      if (!code.trim()) return;
      setIsReviewing(true);
      setReview(null);
      const feedback = await reviewCode(code, language);
      setReview(feedback);
      setIsReviewing(false);
  };

  const toggleRecording = async () => {
      if (isRecording) {
          mediaRecorderRef.current?.stop();
          setIsRecording(false);
      } else {
          try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              const mediaRecorder = new MediaRecorder(stream);
              mediaRecorderRef.current = mediaRecorder;
              const audioChunks: Blob[] = [];
              
              mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
              mediaRecorder.onstop = async () => {
                  stream.getTracks().forEach(track => track.stop());
                  const blob = new Blob(audioChunks, { type: 'audio/webm' });
                  setIsReviewing(true); // Reuse loading state
                  // Convert blob to base64 text transcript via standard speech API or mock for now
                  // Since we don't have a direct speech-to-text in utils without file upload logic being complex here,
                  // we will use a prompt asking user to type logic if mic fails, BUT
                  // let's use the browser's SpeechRecognition if available for "Dictate Logic"
                  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                  if (SpeechRecognition) {
                      const recognition = new SpeechRecognition();
                      recognition.continuous = false;
                      recognition.lang = 'en-US';
                      recognition.start();
                      recognition.onresult = async (event: any) => {
                          const transcript = event.results[0][0].transcript;
                          const result = await voiceToCode(transcript);
                          setCode(result.code);
                          setLanguage(result.language);
                          setIsReviewing(false);
                      };
                      recognition.onerror = () => {
                          alert("Speech recognition failed.");
                          setIsReviewing(false);
                      };
                  } else {
                      alert("Browser does not support Speech Recognition.");
                      setIsReviewing(false);
                  }
              };
              // mediaRecorder not needed for browser speech recog, but kept for structure if we switch to Gemini Audio
              mediaRecorder.start(); // Actually we don't need mediaRecorder if using Web Speech API for simple dictation
              // Let's just use Web Speech API directly for simplicity in this component
              setIsRecording(true);
          } catch (e) {
              console.error(e);
          }
      }
  };
  
  // Simplified Voice Handler using Web Speech API
  const handleDictate = () => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
          alert("Speech Recognition not supported in this browser.");
          return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      setIsRecording(true);
      recognition.start();
      
      recognition.onresult = async (event: any) => {
          const transcript = event.results[0][0].transcript;
          setIsRecording(false);
          setIsReviewing(true);
          const result = await voiceToCode(transcript);
          setCode(prev => prev + (prev ? '\n\n' : '') + `// Dictated: "${transcript}"\n` + result.code);
          if (result.language && result.language !== 'text') setLanguage(result.language);
          setIsReviewing(false);
      };
      
      recognition.onerror = () => {
          setIsRecording(false);
          alert("Could not hear you.");
      };
      
      recognition.onend = () => setIsRecording(false);
  };

  return (
    <div className="flex flex-col h-full animate-slide-in-from-bottom p-4 pt-16 bg-jet">
      {showShare && <SocialShareModal config={{ type: 'code', text: code, authorOrTitle: title, language }} onClose={() => setShowShare(false)} />}
      
      <header className="flex justify-between items-center mb-6">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/10 -ml-2">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-serif">{snippet.id ? 'Edit Snippet' : 'New Snippet'}</h2>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowShare(true)} 
                className="p-2 rounded-full bg-card hover:bg-white/10 text-accent"
                title="Share as Image"
            >
                <ShareIcon className="w-5 h-5" />
            </button>
            <button 
                onClick={handleReview} 
                disabled={isReviewing || !code.trim()}
                className="p-2 rounded-full bg-green-500/10 text-green-400 hover:bg-green-500/20 disabled:opacity-50" 
                title="Pair Programmer Review"
            >
                {isReviewing ? <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div> : <BugIcon className="w-5 h-5" />}
            </button>
            <button onClick={handleSave} disabled={!title.trim()} className="px-5 py-2 text-sm font-semibold rounded-full bg-accent text-cafe hover:opacity-90 transition-opacity disabled:opacity-50">
            Save
            </button>
        </div>
      </header>

      <div className="flex-grow flex flex-col gap-4 overflow-y-auto pb-4 relative">
        <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Snippet Title..."
              className="w-full bg-card p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
              autoFocus
            />
             <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full bg-card p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber appearance-none"
            >
                {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
        </div>
        
        <div className="relative flex-grow flex flex-col">
            <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Your code here..."
            spellCheck="false"
            className="w-full flex-grow bg-jet p-4 text-isabelline/90 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber font-mono text-sm border border-white/10"
            />
            <button 
                onClick={handleDictate}
                className={`absolute bottom-4 right-4 p-3 rounded-full shadow-lg transition-all ${isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-card border border-white/10 text-dun hover:text-accent'}`}
                title="Voice to Code"
            >
                <MicIcon className="w-6 h-6" />
            </button>
        </div>

        {review && (
            <div className="absolute inset-0 bg-jet/95 backdrop-blur-xl z-20 p-6 rounded-xl border border-green-500/30 flex flex-col animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-green-400 flex items-center gap-2"><BugIcon className="w-5 h-5"/> Pair Programmer</h3>
                    <button onClick={() => setReview(null)} className="p-1 hover:bg-white/10 rounded-full"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="flex-grow overflow-y-auto prose prose-invert prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: review.replace(/\n/g, '<br/>') }} />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CodeSnippetEditor;
