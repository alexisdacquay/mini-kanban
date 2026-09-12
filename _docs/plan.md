# Mini Kanban: version 1 plan

## Status

Product choices are confirmed, and the Lovable-generated frontend is present in `frontend/`. The session-sized backlog covers verification and the remaining version 1 gaps; application state stays in the browser for now.

## Goal

Build the smallest useful Kanban board while learning to create software with AI assistance. Version 1 succeeds by completing a narrow workflow reliably, not by imitating a full project-management platform.

## Product rule

Every task on the board is committed work. There is no backlog: if a task is not intended to be done, it does not belong on this board.

## Intended user

- One person using one browser.
- No account or sign-in.
- One board, representing one project.

## Version 1 scope

### Board

- Exactly three fixed columns in this order: **To Do**, **In Progress**, **Done**.
- Columns cannot be created, renamed, reordered, or deleted.
- Cards can be manually reordered by drag-and-drop within a column.
- Cards can be dragged directly into any column.
- Visible move buttons step a card one column left or right.
- Done cards remain visible until manually deleted and can be moved back.

### Tasks

Each task exposes these user-facing fields:

| Field | Rule |
| --- | --- |
| Title | Required; whitespace-only titles are rejected |
| Description | Optional plain text |
| Priority | Required: Low, Medium, or High; defaults to Medium |
| Due date | Optional calendar date with no time |

The board also stores each task's current column and manual position; these are not fields in the create or edit form.

The user can:

- Create a task using one form or modal containing all four user-facing fields.
- Open and edit an existing task.
- Move a task by drag-and-drop.
- Move a task with visible left/right buttons, so dragging is not required.
- Reorder tasks by drag-and-drop within a column.
- Delete a task only after a confirmation step.

Deletion is permanent in version 1. There is no archive or undo history.

### Minimal implementation defaults

These fill ordinary gaps without adding product features:

- A new task enters **To Do** at the top of the column.
- Existing tasks are editable; otherwise mistakes in task details could not be corrected.
- Description is optional and priority defaults to Medium.
- Titles containing only whitespace are invalid.
- A first-time user starts with an empty board.

### Persistence

- Task data, column placement, card order, and the selected theme are saved automatically in browser `localStorage`.
- State survives a refresh and reopening the app in the same browser profile.
- Persist state under a namespaced, versioned key. Missing or invalid saved data must fall back safely to an empty board instead of crashing the app.
- Cards in design mockups are illustrative only and are not seeded into the app.
- Clearing the browser's site data may erase the board. The interface or README must not imply cloud backup.

### Screen support

- Desktop-first layout.
- On a narrow screen, the three-column board remains usable through horizontal scrolling.
- A separate mobile layout is not required.

### Themes

The top area contains a control for three distinct themes, and the chosen theme is remembered in browser `localStorage`. Lovable owns the theme names, palettes, default, and detailed presentation.

### Visual principles

- Aim for a polished, contemporary interface with retro-futuristic game influence.
- Use pixel-inspired typography only for compact headings, column labels, counters, and metadata.
- Use modern, readable type for task titles, descriptions, and forms.
- Suitable details include crisp one-pixel rules, stepped corners, small status glyphs, hard offset shadows, and restrained dither or circuit texture in headers or empty space.
- Do not place texture or scanlines behind body text.
- Avoid blanket pixel fonts, heavy neon glow, chunky low-resolution controls, novelty game chrome, or a visual imitation of a 2005 website.
- Character or monster artwork is not part of version 1.
- The supplied Overmind Lab and Nous Research/Hermes images are mood references, not assets to copy.

## Accessibility baseline

- Moving a card between columns also has labelled left/right buttons, so this action does not require dragging.
- Forms, buttons, and the theme control are keyboard reachable and have a visible focus state.
- Keyboard-only card reordering is not required in version 1.
- Text and controls maintain readable contrast in all three themes.
- Controls do not rely on colour alone to communicate purpose or state.

## Acceptance criteria

Version 1 is complete only when all of the following are true:

1. A first-time visit shows one empty board with the fixed To Do, In Progress, and Done columns.
2. A coherent default theme is applied on first use.
3. One create form or modal shows title, description, priority, and due date; a valid submission creates the task at the top of To Do.
4. The create form rejects a blank title, permits an empty description and due date, offers only Low/Medium/High priority, and defaults priority to Medium.
5. An existing task can be reopened, edited, and saved.
6. A task can move between columns through both drag-and-drop and visible move buttons.
7. Tasks can be reordered by drag-and-drop within a column.
8. Task content, status, order, and selected theme survive refresh in the same browser profile.
9. A Done task remains visible and can move back to an earlier column.
10. Delete first asks for confirmation; cancelling preserves the task and confirming removes it persistently.
11. Three distinct themes can be selected from a control in the top area, and the selection survives refresh.
12. The board remains operable on a narrow screen through horizontal scrolling.
13. Forms, buttons, and the theme control have labels, keyboard access, visible focus, and sufficient contrast.

## Explicitly out of scope

- Accounts, authentication, multiple users, permissions, or collaboration.
- Multiple boards or projects.
- Backend services, APIs, databases, cloud sync, or deployment infrastructure.
- A backlog, custom columns, swimlanes, or work-in-progress limits.
- Search, filters, or automatic sorting.
- Labels, assignees, subtasks, checklists, comments, or attachments.
- Archiving, restore history, or automatic removal from Done.
- Recurring tasks, reminders, notifications, time tracking, or analytics.
- Import/export, integrations, or activity history.
- User-created themes or a separate mobile design.
- Mascots, monsters, elaborate pixel art, sound, or game mechanics.

## Deferred UI decisions

These do not block the scope and should be decided during frontend design:

- Whether Done cards are crossed out, muted, or both.
- The exact theme-control component and its position within the top area.
- Precise card and modal layout, typography, icons, texture, and motion.
- How an overdue or near-due date is visually highlighted.
- Any future character artwork.

## Delivery backlog

The small, session-sized implementation tasks are in [`_docs/tasks.md`](tasks.md). Application data remains browser-local; no data backend is planned for version 1.
