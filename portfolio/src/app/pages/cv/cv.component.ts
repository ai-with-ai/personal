import { Component, OnInit, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

interface ExperienceItem {
  role: string;
  company: string;
  location: string;
  period: string;
  description: string | null;
  highlights: string[];
}

interface SkillCategory {
  name: string;
  skills: string[];
}

interface LangItem {
  language: string;
  level: string;
}

interface EducationItem {
  degree: string;
  institution: string;
  location: string;
  year: string;
}

@Component({
  selector: 'app-cv',
  standalone: true,
  imports: [TranslatePipe],
  styles: [`
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-6px); }
    }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes dot-pop {
      0%   { transform: scale(0); opacity: 0; }
      60%  { transform: scale(1.3); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }

    .icon-float { display: inline-block; animation: float 3s ease-in-out infinite; }
    .icon-spin  { display: inline-block; animation: spin-slow 10s linear infinite; }
    .icon-float-slow { display: inline-block; animation: float 4s ease-in-out infinite; }

    .skill-card { transition: border-color .25s, box-shadow .25s, transform .25s; }
    .skill-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(99,102,241,.12); }
    .skill-card:hover .cat-icon { animation: float .6s ease-in-out; }

    .lang-card { transition: border-color .25s, transform .25s, box-shadow .25s; }
    .lang-card:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(99,102,241,.14); }

    .lang-dot {
      width: .55rem; height: .55rem; border-radius: 50%;
      opacity: 0;
      animation: dot-pop .35s ease forwards;
    }
    .lang-dot.filled  { background: #6366f1; }
    .lang-dot.empty   { background: rgba(255,255,255,.1); animation: none; opacity: 1; }

    .shimmer-badge {
      background: linear-gradient(90deg, rgba(99,102,241,.15) 25%, rgba(129,140,248,.35) 50%, rgba(99,102,241,.15) 75%);
      background-size: 200% auto;
      animation: shimmer 3s linear infinite;
    }

    .timeline-line { border-image: linear-gradient(to bottom, #6366f1, transparent) 1; }
    .timeline-line-accent { border-image: linear-gradient(to bottom, #f59e0b, transparent) 1; }
  `],
  template: `
    <section class="min-h-screen py-24 px-6">
      <div class="max-w-4xl mx-auto">

        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-16">
          <div>
            <h1 class="text-4xl md:text-5xl font-bold mb-2">Carlos Esteban Peña</h1>
            <p class="text-primary-light text-lg font-medium mb-4">{{ 'CV.TITLE' | translate }}</p>
            <p class="text-slate-400 max-w-xl leading-relaxed" [innerHTML]="'CV.SUMMARY' | translate"></p>
          </div>
          <div class="flex flex-col gap-3 text-sm shrink-0">
            <a href="https://www.linkedin.com/in/carlos-esteban-pena" target="_blank" rel="noopener noreferrer"
               class="flex items-center gap-2 text-slate-400 hover:text-primary-light transition-colors">
              <span>🔗</span> LinkedIn
            </a>
            <a href="mailto:carlosestebanpena@gmail.com"
               class="flex items-center gap-2 text-slate-400 hover:text-primary-light transition-colors">
              <span>✉️</span> carlosestebanpena@gmail.com
            </a>
            <a href="https://www.statsforbetting.com" target="_blank" rel="noopener noreferrer"
               class="flex items-center gap-2 text-slate-400 hover:text-primary-light transition-colors">
              <span>⚽</span> StatsForBetting.com
            </a>
            <a href="/cv.pdf" download
               class="flex items-center gap-2 px-4 py-2 rounded-btn bg-primary/20 border border-primary/30
                      text-primary-light hover:bg-primary/30 transition-colors font-medium">
              <span>⬇️</span> {{ 'CV.DOWNLOAD_PDF' | translate }}
            </a>
          </div>
        </div>

        <!-- ── Experience ─────────────────────────────────────────── -->
        <div class="mb-16">
          <div class="flex items-center gap-3 mb-8 pb-3 border-b border-white/10">
            <span class="icon-float text-primary-light shrink-0" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.25 14.1499V18.4C20.25 19.4944 19.4631 20.4359 18.3782 20.58C16.2915 20.857 14.1624 21 12 21C9.83757 21 7.70854 20.857 5.62185 20.58C4.5369 20.4359 3.75 19.4944 3.75 18.4V14.1499M20.25 14.1499C20.7219 13.7476 21 13.1389 21 12.4889V8.70569C21 7.62475 20.2321 6.69082 19.1631 6.53086C18.0377 6.36247 16.8995 6.23315 15.75 6.14432M20.25 14.1499C20.0564 14.315 19.8302 14.4453 19.5771 14.5294C17.1953 15.3212 14.6477 15.75 12 15.75C9.35229 15.75 6.80469 15.3212 4.42289 14.5294C4.16984 14.4452 3.94361 14.3149 3.75 14.1499M3.75 14.1499C3.27808 13.7476 3 13.1389 3 12.4889V8.70569C3 7.62475 3.7679 6.69082 4.83694 6.53086C5.96233 6.36247 7.10049 6.23315 8.25 6.14432M15.75 6.14432V5.25C15.75 4.00736 14.7426 3 13.5 3H10.5C9.25736 3 8.25 4.00736 8.25 5.25V6.14432M15.75 6.14432C14.5126 6.0487 13.262 6 12 6C10.738 6 9.48744 6.0487 8.25 6.14432M12 12.75H12.0075V12.7575H12V12.75Z"/>
              </svg>
            </span>
            <h2 class="text-2xl font-bold">{{ 'CV.SECTION_EXPERIENCE' | translate }}</h2>
          </div>

          <div class="space-y-10">
            @for (exp of experience(); track exp.company) {
              <div class="relative pl-8 border-l-2 border-white/8 timeline-line">

                <!-- Animated timeline dot -->
                <div class="absolute -left-3 top-1.5 w-5 h-5 flex items-center justify-center">
                  <span class="absolute inline-flex w-5 h-5 rounded-full bg-primary/40 animate-ping"></span>
                  <span class="relative w-3 h-3 rounded-full bg-primary block"></span>
                </div>

                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                  <div>
                    <h3 class="font-semibold text-white text-lg">{{ exp.role }}</h3>
                    <p class="text-primary-light text-sm font-medium">
                      {{ exp.company }}
                    </p>
                    <p class="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                      <span>📍</span>{{ exp.location }}
                    </p>
                  </div>
                  <span class="shimmer-badge text-slate-300 text-xs font-mono mt-2 md:mt-0 shrink-0 px-3 py-1 rounded-full border border-white/10">
                    {{ exp.period }}
                  </span>
                </div>

                @if (exp.description) {
                  <p class="text-slate-400 text-sm mb-3 italic border-l-2 border-primary/30 pl-3">{{ exp.description }}</p>
                }
                <ul class="space-y-1.5">
                  @for (h of exp.highlights; track h) {
                    <li class="text-slate-400 text-sm flex gap-2 group/item">
                      <span class="text-primary mt-0.5 shrink-0 group-hover/item:translate-x-0.5 transition-transform">▸</span>{{ h }}
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        </div>

        <!-- ── Technical Skills ───────────────────────────────────── -->
        <div class="mb-16">
          <div class="flex items-center gap-3 mb-8 pb-3 border-b border-white/10">
            <img src="/images/skills.png" alt="Technical Skills" class="w-7 h-7 object-contain icon-float-slow" loading="lazy" aria-hidden="true" />
            <h2 class="text-2xl font-bold">{{ 'CV.SECTION_SKILLS' | translate }}</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (cat of skillCategories(); track cat.name) {
              <div class="skill-card bg-surface-alt rounded-card p-5 border border-white/10">
                <div class="flex items-center gap-2 mb-3">
                  <span class="cat-icon text-xl">{{ categoryIcon(cat.name) }}</span>
                  <h3 class="text-xs font-mono text-primary-light uppercase tracking-wider">{{ cat.name }}</h3>
                </div>
                <div class="flex flex-wrap gap-2">
                  @for (skill of cat.skills; track skill) {
                    <span class="text-xs bg-surface border border-white/10 text-slate-300 px-2.5 py-1 rounded-full
                                 hover:border-primary/40 hover:text-primary-light hover:bg-primary/5 transition-all duration-200 cursor-default">
                      {{ skill }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- ── Languages ──────────────────────────────────────────── -->
        <div class="mb-16">
          <div class="flex items-center gap-3 mb-8 pb-3 border-b border-white/10">
            <span class="text-2xl icon-spin">🌍</span>
            <h2 class="text-2xl font-bold">{{ 'CV.SECTION_LANGUAGES' | translate }}</h2>
          </div>

          <div class="flex flex-wrap gap-4">
            @for (lang of languages(); track lang.language) {
              <div class="lang-card bg-surface-alt rounded-card px-6 py-5 border border-white/10
                          hover:border-primary/30 min-w-[160px]">
                <p class="text-3xl mb-3 text-center">{{ langFlag(lang.language) }}</p>
                <p class="text-white font-semibold text-center mb-1">{{ lang.language }}</p>
                <p class="text-slate-500 text-xs text-center mb-3">{{ lang.level }}</p>
                <div class="flex items-center justify-center gap-1.5">
                  @for (d of range(5); track d) {
                    <span class="lang-dot"
                          [class.filled]="d < levelDots(lang.level)"
                          [class.empty]="d >= levelDots(lang.level)"
                          [style.animation-delay]="d * 80 + 'ms'">
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- ── Education ──────────────────────────────────────────── -->
        <div class="mb-16">
          <div class="flex items-center gap-3 mb-8 pb-3 border-b border-white/10">
            <span class="text-2xl icon-float">🎓</span>
            <h2 class="text-2xl font-bold">{{ 'CV.SECTION_EDUCATION' | translate }}</h2>
          </div>

          <div class="space-y-6">
            @for (edu of education(); track edu.year) {
              <div class="relative pl-8 border-l-2 border-white/8 timeline-line-accent">

                <!-- Animated accent dot -->
                <div class="absolute -left-3 top-1.5 w-5 h-5 flex items-center justify-center">
                  <span class="absolute inline-flex w-5 h-5 rounded-full bg-accent/40 animate-ping" style="animation-duration:2.5s"></span>
                  <span class="relative w-3 h-3 rounded-full bg-accent block"></span>
                </div>

                <div class="flex flex-col md:flex-row md:justify-between">
                  <div>
                    <h3 class="font-semibold text-white flex items-center gap-2">
                      <span>{{ eduIcon(edu.degree) }}</span>{{ edu.degree }}
                    </h3>
                    <p class="text-slate-400 text-sm flex items-center gap-1 mt-0.5">
                      <span>🏛️</span>{{ edu.institution }} — {{ edu.location }}
                    </p>
                  </div>
                  <span class="text-slate-500 text-sm font-mono mt-1 md:mt-0 shrink-0 self-start
                               bg-accent/5 border border-accent/10 px-3 py-0.5 rounded-full">
                    {{ edu.year }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- ── Books & Courses ────────────────────────────────────── -->
        <div class="grid md:grid-cols-2 gap-6">
          <div class="bg-surface-alt rounded-card p-5 border border-white/10">
            <h3 class="text-sm font-mono text-primary-light uppercase tracking-wider mb-4">{{ 'CV.SECTION_BOOKS' | translate }}</h3>
            <ul class="space-y-2">
              @for (book of books(); track book) {
                <li class="text-slate-300 text-sm flex gap-2"><span class="text-primary">▸</span>{{ book }}</li>
              }
            </ul>
          </div>
          <div class="bg-surface-alt rounded-card p-5 border border-white/10">
            <h3 class="text-sm font-mono text-accent uppercase tracking-wider mb-4">{{ 'CV.SECTION_COURSES' | translate }}</h3>
            <ul class="space-y-2">
              @for (course of courses(); track course) {
                <li class="text-slate-300 text-sm flex gap-2"><span class="text-accent">▸</span>{{ course }}</li>
              }
            </ul>
          </div>
        </div>

      </div>
    </section>
  `
})
export class CvComponent implements OnInit {
  experience    = signal<ExperienceItem[]>([]);
  skillCategories = signal<SkillCategory[]>([]);
  languages     = signal<LangItem[]>([]);
  education     = signal<EducationItem[]>([]);
  books         = signal<string[]>([]);
  courses       = signal<string[]>([]);

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.loadData();
    this.translate.onLangChange.subscribe(() => this.loadData());
  }

  private loadData() {
    this.translate.get([
      'CV.EXPERIENCE', 'CV.SKILL_CATEGORIES', 'CV.LANGUAGES',
      'CV.EDUCATION', 'CV.BOOKS', 'CV.COURSES',
    ]).subscribe(t => {
      this.experience.set(t['CV.EXPERIENCE'] ?? []);
      this.skillCategories.set(t['CV.SKILL_CATEGORIES'] ?? []);
      this.languages.set(t['CV.LANGUAGES'] ?? []);
      this.education.set(t['CV.EDUCATION'] ?? []);
      this.books.set(t['CV.BOOKS'] ?? []);
      this.courses.set(t['CV.COURSES'] ?? []);
    });
  }

  categoryIcon(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('backend'))                        return '⚙️';
    if (n.includes('frontend'))                       return '🖥️';
    if (n.includes('web service') || n.includes('api')) return '🔗';
    if (n.includes('database') || n.includes('bbdd') || n.includes('server')) return '🗄️';
    if (n.includes('testing') || n.includes('tool') || n.includes('herramienta')) return '🧪';
    if (n.includes('method') || n.includes('agile') || n.includes('scrum')) return '🏃';
    return '🔧';
  }

  companyImage(company: string): string {
    const c = company.toLowerCase();
    if (c.includes('mco') || c.includes('compliance')) return '/images/MCO_Logo_outlined_white.webp';
    return '';
  }

  companyIcon(company: string): string {
    const c = company.toLowerCase();
    if (c.includes('stats'))  return '⚽';
    if (c.includes('alten'))  return '🏗️';
    if (c.includes('cgi'))    return '📡';
    return '🏢';
  }

  langFlag(language: string): string {
    const l = language.toLowerCase();
    if (l.includes('spanish') || l.includes('español'))   return '🇪🇸';
    if (l.includes('english') || l.includes('inglés'))    return '🇬🇧';
    if (l.includes('italian') || l.includes('italiano'))  return '🇮🇹';
    return '🌐';
  }

  levelDots(level: string): number {
    const l = level.toLowerCase();
    if (l.includes('native') || l.includes('nativo'))         return 5;
    if (l.includes('fluent') || l.includes('fluido'))         return 4;
    if (l.includes('competent') || l.includes('competente'))  return 3;
    return 3;
  }

  eduIcon(degree: string): string {
    const d = degree.toLowerCase();
    if (d.includes('master') || d.includes('máster')) return '🏅';
    if (d.includes('exchange') || d.includes('intercambio')) return '✈️';
    return '📘';
  }

  range(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }
}
