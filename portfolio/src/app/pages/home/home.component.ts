import { Component, AfterViewInit, PLATFORM_ID, inject, ElementRef, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ParticleBgComponent } from '../../components/particle-bg/particle-bg.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TranslatePipe, ParticleBgComponent],
  template: `
    <!-- Hero -->
    <section class="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-surface via-surface to-surface-alt pointer-events-none" aria-hidden="true"></div>
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>
      <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>
      <app-particle-bg></app-particle-bg>

      <div id="heroContent" #heroContent class="relative z-10 text-center max-w-4xl mx-auto backdrop-blur-sm rounded-2xl px-8 py-10 bg-[#0e142a] shadow-[0_0_30px_rgba(19,24,42,0.8)]">
        <p class="text-primary-light font-mono text-sm mb-4 tracking-widest uppercase">
          {{ 'HOME.BADGE' | translate }}
        </p>
        <h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          {{ 'HOME.GREETING' | translate }}
          <span class="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent block mt-2">
            Carlos Esteban
          </span>
        </h1>
        <p class="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
           [innerHTML]="'HOME.DESCRIPTION' | translate">
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a routerLink="/projects"
             class="px-8 py-3.5 rounded-btn bg-primary hover:bg-primary-dark text-white font-semibold
                    transition-colors duration-200 w-full sm:w-auto">
            {{ 'HOME.BTN_PROJECTS' | translate }}
          </a>
          <a routerLink="/chat"
             class="px-8 py-3.5 rounded-btn border border-white/20 hover:border-primary/50
                    text-white font-semibold transition-all duration-200 w-full sm:w-auto hover:bg-primary/10">
            {{ 'HOME.BTN_CHAT' | translate }}
          </a>
        </div>
      </div>

      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 text-xs">
        <span>{{ 'HOME.SCROLL' | translate }}</span>
        <div class="w-px h-8 bg-gradient-to-b from-slate-500 to-transparent"></div>
      </div>
    </section>

    <!-- Skills -->
    <section class="py-24 px-6 bg-surface-alt/50">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-4">{{ 'HOME.SKILLS_TITLE' | translate }}</h2>
        <p class="text-slate-400 text-center mb-16 max-w-xl mx-auto">{{ 'HOME.SKILLS_SUBTITLE' | translate }}</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          @for (skill of skills; track skill.name) {
            <div class="bg-surface-card rounded-card p-5 border border-white/10
                        hover:border-primary/40 hover:shadow-glow transition-all duration-300">
              <div class="text-3xl mb-3">{{ skill.icon }}</div>
              <h3 class="font-semibold text-white text-sm">{{ skill.name }}</h3>
              <p class="text-slate-500 text-xs mt-1">{{ skill.category }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="py-24 px-6">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-16">{{ 'HOME.STATS_TITLE' | translate }}</h2>
        <div class="grid md:grid-cols-3 gap-6 text-center">
          <div class="bg-surface-alt rounded-card p-8 border border-white/10">
            <p class="text-4xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent mb-2">
              {{ 'HOME.STATS.YEARS_VALUE' | translate }}
            </p>
            <p class="text-slate-400 text-sm">{{ 'HOME.STATS.YEARS_LABEL' | translate }}</p>
          </div>
          <div class="bg-surface-alt rounded-card p-8 border border-white/10">
            <p class="text-4xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent mb-2">
              {{ 'HOME.STATS.TEAM_VALUE' | translate }}
            </p>
            <p class="text-slate-400 text-sm">{{ 'HOME.STATS.TEAM_LABEL' | translate }}</p>
          </div>
          <div class="bg-surface-alt rounded-card p-8 border border-white/10">
            <p class="text-4xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent mb-2">
              {{ 'HOME.STATS.EVENTS_VALUE' | translate }}
            </p>
            <p class="text-slate-400 text-sm">{{ 'HOME.STATS.EVENTS_LABEL' | translate }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- AI CTA -->
    <section class="py-24 px-6 bg-surface-alt/30">
      <div class="max-w-4xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-primary-light text-sm mb-6">
          <span>✨</span> {{ 'HOME.AI_BADGE' | translate }}
        </div>
        <h2 class="text-3xl md:text-4xl font-bold mb-6">{{ 'HOME.AI_TITLE' | translate }}</h2>
        <p class="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">{{ 'HOME.AI_DESC' | translate }}</p>
        <a routerLink="/chat"
           class="inline-flex items-center gap-3 px-8 py-4 rounded-card bg-gradient-to-r
                  from-primary to-primary-dark text-white font-semibold text-lg
                  hover:shadow-glow transition-all duration-300">
          {{ 'HOME.AI_BTN' | translate }}
        </a>
      </div>
    </section>
  `
})
export class HomeComponent implements AfterViewInit {
  heroContent = viewChild<ElementRef>('heroContent');
  private platformId = inject(PLATFORM_ID);

  skills = [
    { icon: '☕', name: 'Java / Spring', category: 'Backend' },
    { icon: '🅰️', name: 'Angular', category: 'Frontend' },
    { icon: '🗄️', name: 'Oracle / MySQL', category: 'Databases' },
    { icon: '🔗', name: 'REST & SOAP', category: 'Web Services' },
    { icon: '🧪', name: 'JUnit / Mockito', category: 'Testing' },
    { icon: '🏃', name: 'Scrum / Agile', category: 'Methodology' },
    { icon: '🐳', name: 'Maven / Git', category: 'DevOps' },
    { icon: '🤖', name: 'Claude API', category: 'AI' },
  ];

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    import('gsap').then(({ gsap }) => {
      gsap.to(this.heroContent()!.nativeElement, {
        opacity: 1, y: 0, from: { y: 40 }, duration: 1, ease: 'power3.out', delay: 0.2,
      });
    });
  }
}
