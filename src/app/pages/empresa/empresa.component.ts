import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmpresaService, EmpresaResponse } from '../../services/empresa.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './empresa.component.html',
  styleUrl: './empresa.component.scss'
})
export class EmpresaComponent implements OnInit {
  form!: FormGroup;
  empresa: EmpresaResponse | null = null;
  loading = true;
  saving = false;
  logoPreview: string | null = null;
  copiado = false;

  constructor(
    private fb: FormBuilder,
    private empresaService: EmpresaService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(150)]],
      logoUrl: [null]
    });

    this.empresaService.getMinha().subscribe({
      next: (data) => {
        this.empresa = data;
        this.form.patchValue({ nome: data.nome, logoUrl: data.logoUrl });
        this.logoPreview = data.logoUrl;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Erro ao carregar dados da empresa.', 'error');
        this.loading = false;
      }
    });
  }

  onLogoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toast.show('Selecione um arquivo de imagem válido.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toast.show('A imagem deve ter no máximo 5 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.logoPreview = base64;
      this.form.patchValue({ logoUrl: base64 });
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.saving = true;
    const { nome, logoUrl } = this.form.value;

    this.empresaService.update({ nome, logoUrl }).subscribe({
      next: (data) => {
        this.empresa = data;
        this.logoPreview = data.logoUrl;
        this.form.patchValue({ logoUrl: data.logoUrl });
        this.saving = false;
        this.toast.show('Empresa atualizada com sucesso!', 'success');
      },
      error: () => {
        this.saving = false;
        this.toast.show('Erro ao salvar. Tente novamente.', 'error');
      }
    });
  }

  copiarCodigo(): void {
    if (!this.empresa) return;
    navigator.clipboard.writeText(this.empresa.codigoConvite).then(() => {
      this.copiado = true;
      setTimeout(() => (this.copiado = false), 2000);
    });
  }
}
