# Portfolio Personal — Angular 21 + AI

> Bootstrapped from [base-project](https://github.com/ai-with-ai/base-project).
> Stack: Angular 21 · Tailwind CSS v4 · Claude API · Vercel · MDX Blog

## Project Goal

Modern personal portfolio as a professional showcase. Features: CV interactivo, LinkedIn, projects + demos, AI chat with CV, semantic search, and a blog with AI writing assistant.

## Resources

- Skills: `.agents/skills/`
- Workflows: `.agents/workflows/`
- Rules: `.agents/rules/`
- Agents: `.agents/agents/`
- Concepts reference: `.agents/CONCEPTS.md`
- MCP config: `mcp_config.json`

## Available Skills

### Portfolio-Specific
- **deploy** — Deploy the portfolio locally (delegates to local-dev) or to production via Vercel + GitHub Actions
- **local-dev** — Start and troubleshoot the local dev environment (Angular + Tailwind, http://localhost:4200)
- **tailwind-v4-angular** — Tailwind CSS v4 setup with Angular 21 (CSS tokens, dark mode)
- **claude-api-portfolio** — Claude API: CV chat (RAG), semantic search, blog AI assistant
- **gsap-animations-angular** — Premium GSAP animations: hero, scroll reveals, page transitions
- **mdx-blog-angular** — Git-based blog with .md files, build-time parsing, RSS
- **pino-logger** — Pino structured logging for Express: setup, log levels, field conventions, mandatory checklist for every new implementation

### Base Skills
- **angular-best-practices** — Angular coding standards and patterns (Signals, OnPush, @defer)
- **programmatic-seo** — SEO automation and generation
- **github-automation** — GitHub Actions and automation
- **prompt-generator** — Generate effective prompts
- **database-design** — Database schema and design guidance
- **hibernate-mysql-pro** — Hibernate + MySQL best practices
- **java-spring-ddd** — Java Spring with Domain-Driven Design
- **find-skills** — Discover available skills
- **project-intro** — Project overview and onboarding
- **project-planner** — Planning and task breakdown
- **skill-creator** — Create new skills

## Available Workflows

- `deploy-vercel-angular.md` — Angular SSR auto-deploy to Vercel via GitHub Actions
- `blog-ai-writer.md` — AI-assisted blog post creation: topic → Claude draft → git publish
- `angular-github-ci.md` — Angular CI/CD pipeline (lint + test)
- `docker-compose-infra.md` — Docker Compose local infrastructure
- `maven-github-ci.md` — Maven + GitHub CI pipeline

## Available Agents

### Portfolio-Specific
- **portfolio-content-lead** — CV data, project descriptions, homepage copy, blog strategy
- **ai-ux-lead** — Claude API architecture, RAG design, streaming UX, prompt engineering

### Base Agents
- **frontend-spa-lead** — Angular 21 SPA architect
- **seo-lead** — Technical SEO, structured data, Core Web Vitals, Lighthouse CI, i18n hreflang
- **devops-infra-lead** — CI/CD and infrastructure
- **backend-ddd-lead** — Backend DDD architecture lead
- **mysql-dba-lead** — MySQL DBA lead

## Available Rules

- `portfolio-seo-a11y-rules.md` — WCAG 2.2 AA, Core Web Vitals, SEO meta, structured data
- `ddd-layer-rules.md` — DDD layer boundaries (backend)
