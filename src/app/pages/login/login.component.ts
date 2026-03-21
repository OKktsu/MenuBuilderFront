import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  currentSlide = 0;
  totalSlides = 2;
  private intervalId: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.startSlideshow();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  onLogin() {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'E-mail ou senha inválidos.';
      }
    });
  }

  startSlideshow() {
    if (typeof window !== 'undefined') {
      this.intervalId = setInterval(() => {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
      }, 5000);
    }
  }

  setSlide(index: number) {
    this.currentSlide = index;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.startSlideshow();
  }
}
