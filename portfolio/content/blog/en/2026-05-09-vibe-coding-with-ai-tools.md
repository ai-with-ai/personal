---
title: "Vibe Coding: programming with AI agents"
date: "2026-05-09"
tags: ["Claude Code", "AI Agents", "Vibe Coding", "MCP", "Developer Tools"]
excerpt: "How Claude Code, Gemini CLI, Cursor and OpenCode are redefining software development through agents, skills, workflows, rules, sub-agents, worktrees and structured context."
coverImage: "/images/blog/vibe-coding.webp"
published: true
readingTime: 9
---

# Vibe Coding: programming with AI agents

*Vibe coding* is not about writing code blindly and hoping for the best. It is about collaborating with an AI that understands your codebase, follows your rules, executes real tools and learns the context of your project. Tools like **Claude Code**, **Gemini CLI**, **Cursor** and **OpenCode** are turning that vision into reality today.

This post explores the primitives that make that collaboration possible: agents, skills, workflows, rules, sub-agents, worktrees, MCP and the three configuration scopes.

---

## What is vibe coding?

The term, popularised in 2025, describes a development style where the programmer states the intent — *"add JWT authentication to this API"*, *"refactor this service following DDD"* — and the AI agent makes decisions, reads files, runs commands and produces working code.

It is not advanced autocomplete. It is delegation with context.

---

## The main tools

### Claude Code

Anthropic's CLI for the terminal and VS Code. It operates with real access to the filesystem, git, and external tools via MCP. Its strengths are the layered configuration architecture (global → project → local) and the system of specialised agents.

```bash
# Install
npm install -g @anthropic-ai/claude-code

# Use in a project
cd my-project
claude
```

### Gemini CLI

Google's bet, aimed at large projects thanks to its 1M-token context window. It integrates Google Search as a native tool, making it powerful for tasks that require external research.

### Cursor

A full IDE based on VS Code with deeply integrated AI. It stands out for its *Agent* mode with autorun, real-time diff view, and its ability to coordinate edits across multiple files.

### OpenCode

An open-source terminal alternative. Compatible with any provider (OpenAI, Anthropic, Ollama) and aimed at users who prioritise privacy and full control.

---

## Key primitives of vibe coding

### Agent

An agent is an AI that does not just respond — it acts: reads files, runs commands, calls external APIs and makes multi-step decisions to complete a task.

In Claude Code, agents are defined in `.agents/agents/` with an `AGENT.md` file that describes their speciality, available tools and behaviour constraints.

```
.agents/
└── agents/
    ├── frontend-spa-lead/
    │   └── AGENT.md    ← "You are an Angular 21 architect. Never modify the backend."
    └── backend-ddd-lead/
        └── AGENT.md    ← "Apply strict DDD. Validate layer boundaries."
```

Cursor implements agents through its *Composer Agent* mode, which chains file edits and terminal commands autonomously.

---

### Skill

A skill is specialised knowledge packaged as reusable context. It is not executable code — it is an instruction manual that the agent loads when needed.

```markdown
<!-- .agents/skills/angular-best-practices/SKILL.md -->
# Angular Best Practices

- Use OnPush in all components
- Prefer Signals over BehaviorSubject
- Apply @defer for heavy components
- Standalone components by default
```

When the agent works on an Angular component, it automatically loads these instructions and applies them without you having to repeat them in every prompt.

**In Cursor**, the equivalents are *Rules* in `.cursorrules` or in project settings — free text injected into the context of every request.

---

### Workflow

A workflow is a multi-step process, documented as a guide the agent can follow from start to finish. The difference from a skill is that a workflow has a defined order and a final state.

```markdown
<!-- .agents/workflows/deploy-vercel-angular.md -->
# Deploy Angular → Vercel

1. Run build: `npm run build`
2. Verify that dist/ exists
3. Check environment variables in .env.production
4. Push to main → GitHub Actions triggers the deploy
5. Verify the production URL after 3 minutes
```

This lets you delegate entire repetitive processes: *"follow the deploy workflow"* and the agent executes each step, verifying the result.

---

### Rule

Rules are hard constraints that the agent must always respect, regardless of the prompt. Where skills are recommendations, rules are laws.

```markdown
<!-- .agents/rules/ddd-layer-rules.md -->
# DDD Layer Rules

❌ NEVER import infrastructure classes from the domain
❌ NEVER put business logic in controllers
✅ Use cases depend only on interfaces, never on implementations
✅ Repositories belong to the infrastructure layer
```

Claude Code evaluates rules before any edit. If an action violates them, it halts execution and reports it. Cursor uses `.cursorrules` with the same philosophy.

---

### Sub-Agent

A sub-agent is a child agent that the main agent launches to solve a specific task in parallel or in isolation. The result returns to the parent agent, which integrates it.

In Claude Code, the `Agent tool` lets the model orchestrate specialised sub-agents:

```
Main agent: "implement full authentication"
    ├── Sub-agent A: "design the database schema"
    ├── Sub-agent B: "implement the JWT backend"
    └── Sub-agent C: "implement the Angular form"
```

