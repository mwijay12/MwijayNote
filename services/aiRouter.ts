/**
 * Mwijay Note — Prestige AI Router v3
 * Production-grade AI routing engine with health checks, failovers, and context memory.
 * Features:
 *   1. Automatic failover: Gemini Pool → Groq → Cerebras → OpenRouter → n8n → Offline Fallback.
 *   2. Provider health status tracks (healthy, degraded, failed) with recovery timers.
 *   3. Context-aware prepending: Automatically queries IndexedDB user metrics for study habits/moods/Swahili preferences.
 *   4. Unicode-safe base64 encoding (safeEncode) to prevent btoa collapses on non-ASCII characters.
 *   5. Logs persistent routing events in LocalStorage/Preferences for the debug dashboard.
 */

import { GoogleGenAI } from '@google/genai';
import { aiKeyManager, Provider } from './aiKeyManager';
import { cleanAiResponse } from '../utils/textUtils';
import { Preferences } from '@capacitor/preferences';
import { getCompressedMemoryPrefix } from './memory';

// ─── Unicode-Safe Base64 Encoding ─────────────────────────────────────────────

/**
 * Encodes strings into base64 safely without throwing exceptions on Unicode or emoji characters.
 * Prevents btoa collapse issues on window.
 */
export function safeEncode(str: string): string {
  try {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
  } catch (e) {
    console.error("[safeEncode] Failed unicode routine, falling back to legacy escape:", e);
    return btoa(unescape(encodeURIComponent(str)));
  }
}

// ─── Types & Interfaces ───────────────────────────────────────────────────────

export type AIStatus = 'healthy' | 'degraded' | 'failed';

export interface AIProviderState {
  name: Provider | 'n8n' | 'offline';
  status: AIStatus;
  lastFailedAt?: string;
  failCount: number;
  cooldownUntil?: string;
}

export interface AIRouterLog {
  timestamp: string;
  promptLength: number;
  provider: string;
  model: string;
  status: 'success' | 'failed';
  error?: string;
  latencyMs: number;
}

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  preferProvider?: Provider;
  context?: 'journal' | 'finance' | 'flash' | 'coach' | 'format' | 'chat';
  bypassMemory?: boolean; // Skip prepending user memory
}

