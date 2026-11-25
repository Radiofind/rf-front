import { execFileSync } from 'node:child_process';

const DB_CONTAINER: string = process.env['E2E_DB_CONTAINER'] ?? 'radiofind-db-1';

const DB_NAME: string = process.env['E2E_DB_NAME'] ?? 'radiofind';

export const approveTrack = (trackId: number): void => {
  if (!Number.isInteger(trackId)) {
    throw new Error(`invalid track id ${String(trackId)}`);
  }

  execFileSync('docker', [
    'exec',
    DB_CONTAINER,
    'psql',
    '-U',
    'postgres',
    '-d',
    DB_NAME,
    '-c',
    `UPDATE tracks SET status = 'APPROVED' WHERE id = ${String(trackId)}`,
  ]);
};

const TEST_EMAIL: RegExp = /^e2e-[a-z0-9-]+@example\.com$/;

export const publicIdOf = (email: string): string => {
  if (!TEST_EMAIL.test(email)) {
    throw new Error(`not a test account: ${email}`);
  }

  return execFileSync(
    'docker',
    [
      'exec',
      DB_CONTAINER,
      'psql',
      '-U',
      'postgres',
      '-d',
      DB_NAME,
      '-tAc',
      `SELECT public_id FROM users WHERE email = '${email}'`,
    ],
    { encoding: 'utf8' },
  ).trim();
};
