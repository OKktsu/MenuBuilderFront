import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm font-sans anim-fade-in">
      
      <!-- Container do Spinner: Menu Book -->
      <div class="relative w-56 h-56 flex items-center justify-center">
        
        <!-- Sombra Dinâmica -->
        <div class="absolute -bottom-6 w-24 h-2 bg-black/5 rounded-full blur-sm animate-shadow"></div>

        <!-- Livro/Cardápio Animado -->
        <div class="menu-bookScale">
          <div class="menu-book">
            <div class="menu-page page-left"></div>
            <div class="menu-page page-right"></div>
            <div class="menu-page page-flipping"></div>
          </div>
        </div>

        <!-- Ícone flutuante de 'Check' -->
        <div class="absolute top-8 -right-1 bg-brand-500 text-white p-1.5 rounded-full shadow-lg animate-bounce-custom">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <!-- Texto de Feedback -->
      <div class="mt-4 text-center">
        <h2 class="text-xl font-bold text-slate-800 tracking-tight">
          {{ message() }}
        </h2>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .anim-fade-in {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .menu-bookScale {
      transform: scale(1.8);
    }

    .menu-book {
      position: relative;
      width: 60px;
      height: 80px;
      background: #f8fafc;
      border: 3px solid #1e293b;
      border-radius: 4px;
      perspective: 1000px;
    }

    .menu-page {
      position: absolute;
      top: 0;
      width: 50%;
      height: 100%;
      background: white;
      border: 1.5px solid #1e293b;
    }

    .page-left {
      left: 0;
      border-radius: 2px 0 0 2px;
      z-index: 1;
      background-image: linear-gradient(90deg, transparent 80%, rgba(0,0,0,0.05) 100%);
    }

    .page-right {
      right: 0;
      border-radius: 0 2px 2px 0;
      z-index: 1;
      background-image: linear-gradient(-90deg, transparent 80%, rgba(0,0,0,0.05) 100%);
    }

    .page-flipping {
      right: 0;
      border-radius: 0 2px 2px 0;
      z-index: 2;
      transform-origin: left center;
      animation: flip-page 1.5s infinite ease-in-out;
      background: #fff;
    }

    .menu-page::after {
      content: '';
      position: absolute;
      top: 20%;
      left: 20%;
      width: 60%;
      height: 2px;
      background: #e2e8f0;
      box-shadow: 0 8px 0 #e2e8f0, 0 16px 0 #e2e8f0, 0 24px 0 #e2e8f0;
    }

    @keyframes flip-page {
      0% { transform: rotateY(0deg); }
      50% { transform: rotateY(-180deg); }
      100% { transform: rotateY(-180deg); opacity: 0; }
    }

    @keyframes shadow-pulse {
      0%, 100% { transform: scaleX(1); opacity: 0.1; }
      50% { transform: scaleX(1.4); opacity: 0.05; }
    }

    .animate-shadow {
      animation: shadow-pulse 1.5s infinite ease-in-out;
    }

    .animate-bounce-custom {
      animation: float-slow 3.5s infinite ease-in-out;
    }

    @keyframes float-slow {
      0%, 100% { transform: translateY(-30%); }
      50% { transform: translateY(0); }
    }
  `]
})
export class LoadingSpinnerComponent {
  message = input<string>('Organizando seu Menu...');
}
