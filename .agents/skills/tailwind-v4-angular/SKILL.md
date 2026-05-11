---
name: tailwind-v4-angular
description: "Setup and usage of Tailwind CSS v4 with Angular 21. Covers the new Vite plugin approach (no tailwind.config.js), CSS-first design tokens, dark mode with class strategy, and responsive utility patterns in Angular templates."
---

# Tailwind CSS v4 + Angular 21

## Installation

```bash
npm install tailwindcss @tailwindcss/vite
```

Configure the Vite plugin in `angular.json` or `vite.config.ts`:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
});
```

In `angular.json`, add to `architect.build.options`:
```json
"plugins": ["@tailwindcss/vite"]
```

## CSS Entry Point

Replace `styles.css` content with:

```css
@import "tailwindcss";

/* Design Tokens — CSS variables (replaces tailwind.config.js theme) */
@theme {
  --color-primary: #6366f1;
  --color-primary-dark: #4f46e5;
  --color-accent: #f59e0b;
  --color-surface: #0f172a;
  --color-surface-alt: #1e293b;
  --font-sans: 'Inter', ui-sans-serif, system-ui;
  --font-mono: 'JetBrains Mono', ui-monospace;
  --radius-card: 1rem;
  --shadow-glow: 0 0 40px color-mix(in srgb, var(--color-primary) 30%, transparent);
}
```

## Dark Mode

Use class strategy — add `dark` class to `<html>`:

```ts
// theme.service.ts
toggleDark() {
  document.documentElement.classList.toggle('dark');
}
```

```html
<!-- Component template -->
<div class="bg-white dark:bg-surface text-gray-900 dark:text-white">
```

## Angular Template Patterns

```html
<!-- Responsive grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- Card with glow effect on hover -->
<div class="rounded-card bg-surface-alt p-6 border border-white/10
            hover:border-primary/50 hover:shadow-glow transition-all duration-300">

<!-- Gradient text (portfolio hero) -->
<h1 class="text-5xl font-bold bg-gradient-to-r from-primary to-accent
           bg-clip-text text-transparent">
```

## Component-Scoped Styles

Tailwind v4 works with Angular's `ViewEncapsulation`. Use `@apply` sparingly:

```css
/* component.scss */
.btn-primary {
  @apply px-6 py-3 rounded-lg bg-primary text-white font-semibold
         hover:bg-primary-dark transition-colors duration-200;
}
```

## Performance

- Tailwind v4 uses Lightning CSS — no PostCSS config needed
- Only used utilities ship to production (zero dead CSS)
- Use `content-visibility: auto` for below-fold sections
