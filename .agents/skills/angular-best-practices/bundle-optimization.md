# Bundle Optimization & Lazy Loading

> Minimizing the initial payload and deferring non-critical resources.

## Deferrable Views (@defer)

```
When to use @defer?
│
├── Not visible on initial load
│   └── @defer (on viewport)
│
├── Interaction-heavy components
│   └── @defer (on interaction)
│
├── Heavy libraries (charts, maps)
│   └── @defer (on timer)
│
└── Non-critical layout parts
    └── @defer (when condition)
```

## Optimization Checklist

- [ ] Routes are using `loadComponent` or `loadChildren`.
- [ ] `@defer` used for all non-FCP components.
- [ ] Tree-shakable providers used (`providedIn: 'root'`).
- [ ] `NgOptimizedImage` for LCP images.
- [ ] No large libraries imported in `app.component`.

## Performance Priorities

1. **Route-level code splitting** (Most impactful).
2. **Standardizing on @defer** for sub-features.
3. **Eliminating large third-party modules** from main bundle.
4. **Optimizing assets** (Images, fonts).
