import { describe, expect, it } from 'vitest';
import { HttpContext } from '@angular/common/http';
import { SKIP_GLOBAL_LOADER, skipGlobalLoader } from './loader.token';

describe('loader token', () => {
  it('defaults to false on a fresh context', () => {
    expect(new HttpContext().get(SKIP_GLOBAL_LOADER)).toBe(false);
  });

  it('flags a brand new context', () => {
    expect(skipGlobalLoader().get(SKIP_GLOBAL_LOADER)).toBe(true);
  });

  it('flags an existing context without losing its other entries', () => {
    const context: HttpContext = new HttpContext();

    expect(skipGlobalLoader(context).get(SKIP_GLOBAL_LOADER)).toBe(true);
    expect(context.get(SKIP_GLOBAL_LOADER)).toBe(true);
  });
});
