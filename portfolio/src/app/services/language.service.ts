import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export type Lang = 'en' | 'es';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private platformId = inject(PLATFORM_ID);
  private translate = inject(TranslateService);

  current = signal<Lang>('es');

  init() {
    this.translate.addLangs(['es', 'en']);
    this.translate.setDefaultLang('es');

    const saved = isPlatformBrowser(this.platformId)
      ? (localStorage.getItem('lang') as Lang | null)
      : null;

    const lang: Lang = saved ?? this.detectBrowserLang();
    this.setLang(lang);
  }

  toggle() {
    this.setLang(this.current() === 'es' ? 'en' : 'es');
  }

  setLang(lang: Lang) {
    this.current.set(lang);
    this.translate.use(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang);
      document.documentElement.lang = lang;
    }
  }

  private detectBrowserLang(): Lang {
    if (!isPlatformBrowser(this.platformId)) return 'es';
    const browser = navigator.language?.toLowerCase() ?? '';
    return browser.startsWith('es') ? 'es' : 'en';
  }
}
