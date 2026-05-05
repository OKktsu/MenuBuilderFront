import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MenuItem } from '../models/menu-item.model';

@Injectable({
  providedIn: 'root'
})
export class MenuItemService {
  private apiUrl = `${environment.apiUrl}/MenuItem`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.apiUrl);
  }

  getById(id: number): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.apiUrl}/${id}`);
  }

  create(item: Partial<MenuItem> & { categoryIds?: number[] }): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.apiUrl, item);
  }

  update(id: number, item: Partial<MenuItem> & { categoryIds?: number[] }): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.apiUrl}/${id}`, item);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }

  reorder(items: { id: number; order: number }[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/reorder`, items);
  }
}
