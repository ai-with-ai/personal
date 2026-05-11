import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  styles: [`
    .reading-progress {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, #6366f1, #818cf8, #f59e0b);
      transform-origin: left;
      transform: scaleX(0);
      z-index: 100;
      animation: reading-progress linear;
      animation-timeline: scroll(root block);
    }
    @keyframes reading-progress {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }
  `],
  template: `
    <!-- Reading progress -->
    <div class="reading-progress" aria-hidden="true"></div>

    <article class="min-h-screen pt-20 pb-24 px-6">
      <div class="max-w-3xl mx-auto">

        <!-- Back -->
        <a routerLink="/blog"
           class="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm mb-14 group font-mono">
          <span class="group-hover:-translate-x-1 transition-transform">←</span>
          {{ 'BLOG.BACK' | translate }}
        </a>

        @if (post()) {

          <!-- Header -->
          <header class="mb-14">
            <div class="flex flex-wrap gap-2 mb-6">
              @for (tag of post()!.tags; track tag) {
                <span class="text-xs font-mono text-accent bg-accent/10 border border-accent/10 px-2.5 py-1 rounded-full">
                  {{ tag }}
                </span>
              }
            </div>

            <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6"
                style="background: linear-gradient(135deg, #f1f5f9 40%, #818cf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
              {{ post()!.title }}
            </h1>

            <div class="flex flex-wrap items-center gap-4 text-sm font-mono text-slate-500">
              <time>{{ post()!.date }}</time>
              <span class="text-slate-700">·</span>
              <span class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {{ post()!.readingTime }} {{ 'BLOG.MIN_READ_POST' | translate }}
              </span>
            </div>

            <!-- Gradient divider -->
            <div class="mt-8 h-px bg-gradient-to-r from-primary/40 via-primary/10 to-transparent"></div>
          </header>

          <!-- Content -->
          <div class="prose" [innerHTML]="post()!.html"></div>

          <!-- Author card -->
          <div class="mt-20 pt-10 border-t border-white/8">
            <div class="flex items-center gap-4 p-6 rounded-2xl bg-surface-alt border border-white/8">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shrink-0">
                CE
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-white text-sm">Carlos Esteban</p>
                <p class="text-slate-500 text-xs mt-0.5">{{ 'BLOG.AUTHOR_ROLE' | translate }}</p>
              </div>
              <a routerLink="/blog"
                 class="hidden sm:inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors font-mono group">
                {{ 'BLOG.BACK' | translate }}
                <span class="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          </div>

        } @else {
          <div class="text-center py-32 border border-dashed border-white/10 rounded-card">
            <p class="text-slate-400">{{ 'BLOG.NOT_FOUND' | translate }}</p>
          </div>
        }
      </div>
    </article>
  `
})
export class BlogPostComponent implements OnInit {
  private blog = inject(BlogService);
  private route = inject(ActivatedRoute);

  private slug = signal<string>('');
  post = computed(() => this.blog.getBySlug(this.slug()));

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.slug.set(params.get('slug') ?? '');
    });
  }
}
