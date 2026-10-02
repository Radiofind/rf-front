# End-to-end tests

Playwright specs that drive the real application against the real Spring backend —
no network stubbing. Registration, login, validation and routing all go through the
actual API and database.

## Prerequisites

| Service        | Where                   | Notes                                                                        |
| -------------- | ----------------------- | ---------------------------------------------------------------------------- |
| Angular app    | `http://localhost:4200` | Started automatically (`npm start`); an already running one is reused.       |
| Spring backend | `http://localhost/api`  | Served by the `rf-infra` Docker stack (nginx on port 80); start it manually. |
| PostgreSQL     | `localhost:5432`        | The backend's database.                                                      |

The app calls the API through the relative `/api`; under `npm start` the dev server forwards it
to nginx (`proxy.conf.json`).

Override the endpoints with `E2E_BASE_URL` and `E2E_API_URL` if needed.

## Running

```bash
npm run e2e          # headless, all specs
npm run e2e:ui       # interactive runner
npm run e2e:headed   # watch it happen in a browser
npm run e2e:report   # open the HTML report of the last run
```

## Layout

```
e2e/
├── fixtures/
│   ├── api.ts     # talks to the backend directly (account creation, constants)
│   └── test.ts    # `user` and `authenticatedPage` fixtures
├── pages/         # page objects
└── src/           # the specs
```

## Test data

Every spec that needs an account creates its own through `POST /api/auth/register`,
using an address built from a timestamp and a random suffix. Registration is the only
flow that returns a JWT directly, which is also how `authenticatedPage` obtains a real
token for the guarded routes.

**These runs write to the database.** Each run leaves behind a handful of
`e2e-*@example.com` users; they are never reused or cleaned up.

## What is deliberately not covered

Two flows end with a secret that only ever reaches the user by email, and which the
backend stores hashed:

- **completing two-factor login** — the six digit code is mailed and only its bcrypt
  hash is persisted, so the suite covers everything up to a rejected code;
- **completing a password reset** — the reset link carries a token stored as a SHA-256
  hash, so the suite covers the rejection paths only.

Closing these gaps needs either a mailbox the tests can read (Mailpit/MailHog in place
of Gmail SMTP) or a test-only endpoint that returns the current code.
