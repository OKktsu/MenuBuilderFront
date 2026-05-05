import { BaseEntity } from './base.model';
import { Category } from './category.model';

export interface Menu extends BaseEntity {
  restaurantName: string;
  description?: string;
  openingHours?: string;
  categories?: Category[];
}
