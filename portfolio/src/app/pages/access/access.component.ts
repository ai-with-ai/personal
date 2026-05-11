import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-access',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[#070d1b] px-4">
      <div class="w-full max-w-sm">

        <!-- Logo mark -->
        <div class="flex justify-center mb-8">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                 stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
        </div>

        <!-- Card -->
        <div class="bg-surface border border-white/8 rounded-2xl p-8 shadow-2xl">
          <h1 class="text-xl font-semibold text-white text-center mb-1">Private access</h1>
          <p class="text-slate-500 text-sm text-center mb-8">This area is restricted.</p>

          <form (ngSubmit)="submit()" #f="ngForm" novalidate class="space-y-4">

            <div>
              <label class="block text-xs font-mono text-slate-400 mb-1.5">Username</label>
              <input
                type="text"
                name="username"
                [(ngModel)]="username"
                autocomplete="username"
                class="w-full bg-[#0d1526] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600
                       focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="username"
                [disabled]="loading()"
              />
            </div>

            <div>
              <label class="block text-xs font-mono text-slate-400 mb-1.5">Password</label>
              <div class="relative">
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  name="password"
                  [(ngModel)]="password"
                  autocomplete="current-password"
                  class="w-full bg-[#0d1526] border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-600
                         focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="••••••••"
                  [disabled]="loading()"
                />
                <button type="button" (click)="showPassword.set(!showPassword())"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  @if (showPassword()) {
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  }
                </button>
              </div>
            </div>

            @if (error()) {
              <div class="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {{ errorMessage() }}
              </div>
            }

            <button
              type="submit"
              [disabled]="loading() || !username || !password"
              class="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all
                     bg-gradient-to-r from-primary to-accent hover:opacity-90
                     disabled:opacity-40 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-primary/40 mt-2"
            >
              @if (loading()) {
                <span class="flex items-center justify-center gap-2">
                  <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Signing in…
                </span>
              } @else {
                Sign in
              }
            </button>

          </form>
        </div>

      </div>
    </div>
  `
})
export class AccessComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  username     = '';
  password     = '';
  loading      = signal(false);
  error        = signal(false);
  showPassword = signal(false);

  errorMessage = signal('');

  submit() {
    if (!this.username || !this.password || this.loading()) return;
    this.loading.set(true);
    this.error.set(false);

    this.auth.login(this.username, this.password).subscribe(result => {
      this.loading.set(false);
      if (result.ok) {
        this.router.navigate(['/']);
      } else {
        this.error.set(true);
        this.errorMessage.set(
          result.error === 'too_many'
            ? 'Too many attempts. Try again in 15 minutes.'
            : result.error === 'invalid'
              ? 'Invalid username or password.'
              : 'Service unavailable. Try again later.'
        );
      }
    });
  }
}
