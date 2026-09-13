# Mini Kanban

Mini Kanban is a small, single-user task board for learning how to build a useful product with AI assistance.

## Status

The Lovable-generated frontend in `frontend/` and SQLAlchemy-backed FastAPI backend in `backend/` have verified local workflows.

## Version 1 at a glance

- One local user and one board.
- Three fixed columns: **To Do**, **In Progress**, and **Done**.
- Create, edit, move, reorder, and delete tasks.
- Title, description, Low/Medium/High priority, and an optional due date.
- Drag-and-drop for moving and ordering, plus visible left/right buttons for column moves.
- Changes persist across backend restarts and are shared across open browser tabs.
- Three selectable themes whose visual direction and default are owned by Lovable.
- Desktop-first layout that remains usable on narrow screens.

The complete standalone implementation backlog and acceptance criteria are in [`_docs/tasks.md`](_docs/tasks.md). [`_docs/plan.md`](_docs/plan.md) records the earlier product discussion.

## Technology

- React
- TypeScript
- A frontend API client using `VITE_API_URL`
- Python and FastAPI
- SQLAlchemy with SQLite by default

The frontend reads and writes tasks and preferences through the API. There is no authentication, cloud sync, or application API key.

## Visual direction

The interface combines a modern product layout with restrained retro-futuristic, pixel-game details. Pixel styling is reserved for small labels, icons, borders, and subtle texture; task content remains clean and readable.

Three selectable themes are planned, while their palettes, names, and default remain frontend design decisions. The earlier [palette comparison](design/mini-kanban-palette-comparison.png) is exploratory rather than a requirement.

## Repository layout

```text
AGENTS.md                         Instructions for coding agents
CLAUDE.md                         Loads the shared agent instructions
_docs/
  plan.md                         Earlier V1 product discussion and rationale
  tasks.md                        Standalone V1 backlog and acceptance criteria
  loveable-instructions.md        Concise frontend brief for Lovable
design/
  mini-kanban-palette-comparison.png
  palette-comparison.html        Editable palette study
frontend/                         Lovable-generated application
backend/                          FastAPI, SQLAlchemy, and backend tests
openapi.yaml                      Backend contract
README.md
```

## Verified local commands

Start the complete local application from the repository root:

```sh
make run
```

This starts the frontend at `http://localhost:8080` and the backend at `http://localhost:8091`. Press `Ctrl+C` once to stop both. Override the ports when needed with, for example, `make run FRONTEND_PORT=8083 BACKEND_PORT=8093`.

Run all frontend and backend tests with:

```sh
make test
```

Run these from the repository root:

```sh
cd frontend
bun test
bun run lint
bun run build
```

For normal local use, run `make run` and open the frontend URL. A new database starts with three demonstration tasks, and the frontend checks the API for updates about once per second, so changes made in one open tab appear automatically in another. Running `cd frontend && bun run dev` starts only the UI and expects the API at `http://localhost:8091/api/v1` unless `VITE_API_URL` is set.

Install, test, and start the backend from the repository root:

```sh
cd backend
uv sync
uv run pytest
uv run uvicorn app.main:app --reload --port 8091
```

The API is at `http://localhost:8091/api/v1`; interactive FastAPI documentation is at `http://localhost:8091/docs`. By default, data is stored in the ignored file `backend/mini-kanban.db`. Set `DATABASE_URL` to use another SQLAlchemy database URL, for example `DATABASE_URL=sqlite:////tmp/mini-kanban.db make run`.

## Local data and secrets

Tasks and preferences persist in the configured database. Local database files and `.env` files are ignored by Git. Any GitHub credential stored locally is tooling-only and must never be exposed to client-side code or committed.

## Deliberate limits

The current project does not include multiple boards, authentication, collaboration, search, filters, subtasks, attachments, reminders, integrations, or analytics. These are excluded so the homework project remains small and complete.
