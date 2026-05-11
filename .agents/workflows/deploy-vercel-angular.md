---
description: Automated Angular 21 SSR build and deployment pipeline to Vercel on every push to main
---

# Deploy Vercel — Angular 21 SSR

## Prerequisites

- Vercel account linked to your GitHub repo
- Secrets configured in GitHub repository settings:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`

## GitHub Actions Workflow

Save as `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build blog content
        run: npx ts-node scripts/build-blog.ts

      - name: Build (SSR)
        run: npm run build
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

      - name: Deploy to Vercel (Preview)
        if: github.event_name == 'pull_request'
        run: npx vercel deploy --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Deploy to Vercel (Production)
        if: github.ref == 'refs/heads/main'
        run: npx vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Vercel Configuration

Create `vercel.json` in project root:

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

## Environment Variables in Vercel Dashboard

Go to Project → Settings → Environment Variables and add:
- `ANTHROPIC_API_KEY` → your Anthropic key
- `NODE_ENV` → `production`

## First-Time Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Link project (run once)
vercel link

# Get org and project IDs
cat .vercel/project.json
```

## Rollback

```bash
vercel rollback [deployment-url]
```
