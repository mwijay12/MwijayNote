/**
 * Mwijay Note — AI Key Manager v2
 * Intelligent key rotation with health tracking, cooldowns, and auto-recovery.
 * Persists state to localStorage so dead keys survive page refreshes.
 */

export type Provider = 'gemini' | 'groq' | 'openrouter' | 'cerebras';

interface KeyHealth {
  key: string;
  provider: Provider;
  isAlive: boolean;
  failCount: number;
  lastFailedAt: number | null;
  cooldownMs: number;
  usageCount: number;
  lastUsedAt: number | null;
}

interface ProviderConfig {
  name: Provider;
  keys: string[];
  cooldownMs: number;
  maxFails: number;
  priority: number; // Lower = tried first
}

// ─── Configuration ────────────────────────────────────────────────────────────

const PROVIDER_CONFIGS: ProviderConfig[] = [
  {
    name: 'gemini',
    keys: [
      'AIzaSyChoQSjIelaNNgnIZrpfhugSt9_On-kuzQ',
      'AIzaSyA7WFeDV_aK--xVtbXclDkr2q1EQ6TecCc',
      'AIzaSyAZnBentKVIGKDyWtQ41dwIGeJEfiFmItY',
      'AIzaSyDM8zZLuG2AvIxQGL1Twoiw2iWiX51wMpw',
      'AIzaSyBRqaSPUyXfb68sG2GLXfbQpZBg-EQeKEQ',
      'AIzaSyBNfTqY6CjqliFLBM4GssDre1xyt71_sCY',
      'AIzaSyDeGJlwd6zKc1F90HsZweGZk7M-CaA8Ql4',
      'AIzaSyBt4L_Garwq0VC6oDergxc16T7hSEElC0Q',
    ],
    cooldownMs: 60_000,
    maxFails: 3,
    priority: 1,
  },
  {
    name: 'groq',
    keys: [
      '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',
      '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',
    ],
    cooldownMs: 30_000,
    maxFails: 2,
    priority: 2,
  },
  {
    name: 'cerebras',
    keys: ['csk-94fn6pwk2r8kyw8fjptj2r6pwpjw9ke8r9kme26n8rje59tf'],
    cooldownMs: 45_000,
    maxFails: 2,
    priority: 3,
  },
  {
    name: 'openrouter',
    keys: [
      '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',
      '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',
    ],
    cooldownMs: 60_000,
    maxFails: 2,
    priority: 4,
  },
];

const STORAGE_KEY = 'mwijay_ai_key_health';

// ─── Key Health Manager Class ─────────────────────────────────────────────────

class AIKeyManager {
  private healthMap: Map<string, KeyHealth> = new Map();
  private initialized = false;

  init(): void {
    if (this.initialized) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: KeyHealth[] = JSON.parse(saved);
        parsed.forEach(h => this.healthMap.set(h.key, h));
      }
    } catch {
      // Fresh start if corrupted
    }

    for (const config of PROVIDER_CONFIGS) {
      for (const key of config.keys) {
        if (!this.healthMap.has(key)) {
          this.healthMap.set(key, {
            key,
            provider: config.name,
            isAlive: true,
            failCount: 0,
            lastFailedAt: null,
            cooldownMs: config.cooldownMs,
            usageCount: 0,
            lastUsedAt: null,
          });
        }
      }
    }

    this.initialized = true;
    this.recoverCooledDownKeys();
  }

  getBestKey(): { key: string; provider: Provider } | null {
    this.init();
    this.recoverCooledDownKeys();

    const sortedProviders = [...PROVIDER_CONFIGS].sort((a, b) => a.priority - b.priority);

    for (const config of sortedProviders) {
      const aliveKeys = config.keys
        .map(k => this.healthMap.get(k)!)
        .filter(h => h && h.isAlive)
        .sort((a, b) => (a.usageCount ?? 0) - (b.usageCount ?? 0));

      if (aliveKeys.length > 0) {
        return { key: aliveKeys[0].key, provider: aliveKeys[0].provider };
      }
    }

    return null;
  }

  getKeyForProvider(provider: Provider): string | null {
    this.init();
    this.recoverCooledDownKeys();

    const config = PROVIDER_CONFIGS.find(c => c.name === provider);
    if (!config) return null;

    const aliveKeys = config.keys
      .map(k => this.healthMap.get(k)!)
      .filter(h => h && h.isAlive)
      .sort((a, b) => (a.usageCount ?? 0) - (b.usageCount ?? 0));

    return aliveKeys[0]?.key ?? null;
  }

  reportSuccess(key: string): void {
    const health = this.healthMap.get(key);
    if (!health) return;
    health.isAlive = true;
    health.failCount = 0;
    health.usageCount += 1;
    health.lastUsedAt = Date.now();
    this.persist();
  }

  reportFailure(key: string, errorCode?: number): void {
    const health = this.healthMap.get(key);
    if (!health) return;

    const config = PROVIDER_CONFIGS.find(c => c.name === health.provider)!;
    health.failCount += 1;
    health.lastFailedAt = Date.now();

    if (errorCode === 429) {
      health.cooldownMs = 30_000;
    }

    if (errorCode === 401 || errorCode === 403) {
      health.isAlive = false;
      health.failCount = 999;
      console.warn(`[AIKeyManager] Key permanently dead (${errorCode}): ${key.slice(0, 14)}...`);
    } else if (health.failCount >= config.maxFails) {
      health.isAlive = false;
      console.warn(`[AIKeyManager] Key on cooldown after ${health.failCount} fails: ${key.slice(0, 14)}...`);
    }

    this.persist();
  }

  private recoverCooledDownKeys(): void {
    const now = Date.now();
    for (const [, health] of this.healthMap) {
      if (
        !health.isAlive &&
        health.failCount < 999 &&
        health.lastFailedAt !== null &&
        now - health.lastFailedAt >= health.cooldownMs
      ) {
        health.isAlive = true;
        health.failCount = 0;
        console.info(`[AIKeyManager] Key recovered: ${health.provider} ${health.key.slice(0, 14)}...`);
      }
    }
  }

  getStatus(): Record<Provider, { alive: number; dead: number; total: number }> {
    this.init();
    this.recoverCooledDownKeys();
    const result = {} as Record<Provider, { alive: number; dead: number; total: number }>;
    for (const config of PROVIDER_CONFIGS) {
      const keys = config.keys.map(k => this.healthMap.get(k)!).filter(Boolean);
      result[config.name] = {
        alive: keys.filter(k => k.isAlive).length,
        dead: keys.filter(k => !k.isAlive).length,
        total: keys.length,
      };
    }
    return result;
  }

  resetAll(): void {
    this.healthMap.clear();
    localStorage.removeItem(STORAGE_KEY);
    this.initialized = false;
    this.init();
    console.info('[AIKeyManager] All keys reset to healthy state');
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.healthMap.values())));
    } catch {
      // Storage full — not critical
    }
  }
}

export const aiKeyManager = new AIKeyManager();
