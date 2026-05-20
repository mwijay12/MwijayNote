/**
 * useAIRouter Hook
 * High-performance React hook for all AI interactions in Mwijay Note.
 * Exposes active provider tracking, status dashboard metrics, routing logs,
 * thinking states, and error handling with automatic memory context integration.
 */

import { useState, useCallback, useEffect } from 'react';
import { aiRouter, AIProviderState, AIRouterLog, AIResponse } from '../services/aiRouter';
import { Provider } from '../services/aiKeyManager';

interface UseAIRouterReturn {
  currentProvider: string;
  isThinking: boolean;
  providerStatus: AIProviderState[];
  routerLogs: AIRouterLog[];
  error: string | null;
  send: (prompt: string, systemPrompt?: string, context?: any) => Promise<AIResponse | null>;
  resetCooldowns: () => void;
  clearLogs: () => Promise<void>;
  refreshStatus: () => void;
}

export function useAIRouter(): UseAIRouterReturn {
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerStatus, setProviderStatus] = useState<AIProviderState[]>([]);
  const [routerLogs, setRouterLogs] = useState<AIRouterLog[]>([]);

  // Function to refresh state and logs
  const refreshStatus = useCallback(() => {
    setProviderStatus(aiRouter.getStatusDashboard());
    setRouterLogs(aiRouter.getRouterLogs());
  }, []);

  // Initial load
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const send = useCallback(async (prompt: string, systemPrompt?: string, context?: any): Promise<AIResponse | null> => {
    setIsThinking(true);
    setError(null);

    try {
      const response = await aiRouter.call({
        prompt,
        systemPrompt,
        context: context || 'chat',
      });

      refreshStatus();
      return response;
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Routing call failed';
      setError(msg);
      console.error('[useAIRouter] Routing error:', msg);
      refreshStatus();
      return null;
    } finally {
      setIsThinking(false);
    }
  }, [refreshStatus]);

  const resetCooldowns = useCallback(() => {
    aiRouter.resetCooldowns();
    refreshStatus();
  }, [refreshStatus]);

  const clearLogs = useCallback(async () => {
    await aiRouter.clearLogs();
    refreshStatus();
  }, [refreshStatus]);

  const currentProvider = aiRouter.getActiveProvider();

  return {
    currentProvider,
    isThinking,
    providerStatus,
    routerLogs,
    error,
    send,
    resetCooldowns,
    clearLogs,
    refreshStatus,
  };
}
