/**
 * Mwijay Note — n8n Event Dispatcher
 * Sends structured events to the n8n Master Webhook on AWS EC2.
 *
 * All events go to ONE URL: /webhook/mwijay-master
 * n8n internally routes based on the `event` field.
 *
 * AI requests go to: /webhook/mwijay-ai-memory
 * This endpoint returns an AI response directly.
 */

import { triggerN8nWebhook } from './n8nService';
import { buildUserMemory, UserMemory } from './memory';
import { Preferences } from '@capacitor/preferences';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MwijayEvent =
  | 'user_registered'
  | 'new_journal'
  | 'new_expense'
  | 'ai_request'
  | 'generate_pdf'
  | 'weekly_report'
  | 'streak_milestone'
  | 'goal_completed';

export type AiContext = 'coach' | 'journal' | 'finance' | 'flash' | 'format' | 'chat';

interface BasePayload {
  event: MwijayEvent;
  timestamp: string;
  userEmail: string;
  userName: string;
  userId?: string;
  data: Record<string, unknown>;
}

interface AiMemoryPayload {
  userId: string;
  userEmail: string;
  userName: string;
  context: AiContext;
  prompt: string;
  memory: UserMemory;
  timestamp: string;
}

export interface AiMemoryResponse {
  text: string;
  provider: string;
  model: string;
}

// ─── Config Loader ────────────────────────────────────────────────────────────

async function getN8nConfig(): Promise<{ masterUrl: string; aiUrl: string } | null> {
  try {
    const { value } = await Preferences.get({ key: 'mwijay_settings' });
    if (!value) return null;

    const settings = JSON.parse(value);
    const base = settings.automation?.n8nWebhookUrl as string | undefined;
    if (!base) return null;

    // Derive URLs from the base URL the user pastes in Settings
    // Expected: https://n8n.yourdomain.com/webhook/mwijay-sync
    // Master:   https://n8n.yourdomain.com/webhook/mwijay-master
    // AI:       https://n8n.yourdomain.com/webhook/mwijay-ai-memory

    const baseRoot = base.replace(/\/webhook\/[^/]+$/, '');
    return {
      masterUrl: `${baseRoot}/webhook/mwijay-master`,
      aiUrl: `${baseRoot}/webhook/mwijay-ai-memory`,
    };
  } catch {
    return null;
  }
}

// ─── Master Event Sender ──────────────────────────────────────────────────────

