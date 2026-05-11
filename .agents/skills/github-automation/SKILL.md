---
name: github-automation
description: "Master GitHub workflows for issue tracking, pull request management, and repository automation using the github-mcp-server toolkit."
---

# GitHub Automation

> **Automate repo management, issues, and PR workflows with precision.**

## 🎯 Selective Reading Rule

**Read ONLY the workflow section relevant to the current task!**

| Workflow | Purpose | Key Tools |
|----------|---------|-----------|
| **Issues** | Create, manage, and label issues | `issue_read`, `issue_write`, `list_issues`, `search_issues` |
| **Pull Requests** | Create, review, and merge PRs | `create_pull_request`, `pull_request_read`, `merge_pull_request` |
| **Repositories** | Manage branches and files | `list_branches`, `create_branch`, `push_files`, `search_repositories` |
| **Reviews** | Submit code reviews and comments | `pull_request_review_write`, `add_issue_comment` |

---

## 🛠️ Core Workflows

### 1. Issue Management
**When to use**: User wants to list, search, or create issues.

1.  **Search**: `mcp_github-mcp-server_search_issues` (query by keywords, labels, status).
2.  **List**: `mcp_github-mcp-server_list_issues` (get all issues/PRs for a specific repo).
3.  **Read**: `mcp_github-mcp-server_issue_read` with `method: "get"` (detailed info).
4.  **Create/Update**: `mcp_github-mcp-server_issue_write` with `method: "create"` or `"update"`.
5.  **Comment**: `mcp_github-mcp-server_add_issue_comment`.

**Pitfalls**: 
- `list_issues` includes PRs; use filters or the `pull_request` field to distinguish.
- Use `mcp_github-mcp-server_sub_issue_write` for hierarchy/tasks!

### 2. Pull Request Lifecycle
**When to use**: Creating, reviewing, and merging changes.

1.  **Create**: `mcp_github-mcp-server_create_pull_request` (provide `head`, `base`, `title`).
2.  **Check Status**: `mcp_github-mcp-server_pull_request_read` with `method: "get_status"` or `"get_check_runs"`.
3.  **Review Files**: `mcp_github-mcp-server_pull_request_read` with `method: "get_files"` or `"get_diff"`.
4.  **Review Writing**: `mcp_github-mcp-server_pull_request_review_write` with `method: "create"` and `"event: APPROVE/COMMENT"`.
5.  **Merge**: `mcp_github-mcp-server_merge_pull_request` (ONLY after user confirmation).

**Safety**:
- ALWAYS check `get_check_runs` before merging to ensure CI passes.
- Use `mcp_github-mcp-server_update_pull_request_branch` if the PR is out of sync.

### 3. Repository & Branch Operations
**When to use**: Handling files and branches at scale.

- **Branches**: `mcp_github-mcp-server_create_branch`, `mcp_github-mcp-server_list_branches`.
- **Files**: `mcp_github-mcp-server_push_files` (best for multi-file updates in one commit).
- **History**: `mcp_github-mcp-server_list_commits` / `mcp_github-mcp-server_get_commit`.

---

## 💡 Best Practices

### ID & Name Resolution
- **Owner/Repo**: Don't guess; use `mcp_github-mcp-server_get_me` to verify your own login or `search_repositories`.
- **Labels**: Use `mcp_github-mcp-server_get_label` to ensure the label exists before applying.

### Pagination Mindset
- All `list_*` tools use `page` and `perPage` (max 100).
- For `list_issues`, iterate until the response length is zero or less than `perPage`.

### Copilot Integration
- Use `mcp_github-mcp-server_assign_copilot_to_issue` to let the system generate PRs automatically.

---

## ⚠️ Anti-Patterns

❌ Merging PRs without checking CI/CD status first.
❌ Deleting files or merging without explicit user confirmation.
❌ Hard-coding owner/repo strings if the context provides them.
❌ Ignoring pagination when searching for specific items in large repos.

## When to Use
This skill is activated for all GitHub-related tasks, including issue tracking, PR automation, and repo maintenance.
