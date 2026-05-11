# Claude Code Concepts

Reference guide for the core building blocks available in Claude Code: skills, workflows, rules, commands, agents, hooks, memory, tools, MCP servers, and the permission system. Includes scope levels, how Claude Code loads and applies each one, and the full request lifecycle.

---

## Skills

A **skill** is a Markdown file (`SKILL.md`) that gives Claude a specialized capability or domain knowledge for a specific task. Skills are loaded into Claude's context when invoked and guide its behavior for that scope.

### Structure

```
.agents/skills/my-skill/
└── SKILL.md          # Required — instructions, context, and examples
└── references/       # Optional — supplementary docs Claude can read
└── evals/            # Optional — test cases for the skill
```

### How Claude Code handles them

- Skills are listed in the system prompt as available slash commands (`/my-skill`)
- When invoked, the `SKILL.md` content is injected into the active context
- Claude follows the skill's instructions for the duration of that task
- Skills do **not** persist between conversations unless re-invoked

### Scope

| Scope | Location | Availability |
|-------|----------|--------------|
| **Global** | `~/.claude/skills/` | All projects on the machine |
| **Project** | `.agents/skills/` or `.claude/skills/` | Current project only |

### When to create a skill

- Repetitive domain-specific tasks (e.g., "generate a Spring entity")
- Encoding team conventions that Claude should follow consistently
- Encapsulating a multi-step process into a single slash command

---

## Workflows

A **workflow** is a Markdown file that describes a multi-step process, pipeline, or procedure. Unlike skills, workflows are reference documentation — Claude reads them to understand how a process works and follows the steps described.

### Structure

```
.agents/workflows/
└── maven-github-ci.md       # Step-by-step CI/CD pipeline instructions
└── docker-compose-infra.md  # Local environment setup procedure
```

### How Claude Code handles them

- Workflows are not automatically injected — Claude reads them on demand
- They serve as authoritative documentation for processes the team follows
- Claude uses them to generate config files (YAML, Dockerfiles) or explain procedures
- Typically referenced in skills or CLAUDE.md to make them discoverable

### Scope

| Scope | Location | Availability |
|-------|----------|--------------|
| **Project** | `.agents/workflows/` | Current project only |

### When to create a workflow

- Standardized deployment or build pipelines
- Repeatable infrastructure setup (local dev, staging, prod)
- Any process that should be documented and followed consistently

---

## Rules

A **rule** is a Markdown file that defines constraints, conventions, or invariants that Claude must respect. Rules are enforced passively — Claude checks generated code against them and will not violate them.

### Structure

```
.agents/rules/
└── ddd-layer-rules.md    # Architectural constraints with a verification checklist
```

### How Claude Code handles them

- Rules are referenced in CLAUDE.md or skills so Claude is aware of them
- When writing or reviewing code, Claude checks against active rules
- A rule file typically includes: the constraint, the rationale, and a checklist
- Rules can be automatically enforced via hooks in `settings.json`

### Scope

| Scope | Location | Availability |
|-------|----------|--------------|
| **Global** | `~/.claude/rules/` | All projects |
| **Project** | `.agents/rules/` | Current project only |

### When to create a rule

- Architecture constraints (e.g., DDD layer isolation)
- Coding standards that must not be violated (e.g., no business logic in controllers)
- Security policies (e.g., never log credentials)

---

## Commands

A **command** (slash command) is an invocable instruction triggered by typing `/command-name` in the Claude Code interface. Commands can be backed by a skill file or defined inline in settings.

### Types

| Type | Backed by | Example |
|------|-----------|---------|
| **Skill command** | A `SKILL.md` file | `/java-spring-ddd` |
| **Custom command** | Inline definition in settings | `/deploy` |
| **Built-in command** | Claude Code core | `/help`, `/clear`, `/compact` |

### How Claude Code handles them

- Skill-backed commands: Claude loads the `SKILL.md` into context and executes
- Custom commands: defined in `settings.json` under `hooks` or as shell scripts
- Built-in commands: handled natively by the Claude Code CLI

### Scope

| Scope | Location | Availability |
|-------|----------|--------------|
| **Global** | `~/.claude/skills/` or `~/.claude/commands/` | All projects |
| **Project** | `.agents/skills/` or `.claude/skills/` | Current project only |
| **Local** | `.claude/settings.local.json` | Current machine, not committed |

### When to create a command

- Any skill you want to invoke by name during a conversation
- Shortcuts for common project-specific tasks
- Wrappers around shell scripts that Claude should be able to trigger

