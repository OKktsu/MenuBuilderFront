import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MenuItemService } from '../../../services/menu-item.service';
import { ToastService } from '../../../shared/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { MenuItem } from '../../../models/menu-item.model';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.scss'
})
export class ItemFormComponent implements OnInit {
  item: Partial<MenuItem> = {
    name: '',
    price: 0,
    description: '',
    ingredients: '',
    imagePath: '',
    tags: [] as string[]
  };

  isEditMode = false;
  itemId?: number;
  categoryIds: number[] = [];
  loading = false;
  currentTag = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private menuItemService: MenuItemService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.itemId = +id;
      this.loadItem(this.itemId);
    }

    const categoryId = this.route.snapshot.queryParamMap.get('categoryId');
    if (categoryId) {
      this.categoryIds = [+categoryId];
    }
  }

  loadItem(id: number): void {
    this.loading = true;
    this.menuItemService.getById(id).subscribe({
      next: (data) => {
        this.item = data;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Erro ao carregar item.');
        this.loading = false;
      }
    });
  }

  addTag(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = (input.value || '').trim();
    if (value && !this.item.tags?.includes(value)) {
      if (!this.item.tags) this.item.tags = [];
      this.item.tags.push(value);
    }
    input.value = '';
    this.currentTag = '';
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        alert('Por favor, selecione um arquivo de imagem.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.item.imagePath = e.target.result; // For preview and potentially base64 upload
      };
      reader.readAsDataURL(file);
    }
  }

  removeTag(tag: string): void {
    this.item.tags = this.item.tags?.filter(t => t !== tag);
  }

  onSubmit() {
    this.loading = true;
    const payload = { ...this.item, categoryIds: this.categoryIds };
    const request = this.isEditMode && this.itemId
      ? this.menuItemService.update(this.itemId, payload)
      : this.menuItemService.create(payload);

    request.subscribe({
      next: () => {
        this.loading = false;
        this.toast.success(this.isEditMode ? 'Item atualizado com sucesso.' : 'Item criado com sucesso.');
        this.router.navigate(['/items']);
      },
      error: () => {
        this.toast.error('Erro ao salvar item. Verifique os dados e tente novamente.');
        this.loading = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/items']);
  }
}
