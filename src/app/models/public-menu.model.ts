export interface PublicMenuItemModel {
  id: number;
  name: string;
  description?: string;
  ingredients?: string;
  price: number;
  imageUrl?: string;
  tags: string[];
}

export interface PublicCategoryModel {
  name: string;
  items: PublicMenuItemModel[];
}

export interface PublicMenuModel {
  name: string;
  openingHours?: string;
  categories: PublicCategoryModel[];
}

export interface PublicMenuResponse {
  restaurantName: string;
  logoUrl?: string;
  menus: PublicMenuModel[];
}

export interface PublicRestaurantInfo {
  restaurantName: string;
  logoUrl?: string;
  openingHours?: string;
}

// ── Sessão e Pedidos ──────────────────────────────────────────────────────────

export interface AbrirSessaoRequest {
  numeroMesa: string;
}

export interface NovoPedidoRequest {
  itens: PedidoItemRequest[];
}

export interface PedidoItemRequest {
  menuItemId: number;
  quantidade: number;
  observacao?: string;
}

export type StatusSessao = 'Aberta' | 'Encerrada';
export type StatusPedido = 'Recebido' | 'EmPreparo' | 'Pronto' | 'Entregue';

export interface SessaoResponse {
  token: string;
  numeroMesa: string;
  status: StatusSessao;
  abertoEm: string;
  encerradoEm?: string;
  pedidos: PedidoResponse[];
  total: number;
}

export interface PedidoResponse {
  id: number;
  status: StatusPedido;
  createdAt: string;
  itens: PedidoItemResponse[];
  subtotal: number;
}

export interface PedidoItemResponse {
  nomeItem: string;
  precoUnitario: number;
  quantidade: number;
  observacao?: string;
}

// ── Cozinha (admin) ───────────────────────────────────────────────────────────

export interface SessaoAdminModel {
  id: number;
  numeroMesa: string;
  status: StatusSessao;
  abertoEm: string;
  encerradoEm?: string;
  totalPedidos: number;
  total: number;
}

export interface PedidoAdminModel {
  id: number;
  numeroMesa: string;
  status: StatusPedido;
  createdAt: string;
  itens: PedidoItemResponse[];
  subtotal: number;
}
