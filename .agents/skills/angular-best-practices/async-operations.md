# Async Operations & Data Fetching

> Best practices for non-blocking data loading.

## Waterfall Prevention

```
Sequential Fetching (BAD)
│
├── Fetch User
│   └── (Wait for user) → Fetch Orders
│       └── (Wait for orders) → Fetch Details
│           └── (Wait for details)
│
Parallel Fetching (GOOD)
│
└── ForkJoin / Promise.all ([User, Orders, Details])
    └── (Wait for all in parallel)
```

## Comparisons

| Technique | Goal | Implementation |
|-----------|------|----------------|
| **forkJoin** | Parallel execution | `forkJoin([obs1, obs2])` |
| **switchMap** | Cancel previous request | `source$.pipe(switchMap(...))` |
| **mergeMap** | Concurrent requests | `source$.pipe(mergeMap(...))` |
| **concatMap** | Sequential execution | `source$.pipe(concatMap(...))` |

## Data Preloading

- [ ] Route Resolvers for critical metadata.
- [ ] SSR preloading with `TransferState`.
- [ ] Parallel requests for independent resources.
- [ ] Cancellation of inflight requests on navigation.
