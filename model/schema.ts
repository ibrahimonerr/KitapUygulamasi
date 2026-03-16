import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'books',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'author', type: 'string' },
        { name: 'cover', type: 'string' },
        { name: 'status', type: 'string' }, // active, finished, waitlist
        { name: 'progress', type: 'number' },
        { name: 'pages', type: 'string' },
        { name: 'rating', type: 'number', isOptional: true },
        { name: 'summary', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'quotes',
      columns: [
        { name: 'book_id', type: 'string', isIndexed: true },
        { name: 'text', type: 'string' },
        { name: 'page', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'notes',
      columns: [
        { name: 'book_id', type: 'string', isIndexed: true },
        { name: 'content', type: 'string' },
        { name: 'created_at', type: 'number' },
      ]
    }),
  ]
});
