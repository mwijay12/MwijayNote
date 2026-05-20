
import { useState, useEffect, useCallback } from 'react';
import { Exam } from '../types';

/**
 * Custom Hook: useExams
 * ---------------------
 * This hook manages the state of exams for the application.
 * It demonstrates the "Container/Presentation" pattern where logic (here) is separated from UI.
 */
export const useExams = () => {
  // useState: React hook to keep track of the exams array.
  // We initialize it with an empty array.
  const [exams, setExams] = useState<Exam[]>([]);

  /**
   * useEffect: Runs once when the component mounts (because of the empty dependency array []).
   * It loads saved exams from the browser's localStorage so data persists after refresh.
   */
  useEffect(() => {
    const stored = localStorage.getItem('mwijay_exams');
    if (stored) {
        try {
            // JSON.parse converts the string back into a JavaScript array
            setExams(JSON.parse(stored));
        } catch (e) {
            console.error("Failed to parse exams", e);
        }
    }
  }, []);

  /**
   * Helper function to save exams to both State (for UI update) and LocalStorage (for persistence).
   */
  const saveExams = (newExams: Exam[]) => {
    setExams(newExams);
    localStorage.setItem('mwijay_exams', JSON.stringify(newExams));
  };

  /**
   * addExam: Adds a new exam to the list.
   * useCallback ensures this function reference stays stable to prevent unnecessary re-renders.
   */
  const addExam = useCallback((subject: string, date: string) => {
    const newExam: Exam = { 
        id: Date.now().toString(), // Unique ID using timestamp
        subject, 
        date 
    };
    
    // sorting: We sort by date (ascending) so the soonest exam appears first
    const updatedList = [...exams, newExam].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    saveExams(updatedList);
  }, [exams]);

  /**
   * deleteExam: Removes an exam by its unique ID.
   * filter: Creates a new array excluding the item with the matching ID.
   */
  const deleteExam = useCallback((id: string) => {
    saveExams(exams.filter(e => e.id !== id));
  }, [exams]);

  return { exams, addExam, deleteExam };
};
