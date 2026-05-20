
import { useState, useEffect, useCallback } from 'react';
import { CodeSnippet } from '../types';
import { db } from '../utils/db';

export const useCodeSnippets = () => {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);

  useEffect(() => {
    const load = async () => {
        try {
            const data = await db.getAll('codeSnippets');
            setSnippets(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            console.error('Failed to load code snippets from DB', error);
        }
    };
    load();
  }, []);

  const addSnippet = useCallback(async (snippet: Omit<CodeSnippet, 'id' | 'createdAt'>) => {
    const newSnippet: CodeSnippet = {
      ...snippet,
      id: new Date().getTime().toString(),
      createdAt: new Date().toISOString(),
    };
    await db.add('codeSnippets', newSnippet);
    setSnippets(prev => [newSnippet, ...prev]);
  }, []);

  const updateSnippet = useCallback(async (updatedSnippet: CodeSnippet) => {
    await db.put('codeSnippets', updatedSnippet);
    setSnippets(prev => prev.map((s) => s.id === updatedSnippet.id ? updatedSnippet : s));
  }, []);

  const deleteSnippet = useCallback(async (id: string) => {
    await db.delete('codeSnippets', id);
    setSnippets(prev => prev.filter(s => s.id !== id));
  }, []);

  return { snippets, addSnippet, updateSnippet, deleteSnippet };
};
