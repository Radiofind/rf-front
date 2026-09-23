import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AuthDescriptionComponent } from './auth-description.component';
import {
  AUTH_DESCRIPTION_CONTENT_LOGIN,
  AUTH_DESCRIPTION_CONTENT_REGISTER,
} from '../../../constants/auth-content.constant';

import type { ComponentFixture } from '@angular/core/testing';

describe('AuthDescriptionComponent', () => {
  const createFixture = async (): Promise<ComponentFixture<AuthDescriptionComponent>> => {
    await TestBed.configureTestingModule({
      imports: [AuthDescriptionComponent],
    }).compileComponents();
    return TestBed.createComponent(AuthDescriptionComponent);
  };

  it('falls back to the login content', async () => {
    const fixture: ComponentFixture<AuthDescriptionComponent> = await createFixture();
    await fixture.whenStable();

    const title: HTMLElement = fixture.nativeElement.querySelector('.description-title');

    expect(title.textContent).toContain(AUTH_DESCRIPTION_CONTENT_LOGIN.title.trim());
    expect(title.querySelector('span')?.textContent).toBe(
      AUTH_DESCRIPTION_CONTENT_LOGIN.titleColor,
    );
    expect(fixture.nativeElement.querySelector('.description-instructions').textContent).toBe(
      AUTH_DESCRIPTION_CONTENT_LOGIN.instructions,
    );
  });

  it('renders one block per content entry with its icon', async () => {
    const fixture: ComponentFixture<AuthDescriptionComponent> = await createFixture();
    await fixture.whenStable();

    const blocks: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.description-content'),
    );

    expect(blocks).toHaveLength(AUTH_DESCRIPTION_CONTENT_LOGIN.content.length);

    blocks.forEach((block, index) => {
      const entry = AUTH_DESCRIPTION_CONTENT_LOGIN.content[index];

      expect(block.querySelector('.description-content__text--title')?.textContent).toBe(
        entry?.contentTitle,
      );
      expect(block.querySelector('.description-content__text--overview')?.textContent).toBe(
        entry?.overview,
      );
      expect(block.querySelector('.icon i')?.className).toBe(entry?.iconClass);
    });
  });

  it('switches to the register content', async () => {
    const fixture: ComponentFixture<AuthDescriptionComponent> = await createFixture();

    fixture.componentRef.setInput('content', AUTH_DESCRIPTION_CONTENT_REGISTER);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.description-title').textContent).toContain(
      AUTH_DESCRIPTION_CONTENT_REGISTER.titleColor,
    );
    expect(fixture.nativeElement.querySelector('.description-instructions').textContent).toBe(
      AUTH_DESCRIPTION_CONTENT_REGISTER.instructions,
    );
  });

  it('omits the smile when the content has none', async () => {
    const fixture: ComponentFixture<AuthDescriptionComponent> = await createFixture();

    fixture.componentRef.setInput('content', AUTH_DESCRIPTION_CONTENT_REGISTER);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.description-title').textContent).not.toContain(
      '👋',
    );
  });
});
