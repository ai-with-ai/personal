# Change Detection & Reactivity

> Strategies for optimizing UI responsiveness in Angular components.

## Change Detection Tree

```
How granular do the updates need to be?
│
├── Component-level (Standard)
│   └── ChangeDetectionStrategy.OnPush
│
├── Property-level (Granular)
│   └── Signals (Signal, WritableSignal, Computed)
│
├── App-level (Legacy)
│   └── Default Strategy (Discouraged)
│
└── Zoneless (Future)
    └── Signals + provideZonelessChangeDetection()
```

## Comparison

| Strategy | Benefits | Requirement |
|----------|----------|-------------|
| **OnPush** | 50%+ less update cycles | Immutable inputs / Observables |
| **Signals** | Glitch-free, fine-grained | Reactive producers |
| **Zoneless** | Smaller bundles, faster load | Signals-based reactivity |
| **Async Pipe** | Automated CD triggering | Observables in templates |

## Questions to Ask

1. Are we using `OnPush` in almost all features?
2. Can we replace this `BehaviorSubject` with a `signal`?
3. Is `zone.js` really necessary for this application?
4. Are nested components also using `OnPush`?
