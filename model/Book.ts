import { Model } from '@nozbe/watermelondb';
import { Associations } from '@nozbe/watermelondb/Model';
import { field, date, children, readonly } from '@nozbe/watermelondb/decorators';

export default class Book extends Model {
  static table = 'books';
  static associations: Associations = {
    quotes: { type: 'has_many', foreignKey: 'book_id' },
    notes: { type: 'has_many', foreignKey: 'book_id' },
  };

  @field('title') declare title: string;
  @field('author') declare author: string;
  @field('cover') declare cover: string;
  @field('status') declare status: string;
  @field('progress') declare progress: number;
  @field('pages') declare pages: string;
  @field('rating') declare rating?: number;
  @field('summary') declare summary?: string;
  
  @readonly @date('created_at') declare createdAt: Date;
  @readonly @date('updated_at') declare updatedAt: Date;

  @children('quotes') declare quotes: any;
  @children('notes') declare notes: any;
}
