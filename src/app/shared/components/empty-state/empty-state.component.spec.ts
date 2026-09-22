import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('EmptyStateComponent', () => {
  const createFixture = async (): Promise<ComponentFixture<EmptyStateComponent>> => {
    await TestBed.configureTestingModule({ imports: [EmptyStateComponent] }).compileComponents();
    return TestBed.createComponent(EmptyStateComponent);
  };

  it('renders the title without an icon and description by default', async () => {
    const fixture: ComponentFixture<EmptyStateComponent> = await createFixture();

    fixture.componentRef.setInput('emptyTitle', 'No messages yet');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.empty__title').textContent).toBe('No messages yet');
    expect(fixture.nativeElement.querySelector('app-icon')).toBeNull();
    expect(fixture.nativeElement.querySelector('.empty__description')).toBeNull();
  });

  it('renders the icon and the description when they are provided', async () => {
    const fixture: ComponentFixture<EmptyStateComponent> = await createFixture();

    fixture.componentRef.setInput('emptyIconClass', 'bx bx-inbox');
    fixture.componentRef.setInput('emptyTitle', 'No messages yet');
    fixture.componentRef.setInput('emptyDescription', 'Nothing here for now');
    await fixture.whenStable();

    const icon: HTMLElement = fixture.nativeElement.querySelector('.icon');

    expect(icon.querySelector('i')?.className).toBe('bx bx-inbox');
    expect(icon.style.height).toBe('64px');
    expect(fixture.nativeElement.querySelector('.empty__description').textContent).toBe(
      'Nothing here for now',
    );
  });
});
