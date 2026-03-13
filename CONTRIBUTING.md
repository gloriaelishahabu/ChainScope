# Contributing to ChainScope

Thanks for your interest in contributing to ChainScope! This is an open-source project and we welcome bug fixes, features, documentation improvements, and everything in between.

## How to Contribute

### 1. Find an issue

- Browse [`issues.txt`](issues.txt) for a list of open bugs and improvements
- Issues are tagged **[Trivial]**, **[Medium]**, or **[High]** complexity
- If you're new, start with a **[Trivial]** issue
- If you have your own improvement idea, open a discussion first

### 2. Fork and branch

```bash
git clone https://github.com/your-username/chainscope.git
cd chainscope
git checkout -b fix/your-issue-name
```

Branch naming conventions:
- `fix/issue-description` for bug fixes
- `feat/feature-name` for new features
- `docs/what-you-changed` for documentation
- `refactor/what-you-refactored` for code improvements

### 3. Make your changes

- Keep PRs focused on one issue
- Write clear, readable code
- Add comments where the logic is non-obvious
- Don't introduce new `console.log` statements in production paths

### 4. Test your changes

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm start
# Manually verify your changes in the browser
```

### 5. Open a Pull Request

- Describe what you changed and why
- Reference the issue number if applicable: `Fixes #7`
- Include before/after screenshots for UI changes

---

## Code Style

- **JavaScript**: ES6+, no semicolons (except where required), single quotes
- **React**: Functional components with hooks; no class components
- **CSS**: Tailwind utility classes; avoid custom CSS unless necessary
- **Naming**: `camelCase` for variables/functions, `PascalCase` for components

---

## Project Structure

Please keep new code in the appropriate directory:

| What                         | Where                                    |
|------------------------------|------------------------------------------|
| New React page/component     | `frontend/src/components/`              |
| API utility functions        | `frontend/src/utils/api.js`             |
| New API route                | `backend/routes/`                        |
| Blockchain data fetching     | `backend/services/blockchainService.js`  |
| Documentation                | `docs/`                                  |

---

## Reporting Bugs

Open an issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Relevant file/function if known

---

## Questions?

Open a GitHub Discussion or tag `@chainscope/maintainers` in an issue.
