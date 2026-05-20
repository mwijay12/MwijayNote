import React, { useMemo, useState, useRef, useEffect } from 'react';
import { JournalEntry, Expense, Habit, UserData, TargetLanguage } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUpIcon, TagIcon, DownloadIcon, BarChartIcon, DollarSignIcon, SparklesIcon, XIcon, ActivityIcon, PieChartIcon } from './Icons';
import { generateGeneralReportHtml, exportAsDoc } from '../utils/exportUtils';
import { getInsightsSummary } from '../services/geminiService';
import { usePerformance } from '../hooks/usePerformance';

interface InsightsScreenProps {
  journals: JournalEntry[];
  expenses: Expense[];
  habits: Habit[];
  userData?: UserData | null;
  targetLanguage?: TargetLanguage;
}

const COLORS = ['#FFBC2D', '#4ade80', '#60a5fa', '#f472b6', '#a78bfa', '#f87171'];

const PerformanceTab: React.FC<{ journals: JournalEntry[], expenses: Expense[], habits: Habit[] }> = ({ journals, expenses, habits }) => {
    const metrics = usePerformance(journals, expenses, habits);
    
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-card p-6 rounded-3xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 text-center">
                    <p className="text-sm font-bold text-dun uppercase tracking-widest">Overall Score</p>
                    <h1 className="text-6xl font-black text-isabelline my-2">{metrics.score}</h1>
                    <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-bold uppercase">{metrics.level}</span>
                    <p className="text-sm text-dun mt-4 italic">"{metrics.advice}"</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-2xl border border-white/5">
                    <h3 className="text-xs font-bold text-dun uppercase mb-2">Consistency</h3>
                    <div className="h-2 w-full bg-bg-primary rounded-full overflow-hidden">
                        <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${metrics.journalConsistency}%` }}></div>
                    </div>
                    <p className="text-right text-sm font-bold text-isabelline mt-1">{Math.round(metrics.journalConsistency)}%</p>
                </div>
                <div className="bg-card p-4 rounded-2xl border border-white/5">
                    <h3 className="text-xs font-bold text-dun uppercase mb-2">Finances</h3>
                    <div className="h-2 w-full bg-bg-primary rounded-full overflow-hidden">
                        <div className="h-full bg-green-400 transition-all duration-1000" style={{ width: `${metrics.financialHealth}%` }}></div>
                    </div>
                    <p className="text-right text-sm font-bold text-isabelline mt-1">{Math.round(metrics.financialHealth)}%</p>
                </div>
                <div className="bg-card p-4 rounded-2xl border border-white/5">
                    <h3 className="text-xs font-bold text-dun uppercase mb-2">Habits</h3>
                    <div className="h-2 w-full bg-bg-primary rounded-full overflow-hidden">
                        <div className="h-full bg-pink-400 transition-all duration-1000" style={{ width: `${metrics.habitStreak}%` }}></div>
                    </div>
                    <p className="text-right text-sm font-bold text-isabelline mt-1">{Math.round(metrics.habitStreak)}%</p>
                </div>
                <div className="bg-card p-4 rounded-2xl border border-white/5">
                    <h3 className="text-xs font-bold text-dun uppercase mb-2">Growth</h3>
                    <div className="h-2 w-full bg-bg-primary rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 transition-all duration-1000" style={{ width: `${metrics.learningIndex}%` }}></div>
                    </div>
                    <p className="text-right text-sm font-bold text-isabelline mt-1">{Math.round(metrics.learningIndex)}%</p>
                </div>
            </div>
        </div>
    );
};

const PremiumFinancialCard: React.FC<{ 
    expenses: Expense[];
    currentNet: number;
    currentIncome: number;
    currentExpense: number;
    dailyData: number[];
    dayLabels: string[];
    onAnalyze: () => void;
    isAnalyzing: boolean;
}> = ({ expenses, currentNet, currentIncome, currentExpense, dailyData, dayLabels, onAnalyze, isAnalyzing }) => {
    
    // Calculate Previous Month Data for Comparison
    const comparisonData = useMemo(() => {
        const now = new Date();
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        endOfLastMonth.setHours(23, 59, 59, 999);
        
        const lastMonthExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return d >= startOfLastMonth && d <= endOfLastMonth;
        });

        const lastMonthIncome = lastMonthExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
        const lastMonthExpenseTotal = lastMonthExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
        const lastMonthNet = lastMonthIncome - lastMonthExpenseTotal;

        let percentChange = 0;
        let isNewUser = lastMonthExpenses.length === 0;

        if (!isNewUser) {
            if (lastMonthNet !== 0) {
                percentChange = ((currentNet - lastMonthNet) / Math.abs(lastMonthNet)) * 100;
            } else if (currentNet !== 0) {
                percentChange = 100; 
            }
        }

        return {
            lastMonthNet,
            percentChange: percentChange.toFixed(1),
            hasHistory: !isNewUser
        };
    }, [expenses, currentNet]);

    const expensesByCategory = useMemo(() => {
        const map = new Map<string, number>();
        expenses.filter(e => e.type === 'expense').forEach(e => {
            const cat = e.category || 'Other';
            map.set(cat, (map.get(cat) || 0) + e.amount);
        });
        return Array.from(map.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6); // Top 6
    }, [expenses]);

    const isPositive = currentNet >= 0;
    const isGrowth = parseFloat(comparisonData.percentChange) >= 0;
    const maxVal = Math.max(...dailyData, 1);

    return (
        <div className="space-y-6">
            <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl group select-none h-[360px] flex flex-col border border-white/10 transition-colors duration-500">
                <div className="absolute inset-0 z-0 bg-card" style={{
                    background: 'linear-gradient(135deg, var(--color-card-bg) 0%, var(--color-bg-primary) 100%)'
                }}></div>
                
                <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" style={{
                    background: 'radial-gradient(circle at 50% 0%, var(--color-accent) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                }}></div>
                
                <div className="relative z-10 p-6 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shadow-inner text-accent">
                                <DollarSignIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-isabelline uppercase tracking-wider">Net Balance</p>
                                <p className="text-xs text-dun">Last 7 Days</p>
                            </div>
                        </div>
                        {comparisonData.hasHistory && (
                            <div className={`px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-white/5 ${isGrowth ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                <span className="text-xs font-bold">
                                    {isGrowth ? '↑' : '↓'} {Math.abs(parseFloat(comparisonData.percentChange))}%
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <h1 className={`text-5xl font-brand font-bold tracking-tight drop-shadow-md flex items-baseline gap-1 ${isPositive ? 'text-isabelline' : 'text-red-400'}`}>
                            <span className="text-xl font-sans font-normal text-dun/80 mr-1">TSh</span>
                            {Math.abs(currentNet).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h1>
                        {comparisonData.hasHistory ? (
                            <p className="text-xs text-dun mt-2 font-medium">
                                Compared to TSh {comparisonData.lastMonthNet.toLocaleString()} last month
                            </p>
                        ) : (
                            <p className="text-xs text-accent mt-2 font-medium animate-pulse">Tracking started this month</p>
                        )}
                    </div>

                    <div className="flex-grow relative flex items-end pb-2 gap-1.5">
                        {dailyData.map((val, i) => {
                            const heightPercent = Math.max((val / maxVal) * 70, 8);
                            const delay = i * 0.1;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group/bar">
                                    <div 
                                        className="w-full rounded-t-lg relative overflow-hidden transition-all duration-700 ease-out origin-bottom shadow-lg"
                                        style={{ 
                                            height: `${heightPercent}%`, 
                                            backgroundColor: i % 2 === 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                            opacity: 0.8,
                                            animation: `fade-in-up 0.6s ease-out ${delay}s backwards`
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-dun/60 uppercase tracking-wider">
                                        {dayLabels[i]}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                        <div className="flex gap-6">
                            <div>
                                <span className="block text-[10px] text-dun uppercase font-bold">Income</span>
                                <span className="font-bold text-sm text-green-400">+TSh {currentIncome.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] text-dun uppercase font-bold">Expense</span>
                                <span className="font-bold text-sm text-red-400">-TSh {currentExpense.toLocaleString()}</span>
                            </div>
                        </div>
                        <button onClick={onAnalyze} disabled={isAnalyzing} className="text-xs font-bold text-cafe bg-accent px-4 py-2 rounded-full hover:bg-accent/90 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-1 disabled:opacity-70">
                            {isAnalyzing ? <div className="w-3 h-3 border-2 border-cafe border-t-transparent rounded-full animate-spin"/> : <SparklesIcon className="w-3 h-3"/>}
                            AI Coach
                        </button>
                    </div>
                </div>
            </div>

            {/* Pie Chart Section */}
            {expensesByCategory.length > 0 && (
                <div className="bg-card backdrop-blur-lg p-6 rounded-2xl border border-white/5 animate-fade-in-up">
                    <h2 className="font-semibold text-lg flex items-center gap-2 mb-4 text-isabelline">
                        <PieChartIcon className="w-5 h-5 text-accent"/> Spending Breakdown
                    </h2>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expensesByCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {expensesByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value: number) => `TSh ${value.toLocaleString()}`}
                                    contentStyle={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', borderRadius: '0.75rem', color: 'var(--color-text-primary)' }} 
                                />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '10px'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

const InsightsScreen: React.FC<InsightsScreenProps> = ({ journals, expenses, habits, userData, targetLanguage }) => {
  const [activeTab, setActiveTab] = useState<'financial' | 'performance'>('financial');
  const [isScrolled, setIsScrolled] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const handleScroll = () => {
          if (scrollRef.current) {
              setIsScrolled(scrollRef.current.scrollTop > 30);
          }
      };
      const div = scrollRef.current;
      if (div) div.addEventListener('scroll', handleScroll);
      return () => div?.removeEventListener('scroll', handleScroll);
  }, []);

  const moodData = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return journals
      .filter(j => j.mood && new Date(j.date) >= thirtyDaysAgo)
      .map(j => ({
        date: new Date(j.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: j.mood,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [journals]);
  
  const moodByDayOfWeek = useMemo(() => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const sums = new Array(7).fill(0);
      const counts = new Array(7).fill(0);
      
      journals.forEach(j => {
          if(j.mood) {
              const day = new Date(j.date).getDay();
              sums[day] += j.mood;
              counts[day]++;
          }
      });
      
      return days.map((day, index) => ({
          day,
          avgMood: counts[index] > 0 ? sums[index] / counts[index] : 0
      }));
  }, [journals]);

  const { totalIncome, totalExpense, net, dailySpending, dayLabels } = useMemo(() => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyExpenses = expenses.filter(e => new Date(e.date) >= startOfMonth);
      
      const inc = monthlyExpenses.filter(e => e.type === 'income').reduce((acc, e) => acc + e.amount, 0);
      const exp = monthlyExpenses.filter(e => e.type === 'expense').reduce((acc, e) => acc + e.amount, 0);
      
      const last7Days = Array(7).fill(0);
      const labels = Array(7).fill('');
      
      for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dayStr = d.toLocaleDateString('en-CA');
          
          const dayTotal = expenses
            .filter(e => new Date(e.date).toLocaleDateString('en-CA') === dayStr)
            .reduce((sum, e) => sum + e.amount, 0); 
          
          last7Days[6 - i] = dayTotal;
          labels[6 - i] = d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0); 
      }

      return { totalIncome: inc, totalExpense: exp, net: inc - exp, dailySpending: last7Days, dayLabels: labels };
  }, [expenses]);

  const handleAiAnalysis = async () => {
      setIsAnalyzing(true);
      try {
          const result = await getInsightsSummary(journals.slice(0, 5), expenses, undefined, userData?.name || 'User');
          setAnalysisResult(result.transactionAnalysis);
      } catch (e) {
          setAnalysisResult("Could not generate analysis. Check internet connection.");
      } finally {
          setIsAnalyzing(false);
      }
  };

  const handleDownloadReport = () => {
      const html = generateGeneralReportHtml(journals, expenses, habits, userData);
      exportAsDoc(`Mwijay_General_Report_${new Date().toISOString().split('T')[0]}`, html, 'General Report', userData);
  };

  return (
    <div className="flex flex-col h-full relative bg-bg-primary">
        {analysisResult && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in" onClick={() => setAnalysisResult(null)}>
                <div className="bg-card w-full max-w-md p-6 rounded-3xl border border-white/10 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setAnalysisResult(null)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-isabelline"><XIcon className="w-5 h-5"/></button>
                    <div className="flex items-center gap-2 mb-4 text-accent">
                        <SparklesIcon className="w-6 h-6"/>
                        <h3 className="text-xl font-serif">Financial Health</h3>
                    </div>
                    <div className="prose prose-invert text-sm text-isabelline leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <div dangerouslySetInnerHTML={{ __html: analysisResult }} />
                    </div>
                </div>
            </div>
        )}

        <header 
            className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-in-out px-4 flex items-end border-b ${isScrolled ? 'h-20 pb-3 bg-bg-primary border-white/10 shadow-xl' : 'h-32 pb-2 border-transparent bg-gradient-to-b from-bg-primary/80 to-transparent'}`}
        >
            <div className="w-full relative h-full flex flex-col justify-end text-center">
                <div className={`absolute left-0 right-0 bottom-2 transition-all duration-500 ease-in-out ${isScrolled ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                    <h1 className="text-3xl font-serif text-isabelline">Insights</h1>
                    <p className="text-dun text-sm">Discover patterns in your life.</p>
                </div>
                
                <div className={`absolute left-0 right-0 bottom-3 transition-all duration-500 ease-in-out ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    <span className="text-sm font-bold text-accent uppercase tracking-widest font-brand">Insights</span>
                </div>
            </div>
        </header>

      <div ref={scrollRef} className="flex-grow p-4 pt-36 space-y-6 overflow-y-auto pb-28 no-scrollbar">
        
        <div className="flex justify-center mb-4">
            <div className="bg-card p-1 rounded-full flex gap-1">
                <button onClick={() => setActiveTab('financial')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'financial' ? 'bg-accent text-cafe' : 'text-dun'}`}>Financials</button>
                <button onClick={() => setActiveTab('performance')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'performance' ? 'bg-accent text-cafe' : 'text-dun'}`}>Performance</button>
            </div>
        </div>

        {activeTab === 'performance' ? (
            <PerformanceTab journals={journals} expenses={expenses} habits={habits} />
        ) : (
            <>
                <PremiumFinancialCard 
                    expenses={expenses} 
                    currentNet={net} 
                    currentIncome={totalIncome} 
                    currentExpense={totalExpense} 
                    dailyData={dailySpending}
                    dayLabels={dayLabels}
                    onAnalyze={handleAiAnalysis}
                    isAnalyzing={isAnalyzing}
                />

                <div className="bg-card backdrop-blur-lg p-4 rounded-2xl border border-white/5">
                    <h2 className="font-semibold text-lg flex items-center gap-2 mb-4 text-isabelline"><TrendingUpIcon className="w-5 h-5 text-accent"/> Mood Over Time</h2>
                    {moodData.length > 2 ? (
                        <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={moodData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                            <XAxis dataKey="date" stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} tick={{fill: 'var(--color-text-primary)'}} />
                            <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} tick={{fill: 'var(--color-text-primary)'}} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-border)', borderRadius: '0.75rem', color: 'var(--color-text-primary)' }} />
                            <Line type="monotone" dataKey="mood" stroke="var(--color-accent)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-sm text-dun text-center py-10">Log your mood for a few days to see a trend.</p>
                    )}
                </div>

                <div className="bg-card backdrop-blur-lg p-4 rounded-2xl border border-white/5">
                    <h2 className="font-semibold text-lg flex items-center gap-2 mb-4 text-isabelline"><BarChartIcon className="w-5 h-5 text-accent"/> Mood by Day of Week</h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={moodByDayOfWeek} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                            <XAxis dataKey="day" stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} tick={{fill: 'var(--color-text-primary)'}} />
                            <YAxis domain={[0, 5]} ticks={[1,2,3,4,5]} stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} tick={{fill: 'var(--color-text-primary)'}} />
                            <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-border)', borderRadius: '0.75rem', color: 'var(--color-text-primary)' }} />
                            <Bar dataKey="avgMood" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </>
        )}

        <button onClick={handleDownloadReport} className="w-full bg-card border border-white/10 hover:bg-white/10 text-isabelline py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors">
            <DownloadIcon className="w-5 h-5 text-accent"/>
            <span className="font-semibold">Download General Report (.doc)</span>
        </button>

      </div>
    </div>
  );
};

export default InsightsScreen;
