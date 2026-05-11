---
name: skill-creator
description: "Skill for designing and creating new skills within the workspace, ensuring they follow the official structure and naming conventions."
---

# Skill Creator

Use this skill when the user asks to create a new capability or "skill" for this development environment. Its goal is to generate the necessary file structure and write precise instructions so that other agents or you can execute specific tasks in the future.

## Skill Structure

Each skill must reside in its own folder within `.agents/skills/`.

Minimum structure:
- `.agents/skills/<skill-name>/SKILL.md` (Mandatory)

Recommended structure for complex skills:
- `.agents/skills/<skill-name>/scripts/` (Helper scripts)
- `.agents/skills/<skill-name>/resources/` (Templates, documents, assets)
- `.agents/skills/<skill-name>/examples/` (Implementation examples)

## Instructions for Writing `SKILL.md`

1. **Frontmatter (YAML)**:
   - `name`: Unique identifier in lowercase and hyphen-separated (e.g., `web-scraper`).
   - `description`: A clear third-person description explaining what the skill does and when it should be activated.

2. **Document Body**:
   - Define the purpose of the skill.
   - Provide step-by-step instructions or behavioral rules.
   - Include guides on how to use additional resources (scripts or skill folders).
   - Use a professional and direct tone.

## Language Conventions

- All internal descriptions and instructions for new skills should be written in **English** (or as requested by the user). 
- Folder names and the `name` field in the frontmatter must be in English to maintain technical compatibility and system conventions.

## Creation Process

1.  **Understand the Requirement**: Clarify with the user what specific functionality the new skill should have.
2.  **Design the Logic**: Before writing, plan what rules or tools the skill will need.
3.  **Generate Files**: Use the `write_to_file` tool to create the folder and the `SKILL.md` file.
4.  **Verification**: Confirm that the skill is detectable by listing the `.agents/skills/` directory.
