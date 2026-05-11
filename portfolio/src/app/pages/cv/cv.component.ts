import { Component, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="shrink-0">
                <rect width="24" height="24" rx="4" fill="#0A66C2"/>
                <path d="M7.5 10H5V19H7.5V10ZM6.25 8.75C5.42 8.75 4.75 8.08 4.75 7.25C4.75 6.42 5.42 5.75 6.25 5.75C7.08 5.75 7.75 6.42 7.75 7.25C7.75 8.08 7.08 8.75 6.25 8.75ZM19 19H16.5V14.5C16.5 13.4 16.48 12 14.97 12C13.44 12 13.21 13.2 13.21 14.42V19H10.71V10H13.11V11.29H13.14C13.49 10.62 14.36 9.91 15.67 9.91C18.2 9.91 19 11.56 19 13.75V19Z" fill="white"/>
              </svg>
              linkedin.com/in/carlos-esteban-pena
            </a>
            <a href="mailto:carlosestebanpena@gmail.com"
               class="flex items-center gap-2 text-slate-400 hover:text-primary-light transition-colors">
              <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="shrink-0">
                <path fill="#4caf50" d="M45 16.2l-5 2.75-5 4.75V40h7a3 3 0 003-3V16.2z"/>
                <path fill="#1e88e5" d="M3 16.2l3.7 2.75 6.3 4.75V40H6a3 3 0 01-3-3V16.2z"/>
                <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,17.75 24,25.75 35,17.75 36,17"/>
                <path fill="#c62828" d="M3 12.298V16.2l10 7.5V11.2L9.876 8.287C9.132 7.78 8.22 7.5 7.29 7.5 4.924 7.5 3 9.274 3 11.515V12.298z"/>
                <path fill="#fbc02d" d="M45 12.298V16.2l-10 7.5V11.2l3.124-2.913C38.868 7.78 39.78 7.5 40.71 7.5 43.076 7.5 45 9.274 45 11.515V12.298z"/>
              </svg>
              carlosestebanpena@gmail.com
            </a>
            <a href="https://www.statsforbetting.com" target="_blank" rel="noopener noreferrer"
               class="flex items-center gap-2 text-slate-400 hover:text-primary-light transition-colors">
              <img src="/images/sfb_icon.webp" alt="" aria-hidden="true" class="w-[18px] h-[18px] object-contain shrink-0" loading="lazy" />
              StatsForBetting.com
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
                    <p class="text-primary-light text-sm font-medium flex items-center gap-2">
                      @if (companyImage(exp.company)) {
                        <img [src]="companyImage(exp.company)" [alt]="exp.company + ' logo'"
                             class="h-4 w-auto object-contain" loading="lazy" />
                      }
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
            <span class="icon-float-slow text-primary-light shrink-0" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity="0.5" d="M8 6C6.89543 6 6 6.89543 6 8V16C6 17.1046 6.89543 18 8 18H16C17.1046 18 18 17.1046 18 16V8C18 6.89543 17.1046 6 16 6H8Z" fill="currentColor"/>
                <rect x="10" y="10" width="4" height="4" rx="0.5" fill="currentColor"/>
                <path d="M9 3V6M12 3V6M15 3V6M9 18V21M12 18V21M15 18V21M3 9H6M3 12H6M3 15H6M18 9H21M18 12H21M18 15H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </span>
            <h2 class="text-2xl font-bold">{{ 'CV.SECTION_SKILLS' | translate }}</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (cat of skillCategories(); track cat.name) {
              <div class="skill-card bg-surface-alt rounded-card p-5 border border-white/10">
                <div class="flex items-center gap-2 mb-3">
                  <span class="cat-icon w-6 h-6 text-primary-light [&>svg]:w-full [&>svg]:h-full" [innerHTML]="categoryIconSvg(cat.name)"></span>
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
            <span class="icon-float text-primary-light shrink-0" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle opacity="0.5" cx="12" cy="12" r="10" fill="currentColor"/>
                <path d="M2 12H22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M12 2C9.33 6 8 9 8 12C8 15 9.33 18 12 22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M12 2C14.67 6 16 9 16 12C16 15 14.67 18 12 22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </span>
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
            <span class="icon-float text-accent shrink-0" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity="0.5" d="M4.5 9L12 4.5L19.5 9L12 13.5L4.5 9Z" fill="currentColor"/>
                <path opacity="0.5" d="M7.5 11V15.5C9.5 17.5 14.5 17.5 16.5 15.5V11" fill="currentColor"/>
                <path d="M4.5 9L12 4.5L19.5 9L12 13.5L4.5 9Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                <path d="M7.5 11V15.5C9.5 17.5 14.5 17.5 16.5 15.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19.5 9V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </span>
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
                      <span class="w-5 h-5 text-accent [&>svg]:w-full [&>svg]:h-full shrink-0" [innerHTML]="eduIconSvg(edu.degree)"></span>{{ edu.degree }}
                    </h3>
                    <p class="text-slate-400 text-sm flex items-center gap-1 mt-0.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="shrink-0" aria-hidden="true">
                        <path opacity="0.5" d="M3 21V10L12 3L21 10V21H3Z" fill="currentColor"/>
                        <path d="M3 10L12 3L21 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9 21V15H15V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M3 21H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      </svg>{{ edu.institution }} — {{ edu.location }}
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
            <h3 class="text-sm font-mono text-primary-light uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="shrink-0">
                <path opacity="0.5" d="M6 3C4.34315 3 3 4.34315 3 6V18C3 19.6569 4.34315 21 6 21H20V3H6Z" fill="currentColor"/>
                <path d="M3 18C3 16.3431 4.34315 15 6 15H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M8 7H16M8 11H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              {{ 'CV.SECTION_BOOKS' | translate }}
            </h3>
            <ul class="space-y-2">
              @for (book of books(); track book) {
                <li class="text-slate-300 text-sm flex gap-2"><span class="text-primary">▸</span>{{ book }}</li>
              }
            </ul>
          </div>
          <div class="bg-surface-alt rounded-card p-5 border border-white/10">
            <h3 class="text-sm font-mono text-accent uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="shrink-0">
                <path opacity="0.5" d="M4 5C4 3.89543 4.89543 3 6 3H18C19.1046 3 20 3.89543 20 5V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V5Z" fill="currentColor"/>
                <path d="M8 8H16M8 12H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M9 21V19M15 21V19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M13 15.5L14.5 17L17 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ 'CV.SECTION_COURSES' | translate }}
            </h3>
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

  constructor(private translate: TranslateService, private sanitizer: DomSanitizer) {}

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

  categoryIconSvg(name: string): SafeHtml {
    const n = name.toLowerCase();
    let svg: string;

    if (n.includes('backend')) {
      // Solar Duotone — server rack
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <path opacity="0.5" d="M2 17C2 15.1144 2 14.1716 2.58579 13.5858C3.17157 13 4.11438 13 6 13H18C19.8856 13 20.8284 13 21.4142 13.5858C22 14.1716 22 15.1144 22 17C22 18.8856 22 19.8284 21.4142 20.4142C20.8284 21 19.8856 21 18 21H6C4.11438 21 3.17157 21 2.58579 20.4142C2 19.8284 2 18.8856 2 17Z" fill="currentColor"/>
        <path opacity="0.5" d="M2 7C2 5.11438 2 4.17157 2.58579 3.58579C3.17157 3 4.11438 3 6 3H18C19.8856 3 20.8284 3 21.4142 3.58579C22 4.17157 22 5.11438 22 7C22 8.88562 22 9.82843 21.4142 10.4142C20.8284 11 19.8856 11 18 11H6C4.11438 11 3.17157 11 2.58579 10.4142C2 9.82843 2 8.88562 2 7Z" fill="currentColor"/>
        <path d="M6 7H6.01M10 7H10.01M6 17H6.01M10 17H10.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
    } else if (n.includes('frontend')) {
      // Solar Duotone — code brackets
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <path opacity="0.5" d="M3 12C3 8.22876 3 6.34315 4.17157 5.17157C5.34315 4 7.22876 4 11 4H13C16.7712 4 18.6569 4 19.8284 5.17157C21 6.34315 21 8.22876 21 12C21 15.7712 21 17.6569 19.8284 18.8284C18.6569 20 16.7712 20 13 20H11C7.22876 20 5.34315 20 4.17157 18.8284C3 17.6569 3 15.7712 3 12Z" fill="currentColor"/>
        <path d="M9 8L7 12L9 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15 8L17 12L15 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M11.5 6L12.5 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`;
    } else if (n.includes('web service') || n.includes('api')) {
      // Solar Duotone — globe
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <circle opacity="0.5" cx="12" cy="12" r="10" fill="currentColor"/>
        <path d="M2 12H22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M12 2C9.33 6 8 9 8 12C8 15 9.33 18 12 22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M12 2C14.67 6 16 9 16 12C16 15 14.67 18 12 22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`;
    } else if (n.includes('database') || n.includes('bbdd') || n.includes('server')) {
      // Solar Duotone — database cylinder
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <path opacity="0.5" d="M12 22C17.5228 22 22 19.7614 22 17V7C22 4.23858 17.5228 2 12 2C6.47715 2 2 4.23858 2 7V17C2 19.7614 6.47715 22 12 22Z" fill="currentColor"/>
        <ellipse cx="12" cy="7" rx="5.5" ry="2" fill="currentColor"/>
        <path d="M2 12C2 14.7614 6.47715 17 12 17C17.5228 17 22 14.7614 22 12" stroke="currentColor" stroke-width="1.5"/>
        <path d="M2 7C2 9.76142 6.47715 12 12 12C17.5228 12 22 9.76142 22 7" stroke="currentColor" stroke-width="1.5"/>
      </svg>`;
    } else if (n.includes('testing') || n.includes('tool') || n.includes('herramienta')) {
      // Solar Duotone — CPU chip
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <path opacity="0.5" d="M8 6C6.89543 6 6 6.89543 6 8V16C6 17.1046 6.89543 18 8 18H16C17.1046 18 18 17.1046 18 16V8C18 6.89543 17.1046 6 16 6H8Z" fill="currentColor"/>
        <rect x="10" y="10" width="4" height="4" rx="0.5" fill="currentColor"/>
        <path d="M9 3V6M12 3V6M15 3V6M9 18V21M12 18V21M15 18V21M3 9H6M3 12H6M3 15H6M18 9H21M18 12H21M18 15H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`;
    } else if (n.includes('method') || n.includes('agile') || n.includes('scrum') || n.includes('metodolog')) {
      // Solar Duotone — kanban / checklist board
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <path opacity="0.5" d="M3 6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6Z" fill="currentColor"/>
        <path d="M7 8H7.01M7 12H7.01M7 16H7.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M11 8H17M11 12H17M11 16H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`;
    } else {
      // Solar Duotone — wrench/settings fallback
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
        <path opacity="0.5" d="M20.1 9.22C18.29 9.22 17.55 7.94 18.45 6.37C18.97 5.46 18.66 4.3 17.75 3.78L16.02 2.79C15.23 2.32 14.21 2.6 13.74 3.39L13.63 3.58C12.73 5.15 11.25 5.15 10.34 3.58L10.23 3.39C9.78 2.6 8.76 2.32 7.97 2.79L6.24 3.78C5.33 4.3 5.02 5.47 5.54 6.38C6.45 7.94 5.71 9.22 3.9 9.22C2.86 9.22 2 10.07 2 11.12V12.88C2 13.92 2.85 14.78 3.9 14.78C5.71 14.78 6.45 16.06 5.54 17.63C5.02 18.54 5.33 19.7 6.24 20.22L7.97 21.21C8.76 21.68 9.78 21.4 10.25 20.61L10.36 20.42C11.26 18.85 12.74 18.85 13.65 20.42L13.76 20.61C14.23 21.4 15.25 21.68 16.04 21.21L17.77 20.22C18.68 19.7 18.99 18.53 18.47 17.63C17.56 16.06 18.3 14.78 20.11 14.78C21.15 14.78 22.01 13.93 22.01 12.88V11.12C22 10.08 21.15 9.22 20.1 9.22Z" fill="currentColor"/>
        <circle cx="12" cy="12" r="3.25" fill="currentColor"/>
      </svg>`;
    }

    return this.sanitizer.bypassSecurityTrustHtml(svg);
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

  eduIconSvg(degree: string): SafeHtml {
    const d = degree.toLowerCase();
    let svg: string;

    if (d.includes('master') || d.includes('máster')) {
      // Solar Duotone — medal
      svg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle opacity="0.5" cx="12" cy="14" r="6" fill="currentColor"/>
        <path d="M9 6L8 9H16L15 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 9L11.5 14M14 9L12.5 14" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        <circle cx="12" cy="14" r="3" fill="currentColor"/>
      </svg>`;
    } else if (d.includes('exchange') || d.includes('intercambio')) {
      // Solar Duotone — airplane
      svg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.5" d="M21 12L2 7L6 12L2 17L21 12Z" fill="currentColor"/>
        <path d="M6 12H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M21 12L2 7L6 12L2 17L21 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    } else {
      // Solar Duotone — book
      svg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.5" d="M6 3C4.34315 3 3 4.34315 3 6V18C3 19.6569 4.34315 21 6 21H20V3H6Z" fill="currentColor"/>
        <path d="M3 18C3 16.3431 4.34315 15 6 15H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M8 8H16M8 12H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`;
    }

    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  range(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }
}
