
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { JournalEntry, Expense, Reminder, RecurringTransaction, Habit, Goal, CustomTemplate, CodeSnippet, FlashcardDeck, UserTrack, Playlist, Budget, ManagedFile } from '../types';

interface MwijayDB extends DBSchema {
  journals: {
    key: string;
    value: JournalEntry;
  };
  expenses: {
    key: string;
    value: Expense;
  };
  reminders: {
    key: string;
    value: Reminder;
  };
  recurringTransactions: {
    key: string;
    value: RecurringTransaction;
  };
  habits: {
    key: string;
    value: Habit;
  };
  goals: {
    key: string;
    value: Goal;
  };
  budgets: {
    key: string;
    value: Budget;
  };
  templates: {
    key: string;
    value: CustomTemplate;
  };
  codeSnippets: {
    key: string;
    value: CodeSnippet;
  };
  flashcards: {
    key: string;
    value: FlashcardDeck;
  };
  userTracks: {
    key: string;
    value: UserTrack;
  };
  playlists: {
    key: string;
    value: Playlist;
  };
  chat_messages: {
    key: number;
    value: { id: number; sender: 'user' | 'ai'; text: string };
  };
  files: {
    key: string;
    value: ManagedFile;
  };
}

const DB_NAME = 'mwijay_note_db';
const DB_VERSION = 6; // Incremented for files store

let dbPromise: Promise<IDBPDatabase<MwijayDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MwijayDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (!db.objectStoreNames.contains('journals')) db.createObjectStore('journals', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('expenses')) db.createObjectStore('expenses', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('reminders')) db.createObjectStore('reminders', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('recurringTransactions')) db.createObjectStore('recurringTransactions', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('habits')) db.createObjectStore('habits', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('goals')) db.createObjectStore('goals', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('budgets')) db.createObjectStore('budgets', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('templates')) db.createObjectStore('templates', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('codeSnippets')) db.createObjectStore('codeSnippets', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('flashcards')) db.createObjectStore('flashcards', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('userTracks')) db.createObjectStore('userTracks', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('playlists')) db.createObjectStore('playlists', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('chat_messages')) db.createObjectStore('chat_messages', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('files')) db.createObjectStore('files', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

export const db = {
  async get<K extends keyof MwijayDB>(storeName: K, key: MwijayDB[K]['key']): Promise<MwijayDB[K]['value'] | undefined> {
    const db = await getDB();
    return db.get(storeName as any, key);
  },
  async getAll<K extends keyof MwijayDB>(storeName: K): Promise<MwijayDB[K]['value'][]> {
    const db = await getDB();
    return db.getAll(storeName as any);
  },
  async add<K extends keyof MwijayDB>(storeName: K, value: MwijayDB[K]['value']): Promise<void> {
    const db = await getDB();
    await db.put(storeName as any, value);
  },
  async put<K extends keyof MwijayDB>(storeName: K, value: MwijayDB[K]['value']): Promise<void> {
    const db = await getDB();
    await db.put(storeName as any, value);
  },
  async delete<K extends keyof MwijayDB>(storeName: K, key: MwijayDB[K]['key']): Promise<void> {
    const db = await getDB();
    await db.delete(storeName as any, key);
  },
  async clear<K extends keyof MwijayDB>(storeName: K): Promise<void> {
    const db = await getDB();
    await db.clear(storeName as any);
  }
};
