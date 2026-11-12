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
