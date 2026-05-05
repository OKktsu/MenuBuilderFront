import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { ToastService } from '../../shared/services/toast.service';
import { MenuService } from '../../services/menu.service';
import { CategoryService } from '../../services/category.service';
import { MenuItemService } from '../../services/menu-item.service';
import { Menu } from '../../models/menu.model';
import { Category } from '../../models/category.model';
import { MenuItem } from '../../models/menu-item.model';

@Component({
  selector: 'app-menu-builder',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent, ConfirmModalComponent],
  templateUrl: './menu-builder.component.html',
  styleUrls: ['./menu-builder.component.scss']
})
export class MenuBuilderComponent implements OnInit {
  menu: Menu | null = null;
  categories: Category[] = [];
  loading = false;
  saveSuccess = false; // kept for inline header badge

  isCreatingMenu = false;
  newMenu: Partial<Menu> = { restaurantName: '', description: '', openingHours: '' };

  isAddingCategory = false;
  newCategoryName = '';

  // Edit category inline
  editingCategoryId: number | null = null;
  editingCategoryName = '';

  // Delete modals
  showDeleteCategoryModal = false;
  categoryToDelete: Category | null = null;

  // Add item modal
  showAddItemModal = false;
  addItemTargetCategory: Category | null = null;
  allItems: MenuItem[] = [];
  itemSearchQuery = '';

  // Drag-and-drop state
  dragSourceIndex: number | null = null;
  dragSourceItemIndex: number | null = null;
  dragSourceCategoryIndex: number | null = null;
  isDraggingCategory = false;
  isDraggingItem = false;

