# Mini Board Studio

Lovable frontend instructions

Build the frontend for **Mini Kanban**, a deliberately small, single-user task board. Prioritise a complete, reliable core workflow over adding lots of project-management features.

The app has one board with three fixed columns: **To Do**, **In Progress**, and **Done**. There is no backlog; every card represents committed work.

Users should be able to:

- Create and edit tasks with a required title, optional description, Low/Medium/High priority, and optional due date.

- Move and reorder cards using drag-and-drop.

- Move cards between columns with visible left/right controls as an alternative to dragging.

- Delete tasks after confirmation. Done tasks remain visible and can be moved back.

Save tasks, card order, column placement, and UI preferences in browser `localStorage`. Start with an empty board. Keep the app client-side in React and TypeScript, with no backend, database, authentication, or cloud sync.

Create a polished, contemporary, desktop-first interface that remains usable on narrow screens. A restrained retro-futuristic or pixel-game influence is welcome, but use it selectively and keep task content easy to read. Include a simple top-level selector for three distinct visual themes, but choose the palettes, theme names, default theme, typography, layout, interactions, and visual details yourself.

Keep version 1 focused.

You can ask me questions

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pixel-board-magic.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/00a9fc29-45a8-4419-8a3d-e02ac1c45187).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

This frontend uses Bun, as recorded in `bun.lock` and `bunfig.toml`.

Install the locked dependencies and run the available project commands with Bun:

```sh
git clone <this-repository-url>
cd <repository-name>
cd frontend
bun install --frozen-lockfile
bun run dev
```

Available scripts are `dev`, `build`, `build:dev`, `preview`, `test`, `lint`, and `format`.
Run the empty-board baseline test with:

```sh
bun run test
```
