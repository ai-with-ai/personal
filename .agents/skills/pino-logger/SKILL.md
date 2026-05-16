---
name: pino-logger
description: Expert in Pino structured logging for Node.js/Express. Sets up Pino in server.ts, defines log levels and field conventions, and enforces structured log entries every time new code is implemented in the portfolio server.
---

# Pino Logger — Structured Logging for the Portfolio Server

This skill activates when the user wants to add, configure, or audit structured logging in the Express server (`portfolio/src/server.ts`).

## When to Activate

- "add logging", "set up pino", "wire up logs"
- "log this endpoint", "add structured logs"
- Any new endpoint, service, or middleware is being implemented
- Debugging production issues that require log visibility
- "what should I log here?"

---

## Pino Overview

**Pino** is the Node.js structured logger — JSON output, extremely fast (synchronous serialization via `sonic-boom`), log levels, child loggers, and redaction built-in.

Install:
```bash
npm install pino pino-pretty
```

- `pino` — production logger (JSON to stdout)
- `pino-pretty` — dev formatter (human-readable, colorized)

---

## Setup in `server.ts`

### 1 — Create the root logger

Add this near the top of `server.ts`, after the imports:

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  ...(process.env['NODE_ENV'] !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
    },
  }),
});
```

- Production → plain JSON to stdout (Vercel/PM2 captures it)
- Development → colorized `pino-pretty` output in the terminal
- `LOG_LEVEL` env var controls verbosity without code changes

### 2 — Replace `console.*` calls

| Before | After |
|--------|-------|
| `console.log(...)` | `logger.info({ ... }, 'message')` |
| `console.error(...)` | `logger.error({ err, ... }, 'message')` |
| `console.warn(...)` | `logger.warn({ ... }, 'message')` |

### 3 — Child loggers per domain

Create child loggers to automatically attach a `module` field to every log line from that area:

```typescript
const authLog  = logger.child({ module: 'auth' });
const blogLog  = logger.child({ module: 'blog' });
const chatLog  = logger.child({ module: 'chat' });
```

---

## Log Level Guide

| Level | When to use |
|-------|-------------|
| `trace` | Loop internals, very high frequency (dev only) |
| `debug` | Request params, resolved values useful for debugging |
| `info`  | Normal lifecycle events: server start, request handled, save completed |
| `warn`  | Unexpected-but-recoverable: missing optional config, rate limit approaching |
| `error` | Failed operations: API errors, file write failures, auth failures |
| `fatal` | Unrecoverable startup failures (call `process.exit(1)` after) |

Default level: `info` in production, `debug` in development.

---

## Structured Field Conventions

Every log call must be an **object + message** pair — never a bare string:

```typescript
// ✅ Correct — structured fields + message
logger.info({ slug, lang, filePath }, 'Blog post saved');
logger.error({ err, slug }, 'Blog rebuild failed');

// ❌ Wrong — unstructured string
logger.info(`Saved ${slug}`);
```

### Standard fields by context

**HTTP requests**
```typescript
{ method, path, ip, statusCode, durationMs }
```

**Auth events**
```typescript
{ ip, username?, action: 'login_ok' | 'login_fail' | 'rate_limited' | 'logout' }
```

**Blog operations**
```typescript
{ slug, lang, filePath?, action: 'raw_read' | 'save' | 'rebuild_ok' | 'rebuild_fail' }
```

**Chat / Claude API**
```typescript
{ messageLength, historyLength, model, tokensUsed?, durationMs }
```

**Errors** — always include the `err` field so Pino serializes the full stack:
```typescript
logger.error({ err }, 'Descriptive message about what failed');
```

---

## Implementation Checklist — New Endpoint or Feature

Every time a new route, middleware, or service is added to `server.ts`, apply this checklist:

- [ ] **Entry log** — `logger.debug({ ...inputFields }, 'Handler entered')` at the start
- [ ] **Auth check** — `logger.warn({ ip, token: '***' }, 'Unauthorized request')` on 401
- [ ] **Happy path** — `logger.info({ ...outputFields }, 'Operation succeeded')` before `res.json()`
- [ ] **Error path** — `logger.error({ err, ...contextFields }, 'Operation failed')` in catch/error blocks
- [ ] **Use child logger** — use the domain-specific child (`authLog`, `blogLog`, `chatLog`) not root `logger`
- [ ] **No secrets** — never log passwords, tokens, API keys, or full request bodies with PII

---

## Sensitive Data — Never Log

```typescript
// ❌ NEVER
logger.info({ password, token, apiKey }, '...');

// ✅ Acknowledge without exposing
logger.info({ tokenPresent: !!token }, 'Auth check');
```

Use Pino's built-in `redact` option for automatic masking:

```typescript
const logger = pino({
  redact: ['req.headers.authorization', 'body.password', 'body.apiKey'],
  // ...
});
```

---

## Full Example — Instrumented `server.ts` Pattern

```typescript
// Auth login endpoint — fully instrumented
app.post('/api/auth/login', (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string | undefined)
    ?.split(',')[0].trim() ?? req.socket.remoteAddress ?? 'unknown';

  if (!checkRateLimit(ip)) {
    authLog.warn({ ip }, 'Rate limit exceeded on login');
    res.status(429).json({ error: 'Too many attempts. Try again later.' });
    return;
  }

  const { username } = req.body as { username?: string; password?: string };
  // ... verify credentials ...

  if (!userMatch || !passMatch) {
    authLog.warn({ ip, username }, 'Login failed — bad credentials');
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  authLog.info({ ip, username }, 'Login successful');
  res.json({ token });
});
```

---

## Environment Variables

Add to `portfolio/.env`:

```env
LOG_LEVEL=debug      # trace | debug | info | warn | error | fatal
NODE_ENV=development # switches pino-pretty on/off
```

Add to `.env.example` (no values):

```env
LOG_LEVEL=
```

---

## Output Format Reference

**Development (pino-pretty):**
```
[12:34:56] INFO (blog): Blog post saved
    slug: "angular-signals-2024"
    lang: "en"
    filePath: "/content/blog/en/2024-01-15-angular-signals-2024.md"
```

**Production (JSON):**
```json
{"level":30,"time":1716000000000,"module":"blog","slug":"angular-signals-2024","lang":"en","msg":"Blog post saved"}
```

---

## When Implementing New Code — Mandatory Steps

1. **Install** `pino` + `pino-pretty` if not present
2. **Create child logger** for the new module/domain
3. **Apply the checklist** (entry, auth, happy path, error path)
4. **Run the server** and verify log output looks correct in dev mode
5. **Never log secrets** — double-check every `logger.*` call before committing
