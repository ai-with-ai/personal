---
name: gsap-animations-angular
description: "Premium animations for Angular 21 portfolios using GSAP 3 and ScrollTrigger. Covers hero entrance animations, scroll-driven reveals, page transitions via RouterOutlet, and Angular lifecycle hook integration."
---

# GSAP Animations + Angular 21

## Installation

```bash
npm install gsap
```

GSAP is tree-shakable — import only what you need.

---

## Setup: GSAP Service

Create a singleton service to register plugins once:

```ts
// gsap.service.ts
import { Injectable } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Injectable({ providedIn: 'root' })
export class GsapService {
  constructor() {
    gsap.registerPlugin(ScrollTrigger);
  }

  get gsap() { return gsap; }
  get ScrollTrigger() { return ScrollTrigger; }
}
```

---

## Pattern 1: Hero Entrance Animation

```ts
// hero.component.ts
import { Component, ElementRef, OnInit, viewChild } from '@angular/core';
import { GsapService } from '../gsap.service';

@Component({
  selector: 'app-hero',
  template: `
    <section #heroSection class="hero">
      <h1 #title class="opacity-0">Your Name</h1>
      <p #subtitle class="opacity-0">Full Stack Developer</p>
      <button #cta class="opacity-0">View My Work</button>
    </section>
  `
})
export class HeroComponent implements OnInit {
  heroSection = viewChild<ElementRef>('heroSection');
  title = viewChild<ElementRef>('title');
  subtitle = viewChild<ElementRef>('subtitle');
  cta = viewChild<ElementRef>('cta');

  constructor(private gsapSvc: GsapService) {}

  ngOnInit() {
    const tl = this.gsapSvc.gsap.timeline({ delay: 0.3 });
    tl.to(this.title()!.nativeElement, { opacity: 1, y: 0, from: { y: 40 }, duration: 0.8, ease: 'power3.out' })
      .to(this.subtitle()!.nativeElement, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .to(this.cta()!.nativeElement, { opacity: 1, scale: 1, from: { scale: 0.9 }, duration: 0.5 }, '-=0.3');
  }
}
```

---

## Pattern 2: Scroll-Triggered Card Reveals

```ts
// projects.component.ts
import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { GsapService } from '../gsap.service';

@Component({
  template: `
    <div class="grid grid-cols-3 gap-6">
      @for (project of projects; track project.id) {
        <div #card class="project-card opacity-0 translate-y-8">
          ...
        </div>
      }
    </div>
  `
})
export class ProjectsComponent implements AfterViewInit {
  @ViewChildren('card') cards!: QueryList<ElementRef>;

  constructor(private gsapSvc: GsapService) {}

  ngAfterViewInit() {
    this.cards.forEach((card, i) => {
      this.gsapSvc.gsap.to(card.nativeElement, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: i * 0.1,
        scrollTrigger: {
          trigger: card.nativeElement,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        }
      });
    });
  }
}
```

---

## Pattern 3: Page Transitions (RouterOutlet)

```ts
// app.component.ts
@Component({
  template: `
    <router-outlet (activate)="onActivate($event)" />
  `
})
export class AppComponent {
  constructor(private gsapSvc: GsapService) {}

  onActivate(component: any) {
    this.gsapSvc.gsap.from('router-outlet + *', {
      opacity: 0,
      y: 20,
      duration: 0.4,
      ease: 'power2.out',
      clearProps: 'all'
    });
  }
}
```

---

## Pattern 4: Magnetic Button Effect (Portfolio CTA)

```ts
// magnetic-button.directive.ts
import { Directive, ElementRef, HostListener } from '@angular/core';
import { gsap } from 'gsap';

@Directive({ selector: '[appMagnetic]', standalone: true })
export class MagneticDirective {
  constructor(private el: ElementRef) {}

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(this.el.nativeElement, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    gsap.to(this.el.nativeElement, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
  }
}
```

---

## SSR Compatibility

GSAP requires `document`/`window`. Guard with Angular's platform check:

```ts
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

const platformId = inject(PLATFORM_ID);

if (isPlatformBrowser(platformId)) {
  // GSAP animations here
}
```

Or use `afterNextRender()` (Angular 17+):

```ts
afterNextRender(() => {
  gsap.from('.hero-title', { opacity: 0, y: 40, duration: 1 });
});
```
