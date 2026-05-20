
import { useState, useEffect, useCallback } from 'react';
import { CustomTemplate } from '../types';
import { db } from '../utils/db';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);

  useEffect(() => {
    const load = async () => {
        try {
            const data = await db.getAll('templates');
            setTemplates(data);
        } catch (error) {
            console.error('Failed to load templates from DB', error);
        }
    };
    load();
  }, []);

  const addTemplate = useCallback(async (template: Omit<CustomTemplate, 'id'>) => {
    const newTemplate: CustomTemplate = {
      ...template,
      id: new Date().getTime().toString(),
    };
    await db.add('templates', newTemplate);
    setTemplates(prev => [...prev, newTemplate]);
  }, []);

  const updateTemplate = useCallback(async (updatedTemplate: CustomTemplate) => {
    await db.put('templates', updatedTemplate);
    setTemplates(prev => prev.map((t) => t.id === updatedTemplate.id ? updatedTemplate : t));
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    await db.delete('templates', id);
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  return { templates, addTemplate, updateTemplate, deleteTemplate };
};
