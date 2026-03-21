import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;
  error: string | null = null;
  success: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService
  ) {
    this.signupForm = this.fb.group({
      // restaurantName: ['', [Validators.required]],
      nomeCompleto: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      terms: [false, [Validators.requiredTrue]]
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.loading = true;
      this.error = null;
      this.success = false;

      this.authService.signup(this.signupForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          this.success = true;
          console.log('Signup successful', response);
          // Optional: redirect to login or dashboard after a delay
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Ocorreu um erro ao criar a conta. Tente novamente.';
          console.error('Signup error', err);
        }
      });
    }
  }
}
