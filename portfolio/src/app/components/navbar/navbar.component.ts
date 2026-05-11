import { Component, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  styles: [`
    .nav-link {
      color: #94a3b8;
      padding: 0.3rem 0.75rem;
      border-radius: 9999px;
      border: 1px solid transparent;
      transition: color .2s, background .2s, border-color .2s;
    }
    .nav-link:hover { color: #fff; }
    .nav-link.active {
      color: #818cf8;
      background: rgba(99, 102, 241, 0.12);
      border-color: rgba(99, 102, 241, 0.25);
    }
  `],
  template: `
    <header
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      [class.backdrop-blur-md]="scrolled()"
      [class.bg-surface]="scrolled()"
      [class.border-b]="scrolled()"
      [class.border-white/10]="scrolled()">
      <nav class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between" aria-label="Main navigation">

        <a routerLink="/" class="font-bold text-xl text-white hover:text-primary-light transition-colors">
          &lt;Carlos /&gt;
        </a>

        <!-- Desktop links -->
        <ul class="hidden md:flex items-center gap-8" role="list">
          @for (link of navLinks; track link.key) {
            <li>
              <a
                [routerLink]="link.path"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: link.path === '/' }"
                class="nav-link text-sm font-medium">
                {{ link.key | translate }}
              </a>
            </li>
          }
        </ul>

        <div class="hidden md:flex items-center gap-3">
          <!-- Language switcher -->
          <button
            (click)="langSvc.toggle()"
            class="px-3 py-1.5 rounded-btn border border-white/20 hover:border-primary/40
                   text-slate-300 hover:text-white text-xs font-mono font-semibold
                   transition-all duration-200"
            [attr.aria-label]="'Switch to ' + (langSvc.current() === 'es' ? 'English' : 'Español')">
            {{ langSvc.current() === 'es' ? 'EN' : 'ES' }}
          </button>

          <!-- Chat CTA -->
          <a routerLink="/chat"
             class="inline-flex items-center gap-2 px-4 py-2 rounded-btn
                    bg-primary hover:bg-primary-dark text-white text-sm font-semibold
                    transition-colors duration-200">
            {{ 'NAV.CHAT_CTA' | translate }}
          </a>
        </div>

        <!-- Mobile: lang + menu toggle -->
        <div class="md:hidden flex items-center gap-2">
          <button
            (click)="langSvc.toggle()"
            class="px-2.5 py-1 rounded border border-white/20 text-slate-300 text-xs font-mono font-semibold">
            {{ langSvc.current() === 'es' ? 'EN' : 'ES' }}
          </button>
          <button
            (click)="mobileOpen.set(!mobileOpen())"
            class="text-slate-400 hover:text-white"
            [attr.aria-expanded]="mobileOpen()"
            aria-controls="mobile-menu"
            aria-label="Toggle menu">
            @if (mobileOpen()) {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            } @else {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            }
          </button>
        </div>
      </nav>

      <!-- Mobile menu -->
      @if (mobileOpen()) {
        <div id="mobile-menu" class="md:hidden bg-surface-alt border-t border-white/10 px-6 py-4 space-y-3">
          @for (link of navLinks; track link.key) {
            <a
              [routerLink]="link.path"
              (click)="mobileOpen.set(false)"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: link.path === '/' }"
              class="nav-link block py-2 font-medium">
              {{ link.key | translate }}
            </a>
          }
          <a routerLink="/chat" (click)="mobileOpen.set(false)"
             class="block text-center mt-2 px-4 py-2 rounded-btn bg-primary text-white font-semibold">
            {{ 'NAV.CHAT_CTA' | translate }}
          </a>
        </div>
      }
    </header>
  `
})
export class NavbarComponent {
  scrolled = signal(false);
  mobileOpen = signal(false);

  navLinks = [
    { key: 'NAV.HOME', path: '/' },
    { key: 'NAV.PROJECTS', path: '/projects' },
    { key: 'NAV.BLOG', path: '/blog' },
    { key: 'NAV.CV', path: '/cv' },
  ];

  constructor(public langSvc: LanguageService) {}

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 20);
  }
}
