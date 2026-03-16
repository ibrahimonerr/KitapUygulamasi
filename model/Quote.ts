import { Model, Relation } from '@nozbe/watermelondb';
import { Associations } from '@nozbe/watermelondb/Model';
import { field, date, immutableRelation, readonly } from '@nozbe/watermelondb/decorators';

export default class Quote extends Model {
  static table = 'quotes';
  static associations: Associations = {
    books: { type: 'belongs_to', key: 'book_id' },
  };

  @field('text') text!: string;
  @field('page') page?: number;
  
  @readonly @date('created_at') createdAt!: Date;
  @immutableRelation('books', 'book_id') book!: Relation<any>;
}
