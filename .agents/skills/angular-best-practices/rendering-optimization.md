# Rendering Optimization & Lists

> Improving the performance of drawing and updating heavy UI structures.

## trackBy Function

```typescript
// For every *ngFor use trackBy
@Component({ ... })
export class MyComponent {
  trackById(index: number, item: any): string {
    return item.id;
  }
}
```

## Large Data Set Rendering

| Strategy | When to use | Implementation |
|----------|-------------|----------------|
| **Virtual Scroll** | 1,000s of rows | `CdkVirtualScrollViewport` |
| **Infinite Scroll** | Large pagination | Scroll listeners / CDK |
| **Pure Pipes** | Heavy calculations | `@Pipe({ pure: true })` |
| **trackBy** | Any list of items | `trackBy: fn` |

## Priorities

1. **Implement trackBy everywhere.**
2. **Use pure pipes** to avoid re-calculating on every digest.
3. **Use CDK Virtual Scroll** for massive data sets.
4. **Reduce template logic** into component properties.
