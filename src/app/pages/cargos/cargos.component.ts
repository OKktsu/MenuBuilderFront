import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CargoService, CargoResponse, TODAS_PERMISSOES } from '../../services/cargo.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-cargos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cargos.component.html',
  styleUrl: './cargos.component.scss'
})
export class CargosComponent implements OnInit {
  cargos: CargoResponse[] = [];
  todasPermissoes = TODAS_PERMISSOES;

  loading = true;
  saving = false;

  // Painel lateral: null = fechado, 'novo' | número = aberto
  painelAberto: 'novo' | number | null = null;
  form!: FormGroup;

  // Confirmação de exclusão
  cargoParaExcluir: CargoResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private cargoService: CargoService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.inicializarForm();
    this.carregarCargos();
  }

  // ── Carregamento ─────────────────────────────────────────────────────────

  carregarCargos(): void {
    this.loading = true;
    this.cargoService.getAll().subscribe({
      next: (data) => { this.cargos = data; this.loading = false; },
      error: () => { this.toast.error('Erro ao carregar cargos.'); this.loading = false; }
    });
  }

  // ── Formulário ───────────────────────────────────────────────────────────

  inicializarForm(cargo?: CargoResponse): void {
    const permissoesSelecionadas = cargo?.permissoes ?? [];
    const permissoesGroup: Record<string, boolean> = {};
    this.todasPermissoes.forEach(p => {
      permissoesGroup[p.valor] = permissoesSelecionadas.includes(p.valor);
    });

    this.form = this.fb.group({
      nome: [cargo?.nome ?? '', [Validators.required, Validators.maxLength(100)]],
      permissoes: this.fb.group(permissoesGroup)
    });
  }

  abrirNovo(): void {
    this.inicializarForm();
    this.painelAberto = 'novo';
  }

  abrirEdicao(cargo: CargoResponse): void {
    this.inicializarForm(cargo);
    this.painelAberto = cargo.id;
  }

  fecharPainel(): void {
    this.painelAberto = null;
  }

  // ── Salvar ───────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving = true;

    const { nome, permissoes } = this.form.value;
    const permissoesSelecionadas: string[] = Object.entries(permissoes)
      .filter(([, selecionado]) => selecionado)
      .map(([valor]) => valor);

    const payload = { nome, permissoes: permissoesSelecionadas };

    if (this.painelAberto === 'novo') {
      this.cargoService.create(payload).subscribe({
        next: (novo) => {
          this.cargos = [...this.cargos, novo];
          this.saving = false;
          this.painelAberto = null;
          this.toast.success(`Cargo "${novo.nome}" criado com sucesso!`);
        },
        error: (err) => {
          this.saving = false;
          const msg = err?.error?.message ?? 'Erro ao criar cargo.';
          this.toast.error(msg);
        }
      });
    } else {
      const id = this.painelAberto as number;
      this.cargoService.update(id, payload).subscribe({
        next: () => {
          this.cargos = this.cargos.map(c =>
            c.id === id ? { ...c, nome, permissoes: permissoesSelecionadas } : c
          );
          this.saving = false;
          this.painelAberto = null;
          this.toast.success('Cargo atualizado com sucesso!');
        },
        error: (err) => {
          this.saving = false;
          const msg = err?.error?.message ?? 'Erro ao atualizar cargo.';
          this.toast.error(msg);
        }
      });
    }
  }

  // ── Exclusão ─────────────────────────────────────────────────────────────

  confirmarExclusao(cargo: CargoResponse): void {
    this.cargoParaExcluir = cargo;
  }

  cancelarExclusao(): void {
    this.cargoParaExcluir = null;
  }

  excluir(): void {
    if (!this.cargoParaExcluir) return;
    const { id, nome } = this.cargoParaExcluir;
    this.cargoParaExcluir = null;

    this.cargoService.delete(id).subscribe({
      next: () => {
        this.cargos = this.cargos.filter(c => c.id !== id);
        if (this.painelAberto === id) this.painelAberto = null;
        this.toast.success(`Cargo "${nome}" excluído.`);
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Erro ao excluir cargo.';
        this.toast.error(msg);
      }
    });
  }

  // ── Utilitários ──────────────────────────────────────────────────────────

  get labelPainel(): string {
    return this.painelAberto === 'novo' ? 'Novo Cargo' : 'Editar Cargo';
  }

  temPermissao(permissao: string): boolean {
    return !!this.form.get('permissoes')?.get(permissao)?.value;
  }
}
