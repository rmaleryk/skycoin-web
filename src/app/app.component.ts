import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/takeWhile';

import { config } from './app.config';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  current: number;
  highest: number;
  otcEnabled: boolean;
  version: string;

  constructor(
    private languageService: LanguageService
  ) {
  }

  ngOnInit() {
    this.otcEnabled = config.otcEnabled;
    this.languageService.loadSettings();
  }

  loading() {
    return !this.current || !this.highest || this.current !== this.highest;
  }
}
