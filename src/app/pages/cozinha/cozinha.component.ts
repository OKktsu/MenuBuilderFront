import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CozinhaService } from '../../services/cozinha.service';
import { PedidoAdminModel, StatusPedido } from '../../models/public-menu.model';

const POLL_INTERVAL_MS = 15000;

const STATUS_SEQUENCE: StatusPedido[] = ['Recebido', 'EmPreparo', 'Pronto', 'Entregue'];

@Component({
  selector: 'app-cozinha',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './cozinha.component.html',
  styleUrl: './cozinha.component.scss'
})
export class CozinhaComponent implements OnInit, OnDestroy {
  pedidos: PedidoAdminModel[] = [];
  carregando = true;
  atualizando = new Set<number>();

  private pollTimer?: ReturnType<typeof setInterval>;

  constructor(private cozinhaService: CozinhaService) {}

  ngOnInit(): void {
    this.carregar();
    this.pollTimer = setInterval(() => this.carregar(), POLL_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.pollTimer);
  }

  carregar(): void {
    this.cozinhaService.getPedidos().subscribe({
      next: (data) => { this.pedidos = data; this.carregando = false; },
      error: () => { this.carregando = false; }
    });
  }

  proximoStatus(pedido: PedidoAdminModel): StatusPedido | null {
    const idx = STATUS_SEQUENCE.indexOf(pedido.status);
    return idx >= 0 && idx < STATUS_SEQUENCE.length - 1 ? STATUS_SEQUENCE[idx + 1] : null;
  }

  avancarStatus(pedido: PedidoAdminModel): void {
    const proximo = this.proximoStatus(pedido);
    if (!proximo || this.atualizando.has(pedido.id)) return;

    this.atualizando.add(pedido.id);
    this.cozinhaService.atualizarStatus(pedido.id, proximo).subscribe({
      next: (res) => {
        pedido.status = res.status;
        this.atualizando.delete(pedido.id);
        if (res.status === 'Entregue') {
          this.pedidos = this.pedidos.filter(p => p.id !== pedido.id);
        }
      },
      error: () => { this.atualizando.delete(pedido.id); }
    });
  }

  labelProximoStatus(pedido: PedidoAdminModel): string {
    const map: Record<StatusPedido, string> = {
      Recebido:  'Iniciar preparo',
      EmPreparo: 'Marcar como pronto',
      Pronto:    'Confirmar entrega',
      Entregue:  ''
    };
    return map[pedido.status] ?? '';
  }

  trackById(_: number, item: PedidoAdminModel): number { return item.id; }
}
