import { Component, inject, OnDestroy } from '@angular/core';
import { LogService, LogEntry, LEVEL_LABEL, LEVEL_COLOR } from '../../services/log.service';

@Component({
  selector: 'app-log-panel',
  standalone: true,
  styles: [`
    .log-panel {
      position: fixed; top: 64px; right: 0; bottom: 0; z-index: 200;
      width: min(680px, 100vw);
      display: flex; flex-direction: column;
      background: #070b14;
      border-left: 1px solid rgba(255,255,255,.08);
      box-shadow: -8px 0 40px rgba(0,0,0,.6);
      animation: slide-in .2s cubic-bezier(.25,.46,.45,.94);
    }
    @keyframes slide-in { from{transform:translateX(100%)} to{transform:translateX(0)} }

    .log-row { display:flex; gap:.5rem; padding:.35rem .75rem; border-bottom:1px solid rgba(255,255,255,.04); font-family:monospace; font-size:.72rem; line-height:1.5; }
    .log-row:hover { background:rgba(255,255,255,.03); }
    .log-time  { color:#94a3b8; min-width:5.5rem; flex-shrink:0; }
    .log-badge { min-width:3rem; text-align:center; border-radius:.25rem; padding:0 .3rem; font-weight:700; flex-shrink:0; }
    .log-mod   { color:#a5b4fc; min-width:4rem; flex-shrink:0; }
    .log-msg   { color:#f1f5f9; flex:1; word-break:break-word; }
    .log-extra { color:#64748b; margin-top:.1rem; }

    .filter-btn { padding:.2rem .6rem; border-radius:.25rem; font-size:.7rem; font-weight:700; border:1px solid transparent; cursor:pointer; transition:opacity .15s; }
    .filter-btn.active { border-color: currentColor; opacity:1; }
    .filter-btn:not(.active) { opacity:.45; }
    .filter-btn:hover { opacity:.8; }
  `],
  template: `
    @if (logSvc.panelOpen()) {
      <div class="log-panel" aria-label="Server logs">

          <!-- Header -->
          <div class="flex items-center gap-3 px-4 py-3 border-b border-white/8 shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path opacity=".5" d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5Z" fill="currentColor" class="text-indigo-400"/>
              <path d="M7 9L11 13L7 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-400"/>
              <path d="M13 17H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="text-indigo-400"/>
            </svg>
            <span class="text-white font-semibold text-sm flex-1">Server Logs</span>
            <span class="text-xs text-slate-500 font-mono">{{ logSvc.filteredLogs().length }} entries</span>

            <!-- Refresh -->
            <button (click)="logSvc.refresh()" title="Refresh"
                    class="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
                    [class.animate-spin]="logSvc.loading()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 12C3 7.02944 7.02944 3 12 3C15.1875 3 18.0005 4.58561 19.7294 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C8.81252 21 5.99948 19.4144 4.27063 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                <path d="M20 3.5V7.5H16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 20.5V16.5H8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <!-- Clear -->
            <button (click)="logSvc.clear()" title="Clear logs"
                    class="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-400/8 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path opacity=".5" d="M3 6H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                <path d="M8 6V4H16V6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19 6L18 20H6L5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <!-- Close -->
            <button (click)="logSvc.toggle()" title="Close"
                    class="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/8 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Level filters -->
          <div class="flex flex-wrap gap-1.5 px-4 py-2.5 border-b border-white/8 shrink-0">
            <button class="filter-btn"
                    [class.active]="logSvc.filter() === null"
                    [style.color]="'#94a3b8'"
                    (click)="logSvc.filter.set(null)">ALL</button>
            @for (lv of levels; track lv.n) {
              <button class="filter-btn"
                      [class.active]="logSvc.filter() === lv.n"
                      [style.color]="lv.color"
                      (click)="setFilter(lv.n)">
                {{ lv.label }}
              </button>
            }
          </div>

          <!-- Log list -->
          <div class="flex-1 overflow-y-auto">
            @if (logSvc.loading()) {
              <div class="flex items-center justify-center py-16 text-slate-500 text-sm gap-2">
                <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="32" stroke-dashoffset="12"/>
                </svg>
                Loading…
              </div>
            } @else if (logSvc.filteredLogs().length === 0) {
              <div class="flex flex-col items-center justify-center py-16 text-slate-600 text-sm gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path opacity=".4" d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5Z" fill="currentColor"/>
                </svg>
                No log entries
              </div>
            } @else {
              @for (entry of logSvc.filteredLogs(); track entry['time']) {
                <div class="log-row">
                  <span class="log-time">{{ formatTime(entry['time']) }}</span>
                  <span class="log-badge" [style.background]="levelBg(entry['level'])" [style.color]="levelColor(entry['level'])">
                    {{ levelLabel(entry['level']) }}
                  </span>
                  @if (entry['module']) {
                    <span class="log-mod">[{{ entry['module'] }}]</span>
                  }
                  <span class="log-msg">
                    {{ entry['msg'] }}
                    @if (entry['err']) {
                      <span class="log-extra block">{{ entry['err']?.['message'] }}</span>
                    }
                    @if (extraFields(entry).length) {
                      <span class="log-extra block">{{ extraFields(entry) }}</span>
                    }
                  </span>
                </div>
              }
            }
          </div>

      </div>
    }
  `
})
export class LogPanelComponent implements OnDestroy {
  logSvc = inject(LogService);

  levels = [
    { n: 10, label: 'TRACE', color: LEVEL_COLOR[10] },
    { n: 20, label: 'DEBUG', color: LEVEL_COLOR[20] },
    { n: 30, label: 'INFO',  color: LEVEL_COLOR[30] },
    { n: 40, label: 'WARN',  color: LEVEL_COLOR[40] },
    { n: 50, label: 'ERROR', color: LEVEL_COLOR[50] },
    { n: 60, label: 'FATAL', color: LEVEL_COLOR[60] },
  ];

  private interval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.interval = setInterval(() => {
      if (this.logSvc.panelOpen()) this.logSvc.refresh();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  setFilter(n: number) {
    this.logSvc.filter.set(this.logSvc.filter() === n ? null : n);
  }

  formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString('en-GB', { hour12: false });
  }

  levelLabel(n: number): string { return LEVEL_LABEL[n] ?? String(n); }
  levelColor(n: number): string { return LEVEL_COLOR[n] ?? '#94a3b8'; }
  levelBg(n: number):    string { return (LEVEL_COLOR[n] ?? '#94a3b8') + '22'; }

  private SKIP = new Set(['level', 'time', 'module', 'msg', 'pid', 'hostname', 'err']);
  extraFields(entry: LogEntry): string {
    const pairs = Object.entries(entry)
      .filter(([k]) => !this.SKIP.has(k))
      .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`);
    return pairs.join('  ');
  }
}
