
import React, { useState, useEffect, useRef } from 'react';
import { XIcon, SendIcon, FeatherIcon } from './Icons';
import { useJournal } from '../hooks/useJournal';
import { JournalTopic } from '../types';

interface QuickCaptureModalProps {
    onClose: () => void;
}

const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({ onClose }) => {
    const [text, setText] = useState('');
    const { addJournal } = useJournal();
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSave = () => {
        if (!text.trim()) return;
        
        addJournal({
            title: `Quick Note: ${new Date().toLocaleTimeString()}`,
            content: text,
            type: 'Engineering Log', // Generic bucket
            topic: JournalTopic.ENGINEERING,
            date: new Date().toISOString(),
            tags: ['#Inbox', 'QuickCapture']
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div 
                className="bg-bg-primary w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl p-4 animate-slide-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-accent uppercase flex items-center gap-2">
                        <FeatherIcon className="w-4 h-4"/> Quick Capture
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                        <XIcon className="w-5 h-5 text-dun"/>
                    </button>
                </div>
                
                <textarea 
                    ref={inputRef}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Capture an idea, task, or thought..."
                    className="w-full h-32 bg-card rounded-xl p-4 text-isabelline placeholder-dun/50 resize-none outline-none focus:ring-2 focus:ring-amber/50 transition-all text-base"
                    onKeyDown={e => { if(e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave(); }}
                />
                
                <div className="flex justify-between items-center mt-4">
                    <span className="text-[10px] text-dun">CMD/CTRL + Enter to save</span>
                    <button 
                        onClick={handleSave} 
                        disabled={!text.trim()}
                        className="bg-accent text-cafe px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        Save <SendIcon className="w-4 h-4"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickCaptureModal;
