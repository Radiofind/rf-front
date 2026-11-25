import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FollowButtonComponent } from './follow-button.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('FollowButtonComponent', () => {
  const createFixture = async (inputs: {
    following?: boolean;
    pending?: boolean;
  }): Promise<ComponentFixture<FollowButtonComponent>> => {
    await TestBed.configureTestingModule({ imports: [FollowButtonComponent] }).compileComponents();
    const fixture: ComponentFixture<FollowButtonComponent> =
      TestBed.createComponent(FollowButtonComponent);
    fixture.componentRef.setInput('name', 'Nova');
    fixture.componentRef.setInput('following', inputs.following ?? false);
    fixture.componentRef.setInput('pending', inputs.pending ?? false);
    await fixture.whenStable();
    return fixture;
  };

  const button = (fixture: ComponentFixture<FollowButtonComponent>): HTMLButtonElement =>
    (fixture.nativeElement as HTMLElement).querySelector('button')!;

  it('offers to follow an artist the user does not follow yet', async () => {
    const fixture: ComponentFixture<FollowButtonComponent> = await createFixture({});

    expect(button(fixture).textContent.trim()).toBe('Follow');
    expect(button(fixture).getAttribute('aria-label')).toBe('Follow Nova');
    expect(button(fixture).getAttribute('aria-pressed')).toBe('false');
  });

  it('offers to unfollow an artist the user follows', async () => {
    const fixture: ComponentFixture<FollowButtonComponent> = await createFixture({
      following: true,
    });

    expect(button(fixture).textContent.trim()).toBe('Unfollow');
    expect(button(fixture).getAttribute('aria-pressed')).toBe('true');
  });

  it('asks to follow on click', async () => {
    const fixture: ComponentFixture<FollowButtonComponent> = await createFixture({});
    const followClicked = vi.fn();
    const unfollowClicked = vi.fn();
    fixture.componentInstance.followClicked.subscribe(followClicked);
    fixture.componentInstance.unfollowClicked.subscribe(unfollowClicked);

    button(fixture).click();

    expect(followClicked).toHaveBeenCalledTimes(1);
    expect(unfollowClicked).not.toHaveBeenCalled();
  });

  it('asks to unfollow on click when already following', async () => {
    const fixture: ComponentFixture<FollowButtonComponent> = await createFixture({
      following: true,
    });
    const unfollowClicked = vi.fn();
    fixture.componentInstance.unfollowClicked.subscribe(unfollowClicked);

    button(fixture).click();

    expect(unfollowClicked).toHaveBeenCalledTimes(1);
  });

  it('cannot be clicked again while the change is being saved', async () => {
    const fixture: ComponentFixture<FollowButtonComponent> = await createFixture({ pending: true });

    expect(button(fixture).disabled).toBe(true);
  });
});
