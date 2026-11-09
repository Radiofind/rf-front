import { describe, expect, it } from 'vitest';
import { isTokenValid } from './token.helpers';

describe('isTokenValid', () => {
  const tokenExpiringAt2100: string = 'eyJhbGciOiJub25lIn0.eyJleHAiOjQxMDI0NDQ4MDB9.signature';

  it('accepts a token that has not expired yet', () => {
    expect(isTokenValid(tokenExpiringAt2100, Date.parse('2099-12-31T23:59:59Z'))).toBe(true);
  });

  it('rejects a token at its expiry moment', () => {
    expect(isTokenValid(tokenExpiringAt2100, Date.parse('2100-01-01T00:00:00Z'))).toBe(false);
  });

  it('rejects a missing token', () => {
    expect(isTokenValid(null, Date.parse('2026-01-01T00:00:00Z'))).toBe(false);
  });

  it('rejects an undecodable token instead of throwing', () => {
    expect(isTokenValid('not-a-jwt', Date.parse('2026-01-01T00:00:00Z'))).toBe(false);
  });
});
