import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

export interface LogEntry {
  level: number;
  time: number;
  module?: string;
  msg: string;
  err?: { message: string; stack?: string };
  [key: string]: unknown;
}

export const LEVEL_LABEL: Record<number, string> = {
  10: 'TRACE', 20: 'DEBUG', 30: 'INFO', 40: 'WARN', 50: 'ERROR', 60: 'FATAL',
};

export const LEVEL_COLOR: Record<number, string> = {
  10: '#64748b', 20: '#38bdf8', 30: '#4ade80', 40: '#fbbf24', 50: '#f87171', 60: '#f43f5e',
};

@Injectable({ providedIn: 'root' })
export class LogService {
  private auth       = inject(AuthService);
  private http       = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  panelOpen = signal(false);
  logs      = signal<LogEntry[]>([]);
  loading   = signal(false);
  filter    = signal<number | null>(null);

  toggle() {
    const next = !this.panelOpen();
    this.panelOpen.set(next);
    if (next) this.refresh();
  }

  refresh() {
    if (!isPlatformBrowser(this.platformId) || !this.auth.isAuthenticated()) return;
    this.loading.set(true);
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
    this.http.get<{ logs: LogEntry[] }>('/api/logs?limit=300', { headers }).subscribe({
      next: res => { this.logs.set([...res.logs].reverse()); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  clear() {
    if (!isPlatformBrowser(this.platformId)) return;
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
    this.http.delete('/api/logs', { headers }).subscribe({
      next: () => this.logs.set([]),
    });
  }

  filteredLogs() {
    const f = this.filter();
    return f === null ? this.logs() : this.logs().filter(l => l['level'] === f);
  }
}
