# learning-about-owasp

Node.js API for hands-on study of the **OWASP Top 10 (2025)**.

Each vulnerability is implemented twice — a **vulnerable** route (the problem, in real code) and a **protected** route (the correct fix) — so the difference is visible at runtime.

---

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5
- **Database:** PostgreSQL (`pg`)
- **Auth:** JWT via `jose`
- **Docs:** Swagger UI (`swagger-ui-express`)
- **Logs:** `pino` / `pino-http`
- **Rate limit:** `express-rate-limit` + `node-cache`
- **Lint/Format:** Biome

---

## Structure

```
src/
├── config/
│   ├── env.config.ts          # validates and types environment variables (zod)
│   └── logger.ts              # shared pino instance (A09)
├── db/
│   ├── client.ts              # PostgreSQL connection
│   ├── migrate.ts             # table creation
│   └── seed/
│       ├── users.seed.ts      # initial user data
│       └── seed.ts            # seed aggregator
├── modules/
│   ├── access-control/        # A01 — Broken Access Control
│   │   ├── controllers/
│   │   ├── middleware/        # AccessControlGuard: verifyToken, requireRole, verifyOwnership
│   │   └── routes.ts
│   ├── security-misconfiguration/  # A02 — Security Misconfiguration
│   │   ├── controllers/
│   │   ├── middleware/        # vulnerableCors, protectedCors, secureHeaders
│   │   └── routes.ts
│   ├── supply-chain/          # A03 — Software Supply Chain Failures
│   │   ├── controllers/
│   │   ├── lib/               # malicious-util.ts, safe-util.ts
│   │   └── routes.ts
│   ├── cryptographic-failures/ # A04 — Cryptographic Failures
│   │   ├── controllers/
│   │   └── routes.ts
│   ├── injection/              # A05 — Injection
│   │   ├── controllers/
│   │   └── routes.ts
│   ├── insecure-design/        # A06 — Insecure Design
│   │   ├── controllers/
│   │   ├── lib/                # login-attempts.store.ts (per-email lockout)
│   │   ├── middleware/         # per-IP rate limiter
│   │   └── routes.ts
│   ├── authentication-failures/ # A07 — Authentication Failures
│   │   ├── controllers/
│   │   ├── lib/                # token-blocklist.ts, refresh-token.store.ts
│   │   ├── middleware/         # AuthGuard (verifyTokenInsecure/Secure)
│   │   └── routes.ts
│   ├── data-integrity/         # A08 — Software or Data Integrity Failures
│   │   ├── controllers/
│   │   ├── lib/                # hmac.ts (sign/verify)
│   │   └── routes.ts
│   ├── logging/                # A09 — Security Logging and Alerting Failures
│   │   ├── controllers/
│   │   └── routes.ts
│   ├── exceptional-conditions/ # A10 — Mishandling of Exceptional Conditions
│   │   ├── controllers/
│   │   └── routes.ts
│   ├── errors/
│   │   ├── http-error.entity.ts   # HttpError, NotFoundError, ForbiddenError…
│   │   └── error.middleware.ts    # global error handler
│   ├── response/
│   │   └── http-response.ts   # HttpResponse with ok<T>, created<T>, noContent
│   └── user/
│       ├── use-cases/         # get, delete, register, find-for-auth
│       └── user.entity.ts     # UserEntity — isAdmin(), isUser()
├── types/
│   └── express.d.ts           # augments Request with UserEntity
└── index.ts                   # app bootstrap
```

---

## Getting started

```bash
# install dependencies
npm install

# configure environment variables
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET

# create tables
npm run db:migrate

# seed the database
npm run db:seed

# start in dev mode
npm run dev
```

Interactive docs are available at `http://localhost:3000/docs`.

Environment variables are validated and typed in [src/config/env.config.ts](src/config/env.config.ts) — if a required variable is missing (e.g. `JWT_SECRET`), the app fails to start with a message pointing at what's wrong, instead of breaking silently at runtime.

### Docker

```bash
cp .env.example .env   # fill in the variables

docker compose up --build
```

This brings up two services: `postgres` and `api` (built from [docker/Dockerfile](docker/Dockerfile), multi-stage). Both have a healthcheck — the API only starts once Postgres reports `healthy` (`depends_on: condition: service_healthy`), and the API container itself exposes `GET /health` (checks the database connection) as the image's `HEALTHCHECK`.

Once it's up, run the migrations either inside the container or by pointing `DATABASE_URL` at `localhost:5432` from the host:

```bash
npm run db:migrate
npm run db:seed
```

---

## Commit convention

```
feat:     new feature
fix:      bug fix
refactor: code change with no behavior change
docs:     documentation update
chore:    maintenance tasks (deps, config, build)
```

---

## OWASP Top 10 — 2025

| # | Category | Status |
|---|-----------|--------|
| A01 | Broken Access Control | ✅ |
| A02 | Security Misconfiguration | ✅ |
| A03 | Software Supply Chain Failures | ✅ |
| A04 | Cryptographic Failures | ✅ |
| A05 | Injection | ✅ |
| A06 | Insecure Design | ✅ |
| A07 | Authentication Failures | ✅ |
| A08 | Software or Data Integrity Failures | ✅ |
| A09 | Security Logging and Alerting Failures | ✅ |
| A10 | Mishandling of Exceptional Conditions | ✅ |

### A01 — Broken Access Control

Users acting on data or performing actions outside their permissions.

**Vulnerable routes** (`/a01/vulnerable/...`)
- `GET /vulnerable/users/:id` — any authenticated user can access another user's data (IDOR)
- `DELETE /vulnerable/admin/users/:id` — any authenticated user can delete another user, no role check

