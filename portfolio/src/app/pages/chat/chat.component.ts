import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  template: `
    <section class="min-h-screen py-24 px-6">
      <div class="max-w-3xl mx-auto">
        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full
                      px-4 py-1.5 text-primary-light text-sm mb-6">
            <span>✨</span> {{ 'CHAT.BADGE' | translate }}
          </div>
          <h1 class="text-4xl font-bold mb-4">{{ 'CHAT.TITLE' | translate }}</h1>
          <p class="text-slate-400 text-lg max-w-xl mx-auto">{{ 'CHAT.SUBTITLE' | translate }}</p>
        </div>

        <div class="bg-surface-alt rounded-card border border-white/10 overflow-hidden">
          <div class="h-96 overflow-y-auto p-6 space-y-4" aria-live="polite">

            @if (messages().length === 0) {
              <div class="h-full flex flex-col items-center justify-center text-center gap-4">
                <div class="text-5xl">🤖</div>
                <div>
                  <p class="text-white font-medium mb-2">{{ 'CHAT.WELCOME_TITLE' | translate }}</p>
                  <p class="text-slate-400 text-sm max-w-sm mx-auto">{{ 'CHAT.WELCOME_DESC' | translate }}</p>
                </div>
                <div class="flex flex-wrap justify-center gap-2 mt-2">
                  @for (s of suggestions(); track s) {
                    <button (click)="sendSuggestion(s)"
                            class="text-xs bg-surface border border-white/10 hover:border-primary/30
                                   text-slate-300 px-3 py-1.5 rounded-full transition-colors cursor-pointer">
                      {{ s }}
                    </button>
                  }
                </div>
              </div>
            }

            @for (msg of messages(); track msg.id) {
              <div [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
                <div [class]="msg.role === 'user'
                  ? 'bg-primary text-white px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-xs md:max-w-md text-sm leading-relaxed'
                  : 'bg-surface text-slate-200 px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-xs md:max-w-md text-sm leading-relaxed border border-white/10'">
                  {{ msg.content }}
                </div>
              </div>
            }

            @if (loading()) {
              <div class="flex justify-start">
                <div class="bg-surface px-4 py-3 rounded-2xl rounded-tl-sm border border-white/10">
                  <div class="flex gap-1 items-center">
                    <span class="w-2 h-2 bg-primary-light rounded-full animate-bounce" style="animation-delay:0ms"></span>
                    <span class="w-2 h-2 bg-primary-light rounded-full animate-bounce" style="animation-delay:150ms"></span>
                    <span class="w-2 h-2 bg-primary-light rounded-full animate-bounce" style="animation-delay:300ms"></span>
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="border-t border-white/10 p-4 flex gap-3">
            <input
              [(ngModel)]="input"
              (keydown.enter)="send()"
              [disabled]="loading()"
              [placeholder]="'CHAT.INPUT_PLACEHOLDER' | translate"
              class="flex-1 bg-surface border border-white/10 rounded-btn px-4 py-2.5 text-white text-sm
                     placeholder-slate-500 focus:outline-none focus:border-primary/50 disabled:opacity-50 transition-colors"
              aria-label="Message">
            <button
              (click)="send()"
              [disabled]="loading() || !input.trim()"
              class="px-5 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed
                     text-white rounded-btn font-semibold text-sm transition-colors">
              {{ 'CHAT.BTN_SEND' | translate }}
            </button>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
          <p class="text-slate-600 text-xs">{{ 'CHAT.DISCLAIMER' | translate }}</p>
          <a href="https://www.linkedin.com/in/carlos-esteban-pena"
             target="_blank" rel="noopener noreferrer"
             class="text-xs text-slate-500 hover:text-primary-light transition-colors">
            {{ 'CHAT.CONTACT_LINK' | translate }}
          </a>
        </div>
      </div>
    </section>
  `
})
export class ChatComponent {
  messages = signal<Message[]>([]);
  suggestions = signal<string[]>([]);
  input = '';
  loading = signal(false);

  constructor(private translate: TranslateService) {
    this.translate.get('CHAT.SUGGESTIONS').subscribe((s: string[]) => {
      this.suggestions.set(s ?? []);
    });
    this.translate.onLangChange.subscribe(() => {
      this.translate.get('CHAT.SUGGESTIONS').subscribe((s: string[]) => {
        this.suggestions.set(s ?? []);
      });
    });
  }

  sendSuggestion(text: string) {
    this.input = text;
    this.send();
  }

  async send() {
    const text = this.input.trim();
    if (!text || this.loading()) return;

    this.input = '';
    this.messages.update(m => [...m, { id: Date.now(), role: 'user', content: text }]);
    this.loading.set(true);

    const history = this.messages()
      .slice(0, -1)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.messages.update(m => [...m, { id: Date.now(), role: 'assistant', content: data.response }]);
    } catch {
      const errMsg = this.translate.instant('CHAT.ERROR_MSG');
      this.messages.update(m => [...m, { id: Date.now(), role: 'assistant', content: errMsg }]);
    } finally {
      this.loading.set(false);
    }
  }
}
