---
name: project-intro
description: Triggered when the user says "introduce yourself", "who are you", "what is this project", "tell me about this project", "what can you do", "show me the project", "project overview", or any similar request for a self-introduction or project summary. Scans and presents a live overview of the project structure, technologies, agents, skills, workflows, rules, and repository info.
---

# Project Intro

This skill activates when the user asks for a self-introduction, project overview, or wants to understand what this environment contains.

## When to Activate

Trigger this skill when the user says things like:
- "introduce yourself"
- "who are you" / "what are you"
- "tell me about this project"
- "what is this project?"
- "what can you do here?"
- "show me what's installed"
- "project overview"
- "give me an overview"
- "what skills/agents do you have?"
- Any similar greeting or orientation request

## How to Execute

Perform the following steps **live** — do not use cached or hardcoded data. Always read the current state of the filesystem.

---

### Step 1 — Identity

Introduce yourself as Claude Code (Sonnet 4.6) operating inside the **AntiGProject** workspace.

---

### Step 2 — Repository Info

Read `.git/config` to extract the remote URL and current branch. Present:
- Repository name and GitHub URL
- Current branch
- Last 5 commits (run `git log --oneline -5`)

---

### Step 3 — Project Purpose

Read `README.md` and summarize its content in 3–5 lines. Mention the project's main goal.

---

### Step 4 — Technology Stack

Scan the following to infer the tech stack:
- `.agents/workflows/` — workflow files reveal CI/CD tooling and runtimes
- `.agents/skills/` — skill names and their SKILL.md descriptions reveal target technologies
- Any `package.json`, `pom.xml`, `requirements.txt`, `pyproject.toml`, `build.gradle` at repo root or subdirs

Present a table with: Layer | Technology | Evidence Source

---

### Step 5 — Project-Level Skills

List all folders inside `.agents/skills/`. For each skill, read its `SKILL.md` frontmatter to extract `name` and `description`. Present as a table:

| Skill | Description |
|-------|-------------|

---

### Step 6 — Global Skills

Check `~/.claude/skills/` (global Claude Code skills directory) for any globally installed skills. List them with their descriptions. If none or inaccessible, state "No global skills detected."

---

### Step 7 — Agents

Check `.agents/` for any agent definition files (files named `AGENT.md` or folders with agent configs). Also reference `skills.sh` if present for declared global agent roles. Present:
- Project-level agents (from `.agents/`)
- Global agents referenced in `skills.sh` or similar registry files

---

### Step 8 — Workflows

List all files in `.agents/workflows/`. For each, show:
- File name
- First heading or purpose line from the file

Present as a table:

| Workflow | Purpose |
|----------|---------|

---

### Step 9 — Rules

List all files in `.agents/rules/`. For each, show the file name and a one-line summary of its purpose.

---

### Step 10 — Disabled Skills

Check `.agents/disabled-skills/`. List any skills there, or state "None currently disabled."

---

### Step 11 — Documentation

List key documentation files found in the repo:
- `README.md`
- Any `*.md` files in root or `.agents/`
- `SKILL.md` files count as skill docs — mention the total count
- Workflow `.md` files

---

### Step 12 — Summary Card

End with a concise summary card:

```
╔══════════════════════════════════════════╗
║         AntiGProject — Quick Summary     ║
╠══════════════════════════════════════════╣
║ Repo     : github.com/...                ║
║ Branch   : main / python-angular         ║
║ Stack    : Java 21, Angular 21, MySQL 8  ║
║ Skills   : N project / N global          ║
║ Workflows: N                             ║
║ Agents   : N project / N global          ║
║ Rules    : N                             ║
╚══════════════════════════════════════════╝
```

Fill in real values from the live scan above.

---

## Output Style

- Use markdown tables and headings for readability
- Keep descriptions concise — one line per item
- Always reflect the **current** filesystem state, not hardcoded values
- If a directory doesn't exist or is empty, say so explicitly
- Do not invent technologies not evidenced in the files