**Protected routes** (`/a01/protected/...`)
- `GET /protected/users/:id` — `verifyOwnership` middleware blocks if `token.id !== params.id`
- `DELETE /protected/admin/users/:id` — `requireRole(u => u.isAdmin())` middleware blocks non-admins with 403

### A02 — Security Misconfiguration

Insecure default configuration exposes stack details and opens CORS gaps.

**Vulnerable routes** (`/a02/vulnerable/...`)
- `GET /vulnerable/info` — `X-Powered-By: Express` present; CORS accepts any origin (`*`)
- `GET /vulnerable/error` — handler returns `stack`, `path` and `method` to the client

**Protected routes** (`/a02/protected/...`)
- `GET /protected/info` — `helmet()` removes `X-Powered-By` and injects `X-Frame-Options`, `Strict-Transport-Security`, `Content-Security-Policy`; CORS restricted to the configured origin
- `GET /protected/error` — generic handler returns only `{ "error": "Internal server error" }`

### A03 — Software Supply Chain Failures

Compromised dependencies executing malicious code beyond their declared purpose.

**Vulnerable routes** (`/a03/vulnerable/...`)
- `POST /vulnerable/process` — `formatUsername` runs a malicious side effect besides formatting the name (real-world pattern: `event-stream` 2018, `node-ipc` 2022)

**Protected routes** (`/a03/protected/...`)
- `POST /protected/process` — audited version, no side effects

**Layered protection**
- `package-lock.json` in git — pins exact versions, prevents silent upgrades
- `.github/workflows/audit.yml` — `npm audit --audit-level=moderate` blocks the build on every push/PR if a CVE is found
- `npm ci` in CI — strictly respects the lockfile (never updates anything)
- Local scripts: `npm run audit`, `npm run outdated`

### A04 — Cryptographic Failures

Sensitive data without adequate protection — plaintext passwords and a hardcoded, weak JWT key.

**Vulnerable routes** (`/a04/vulnerable/...`)
- `POST /vulnerable/register` — password saved in plaintext in the database; response returns `password_stored_as` to make the problem visible
- `POST /vulnerable/login` — compares plaintext with `===`, JWT signed with a hardcoded `'abc123'`, no expiration, response exposes `password_hash`

**Protected routes** (`/a04/protected/...`)
- `POST /protected/register` — `bcrypt.hash(password, 12)` — irreversible hash with a random salt
- `POST /protected/login` — `bcrypt.compare`, JWT via `process.env.JWT_SECRET`, 2h expiration, response returns only the token

### A05 — Injection

User input sent directly to an interpreter (SQL, shell).

**Vulnerable routes** (`/a05/vulnerable/...`)
- `GET /vulnerable/users?email=` — concatenated SQL: `' OR '1'='1` returns every user

**Protected routes** (`/a05/protected/...`)
- `GET /protected/users?email=` — `zod` validates the email; query uses `$1` (parameterized) — injection impossible

### A06 — Insecure Design

Architectural flaws: user enumeration via the response, and no limit on login attempts.

**Vulnerable routes** (`/a06/vulnerable/...`)
- `POST /vulnerable/login` — `404 "Email não encontrado"` vs `401 "Senha incorreta"` lets an attacker map registered emails; no rate limit

**Protected routes** (`/a06/protected/...`)
- `POST /protected/login` — generic message (fail securely), `express-rate-limit` (5 req/15min per IP) + 1min lockout per email after 5 failures (`node-cache`)

### A07 — Authentication Failures

Poorly implemented session lifecycle: a token that never expires and a logout that revokes nothing.

**Vulnerable routes** (`/a07/vulnerable/...`)
- `POST /vulnerable/login` — JWT signed without `expiresIn`, valid forever
- `POST /vulnerable/logout` — invalidates nothing
- `GET /vulnerable/profile` — accepts the token normally even after "logout"

**Protected routes** (`/a07/protected/...`)
- `POST /protected/login` — 15min access token + single-use opaque refresh token
- `POST /protected/refresh` — exchanges the refresh token (consumed in the process) for a new pair
- `POST /protected/logout` — revokes the access token (in-memory blocklist) and the refresh token
- `GET /protected/profile` — rejects a revoked or expired token

### A08 — Software or Data Integrity Failures

Payload processed without verifying origin or integrity.

**Vulnerable routes** (`/a08/vulnerable/...`)
- `POST /vulnerable/config` — applies any JSON received, without checking the sender

**Protected routes** (`/a08/protected/...`)
- `POST /protected/config` — requires an `x-signature` header with an HMAC-SHA256 of the payload (`crypto.createHmac` + `crypto.timingSafeEqual`); rejects if it doesn't match

### A09 — Security Logging and Alerting Failures

Missing or insufficient logs prevent detecting and investigating attacks.

**Vulnerable routes** (`/a09/vulnerable/...`)
- `POST /vulnerable/login` — `console.log` writes the password in plaintext; unexpected errors are swallowed with no record

**Protected routes** (`/a09/protected/...`)
- `POST /protected/login` — structured `pino` logger (JSON): logs login success/failure and errors with IP, never the password (field redacted by config)

### A10 — Mishandling of Exceptional Conditions

A promise fired without handling — the kind of error that takes down an entire process.

**Vulnerable routes** (`/a10/vulnerable/...`)
- `POST /vulnerable/process` — fires an async task without `await`/`.catch`; produces an unhandled rejection right where it happens

**Protected routes** (`/a10/protected/...`)
- `POST /protected/process` — same task, but wrapped in `try/catch` with structured error logging

**Global safety net** (`src/index.ts`)
- `process.on('unhandledRejection', ...)` and `process.on('uncaughtException', ...)` — log via `pino` and, on `uncaughtException`, shut the process down in a controlled way (`process.exit(1)`) instead of leaving it in an undefined state

---

## License

MIT