async function sendEvent(payload: BasePayload): Promise<boolean> {
  const config = await getN8nConfig();
  if (!config?.masterUrl) return false;

  return triggerN8nWebhook(config.masterUrl, {
    event: payload.event,
    data: payload.data,
    userEmail: payload.userEmail,
    userName: payload.userName,
    timestamp: payload.timestamp,
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Called when a new user registers for the first time.
 * Triggers: Welcome email + Google Sheets log
 */
export async function sendUserRegistered(
  userName: string,
  userEmail: string,
  userId: string
): Promise<void> {
  await sendEvent({
    event: 'user_registered',
    timestamp: new Date().toISOString(),
    userEmail,
    userName,
    userId,
    data: {
      registeredAt: new Date().toISOString(),
      platform: navigator.userAgent.includes('Android') ? 'android' : 'web',
    },
  });
}

/**
 * Called when a journal entry is saved.
 * Triggers: Google Sheets log + mood check (if mood ≤ 2, sends support email)
 */
export async function sendNewJournal(
  userName: string,
  userEmail: string,
  journal: {
    id: string;
    title: string;
    type: string;
    mood?: number;
    wordCount: number;
    tags: string[];
    date: string;
  }
): Promise<void> {
  await sendEvent({
    event: 'new_journal',
    timestamp: new Date().toISOString(),
    userEmail,
    userName,
    data: { journal },
  });
}

/**
 * Called when an expense is saved.
 * Triggers: Google Sheets log + budget warning if budget ≥ 80%/100%
 */
export async function sendNewExpense(
  userName: string,
  userEmail: string,
  expense: {
    id: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    date: string;
  },
  budgetUsagePercent: number
): Promise<void> {
  await sendEvent({
    event: 'new_expense',
    timestamp: new Date().toISOString(),
    userEmail,
    userName,
    data: { expense, budgetUsagePercent },
  });
}

/**
 * Called when user hits a streak milestone (7, 14, 30, 50, 100, 365 days).
 * Triggers: Celebration email + Google Sheets log
 */
export async function sendStreakMilestone(
  userName: string,
  userEmail: string,
  streakDays: number
): Promise<void> {
  const MILESTONES = [7, 14, 30, 50, 100, 365];
  if (!MILESTONES.includes(streakDays)) return;

  await sendEvent({
    event: 'streak_milestone',
    timestamp: new Date().toISOString(),
    userEmail,
    userName,
    data: { streakDays, badge: `${streakDays}_days` },
  });
}

/**
 * Called when a goal is marked completed.
 * Triggers: Achievement email + Google Sheets log
 */
export async function sendGoalCompleted(
  userName: string,
  userEmail: string,
  goal: { title: string; category: string }
): Promise<void> {
  await sendEvent({
    event: 'goal_completed',
    timestamp: new Date().toISOString(),
    userEmail,
    userName,
    data: { goal, completedAt: new Date().toISOString() },
  });
}

/**
 * Called when user manually requests a PDF report.
 * n8n uses PDF.co to generate and emails the link.
 */
export async function sendGeneratePdf(
  userName: string,
  userEmail: string
): Promise<void> {
  // Build full memory for the PDF
  const memory = await buildUserMemory();

  await sendEvent({
    event: 'generate_pdf',
    timestamp: new Date().toISOString(),
    userEmail,
    userName,
    data: { memory },
  });
}

// ─── AI Memory Request ────────────────────────────────────────────────────────

/**
 * Sends a prompt + full user memory to n8n's AI endpoint.
 * n8n runs the AI fallback chain and returns the response.
 * Falls back to local aiRouter if n8n is not configured.
 */
export async function askMwijayAI(
  context: AiContext,
  prompt: string,
  userName: string,
  userEmail: string,
  userId: string
): Promise<AiMemoryResponse> {
  const config = await getN8nConfig();

  const memory = await buildUserMemory();

  // If n8n is configured — use the cloud AI with memory
  if (config?.aiUrl) {
    try {
      const payload: AiMemoryPayload = {
        userId,
        userEmail,
        userName,
        context,
        prompt,
        memory,
        timestamp: new Date().toISOString(),
      };

      const res = await fetch(config.aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) return data as AiMemoryResponse;
      }
    } catch (err) {
      console.warn('[n8nEvents] n8n AI request failed, falling back to local router:', err);
    }
  }

  // Fallback: use local aiRouter (no memory context, but still works)
  const { aiRouter } = await import('./aiRouter');
  const result = await aiRouter.call({
    context,
    prompt,
    systemPrompt: buildSystemPrompt(context, memory, userName),
  });

  return { text: result.text, provider: result.provider, model: result.model };
}

// ─── Context-Aware System Prompts ─────────────────────────────────────────────

function buildSystemPrompt(context: AiContext, memory: UserMemory, userName: string): string {
  const name = userName || 'there';

  const financeSummary = `Income: ${memory.totalIncome} | Expenses: ${memory.totalExpenses} | Net: ${memory.netSavings} | Top category: ${memory.topSpendingCategory}`;
  const journalSummary = `${memory.totalJournals} journals | Streak: ${memory.streakDays} days | Avg mood: ${memory.avgMood}/5 (${memory.moodTrend}) | Top tags: ${memory.topTags.join(', ')}`;
  const recentTitles = memory.recentJournals.slice(0, 3).map(j => j.title).join(', ');

  switch (context) {
    case 'coach':
      return `You are Mwijay, ${name}'s personal AI growth coach. You have FULL access to their data.
User Data: ${journalSummary}. ${financeSummary}.
Best habit: "${memory.bestHabit}" | Active goals: ${memory.activeGoals} | Engagement: ${memory.engagementScore}/100.
Recent journal topics: ${recentTitles || 'none yet'}.
Be concise, warm, data-driven, and SPECIFIC to ${name}'s numbers. Max 3 sentences + 1 action item.
Do NOT give generic advice. Reference their ACTUAL data.`;

    case 'journal':
      return `You are a mindful journaling companion for ${name}.
They have ${memory.totalJournals} journal entries. Recent titles: ${recentTitles}.
Mood trend: ${memory.moodTrend}. Top themes: ${memory.topTags.join(', ')}.
Ask ONE deep, thoughtful question based on their patterns. Keep it personal. No preamble.`;

    case 'finance':
      return `You are a personal finance advisor for ${name}.
This month: Income ${memory.totalIncome} | Expenses ${memory.totalExpenses} | Savings ${memory.netSavings}.
Budget usage: ${memory.budgetUsagePercent}%. Top spending: ${memory.topSpendingCategory}.
Give a concise, actionable financial insight. Use local currency context. No generic Western advice.`;

    case 'flash':
      return `You are a learning assistant helping ${name} study more effectively.
They have ${memory.totalJournals} journal entries showing their learning patterns.
Create clear, memorable flashcard content. Be concise and accurate.`;

    case 'format':
      return `You are a text editor. Your ONLY job is to improve the formatting and readability of the text provided.
Do NOT change the meaning, add commentary, or explain yourself.
Return ONLY the improved text.`;

    case 'chat':
    default:
      return `You are Mwijay, a helpful and friendly AI assistant.
User: ${name} | Streak: ${memory.streakDays} days | Journals: ${memory.totalJournals}.
Be conversational, helpful, and concise. Reference user context when relevant.`;
  }
}
