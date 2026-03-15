import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  progress: number;
  pages: string;
  quotes: Array<{ id: string; text: string; page: number; date: string }>;
  notes: Array<{ id: string; text: string; date: string }>;
}

interface LibraryContextType {
  activeBooks: Book[];
  finishedBooks: Book[];
  waitlistBooks: Book[];
  addBook: (book: Book, section: 'active' | 'finished' | 'waitlist') => void;
  finishBook: (bookId: string) => void;
  moveToActive: (bookId: string, fromSection: 'waitlist' | 'finished') => void;
  reorderActiveBooks: (index: number) => void;
  addQuoteToBook: (bookId: string, quote: { text: string, page: number }) => void;
  addNoteToBook: (bookId: string, noteText: string) => void;
  isLoading: boolean;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACTIVE: '@library_active',
  FINISHED: '@library_finished',
  WAITLIST: '@library_waitlist',
};

const INITIAL_ACTIVE: Book[] = [
  { id: '1', title: 'Savaş Sanatı', author: 'Sun Tzu', cover: 'https://images.unsplash.com/photo-1476275466078-4007374efac4?q=80&w=1000&auto=format&fit=crop', progress: 0.65, pages: '45/120', quotes: [{ id: 'q1', text: 'En büyük zafer, savaşmadan kazanılan zaferdir.', page: 45, date: 'Dün' }], notes: [] },
  { id: '2', title: 'Büyük Gatsby', author: 'F. Scott Fitzgerald', cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop', progress: 0.20, pages: '25/210', quotes: [], notes: [] },
];

const INITIAL_WAITLIST: Book[] = [
  { id: 'w1', title: 'Homo Sapiens', author: 'Yuval Noah Harari', cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop', progress: 0, pages: '0/450', quotes: [], notes: [] },
  { id: 'w2', title: 'Simyacı', author: 'Paulo Coelho', cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000&auto=format&fit=crop', progress: 0, pages: '0/180', quotes: [], notes: [] },
];

const INITIAL_FINISHED: Book[] = [
  { id: 'f1', title: '1984', author: 'George Orwell', cover: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1000&auto=format&fit=crop', progress: 1, pages: '320/320', quotes: [], notes: [] },
];

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeBooks, setActiveBooks] = useState<Book[]>(INITIAL_ACTIVE);
  const [finishedBooks, setFinishedBooks] = useState<Book[]>(INITIAL_FINISHED);
  const [waitlistBooks, setWaitlistBooks] = useState<Book[]>(INITIAL_WAITLIST);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const active = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE);
      const finished = await AsyncStorage.getItem(STORAGE_KEYS.FINISHED);
      const waitlist = await AsyncStorage.getItem(STORAGE_KEYS.WAITLIST);

      if (active) setActiveBooks(JSON.parse(active));
      if (finished) setFinishedBooks(JSON.parse(finished));
      if (waitlist) setWaitlistBooks(JSON.parse(waitlist));
    } catch (e) {
      console.error('Failed to load library', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLibrary = async (
    active: Book[],
    finished: Book[],
    waitlist: Book[]
  ) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE, JSON.stringify(active));
      await AsyncStorage.setItem(STORAGE_KEYS.FINISHED, JSON.stringify(finished));
      await AsyncStorage.setItem(STORAGE_KEYS.WAITLIST, JSON.stringify(waitlist));
    } catch (e) {
      console.error('Failed to save library', e);
    }
  };

  const addBook = (book: Book, section: 'active' | 'finished' | 'waitlist') => {
    let newActive = [...activeBooks];
    let newFinished = [...finishedBooks];
    let newWaitlist = [...waitlistBooks];

    if (section === 'active') {
      newActive = [book, ...activeBooks];
      setActiveBooks(newActive);
    } else if (section === 'finished') {
      newFinished = [book, ...finishedBooks];
      setFinishedBooks(newFinished);
    } else {
      newWaitlist = [book, ...waitlistBooks];
      setWaitlistBooks(newWaitlist);
    }
    saveLibrary(newActive, newFinished, newWaitlist);
  };

  const finishBook = (bookId: string) => {
    const bookToFinish = activeBooks.find(b => b.id === bookId);
    if (bookToFinish) {
      const updatedActive = activeBooks.filter(b => b.id !== bookId);
      const updatedFinished = [{ ...bookToFinish, progress: 1 }, ...finishedBooks];
      
      setActiveBooks(updatedActive);
      setFinishedBooks(updatedFinished);
      saveLibrary(updatedActive, updatedFinished, waitlistBooks);
    }
  };

  const moveToActive = (bookId: string, fromSection: 'waitlist' | 'finished') => {
    let bookToMove;
    let updatedWaitlist = waitlistBooks;
    let updatedFinished = finishedBooks;

    if (fromSection === 'waitlist') {
      bookToMove = waitlistBooks.find(b => b.id === bookId);
      updatedWaitlist = waitlistBooks.filter(b => b.id !== bookId);
    } else {
      bookToMove = finishedBooks.find(b => b.id === bookId);
      updatedFinished = finishedBooks.filter(b => b.id !== bookId);
    }

    if (bookToMove) {
      const updatedActive = [bookToMove, ...activeBooks];
      setActiveBooks(updatedActive);
      setWaitlistBooks(updatedWaitlist);
      setFinishedBooks(updatedFinished);
      saveLibrary(updatedActive, updatedFinished, updatedWaitlist);
    }
  };

  const reorderActiveBooks = (index: number) => {
    if (index === 0 || index >= activeBooks.length) return;
    
    const newActive = [...activeBooks];
    const selected = newActive.splice(index, 1)[0];
    newActive.unshift(selected);
    
    setActiveBooks(newActive);
    saveLibrary(newActive, finishedBooks, waitlistBooks);
  };

  const addQuoteToBook = (bookId: string, quote: { text: string, page: number }) => {
    const newQuote = {
      id: Math.random().toString(36).substring(7),
      text: quote.text,
      page: quote.page,
      date: 'Bugün'
    };

    const updateList = (list: Book[]) => 
      list.map(b => b.id === bookId ? { ...b, quotes: [newQuote, ...b.quotes] } : b);

    const newActive = updateList(activeBooks);
    const newFinished = updateList(finishedBooks);
    const newWaitlist = updateList(waitlistBooks);

    setActiveBooks(newActive);
    setFinishedBooks(newFinished);
    setWaitlistBooks(newWaitlist);
    saveLibrary(newActive, newFinished, newWaitlist);
  };

  const addNoteToBook = (bookId: string, noteText: string) => {
    const newNote = {
      id: Math.random().toString(36).substring(7),
      text: noteText,
      date: 'Bugün'
    };

    const updateList = (list: Book[]) => 
      list.map(b => b.id === bookId ? { ...b, notes: [newNote, ...b.notes] } : b);

    const newActive = updateList(activeBooks);
    const newFinished = updateList(finishedBooks);
    const newWaitlist = updateList(waitlistBooks);

    setActiveBooks(newActive);
    setFinishedBooks(newFinished);
    setWaitlistBooks(newWaitlist);
    saveLibrary(newActive, newFinished, newWaitlist);
  };

  return (
    <LibraryContext.Provider
      value={{
        activeBooks,
        finishedBooks,
        waitlistBooks,
        addBook,
        finishBook,
        moveToActive,
        reorderActiveBooks,
        addQuoteToBook,
        addNoteToBook,
        isLoading,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
