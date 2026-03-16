import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../model/database';
import BookModel from '../model/Book';
import QuoteModel from '../model/Quote';
import NoteModel from '../model/Note';
import { Q } from '@nozbe/watermelondb';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  progress: number;
  pages: string;
  quotes: Array<{ id: string; text: string; page: number; date: string }>;
  notes: Array<{ id: string; text: string; date: string }>;
  status: 'active' | 'finished' | 'waitlist';
}

interface LibraryContextType {
  activeBooks: Book[];
  finishedBooks: Book[];
  waitlistBooks: Book[];
  addBook: (book: Omit<Book, 'id' | 'quotes' | 'notes'>, section: 'active' | 'finished' | 'waitlist') => void;
  finishBook: (bookId: string) => void;
  moveToActive: (bookId: string, fromSection: 'waitlist' | 'finished') => void;
  reorderActiveBooks: (index: number) => void;
  addQuoteToBook: (bookId: string, quote: { text: string, page: number }) => void;
  addNoteToBook: (bookId: string, noteText: string) => void;
  isLoading: boolean;
  taste: { authors: string[], genres: string[] };
  setTaste: (taste: { authors: string[], genres: string[] }) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeBooks, setActiveBooks] = useState<Book[]>([]);
  const [finishedBooks, setFinishedBooks] = useState<Book[]>([]);
  const [waitlistBooks, setWaitlistBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taste, setTaste] = useState<{ authors: string[], genres: string[] }>({ authors: [], genres: [] });

  useEffect(() => {
    // Observe database changes
    const booksCollection = database.get<BookModel>('books');
    const subscription = booksCollection.query().observe().subscribe(books => {
      syncBooksState(books);
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncBooksState = async (bookModels: BookModel[]) => {
    const allBooks = await Promise.all(bookModels.map(async (bm) => {
      const quotes = await bm.quotes.fetch();
      const notes = await bm.notes.fetch();
      
      return {
        id: bm.id,
        title: bm.title,
        author: bm.author,
        cover: bm.cover,
        status: bm.status as any,
        progress: bm.progress,
        pages: bm.pages,
        quotes: quotes.map((q: any) => ({ id: q.id, text: q.text, page: q.page, date: q.createdAt.toLocaleDateString() })),
        notes: notes.map((n: any) => ({ id: n.id, text: n.content, date: n.createdAt.toLocaleDateString() })),
      };
    }));

    setActiveBooks(allBooks.filter(b => b.status === 'active'));
    setFinishedBooks(allBooks.filter(b => b.status === 'finished'));
    setWaitlistBooks(allBooks.filter(b => b.status === 'waitlist'));
    setIsLoading(false);
  };

  const addBook = async (bookData: Omit<Book, 'id' | 'quotes' | 'notes'>, section: 'active' | 'finished' | 'waitlist') => {
    await database.write(async () => {
      await database.get<BookModel>('books').create(bm => {
        bm.title = bookData.title;
        bm.author = bookData.author;
        bm.cover = bookData.cover;
        bm.status = section;
        bm.progress = bookData.progress;
        bm.pages = bookData.pages;
      });
    });
  };

  const finishBook = async (bookId: string) => {
    const book = await database.get<BookModel>('books').find(bookId);
    await database.write(async () => {
      await book.update(bm => {
        bm.status = 'finished';
      });
    });
  };

  const moveToActive = async (bookId: string) => {
    const book = await database.get<BookModel>('books').find(bookId);
    await database.write(async () => {
      await book.update(bm => {
        bm.status = 'active';
      });
    });
  };

  const reorderActiveBooks = (index: number) => {
    // Standard reorder logic (UI only for now or add 'position' field to DB later)
    if (index === 0 || index >= activeBooks.length) return;
    const newActive = [...activeBooks];
    const selected = newActive.splice(index, 1)[0];
    newActive.unshift(selected);
    setActiveBooks(newActive);
  };

  const addQuoteToBook = async (bookId: string, quote: { text: string, page: number }) => {
    await database.write(async () => {
      await database.get<QuoteModel>('quotes').create(qm => {
        qm.text = quote.text;
        qm.page = quote.page;
        qm.book.set(database.get<BookModel>('books').findAndObserve(bookId) as any);
        // WatermelonDB relation setting is usually different but findAndObserve/ID works
        (qm as any).book_id = bookId; 
      });
    });
  };

  const addNoteToBook = async (bookId: string, noteText: string) => {
    await database.write(async () => {
      await database.get<NoteModel>('notes').create(nm => {
        nm.content = noteText;
        (nm as any).book_id = bookId;
      });
    });
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
        taste,
        setTaste,
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
