import { Field, fillWhenHydrated } from './field';

import type { Locator, Page } from '@playwright/test';

export interface IRegisterInput {
  name: string;
  surname: string;
  email: string;
  password: string;
  dateOfBirth: string;
}

export class RegisterPage {
  public readonly title: Locator;
  public readonly nameField: Field;
  public readonly surnameField: Field;
  public readonly emailField: Field;
  public readonly recoveryEmailField: Field;
  public readonly passwordField: Field;
  public readonly confirmPasswordField: Field;
  public readonly artistNameField: Field;
  public readonly bandNameField: Field;
  public readonly descriptionField: Field;
  public readonly dateOfBirth: Locator;
  public readonly dateOfBirthErrors: Locator;
  public readonly addInformationToggle: Locator;
  public readonly addInformationInput: Locator;
  public readonly artistTypeOptions: Locator;
  public readonly artistTypeInputs: Locator;
  public readonly submit: Locator;
  public readonly serverError: Locator;
  public readonly signInLink: Locator;

  public constructor(private readonly page: Page) {
    this.title = page.locator('h2.form-content__title');
    this.nameField = new Field(page, 'Enter your name');
    this.surnameField = new Field(page, 'Enter your surname');
    this.emailField = new Field(page, 'you@example.com');
    this.recoveryEmailField = new Field(page, 'recovery@example.com');
    this.passwordField = new Field(page, 'Enter your password');
    this.confirmPasswordField = new Field(page, 'Repeat your password');
    this.artistNameField = new Field(page, 'Enter artist name');
    this.bandNameField = new Field(page, 'Enter band name');
    this.descriptionField = new Field(page, 'Tell us about your music, style, influences...');

    this.dateOfBirth = page.locator('input[type="date"]');
    this.dateOfBirthErrors = page
      .locator('.field')
      .filter({ has: page.locator('input[type="date"]') })
      .locator('.error-message div');

    this.addInformationToggle = page.locator('app-checkbox-field label.checkbox-field__label');
    this.addInformationInput = page.locator('app-checkbox-field input[type="checkbox"]');
    this.artistTypeOptions = page.locator('app-radio-field label.radio-field__buttons--option');
    this.artistTypeInputs = page.locator('app-radio-field input[type="radio"]');
    this.submit = page
      .locator('form.form-content__form')
      .getByRole('button', { name: 'Create Account' });
    this.serverError = page.locator('p.form-content__error');
    this.signInLink = page.getByRole('button', { name: 'Log in' });
  }

  public async goto(): Promise<void> {
    await this.page.goto('/auth/register');
    await this.title.waitFor();
  }

  public async fillRequired(user: IRegisterInput): Promise<void> {
    await this.nameField.fill(user.name);
    await this.surnameField.fill(user.surname);
    await this.emailField.fill(user.email);
    await fillWhenHydrated(this.dateOfBirth, user.dateOfBirth);
    await this.passwordField.fill(user.password);
    await this.confirmPasswordField.fill(user.password);
  }
}
