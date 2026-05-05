import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PublicMenuService } from '../../services/public-menu.service';
import { PublicMenuResponse, PublicMenuModel, PublicCategoryModel } from '../../models/public-menu.model';

type Estado = 'carregando' | 'ok' | 'nao-encontrado' | 'erro';

@Component({
  selector: 'app-public-menu',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './public-menu.component.html',
  styleUrl: './public-menu.component.scss'
})
export class PublicMenuComponent implements OnInit {
  estado: Estado = 'carregando';
  cardapio: PublicMenuResponse | null = null;
  menuAtivo: PublicMenuModel | null = null;
  categoriaAtiva: PublicCategoryModel | null = null;

  constructor(
    private route: ActivatedRoute,
    private publicMenuService: PublicMenuService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    if (!slug) { this.estado = 'nao-encontrado'; return; }

    this.publicMenuService.getCardapio(slug).subscribe({
      next: (data) => {
        this.cardapio = data;
        this.menuAtivo = data.menus[0] ?? null;
        this.categoriaAtiva = this.menuAtivo?.categories[0] ?? null;
        this.estado = 'ok';
      },
      error: (err) => {
        this.estado = err.status === 404 ? 'nao-encontrado' : 'erro';
      }
    });
  }

  selecionarMenu(menu: PublicMenuModel): void {
    this.menuAtivo = menu;
    this.categoriaAtiva = menu.categories[0] ?? null;
  }

  selecionarCategoria(categoria: PublicCategoryModel): void {
    this.categoriaAtiva = categoria;
  }
}
