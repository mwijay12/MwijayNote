import React, { useMemo, useRef } from 'react';
import { AppView, JournalEntry, Expense, Goal, Habit, UserData, AudioTrack } from '../types';
import { ArrowLeftIcon, DownloadIcon, FilePdfIcon, SparklesIcon, CalendarIcon, ActivityIcon, MusicIcon, BookOpenIcon, TrendingUpIcon } from './Icons';
import { saveFile } from '../utils/exportUtils';
import { jsPDF } from 'jspdf';

interface ReportScreenProps {
    journals: JournalEntry[];
    expenses: Expense[];
    goals: Goal[];
    habits: Habit[];
    userData: UserData | null;
    radioHistory: AudioTrack[];
    onBack: () => void;
}

const ReportScreen: React.FC<ReportScreenProps> = ({ journals, expenses, goals, habits, userData, radioHistory, onBack }) => {
    const reportRef = useRef<HTMLDivElement>(null);

    const stats = useMemo(() => {
        const totalJournals = journals.length;
        const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
        const completedHabits = habits.filter(h => h.streak > 0).length;
        const activeGoals = goals.filter(g => g.status === 'In Progress').length;
        const radioCount = radioHistory.length;
        
        // Summary of notes
        const recentNotesSummary = journals.slice(0, 5).map(j => ({
            title: j.title,
            date: j.date,
            mood: j.mood
        }));

        return {
            totalJournals,
            totalExpenses,
            completedHabits,
            activeGoals,
            radioCount,
            recentNotesSummary
        };
    }, [journals, expenses, goals, habits, radioHistory]);

    const handleExportPdf = async () => {
        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const W = doc.internal.pageSize.getWidth();
            const H = doc.internal.pageSize.getHeight();
            const margin = 18;
            let y = 25;

            const checkPage = (needed = 10) => {
                if (y + needed > H - 15) { doc.addPage(); y = 20; }
            };

            // Header
            doc.setFillColor(15, 15, 20);
            doc.rect(0, 0, W, H, 'F');
            doc.setFontSize(22);
            doc.setTextColor(255, 188, 45);
            doc.setFont('helvetica', 'bold');
            doc.text('SYSTEM INTELLIGENCE REPORT', W / 2, y, { align: 'center' });
            y += 8;
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${new Date().toLocaleString()}  |  User: ${userData?.name || 'Explorer'}`, W / 2, y, { align: 'center' });
            y += 6;
            doc.setDrawColor(255, 188, 45);
            doc.setLineWidth(0.5);
            doc.line(margin, y, W - margin, y);
            y += 10;

            // Stats section
            doc.setFontSize(13);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.text('ECOSYSTEM OVERVIEW', margin, y);
            y += 8;

            const statsRows = [
                ['Total Journals',   String(stats.totalJournals)],
                ['Total Expenses',   `TSh ${stats.totalExpenses.toLocaleString()}`],
                ['Active Habits',    String(stats.completedHabits)],
                ['Active Goals',     String(stats.activeGoals)],
                ['Radio Plays',      String(stats.radioCount)],
            ];
            doc.setFontSize(10);
            statsRows.forEach(([label, val]) => {
                checkPage(8);
                doc.setTextColor(180, 180, 180);
                doc.setFont('helvetica', 'normal');
                doc.text(label, margin, y);
                doc.setTextColor(255, 188, 45);
                doc.setFont('helvetica', 'bold');
                doc.text(val, W - margin, y, { align: 'right' });
                y += 8;
            });

            y += 4;
            doc.setDrawColor(60, 60, 60);
            doc.line(margin, y, W - margin, y);
            y += 10;

            // Recent journals
            doc.setFontSize(13);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.text('RECENT JOURNAL INSIGHTS', margin, y);
            y += 8;

            if (stats.recentNotesSummary.length === 0) {
                doc.setFontSize(10);
                doc.setTextColor(120, 120, 120);
                doc.text('No journal entries yet.', margin, y);
                y += 8;
            } else {
                stats.recentNotesSummary.forEach(note => {
                    checkPage(14);
                    doc.setFontSize(10);
                    doc.setTextColor(220, 220, 220);
                    doc.setFont('helvetica', 'bold');
                    const titleStr = (note.title || 'Untitled').substring(0, 55);
                    doc.text(titleStr, margin, y);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(8);
                    doc.setTextColor(120, 120, 120);
                    doc.text(new Date(note.date).toLocaleDateString(), margin, y + 5);
                    y += 13;
                });
            }

            y += 4;
            doc.line(margin, y, W - margin, y);
            y += 10;

            // Radio history
            if (radioHistory.length > 0) {
                checkPage(20);
                doc.setFontSize(13);
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
                doc.text('LISTENING ODYSSEY', margin, y);
                y += 8;
                radioHistory.slice(0, 5).forEach(track => {
                    checkPage(12);
                    doc.setFontSize(10);
                    doc.setTextColor(200, 200, 200);
                    doc.setFont('helvetica', 'normal');
                    doc.text(`♪  ${track.title}`, margin, y);
                    doc.setFontSize(8);
                    doc.setTextColor(120, 120, 120);
                    doc.text(track.artist || '', margin + 6, y + 5);
                    y += 12;
                });
            }

            // Footer
            const totalPages = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(7);
                doc.setTextColor(60, 60, 60);
                doc.text(`Mwijay Note Intelligence Report  |  Page ${i} of ${totalPages}`, W / 2, H - 8, { align: 'center' });
            }

            saveFile(doc.output('blob'), `System_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (err) {
            console.error('Report export failed:', err);
            alert('Export failed. Please try again.');
        }
    };

    return (
        <div className="flex flex-col h-full bg-bg-primary animate-fade-in overflow-hidden">
            <header className="px-6 pt-safe-top pb-6 flex justify-between items-center bg-bg-primary/80 backdrop-blur-md sticky top-0 z-50 border-b border-border-subtle">
                <button onClick={onBack} className="p-2 rounded-xl bg-card border border-white/10 text-isabelline hover:text-accent transition-all">
                    <ArrowLeftIcon className="w-6 h-6"/>
                </button>
                <h2 className="text-lg font-black text-isabelline uppercase tracking-widest">System Intelligence Report</h2>
                <button onClick={handleExportPdf} className="p-2 rounded-xl bg-accent text-cafe shadow-lg hover:scale-105 transition-all">
                    <DownloadIcon className="w-6 h-6"/>
                </button>
            </header>

            <div className="flex-grow overflow-y-auto px-6 py-8 no-scrollbar">
                <div ref={reportRef} className="bg-card rounded-[2.5rem] p-8 border border-white/10 shadow-2xl space-y-10">
                    <div className="text-center space-y-2">
                        <div className="w-20 h-20 bg-accent/20 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-accent/30">
                            <SparklesIcon className="w-10 h-10 text-accent animate-pulse"/>
                        </div>
                        <h1 className="text-3xl font-brand font-black text-isabelline tracking-tight">Mwijay Note</h1>
                        <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Personal Ecosystem Analysis</p>
                        <div className="pt-4 flex justify-center gap-4 text-[10px] text-dun font-bold opacity-60">
                            <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> {new Date().toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><ActivityIcon className="w-3 h-3"/> Intelligence Report</span>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-jet/50 p-6 rounded-3xl border border-white/5 text-center">
                            <BookOpenIcon className="w-6 h-6 text-blue-400 mx-auto mb-2"/>
                            <div className="text-2xl font-black text-isabelline">{stats.totalJournals}</div>
                            <div className="text-[10px] font-black text-dun uppercase tracking-widest opacity-50">Journals</div>
                        </div>
                        <div className="bg-jet/50 p-6 rounded-3xl border border-white/5 text-center">
                            <TrendingUpIcon className="w-6 h-6 text-emerald-400 mx-auto mb-2"/>
                            <div className="text-2xl font-black text-isabelline">TSh {stats.totalExpenses.toLocaleString()}</div>
                            <div className="text-[10px] font-black text-dun uppercase tracking-widest opacity-50">Expenses</div>
                        </div>
                        <div className="bg-jet/50 p-6 rounded-3xl border border-white/5 text-center">
                            <ActivityIcon className="w-6 h-6 text-accent mx-auto mb-2"/>
                            <div className="text-2xl font-black text-isabelline">{stats.completedHabits}</div>
                            <div className="text-[10px] font-black text-dun uppercase tracking-widest opacity-50">Habits</div>
                        </div>
                        <div className="bg-jet/50 p-6 rounded-3xl border border-white/5 text-center">
                            <MusicIcon className="w-6 h-6 text-purple-400 mx-auto mb-2"/>
                            <div className="text-2xl font-black text-isabelline">{stats.radioCount}</div>
                            <div className="text-[10px] font-black text-dun uppercase tracking-widest opacity-50">Radio Waves</div>
                        </div>
                    </div>

                    {/* Notes Summary */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-isabelline uppercase tracking-widest flex items-center gap-2">
                            <BookOpenIcon className="w-4 h-4 text-accent"/> Recent Journal Insights
                        </h3>
                        <div className="space-y-3">
                            {stats.recentNotesSummary.length > 0 ? stats.recentNotesSummary.map((note, i) => (
                                <div key={i} className="bg-jet/30 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                                    <div>
                                        <div className="text-sm font-bold text-isabelline">{note.title || 'Untitled Entry'}</div>
                                        <div className="text-[10px] text-dun opacity-50">{new Date(note.date).toLocaleDateString()}</div>
                                    </div>
                                    <div className="text-xl">{note.mood}</div>
                                </div>
                            )) : (
                                <div className="text-center py-6 text-dun text-xs opacity-50 italic">No journals recorded yet.</div>
                            )}
                        </div>
                    </div>

                    {/* Radio History */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-isabelline uppercase tracking-widest flex items-center gap-2">
                            <MusicIcon className="w-4 h-4 text-accent"/> Listening Odyssey
                        </h3>
                        <div className="space-y-3">
                            {radioHistory.length > 0 ? radioHistory.slice(0, 5).map((track, i) => (
                                <div key={i} className="bg-jet/30 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent font-black">
                                        {track.title.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-grow">
                                        <div className="text-sm font-bold text-isabelline truncate">{track.title}</div>
                                        <div className="text-[10px] text-dun opacity-50 truncate">{track.artist}</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-6 text-dun text-xs opacity-50 italic">The airwaves are silent.</div>
                            )}
                        </div>
                    </div>

                    {/* User Profile Summary */}
                    <div className="bg-accent/5 p-6 rounded-3xl border border-accent/20 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-cafe font-black text-xl">
                                {userData?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <div className="text-lg font-black text-isabelline">{userData?.name || 'Explorer'}</div>
                                <div className="text-[10px] font-black text-accent uppercase tracking-widest">Growth Level: {userData?.growthPoints || 0} XP</div>
                            </div>
                        </div>
                        <p className="text-xs text-dun leading-relaxed opacity-80">
                            Your journey with Mwijay Note began on {userData?.onboardedAt ? new Date(userData.onboardedAt).toLocaleDateString() : 'the dawn of your potential'}. 
                            Since then, you've cultivated a digital garden of thoughts, managed your resources, and explored the global airwaves.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-10 border-t border-white/5 text-center">
                        <div className="text-[10px] font-black text-dun uppercase tracking-[0.4em] opacity-30">End of Intelligence Report</div>
                        <div className="text-[8px] text-dun opacity-20 mt-2">Generated by Mwijay Core AI Engine v4.2</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportScreen;
