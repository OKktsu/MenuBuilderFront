import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PublicMenuResponse, PublicRestaurantInfo } from '../models/public-menu.model';

@Injectable({ providedIn: 'root' })
export class PublicMenuService {
  private readonly base = `${environment.apiUrl}/public`;

  constructor(private http: HttpClient) {}

  getCardapio(slug: string): Observable<PublicMenuResponse> {
    return this.http.get<PublicMenuResponse>(`${this.base}/${slug}`);
  }

  getInfo(slug: string): Observable<PublicRestaurantInfo> {
    return this.http.get<PublicRestaurantInfo>(`${this.base}/${slug}/info`);
  }
}
