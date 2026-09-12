# Mini Kanban

Mini Kanban is a small, single-user task board for learning how to build a useful product with AI assistance.

## Status

The first version is scoped, including a few clearly labelled implementation defaults, but the application has not been built yet. Lovable will generate the frontend. This repository currently contains the product plan and visual direction only, so there are no verified install, run, build, or test commands to publish yet.

## Version 1 at a glance

- One local user and one board.
- Three fixed columns: **To Do**, **In Progress**, and **Done**.
- Create, edit, move, reorder, and delete tasks.
- Title, description, Low/Medium/High priority, and an optional due date.
- Drag-and-drop for moving and ordering, plus visible left/right buttons for column moves.
- Automatic persistence in the same browser.
- Three selectable themes, with **Terminal** as the default.
- Desktop-first layout that remains usable on narrow screens.

The complete requirements and acceptance criteria are in [`_docs/plan.md`](_docs/plan.md).

## Planned technology

- React
- TypeScript
- Browser `localStorage`

Version 1 is client-side only. It has no backend, database, accounts, cloud sync, or application API keys.

## Visual direction

The interface combines a modern product layout with restrained retro-futuristic, pixel-game details. Pixel styling is reserved for small labels, icons, borders, and subtle texture; task content remains clean and readable.

Three themes are planned: **Parchment**, **Night**, and **Terminal**. See the [palette comparison](design/mini-kanban-palette-comparison.png).

## Repository layout

```text
AGENTS.md                         Instructions for coding agents
_docs/
  plan.md                         V1 scope, defaults, and acceptance criteria
design/
  mini-kanban-palette-comparison.png
  palette-comparison.html        Editable palette study
README.md
```

## Running locally

There is no runnable application yet. After Lovable creates the frontend, replace this section with commands taken from the actual `package.json`; do not assume a package manager or script names beforehand.

## Local data and secrets

Task data will remain in the current browser profile and can be lost if that browser's site data is cleared. Local `.env` files are ignored by Git. Any GitHub credential stored locally is tooling-only and must never be exposed to client-side code or committed.

## Deliberate limits

Version 1 does not include multiple boards, authentication, collaboration, a backend, search, filters, subtasks, attachments, reminders, integrations, or analytics. These are excluded so the first homework project remains small and complete.
