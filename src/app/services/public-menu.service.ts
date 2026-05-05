import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PublicMenuResponse,
  PublicRestaurantInfo,
  AbrirSessaoRequest,
  NovoPedidoRequest,
  SessaoResponse,
  PedidoResponse
} from '../models/public-menu.model';

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

  abrirSessao(slug: string, dto: AbrirSessaoRequest): Observable<SessaoResponse> {
    return this.http.post<SessaoResponse>(`${this.base}/${slug}/sessao`, dto);
  }

  getSessao(slug: string, token: string): Observable<SessaoResponse> {
    return this.http.get<SessaoResponse>(`${this.base}/${slug}/sessao/${token}`);
  }

  fazerPedido(slug: string, token: string, dto: NovoPedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.base}/${slug}/sessao/${token}/pedido`, dto);
  }

  encerrarSessao(slug: string, token: string): Observable<SessaoResponse> {
    return this.http.put<SessaoResponse>(`${this.base}/${slug}/sessao/${token}/encerrar`, {});
  }
}
