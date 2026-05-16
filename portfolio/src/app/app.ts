import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { LogPanelComponent } from './components/log-panel/log-panel.component';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, LogPanelComponent],
  template: `
    <app-navbar />
    <main id="main-content" class="pt-16">
      <router-outlet />
    </main>
    <app-footer />
    <app-log-panel />
  `
})
export class App implements OnInit {
  constructor(private lang: LanguageService) {}

  ngOnInit() {
    this.lang.init();
  }
}
