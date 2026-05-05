import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PedidoAdminModel, SessaoAdminModel, StatusPedido } from '../models/public-menu.model';

@Injectable({ providedIn: 'root' })
export class CozinhaService {
  private readonly base = `${environment.apiUrl}/cozinha`;

  constructor(private http: HttpClient) {}

  getPedidos(status?: StatusPedido): Observable<PedidoAdminModel[]> {
    const params = status ? `?status=${status}` : '';
    return this.http.get<PedidoAdminModel[]>(`${this.base}/pedidos${params}`);
  }

  getSessoes(): Observable<SessaoAdminModel[]> {
    return this.http.get<SessaoAdminModel[]>(`${this.base}/sessoes`);
  }

  atualizarStatus(pedidoId: number, status: StatusPedido): Observable<{ id: number; status: StatusPedido }> {
    return this.http.put<{ id: number; status: StatusPedido }>(
      `${this.base}/pedidos/${pedidoId}/status`,
      { status }
    );
  }
}
