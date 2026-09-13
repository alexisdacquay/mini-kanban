export type ColumnId = "todo" | "doing" | "done";
export type Priority = "low" | "medium" | "high";
export type ThemeId = "cathode" | "daylight" | "midnight";

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null; // yyyy-mm-dd
  column: ColumnId;
  createdAt: number;
};

export const COLUMNS: { id: ColumnId; label: string; hint: string }[] = [
  { id: "todo", label: "To Do", hint: "Committed, not started" },
  { id: "doing", label: "In Progress", hint: "Active work" },
  { id: "done", label: "Done", hint: "Shipped" },
];

export const PRIORITIES: { id: Priority; label: string }[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
];

export const THEMES: { id: ThemeId; label: string }[] = [
  { id: "cathode", label: "Cathode" },
  { id: "daylight", label: "Daylight" },
  { id: "midnight", label: "Midnight" },
];

export type Prefs = { compact: boolean; theme: ThemeId };
export const DEFAULT_PREFS: Prefs = { compact: false, theme: "cathode" };

/**
 * Insert a newly created card before the current first To Do card without
 * disturbing the relative order of cards in any column.
 */
export function addTaskAtTopOfTodo(tasks: Task[], task: Task): Task[] {
  const firstTodoIndex = tasks.findIndex((candidate) => candidate.column === "todo");
  if (firstTodoIndex === -1) return [...tasks, task];
  return [...tasks.slice(0, firstTodoIndex), task, ...tasks.slice(firstTodoIndex)];
}

export function formatDue(due: string | null) {
  if (!due) return null;
  const date = new Date(`${due}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function dueState(due: string | null, column: ColumnId) {
  if (!due || column === "done") return "none" as const;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${due}T00:00:00`);
  const days = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return "overdue" as const;
  if (days === 0) return "today" as const;
  return "future" as const;
}
