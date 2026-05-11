import { Injectable, inject, signal, PLATFORM_ID, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { LanguageService } from './language.service';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  coverImage: string;
  readingTime: number;
  html: string;
}

@Injectable({ providedIn: 'root' })
export class BlogService {
  private http = inject(HttpClient);
  private langSvc = inject(LanguageService);
  private platformId = inject(PLATFORM_ID);

  posts = signal<BlogPost[]>([]);

  constructor() {
    effect(() => {
      const lang = this.langSvc.current();
      if (!isPlatformBrowser(this.platformId)) return;
      this.http.get<BlogPost[]>(`/blog/${lang}.json`).subscribe({
        next: posts => this.posts.set(posts),
        error: () => this.posts.set([]),
      });
    });
  }

  getAll() { return this.posts(); }
  getBySlug(slug: string) { return this.posts().find(p => p.slug === slug); }
}
