import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PublicMenuService } from '../../services/public-menu.service';
import {
  PublicMenuResponse,
  PublicMenuModel,
  PublicCategoryModel,
  PublicMenuItemModel,
  SessaoResponse,
  PedidoResponse
} from '../../models/public-menu.model';

interface CartItem {
  menuItemId: number;
  nome: string;
  preco: number;
  quantidade: number;
}

type Estado =
  | 'carregando'
  | 'nao-encontrado'
  | 'erro'
  | 'informar-mesa'
  | 'cardapio'
  | 'confirmando'
  | 'pedido-enviado'
  | 'sessao';

const SESSION_KEY = (slug: string) => `sessao_${slug}`;

@Component({
  selector: 'app-public-menu',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './public-menu.component.html',
  styleUrl: './public-menu.component.scss'
})
export class PublicMenuComponent implements OnInit {
  estado: Estado = 'carregando';
  cardapio: PublicMenuResponse | null = null;
  menuAtivo: PublicMenuModel | null = null;
  categoriaAtiva: PublicCategoryModel | null = null;

  slug = '';
  numeroMesa = '';
  sessaoToken: string | null = null;
  sessao: SessaoResponse | null = null;
  ultimoPedido: PedidoResponse | null = null;

  cart = new Map<number, CartItem>();
  carrinhoAberto = false;

  enviando = false;
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private publicMenuService: PublicMenuService
  ) {}

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? '';
    if (!this.slug) { this.estado = 'nao-encontrado'; return; }

    this.sessaoToken = sessionStorage.getItem(SESSION_KEY(this.slug));

    this.publicMenuService.getCardapio(this.slug).subscribe({
      next: (data) => {
        this.cardapio = data;
        this.menuAtivo = data.menus[0] ?? null;
        this.categoriaAtiva = this.menuAtivo?.categories[0] ?? null;
        this.estado = this.sessaoToken ? 'cardapio' : 'informar-mesa';
      },
      error: (err) => {
        this.estado = err.status === 404 ? 'nao-encontrado' : 'erro';
      }
    });
  }

  // ── Navegação do cardápio ─────────────────────────────────────────────────

  selecionarMenu(menu: PublicMenuModel): void {
    this.menuAtivo = menu;
    this.categoriaAtiva = menu.categories[0] ?? null;
  }

  selecionarCategoria(categoria: PublicCategoryModel): void {
    this.categoriaAtiva = categoria;
  }

  // ── Sessão ────────────────────────────────────────────────────────────────

  confirmarMesa(): void {
    if (!this.numeroMesa.trim()) return;
    this.enviando = true;
    this.errorMsg = '';

    this.publicMenuService.abrirSessao(this.slug, { numeroMesa: this.numeroMesa.trim() }).subscribe({
      next: (sessao) => {
        this.sessaoToken = sessao.token;
        sessionStorage.setItem(SESSION_KEY(this.slug), sessao.token);
        this.sessao = sessao;
        this.enviando = false;
        this.estado = 'cardapio';
      },
      error: () => {
        this.errorMsg = 'Não foi possível abrir a sessão. Tente novamente.';
        this.enviando = false;
      }
    });
  }

  verSessao(): void {
    if (!this.sessaoToken) return;
    this.publicMenuService.getSessao(this.slug, this.sessaoToken).subscribe({
      next: (s) => { this.sessao = s; this.estado = 'sessao'; }
    });
  }

  encerrarSessao(): void {
    if (!this.sessaoToken) return;
    this.publicMenuService.encerrarSessao(this.slug, this.sessaoToken).subscribe({
      next: (s) => {
        this.sessao = s;
        sessionStorage.removeItem(SESSION_KEY(this.slug));
        this.sessaoToken = null;
        this.cart.clear();
      }
    });
  }

  voltarAoCardapio(): void {
    this.estado = 'cardapio';
  }

  // ── Carrinho ──────────────────────────────────────────────────────────────

  adicionarAoCarrinho(item: PublicMenuItemModel): void {
    const existente = this.cart.get(item.id);
    if (existente) {
      existente.quantidade++;
    } else {
      this.cart.set(item.id, { menuItemId: item.id, nome: item.name, preco: item.price, quantidade: 1 });
    }
  }

  removerDoCarrinho(menuItemId: number): void {
    const item = this.cart.get(menuItemId);
    if (!item) return;
    if (item.quantidade > 1) {
      item.quantidade--;
    } else {
      this.cart.delete(menuItemId);
    }
  }

  quantidadeNoCarrinho(menuItemId: number): number {
    return this.cart.get(menuItemId)?.quantidade ?? 0;
  }

  get itensCarrinho(): CartItem[] {
    return Array.from(this.cart.values());
  }

  get totalCarrinho(): number {
    return this.itensCarrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
  }

  get totalItensCarrinho(): number {
    return this.itensCarrinho.reduce((acc, i) => acc + i.quantidade, 0);
  }

  enviarPedido(): void {
    if (this.cart.size === 0 || !this.sessaoToken) return;
    this.enviando = true;
    this.carrinhoAberto = false;

    const dto = {
      itens: this.itensCarrinho.map(i => ({
        menuItemId: i.menuItemId,
        quantidade: i.quantidade
      }))
    };

    this.publicMenuService.fazerPedido(this.slug, this.sessaoToken, dto).subscribe({
      next: (pedido) => {
        this.ultimoPedido = pedido;
        this.cart.clear();
        this.enviando = false;
        this.estado = 'pedido-enviado';
      },
      error: () => {
        this.enviando = false;
        this.carrinhoAberto = true;
      }
    });
  }

  continuarPedindo(): void {
    this.estado = 'cardapio';
  }
}
