import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { MenuItemService } from '../../../services/menu-item.service';
import { ToastService } from '../../../shared/services/toast.service';
import { MenuItem } from '../../../models/menu-item.model';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmModalComponent, LoadingSpinnerComponent],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.scss'
})
export class ItemListComponent implements OnInit {
  readonly Math = Math;

  showDeleteModal = false;
  itemToDelete: MenuItem | null = null;
  loading = false;

  items: MenuItem[] = [];

  // Search & filter
  searchQuery = '';
  selectedTag = '';

  // Pagination
  readonly pageSize = 10;
  currentPage = 1;

  constructor(private menuItemService: MenuItemService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.menuItemService.getAll().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Erro ao carregar itens. Tente novamente.');
        this.loading = false;
      }
    });
  }

  get allTags(): string[] {
    const tags = new Set<string>();
    this.items.forEach(item => item.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }

  get filteredItems(): MenuItem[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.items.filter(item => {
      const matchesSearch = !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false) ||
        (item.ingredients?.toLowerCase().includes(q) ?? false);

      const matchesTag = !this.selectedTag ||
        (item.tags?.includes(this.selectedTag) ?? false);

      return matchesSearch && matchesTag;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredItems.length / this.pageSize));
  }

  get paginatedItems(): MenuItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredItems.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  openDeleteModal(item: MenuItem) {
    this.itemToDelete = item;
    this.showDeleteModal = true;
  }

  onConfirmDelete() {
    if (this.itemToDelete) {
      this.menuItemService.delete(this.itemToDelete.id).subscribe({
        next: () => {
          this.items = this.items.filter(i => i.id !== this.itemToDelete!.id);
          if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
          this.toast.success('Item excluído com sucesso.');
          this.closeDeleteModal();
        },
        error: () => {
          this.toast.error('Erro ao excluir item. Tente novamente.');
          this.closeDeleteModal();
        }
      });
    }
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }

  getDietaryClass(tag: string): string {
    switch (tag) {
      case 'Vegano': return 'bg-green-100 text-green-800';
      case 'Sem Nozes': return 'bg-blue-100 text-blue-800';
      case 'Sem Glúten': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }
}
