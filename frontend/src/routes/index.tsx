import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/kanban/Board";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mini Kanban — A tiny three-column task board" },
      {
        name: "description",
        content:
          "A deliberately small, single-user Kanban board: To Do, In Progress, Done. Drag cards, set priorities and due dates. Saved in your browser.",
      },
      { property: "og:title", content: "Mini Kanban — A tiny three-column task board" },
      {
        property: "og:description",
        content:
          "Three fixed columns, drag-and-drop, priorities and due dates. No accounts, no sync — everything stays in your browser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <Board />;
}
