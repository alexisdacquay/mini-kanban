import { expect, test } from "bun:test";
import { addTaskAtTopOfTodo, type Task } from "./kanban";

const persistedTasks: Task[] = [
  {
    id: "first",
    title: "First task",
    description: "Keep this text",
    priority: "high",
    dueDate: "2026-09-15",
    column: "doing",
    createdAt: 1,
  },
  {
    id: "second",
    title: "Second task",
    description: "",
    priority: "low",
    dueDate: null,
    column: "todo",
    createdAt: 2,
  },
];

test("adds a new task before the existing To Do cards", () => {
  const newTask: Task = {
    id: "new",
    title: "Newest To Do task",
    description: "",
    priority: "medium",
    dueDate: null,
    column: "todo",
    createdAt: 3,
  };

  const updatedTasks = addTaskAtTopOfTodo(persistedTasks, newTask);

  expect(updatedTasks.map((task) => task.id)).toEqual(["first", "new", "second"]);
});
