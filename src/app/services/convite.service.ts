import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ConviteResponse {
  id: number;
  email: string;
  cargoId: number;
  cargoNome: string;
  status: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface ConviteInfoResponse {
  empresaNome: string;
  cargoNome: string;
  email: string;
  expiresAt: string;
  valido: boolean;
}

export interface ConviteRequest {
  email: string;
  cargoId: number;
}

@Injectable({ providedIn: 'root' })
export class ConviteService {
  private apiUrl = `${environment.apiUrl}/Convite`;

  constructor(private http: HttpClient) {}

  getInfo(token: string): Observable<ConviteInfoResponse> {
    return this.http.get<ConviteInfoResponse>(`${this.apiUrl}/info/${token}`);
  }

  listar(status?: string): Observable<ConviteResponse[]> {
    const params = status ? `?status=${status}` : '';
    return this.http.get<ConviteResponse[]>(`${this.apiUrl}${params}`);
  }

  enviar(data: ConviteRequest): Observable<ConviteResponse> {
    return this.http.post<ConviteResponse>(this.apiUrl, data);
  }

  aceitar(token: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${token}/aceitar`, {});
  }

  cancelar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
