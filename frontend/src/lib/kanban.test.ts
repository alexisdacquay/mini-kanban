import { afterEach, expect, test } from "bun:test";
import {
  DEFAULT_PREFS,
  PREFS_KEY,
  TASKS_KEY,
  addTaskAtTopOfTodo,
  loadPrefs,
  loadTasks,
  moveTask,
  savePrefs,
  saveTasks,
  type Task,
} from "./kanban";

const originalWindow = globalThis.window;

function useStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    },
  });
  return values;
}

afterEach(() => {
  Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
});

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

test("restores complete persisted tasks in their saved order and preferences", () => {
  useStorage({
    [TASKS_KEY]: JSON.stringify(persistedTasks),
    [PREFS_KEY]: JSON.stringify({ compact: true }),
  });

  expect(loadTasks()).toEqual(persistedTasks);
  expect(loadPrefs()).toEqual({ compact: true });
});

test("saves browser state using the versioned, namespaced keys", () => {
  const storage = useStorage();

  saveTasks(persistedTasks);
  savePrefs({ compact: true });

  expect(JSON.parse(storage.get(TASKS_KEY)!)).toEqual(persistedTasks);
  expect(JSON.parse(storage.get(PREFS_KEY)!)).toEqual({ compact: true });
});

test("falls back to defaults when saved browser state is malformed or incompatible", () => {
  useStorage({
    [TASKS_KEY]: JSON.stringify([{ id: "missing-required-fields" }]),
    [PREFS_KEY]: JSON.stringify({ compact: "yes" }),
  });

  expect(loadTasks()).toEqual([]);
  expect(loadPrefs()).toEqual(DEFAULT_PREFS);
});

test("adds a new task before the existing To Do cards and persists its position", () => {
  const storage = useStorage();
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
  saveTasks(updatedTasks);

  expect(updatedTasks.map((task) => task.id)).toEqual(["first", "new", "second"]);
  expect(
    loadTasks()
      .filter((task) => task.column === "todo")
      .map((task) => task.id),
  ).toEqual(["new", "second"]);
});

const orderedTasks: Task[] = [
  { ...persistedTasks[0], id: "todo-first", column: "todo" },
  { ...persistedTasks[0], id: "todo-second", column: "todo" },
  { ...persistedTasks[0], id: "todo-third", column: "todo" },
  { ...persistedTasks[0], id: "doing-first", column: "doing" },
  { ...persistedTasks[0], id: "done-first", column: "done" },
];

function idsInColumn(tasks: Task[], column: Task["column"]) {
  return tasks.filter((task) => task.column === column).map((task) => task.id);
}

test("moves cards to the intended upward and downward positions in a column", () => {
  const upward = moveTask(orderedTasks, "todo-third", "todo", 0);
  const downward = moveTask(orderedTasks, "todo-first", "todo", 2);

  expect(idsInColumn(upward, "todo")).toEqual(["todo-third", "todo-first", "todo-second"]);
  expect(idsInColumn(downward, "todo")).toEqual(["todo-second", "todo-first", "todo-third"]);
});

test("moves cards into an intended position in another fixed column", () => {
  const moved = moveTask(orderedTasks, "todo-second", "doing", 0);

  expect(idsInColumn(moved, "doing")).toEqual(["todo-second", "doing-first"]);
  expect(idsInColumn(moved, "todo")).toEqual(["todo-first", "todo-third"]);
});

test("keeps a moved Done card and supports moving it back to an earlier column", () => {
  const done = moveTask(orderedTasks, "todo-first", "done", 0);
  const returned = moveTask(done, "todo-first", "doing", 1);

  expect(idsInColumn(done, "done")).toEqual(["todo-first", "done-first"]);
  expect(idsInColumn(returned, "doing")).toEqual(["doing-first", "todo-first"]);
});
