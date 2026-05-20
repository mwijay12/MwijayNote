/**
 * useAI — React hook for all AI calls in Mwijay Note
 * Drop-in replacement for all scattered AI calls across the app.
 * Exposes loading state, provider status, and the response object.
 */

import { useState, useCallback } from 'react';
import { aiRouter, AIRequest, AIResponse } from '../services/aiRouter';
import { aiKeyManager } from '../services/aiKeyManager';

interface UseAIReturn {
  loading: boolean;
  response: AIResponse | null;
  error: string | null;
  call: (request: AIRequest) => Promise<AIResponse | null>;
  reset: () => void;
  providerStatus: ReturnType<typeof aiKeyManager.getStatus>;
}

export function useAI(): UseAIReturn {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(async (request: AIRequest): Promise<AIResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await aiRouter.call(request);
      setResponse(result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI call failed';
      setError(msg);
      console.error('[useAI]', msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  return {
    loading,
    response,
    error,
    call,
    reset,
    providerStatus: aiKeyManager.getStatus(),
  };
}
