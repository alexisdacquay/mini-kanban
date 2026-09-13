# Commands

- The Lovable frontend is in `frontend/`. The following commands were verified in this checkout:
  - `cd frontend && bun test`
  - `cd frontend && bun run lint`
  - `cd frontend && bun run build`
- For local browser use, run `cd frontend && bun run dev`; Vite prints the local URL.
- From the repository root, `make run` starts the frontend and mocked backend together.
- The mocked FastAPI backend is in `backend/`:
  - `cd backend && uv sync` - install backend dependencies
  - `cd backend && uv run pytest` - run backend tests
  - `cd backend && uv run uvicorn app.main:app --reload --port 8091` - start the API

# Rules

- Treat `_docs/tasks.md` as the source of truth for the original frontend MVP. `_docs/plan.md` records the earlier product discussion.
- Treat `openapi.yaml` as the mocked backend contract.
- When executing the backlog, follow `_docs/process.md` and its linked role definitions.
- The frontend still uses browser `localStorage`; it is not wired to the API yet.
- Keep the backend in-memory and unauthenticated until the owner requests persistence or auth.
- Ask before adding dependencies.
- Never commit credentials or expose them to frontend code.
