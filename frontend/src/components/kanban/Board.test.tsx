import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Board } from "./Board";
import { TaskCard } from "./TaskCard";
import type { Task } from "@/lib/kanban";

const doneTask: Task = {
  id: "done-task",
  title: "Ship accessible controls",
  description: "",
  priority: "high",
  dueDate: null,
  column: "done",
  createdAt: 1,
};

test("a first visit renders the three empty board columns", () => {
  const markup = renderToStaticMarkup(<Board />);
  const headings = [...markup.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((match) => match[1]);

  expect(headings).toEqual(["To Do", "In Progress", "Done"]);
  expect(markup).not.toContain("<article");
});

test("the board keeps its three columns in a horizontally scrollable narrow-screen layout", () => {
  const markup = renderToStaticMarkup(<Board />);

  expect(markup).toContain('role="region"');
  expect(markup).toContain('aria-label="Kanban board"');
  expect(markup).toContain("overflow-x-auto");
  expect(markup).toContain("grid-flow-col");
  expect(markup).toContain("auto-cols-[minmax(18rem,1fr)]");
  expect(markup).toContain("lg:grid-cols-3");
});

test("the header exposes exactly three selectable themes", () => {
  const markup = renderToStaticMarkup(<Board />);
  const options = [...markup.matchAll(/<option[^>]*>(.*?)<\/option>/g)].map((match) => match[1]);

  expect(options).toEqual(["Cathode", "Daylight", "Midnight"]);
  expect(markup).toContain('aria-label="Theme"');
  expect(markup).toContain("focus-visible:ring-2");
});

test("card actions have accessible labels, visible focus styles, and a textual priority cue", () => {
  const markup = renderToStaticMarkup(
    <TaskCard
      task={doneTask}
      compact={false}
      dragging={false}
      canMoveLeft
      canMoveRight={false}
      onEdit={() => {}}
      onDelete={() => {}}
      onMove={() => {}}
      onDragStart={() => {}}
      onDragEnd={() => {}}
      onDragOver={() => {}}
    />,
  );

  expect(markup).toContain(
    'aria-label="Move &quot;Ship accessible controls&quot; to previous column"',
  );
  expect(markup).toContain('aria-label="Edit &quot;Ship accessible controls&quot;"');
  expect(markup).toContain('aria-label="Delete &quot;Ship accessible controls&quot;"');
  expect(markup).toContain(">high</span>");
  expect(markup).toContain("focus-visible:ring-2");
});
