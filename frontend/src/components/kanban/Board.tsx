import { useEffect, useMemo, useState } from "react";
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
import {
  addTaskAtTopOfTodo,
  COLUMNS,
  DEFAULT_PREFS,
  loadPrefs,
  loadTasks,
  moveTask,
  newId,
  savePrefs,
  saveTasks,
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
  const [hydrated, setHydrated] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  useEffect(() => {
    setTasks(loadTasks());
    setPrefs(loadPrefs());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveTasks(tasks);
  }, [tasks, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    savePrefs(prefs);
  }, [prefs, hydrated]);

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

  function submitDraft(draft: TaskDraft) {
    if (editing) {
      setTasks((prev) => prev.map((t) => (t.id === editing.id ? { ...t, ...draft } : t)));
      return;
    }
    setTasks((prev) =>
      addTaskAtTopOfTodo(prev, { id: newId(), column: "todo", createdAt: Date.now(), ...draft }),
    );
  }

  /** Place `id` into `column` at position `index` among that column's cards. */
  function placeTask(id: string, column: ColumnId, index: number) {
    setTasks((prev) => moveTask(prev, id, column, index));
  }

  function shiftColumn(task: Task, direction: -1 | 1) {
    const current = COLUMNS.findIndex((c) => c.id === task.column);
    const next = COLUMNS[current + direction];
    if (!next) return;
    placeTask(task.id, next.id, byColumn[next.id].length);
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
      placeTask(id, column, target);
    }
    setDragId(null);
    setDropTarget(null);
  }

  const total = tasks.length;
  const doneCount = byColumn.done.length;

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
                {total} cards · {doneCount} done · saved locally
              </p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Theme
              <select
                aria-label="Theme"
                className="rounded-sm border border-input bg-background px-2 py-1.5 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                value={prefs.theme}
                onChange={(event) =>
                  setPrefs((p) => ({ ...p, theme: event.target.value as ThemeId }))
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
              onClick={() => setPrefs((p) => ({ ...p, compact: !p.compact }))}
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
          Drag cards or use the arrows · everything stays in this browser
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingDelete)
                  setTasks((prev) => prev.filter((t) => t.id !== pendingDelete.id));
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
