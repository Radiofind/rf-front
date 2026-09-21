import { expect, test } from '../fixtures/test';
import { TOKEN_KEY, uniqueEmail } from '../fixtures/api';
import { RegisterPage } from '../pages/register.page';
import { fillWhenHydrated } from '../pages/field';

import type { IRegisterInput } from '../pages/register.page';

const validInput = (): IRegisterInput => ({
  name: 'Ada',
  surname: 'Lovelace',
  email: uniqueEmail('e2e-ui'),
  password: 'Passw0rd!',
  dateOfBirth: '1994-03-07',
});

const isoDate = (yearsFromNow: number): string => {
  const date: Date = new Date();
  date.setFullYear(date.getFullYear() + yearsFromNow);
  return date.toISOString().slice(0, 10);
};

test.describe('registration', () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test('renders every required field and a disabled submit', async () => {
    await expect(registerPage.nameField.control).toBeVisible();
    await expect(registerPage.surnameField.control).toBeVisible();
    await expect(registerPage.emailField.control).toBeVisible();
    await expect(registerPage.recoveryEmailField.control).toBeVisible();
    await expect(registerPage.dateOfBirth).toBeVisible();
    await expect(registerPage.passwordField.control).toBeVisible();
    await expect(registerPage.confirmPasswordField.control).toBeVisible();
    await expect(registerPage.submit).toBeDisabled();
  });

  test.describe('validation', () => {
    test('reports required name and surname', async () => {
      await registerPage.nameField.touchAndClear();
      await registerPage.surnameField.touchAndClear();

      await expect(registerPage.nameField.errors).toHaveText(['Field is required']);
      await expect(registerPage.surnameField.errors).toHaveText(['Field is required']);
    });

    test('allows only english letters in the name', async () => {
      await registerPage.nameField.fill('Ада');
      await registerPage.nameField.control.blur();

      await expect(registerPage.nameField.errors).toHaveText([
        'Only English letters are allowed (without spaces)',
      ]);
    });

    test('accepts a hyphenated name', async () => {
      await registerPage.nameField.fill('Anne-Marie');
      await registerPage.nameField.control.blur();

      await expect(registerPage.nameField.errors).toHaveCount(0);
    });

    test('ignores the recovery email while it stays empty', async () => {
      await registerPage.recoveryEmailField.touchAndClear();

      await expect(registerPage.recoveryEmailField.errors).toHaveCount(0);
    });

    test('validates the recovery email once it is filled in', async () => {
      await registerPage.recoveryEmailField.fill('not-an-email');
      await registerPage.recoveryEmailField.control.blur();

      await expect(registerPage.recoveryEmailField.errors).toHaveText(['Invalid email']);
    });

    test('rejects a birth date in the future', async () => {
      await fillWhenHydrated(registerPage.dateOfBirth, isoDate(1));
      await registerPage.dateOfBirth.blur();

      await expect(registerPage.dateOfBirthErrors).toHaveText([
        'Date of birth cannot be in the future',
      ]);
    });

    test('rejects a birth date more than a hundred years ago', async () => {
      await fillWhenHydrated(registerPage.dateOfBirth, isoDate(-101));
      await registerPage.dateOfBirth.blur();

      await expect(registerPage.dateOfBirthErrors).toHaveText(['Age cannot exceed 100 years']);
    });

    test('reports a too short password', async () => {
      await registerPage.passwordField.fill('Pa1!');
      await registerPage.passwordField.control.blur();

      await expect(registerPage.passwordField.errors).toContainText([
        'Must be at least 8 character long',
      ]);
    });

    test('lists every unmet password rule', async () => {
      await registerPage.passwordField.fill('password');
      await registerPage.passwordField.control.blur();

      await expect(registerPage.passwordField.errors).toHaveText([
        'Must contain at least one uppercase letter',
        'Must contain at least one number',
        'Must contain at least one special character',
      ]);
    });

    test('rejects a password containing a space', async () => {
      await registerPage.passwordField.fill('Passw0rd !');
      await registerPage.passwordField.control.blur();

      await expect(registerPage.passwordField.errors).toHaveText(['Must not contain spaces']);
    });

    test('reports a mismatching confirmation', async () => {
      await registerPage.passwordField.fill('Passw0rd!');
      await registerPage.confirmPasswordField.fill('Passw0rd?');
      await registerPage.confirmPasswordField.control.blur();

      await expect(registerPage.confirmPasswordField.errors).toHaveText(['Invalid password']);
    });

    test('accepts a strong matching pair', async () => {
      await registerPage.passwordField.fill('Passw0rd!');
      await registerPage.confirmPasswordField.fill('Passw0rd!');
      await registerPage.confirmPasswordField.control.blur();

      await expect(registerPage.passwordField.errors).toHaveCount(0);
      await expect(registerPage.confirmPasswordField.errors).toHaveCount(0);
    });

    test('enables submit only once everything is valid', async () => {
      await expect(registerPage.submit).toBeDisabled();

      await registerPage.fillRequired(validInput());

      await expect(registerPage.submit).toBeEnabled();
    });
  });

  test.describe('artist details', () => {
    test('stay hidden until the checkbox is ticked', async () => {
      await expect(registerPage.artistTypeInputs).toHaveCount(0);
      await expect(registerPage.artistNameField.control).toBeHidden();

      await registerPage.addInformationToggle.click();

      await expect(registerPage.artistTypeInputs).toHaveCount(2);
      await expect(registerPage.artistNameField.control).toBeVisible();
      await expect(registerPage.descriptionField.control).toBeVisible();
    });

    test('relabel the name field when the band type is picked', async () => {
      await registerPage.addInformationToggle.click();
      await expect(registerPage.artistNameField.control).toBeVisible();

      await registerPage.artistTypeOptions.nth(1).click();

      await expect(registerPage.artistNameField.control).toBeHidden();
      await expect(registerPage.bandNameField.control).toBeVisible();
    });

    test('reject non-english artist details', async () => {
      await registerPage.addInformationToggle.click();
      await registerPage.artistNameField.fill('Артист');
      await registerPage.artistNameField.control.blur();

      await expect(registerPage.artistNameField.errors).toHaveText([
        'Only English letters are allowed',
      ]);
    });

    test('accept spaces and punctuation', async () => {
      await registerPage.addInformationToggle.click();
      await registerPage.artistNameField.fill('The Band (Live!)');
      await registerPage.artistNameField.control.blur();

      await expect(registerPage.artistNameField.errors).toHaveCount(0);
    });
  });

  test('creates the account and lands on the media library', async ({ page }) => {
    const input: IRegisterInput = validInput();

    await registerPage.fillRequired(input);
    await registerPage.submit.click();

    await expect(page).toHaveURL(/\/media-library$/);

    const token: string | null = await page.evaluate(
      key => window.localStorage.getItem(key),
      TOKEN_KEY,
    );

    expect(token).toBeTruthy();
  });

  test('reports a failure when the email is already taken', async ({ user }) => {
    await registerPage.fillRequired({ ...validInput(), email: user.email });
    await registerPage.submit.click();

    await expect(registerPage.serverError).toHaveText('Registration failed, please try again');
  });
});
