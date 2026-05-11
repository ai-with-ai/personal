import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  styles: [`
    .featured-card {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    }
    .featured-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 20px 60px rgba(99, 102, 241, 0.15);
    }
    .post-card {
      transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
    }
    .post-card:hover {
      transform: translateX(4px);
    }
    .arrow-icon {
      transition: transform 0.2s ease;
    }
    .post-card:hover .arrow-icon {
      transform: translateX(5px);
    }
    .dot-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `],
  template: `
    <div class="min-h-screen">

      <!-- Hero -->
      <section class="relative pt-28 pb-16 px-6 overflow-hidden">
        <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute top-1/2 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

        <div class="max-w-4xl mx-auto relative">
          <div class="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5 text-primary-light text-xs font-mono mb-8">
            <span class="w-1.5 h-1.5 bg-primary-light rounded-full dot-pulse"></span>
            <span>{{ 'NAV.BLOG' | translate }}</span>
          </div>

          <h1 class="text-5xl md:text-6xl font-bold mb-5 leading-tight tracking-tight">
            {{ 'BLOG.TITLE' | translate }}<span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary to-accent">.</span>
          </h1>
          <p class="text-slate-400 text-lg max-w-xl leading-relaxed mb-8">
            {{ 'BLOG.SUBTITLE' | translate }}
          </p>

          @if (posts().length > 0) {
            <p class="text-slate-600 text-sm font-mono">
              {{ posts().length }}&nbsp;{{ posts().length === 1 ? ('BLOG.ARTICLES' | translate) : ('BLOG.ARTICLES_PLURAL' | translate) }}
            </p>
          }
        </div>
      </section>

      <!-- Divider -->
      <div class="max-w-4xl mx-auto px-6">
        <div class="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>

      <!-- Posts -->
      <section class="px-6 py-16">
        <div class="max-w-4xl mx-auto">

          @if (posts().length === 0) {
            <div class="text-center py-32 border border-dashed border-white/10 rounded-card">
              <p class="text-5xl mb-6">✍️</p>
              <h2 class="text-xl font-semibold text-white mb-3">{{ 'BLOG.EMPTY_TITLE' | translate }}</h2>
              <p class="text-slate-500 text-sm">
                {{ 'BLOG.EMPTY_DESC' | translate }}
                <code class="text-accent font-mono">/content/blog/</code>
              </p>
            </div>
          } @else {

            <!-- Featured post -->
            <a [routerLink]="['/blog', posts()[0].slug]" class="block group mb-8">
              <article class="featured-card relative rounded-2xl p-8 md:p-10 border border-white/10 group-hover:border-primary/40 overflow-hidden">

                <!-- Corner glow -->
                <div class="absolute -top-16 -right-16 w-64 h-64 bg-primary/8 rounded-full blur-3xl pointer-events-none"></div>
                <div class="absolute -bottom-16 -left-16 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

                <!-- Meta row -->
                <div class="flex flex-wrap items-center gap-3 mb-6">
                  <span class="text-xs font-mono font-semibold text-primary-light bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full tracking-wider">
                    {{ 'BLOG.FEATURED' | translate }}
                  </span>
                  <span class="text-slate-700">·</span>
                  <time class="text-slate-500 text-sm font-mono">{{ posts()[0].date }}</time>
                  <span class="text-slate-700">·</span>
                  <span class="text-slate-500 text-sm font-mono">{{ posts()[0].readingTime }} {{ 'BLOG.MIN_READ' | translate }}</span>
                </div>

                <!-- Title -->
                <h2 class="text-2xl md:text-3xl font-bold text-white group-hover:text-primary-light transition-colors duration-300 mb-4 leading-snug max-w-2xl">
                  {{ posts()[0].title }}
                </h2>

                <!-- Excerpt -->
                <p class="text-slate-400 leading-relaxed mb-8 max-w-2xl text-base">
                  {{ posts()[0].excerpt }}
                </p>

                <!-- Footer -->
                <div class="flex items-center justify-between gap-4">
                  <div class="flex flex-wrap gap-2">
                    @for (tag of posts()[0].tags; track tag) {
                      <span class="text-xs font-mono text-accent bg-accent/10 border border-accent/10 px-2.5 py-1 rounded-full">{{ tag }}</span>
                    }
                  </div>
                  <span class="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary-light whitespace-nowrap">
                    {{ 'BLOG.READ_MORE' | translate }}
                    <span class="arrow-icon">→</span>
                  </span>
                </div>
              </article>
            </a>

            <!-- Additional posts -->
            @if (posts().length > 1) {
              <div class="space-y-3 mt-4">
                @for (post of posts().slice(1); track post.slug; let idx = $index) {
                  <a [routerLink]="['/blog', post.slug]" class="block group">
                    <article class="post-card flex items-center gap-6 rounded-xl p-5 border border-white/5 bg-surface-alt/40 group-hover:border-primary/20 group-hover:bg-surface-alt/80">

                      <span class="text-3xl font-bold text-white/5 font-mono select-none hidden sm:block w-8 shrink-0">
                        {{ (idx + 2).toString().padStart(2, '0') }}
                      </span>

                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-2">
                          <time class="text-slate-600 text-xs font-mono">{{ post.date }}</time>
                          <span class="text-slate-700 text-xs">·</span>
                          <span class="text-slate-600 text-xs font-mono">{{ post.readingTime }} {{ 'BLOG.MIN_READ' | translate }}</span>
                        </div>
                        <h2 class="font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                          {{ post.title }}
                        </h2>
                        <p class="text-slate-500 text-sm mt-1 line-clamp-1">{{ post.excerpt }}</p>
                      </div>

                      <div class="shrink-0 flex flex-wrap gap-1.5 max-w-[180px] hidden md:flex">
                        @for (tag of post.tags.slice(0, 2); track tag) {
                          <span class="text-xs font-mono text-accent/70 bg-accent/5 px-2 py-0.5 rounded">{{ tag }}</span>
                        }
                      </div>

                      <span class="arrow-icon text-slate-600 group-hover:text-primary-light transition-colors shrink-0">→</span>
                    </article>
                  </a>
                }
              </div>
            }
          }
        </div>
      </section>
    </div>
  `
})
export class BlogListComponent {
  private blog = inject(BlogService);
  posts = this.blog.posts;
}