  constructor(
    private menuService: MenuService,
    private categoryService: CategoryService,
    private menuItemService: MenuItemService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.loadMenu(+id);
    } else {
      this.isCreatingMenu = true;
    }
  }

  loadMenu(id: number): void {
    this.loading = true;
    this.menuService.getCompleteMenu(id).subscribe({
      next: (data) => {
        this.menu = data;
        this.categories = data.categories || [];
        this.isCreatingMenu = false;
        this.loading = false;
      },
      error: () => {
        this.isCreatingMenu = true;
        this.loading = false;
      }
    });
  }

  // ── Menu ───────────────────────────────────────────

  saveNewMenu(): void {
    if (!this.newMenu.restaurantName?.trim()) return;
    this.loading = true;
    this.menuService.create(this.newMenu).subscribe({
      next: (created) => {
        this.menu = created;
        this.isCreatingMenu = false;
        this.loading = false;
        this.router.navigate(['/builder', created.id]);
      },
      error: () => { this.loading = false; }
    });
  }

  publishMenu(): void {
    if (!this.menu) return;
    this.menuService.update(this.menu.id, {
      restaurantName: this.menu.restaurantName,
      description: this.menu.description,
      openingHours: this.menu.openingHours
    }).subscribe({
      next: () => {
        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 2500);
        this.toast.success('Menu salvo com sucesso.');
      },
      error: () => { this.toast.error('Erro ao salvar menu.'); }
    });
  }

  // ── Categories ─────────────────────────────────────

  addCategory(): void {
    this.isAddingCategory = true;
    this.newCategoryName = '';
  }

  cancelAddCategory(): void {
    this.isAddingCategory = false;
    this.newCategoryName = '';
  }

  saveCategory(): void {
    if (!this.newCategoryName.trim() || !this.menu) return;
    this.loading = true;
    this.categoryService.create({
      name: this.newCategoryName.trim(),
      menuId: this.menu.id,
      order: this.categories.length + 1
    }).subscribe({
      next: (created) => {
        this.categories = [...this.categories, { ...created, items: [] }];
        this.isAddingCategory = false;
        this.newCategoryName = '';
        this.loading = false;
        this.toast.success('Categoria criada.');
      },
      error: () => {
        this.toast.error('Erro ao criar categoria.');
        this.loading = false;
      }
    });
  }

  startEditCategory(category: Category): void {
    this.editingCategoryId = category.id;
    this.editingCategoryName = category.name;
  }

  saveEditCategory(category: Category): void {
    if (!this.editingCategoryName.trim()) return;
    this.categoryService.update(category.id, {
      name: this.editingCategoryName.trim(),
      order: category.order,
      menuId: category.menuId
    }).subscribe({
      next: () => {
        category.name = this.editingCategoryName.trim();
        this.editingCategoryId = null;
      },
      error: () => { this.editingCategoryId = null; }
    });
  }

  cancelEditCategory(): void {
    this.editingCategoryId = null;
    this.editingCategoryName = '';
  }

  openDeleteCategoryModal(category: Category): void {
    this.categoryToDelete = category;
    this.showDeleteCategoryModal = true;
  }

  confirmDeleteCategory(): void {
    if (!this.categoryToDelete) return;
    this.categoryService.delete(this.categoryToDelete.id).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.id !== this.categoryToDelete!.id);
        this.toast.success('Categoria excluída.');
        this.categoryToDelete = null;
        this.showDeleteCategoryModal = false;
      },
      error: () => {
        this.toast.error('Erro ao excluir categoria.');
        this.categoryToDelete = null;
        this.showDeleteCategoryModal = false;
      }
    });
  }

  cancelDeleteCategory(): void {
    this.categoryToDelete = null;
    this.showDeleteCategoryModal = false;
  }

  // ── Items ──────────────────────────────────────────

  addItemToCategory(category: Category): void {
    this.addItemTargetCategory = category;
    this.itemSearchQuery = '';
    this.showAddItemModal = true;
    if (this.allItems.length === 0) {
      this.menuItemService.getAll().subscribe({
        next: (items) => { this.allItems = items; },
        error: () => { this.toast.error('Erro ao carregar itens.'); }
      });
    }
  }

  get filteredModalItems(): MenuItem[] {
    const q = this.itemSearchQuery.toLowerCase().trim();
    const currentIds = new Set(this.addItemTargetCategory?.items?.map(i => i.id) ?? []);
    return this.allItems.filter(item =>
      !currentIds.has(item.id) &&
      (!q || item.name.toLowerCase().includes(q) || (item.description?.toLowerCase().includes(q) ?? false))
    );
  }

  selectExistingItem(item: MenuItem): void {
    if (!this.addItemTargetCategory) return;
    this.categoryService.addItem(this.addItemTargetCategory.id, item.id).subscribe({
      next: (added) => {
        this.addItemTargetCategory!.items = [...(this.addItemTargetCategory!.items ?? []), added];
        this.categories = [...this.categories];
        this.toast.success(`"${item.name}" adicionado à categoria.`);
      },
      error: () => { this.toast.error('Erro ao adicionar item.'); }
    });
  }

  createNewItemForCategory(): void {
    if (!this.addItemTargetCategory) return;
    this.showAddItemModal = false;
    this.router.navigate(['/items/new'], { queryParams: { categoryId: this.addItemTargetCategory.id } });
  }

  closeAddItemModal(): void {
    this.showAddItemModal = false;
    this.addItemTargetCategory = null;
    this.itemSearchQuery = '';
  }

  deleteItem(itemId: number, category: Category): void {
    this.categoryService.removeItem(category.id, itemId).subscribe({
      next: () => {
        category.items = category.items?.filter(i => i.id !== itemId);
        this.categories = [...this.categories];
        this.allItems = [];
      },
      error: () => { this.toast.error('Erro ao remover item da categoria.'); }
    });
  }

  // ── Drag & Drop (categorias) ────────────────────────

  onCategoryDragStart(event: DragEvent, index: number): void {
    this.dragSourceIndex = index;
    this.isDraggingCategory = true;
    event.dataTransfer?.setData('text/plain', String(index));
  }

  onCategoryDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onCategoryDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    if (this.dragSourceIndex === null || this.dragSourceIndex === targetIndex) return;

    const updated = [...this.categories];
    const [moved] = updated.splice(this.dragSourceIndex, 1);
    updated.splice(targetIndex, 0, moved);

    updated.forEach((c, i) => c.order = i + 1);
    this.categories = updated;

    this.categoryService.reorder(updated.map(c => ({ id: c.id, order: c.order }))).subscribe();
    this.dragSourceIndex = null;
    this.isDraggingCategory = false;
  }

  onCategoryDragEnd(): void {
    this.dragSourceIndex = null;
    this.isDraggingCategory = false;
  }

  // ── Drag & Drop (itens dentro de categoria) ─────────

  onItemDragStart(event: DragEvent, categoryIndex: number, itemIndex: number): void {
    this.dragSourceCategoryIndex = categoryIndex;
    this.dragSourceItemIndex = itemIndex;
    this.isDraggingItem = true;
    event.dataTransfer?.setData('text/plain', `${categoryIndex},${itemIndex}`);
  }

  onItemDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onItemDrop(event: DragEvent, targetCategoryIndex: number, targetItemIndex: number): void {
    event.preventDefault();
    if (this.dragSourceCategoryIndex === null || this.dragSourceItemIndex === null) return;
    if (this.dragSourceCategoryIndex !== targetCategoryIndex) return; // only reorder within same category

    const category = this.categories[targetCategoryIndex];
    const items = [...(category.items || [])];
    const [moved] = items.splice(this.dragSourceItemIndex, 1);
    items.splice(targetItemIndex, 0, moved);

    items.forEach((it, i) => it.order = i + 1);
    category.items = items;
    this.categories = [...this.categories];

    this.menuItemService.reorder(items.map(it => ({ id: it.id, order: it.order }))).subscribe();

    this.dragSourceCategoryIndex = null;
    this.dragSourceItemIndex = null;
    this.isDraggingItem = false;
  }

  onItemDragEnd(): void {
    this.dragSourceCategoryIndex = null;
    this.dragSourceItemIndex = null;
    this.isDraggingItem = false;
  }
}
