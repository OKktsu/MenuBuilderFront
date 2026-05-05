import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EmpresaResponse {
  id: number;
  nome: string;
  logoUrl: string | null;
  codigoConvite: string;
  createdAt: string;
}

export interface EmpresaRequest {
  nome: string;
  logoUrl?: string | null;
}

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private apiUrl = `${environment.apiUrl}/Empresa`;

  constructor(private http: HttpClient) {}

  getMinha(): Observable<EmpresaResponse> {
    return this.http.get<EmpresaResponse>(`${this.apiUrl}/minha`);
  }

  update(data: EmpresaRequest): Observable<EmpresaResponse> {
    return this.http.put<EmpresaResponse>(this.apiUrl, data);
  }
}
