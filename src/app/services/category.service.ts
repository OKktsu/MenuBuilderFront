import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/Category`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getByMenuId(menuId: number): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/menu/${menuId}`);
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  create(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  update(id: number, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }

  reorder(items: { id: number; order: number }[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/reorder`, items);
  }

  addItem(categoryId: number, itemId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${categoryId}/items/${itemId}`, {});
  }

  removeItem(categoryId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${categoryId}/items/${itemId}`);
  }
}
