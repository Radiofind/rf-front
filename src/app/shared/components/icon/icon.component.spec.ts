import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { IconComponent } from './icon.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('IconComponent', () => {
  const createFixture = async (): Promise<ComponentFixture<IconComponent>> => {
    await TestBed.configureTestingModule({ imports: [IconComponent] }).compileComponents();
    return TestBed.createComponent(IconComponent);
  };

  it('creates with empty defaults', async () => {
    const fixture: ComponentFixture<IconComponent> = await createFixture();
    await fixture.whenStable();

    expect(fixture.componentInstance.iconClass()).toBeNull();
    expect(fixture.nativeElement.querySelector('.icon')).not.toBeNull();
  });

  it('applies the icon class to the inner element', async () => {
    const fixture: ComponentFixture<IconComponent> = await createFixture();

    fixture.componentRef.setInput('iconClass', 'bx bx-music');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('i').className).toBe('bx bx-music');
  });

  it('applies every style input to the wrapper', async () => {
    const fixture: ComponentFixture<IconComponent> = await createFixture();

    fixture.componentRef.setInput('iconMinWidth', '80px');
    fixture.componentRef.setInput('iconHeight', '80px');
    fixture.componentRef.setInput('iconBorderRadius', '12px');
    fixture.componentRef.setInput('iconFontSize', '56px');
    await fixture.whenStable();

    const wrapper: HTMLElement = fixture.nativeElement.querySelector('.icon');

    expect(wrapper.style.minWidth).toBe('80px');
    expect(wrapper.style.height).toBe('80px');
    expect(wrapper.style.borderRadius).toBe('12px');
    expect(wrapper.style.fontSize).toBe('56px');
  });
});
