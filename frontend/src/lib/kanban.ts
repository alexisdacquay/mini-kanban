export type ColumnId = "todo" | "doing" | "done";
export type Priority = "low" | "medium" | "high";

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

export const TASKS_KEY = "mini-kanban:tasks:v1";
export const PREFS_KEY = "mini-kanban:prefs:v1";

export type Prefs = { compact: boolean };
export const DEFAULT_PREFS: Prefs = { compact: false };

function isColumnId(value: unknown): value is ColumnId {
  return value === "todo" || value === "doing" || value === "done";
}

function isPriority(value: unknown): value is Priority {
  return value === "low" || value === "medium" || value === "high";
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const task = value as Record<string, unknown>;
  return (
    typeof task.id === "string" &&
    typeof task.title === "string" &&
    typeof task.description === "string" &&
    isPriority(task.priority) &&
    (task.dueDate === null || typeof task.dueDate === "string") &&
    isColumnId(task.column) &&
    typeof task.createdAt === "number" &&
    Number.isFinite(task.createdAt)
  );
}

export function newId() {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TASKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.every(isTask) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]) {
  try {
    window.localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    /* storage unavailable */
  }
}

export function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return DEFAULT_PREFS;
    const prefs = parsed as Record<string, unknown>;
    return typeof prefs.compact === "boolean" ? { compact: prefs.compact } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: Prefs) {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* storage unavailable */
  }
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
