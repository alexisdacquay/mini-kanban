# Commands

- `make test` - run the frontend and backend test suites
- The Lovable frontend is in `frontend/`. The following commands were verified in this checkout:
  - `cd frontend && bun test`
  - `cd frontend && bun run lint`
  - `cd frontend && bun run build`
- For normal local browser use, run `make run` from the repository root. It starts the frontend on port `8080` and the backend on port `8091`.
- `cd frontend && bun run dev` starts only the UI; it expects the API at `http://localhost:8091/api/v1` unless `VITE_API_URL` is set.
- The FastAPI backend is in `backend/`:
  - `cd backend && uv sync` - install backend dependencies
  - `cd backend && uv run pytest` - run backend tests
  - `cd backend && uv run uvicorn app.main:app --reload --port 8091` - start the API

# Rules

- Treat `_docs/tasks.md` as the source of truth for the original frontend MVP. `_docs/plan.md` records the earlier product discussion.
- Treat `openapi.yaml` as the backend contract.
- When executing the backlog, follow `_docs/process.md` and its linked role definitions.
- The frontend reads and writes tasks and preferences through the API, and polls it about once per second so open tabs stay synchronized.
- Keep the SQLAlchemy persistence portable and the backend unauthenticated until the owner requests another database or auth.
- Ask before adding dependencies.
- Never commit credentials or expose them to frontend code.
