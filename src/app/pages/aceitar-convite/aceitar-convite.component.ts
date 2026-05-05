import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConviteService, ConviteInfoResponse } from '../../services/convite.service';
import { AuthService } from '../../services/auth.service';

type Estado = 'carregando' | 'valido' | 'invalido' | 'aceitando' | 'aceito' | 'erro';

@Component({
  selector: 'app-aceitar-convite',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './aceitar-convite.component.html',
  styleUrl: './aceitar-convite.component.scss'
})
export class AceitarConviteComponent implements OnInit {
  estado: Estado = 'carregando';
  info: ConviteInfoResponse | null = null;
  erroMsg = '';
  token = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private conviteService: ConviteService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    if (!this.token) { this.estado = 'invalido'; return; }

    this.conviteService.getInfo(this.token).subscribe({
      next: (info) => {
        this.info = info;
        this.estado = info.valido ? 'valido' : 'invalido';
      },
      error: () => { this.estado = 'invalido'; }
    });
  }

  aceitar(): void {
    this.estado = 'aceitando';
    this.conviteService.aceitar(this.token).subscribe({
      next: () => {
        this.estado = 'aceito';
        // Aguarda 2s para mostrar mensagem de sucesso, depois redireciona
        setTimeout(() => this.router.navigate(['/home']), 2000);
      },
      error: (err) => {
        this.estado = 'erro';
        this.erroMsg = err?.error?.message ?? 'Erro ao aceitar o convite.';
      }
    });
  }

  get linkLogin(): string {
    return `/login?redirect=/convite/${this.token}`;
  }

  get linkSignup(): string {
    return `/signup?convite=${this.token}&email=${this.info?.email ?? ''}`;
  }
}
