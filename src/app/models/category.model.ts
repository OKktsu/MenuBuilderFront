import { BaseEntity } from './base.model';
import { Menu } from './menu.model';
import { MenuItem } from './menu-item.model';

export interface Category extends BaseEntity {
  name: string;
  order: number;
  menuId: number;
  menu?: Menu;
  items?: MenuItem[];
}
