import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuncionarioService, FuncionarioResponse } from '../../services/funcionario.service';
import { ConviteService, ConviteResponse } from '../../services/convite.service';
import { CargoService, CargoResponse } from '../../services/cargo.service';
import { ToastService } from '../../shared/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './funcionarios.component.html',
  styleUrl: './funcionarios.component.scss'
})
export class FuncionariosComponent implements OnInit {
  abaAtiva: 'equipe' | 'convites' = 'equipe';

  funcionarios: FuncionarioResponse[] = [];
  convites: ConviteResponse[] = [];
  cargos: CargoResponse[] = [];

  loadingFuncionarios = true;
  loadingConvites = true;

  // Modal de convite
  modalConvite = false;
  conviteForm!: FormGroup;
  enviandoConvite = false;
  linkConviteGerado: string | null = null;

  // Modal de troca de cargo
  modalCargo: FuncionarioResponse | null = null;
  cargoSelecionado: number | null = null;
  salvandoCargo = false;

  // Confirmação de remoção
  funcionarioParaRemover: FuncionarioResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private funcionarioService: FuncionarioService,
    private conviteService: ConviteService,
    private cargoService: CargoService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.conviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      cargoId: [null, Validators.required]
    });

    this.carregarFuncionarios();
    this.carregarConvites();
    this.carregarCargos();
  }

  // ── Carregamentos ─────────────────────────────────────────────────────────

  carregarFuncionarios(): void {
    this.loadingFuncionarios = true;
    this.funcionarioService.getAll().subscribe({
      next: (data) => { this.funcionarios = data; this.loadingFuncionarios = false; },
      error: () => { this.toast.error('Erro ao carregar equipe.'); this.loadingFuncionarios = false; }
    });
  }

  carregarConvites(): void {
    this.loadingConvites = true;
    this.conviteService.listar().subscribe({
      next: (data) => { this.convites = data; this.loadingConvites = false; },
      error: () => { this.toast.error('Erro ao carregar convites.'); this.loadingConvites = false; }
    });
  }

  carregarCargos(): void {
    this.cargoService.getAll().subscribe({
      next: (data) => { this.cargos = data; },
      error: () => {}
    });
  }

  // ── Convites ──────────────────────────────────────────────────────────────

  abrirModalConvite(): void {
    this.conviteForm.reset();
    this.linkConviteGerado = null;
    this.modalConvite = true;
  }

  fecharModalConvite(): void {
    this.modalConvite = false;
    this.linkConviteGerado = null;
  }

  enviarConvite(): void {
    if (this.conviteForm.invalid) return;
    this.enviandoConvite = true;
    this.linkConviteGerado = null;

    this.conviteService.enviar(this.conviteForm.value).subscribe({
      next: (convite) => {
        this.enviandoConvite = false;
        this.linkConviteGerado = `${environment.frontUrl}/convite/${convite.token}`;
        this.convites = [convite, ...this.convites];
        this.toast.success('Convite criado! Copie o link e compartilhe.');
      },
      error: (err) => {
        this.enviandoConvite = false;
        this.toast.error(err?.error?.message ?? 'Erro ao criar convite.');
      }
    });
  }

  copiarLink(): void {
    if (!this.linkConviteGerado) return;
    navigator.clipboard.writeText(this.linkConviteGerado).then(() =>
      this.toast.success('Link copiado!')
    );
  }

  cancelarConvite(convite: ConviteResponse): void {
    this.conviteService.cancelar(convite.id).subscribe({
      next: () => {
        this.convites = this.convites.filter(c => c.id !== convite.id);
        this.toast.success('Convite cancelado.');
      },
      error: () => this.toast.error('Erro ao cancelar convite.')
    });
  }

  // ── Troca de cargo ────────────────────────────────────────────────────────

  abrirModalCargo(funcionario: FuncionarioResponse): void {
    this.modalCargo = funcionario;
    this.cargoSelecionado = funcionario.cargoId;
  }

  fecharModalCargo(): void {
    this.modalCargo = null;
  }

  salvarCargo(): void {
    if (!this.modalCargo || !this.cargoSelecionado) return;
    this.salvandoCargo = true;

    this.funcionarioService.alterarCargo(this.modalCargo.userId, this.cargoSelecionado).subscribe({
      next: () => {
        const cargoNome = this.cargos.find(c => c.id === this.cargoSelecionado)?.nome ?? '';
        this.funcionarios = this.funcionarios.map(f =>
          f.userId === this.modalCargo!.userId
            ? { ...f, cargoId: this.cargoSelecionado, cargoNome }
            : f
        );
        this.salvandoCargo = false;
        this.modalCargo = null;
        this.toast.success('Cargo atualizado com sucesso!');
      },
      error: (err) => {
        this.salvandoCargo = false;
        this.toast.error(err?.error?.message ?? 'Erro ao alterar cargo.');
      }
    });
  }

  // ── Remoção ───────────────────────────────────────────────────────────────

  confirmarRemocao(funcionario: FuncionarioResponse): void {
    this.funcionarioParaRemover = funcionario;
  }

  cancelarRemocao(): void {
    this.funcionarioParaRemover = null;
  }

  remover(): void {
    if (!this.funcionarioParaRemover) return;
    const { userId, nomeCompleto } = this.funcionarioParaRemover;
    this.funcionarioParaRemover = null;

    this.funcionarioService.remover(userId).subscribe({
      next: () => {
        this.funcionarios = this.funcionarios.filter(f => f.userId !== userId);
        this.toast.success(`${nomeCompleto} foi removido da empresa.`);
      },
      error: (err) => this.toast.error(err?.error?.message ?? 'Erro ao remover funcionário.')
    });
  }

  // ── Utilitários ──────────────────────────────────────────────────────────

  get convitesPendentes(): ConviteResponse[] {
    return this.convites.filter(c => c.status === 'Pendente');
  }

  badgeStatus(status: string): string {
    const map: Record<string, string> = {
      Pendente:  'bg-yellow-100 text-yellow-700',
      Aceito:    'bg-green-100 text-green-700',
      Recusado:  'bg-red-100 text-red-700',
      Expirado:  'bg-slate-100 text-slate-500'
    };
    return map[status] ?? 'bg-slate-100 text-slate-500';
  }

  inicialNome(nome: string): string {
    return nome ? nome.charAt(0).toUpperCase() : '?';
  }
}
