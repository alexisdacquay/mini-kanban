import { afterEach, expect, test } from "bun:test";
import { kanbanApi } from "./api";
import type { Prefs, Task } from "./kanban";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const task: Task = {
  id: "task/one",
  title: "Connect frontend",
  description: "Use the API",
  priority: "high",
  dueDate: "2026-09-30",
  column: "doing",
  createdAt: 1_757_750_400_000,
};
const draft = {
  title: task.title,
  description: task.description,
  priority: task.priority,
  dueDate: task.dueDate,
};
const prefs: Prefs = { theme: "midnight", compact: true };

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("uses the backend contract for tasks, placement, and preferences", async () => {
  const responses = [
    json([task]),
    json(task, 201),
    json(task),
    new Response(null, { status: 204 }),
    json([task]),
    json(prefs),
    json(prefs),
  ];
  const calls: { url: string; init: RequestInit | undefined }[] = [];
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), init });
    return responses.shift()!;
  };

  expect(await kanbanApi.listTasks()).toEqual([task]);
  expect(await kanbanApi.createTask(draft)).toEqual(task);
  expect(await kanbanApi.updateTask(task.id, { title: "Updated" })).toEqual(task);
  await expect(kanbanApi.deleteTask(task.id)).resolves.toBeUndefined();
  expect(await kanbanApi.placeTask(task.id, "done", 0)).toEqual([task]);
  expect(await kanbanApi.getPreferences()).toEqual(prefs);
  expect(await kanbanApi.replacePreferences(prefs)).toEqual(prefs);

  expect(calls.map(({ url, init }) => [url, init?.method ?? "GET"])).toEqual([
    ["http://localhost:8091/api/v1/tasks", "GET"],
    ["http://localhost:8091/api/v1/tasks", "POST"],
    ["http://localhost:8091/api/v1/tasks/task%2Fone", "PATCH"],
    ["http://localhost:8091/api/v1/tasks/task%2Fone", "DELETE"],
    ["http://localhost:8091/api/v1/tasks/task%2Fone/placement", "PUT"],
    ["http://localhost:8091/api/v1/preferences", "GET"],
    ["http://localhost:8091/api/v1/preferences", "PUT"],
  ]);
  expect(calls[0]?.init?.cache).toBe("no-store");
  expect(calls[5]?.init?.cache).toBe("no-store");
  expect(JSON.parse(String(calls[1]?.init?.body))).toEqual(draft);
  expect(JSON.parse(String(calls[2]?.init?.body))).toEqual({ title: "Updated" });
  expect(JSON.parse(String(calls[4]?.init?.body))).toEqual({ column: "done", index: 0 });
  expect(JSON.parse(String(calls[6]?.init?.body))).toEqual(prefs);
});

test("reports the HTTP status and backend message for failed requests", async () => {
  globalThis.fetch = async () =>
    json({ code: "validation_error", message: "The request contains invalid values." }, 422);

  await expect(kanbanApi.createTask(draft)).rejects.toThrow(
    "API request failed (422): The request contains invalid values.",
  );
});
