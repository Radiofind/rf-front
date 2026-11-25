import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ProfileRestrictedComponent } from './profile-restricted.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('ProfileRestrictedComponent', () => {
  const render = async (followersOnly: boolean): Promise<HTMLElement> => {
    await TestBed.configureTestingModule({
      imports: [ProfileRestrictedComponent],
    }).compileComponents();
    const fixture: ComponentFixture<ProfileRestrictedComponent> = TestBed.createComponent(
      ProfileRestrictedComponent,
    );
    fixture.componentRef.setInput('followersOnly', followersOnly);
    fixture.componentRef.setInput('name', 'Nova');
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it('invites to follow when the profile is for followers only', async () => {
    const element: HTMLElement = await render(true);

    expect(element.querySelector('.empty__title')!.textContent.trim()).toBe(
      'This profile is for followers only',
    );
    expect(element.querySelector('.empty__description')!.textContent.trim()).toBe(
      'Follow Nova to see their tracks and details.',
    );
  });

  it('says the profile is private when nobody may see it', async () => {
    const element: HTMLElement = await render(false);

    expect(element.querySelector('.empty__title')!.textContent.trim()).toBe(
      'This profile is private',
    );
  });
});
