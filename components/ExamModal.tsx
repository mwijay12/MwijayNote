
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCapIcon, XIcon, CalendarIcon, SparklesIcon } from './Icons';

interface ExamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (subject: string, date: string) => void;
}

const ExamModal: React.FC<ExamModalProps> = ({ isOpen, onClose, onSave }) => {
    const [subject, setSubject] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-card border border-border-subtle w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                                    <GraduationCapIcon className="w-6 h-6 text-accent" />
                                </div>
                                <h2 className="text-xl font-brand font-black text-isabelline tracking-widest uppercase">New Exam</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-dun transition-colors">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-dun uppercase tracking-widest mb-1.5 block ml-1">Subject</label>
                                <input 
                                    autoFocus
                                    type="text" 
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Advanced Mathematics"
                                    className="w-full bg-bg-primary border border-border-subtle rounded-2xl p-4 text-isabelline outline-none focus:ring-1 focus:ring-amber transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-dun uppercase tracking-widest mb-1.5 block ml-1">Exam Date</label>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-bg-primary border border-border-subtle rounded-2xl p-4 text-isabelline outline-none focus:ring-1 focus:ring-amber transition-all pr-12"
                                    />
                                    <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dun pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button 
                                onClick={onClose}
                                className="flex-grow py-4 rounded-2xl font-bold text-dun hover:bg-white/5 transition-colors border border-border-subtle"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    if(subject.trim()) {
                                        onSave(subject, date);
                                        setSubject('');
                                        onClose();
                                    }
                                }}
                                className="flex-grow py-4 rounded-2xl font-bold bg-accent text-black hover:opacity-90 transition-opacity shadow-lg shadow-amber/20 flex items-center justify-center gap-2"
                            >
                                <SparklesIcon className="w-4 h-4" />
                                Add Exam
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ExamModal;
