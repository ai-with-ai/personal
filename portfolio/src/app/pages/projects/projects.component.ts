import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

interface Project {
  titleKey: string;
  descKey: string;
  tags: string[];
  github?: string;
  url?: string;
  image?: string;
  featured: boolean;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <section class="min-h-screen py-24 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="mb-16">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ 'PROJECTS.TITLE' | translate }}</h1>
          <p class="text-slate-400 text-lg max-w-xl">{{ 'PROJECTS.SUBTITLE' | translate }}</p>
        </div>

        <!-- Featured -->
        <div class="grid md:grid-cols-2 gap-6 mb-6">
          @for (project of featured; track project.titleKey) {
            <div class="bg-surface-alt rounded-card p-6 border border-white/10
                        hover:border-primary/40 hover:shadow-glow transition-all duration-300">
              <div class="flex items-start justify-between mb-4">
                <span class="text-xs font-mono text-primary-light bg-primary/10 px-2 py-1 rounded">
                  {{ 'PROJECTS.BADGE_FEATURED' | translate }}
                </span>
                <div class="flex gap-3">
                  @if (project.github) {
                    <a [href]="project.github" target="_blank" rel="noopener noreferrer"
                       class="text-slate-400 hover:text-white transition-colors text-sm">
                      {{ 'PROJECTS.LINK_GITHUB' | translate }}
                    </a>
                  }
                  @if (project.url) {
                    <a [href]="project.url" target="_blank" rel="noopener noreferrer"
                       class="text-slate-400 hover:text-white transition-colors text-sm">
                      {{ 'PROJECTS.LINK_DEMO' | translate }}
                    </a>
                  }
                </div>
              </div>
              <div class="flex items-center gap-2.5 mb-2">
                @if (project.image) {
                  <img [src]="project.image" [alt]="project.titleKey | translate"
                       class="w-7 h-7 object-contain shrink-0" loading="lazy" />
                }
                <h2 class="text-xl font-bold text-white">{{ project.titleKey | translate }}</h2>
              </div>
              <p class="text-slate-400 text-sm mb-5 leading-relaxed">{{ project.descKey | translate }}</p>
              <div class="flex flex-wrap gap-2">
                @for (tag of project.tags; track tag) {
                  <span class="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">{{ tag }}</span>
                }
              </div>
            </div>
          }
        </div>

        <!-- Others -->
        <div class="grid md:grid-cols-3 gap-4">
          @for (project of others; track project.titleKey) {
            <div class="bg-surface-alt rounded-card overflow-hidden border border-white/10
                        hover:border-primary/30 transition-all duration-300">
              @if (project.image) {
                <div class="flex items-center justify-center h-24 bg-surface px-6 border-b border-white/8">
                  <img [src]="project.image" [alt]="project.titleKey | translate"
                       class="max-h-12 max-w-full object-contain" loading="lazy" />
                </div>
              }
              <div class="p-5">
              @if (project.url) {
                <a [href]="project.url" target="_blank" rel="noopener noreferrer"
                   class="text-slate-400 hover:text-white text-xs mb-3 block transition-colors">
                  {{ 'PROJECTS.LINK_DEMO' | translate }}
                </a>
              }
              <h3 class="text-lg font-bold text-white mb-2">{{ project.titleKey | translate }}</h3>
              <p class="text-slate-400 text-sm mb-4 leading-relaxed">{{ project.descKey | translate }}</p>
              <div class="flex flex-wrap gap-1.5">
                @for (tag of project.tags; track tag) {
                  <span class="text-xs font-mono text-slate-400 bg-surface px-2 py-0.5 rounded">{{ tag }}</span>
                }
              </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class ProjectsComponent {
  projects: Project[] = [
    {
      titleKey: 'PROJECTS.ITEMS.STATS_TITLE',
      descKey: 'PROJECTS.ITEMS.STATS_DESC',
      tags: ['Spring 4 MVC', 'Spring Security', 'Hibernate', 'MySQL', 'jQuery', 'Bootstrap', 'Maven'],
      url: 'https://www.statsforbetting.com',
      image: '/images/worldball_icono_200.webp',
      featured: true,
    },
    {
      titleKey: 'PROJECTS.ITEMS.PORTFOLIO_TITLE',
      descKey: 'PROJECTS.ITEMS.PORTFOLIO_DESC',
      tags: ['Angular 21', 'Claude API', 'Tailwind v4', 'GSAP', 'SSR', 'TypeScript'],
      featured: true,
    },
    {
      titleKey: 'PROJECTS.ITEMS.MCO_TITLE',
      descKey: 'PROJECTS.ITEMS.MCO_DESC',
      tags: ['Java 8', 'Spring', 'Oracle', 'Angular 12', 'Maven', 'REST'],
      image: '/images/MCO_Logo_outlined_white.webp',
      featured: false,
    },
    {
      titleKey: 'PROJECTS.ITEMS.PSA_TITLE',
      descKey: 'PROJECTS.ITEMS.PSA_DESC',
      tags: ['J2EE', 'Spring 3', 'Oracle', 'SOAP', 'REST', 'Maven'],
      featured: false,
    },
    {
      titleKey: 'PROJECTS.ITEMS.PRISA_TITLE',
      descKey: 'PROJECTS.ITEMS.PRISA_DESC',
      tags: ['Java', 'J2EE', 'AJAX', 'Tomcat', 'JBoss', 'REST'],
      featured: false,
    },
  ];

  get featured() { return this.projects.filter(p => p.featured); }
  get others() { return this.projects.filter(p => !p.featured); }
}
