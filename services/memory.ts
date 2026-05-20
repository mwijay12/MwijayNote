/**
 * Mwijay Note — User Memory Builder
 * Reads from local IndexedDB and builds a rich context object
 * that n8n and the AI router use to give personalized responses.
 *
 * Usage:
 *   const memory = await buildUserMemory(userId);
 *   // Pass to n8nEvents.sendAiRequest(...)
 */

import { db } from '../utils/db';
import { JournalEntry, Expense, Habit, Goal } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JournalMemory {
  id: string;
  title: string;
  type: string;
  mood: number | undefined;
  tags: string[];
  wordCount: number;
  date: string;
}

export interface ExpenseMemory {
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
}

export interface HabitMemory {
  name: string;
  icon: string;
  streak: number;
  completedDays: number;
  completionRate: number; // 0-100
}

export interface GoalMemory {
  title: string;
  category: string;
  status: string;
  milestonesDone: number;
  milestonesTotal: number;
}

export interface UserMemory {
  // === Journals ===
  recentJournals: JournalMemory[];
  totalJournals: number;
  avgMood: number;
  moodTrend: 'improving' | 'declining' | 'stable';
  topTags: string[];
  streakDays: number;
  mostUsedJournalType: string;

  // === Finances ===
  recentExpenses: ExpenseMemory[];
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  topSpendingCategory: string;
  budgetUsagePercent: number; // 0-100

  // === Habits ===
  habits: HabitMemory[];
  bestHabit: string;
  worstHabit: string;

  // === Goals ===
  goals: GoalMemory[];
  completedGoals: number;
  activeGoals: number;

  // === Computed ===
  engagementScore: number; // 0-100, how active the user is
  generatedAt: string;
}

// ─── Streak Calculation ───────────────────────────────────────────────────────

