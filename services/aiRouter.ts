/**
 * Mwijay Note — AI Router v2
 * Single entry point for ALL AI calls.
 * Priority: Gemini Pool → Groq → Cerebras → OpenRouter → Offline Fallback
 * Handles key exhaustion, rate limits, provider outages, and offline mode.
 */

import { GoogleGenAI } from '@google/genai';
import { aiKeyManager, Provider } from './aiKeyManager';
import { cleanAiResponse } from '../utils/textUtils';
import { Preferences } from '@capacitor/preferences';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  preferProvider?: Provider;
  context?: 'journal' | 'finance' | 'flash' | 'coach' | 'format' | 'chat';
}

export interface AIResponse {
  text: string;
  provider: Provider | 'offline';
  model: string;
  usedFallback: boolean;
  offline: boolean;
}

// ─── Model Selection ──────────────────────────────────────────────────────────

const GEMINI_MODELS = {
  fast: 'gemini-2.0-flash',
  balanced: 'gemini-1.5-flash',
  heavy: 'gemma-3-27b-it',
};

const GROQ_MODELS = {
  fast: 'llama-3.1-8b-instant',
  balanced: 'llama-3.3-70b-versatile',
};

const CEREBRAS_MODEL = 'llama-4-scout-17b-16e-instruct';

const OPENROUTER_MODELS = {
  default: 'google/gemini-2.0-flash-exp:free',
  fallback: 'mistralai/mistral-7b-instruct:free',
};

// ─── Offline Responses ────────────────────────────────────────────────────────

const OFFLINE_RESPONSES: Record<string, string[]> = {
  journal: [
    "Write freely — what's weighing on your mind today?",
    "Describe one moment from today you want to remember.",
    "What are you grateful for right now, even if it's small?",
    "What's one thing you'd like to do differently tomorrow?",
    "Write about someone who made today better.",
  ],
  finance: [
    'Offline mode: Track your expense manually. Note the category and date.',
    'No connection. Add your transaction and it will sync when back online.',
  ],
  flash: ['Review your existing flashcards to reinforce memory while offline.'],
  coach: [
    "You're offline right now, but your data is safe. Check back for AI insights when connected.",
  ],
  format: [''],
  chat: [
    "I'm offline right now. Your messages are saved locally.",
    '📡 No connection detected. I\'ll be ready when you\'re back online!',
  ],
  default: ["I'm offline right now. Your work is saved locally and syncs when you reconnect."],
};

