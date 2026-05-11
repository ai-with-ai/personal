---
name: project-planner
description: "Orchestrates the bootstrapping of new project features or entire repositories by suggesting and installing Workflows, Agents, Rules, Plugins, and Skills based on a project specification."
---

# 🏗️ Project Planner

Use this skill when a user provides a **Project Specification** (or a set of requirements) and wants a comprehensive plan to bootstrap the development environment with the necessary automations, rules, and specialized knowledge artifacts.

Your goal is to ensure the project has all the "Antigravity" structural integrity components required for high-velocity, high-quality delivery.

---

## 🛠️ Operational Workflow

This skill operates in 4 distinct phases. **NEVER skip a phase.**

### 1. Phase One: Requirement Gathering & Context Analysis
Before generating any suggestions, you **MUST** ask the user a set of clarifying questions to remove any ambiguity. Use this rubric as a guide:

- **🎯 Core Intent:** What is the primary business value?
- **💻 Tech Stack:** What are the choices for Frontend, Backend, Database, and Infrastructure?
- **📐 Architecture:** Which pattern is preferred (Clean/Hexagonal, DDD, Monolithic Modular)?
- **🔗 Integrations:** Are there specific external APIs or MCP servers required?
- **🛂 Governance:** Are there specific linting, security, or domain-specific rules needed?
- **🔀 Automation:** What developer workflows currently have the most friction?

### 2. Phase Two: Artifact Taxonomy Mapping
Map the project requirements into these five standard artifact types:

| Artifact Type | Description | Location (Project-Level) | Location (Global) |
| :--- | :--- | :--- | :--- |
| **Workflow** | Automated step sequences (e.g., CI, Deploy) | `.agents/workflows/` | `~/.gemini/antigravity/workflows/` |
| **Agent** | Specific persona/tool configs (e.g., QA Expert) | `.agents/agents/` | `~/.gemini/antigravity/agents/` |
| **Rule** | Guardrails, standards, & architectural constraints | `.agents/rules/` | `~/.gemini/antigravity/rules/` |
| **Plugin** | External tool integrations & configs | `.agents/plugins/` | `~/.gemini/antigravity/plugins/` |
| **Skill** | Reusable knowledge & utility folders | `.agents/skills/` | `~/.gemini/antigravity/skills/` |
| **MCP** | Model Context Protocol server integrations | `mcp_config.json` | `~/mcp_config.json` |

### 3. Phase Three: The Readiness Report
Present a summary table to the user. This table **MUST** include the following metadata for each proposed artifact:

- **Name:** Clear, descriptive identifier.
- **Type:** (Workflow, Agent, Rule, Plugin, Skill, MCP).
- **Status:** `Already Installed` (if it exists in the filesystem) or `Missing`.
- **Registry (`skills.sh`):** Is it tracked in the `skills.sh` installation script?
- **Scope:** `Project-Level` (checked into the repo) or `Global` (system-wide).

**Example Output:**
| Artifact | Type | Status | skills.sh | Scope |
| :--- | :--- | :--- | :--- | :--- |
| `fastapi-backend` | Skill | ✅ Installed | ✅ Yes | Project-Level |
| `deploy-vercel` | Workflow | ❌ Missing | ❌ No | Project-Level |

### 4. Phase Four: Confirmation & Installation
Ask the user for explicit approval to proceed with the installation of the "Missing" artifacts. Once approved, generate the corresponding folders and files using your standard creation tools.

---

## 📋 Best Practices
- **Premium Design:** Ensure all generated artifacts contain professional, comprehensive, and aesthetically pleasing documentation.
- **Atomic Changes:** Create artifacts one by one, ensuring each is functional and reversible.
- **Explainability:** For each suggested artifact, provide a brief "Rationale" for why it is included in the plan.
- **Consistency Check:** Ensure the artifacts do not conflict with the existing `user_global` prime directive.

---

## 📜 The `skills.sh` Registry
The `skills.sh` script (located in `.agents/` or the project root) serves as the source of truth for installed capabilities. When installing a skill, remember to update or suggest an update to this script to maintain environmental parity.
