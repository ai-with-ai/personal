# Memory Management & Cleanliness

> Strategies for avoiding leaks and performance degradation over time.

## RxJS Subscription Lifecycle

```typescript
// Subscription pattern (Manual)
onDestroy() {
  this.sub.unsubscribe();
}

// Async Pipe / Signal (Recommended)
// No manual cleanup needed
```

## Leak Prevention

- [ ] No manual `subscribe()` without `unsubscribe()` or `takeUntil()`.
- [ ] `takeUntilDestroyed()` for component-managed subscriptions (v16+).
- [ ] No detached DOM refs within component properties.
- [ ] Use `inject(DestroyRef)` for advanced cleanup logic.

## Cleanup Philosophies

- Prefer **declarative reactivity** (mapping observables/signals).
- Favor the **Async Pipe** and **Signals** for template-binding.
- Destroy and disconnect expensive resources (WebSockets, Canvas, intervals).
- Avoid globals or services that capture local component state.