---

## Agents

An **agent** is a Markdown file (`AGENT.md`) that defines a specialized persona or role for Claude to adopt. Agents have a focused scope of responsibility, a defined skill set, and a specific decision-making style.

### Structure

```
.agents/agents/backend-ddd-lead/
└── AGENT.md    # Role definition, responsibilities, skills to activate, tech context
```

### How Claude Code handles them

- Agents are not auto-loaded — they are invoked explicitly or referenced in CLAUDE.md
- When active, Claude adopts the agent's persona, constraints, and priorities
- An agent definition typically activates related skills and rules
- In multi-agent setups, different agents can handle different parts of a task in parallel

### Scope

| Scope | Location | Availability |
|-------|----------|--------------|
| **Global** | `~/.claude/agents/` | All projects |
| **Project** | `.agents/agents/` | Current project only |

### When to create an agent

- Representing a specific team role (e.g., DBA, frontend lead, DevOps)
- Enforcing a consistent perspective across multiple sessions
- Orchestrating complex tasks by delegating to specialized sub-agents

---

## Scope Summary

```
~/.claude/                    ← Global scope (all projects, single machine)
├── skills/                   # Global skills and commands
├── agents/                   # Global agent definitions
├── settings.json             # Global permissions, hooks, env vars
└── CLAUDE.md                 # Global instructions for Claude

<project-root>/
├── CLAUDE.md                 ← Project instructions (committed, shared with team)
├── .claude/
│   ├── settings.json         # Project permissions and hooks (committed)
│   └── settings.local.json   # Personal overrides (gitignored)
└── .agents/
    ├── skills/               # Project skills
    ├── workflows/            # Project workflows
    ├── rules/                # Project rules
    └── agents/               # Project agent definitions
```

### Load order

Claude Code loads configuration in this order (later overrides earlier):

1. Global user settings (`~/.claude/settings.json`)
2. Project settings (`.claude/settings.json`)
3. Local overrides (`.claude/settings.local.json`)

`CLAUDE.md` files follow the same precedence — project-level instructions extend or override global ones.

---

## Hooks

A **hook** is a shell command (or prompt/agent) configured in `settings.json` that fires automatically at specific lifecycle events — before or after tool use, on session start, when Claude stops, etc. Hooks run outside Claude's context; they are executed by the Claude Code harness, not by Claude itself.

### Hook events

| Event | Fires when |
|-------|-----------|
| `PreToolUse` | Before Claude calls any tool (can block the call) |
| `PostToolUse` | After a tool succeeds |
| `PostToolUseFailure` | After a tool fails |
| `Stop` | When Claude finishes responding |
| `SessionStart` | When a new session opens |
| `UserPromptSubmit` | When the user submits a message |
| `PreCompact` | Before context compaction |
| `PostCompact` | After context compaction |

### Hook types

| Type | Description |
|------|-------------|
| `command` | Runs a shell command. Receives tool input as JSON on stdin. |
| `prompt` | Asks a small LLM to evaluate a condition and decide allow/block. |
| `agent` | Runs a full sub-agent with tools to verify or act on the event. |

### Hook output (command type)

A hook command can return JSON to control behavior:

```json
{
  "continue": false,
  "stopReason": "Blocked: file outside allowed paths",
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny"
  }
}
```

### Scope

| Scope | Location | Committed | Applies to |
|-------|----------|-----------|------------|
| **Global** | `~/.claude/settings.json` | No (user machine) | All projects on this machine |
| **Project** | `.claude/settings.json` | Yes | Everyone who clones the repo |
| **Local** | `.claude/settings.local.json` | No (gitignored) | Only you, in this project |

- **Global** — personal hooks that apply everywhere, regardless of project (e.g., always log bash commands)
- **Project** — team-wide hooks shared via git; every contributor gets them automatically
- **Local** — personal overrides for a specific project; never committed, safe for machine-specific paths or credentials

### When to use hooks

- Auto-format files after Claude writes them (`PostToolUse` on `Write|Edit`)
- Log all bash commands for auditing (`PreToolUse` on `Bash`)
- Block writes to protected paths (`PreToolUse` on `Write`)
- Run tests after code changes (`PostToolUse` on `Write|Edit`)
- Send a notification when Claude finishes a long task (`Stop`)

---

## Memory (CLAUDE.md)

`CLAUDE.md` is the primary mechanism for giving Claude **persistent instructions** across all conversations. It is loaded automatically at session start — no invocation needed.