function calculateStreak(journals: JournalEntry[]): number {
  if (journals.length === 0) return 0;

  const dates = [...new Set(
    journals.map(j => j.date.split('T')[0])
  )].sort((a, b) => b.localeCompare(a)); // newest first

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];

    if (dates[i] === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// ─── Tag Extraction ───────────────────────────────────────────────────────────

function getTopTags(journals: JournalEntry[], limit = 5): string[] {
  const tagCount: Record<string, number> = {};
  journals.forEach(j => {
    (j.tags ?? []).forEach(tag => {
      tagCount[tag] = (tagCount[tag] ?? 0) + 1;
    });
  });
  return Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

// ─── Mood Trend ───────────────────────────────────────────────────────────────

function getMoodTrend(journals: JournalEntry[]): 'improving' | 'declining' | 'stable' {
  const moodEntries = journals
    .filter(j => j.mood !== undefined)
    .slice(0, 14) // Last 14 entries
    .map(j => j.mood!);

  if (moodEntries.length < 4) return 'stable';

  const half = Math.floor(moodEntries.length / 2);
  const recentAvg = moodEntries.slice(0, half).reduce((s, m) => s + m, 0) / half;
  const olderAvg = moodEntries.slice(half).reduce((s, m) => s + m, 0) / half;

  const delta = recentAvg - olderAvg;
  if (delta >= 0.4) return 'improving';
  if (delta <= -0.4) return 'declining';
  return 'stable';
}

// ─── Habit Analysis ───────────────────────────────────────────────────────────

function analyzeHabit(habit: Habit): HabitMemory {
  const completions = habit.completions ?? {};
  const completedDays = Object.values(completions).filter(Boolean).length;

  // Rate based on last 30 days
  const totalDays = Math.min(
    30,
    Math.max(1, Math.ceil(
      (Date.now() - new Date(Object.keys(completions)[0] ?? new Date()).getTime()) / 86400000
    ))
  );
  const completionRate = Math.round((completedDays / totalDays) * 100);

  // Simple streak
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (completions[key]) streak++;
    else break;
  }

  return {
    name: habit.name,
    icon: habit.icon,
    streak,
    completedDays,
    completionRate,
  };
}

// ─── Main Builder ─────────────────────────────────────────────────────────────

export async function buildUserMemory(): Promise<UserMemory> {
  // Load all data from IndexedDB in parallel
  const [journals, expenses, habits, goals] = await Promise.all([
    db.getAll('journals'),
    db.getAll('expenses'),
    db.getAll('habits'),
    db.getAll('goals'),
  ]);

  const now = new Date();

  // ── Journals ───────────────────────────────────────────────────────────────

  const sortedJournals = [...journals].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const moodEntries = sortedJournals.filter(j => j.mood !== undefined);
  const avgMood = moodEntries.length
    ? parseFloat(
        (moodEntries.reduce((s, j) => s + j.mood!, 0) / moodEntries.length).toFixed(2)
      )
    : 0;

  const typeCount: Record<string, number> = {};
  sortedJournals.forEach(j => {
    typeCount[j.type] = (typeCount[j.type] ?? 0) + 1;
  });
  const mostUsedJournalType = Object.entries(typeCount)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Gratitude Journal';

  const recentJournals: JournalMemory[] = sortedJournals.slice(0, 10).map(j => ({
    id: j.id,
    title: j.title,
    type: j.type,
    mood: j.mood,
    tags: j.tags ?? [],
    wordCount: j.content?.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length ?? 0,
    date: j.date,
  }));

  // ── Finances ───────────────────────────────────────────────────────────────

  // Only look at current month
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthExpenses = expenses.filter(e => e.date?.startsWith(thisMonth));

  const totalIncome = monthExpenses
    .filter(e => e.type === 'income')
    .reduce((s, e) => s + (e.amount ?? 0), 0);
  const totalExpenses = monthExpenses
    .filter(e => e.type === 'expense')
    .reduce((s, e) => s + (e.amount ?? 0), 0);
  const netSavings = totalIncome - totalExpenses;

  const catSpend: Record<string, number> = {};
  monthExpenses.filter(e => e.type === 'expense').forEach(e => {
    catSpend[e.category ?? 'Other'] = (catSpend[e.category ?? 'Other'] ?? 0) + (e.amount ?? 0);
  });
  const topSpendingCategory = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';
  const budgetUsagePercent = totalIncome > 0
    ? Math.min(100, Math.round((totalExpenses / totalIncome) * 100))
    : 0;

  const recentExpenses: ExpenseMemory[] = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
    .map(e => ({
      amount: e.amount,
      category: e.category ?? 'Other',
      type: e.type,
      date: e.date,
    }));

  // ── Habits ─────────────────────────────────────────────────────────────────

  const analyzedHabits = habits.map(analyzeHabit);
  const sortedByRate = [...analyzedHabits].sort((a, b) => b.completionRate - a.completionRate);
  const bestHabit = sortedByRate[0]?.name ?? '';
  const worstHabit = sortedByRate[sortedByRate.length - 1]?.name ?? '';

  // ── Goals ──────────────────────────────────────────────────────────────────

  const goalMemories: GoalMemory[] = goals.map(g => ({
    title: g.name,
    category: g.category,
    status: g.status ?? 'In Progress',
    milestonesDone: (g.milestones ?? []).filter(m => m.completed).length,
    milestonesTotal: (g.milestones ?? []).length,
  }));
  const completedGoals = goals.filter(g => g.status === 'Completed').length;
  const activeGoals = goals.filter(g => g.status !== 'Completed').length;

  // ── Engagement Score ───────────────────────────────────────────────────────
  // Based on: streak (40%), habit completion (30%), journal count (30%)

  const streakDays = calculateStreak(sortedJournals);
  const avgHabitRate = analyzedHabits.length
    ? analyzedHabits.reduce((s, h) => s + h.completionRate, 0) / analyzedHabits.length
    : 0;
  const journalScore = Math.min(100, (journals.length / 10) * 100);
  const engagementScore = Math.round(
    streakDays * 0.4 * 3 + avgHabitRate * 0.3 + journalScore * 0.3
  );

  return {
    recentJournals,
    totalJournals: journals.length,
    avgMood,
    moodTrend: getMoodTrend(sortedJournals),
    topTags: getTopTags(journals),
    streakDays,
    mostUsedJournalType,
    recentExpenses,
    totalIncome,
    totalExpenses,
    netSavings,
    topSpendingCategory,
    budgetUsagePercent,
    habits: analyzedHabits,
    bestHabit,
    worstHabit,
    goals: goalMemories,
    completedGoals,
    activeGoals,
    engagementScore: Math.min(100, engagementScore),
    generatedAt: new Date().toISOString(),
  };
}
