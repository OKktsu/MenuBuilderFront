import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CategoryService } from '../../services/category.service';
import { MenuService } from '../../services/menu.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { Category } from '../../models/category.model';
import { Menu } from '../../models/menu.model';

interface GroupedCategories {
  menu: Menu;
  categories: Category[];
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmModalComponent, LoadingSpinnerComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  loading = false;
  groups: GroupedCategories[] = [];
  menus: Menu[] = [];

  // Add category
  showAddForm = false;
  newCategoryName = '';
  newCategoryMenuId: number | null = null;

  // Edit inline
  editingId: number | null = null;
  editingName = '';

  // Delete modal
  showDeleteModal = false;
  categoryToDelete: Category | null = null;

  constructor(
    private categoryService: CategoryService,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    forkJoin({
      menus: this.menuService.getAll(),
      categories: this.categoryService.getAll()
    }).subscribe({
      next: ({ menus, categories }) => {
        this.menus = menus;
        this.groups = menus.map(menu => ({
          menu,
          categories: categories.filter((c: Category) => c.menuId === menu.id)
            .sort((a: Category, b: Category) => a.order - b.order)
        })).filter(g => g.categories.length > 0 || menus.length > 0);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get allCategories(): Category[] {
    return this.groups.flatMap(g => g.categories);
  }

  // ── Add ─────────────────────────────────────

  openAddForm(): void {
    this.showAddForm = true;
    this.newCategoryName = '';
    this.newCategoryMenuId = this.menus[0]?.id ?? null;
  }

  cancelAdd(): void {
    this.showAddForm = false;
  }

  saveNewCategory(): void {
    if (!this.newCategoryName.trim() || !this.newCategoryMenuId) return;

    const group = this.groups.find(g => g.menu.id === this.newCategoryMenuId);
    const order = (group?.categories.length ?? 0) + 1;

    this.categoryService.create({
      name: this.newCategoryName.trim(),
      menuId: this.newCategoryMenuId,
      order
    }).subscribe({
      next: (created) => {
        if (group) {
          group.categories.push({ ...created, items: [] });
        } else {
          const menu = this.menus.find(m => m.id === this.newCategoryMenuId)!;
          this.groups.push({ menu, categories: [{ ...created, items: [] }] });
        }
        this.showAddForm = false;
      },
      error: () => {}
    });
  }

  // ── Edit ─────────────────────────────────────

  startEdit(category: Category): void {
    this.editingId = category.id;
    this.editingName = category.name;
  }

  saveEdit(category: Category): void {
    if (!this.editingName.trim()) return;
    this.categoryService.update(category.id, {
      name: this.editingName.trim(),
      order: category.order,
      menuId: category.menuId
    }).subscribe({
      next: () => {
        category.name = this.editingName.trim();
        this.editingId = null;
      },
      error: () => { this.editingId = null; }
    });
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  // ── Delete ────────────────────────────────────

  openDeleteModal(category: Category): void {
    this.categoryToDelete = category;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.categoryToDelete) return;
    const id = this.categoryToDelete.id;
    this.categoryService.delete(id).subscribe({
      next: () => {
        this.groups = this.groups.map(g => ({
          ...g,
          categories: g.categories.filter(c => c.id !== id)
        }));
        this.showDeleteModal = false;
        this.categoryToDelete = null;
      },
      error: () => {
        this.showDeleteModal = false;
        this.categoryToDelete = null;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.categoryToDelete = null;
  }
}
