import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <footer class="border-t border-white/10 bg-surface mt-24">
      <div class="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <span class="text-slate-500 text-sm">
          &copy; {{ year }} Carlos Esteban Peña. {{ 'FOOTER.MADE_WITH' | translate }}
        </span>
        <nav aria-label="Footer navigation" class="flex items-center gap-6">
          <a href="https://www.linkedin.com/in/carlos-esteban-pena" target="_blank" rel="noopener noreferrer"
             class="text-slate-400 hover:text-primary-light transition-colors text-sm">LinkedIn</a>
          <a href="https://github.com/yourhandle" target="_blank" rel="noopener noreferrer"
             class="text-slate-400 hover:text-primary-light transition-colors text-sm">GitHub</a>
          <a routerLink="/blog" class="text-slate-400 hover:text-primary-light transition-colors text-sm">
            {{ 'NAV.BLOG' | translate }}
          </a>
          <a routerLink="/chat" class="text-slate-400 hover:text-primary-light transition-colors text-sm">
            {{ 'NAV.CHAT_CTA' | translate }}
          </a>
        </nav>
      </div>
    </footer>
  `
})
export class FooterComponent {
  year = new Date().getFullYear();
}