export interface AIResponse {
  text: string;
  provider: Provider | 'offline' | 'n8n';
  model: string;
  usedFallback: boolean;
  offline: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

const OFFLINE_RESPONSES: Record<string, string[]> = {
  journal: [
    "Write freely — what's weighing on your mind today? (Offline Mode)",
    "Describe one moment from today you want to remember. (Offline Mode)",
    "What are you grateful for right now, even if it's small? (Offline Mode)",
    "What's one thing you'd like to do differently tomorrow? (Offline Mode)",
    "Write about someone who made today better. (Offline Mode)",
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

// ─── Main Router Class ────────────────────────────────────────────────────────

class AIRouter {
  private readonly maxRetries = 4;
  private providerStates: Map<string, AIProviderState> = new Map();
  private routerLogs: AIRouterLog[] = [];

  constructor() {
    this.resetStates();
    this.loadLogs();
  }

  private resetStates() {
    const list: (Provider | 'n8n' | 'offline')[] = ['gemini', 'groq', 'cerebras', 'openrouter', 'n8n', 'offline'];
    list.forEach(p => {
      this.providerStates.set(p, {
        name: p,
        status: 'healthy',
        failCount: 0,
      });
    });
  }

  // ── Public Accessors ────────────────────────────────────────────────────────

  public getStatusDashboard(): AIProviderState[] {
    this.recoverCooledDownProviders();
    return Array.from(this.providerStates.values());
  }

  public getRouterLogs(): AIRouterLog[] {
    return this.routerLogs;
  }

  public async clearLogs(): Promise<void> {
    this.routerLogs = [];
    await Preferences.remove({ key: 'mwijay_ai_router_logs' });
  }

  public resetCooldowns() {
    this.resetStates();
    aiKeyManager.resetAll();
    console.info('[AIRouter] Cooldowns and key health map successfully reset');
  }

  public getActiveProvider(): Provider | 'n8n' | 'offline' {
    this.recoverCooledDownProviders();
    const sorted = ['gemini', 'groq', 'cerebras', 'openrouter', 'n8n'];
    for (const name of sorted) {
      const state = this.providerStates.get(name);
      if (state && state.status === 'healthy') {
        return name as any;
      }
    }
    return 'offline';
  }

  // ── Core Router Call ────────────────────────────────────────────────────────

  async call(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    // 1. Check network connectivity
    if (!navigator.onLine) {
      this.logEvent('offline', 'offline', 'success', startTime, request.prompt.length);
      return this.buildOfflineResponse(request.context);
    }

    // 2. Load context memory and prepends automatically (unless bypassed)
    let finalPrompt = request.prompt;
    if (!request.bypassMemory) {
      const memoryPrefix = await getCompressedMemoryPrefix();
      if (memoryPrefix) {
        finalPrompt = memoryPrefix + request.prompt;
      }
    }

    const modifiedRequest = { ...request, prompt: finalPrompt };

    // 3. Preferred provider routing
    if (request.preferProvider) {
      const state = this.providerStates.get(request.preferProvider);
      if (state && state.status !== 'failed') {
        try {
          const res = await this.dispatchToProvider(request.preferProvider, modifiedRequest);
          this.markSuccess(request.preferProvider);
          this.logEvent(request.preferProvider, res.model, 'success', startTime, finalPrompt.length);
          return res;
        } catch (err: any) {
          console.warn(`[AIRouter] Preferred '${request.preferProvider}' failed, routing normally:`, err.message);
          this.markFailed(request.preferProvider, err.message);
        }
      }
    }

    // 4. Primary Failover Routing Chain
    let attempts = 0;
    while (attempts < this.maxRetries) {
      this.recoverCooledDownProviders();
      const bestKeyInfo = aiKeyManager.getBestKey();
      if (!bestKeyInfo) {
        console.warn('[AIRouter] Key manager reports all keys dead/cooling down');
        break;
      }

      const pState = this.providerStates.get(bestKeyInfo.provider);
      if (pState && pState.status === 'failed') {
        // Skip provider on cooldown
        attempts++;
        continue;
      }

      try {
        const res = await this.dispatchToProvider(bestKeyInfo.provider, modifiedRequest, bestKeyInfo.key);
        this.markSuccess(bestKeyInfo.provider);
        this.logEvent(bestKeyInfo.provider, res.model, 'success', startTime, finalPrompt.length);
        return res;
      } catch (err: any) {
        console.error(`[AIRouter] Provider '${bestKeyInfo.provider}' invocation failed:`, err.message);
        this.markFailed(bestKeyInfo.provider, err.message);
        attempts++;
        await this.sleep(200 * attempts);
      }
    }

    // 5. Cloud Webhook Fallback (n8n Webhook)
    const n8nState = this.providerStates.get('n8n');
    if (n8nState && n8nState.status !== 'failed') {
      const cloudRes = await this.tryCloudFallback(modifiedRequest);
      if (cloudRes) {
        this.markSuccess('n8n');
        this.logEvent('n8n', cloudRes.model, 'success', startTime, finalPrompt.length);
        return {
          ...cloudRes,
          provider: 'n8n'
        };
      } else {
        this.markFailed('n8n', 'n8n cloud webhook rejected/failed');
      }
    }

    // 6. Absolute Offline Fallback
    console.warn('[AIRouter] All provider pipelines collapsed. Delivering offline response.');
    this.logEvent('offline', 'offline', 'failed', startTime, finalPrompt.length, 'All providers failed');
    return this.buildOfflineResponse(request.context, true);
  }

  // ── Health State Management ──────────────────────────────────────────────────

  private markSuccess(provider: string) {
    const state = this.providerStates.get(provider);
    if (state) {
      state.status = 'healthy';
      state.failCount = 0;
      state.cooldownUntil = undefined;
      state.lastFailedAt = undefined;
    }
  }

  private markFailed(provider: string, err?: string) {
    const state = this.providerStates.get(provider);
    if (!state) return;

    state.failCount += 1;
    state.lastFailedAt = new Date().toISOString();

    if (state.failCount >= 3) {
      state.status = 'failed';
      // 90 second cooldown for failed provider
      const cooldown = new Date();
      cooldown.setSeconds(cooldown.getSeconds() + 90);
      state.cooldownUntil = cooldown.toISOString();
      console.warn(`[AIRouter] Provider '${provider}' enters deep cooldown for 90s due to failure: ${err}`);
    } else {
      state.status = 'degraded';
    }
  }

  private recoverCooledDownProviders() {
    const now = new Date();
    this.providerStates.forEach((state) => {
      if (state.status === 'failed' && state.cooldownUntil) {
        const cooldownTime = new Date(state.cooldownUntil);
        if (now >= cooldownTime) {
          state.status = 'healthy';
          state.failCount = 0;
          state.cooldownUntil = undefined;
          console.info(`[AIRouter] Provider '${state.name}' has cooled down and is restored to healthy`);
        }
      }
    });
  }

  public async healthCheck(provider: Provider | 'n8n'): Promise<boolean> {
    try {
      console.info(`[AIRouter] Running active health check on '${provider}'...`);
      if (provider === 'n8n') {
        const res = await fetch('https://httpbin.org/get', { method: 'GET', timeout: 5000 } as any);
        return res.ok;
      }

      const key = aiKeyManager.getKeyForProvider(provider);
      if (!key) return false;

      const dummyReq: AIRequest = { prompt: 'ping', maxTokens: 5, bypassMemory: true };
      const testResponse = await this.dispatchToProvider(provider, dummyReq, key);
      return !!testResponse.text;
    } catch (e) {
      console.warn(`[AIRouter] Active health check failed for '${provider}':`, e);
      return false;
    }
  }

  // ── Dispatchers ──────────────────────────────────────────────────────────────

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

  private async callGemini(request: AIRequest, overrideKey?: string): Promise<AIResponse> {
    const key = overrideKey ?? aiKeyManager.getKeyForProvider('gemini');
    if (!key) throw new Error('No Gemini keys available');

    const model = request.context === 'coach' ? GEMINI_MODELS.heavy : GEMINI_MODELS.fast;

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
  }

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
      throw new Error(`Groq returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const text = cleanAiResponse(data.choices?.[0]?.message?.content ?? '');
    aiKeyManager.reportSuccess(key);
    return { text, provider: 'groq', model, usedFallback: false, offline: false };
  }

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
      throw new Error(`Cerebras returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const text = cleanAiResponse(data.choices?.[0]?.message?.content ?? '');
    aiKeyManager.reportSuccess(key);
    return { text, provider: 'cerebras', model: CEREBRAS_MODEL, usedFallback: false, offline: false };
  }

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
      throw new Error(`OpenRouter returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const text = cleanAiResponse(data.choices?.[0]?.message?.content ?? '');
    aiKeyManager.reportSuccess(key);
    return { text, provider: 'openrouter', model, usedFallback: false, offline: false };
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

      console.info(`[AIRouter] Initiating cloud failover webhook: ${cloudUrl}`);

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
            console.info('[AIRouter] Cloud webhook failover call succeeded!');
            return {
              text: cleanAiResponse(text),
              provider: 'n8n',
              model: data.model || 'n8n-premium-fallback',
              usedFallback: true,
              offline: false
            };
          }
        }
      }
    } catch (err) {
      console.warn('[AIRouter] Cloud webhook failover call failed:', err);
    }
    return null;
  }

  // ── Logging & Helpers ────────────────────────────────────────────────────────

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

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async loadLogs() {
    try {
      const { value } = await Preferences.get({ key: 'mwijay_ai_router_logs' });
      if (value) {
        this.routerLogs = JSON.parse(value);
      }
    } catch (e) {
      this.routerLogs = [];
    }
  }

  private async logEvent(
    provider: string,
    model: string,
    status: 'success' | 'failed',
    startTime: number,
    promptLen: number,
    error?: string
  ) {
    const latencyMs = Date.now() - startTime;
    const logItem: AIRouterLog = {
      timestamp: new Date().toISOString(),
      promptLength: promptLen,
      provider,
      model,
      status,
      error,
      latencyMs,
    };

    // Keep last 50 routing events
    this.routerLogs = [logItem, ...this.routerLogs].slice(0, 50);

    try {
      await Preferences.set({
        key: 'mwijay_ai_router_logs',
        value: JSON.stringify(this.routerLogs),
      });
    } catch (e) {
      // Non-blocking fallback
    }
  }
}

export const aiRouter = new AIRouter();
