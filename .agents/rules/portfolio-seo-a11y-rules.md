# Portfolio SEO & Accessibility Rules

These rules enforce performance, SEO, and accessibility standards for the personal portfolio. All Angular components and pages MUST comply before merging to `main`.

---

## SEO Rules

### Required Meta Tags (every page)

```html
<title>{{ pageTitle }} | Your Name — Full Stack Developer</title>
<meta name="description" content="...max 160 chars...">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://yoursite.com/current-path">
```

### Open Graph (for social sharing)

```html
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="https://yoursite.com/og-image.png">
<meta property="og:url" content="https://yoursite.com/current-path">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

### JSON-LD Structured Data (homepage)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Your Name",
  "jobTitle": "Full Stack Developer",
  "url": "https://yoursite.com",
  "sameAs": [
    "https://linkedin.com/in/yourhandle",
    "https://github.com/yourhandle"
  ]
}
</script>
```

### Blog Posts: Article structured data

```json
{
  "@type": "BlogPosting",
  "headline": "Post Title",
  "datePublished": "2025-01-15",
  "author": { "@type": "Person", "name": "Your Name" }
}
```

### Sitemap

Generate `public/sitemap.xml` at build time. Include all pages and blog posts.

### Core Web Vitals Targets

| Metric | Target | How |
|--------|--------|-----|
| LCP | < 2.5s | Preload hero image, SSR, no render-blocking JS |
| CLS | < 0.1 | Reserve space for images (`width`/`height` attributes) |
| INP | < 200ms | Angular `OnPush`, avoid heavy event handlers |
| TTFB | < 800ms | Vercel Edge Network, SSR caching |

---

## Accessibility Rules (WCAG 2.2 AA)

### Color Contrast

- Normal text: minimum contrast ratio **4.5:1**
- Large text (18px+ or 14px+ bold): minimum **3:1**
- Interactive elements (buttons, links): minimum **3:1** for UI components

Test with: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Keyboard Navigation

- ALL interactive elements must be reachable via `Tab`
- Focus indicator must be visible (never `outline: none` without replacement)
- Logical tab order — matches visual reading order
- Modal/dialog: trap focus inside; close on `Escape`

```css
/* Visible focus ring */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
  border-radius: 4px;
}
```

### ARIA Labels

```html
<!-- Navigation -->
<nav aria-label="Main navigation">

<!-- Icon-only buttons MUST have aria-label -->
<button aria-label="Toggle dark mode">
  <svg aria-hidden="true">...</svg>
</button>

<!-- Skip link (first element in body) -->
<a href="#main-content" class="sr-only focus:not-sr-only">Skip to content</a>

<!-- Live region for AI chat responses -->
<div aria-live="polite" aria-label="AI response">{{ aiResponse }}</div>
```

### Images

```html
<!-- Decorative images: empty alt -->
<img src="decoration.svg" alt="">

<!-- Content images: descriptive alt -->
<img src="project-screenshot.webp" alt="Screenshot of the dashboard showing user analytics charts">

<!-- Format: WebP with AVIF fallback -->
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="...">
</picture>
```

### Headings

- One `<h1>` per page
- Hierarchical order: h1 → h2 → h3 (never skip levels)
- Headings describe content — not just styling

### Forms

```html
<!-- Every input needs a visible label -->
<label for="search">Search projects</label>
<input id="search" type="search" [(ngModel)]="query" aria-describedby="search-hint">
<span id="search-hint" class="sr-only">Search by project name or technology</span>
```

---

## Performance Rules

- Images: always use `loading="lazy"` for below-fold images
- Fonts: use `font-display: swap` and preload critical fonts
- Third-party scripts: load async/defer only
- Angular: use `OnPush` change detection on all leaf components
- GSAP: guard with `isPlatformBrowser()` — never run on server

---

## Enforcement

Run Lighthouse CI on every PR:
```yaml
- name: Lighthouse CI
  run: npx lhci autorun
  env:
    LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

Minimum scores: Performance 90 | Accessibility 95 | SEO 95 | Best Practices 90
