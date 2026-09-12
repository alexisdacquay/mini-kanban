# Mini Kanban

Mini Kanban is a small, single-user task board for learning how to build a useful product with AI assistance.

## Status

The first version is scoped and the Lovable-generated frontend is present in `frontend/`. It has not yet been installed or verified locally, so there are no confirmed install, run, build, or test commands to publish yet.

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

## Running locally

The scripts in `frontend/package.json` have not yet been verified in this checkout. Backlog task 1 establishes the testable project baseline; publish local commands here only after they have actually passed.

## Local data and secrets

Task data will remain in the current browser profile and can be lost if that browser's site data is cleared. Local `.env` files are ignored by Git. Any GitHub credential stored locally is tooling-only and must never be exposed to client-side code or committed.

## Deliberate limits

Version 1 does not include multiple boards, authentication, collaboration, a backend, search, filters, subtasks, attachments, reminders, integrations, or analytics. These are excluded so the first homework project remains small and complete.
