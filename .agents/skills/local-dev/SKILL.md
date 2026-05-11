---
name: local-dev
description: Triggered when the user asks to run, start, or deploy the project locally. Sets up and launches the Angular 21 + Tailwind CSS v4 dev environment in the portfolio/ directory, verifying prerequisites and environment variables before starting.
---

# Local Dev — Deploy Portfolio Locally

This skill activates when the user wants to run the portfolio project on their local machine.

## When to Activate

Trigger this skill when the user says things like:
- "run the project locally"
- "start the dev server"
- "deploy locally"
- "how do I run this?"
- "launch the app"
- "npm start"
- "start the portfolio"
- Any request to serve or preview the project on localhost

---

## How to Execute

Perform every step in order. Do not skip steps — each one guards against a class of common failure.

---

### Step 1 — Verify Prerequisites

Check that the required tools are installed and at the correct versions:

```powershell
node --version   # Must be >= 20
npm --version    # Must be >= 10
```

If Node.js is missing or outdated, tell the user to install it from https://nodejs.org (LTS) before continuing. Stop here if this check fails.

---

### Step 2 — Navigate to the App Directory

All commands must run from `portfolio/` — **not** the repo root.

```powershell
cd portfolio
```

Verify the directory exists. If it does not, report the error and stop.

---

### Step 3 — Check Environment Variables

The Claude API features require `ANTHROPIC_API_KEY`. Verify the `.env` file exists:

```powershell
Test-Path portfolio\.env
```

If the file is missing, warn the user:

> `.env` file not found in `portfolio/`. Claude API features (CV chat, semantic search, blog assistant) will not work. Create `portfolio/.env` with:
>
> ```
> ANTHROPIC_API_KEY=sk-ant-...
> ```

Do **not** block the dev server start — Angular itself works without the key; only AI features will fail at runtime.

---

### Step 4 — Install Dependencies

Check whether `node_modules` is already present to avoid a redundant install:

```powershell
Test-Path portfolio\node_modules
```

- If **missing** → run `npm install` inside `portfolio/` and wait for it to complete before proceeding.
- If **present** → skip install and proceed to Step 5.

If `npm install` fails, show the error and stop.

---

### Step 5 — Start the Dev Server

Run the start script, which launches both the Angular dev server and the Tailwind CSS v4 watcher in parallel via `concurrently`:

```powershell
cd portfolio
npm start
```

This single command runs:
- `npx @tailwindcss/cli -i ./tailwind.input.css -o ./src/tailwind.output.css --watch` — Tailwind CSS compiler in watch mode
- `ng serve` — Angular CLI dev server with hot module replacement

The app will be available at **http://localhost:4200** once Angular finishes compiling (look for "Application bundle generation complete" in the terminal output).

---

### Step 6 — Confirm the Server is Up

After starting, tell the user:

> **Portfolio is running locally**
>
> | URL | Purpose |
> |-----|---------|
> | http://localhost:4200 | Main app |
> | http://localhost:4200/blog | Blog section |
>
> **Hot reload** is active — file changes in `src/` rebuild automatically.
> **Tailwind** is watching — changes to CSS tokens apply without restart.
>
> To stop the server: press `Ctrl + C` in the terminal.

---

### Step 7 — Troubleshooting Guide

If the user reports an issue, diagnose using the table below:

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Port 4200 already in use | Another ng serve running | Kill with `npx ng serve --port 4201` or stop the other process |
| `tailwind.output.css` missing | Tailwind watcher not started | Run `npm run tw:build` once, then `npm start` |
| Blank page / routing errors | SSR config mismatch | Use `ng serve` (CSR mode) for local dev; SSR is for production |
| Claude API 401 error | Missing or invalid API key | Check `portfolio/.env` — key must start with `sk-ant-` |
| `ng: command not found` | Angular CLI not in PATH | Use `npx ng serve` or run `npm install` again |
| Slow first build | First-time Tailwind scan | Normal — subsequent builds are fast |

---

## Useful Commands Reference

```powershell
# Start full dev environment (recommended)
cd portfolio; npm start

# Angular dev server only (no Tailwind watch)
cd portfolio; npx ng serve

# Tailwind one-time build (if watch is not needed)
cd portfolio; npm run tw:build

# Run unit tests
cd portfolio; npm test

# Production build (for testing SSR locally)
cd portfolio; npm run build
cd portfolio; npm run serve:ssr:portfolio   # then open http://localhost:4000
```

---

## Output Style

- Always confirm the exact URL where the app is accessible
- Show commands the user can copy-paste directly
- If a step fails, report the exact error message and the recommended fix before stopping
- Do not proceed to the next step if a blocking error occurs
