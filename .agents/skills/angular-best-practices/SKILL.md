---
name: angular-best-practices
description: "Performance optimization and best practices for modern Angular applications (v17+). Covers Signals, OnPush, @defer, SSR Hydration, and efficient reactivity."
---

# Angular Best Practices

> **Optimizing for Performance, Scalability, and AI-Agent Interactions.**

## 🎯 Selective Reading Rule

**Read ONLY the files relevant to the current task!** Check the content map for specific focus areas.

| File | Focus Area | When to Read |
|------|-----------|--------------|
| `change-detection.md` | Signals, OnPush, Zoneless | Improving UI responsiveness |
| `async-operations.md` | Data fetching, Waterfalls | Improving load times |
| `bundle-optimization.md` | Lazy loading, @defer, Code-splitting | Reducing initial payload |
| `rendering-optimization.md` | `trackBy`, Virtual Scroll, CDK | Optimizing large lists |
| `ssr-hydration.md` | Server-Side Rendering, Hydration | Improving First Contentful Paint |
| `state-management.md` | Signals vs Observables, Store | Managing app-wide state |
| `memory-management.md` | Cleanup, Leak prevention | Fixing performance degradation |

---

## ⚠️ Core Principles

- **Prefer OnPush by default.** Use `ChangeDetectionStrategy.OnPush` in almost all components.
- **Embrace Signals.** Transition from `AsyncPipe` pattern to Signals for more granular reactivity.
- **Acknowledge @defer.** Use the deferrable views for all content not critical for initial paint.
- **Eliminate Async Waterfalls.** Trigger data fetching in parallel or use resolvers where appropriate.

---

## Decision Checklist

Before creating a new feature:

- [ ] Is `ChangeDetectionStrategy.OnPush` set?
- [ ] Are we using local signals instead of public subjects?
- [ ] Can this component be `@defer`-red?
- [ ] Do we have a `trackBy` function for all loops?
- [ ] Is SSR Hydration enabled and optimized?

---

## Anti-Patterns

❌ Running change detection on every DOM interaction (Default strategy).
❌ Manually subscribing in components without `| async` or proper cleanup.
❌ Over-relying on `zone.js` when Signals could provide zoneless-ready code.
❌ Fetching data sequentially (Waterfall) instead of in parallel.
❌ Forgetting `trackBy` in large list rendering.

## When to Use
This skill is applicable to execute development tasks involving Angular architecture, UI performance, and scalable application design.
