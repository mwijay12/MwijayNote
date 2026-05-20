
import { useMemo } from 'react';
import { JournalEntry, Expense, Habit } from '../types';

export interface PerformanceMetrics {
    score: number;
    journalConsistency: number; // 0-100
    financialHealth: number; // 0-100
    habitStreak: number; // 0-100
    learningIndex: number; // 0-100
    level: string;
    advice: string;
}

export const usePerformance = (journals: JournalEntry[], expenses: Expense[], habits: Habit[]) => {
    const metrics = useMemo<PerformanceMetrics>(() => {
        const now = new Date();
        
        // 1. Journal Consistency (Last 30 days)
        const last30Days = Array.from({length: 30}, (_, i) => {
            const d = new Date();
            d.setDate(now.getDate() - i);
            return d.toDateString();
        });
        const journalDates = new Set(journals.map(j => new Date(j.date).toDateString()));
        const journalCount = last30Days.filter(d => journalDates.has(d)).length;
        const journalConsistency = Math.min((journalCount / 30) * 100 * 1.5, 100); // 20 days = 100%

        // 2. Financial Health (Savings Rate approximation: (Income - Expense) / Income)
        const thisMonthExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const income = thisMonthExpenses.filter(e => e.type === 'income').reduce((acc, e) => acc + e.amount, 0);
        const expense = thisMonthExpenses.filter(e => e.type === 'expense').reduce((acc, e) => acc + e.amount, 0);
        let financialHealth = 50; // Default average
        if (income > 0) {
            const savingsRate = (income - expense) / income;
            financialHealth = Math.min(Math.max((savingsRate + 0.1) * 100, 0), 100); // 20% savings = good health
        } else if (expense === 0) {
            financialHealth = 50; // Neutral
        } else {
            financialHealth = 20; // Burning cash
        }

        // 3. Habit Streak
        let totalStreakPoints = 0;
        habits.forEach(h => {
            let streak = 0;
            for(let i=0; i<30; i++) {
                const d = new Date();
                d.setDate(now.getDate() - i);
                const key = d.toISOString().split('T')[0];
                if (h.completions[key]) streak++;
                else break;
            }
            totalStreakPoints += streak;
        });
        const habitStreak = Math.min((totalStreakPoints / (habits.length || 1)) * 10, 100); // Avg 10 day streak = 100%

        // 4. Learning Index (Based on diverse tag usage + recent entries)
        const uniqueTags = new Set(journals.flatMap(j => j.tags || []));
        const learningIndex = Math.min(uniqueTags.size * 5 + (journals.length > 0 ? 20 : 0), 100);

        // Weighted Score
        const score = Math.round(
            (journalConsistency * 0.3) + 
            (financialHealth * 0.3) + 
            (habitStreak * 0.25) + 
            (learningIndex * 0.15)
        );

        let level = 'Beginner';
        if (score > 80) level = 'Grandmaster';
        else if (score > 60) level = 'Expert';
        else if (score > 40) level = 'Achiever';
        else if (score > 20) level = 'Apprentice';

        let advice = "Start by journaling daily.";
        if (journalConsistency < 50) advice = "Try to journal more consistently to boost your clarity.";
        else if (financialHealth < 40) advice = "Review your expenses. Your savings rate is a bit low.";
        else if (habitStreak < 30) advice = "Focus on maintaining your daily habits.";
        else advice = "You're doing great! Keep pushing your boundaries.";

        return {
            score,
            journalConsistency,
            financialHealth,
            habitStreak,
            learningIndex,
            level,
            advice
        };
    }, [journals, expenses, habits]);

    return metrics;
};
