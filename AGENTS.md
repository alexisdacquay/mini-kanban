# Commands

- The Lovable frontend is in `frontend/`. The following commands were verified in this checkout:
  - `cd frontend && bun test`
  - `cd frontend && bun run lint`
  - `cd frontend && bun run build`
- For local browser use, run `cd frontend && bun run dev`; Vite prints the local URL.

# Rules

- Treat `_docs/tasks.md` as the standalone implementation source of truth for version 1. `_docs/plan.md` records the earlier product discussion.
- When executing the backlog, follow `_docs/process.md` and its linked role definitions.
- Keep version 1 client-side: React, TypeScript, and browser `localStorage`; no backend.
- Tasks, task order and columns, and preferences are saved only in the current browser profile.
- Ask before adding dependencies.
- Never commit credentials or expose them to frontend code.
