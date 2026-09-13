import type { ColumnId, Prefs, Task } from "./kanban";

const DEFAULT_API_URL = "http://localhost:8091/api/v1";
const API_URL = (import.meta.env["VITE_API_URL"] || DEFAULT_API_URL).replace(/\/+$/, "");

type TaskFields = Pick<Task, "title" | "description" | "priority" | "dueDate">;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined) headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const status = response.statusText
      ? `${response.status} ${response.statusText}`
      : String(response.status);
    let detail = "";

    try {
      const body: unknown = await response.json();
      if (body && typeof body === "object" && "message" in body) {
        const message = (body as { message?: unknown }).message;
        if (typeof message === "string") detail = message;
      }
    } catch {
      // The status still provides a useful error when the response is not JSON.
    }

    throw new Error(`API request failed (${status})${detail ? `: ${detail}` : ""}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const kanbanApi = {
  listTasks(): Promise<Task[]> {
    return request<Task[]>("/tasks", { cache: "no-store" });
  },

  createTask(fields: TaskFields): Promise<Task> {
    return request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(fields),
    });
  },

  updateTask(id: string, fields: Partial<TaskFields>): Promise<Task> {
    return request<Task>(`/tasks/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(fields),
    });
  },

  deleteTask(id: string): Promise<void> {
    return request<void>(`/tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
  },

  placeTask(id: string, column: ColumnId, finalIndex: number): Promise<Task[]> {
    return request<Task[]>(`/tasks/${encodeURIComponent(id)}/placement`, {
      method: "PUT",
      body: JSON.stringify({ column, index: finalIndex }),
    });
  },

  getPreferences(): Promise<Prefs> {
    return request<Prefs>("/preferences", { cache: "no-store" });
  },

  replacePreferences(preferences: Prefs): Promise<Prefs> {
    return request<Prefs>("/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
    });
  },
};
