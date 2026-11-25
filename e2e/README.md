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

Playwright reuses whatever already listens on the base URL. A global setup stops the run at once
when that server is not Radiofind (for example another project's `ng serve` on port 4200).

To run on another port, keep in mind that the backend accepts CORS requests from `:4200` only, so
writes from the browser fail with `403 Invalid CORS request`. Serve the app with a proxy config of
your own that sends `"headers": { "Origin": "http://localhost:4200" }` for `/api`:

```bash
ng serve --port 4300 --proxy-config <your-proxy.json>
E2E_BASE_URL=http://localhost:4300 npm run e2e
```

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

**Delivering a support message** posts to the team's real Telegram chat, so the UI specs in
`support.spec.ts` answer `POST /api/support/messages` with `page.route` (204 and 429). The API
specs still hit the real backend for authentication and validation; the delivery itself is covered
by the backend unit tests.