Each sub-agent works in parallel with its own context. The main agent coordinates, integrates and resolves conflicts. This drastically accelerates large tasks.

---

### Worktree

A worktree is an isolated copy of the git repository where the sub-agent can work without contaminating the main branch. If something goes wrong, it is discarded without a trace.

```bash
# Claude Code creates a worktree automatically for tasks with isolation: "worktree"
git worktree add .worktrees/feature-auth -b feat/auth

# The agent works in .worktrees/feature-auth/
# Success → merge to main
# Failure → git worktree remove .worktrees/feature-auth
```

This is fundamental in vibe coding: you can delegate risky experiments without fear. The agent tries, refactors, breaks and rebuilds in its own space. Your branch stays intact.

Cursor implements something similar with its checkpoint system and the ability to granularly revert agent changes.

---

### MCP (Model Context Protocol)

MCP is the open standard protocol that allows agents to connect with external tools and services: databases, APIs, ticketing systems, browsers, cloud services.

```json
// mcp_config.json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "./src"]
    },
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "..." }
    },
    "postgres": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-postgres", "postgresql://..."]
    }
  }
}
```

With MCP, the agent can read your database to understand the schema before generating migrations, automatically open PRs on GitHub, or search Jira for ticket requirements. It is the bridge between AI and your real ecosystem.

Claude Code, Cursor, Gemini CLI and OpenCode all implement MCP. Any MCP server works across all of them.

---

## The three configuration scopes

One of the most powerful features of Claude Code is its layered configuration system. Each layer inherits from the previous one and can override it.

### Global Scope

Configuration that applies to **all your projects**. Lives in `~/.claude/` on your local machine.

```
~/.claude/
├── settings.json       ← global preferences, default permissions
├── CLAUDE.md           ← instructions that always apply
└── memory/             ← persistent memory across sessions
```

Here you define things like: *"always use commits in English"*, *"never push without confirmation"*, *"my editor is VS Code"*. These are your personal preferences, not the project's.

### Project Scope

Repository-specific configuration. Lives in `.claude/` or `CLAUDE.md` at the project root and is versioned in git.

```
my-project/
├── CLAUDE.md               ← project context, stack, architectural decisions
├── .claude/
│   └── settings.json       ← permissions and tools allowed in this project
└── .agents/
    ├── skills/             ← project skills
    ├── workflows/          ← project workflows
    └── rules/              ← project rules
```

The project's `CLAUDE.md` is where you describe the stack, conventions, available agents and patterns to follow. It is the agent's onboarding into your codebase.

### Local Scope

Your personal configuration for that project, which **is not versioned**. Lives in `.claude/settings.local.json`.

```json
// .claude/settings.local.json  (in .gitignore)
{
  "env": {
    "DATABASE_URL": "postgresql://localhost/my_db_local",
    "API_KEY": "sk-local-only-..."
  },
  "permissions": {
    "allow": ["Bash(docker:*)"]
  }
}
```

Here go your local credentials, machine-specific paths, or permissions that you need but your teammates do not. Each developer on the team can have a different local scope on the same project.

---

## The full flow in practice

A typical vibe coding day with this architecture:

```
1. You open Claude Code in your project
2. The agent loads: global CLAUDE.md + project CLAUDE.md + settings.local.json
3. You ask: "implement the payments module following our DDD rules"
4. The agent:
   - Reads the DDD rules before writing anything
   - Loads the Spring skill (if applicable)
   - Creates an isolated worktree to work in
   - Launches sub-agents for backend and frontend in parallel
   - Uses MCP to query the current DB schema
   - Follows the PR creation workflow when done
5. You review the diff and merge
```

Instead of pair programming with a human, you have a team of specialised agents — coordinated, with memory of your preferences and respect for your rules.

---

## Which tool to choose?

| | Claude Code | Gemini CLI | Cursor | OpenCode |
|---|---|---|---|---|
| **Context** | 200k tokens | 1M tokens | Variable | Variable |
| **Agents** | ✅ Native | ✅ Native | ✅ Composer | ✅ |
| **MCP** | ✅ | ✅ | ✅ | ✅ |
| **Worktrees** | ✅ | ❌ | ❌ | ❌ |
| **Config layers** | ✅ 3 layers | Limited | ✅ Partial | ✅ |
| **Open Source** | ❌ | ❌ | ❌ | ✅ |
| **Best for** | Teams, complex projects | Massive context | IDE-first | Full privacy |

There is no universal answer. Claude Code shines in projects with complex architecture and teams that want to standardise how AI works. Gemini CLI wins when the entire repo context fits in a single prompt. Cursor is the best experience if you do not want to leave the IDE. OpenCode if privacy is non-negotiable.

---

## Conclusion

Mature vibe coding is not *"I write prompts and pray"*. It is building a context infrastructure: skills that encapsulate domain knowledge, rules that protect architectural invariants, workflows that automate processes, specialised agents that collaborate, and worktrees that isolate risk.

When that infrastructure is well built, AI stops being an autocomplete assistant and becomes a team member that understands the project.

That is what makes vibe coding, done right, a genuine advantage.
