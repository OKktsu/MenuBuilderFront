import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { MenuService } from '../../services/menu.service';
import { CategoryService } from '../../services/category.service';
import { MenuItemService } from '../../services/menu-item.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { MenuItem } from '../../models/menu-item.model';

interface TagCount {
  tag: string;
  count: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit {
  loading = false;

  totalMenus = 0;
  totalCategories = 0;
  totalItems = 0;
  avgPrice = 0;
  mostExpensive: MenuItem | null = null;
  cheapest: MenuItem | null = null;
  topTags: TagCount[] = [];

  constructor(
    private menuService: MenuService,
    private categoryService: CategoryService,
    private menuItemService: MenuItemService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    forkJoin({
      menus: this.menuService.getAll(),
      categories: this.categoryService.getAll(),
      items: this.menuItemService.getAll()
    }).subscribe({
      next: ({ menus, categories, items }) => {
        this.totalMenus = menus.length;
        this.totalCategories = categories.length;
        this.totalItems = items.length;

        if (items.length > 0) {
          const prices = items.map(i => i.price);
          this.avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
          this.mostExpensive = items.reduce((a, b) => a.price > b.price ? a : b);
          this.cheapest = items.reduce((a, b) => a.price < b.price ? a : b);
        }

        const tagMap = new Map<string, number>();
        items.forEach(item =>
          item.tags?.forEach(tag => tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1))
        );
        this.topTags = Array.from(tagMap.entries())
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);

        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
