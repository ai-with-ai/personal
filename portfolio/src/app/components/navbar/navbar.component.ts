import { Component, signal, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';
import { LogService } from '../../services/log.service';

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
    @keyframes dropdown-in {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .dropdown-enter { animation: dropdown-in .15s ease-out forwards; }
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

          <!-- Log viewer (authenticated only) -->
          @if (auth.isAuthenticated()) {
            <button
              (click)="logSvc.toggle()"
              title="Server logs"
              [class.text-indigo-400]="logSvc.panelOpen()"
              class="p-1.5 rounded-btn border border-white/20 hover:border-primary/40
                     text-slate-400 hover:text-white transition-all duration-200"
              aria-label="Open server logs">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity="0.5" d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5Z" fill="currentColor"/>
                <path d="M7 9L11 13L7 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13 17H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          }

          <!-- User menu (authenticated only) -->
          @if (auth.isAuthenticated()) {
            <div class="relative">
              <button
                (click)="toggleDropdown($event)"
                class="flex items-center gap-2 px-3 py-1.5 rounded-btn border border-white/20
                       hover:border-primary/40 text-slate-300 hover:text-white text-sm
                       transition-all duration-200"
                aria-haspopup="true"
                [attr.aria-expanded]="dropdownOpen()">
                <!-- Solar Duotone user icon -->
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle opacity="0.5" cx="12" cy="7" r="4" fill="currentColor"/>
                  <path opacity="0.5" d="M3 20C3 16.9624 7.02944 14.5 12 14.5C16.9706 14.5 21 16.9624 21 20V20.5C21 20.7761 20.7761 21 20.5 21H3.5C3.22386 21 3 20.7761 3 20.5V20Z" fill="currentColor"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M3 20C3 16.9624 7.02944 14.5 12 14.5C16.9706 14.5 21 16.9624 21 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <span class="max-w-[120px] truncate font-medium">{{ auth.username() }}</span>
                <!-- Chevron -->
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                     aria-hidden="true" class="transition-transform duration-200"
                     [style.transform]="dropdownOpen() ? 'rotate(180deg)' : 'rotate(0deg)'">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>

              @if (dropdownOpen()) {
                <div class="dropdown-enter absolute right-0 top-full mt-2 w-48 rounded-card
                            bg-surface-alt border border-white/10 shadow-xl z-50 overflow-hidden">
                  <div class="px-4 py-3 border-b border-white/10">
                    <p class="text-xs text-slate-500 mb-0.5">Signed in as</p>
                    <p class="text-sm text-white font-semibold truncate">{{ auth.username() }}</p>
                  </div>
                  <button
                    (click)="logout()"
                    class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-400
                           hover:text-white hover:bg-white/5 transition-colors">
                    <!-- Solar Duotone logout/exit icon -->
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path opacity="0.5" d="M9 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H9" fill="currentColor"/>
                      <path d="M9 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M15 17L20 12L15 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M20 12H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                    Log out
                  </button>
                </div>
              }
            </div>
          }
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
          @if (auth.isAuthenticated()) {
            <button (click)="logSvc.toggle()"
                    class="flex items-center gap-2 py-2 text-sm transition-colors"
                    [class.text-indigo-400]="logSvc.panelOpen()"
                    [class.text-slate-400]="!logSvc.panelOpen()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path opacity="0.5" d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5Z" fill="currentColor"/>
                <path d="M7 9L11 13L7 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13 17H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              Server Logs
            </button>
          }

          @if (auth.isAuthenticated()) {
            <div class="pt-3 mt-1 border-t border-white/10">
              <div class="flex items-center gap-2 py-1 text-slate-400 text-sm mb-1">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle opacity="0.5" cx="12" cy="7" r="4" fill="currentColor"/>
                  <path opacity="0.5" d="M3 20C3 16.9624 7.02944 14.5 12 14.5C16.9706 14.5 21 16.9624 21 20V20.5C21 20.7761 20.7761 21 20.5 21H3.5C3.22386 21 3 20.7761 3 20.5V20Z" fill="currentColor"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M3 20C3 16.9624 7.02944 14.5 12 14.5C16.9706 14.5 21 16.9624 21 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <span class="text-white font-medium truncate">{{ auth.username() }}</span>
              </div>
              <button (click)="logout()"
                      class="flex items-center gap-2 py-2 text-sm text-slate-400 hover:text-white transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path opacity="0.5" d="M9 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H9" fill="currentColor"/>
                  <path d="M9 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M15 17L20 12L15 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M20 12H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                Log out
              </button>
            </div>
          }
        </div>
      }
    </header>
  `
})
export class NavbarComponent {
  scrolled     = signal(false);
  mobileOpen   = signal(false);
  dropdownOpen = signal(false);

  langSvc = inject(LanguageService);
  auth    = inject(AuthService);
  logSvc  = inject(LogService);
  private router  = inject(Router);

  navLinks = [
    { key: 'NAV.HOME',     path: '/' },
    { key: 'NAV.PROJECTS', path: '/projects' },
    { key: 'NAV.BLOG',     path: '/blog' },
    { key: 'NAV.CV',       path: '/cv' },
  ];

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.dropdownOpen.update(v => !v);
  }

  logout() {
    this.auth.logout();
    this.dropdownOpen.set(false);
    this.mobileOpen.set(false);
    this.router.navigate(['/']);
  }

  @HostListener('window:scroll')
  onScroll() { this.scrolled.set(window.scrollY > 20); }

  @HostListener('document:click')
  onDocumentClick() { this.dropdownOpen.set(false); }
}
