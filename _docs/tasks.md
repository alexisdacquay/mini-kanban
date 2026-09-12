# Mini Kanban backlog

## 1. Set up the project with a passing empty-board test
Goal: Establish a reproducible frontend baseline with one passing test.
Description: Use the existing Lovable project in `frontend/`, identify its actual package manager and scripts, and ask before adding any dependency. Add the smallest suitable test setup and prove that a first visit renders an empty board with the fixed To Do, In Progress, and Done columns and no seeded cards.

## 2. Verify browser state and persistence
Goal: Make task data, card order, and preferences survive safely in the browser.
Description: Maybe DONE — check the existing Lovable state and `localStorage` code, then fix only the gaps in namespaced versioning, validation, refresh persistence, and safe fallback from invalid data. Version 1 remains browser-local; a backend and database are LATER — defer.

## 3. Verify the task lifecycle
Goal: Let the user create, edit, and permanently delete tasks reliably.
Description: Maybe DONE — check that one form handles a required title, optional plain-text description, Low/Medium/High priority defaulting to Medium, and an optional date without a time. Ensure new tasks enter at the top of To Do, editing preserves position, and deletion requires confirmation and persists.

## 4. Verify card movement and ordering
Goal: Let the user move and manually order cards with predictable results.
Description: Maybe DONE — check drag-and-drop within and between the three fixed columns, including both upward and downward reordering. Verify that labelled buttons move exactly one column, all moves persist, and Done cards remain visible until deleted and can move back.

## 5. Add three persistent themes
Goal: Provide three selectable themes without prescribing their visual design.
Description: Add a simple theme control in the top area, apply a coherent default, and remember the selection in browser preferences. Lovable owns the theme names, palettes, default choice, and detailed presentation, while every theme must keep task content and controls readable.

## 6. Add narrow-screen board scrolling
Goal: Keep the fixed three-column workflow usable on narrow screens.
Description: Preserve the desktop-first layout and make the board horizontally scrollable at narrow widths instead of replacing it with a separate mobile design. Check that all three columns, cards, and card actions remain reachable.

## 7. Check the Lovable UI and accessibility
Goal: Confirm that the existing visual design is polished, readable, and operable.
Description: Maybe DONE — check the supplied UI for clear labels, keyboard access, visible focus, sufficient contrast in all themes, and non-colour cues for state. Preserve its restrained contemporary retro-futuristic character, using pixel styling only in compact interface details and modern readable type for task content and forms.

## 8. Verify the MVP and document its commands
Goal: Confirm the complete workflow and leave accurate instructions for the next session.
Description: Run the verified test, lint, and build commands, then manually exercise task creation, editing, movement, ordering, deletion, theme persistence, refresh persistence, and narrow-screen use. Fix any version 1 failure and update `README.md` and `AGENTS.md` with only commands and behaviour that were actually verified.
