import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CargoResponse {
  id: number;
  nome: string;
  empresaId: number;
  permissoes: string[];
  totalFuncionarios: number;
}

export interface CargoRequest {
  nome: string;
  permissoes: string[];
}

export const TODAS_PERMISSOES: { valor: string; label: string; descricao: string }[] = [
  { valor: 'CriarMenu',             label: 'Criar Menu',             descricao: 'Pode criar novos menus' },
  { valor: 'EditarMenu',            label: 'Editar Menu',            descricao: 'Pode editar menus, categorias e itens' },
  { valor: 'DeletarMenu',           label: 'Deletar Menu',           descricao: 'Pode excluir menus e itens' },
  { valor: 'GerenciarFuncionarios', label: 'Gerenciar Funcionários', descricao: 'Pode convidar e remover funcionários' },
  { valor: 'VerAnalytics',          label: 'Ver Analytics',          descricao: 'Acesso ao painel de análises' },
  { valor: 'GerenciarCargos',       label: 'Gerenciar Cargos',       descricao: 'Pode criar e editar cargos' },
];

@Injectable({ providedIn: 'root' })
export class CargoService {
  private apiUrl = `${environment.apiUrl}/Cargo`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CargoResponse[]> {
    return this.http.get<CargoResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<CargoResponse> {
    return this.http.get<CargoResponse>(`${this.apiUrl}/${id}`);
  }

  create(data: CargoRequest): Observable<CargoResponse> {
    return this.http.post<CargoResponse>(this.apiUrl, data);
  }

  update(id: number, data: CargoRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
