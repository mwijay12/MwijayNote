import React, { useState } from 'react';
import { ArrowLeftIcon, BrainCircuitIcon, CodeIcon, HeartIcon, SparklesIcon, XIcon, CheckCircleIcon } from './Icons';
import { generateSkillLesson } from '../services/geminiService';

interface SkillTreeScreenProps {
    onBack: () => void;
}

type SkillType = 'Coding' | 'Piano' | 'Life';

const SkillTreeScreen: React.FC<SkillTreeScreenProps> = ({ onBack }) => {
    const [activeSkill, setActiveSkill] = useState<SkillType>('Coding');
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [lesson, setLesson] = useState<{ title: string, content: string, action: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Mock progress - in real app, persist this
    const [progress, setProgress] = useState<Record<string, boolean>>({});

    const skillNodes: Record<SkillType, { id: string, label: string, level: string }[]> = {
        Coding: [
            { id: 'c_var', label: 'Variables', level: 'Beginner' },
            { id: 'c_loop', label: 'Loops', level: 'Beginner' },
            { id: 'c_func', label: 'Functions', level: 'Intermediate' },
            { id: 'c_algo', label: 'Algorithms', level: 'Advanced' },
        ],
        Piano: [
            { id: 'p_keys', label: 'Key Names', level: 'Beginner' },
            { id: 'p_scales', label: 'Major Scales', level: 'Beginner' },
            { id: 'p_chords', label: 'Basic Chords', level: 'Intermediate' },
            { id: 'p_impro', label: 'Improv', level: 'Advanced' },
        ],
        Life: [
            { id: 'l_emo', label: 'Emotional IQ', level: 'Beginner' },
            { id: 'l_fin', label: 'Financial Discipline', level: 'Intermediate' },
            { id: 'l_rel', label: 'Healthy Relationships', level: 'Advanced' },
            { id: 'l_lead', label: 'Leadership', level: 'Advanced' },
        ]
    };

    const handleNodeClick = async (node: { id: string, label: string, level: string }) => {
        setSelectedNode(node.id);
        setIsLoading(true);
        setLesson(null);
        try {
            const data = await generateSkillLesson(`${activeSkill}: ${node.label}`, node.level);
            setLesson(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const completeLesson = () => {
        if (selectedNode) {
            setProgress(prev => ({ ...prev, [selectedNode]: true }));
            setLesson(null);
            setSelectedNode(null);
        }
    };

    return (
        <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-bg-primary">
            {lesson && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in" onClick={() => setLesson(null)}>
                    <div className="bg-card w-full max-w-md p-6 rounded-3xl border border-white/10 shadow-2xl relative max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setLesson(null)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"><XIcon className="w-5 h-5"/></button>
                        <h2 className="text-2xl font-serif text-accent mb-4">{lesson.title}</h2>
                        <div className="prose prose-invert prose-sm text-isabelline leading-relaxed whitespace-pre-wrap mb-6">
                            {lesson.content}
                        </div>
                        <div className="bg-bg-primary/50 p-4 rounded-xl border border-accent/20 mb-6">
                            <h4 className="text-xs font-bold text-accent uppercase tracking-wide mb-2">Practice Task</h4>
                            <p className="text-sm text-dun">{lesson.action}</p>
                        </div>
                        <button onClick={completeLesson} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 transition-colors flex items-center justify-center gap-2">
                            <CheckCircleIcon className="w-5 h-5"/> Complete Lesson
                        </button>
                    </div>
                </div>
            )}

            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                    <h2 className="text-xl font-serif ml-2 flex items-center gap-2"><BrainCircuitIcon className="w-6 h-6 text-emerald-400"/> Skill Tree</h2>
                </div>
            </header>

            <div className="flex gap-2 mb-8 bg-card p-1 rounded-full">
                {(['Coding', 'Piano', 'Life'] as SkillType[]).map(skill => (
                    <button 
                        key={skill} 
                        onClick={() => setActiveSkill(skill)}
                        className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${activeSkill === skill ? 'bg-accent text-cafe shadow-lg' : 'text-dun hover:text-isabelline'}`}
                    >
                        {skill}
                    </button>
                ))}
            </div>

            <div className="flex-grow relative flex flex-col items-center gap-8 py-8 overflow-y-auto">
                {/* SVG Connecting Lines could go here for a real tree visual */}
                <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white/5 -z-10"></div>

                {skillNodes[activeSkill].map((node, index) => {
                    const isUnlocked = index === 0 || progress[skillNodes[activeSkill][index - 1].id];
                    const isCompleted = progress[node.id];

                    return (
                        <button 
                            key={node.id}
                            onClick={() => isUnlocked && handleNodeClick(node)}
                            disabled={!isUnlocked}
                            className={`relative w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10 ${
                                isCompleted 
                                ? 'bg-green-500 border-green-600 text-black' 
                                : isUnlocked 
                                    ? 'bg-card border-accent text-accent hover:scale-110 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)]' 
                                    : 'bg-bg-primary border-white/10 text-white/20 grayscale cursor-not-allowed'
                            }`}
                        >
                            {activeSkill === 'Coding' && <CodeIcon className="w-8 h-8"/>}
                            {activeSkill === 'Piano' && <span className="text-2xl">🎹</span>}
                            {activeSkill === 'Life' && <HeartIcon className="w-8 h-8"/>}
                            
                            {isLoading && selectedNode === node.id && (
                                <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
                            )}
                            
                            <div className="absolute top-full mt-2 text-center w-32">
                                <p className={`text-xs font-bold ${isUnlocked ? 'text-isabelline' : 'text-dun/50'}`}>{node.label}</p>
                                <p className="text-[10px] text-dun">{node.level}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SkillTreeScreen;
