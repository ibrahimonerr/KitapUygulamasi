import { Model } from '@nozbe/watermelondb';
import { Associations } from '@nozbe/watermelondb/Model';
import { field, date, children, readonly } from '@nozbe/watermelondb/decorators';

export default class Book extends Model {
  static table = 'books';
  static associations: Associations = {
    quotes: { type: 'has_many', foreignKey: 'book_id' },
    notes: { type: 'has_many', foreignKey: 'book_id' },
  };

  @field('title') title!: string;
  @field('author') author!: string;
  @field('cover') cover!: string;
  @field('status') status!: string;
  @field('progress') progress!: number;
  @field('pages') pages!: string;
  @field('rating') rating?: number;
  @field('summary') summary?: string;
  
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('quotes') quotes!: any;
  @children('notes') notes!: any;
}
