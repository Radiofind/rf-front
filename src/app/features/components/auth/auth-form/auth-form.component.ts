import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-auth-form',
  imports: [],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthFormComponent {}
