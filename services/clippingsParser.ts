export interface ParsedClipping {
  bookTitle: string;
  author: string;
  type: 'Highlight' | 'Note' | 'Bookmark';
  content: string;
  page?: number;
  location?: string;
  dateAdded?: string;
}

export const parseKindleClippings = (text: string): ParsedClipping[] => {
  const clippings: ParsedClipping[] = [];
  const entries = text.split('==========').filter(entry => entry.trim() !== '');

  entries.forEach(entry => {
    const lines = entry.trim().split('\n');
    if (lines.length < 3) return;

    // Line 1: Title and Author -> "Book Title (Author Name)"
    const titleLine = lines[0].trim();
    const authorMatch = titleLine.match(/\((.*?)\)$/);
    let author = 'Bilinmeyen Yazar';
    let bookTitle = titleLine;

    if (authorMatch) {
      author = authorMatch[1];
      bookTitle = titleLine.replace(authorMatch[0], '').trim();
    }

    // Line 2: Meta info -> "- Your Highlight on page 10 | Location 123-124 | Added on Monday, January 1, 2024 10:00:00 AM"
    const metaLine = lines[1].trim();
    let type: 'Highlight' | 'Note' | 'Bookmark' = 'Highlight';
    if (metaLine.includes('Your Note') || metaLine.includes('Notunuz')) type = 'Note';
    if (metaLine.includes('Your Bookmark') || metaLine.includes('Yer İşaretiniz')) type = 'Bookmark';

    const pageMatch = metaLine.match(/page (\d+)/i) || metaLine.match(/sayfa (\d+)/i);
    const page = pageMatch ? parseInt(pageMatch[1], 10) : undefined;

    // Line 3 is sometimes empty, Line 4 is content.
    // We just take everything from index 2 to end, ignoring empty lines until text.
    let contentStart = 2;
    while (contentStart < lines.length && lines[contentStart].trim() === '') {
      contentStart++;
    }

    const content = lines.slice(contentStart).join('\n').trim();

    if (content) {
      clippings.push({
        bookTitle,
        author,
        type,
        content,
        page
      });
    }
  });

  return clippings;
};
