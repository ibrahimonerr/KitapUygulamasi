export interface BookSearchResult {
  id: string;
  title: string;
  author: string;
  cover: string | null;
  pageCount: number;
  publishYear: string;
  description: string;
  isbn?: string;
}

const OPEN_LIBRARY_SEARCH_URL = 'https://openlibrary.org/search.json';
const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes';
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop';

const normalizeTitle = (value: string) => value.trim().toLowerCase();
const buildCoverUrl = (coverId?: number) => (coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null);

const dedupeResults = (books: BookSearchResult[]) => {
  const seen = new Set<string>();

  return books.filter((book) => {
    const key = `${normalizeTitle(book.title)}::${normalizeTitle(book.author)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const mapOpenLibraryDoc = (doc: any): BookSearchResult => ({
  id: doc.key || doc.cover_edition_key || `${doc.title}-${doc.author_name?.[0] || 'unknown'}`,
  title: doc.title,
  author: doc.author_name?.join(', ') || 'Bilinmeyen Yazar',
  cover: buildCoverUrl(doc.cover_i),
  pageCount: doc.number_of_pages_median || 0,
  publishYear: doc.first_publish_year ? String(doc.first_publish_year) : '',
  description: '',
  isbn: doc.isbn?.[0],
});

const mapGoogleBook = (item: any): BookSearchResult => ({
  id: item.id,
  title: item.volumeInfo.title,
  author: item.volumeInfo.authors?.join(', ') || 'Bilinmeyen Yazar',
  cover: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
  pageCount: item.volumeInfo.pageCount || 0,
  publishYear: item.volumeInfo.publishedDate?.substring(0, 4) || '',
  description: item.volumeInfo.description || '',
  isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier,
});

const fetchJson = async (url: string, timeoutMs: number = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

const searchOpenLibrary = async (query: string, limit = 10): Promise<BookSearchResult[]> => {
  const data = await fetchJson(`${OPEN_LIBRARY_SEARCH_URL}?q=${encodeURIComponent(query)}&limit=${limit}`);
  return (data.docs || []).map(mapOpenLibraryDoc);
};

const searchGoogleBooks = async (query: string, limit = 10): Promise<BookSearchResult[]> => {
  const data = await fetchJson(`${GOOGLE_BOOKS_URL}?q=${encodeURIComponent(query)}&maxResults=${limit}`);
  return (data.items || []).map(mapGoogleBook);
};

export const searchBooksCatalog = async (query: string, limit = 10): Promise<BookSearchResult[]> => {
  if (query.trim().length < 3) return [];

  try {
    const openLibraryResults = await searchOpenLibrary(query, limit);
    if (openLibraryResults.length >= Math.min(limit, 5)) {
      return dedupeResults(openLibraryResults).slice(0, limit);
    }

    const googleResults = await searchGoogleBooks(query, limit);
    return dedupeResults([...openLibraryResults, ...googleResults]).slice(0, limit);
  } catch (openLibraryError) {
    console.error('OpenLibrary search failed, trying Google fallback:', openLibraryError);

    try {
      const googleResults = await searchGoogleBooks(query, limit);
      return dedupeResults(googleResults).slice(0, limit);
    } catch (googleError) {
      console.error('Google Books fallback failed:', googleError);
      return [];
    }
  }
};

export const searchBooksBySuggestions = async (suggestions: string[], limit = 5): Promise<BookSearchResult[]> => {
  const results = await Promise.all(suggestions.map((suggestion) => searchBooksCatalog(suggestion, 1)));
  return dedupeResults(results.flat()).slice(0, limit);
};

export const getBookByISBN = async (isbn: string): Promise<BookSearchResult | null> => {
  if (!isbn.trim()) return null;

  try {
    const openLibraryResults = await searchOpenLibrary(`isbn:${isbn}`, 3);
    if (openLibraryResults.length > 0) {
      return openLibraryResults[0];
    }
  } catch (error) {
    console.error('OpenLibrary ISBN search failed:', error);
  }

  try {
    const googleResults = await searchGoogleBooks(`isbn:${isbn}`, 1);
    return googleResults[0] || null;
  } catch (error) {
    console.error('Google ISBN fallback failed:', error);
    return null;
  }
};

export const toLibraryBookInput = (book: BookSearchResult) => ({
  title: book.title,
  author: book.author,
  cover: book.cover || DEFAULT_COVER,
  pages: book.pageCount > 0 ? String(book.pageCount) : '0',
});
