---
name: deploy
description: Triggered when the user asks to deploy, publish, or ship the portfolio. Covers two targets: local (delegates to the local-dev skill) and production (Vercel via GitHub Actions). Guides the user through the full deployment pipeline including prerequisites, secrets setup, and first-time Vercel linking.
---

# Deploy — Portfolio Deployment

This skill activates when the user wants to deploy the portfolio to any environment.

## When to Activate

Trigger this skill when the user says things like:
- "deploy the project"
- "deploy to Vercel"
- "ship it" / "publish the app"
- "push to production"
- "how do I deploy?"
- "set up CI/CD"
- "deploy locally" / "run locally" (→ routes to local target)
- Any request to release, publish, or make the portfolio accessible

---

## Deployment Targets

Ask the user which target they want if not specified:

| Target | Command to trigger | What it does |
|--------|-------------------|--------------|
| **Local** | "deploy locally" / "run locally" | Dev server at http://localhost:4200 |
| **Production** | "deploy to Vercel" / "ship" | Live site via Vercel + GitHub Actions |

---

## Target A — Local Deployment

**Delegate entirely to the `local-dev` skill.**

Tell the user:
> "For local deployment I'll run the `local-dev` skill."

Then execute every step defined in `.agents/skills/local-dev/SKILL.md` exactly as written:
1. Verify prerequisites (Node >= 20, npm >= 10)
2. Navigate to `portfolio/`
3. Check `.env` for `ANTHROPIC_API_KEY`
4. Install dependencies if needed
5. Run `npm start` (Angular dev server + Tailwind CSS v4 watcher)
6. Confirm the app is live at http://localhost:4200

Do not duplicate or summarize those steps here — run them in full from the `local-dev` skill.

---

## Target B — Production Deployment (Vercel)

Production deployments run automatically via GitHub Actions on every push to `main`. The steps below set up and trigger that pipeline.

---

### Step 1 — First-Time Vercel Setup (run once)

Check whether `.vercel/project.json` exists inside `portfolio/`:

```powershell
Test-Path portfolio\.vercel\project.json
```

**If missing** → this is first-time setup. Run the Vercel link wizard:

```powershell
npm i -g vercel          # Install Vercel CLI globally
cd portfolio
vercel link              # Interactive: log in, select team, link project
```

After linking, extract the IDs needed for GitHub Secrets:

```powershell
cat portfolio\.vercel\project.json
# Copy: "orgId"       → VERCEL_ORG_ID
# Copy: "projectId"   → VERCEL_PROJECT_ID
```

**If present** → skip to Step 2.

---

### Step 2 — Configure GitHub Secrets

Go to the GitHub repository → **Settings → Secrets and variables → Actions** and add:

| Secret name | Where to get the value |
|-------------|----------------------|
| `VERCEL_TOKEN` | Vercel dashboard → Account Settings → Tokens → Create |
| `VERCEL_ORG_ID` | `.vercel/project.json` → `orgId` field |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` field |
| `ANTHROPIC_API_KEY` | Your Anthropic console → API Keys |

These secrets are read by the GitHub Actions workflow at `.github/workflows/deploy-vercel-angular.yml`.

---

### Step 3 — Configure Vercel Dashboard Environment Variables

Go to the Vercel project dashboard → **Settings → Environment Variables** and add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `ANTHROPIC_API_KEY` | Your API key | Production, Preview |
| `NODE_ENV` | `production` | Production |

This ensures the Claude API is available at runtime (not just build time).

---

### Step 4 — Verify `vercel.json`

Confirm `portfolio/vercel.json` exists with the correct config:

```json
{
  "framework": "angular",
  "buildCommand": "npm run build",
  "outputDirectory": "dist/portfolio/browser",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "env": {
    "ANTHROPIC_API_KEY": "@anthropic-api-key"
  }
}
```

If the file is missing or differs, create/update it with the content above.

---

### Step 5 — Trigger a Production Deploy

Push to `main` to trigger the full pipeline:

```powershell
git add .
git commit -m "deploy: trigger production build"
git push origin main
```

The GitHub Actions workflow will:
1. Install Node 22 + dependencies
2. Run lint
3. Build blog content (`npx ts-node scripts/build-blog.ts`)
4. Build Angular SSR with `ANTHROPIC_API_KEY` injected
5. Deploy to Vercel production

Monitor progress at: **GitHub repository → Actions tab**

---

### Step 6 — Verify the Deploy

After the workflow completes (typically 3–5 minutes):

1. Open the Vercel dashboard to confirm the deployment is marked **Ready**
2. Visit the production URL and check:
   - Homepage loads
   - Navigation works (SPA routing)
   - Claude AI chat responds (confirms `ANTHROPIC_API_KEY` is live)
3. Check Vercel function logs if any page returns an error

---

### Step 7 — Preview Deployments (Pull Requests)

Every PR to `main` automatically gets a **preview deployment** URL from Vercel. No extra steps needed — the same workflow runs with `vercel deploy` (without `--prod`).

Use preview URLs to review changes before merging.

---

## Rollback Production

If a bad deploy goes live:

```powershell
# List recent deployments
vercel ls

# Roll back to a specific deployment
vercel rollback <deployment-url>
```

Or use the Vercel dashboard → **Deployments → Promote to Production** on any prior build.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| GitHub Actions fails at "Build SSR" | Missing `ANTHROPIC_API_KEY` secret | Add it in GitHub repo secrets |
| Vercel deploy step fails with 401 | Invalid or expired `VERCEL_TOKEN` | Regenerate token in Vercel dashboard |
| Site loads but AI chat returns 500 | `ANTHROPIC_API_KEY` not in Vercel env vars | Add it in Vercel → Settings → Environment Variables |
| SPA routes return 404 | `rewrites` missing in `vercel.json` | Ensure the rewrite rule is present |
| `vercel link` not found | Vercel CLI not installed | Run `npm i -g vercel` first |
| Blog pages missing in production | `build-blog.ts` step skipped | Ensure `scripts/build-blog.ts` exists and runs in CI |

---

## Related Skills

- **local-dev** — Full local dev server setup (used by Target A above)
- **github-automation** — GitHub Actions CI/CD pipeline configuration
- **claude-api-portfolio** — Claude API runtime config (RAG, streaming, env vars)
