import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, map, catchError, of } from 'rxjs';

const TOKEN_KEY = '_at';
const USER_KEY  = '_u';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private _authenticated = signal(false);
  private _username = signal<string>('');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this._authenticated.set(!!sessionStorage.getItem(TOKEN_KEY));
      this._username.set(sessionStorage.getItem(USER_KEY) ?? '');
    }
  }

  get isAuthenticated() { return this._authenticated; }
  get username()        { return this._username; }

  login(username: string, password: string): Observable<{ ok: boolean; error?: string }> {
    return this.http.post<{ token: string }>('/api/auth/login', { username, password }).pipe(
      map(res => {
        if (isPlatformBrowser(this.platformId)) {
          sessionStorage.setItem(TOKEN_KEY, res.token);
          sessionStorage.setItem(USER_KEY, username);
        }
        this._authenticated.set(true);
        this._username.set(username);
        return { ok: true };
      }),
      catchError(err => {
        const status = err.status as number;
        if (status === 429) return of({ ok: false, error: 'too_many' });
        if (status === 401) return of({ ok: false, error: 'invalid' });
        return of({ ok: false, error: 'unavailable' });
      })
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    }
    this._authenticated.set(false);
    this._username.set('');
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return sessionStorage.getItem(TOKEN_KEY);
  }
}
