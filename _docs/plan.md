# Mini Kanban: version 1 plan

## Status

Product choices are confirmed. Minimal implementation defaults that make the scope buildable are identified separately below. This is documentation only; Lovable will implement the frontend later.

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

The top area contains a control for three named themes. Its exact component and placement are deferred to frontend design.

The following colours are suggested starting tokens derived from the accepted comparison mockup. Lovable may make small adjustments to meet contrast requirements without changing the character of a theme.

1. **Terminal — default on first use**
   - Near-black background: `#080706`
   - Dark panel: `#100C09`
   - Raised surface: `#17100C`
   - Orange accent: `#FF8126`
   - Bright focus/hover accent: `#FFB15C`
   - Use warm light text for longer copy; orange is for emphasis, controls, labels, and rules rather than every word.
2. **Night**
   - Navy frame: `#0D182A`
   - Blue panel: `#152239`
   - Ivory card: `#F5ECD8`
   - Raised ivory card: `#FFF8E8`
   - Gold accent: `#E0AD21`
   - Dark card text: `#172239`
3. **Parchment**
   - Warm canvas: `#F4EBD7`
   - Column surface: `#FFF8E9`
   - Card surface: `#FFFCF3`
   - Navy text: `#122039`
   - Amber accent: `#E4A817`

The chosen theme is remembered in browser `localStorage`. The comparison is saved at [`design/mini-kanban-palette-comparison.png`](../design/mini-kanban-palette-comparison.png).

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
2. Terminal is the first-use theme.
3. One create form or modal shows title, description, priority, and due date; a valid submission creates the task at the top of To Do.
4. The create form rejects a blank title, permits an empty description and due date, offers only Low/Medium/High priority, and defaults priority to Medium.
5. An existing task can be reopened, edited, and saved.
6. A task can move between columns through both drag-and-drop and visible move buttons.
7. Tasks can be reordered by drag-and-drop within a column.
8. Task content, status, order, and selected theme survive refresh in the same browser profile.
9. A Done task remains visible and can move back to an earlier column.
10. Delete first asks for confirmation; cancelling preserves the task and confirming removes it persistently.
11. Parchment, Night, and Terminal can all be selected from a control in the top area, and the selection survives refresh.
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

## Suggested implementation order

This order keeps every step small and testable without adding features:

1. Scaffold the actual React and TypeScript application and document only the scripts it really provides.
2. Define the minimal task and persisted-board data shapes.
3. Render the fixed empty board and implement create, edit, and confirmed delete.
4. Add browser persistence and verify reload behaviour.
5. Add move buttons, drag-and-drop, and manual card ordering.
6. Add the three themes, Terminal default, and saved theme choice.
7. Verify narrow-screen scrolling and the accessibility baseline.
8. Test every acceptance criterion before considering version 1 complete.

Implementation should remain client-side. Do not introduce a backend or expose any GitHub credential to frontend code.
