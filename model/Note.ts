import { Model, Relation } from '@nozbe/watermelondb';
import { Associations } from '@nozbe/watermelondb/Model';
import { field, date, immutableRelation, readonly } from '@nozbe/watermelondb/decorators';

export default class Note extends Model {
  static table = 'notes';
  static associations: Associations = {
    books: { type: 'belongs_to', key: 'book_id' },
  };

  @field('content') declare content: string;
  
  @readonly @date('created_at') declare createdAt: Date;
  @immutableRelation('books', 'book_id') declare book: Relation<any>;
}
