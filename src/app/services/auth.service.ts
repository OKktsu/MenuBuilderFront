import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://menubuilderback-h3gkg5gdbmgbd3c0.brazilsouth-01.azurewebsites.net/api/Auth';

  constructor(private http: HttpClient, private router: Router) { }

  signup(model: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/register`, model);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): { name: string; email: string } | null {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }

    // Fallback: decode from JWT
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        name:  payload.nomeCompleto || payload.name || payload.unique_name || 'Usuário',
        email: payload.email || payload.sub || ''
      };
    } catch {
      return null;
    }
  }
}
