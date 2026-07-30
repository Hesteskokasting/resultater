---
name: file-issue
description: File a GitHub issue for flagged technical debt or an out-of-scope finding. Use when the user confirms filing an issue ("file it", "file 1 and 3") after Claude has flagged a problem.
---

- Only create issues after the user confirms ("file it", "file 1 and 3") — never automatically.
- Before filing, check `gh issue list --search "..."` for an existing issue covering the same thing.
- Create with `gh issue create --title "..." --body "..." --label tech-debt`. If the label doesn't exist yet, create it once with `gh label create tech-debt`.
- Title: imperative, ≤ 72 chars. Body: where (`file:line`), what's wrong, why it matters, and a suggested fix — written so it makes sense months later without this conversation.
