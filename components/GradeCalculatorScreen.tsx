
import React, { useState } from 'react';
import { ArrowLeftIcon, CalculatorIcon, TrashIcon, PlusIcon } from './Icons';

interface GradeCalculatorScreenProps {
    onBack: () => void;
    isEmbedded?: boolean;
}

interface Course {
    id: number;
    name: string;
    ca: string; // Continuous Assessment (out of 40 or 100)
    fe: string; // Final Exam (out of 60 or 100)
    credits: string; // Course Units
}

const GradeCalculatorScreen: React.FC<GradeCalculatorScreenProps> = ({ onBack, isEmbedded }) => {
    const [courses, setCourses] = useState<Course[]>([
        { id: 1, name: 'Course 1', ca: '', fe: '', credits: '3' }
    ]);

    const addCourse = () => {
        setCourses([...courses, { id: Date.now(), name: `Course ${courses.length + 1}`, ca: '', fe: '', credits: '3' }]);
    };

    const removeCourse = (id: number) => {
        setCourses(courses.filter(c => c.id !== id));
    };

    const updateCourse = (id: number, field: keyof Course, value: string) => {
        setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    // Tanzanian Grading System Logic (TCU Standard Variant)
    // A: 70-100 (5 pts)
    // B+: 60-69 (4 pts)
    // B: 50-59 (3 pts)
    // C: 40-49 (2 pts)
    // D: 35-39 (1 pt)
    // F: 0-34 (0 pts)
    const calculateGrade = (total: number) => {
        if (total >= 70) return { letter: 'A', points: 5, color: 'text-green-400' };
        if (total >= 60) return { letter: 'B+', points: 4, color: 'text-blue-400' };
        if (total >= 50) return { letter: 'B', points: 3, color: 'text-yellow-400' };
        if (total >= 40) return { letter: 'C', points: 2, color: 'text-orange-400' };
        if (total >= 35) return { letter: 'D', points: 1, color: 'text-red-400' };
        return { letter: 'F', points: 0, color: 'text-red-600' };
    };

    // Calculate Final Logic
    // Assumes input might be raw out of 40/60 OR out of 100.
    // If CA > 40, treat as % and normalize. same for FE.
    const calculateRow = (course: Course) => {
        let caScore = parseFloat(course.ca) || 0;
        let feScore = parseFloat(course.fe) || 0;

        // Auto-normalize if user enters out of 100
        if (caScore > 40) caScore = (caScore / 100) * 40;
        if (feScore > 60) feScore = (feScore / 100) * 60;

        // Cap values just in case
        caScore = Math.min(caScore, 40);
        feScore = Math.min(feScore, 60);

        const total = Math.round(caScore + feScore);
        const gradeInfo = calculateGrade(total);
        
        return { total, ...gradeInfo };
    };

    const gpa = () => {
        let totalPoints = 0;
        let totalCredits = 0;

        courses.forEach(c => {
            const row = calculateRow(c);
            const credits = parseFloat(c.credits) || 0;
            if (c.ca && c.fe) {
                totalPoints += (row.points * credits);
                totalCredits += credits;
            }
        });

        if (totalCredits === 0) return "0.0";
        return (totalPoints / totalCredits).toFixed(1);
    };

    return (
        <div className={`flex flex-col h-full animate-fade-in ${isEmbedded ? 'p-0' : 'bg-jet p-4 pt-16'}`}>
            {!isEmbedded && (
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                        <h2 className="text-xl font-serif ml-4 text-isabelline">TZ Grade Calc</h2>
                    </div>
                    <div className="bg-card px-4 py-2 rounded-xl border border-accent/30 text-center">
                        <span className="text-xs text-dun block font-bold uppercase">GPA</span>
                        <span className="text-xl font-bold text-accent">{gpa()}</span>
                    </div>
                </header>
            )}

            {isEmbedded && (
                <div className="flex justify-between items-center mb-6 px-6 pt-6">
                    <h3 className="text-lg font-brand font-black text-isabelline">GPA Tracker</h3>
                    <div className="bg-accent text-jet px-4 py-1 rounded-full font-black text-sm shadow-lg">
                        {gpa()} GPA
                    </div>
                </div>
            )}

            <div className={`flex-grow overflow-y-auto pb-4 space-y-4 ${isEmbedded ? 'px-6' : ''}`}>
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-xs text-blue-300 mb-4">
                    <strong>Note:</strong> Enter your Continuous Assessment (CA) and Final Exam (UE) marks. 
                    System auto-normalizes scores out of 100 to the standard 40/60 split if needed.
                </div>

                {courses.map((course, idx) => {
                    const result = calculateRow(course);
                    return (
                        <div key={course.id} className="bg-card p-4 rounded-2xl border border-white/5 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <input 
                                    value={course.name} 
                                    onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                                    className="bg-transparent font-bold text-isabelline outline-none w-32 placeholder-dun/50 focus:border-b focus:border-accent"
                                    placeholder="Course Name"
                                />
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-dun uppercase font-bold">Credits:</span>
                                    <input 
                                        type="number" 
                                        value={course.credits} 
                                        onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                                        className="w-10 bg-jet text-center rounded text-sm py-1 outline-none focus:ring-1 focus:ring-amber"
                                    />
                                    <button onClick={() => removeCourse(course.id)} className="text-dun hover:text-red-400 p-1"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                    <label className="text-[10px] text-dun uppercase font-bold block mb-1">CA (40%)</label>
                                    <input 
                                        type="number" 
                                        placeholder="/ 40"
                                        value={course.ca} 
                                        onChange={(e) => updateCourse(course.id, 'ca', e.target.value)}
                                        className="w-full bg-jet p-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-dun uppercase font-bold block mb-1">UE (60%)</label>
                                    <input 
                                        type="number" 
                                        placeholder="/ 60"
                                        value={course.fe} 
                                        onChange={(e) => updateCourse(course.id, 'fe', e.target.value)}
                                        className="w-full bg-jet p-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t border-white/10">
                                <div className="text-xs text-dun">
                                    Total: <span className="text-white font-bold">{result.total}%</span>
                                </div>
                                <div className={`text-lg font-black ${result.color}`}>
                                    {result.letter} <span className="text-xs opacity-70">({result.points} pts)</span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <button onClick={addCourse} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-dun hover:text-white flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
                    <PlusIcon className="w-5 h-5"/> Add Course
                </button>
            </div>
        </div>
    );
};

export default GradeCalculatorScreen;
