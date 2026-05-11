---
name: mdx-blog-angular
description: "Git-based blog system for Angular 21 portfolios. Content stored as .md files in /content/blog/, parsed at build time. Covers frontmatter schema, routing, RSS feed, and AI-assisted post generation."
---

# MDX Blog — Angular 21

## Content Structure

```
content/
└── blog/
    ├── 2025-01-15-building-rag-with-claude.md
    ├── 2025-02-03-angular-signals-deep-dive.md
    └── draft-2025-03-01-my-next-post.md   ← drafts excluded from build
```

## Frontmatter Schema

Every post MUST include:

```yaml
---
title: "Building a RAG System with Claude API"
date: "2025-01-15"
tags: ["AI", "Claude", "RAG", "TypeScript"]
excerpt: "How I built a document Q&A system using Claude's context window and a simple vector store."
coverImage: "/images/blog/rag-system.webp"
published: true
readingTime: 6
---
```

## Build-Time Parser

Install dependencies:
```bash
npm install gray-matter marked
npm install --save-dev @types/marked
```

Create `/scripts/build-blog.ts`:

```ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');
const OUT_FILE = path.join(process.cwd(), 'src/data/blog-posts.json');

const files = fs.readdirSync(BLOG_DIR)
  .filter(f => f.endsWith('.md') && !f.startsWith('draft-'));

const posts = files.map(file => {
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
  const { data, content } = matter(raw);
  return {
    slug: file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace('.md', ''),
    ...data,
    html: marked(content),
  };
}).filter(p => p.published)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

fs.writeFileSync(OUT_FILE, JSON.stringify(posts, null, 2));
console.log(`Built ${posts.length} blog posts → ${OUT_FILE}`);
```

Add to `package.json`:
```json
"scripts": {
  "prebuild": "ts-node scripts/build-blog.ts",
  "build": "ng build"
}
```

## Blog Service

```ts
// blog.service.ts
import { Injectable, signal } from '@angular/core';
import postsData from '../data/blog-posts.json';

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
  private posts = signal<BlogPost[]>(postsData as BlogPost[]);

  getAll() { return this.posts(); }

  getBySlug(slug: string) {
    return this.posts().find(p => p.slug === slug);
  }

  getByTag(tag: string) {
    return this.posts().filter(p => p.tags.includes(tag));
  }
}
```

## Routing

```ts
// app.routes.ts
export const routes: Routes = [
  { path: 'blog', loadComponent: () => import('./pages/blog/blog-list.component') },
  { path: 'blog/:slug', loadComponent: () => import('./pages/blog/blog-post.component') },
];
```

## Blog Post Component

```ts
// blog-post.component.ts
@Component({
  template: `
    @if (post()) {
      <article class="prose prose-invert max-w-3xl mx-auto">
        <img [src]="post()!.coverImage" [alt]="post()!.title" class="w-full rounded-xl mb-8">
        <h1>{{ post()!.title }}</h1>
        <div class="meta">{{ post()!.date }} · {{ post()!.readingTime }} min read</div>
        <div [innerHTML]="post()!.html"></div>
      </article>
    }
  `
})
export class BlogPostComponent {
  post = signal<BlogPost | undefined>(undefined);

  constructor(private route: ActivatedRoute, private blog: BlogService) {
    this.route.paramMap.subscribe(params => {
      this.post.set(this.blog.getBySlug(params.get('slug')!));
    });
  }
}
```

## RSS Feed Generation

Add to build script:

```ts
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Your Name — Blog</title>
    <link>https://yoursite.com/blog</link>
    ${posts.map(p => `
    <item>
      <title>${p.title}</title>
      <link>https://yoursite.com/blog/${p.slug}</link>
      <description>${p.excerpt}</description>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    </item>`).join('')}
  </channel>
</rss>`;

fs.writeFileSync('public/rss.xml', rss);
```

## Syntax Highlighting

```bash
npm install highlight.js
```

```ts
import { marked } from 'marked';
import hljs from 'highlight.js';

marked.setOptions({
  highlight: (code, lang) => {
    return hljs.highlight(code, { language: lang || 'plaintext' }).value;
  }
});
```
