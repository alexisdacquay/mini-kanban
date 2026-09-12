import { ArrowLeft, ArrowRight, CalendarDays, GripVertical, Pencil, Trash2 } from "lucide-react";
import { dueState, formatDue, type Task } from "@/lib/kanban";
import { cn } from "@/lib/utils";

type Props = {
  task: Task;
  compact: boolean;
  dragging: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
};

const priorityStyles: Record<Task["priority"], string> = {
  low: "border-low/50 text-low",
  medium: "border-medium/50 text-medium",
  high: "border-high/60 text-high",
};

const priorityBar: Record<Task["priority"], string> = {
  low: "bg-low",
  medium: "bg-medium",
  high: "bg-high",
};

export function TaskCard({
  task,
  compact,
  dragging,
  canMoveLeft,
  canMoveRight,
  onEdit,
  onDelete,
  onMove,
  onDragStart,
  onDragEnd,
  onDragOver,
}: Props) {
  const due = formatDue(task.dueDate);
  const state = dueState(task.dueDate, task.column);

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      className={cn(
        "group relative overflow-hidden rounded-md border border-border bg-card text-card-foreground transition-[transform,box-shadow] duration-150",
        "hover:-translate-y-0.5 hover:glow-ring",
        compact ? "p-2.5 pl-4" : "p-3 pl-4",
        dragging && "drag-ghost",
        task.column === "done" && "opacity-80",
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-1.5", priorityBar[task.priority])} />

      <div className="flex items-start gap-2">
        <GripVertical
          className="mt-0.5 size-4 shrink-0 cursor-grab text-muted-foreground/60"
          aria-hidden
        />
        <h3
          className={cn(
            "flex-1 text-sm font-semibold leading-snug",
            task.column === "done" && "line-through decoration-muted-foreground/60",
          )}
        >
          {task.title}
        </h3>
      </div>

      {!compact && task.description ? (
        <p className="mt-2 line-clamp-3 pl-6 text-xs leading-relaxed text-muted-foreground">
          {task.description}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2 pl-6">
        <span
          className={cn(
            "rounded-sm border bg-background/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest",
            priorityStyles[task.priority],
          )}
        >
          {task.priority}
        </span>
        {due ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest",
              state === "overdue"
                ? "text-overdue"
                : state === "today"
                  ? "text-accent"
                  : "text-muted-foreground",
            )}
          >
            <CalendarDays className="size-3" aria-hidden />
            {state === "overdue" ? `${due} · late` : due}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-1 border-t border-border/70 pt-2 pl-6">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`Move "${task.title}" to previous column`}
            disabled={!canMoveLeft}
            onClick={() => onMove(-1)}
            className="rounded-sm border border-border p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:opacity-30"
          >
            <ArrowLeft className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label={`Move "${task.title}" to next column`}
            disabled={!canMoveRight}
            onClick={() => onMove(1)}
            className="rounded-sm border border-border p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:opacity-30"
          >
            <ArrowRight className="size-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`Edit "${task.title}"`}
            onClick={onEdit}
            className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label={`Delete "${task.title}"`}
            onClick={onDelete}
            className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
