import { Component, ElementRef, OnDestroy, afterNextRender } from '@angular/core';

const CODE_CHARS = [
  '{', '}', '[', ']', '(', ')', ';', '=', '=>', '!', '&&', '||',
  '0', '1', '</', '/>', '/**', '*/', '//', '...', '??', '?.', '!==', '===',
  'fn', 'if', 'do', 'let', 'var', 'for', 'try', 'new',
  'const', 'class', 'async', 'await', 'while', 'import', 'export', 'return', 'function',
  '00', '01', '10', '11', 'ff', '0x', 'npm', 'git', 'css', 'sql',
];

interface Column {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  length: number;
  isAccent: boolean;
  opacity: number;
}

@Component({
  selector: 'app-particle-bg',
  standalone: true,
  host: { class: 'absolute inset-0 pointer-events-none', 'aria-hidden': 'true' },
  template: `<canvas style="width:100%;height:100%;display:block;"></canvas>`,
})
export class ParticleBgComponent implements OnDestroy {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private columns: Column[] = [];
  private animId = 0;
  private lastTime = 0;
  private readonly FONT_SIZE = 13;
  private readonly COL_WIDTH = 22;
  private resizeHandler!: () => void;

  constructor(private el: ElementRef) {
    afterNextRender(() => {
      this.canvas = this.el.nativeElement.querySelector('canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d')!;
      this.ctx.font = `${this.FONT_SIZE}px 'JetBrains Mono', 'Fira Code', monospace`;
      this.resize();
      this.init();
      this.loop(0);
      this.resizeHandler = () => { this.resize(); this.init(); };
      window.addEventListener('resize', this.resizeHandler);
    });
  }

  private resize() {
    this.canvas.width = this.canvas.offsetWidth || window.innerWidth;
    this.canvas.height = this.canvas.offsetHeight || window.innerHeight;
  }

  private randChar() {
    return CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }

  private init() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const colCount = Math.floor(w / this.COL_WIDTH);
    this.columns = Array.from({ length: colCount }, (_, i) => {
      const len = Math.floor(Math.random() * 14) + 6;
      return {
        x: i * this.COL_WIDTH + this.COL_WIDTH / 2,
        y: -(Math.random() * h),
        speed: Math.random() * 1.2 + 0.5,
        chars: Array.from({ length: len }, () => this.randChar()),
        length: len,
        isAccent: Math.random() < 0.15,
        opacity: Math.random() * 0.4 + 0.25,
      };
    });
  }

  private loop(time: number) {
    const delta = time - this.lastTime;
    this.lastTime = time;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const step = this.FONT_SIZE * 1.6;

    // Dim previous frame
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
    this.ctx.fillRect(0, 0, w, h);
    this.ctx.font = `${this.FONT_SIZE}px 'JetBrains Mono', 'Fira Code', monospace`;

    for (const col of this.columns) {
      col.y += col.speed * (delta / 16);

      for (let i = 0; i < col.length; i++) {
        const charY = col.y - i * step;
        if (charY < -step || charY > h + step) continue;

        // Randomly mutate non-head chars
        if (i > 0 && Math.random() < 0.015) {
          col.chars[i] = this.randChar();
        }

        const headFraction = 1 - i / col.length;
        const alpha = headFraction * headFraction * col.opacity;

        if (i === 0) {
          // Bright head
          this.ctx.fillStyle = col.isAccent ? `rgba(251,191,36,${col.opacity + 0.3})` : `rgba(199,210,254,${col.opacity + 0.3})`;
        } else {
          const r = col.isAccent ? '245,158,11' : '99,102,241';
          this.ctx.fillStyle = `rgba(${r},${alpha.toFixed(2)})`;
        }

        this.ctx.fillText(col.chars[i], col.x - this.ctx.measureText(col.chars[i]).width / 2, charY);
      }

      // Reset column when tail passes bottom
      if (col.y - col.length * step > h) {
        col.y = -(Math.random() * h * 0.5);
        col.speed = Math.random() * 1.2 + 0.5;
        col.length = Math.floor(Math.random() * 14) + 6;
        col.chars = Array.from({ length: col.length }, () => this.randChar());
        col.isAccent = Math.random() < 0.15;
        col.opacity = Math.random() * 0.4 + 0.25;
      }
    }

    this.animId = requestAnimationFrame(this.loop.bind(this));
  }

  ngOnDestroy() {
    if (!this.canvas) return;
    cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.resizeHandler);
  }
}