### Load order

Claude Code reads and merges all `CLAUDE.md` files found in:

1. `~/.claude/CLAUDE.md` — Global instructions (always loaded)
2. `<project-root>/CLAUDE.md` — Project instructions (loaded when inside the project)
3. Subdirectory `CLAUDE.md` files — Loaded when Claude reads files in that directory

Later entries extend (not replace) earlier ones.

### What to put in CLAUDE.md

- Project purpose and architecture overview
- Inventory of available skills, workflows, rules, and agents
- Conventions Claude must follow (naming, patterns, testing approach)
- Commands to run before starting work (e.g., `npm install`, build steps)
- Things Claude should **never** do in this project

### Auto-memory

Claude Code can maintain a persistent memory directory (`~/.claude/projects/<project>/memory/`) where it saves facts, preferences, and decisions across sessions. This supplements `CLAUDE.md` with dynamic, conversation-derived knowledge.

---

## Tools

**Tools** are the primitive actions Claude can take. Every file read, shell command, web search, or code edit is executed through a tool call. Claude cannot do anything that isn't backed by a tool.

### Built-in tools

| Tool | What it does |
|------|-------------|
| `Read` | Read a file from disk |
| `Write` | Create or overwrite a file |
| `Edit` | Apply a targeted string replacement to a file |
| `Bash` | Run a shell command |
| `Glob` | Find files matching a pattern |
| `Grep` | Search file contents with regex |
| `WebFetch` | Fetch a URL |
| `WebSearch` | Search the web |
| `TodoWrite` | Manage a structured task list |
| `Agent` | Spawn a sub-agent to handle a subtask |

### Permission model

Every tool call goes through the permission system before executing:

- **allow** rules → execute without prompting
- **ask** rules → pause and ask the user
- **deny** rules → block immediately

Rules use a pattern syntax: `Bash(git *)` matches any `git` command; `Read` matches all reads; `Edit(.claude)` matches edits inside `.claude/`.

### Permission modes

| Mode | Behavior |
|------|---------|
| `default` | Ask for anything not in the allow list |
| `acceptEdits` | Auto-approve file edits; ask for Bash |
| `auto` | Auto-approve most actions (low friction) |
| `bypassPermissions` | Skip all prompts (use with caution) |

---

## MCP Servers

**MCP (Model Context Protocol)** servers extend Claude Code with external tools and data sources. An MCP server exposes tools (and optionally resources/prompts) that Claude can call just like built-in tools.

### How they work

1. Claude Code starts the MCP server process (stdio) or connects to a remote one (HTTP/SSE)
2. The server advertises its available tools via the MCP protocol
3. Claude sees those tools in its context and can call them
4. The server executes the call and returns the result

### Configuration (`.mcp.json` or `settings.json`)

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
    }
  }
}
```

### Scope

| Scope | Location |
|-------|----------|
| **Global** | `~/.claude/settings.json` |
| **Project** | `.mcp.json` (committed) or `.claude/settings.json` |
| **Local** | `.claude/settings.local.json` |

### When to use MCP servers

- Access external APIs (GitHub, Jira, Slack, databases)
- Give Claude read/write access to systems beyond the local filesystem
- Build custom tools that Claude can call as first-class actions

---

## Context Window

The **context window** is the finite space Claude can hold in active memory during a conversation. Everything Claude knows about the current task — system prompt, CLAUDE.md files, skill content, conversation history, tool results — competes for this space.

### What consumes context

| Component | Notes |
|-----------|-------|
| System prompt | Fixed overhead per session |
| CLAUDE.md files | Loaded at start; larger files cost more |
| Skill content | Injected when a skill is invoked |
| Conversation history | Grows with every message and tool result |
| Tool results | File reads and bash output can be large |

### Compaction

When context approaches the limit, Claude Code runs **compaction**: it summarizes the conversation history into a condensed form, freeing space for new work. The `PreCompact` and `PostCompact` hooks fire around this event.

- `/compact` — Trigger compaction manually
- `autoCompactWindow` setting — Configure the threshold (tokens)

### Practical implications

- Large file reads consume context fast — prefer targeted reads over whole-file reads
- Long conversations degrade recall of early context — use CLAUDE.md for persistent facts
- Skills and agents add overhead — invoke only what is needed for the current task

---

## Scope Summary

```
~/.claude/                        ← Global scope (all projects, single machine)
├── CLAUDE.md                     # Global persistent instructions
├── skills/                       # Global skills and commands
├── agents/                       # Global agent definitions
├── settings.json                 # Global permissions, hooks, env vars
└── projects/<name>/memory/       # Auto-memory per project

