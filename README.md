# Mini Kanban

Mini Kanban is a small, single-user task board for learning how to build a useful product with AI assistance.

## Status

The Lovable-generated frontend in `frontend/` has a verified local test, lint, and production-build workflow.

## Version 1 at a glance

- One local user and one board.
- Three fixed columns: **To Do**, **In Progress**, and **Done**.
- Create, edit, move, reorder, and delete tasks.
- Title, description, Low/Medium/High priority, and an optional due date.
- Drag-and-drop for moving and ordering, plus visible left/right buttons for column moves.
- Automatic persistence in the same browser.
- Three selectable themes whose visual direction and default are owned by Lovable.
- Desktop-first layout that remains usable on narrow screens.

The complete standalone implementation backlog and acceptance criteria are in [`_docs/tasks.md`](_docs/tasks.md). [`_docs/plan.md`](_docs/plan.md) records the earlier product discussion.

## Planned technology

- React
- TypeScript
- Browser `localStorage`

Version 1 is client-side only. It has no backend, database, accounts, cloud sync, or application API keys.

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
README.md
```

## Verified local commands

Run these from the repository root:

```sh
cd frontend
bun test
bun run lint
bun run build
```

To use the board locally, run `cd frontend && bun run dev` and open the local URL Vite prints. The board starts empty for a browser profile with no saved Mini Kanban data. Tasks, their column placement and order, and the selected theme are stored in that browser profile with `localStorage`.

## Local data and secrets

Task data will remain in the current browser profile and can be lost if that browser's site data is cleared. Local `.env` files are ignored by Git. Any GitHub credential stored locally is tooling-only and must never be exposed to client-side code or committed.

## Deliberate limits

Version 1 does not include multiple boards, authentication, collaboration, a backend, search, filters, subtasks, attachments, reminders, integrations, or analytics. These are excluded so the first homework project remains small and complete.
