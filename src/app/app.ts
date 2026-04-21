import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private readonly authService = inject(AuthService);

  public ngOnInit(): void {
    this.authService.login({
      email: 'test@test.com',
      password: '1234'
    }).subscribe();
  }
}