function getOfflineText(context?: string): string {
  const key = context ?? 'default';
  const pool = OFFLINE_RESPONSES[key] ?? OFFLINE_RESPONSES.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Main Router ──────────────────────────────────────────────────────────────

class AIRouter {
  private readonly maxRetries = 4;

  async call(request: AIRequest): Promise<AIResponse> {
    if (!navigator.onLine) {
      return this.buildOfflineResponse(request.context);
    }

    // If a provider is explicitly preferred, try it first before normal routing
    if (request.preferProvider) {
      try {
        return await this.dispatchToProvider(request.preferProvider, request);
      } catch {
        console.warn(`[AIRouter] Preferred provider '${request.preferProvider}' failed, routing normally`);
      }
    }

    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < this.maxRetries) {
      const best = aiKeyManager.getBestKey();

      if (!best) {
        console.error('[AIRouter] All providers exhausted — triggering cloud fallback check');
        break;
      }

      try {
        return await this.dispatchToProvider(best.provider, request, best.key);
      } catch (err: unknown) {
        lastError = err as Error;
        attempts++;
        // Exponential back-off: 300ms, 600ms, 900ms...
        await this.sleep(300 * attempts);
      }
    }

    // Try n8n premium cloud active fallback
    if (navigator.onLine) {
      const cloudRes = await this.tryCloudFallback(request);
      if (cloudRes) return cloudRes;
    }

    console.warn('[AIRouter] All attempts failed, using offline fallback.', lastError?.message);
    return this.buildOfflineResponse(request.context, true);
  }

  private async tryCloudFallback(request: AIRequest): Promise<AIResponse | null> {
    try {
      const { value } = await Preferences.get({ key: 'mwijay_settings' });
      if (!value) return null;

      const settings = JSON.parse(value);
      const base = settings.automation?.n8nWebhookUrl as string | undefined;
      if (!base) return null;

      const baseRoot = base.replace(/\/webhook\/[^/]+$/, '');
      const cloudUrl = `${baseRoot}/webhook/mwijay-master`;

      console.info(`[AIRouter] Attempting premium cloud fallback to n8n: ${cloudUrl}`);

      const payload = {
        event: 'ai_request',
        data: {
          prompt: request.prompt,
          systemPrompt: request.systemPrompt,
          context: request.context || 'chat',
          maxTokens: request.maxTokens,
          temperature: request.temperature
        },
        userEmail: settings.userEmail || 'mwijaydavie@gmail.com',
        userName: settings.userName || 'Mwijay User',
        timestamp: new Date().toISOString()
      };

      const res = await fetch(cloudUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          const text = data.text || data.output || (typeof data.response === 'string' ? data.response : null);
          if (text) {
            console.info('[AIRouter] Cloud webhook fallback succeeded!');
            return {
              text: cleanAiResponse(text),
              provider: 'openrouter',
              model: data.model || 'n8n-premium-fallback',
              usedFallback: true,
              offline: false
            };
          }
        }
      }
    } catch (err) {
      console.warn('[AIRouter] Cloud webhook fallback failed:', err);
    }
    return null;
  }

  // ── Dispatch ─────────────────────────────────────────────────────────────

  private async dispatchToProvider(
    provider: Provider,
    request: AIRequest,
    overrideKey?: string
  ): Promise<AIResponse> {
    switch (provider) {
      case 'gemini':   return this.callGemini(request, overrideKey);
      case 'groq':     return this.callGroq(request, overrideKey);
      case 'cerebras': return this.callCerebras(request, overrideKey);
      case 'openrouter': return this.callOpenRouter(request, overrideKey);
    }
  }

  // ── Gemini ───────────────────────────────────────────────────────────────

  private async callGemini(request: AIRequest, overrideKey?: string): Promise<AIResponse> {
    const key = overrideKey ?? aiKeyManager.getKeyForProvider('gemini');
    if (!key) throw new Error('No Gemini keys available');

    const model = request.context === 'coach' ? GEMINI_MODELS.heavy : GEMINI_MODELS.fast;

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const fullPrompt = request.systemPrompt
        ? `${request.systemPrompt}\n\n${request.prompt}`
        : request.prompt;

      const result = await ai.models.generateContent({
        model,
        contents: fullPrompt,
        config: {
          maxOutputTokens: request.maxTokens ?? 1024,
          temperature: request.temperature ?? 0.7,
        },
      });

      const text = cleanAiResponse(result.text ?? '');
      aiKeyManager.reportSuccess(key);
      return { text, provider: 'gemini', model, usedFallback: false, offline: false };
    } catch (err: unknown) {
      aiKeyManager.reportFailure(key, this.extractErrorCode(err));
      throw err;
    }
  }

  // ── Groq ─────────────────────────────────────────────────────────────────

  private async callGroq(request: AIRequest, overrideKey?: string): Promise<AIResponse> {
    const key = overrideKey ?? aiKeyManager.getKeyForProvider('groq');
    if (!key) throw new Error('No Groq keys available');

    const model = request.context === 'coach' ? GROQ_MODELS.balanced : GROQ_MODELS.fast;
    const messages = this.buildMessages(request);

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, max_tokens: request.maxTokens ?? 1024, temperature: request.temperature ?? 0.7 }),
    });

    if (!res.ok) {
      aiKeyManager.reportFailure(key, res.status);
      throw new Error(`Groq ${res.status}`);
    }

    const data = await res.json();
    const text = cleanAiResponse(data.choices?.[0]?.message?.content ?? '');
    aiKeyManager.reportSuccess(key);
    return { text, provider: 'groq', model, usedFallback: false, offline: false };
  }

  // ── Cerebras ──────────────────────────────────────────────────────────────

  private async callCerebras(request: AIRequest, overrideKey?: string): Promise<AIResponse> {
    const key = overrideKey ?? aiKeyManager.getKeyForProvider('cerebras');
    if (!key) throw new Error('No Cerebras keys available');

    const messages = this.buildMessages(request);

    const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: CEREBRAS_MODEL, messages, max_tokens: request.maxTokens ?? 1024, temperature: request.temperature ?? 0.7 }),
    });

    if (!res.ok) {
      aiKeyManager.reportFailure(key, res.status);
      throw new Error(`Cerebras ${res.status}`);
    }

    const data = await res.json();
    const text = cleanAiResponse(data.choices?.[0]?.message?.content ?? '');
    aiKeyManager.reportSuccess(key);
    return { text, provider: 'cerebras', model: CEREBRAS_MODEL, usedFallback: false, offline: false };
  }

  // ── OpenRouter ───────────────────────────────────────────────────────────

  private async callOpenRouter(request: AIRequest, overrideKey?: string): Promise<AIResponse> {
    const key = overrideKey ?? aiKeyManager.getKeyForProvider('openrouter');
    if (!key) throw new Error('No OpenRouter keys available');

    const model = OPENROUTER_MODELS.default;
    const messages = this.buildMessages(request);

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mwijay.app',
        'X-Title': 'Mwijay Note',
      },
      body: JSON.stringify({ model, messages, max_tokens: request.maxTokens ?? 1024, temperature: request.temperature ?? 0.7 }),
    });

    if (!res.ok) {
      aiKeyManager.reportFailure(key, res.status);
      throw new Error(`OpenRouter ${res.status}`);
    }

    const data = await res.json();
    const text = cleanAiResponse(data.choices?.[0]?.message?.content ?? '');
    aiKeyManager.reportSuccess(key);
    return { text, provider: 'openrouter', model, usedFallback: false, offline: false };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private buildMessages(request: AIRequest) {
    return [
      ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
      { role: 'user', content: request.prompt },
    ];
  }

  private buildOfflineResponse(context?: string, wasFailure = false): AIResponse {
    return {
      text: getOfflineText(context),
      provider: 'offline',
      model: 'offline',
      usedFallback: wasFailure,
      offline: true,
    };
  }

  private extractErrorCode(err: unknown): number | undefined {
    if (typeof err === 'object' && err !== null) {
      if ('status' in err) return (err as { status: number }).status;
      if ('code' in err) return (err as { code: number }).code;
    }
    return undefined;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const aiRouter = new AIRouter();