<project-root>/
├── CLAUDE.md                     ← Project instructions (committed, shared)
├── .mcp.json                     # MCP server definitions (committed)
├── .claude/
│   ├── settings.json             # Project permissions and hooks (committed)
│   └── settings.local.json       # Personal overrides (gitignored)
└── .agents/
    ├── CONCEPTS.md               # This file
    ├── skills/                   # Project skills
    ├── workflows/                # Project workflows
    ├── rules/                    # Project rules
    └── agents/                   # Project agent definitions
```

### Settings load order

1. Global user settings (`~/.claude/settings.json`)
2. Project settings (`.claude/settings.json`)
3. Local overrides (`.claude/settings.local.json`)

Later entries override earlier ones for scalar values; arrays (allow/deny/hooks) are merged.

---

## Request Lifecycle

The complete journey from a user message to an implemented change:

```
User submits message
        │
        ▼
┌─────────────────────────────────────────────────────┐
│  1. SESSION BOOTSTRAP (once per session)            │
│                                                     │
│  • Load ~/.claude/settings.json                     │
│  • Load .claude/settings.json                       │
│  • Load .claude/settings.local.json                 │
│  • Read all CLAUDE.md files (global → project)      │
│  • Build system prompt: CLAUDE.md + skill listing   │
│  • Start MCP servers defined in config              │
│  • Fire SessionStart hooks                          │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│  2. USER PROMPT SUBMITTED                           │
│                                                     │
│  • Fire UserPromptSubmit hooks                      │
│  • Hook can inject context or block the message     │
│  • Message enters the context window                │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│  3. CLAUDE REASONS                                  │
│                                                     │
│  • Reads system prompt + CLAUDE.md + history        │
│  • Identifies intent and plans approach             │
│  • Decides which tools to call                      │
│  • If a skill was invoked: injects SKILL.md content │
│  • If an agent is active: adopts its persona        │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│  4. TOOL CALL REQUESTED                             │
│                                                     │
│  • Claude emits a tool call (e.g., Edit, Bash, Read)│
│  • PreToolUse hooks fire                            │
│    → Hook can: allow, deny, or modify the call      │
│  • Permission system checks allow/deny/ask rules    │
│    → allow: execute immediately                     │
│    → ask: pause, show user, wait for approval       │
│    → deny: block, return error to Claude            │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│  5. TOOL EXECUTES                                   │
│                                                     │
│  • The tool runs (file written, command executed…)  │
│  • Result is returned to Claude as tool output      │
│  • PostToolUse hooks fire (or PostToolUseFailure)   │
│    → Hook can: run formatter, trigger tests, log    │
│  • Tool result is added to the context window       │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│  6. CLAUDE CONTINUES REASONING                      │
│                                                     │
│  • Reads tool result                                │
│  • Decides: done, or needs more tool calls?         │
│  • Repeats steps 4–5 until task is complete         │
│  • Checks active rules against generated output     │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│  7. RESPONSE DELIVERED                              │
│                                                     │
│  • Claude writes final text response to user        │
│  • Stop hooks fire                                  │
│    → Hook can: send notification, run summary, etc. │
│  • Context window grows (history accumulates)       │
│  • If context near limit → compaction triggered     │
└─────────────────────────────────────────────────────┘
        │
        ▼
     Next user message → back to step 2
```

### Key insight

Claude never directly writes to disk, runs commands, or calls APIs. **Every side effect goes through a tool call**, and every tool call passes through the permission system and any configured hooks. This is what makes the system auditable and controllable.

---

## Quick Reference

| Concept | File | Invocation | Persists |
|---------|------|------------|---------|
| Skill | `SKILL.md` | `/skill-name` | Per invocation |
| Workflow | `workflow.md` | Read on demand | No |
| Rule | `rule.md` | Referenced in context | While active |
| Command | `SKILL.md` or settings | `/command-name` | Per invocation |
| Agent | `AGENT.md` | Explicit activation | Per session |
| Hook | `settings.json` | Automatic (event-driven) | Always |
| Memory | `CLAUDE.md` / auto-memory | Automatic (session start) | Persistent |
| Tool | Built-in | Called by Claude | Per call |
| MCP Server | `.mcp.json` | Automatic (session start) | While running |
