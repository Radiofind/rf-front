import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LogoComponent } from './logo.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('LogoComponent', () => {
  it('gives every logo its own gradient so two logos on a page do not share one', () => {
    const first: ComponentFixture<LogoComponent> = TestBed.createComponent(LogoComponent);
    const second: ComponentFixture<LogoComponent> = TestBed.createComponent(LogoComponent);
    first.componentRef.setInput('ariaLabel', 'Logo');
    second.componentRef.setInput('ariaLabel', 'Logo');
    first.detectChanges();
    second.detectChanges();

    const firstId: string = first.nativeElement.querySelector('linearGradient').id;
    const secondId: string = second.nativeElement.querySelector('linearGradient').id;

    expect(firstId).not.toBe(secondId);
    expect(first.nativeElement.querySelector('g').getAttribute('fill')).toBe(`url(#${firstId})`);
  });
});
