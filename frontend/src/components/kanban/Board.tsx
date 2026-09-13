import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./TaskCard";
import { TaskDialog, type TaskDraft } from "./TaskDialog";
import { kanbanApi } from "@/lib/api";
import {
  addTaskAtTopOfTodo,
  COLUMNS,
  DEFAULT_PREFS,
  THEMES,
  type ColumnId,
  type Prefs,
  type Task,
  type ThemeId,
} from "@/lib/kanban";
import { cn } from "@/lib/utils";

type DropTarget = { column: ColumnId; index: number };

export function Board() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const mountedRef = useRef(false);
  const mutationCountRef = useRef(0);
  const mutationRevisionRef = useRef(0);
  const preferencesSavingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    let timeout: number | undefined;

    async function syncBoard(initial: boolean) {
      if (mutationCountRef.current > 0) {
        if (active) timeout = window.setTimeout(() => void syncBoard(initial), 1_000);
        return;
      }

      const revision = mutationRevisionRef.current;
      if (initial) setLoading(true);

      try {
        const [nextTasks, nextPrefs] = await Promise.all([
          kanbanApi.listTasks(),
          kanbanApi.getPreferences(),
        ]);
        if (!active || revision !== mutationRevisionRef.current) return;

        setTasks(nextTasks);
        setPrefs(nextPrefs);
        setSyncError(null);
      } catch {
        if (active && revision === mutationRevisionRef.current) {
          setSyncError("Couldn’t sync with the backend.");
        }
      } finally {
        if (active) {
          if (initial) setLoading(false);
          timeout = window.setTimeout(() => void syncBoard(false), 1_000);
        }
      }
    }

    void syncBoard(true);
    return () => {
      active = false;
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, [reloadKey]);

  useEffect(() => {
    document.documentElement.className = `theme-${prefs.theme}`;
  }, [prefs.theme]);

  const byColumn = useMemo(() => {
    const map: Record<ColumnId, Task[]> = { todo: [], doing: [], done: [] };
    tasks.forEach((t) => map[t.column]?.push(t));
    return map;
  }, [tasks]);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  async function runMutation<T>(request: () => Promise<T>, failureMessage: string) {
    mutationCountRef.current += 1;
    mutationRevisionRef.current += 1;

    try {
      const value = await request();
      if (mountedRef.current) setActionError(null);
      return { ok: true as const, value };
    } catch {
      if (mountedRef.current) setActionError(failureMessage);
      return { ok: false as const };
    } finally {
      mutationCountRef.current -= 1;
    }
  }

  async function submitDraft(draft: TaskDraft): Promise<boolean> {
    const taskBeingEdited = editing;
    if (taskBeingEdited) {
      const result = await runMutation(
        () => kanbanApi.updateTask(taskBeingEdited.id, draft),
        "Couldn’t save the task.",
      );
      if (!result.ok || !mountedRef.current) return false;

      setTasks((prev) => prev.map((task) => (task.id === result.value.id ? result.value : task)));
      return true;
    }

    const result = await runMutation(
      () => kanbanApi.createTask(draft),
      "Couldn’t create the task.",
    );
    if (!result.ok || !mountedRef.current) return false;

    setTasks((prev) => addTaskAtTopOfTodo(prev, result.value));
    return true;
  }

  /** Place `id` into `column` at a drop index calculated before removing the task. */
  async function placeTask(id: string, column: ColumnId, index: number) {
    const moving = tasks.find((task) => task.id === id);
    const sourceIndex = moving ? byColumn[moving.column].findIndex((task) => task.id === id) : -1;
    const finalIndex =
      moving?.column === column && sourceIndex >= 0 && sourceIndex < index ? index - 1 : index;
    const result = await runMutation(
      () => kanbanApi.placeTask(id, column, finalIndex),
      "Couldn’t move the task.",
    );
    if (!result.ok || !mountedRef.current) return;

    setTasks(result.value);
  }

  async function replacePreferences(next: Prefs) {
    if (preferencesSavingRef.current) return;
    preferencesSavingRef.current = true;
    setSavingPreferences(true);

    try {
      const result = await runMutation(
        () => kanbanApi.replacePreferences(next),
        "Couldn’t save display preferences.",
      );
      if (result.ok && mountedRef.current) setPrefs(result.value);
    } finally {
      preferencesSavingRef.current = false;
      if (mountedRef.current) setSavingPreferences(false);
    }
  }

  async function deletePendingTask() {
    const task = pendingDelete;
    setPendingDelete(null);
    if (!task) return;

    const result = await runMutation(
      () => kanbanApi.deleteTask(task.id),
      "Couldn’t delete the task.",
    );
    if (!result.ok || !mountedRef.current) return;

    setTasks((prev) => prev.filter((candidate) => candidate.id !== task.id));
  }

  function shiftColumn(task: Task, direction: -1 | 1) {
    const current = COLUMNS.findIndex((c) => c.id === task.column);
    const next = COLUMNS[current + direction];
    if (!next) return;
    void placeTask(task.id, next.id, byColumn[next.id].length);
  }

  function handleCardDragOver(e: React.DragEvent, column: ColumnId, index: number) {
    if (!dragId) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    setDropTarget({ column, index: after ? index + 1 : index });
  }

  function handleColumnDragOver(e: React.DragEvent, column: ColumnId) {
    if (!dragId) return;
    e.preventDefault();
    setDropTarget((prev) =>
      prev && prev.column === column ? prev : { column, index: byColumn[column].length },
    );
  }

  function handleDrop(e: React.DragEvent, column: ColumnId) {
    e.preventDefault();
    const id = dragId ?? e.dataTransfer.getData("text/plain");
    if (id) {
      const target =
        dropTarget && dropTarget.column === column ? dropTarget.index : byColumn[column].length;
      void placeTask(id, column, target);
    }
    setDragId(null);
    setDropTarget(null);
  }

  const total = tasks.length;
  const doneCount = byColumn.done.length;
  const error = actionError ?? syncError;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-sm bg-primary text-primary-foreground">
              <Sparkles className="size-4" aria-hidden />
            </span>
            <div>
              <h1 className="font-pixel text-[11px] sm:text-xs">MINI KANBAN</h1>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {total} cards · {doneCount} done · synced with backend
              </p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Theme
              <select
                aria-label="Theme"
                disabled={savingPreferences}
                className="rounded-sm border border-input bg-background px-2 py-1.5 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                value={prefs.theme}
                onChange={(event) =>
                  void replacePreferences({
                    ...prefs,
                    theme: event.target.value as ThemeId,
                  })
                }
              >
                {THEMES.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </label>
            <Button
              variant="outline"
              size="sm"
              disabled={savingPreferences}
              onClick={() => void replacePreferences({ ...prefs, compact: !prefs.compact })}
            >
              {prefs.compact ? "Comfortable" : "Compact"}
            </Button>
            <Button size="sm" onClick={openNew}>
              <Plus className="size-4" /> New task
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {loading ? (
          <p
            className="mb-4 rounded-md border border-border bg-card px-4 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground"
            role="status"
          >
            Loading board…
          </p>
        ) : null}

        {error ? (
          <div
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/60 bg-card px-4 py-3"
            role="alert"
          >
            <p className="font-mono text-xs uppercase tracking-widest text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (actionError) {
                  setActionError(null);
                } else {
                  setSyncError(null);
                  setLoading(true);
                  setReloadKey((key) => key + 1);
                }
              }}
            >
              {actionError ? "Dismiss" : "Retry"}
            </Button>
          </div>
        ) : null}

        <div className="overflow-x-auto pb-2" role="region" aria-label="Kanban board">
          <div className="grid grid-flow-col auto-cols-[minmax(18rem,1fr)] gap-4 lg:grid-flow-row lg:grid-cols-3">
            {COLUMNS.map((column, columnIndex) => {
              const columnTasks = byColumn[column.id];
              const isDropColumn = dropTarget?.column === column.id && !!dragId;
              return (
                <section
                  key={column.id}
                  onDragOver={(e) => handleColumnDragOver(e, column.id)}
                  onDrop={(e) => handleDrop(e, column.id)}
                  onDragLeave={() => setDropTarget(null)}
                  className={cn(
                    "panel scanlines flex min-h-[60vh] flex-col p-3 transition-colors",
                    isDropColumn && "glow-ring",
                  )}
                >
                  <div className="mb-3 flex items-baseline justify-between gap-2 px-1">
                    <h2 className="font-pixel text-[10px]">{column.label}</h2>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {columnTasks.length}
                    </span>
                  </div>
                  <p className="mb-3 px-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {column.hint}
                  </p>

                  <div className="flex flex-1 flex-col gap-2">
                    {columnTasks.map((task, index) => (
                      <div key={task.id} className="relative">
                        {isDropColumn && dropTarget?.index === index ? (
                          <span className="absolute -top-1.5 left-0 right-0 h-0.5 rounded-full bg-primary" />
                        ) : null}
                        <TaskCard
                          task={task}
                          compact={prefs.compact}
                          dragging={dragId === task.id}
                          canMoveLeft={columnIndex > 0}
                          canMoveRight={columnIndex < COLUMNS.length - 1}
                          onEdit={() => {
                            setEditing(task);
                            setDialogOpen(true);
                          }}
                          onDelete={() => setPendingDelete(task)}
                          onMove={(dir) => shiftColumn(task, dir)}
                          onDragStart={(e) => {
                            setDragId(task.id);
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData("text/plain", task.id);
                          }}
                          onDragEnd={() => {
                            setDragId(null);
                            setDropTarget(null);
                          }}
                          onDragOver={(e) => handleCardDragOver(e, column.id, index)}
                        />
                      </div>
                    ))}

                    {isDropColumn && dropTarget.index >= columnTasks.length ? (
                      <span className="h-0.5 rounded-full bg-primary" />
                    ) : null}

                    {columnTasks.length === 0 ? (
                      <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-border/80 p-6 text-center">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {column.id === "todo" ? "Add your first card" : "Drop cards here"}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Drag cards or use the arrows · changes sync automatically
        </p>
      </main>

      <TaskDialog
        open={dialogOpen}
        task={editing}
        onOpenChange={setDialogOpen}
        onSubmit={submitDraft}
      />

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-pixel text-sm">Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              “{pendingDelete?.title}” will be removed permanently. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:brightness-90"
              onClick={() => void deletePendingTask()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
