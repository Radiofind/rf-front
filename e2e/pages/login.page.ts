import { Field } from './field';

import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  public readonly title: Locator;
  public readonly emailField: Field;
  public readonly passwordField: Field;
  public readonly submit: Locator;
  public readonly serverError: Locator;
  public readonly forgotPasswordLink: Locator;
  public readonly signUpLink: Locator;

  public constructor(private readonly page: Page) {
    this.title = page.locator('h2.form-content__title');
    this.emailField = new Field(page, 'you@example.com');
    this.passwordField = new Field(page, 'Enter your password');
    this.submit = page.locator('form.form-content__form').getByRole('button', { name: 'Log In' });
    this.serverError = page.locator('p.form-content__error');
    this.forgotPasswordLink = page.getByText('Forgot password?');
    this.signUpLink = page.getByRole('button', { name: 'Sign up' });
  }

  public get email(): Locator {
    return this.emailField.control;
  }

  public get password(): Locator {
    return this.passwordField.control;
  }

  public async goto(): Promise<void> {
    await this.page.goto('/auth/login');
    await this.title.waitFor();
  }

  public async login(email: string, password: string): Promise<void> {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.submit.click();
  }
}
