## Workflow Orchestration

### 1. Plan Mode Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately – don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes – don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing

- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests – then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

### 7. Testing & CI/CD

- Always run the full test suite before marking any task done
- Write tests for every new feature or module — no untested code ships
- For bug fixes: write a regression test that reproduces the bug first, then fix it
- Never submit code that breaks existing tests
- Check test coverage and flag gaps to the user
- If CI fails, diagnose and fix it autonomously — don't wait to be told
- Treat flaky tests as bugs: investigate and stabilize them
- Match the project's existing test framework and conventions
- Run linters and formatters as part of verification, not just tests

### 8. Change Tracking

- Maintain a running `tasks/changelog.md` file as a session cache
- Log every meaningful change with: timestamp, file(s) touched, what changed, and why
- Use this file as first reference before scanning the codebase
- Format entries as reverse-chronological (newest on top)
- At session start: read `tasks/changelog.md` to quickly rebuild context
- Keep entries concise — one line per change, expand only when necessary
- Tag entries by type: `[feat]`, `[fix]`, `[refactor]`, `[test]`, `[docs]`, `[chore]`
- Periodically prune old entries to keep the file lean and fast to parse

### 9. Browser Integration (MCP)

- Use the Playwright MCP server for browser-based verification
- Available browser actions: navigate, screenshot, click, fill forms, read console logs
- Only invoke browser tools when the project has a UI or web-accessible component
- For API-only or backend-only projects: skip browser verification entirely — do not fail tasks for lacking browser output

### 10. Visual Verification

- After any frontend or UI change, launch the app and screenshot affected pages
- Compare before/after behavior where possible
- Check the browser console for errors, warnings, or failed network requests
- Verify responsive behavior if the change touches layout or styling
- **When to run**: Only when the project serves something in a browser (e.g., web apps, dashboards, static sites, dev servers on `localhost`)
- **When to skip**: CLI tools, libraries, APIs, backend services, scripts, infrastructure code — anything with no browser-renderable output
- Never block or fail a task just because browser verification wasn't performed on a non-UI project

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections
7. **Log Changes**: Append every change to `tasks/changelog.md` as you go

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
