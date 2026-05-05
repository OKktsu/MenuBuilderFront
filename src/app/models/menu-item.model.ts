import { BaseEntity } from './base.model';
import { Category } from './category.model';

export interface MenuItem extends BaseEntity {
  name: string;
  description?: string;
  order: number;
  ingredients?: string;
  price: number;
  imagePath?: string;
  tags: string[];
  categories?: Category[];
}
