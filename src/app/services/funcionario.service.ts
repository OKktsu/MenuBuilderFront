import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FuncionarioResponse {
  userId: string;
  nomeCompleto: string;
  email: string;
  isOwner: boolean;
  cargoId: number | null;
  cargoNome: string | null;
  dataEntrada: string;
}

@Injectable({ providedIn: 'root' })
export class FuncionarioService {
  private apiUrl = `${environment.apiUrl}/Funcionario`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<FuncionarioResponse[]> {
    return this.http.get<FuncionarioResponse[]>(this.apiUrl);
  }

  alterarCargo(userId: string, cargoId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${userId}/cargo`, { cargoId });
  }

  remover(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }
}
