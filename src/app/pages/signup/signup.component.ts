import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  loading = false;
  error: string | null = null;
  success: boolean = false;

  /** Quando vem de um link de convite, o token é armazenado aqui. */
  conviteToken: string | null = null;
  /** true = fluxo de convite (não exige NomeEmpresa) */
  get isConvite(): boolean { return !!this.conviteToken; }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.signupForm = this.fb.group({
      nomeCompleto: ['', [Validators.required]],
      nomeEmpresa:  [''],   // validação dinâmica aplicada no ngOnInit
      email:        ['', [Validators.required, Validators.email]],
      password:     ['', [Validators.required, Validators.minLength(8)]],
      terms:        [false, [Validators.requiredTrue]]
    });
  }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('convite');
    const email = this.route.snapshot.queryParamMap.get('email');

    if (token) {
      this.conviteToken = token;
      // No fluxo de convite não precisamos do nome da empresa
      this.signupForm.get('nomeEmpresa')?.clearValidators();
      if (email) this.signupForm.patchValue({ email });
    } else {
      this.signupForm.get('nomeEmpresa')?.setValidators([Validators.required]);
    }
    this.signupForm.get('nomeEmpresa')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.loading = true;
      this.error = null;
      this.success = false;

      const { terms, ...formData } = this.signupForm.value;
      const payload = this.conviteToken
        ? { ...formData, nomeEmpresa: undefined, conviteToken: this.conviteToken }
        : formData;

      this.authService.signup(payload).subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message ?? 'Ocorreu um erro ao criar a conta. Tente novamente.';
        }
      });
    }
  }
}
