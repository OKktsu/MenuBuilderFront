import { BaseEntity } from './base.model';

export interface User extends BaseEntity {
  name: string;
  email: string;
}
