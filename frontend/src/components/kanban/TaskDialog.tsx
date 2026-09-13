import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PRIORITIES, type Priority, type Task } from "@/lib/kanban";
import { cn } from "@/lib/utils";

export type TaskDraft = {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
};

type Props = {
  open: boolean;
  task: Task | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (draft: TaskDraft) => void;
};

const emptyDraft: TaskDraft = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: null,
};

export function TaskDialog({ open, task, onOpenChange, onSubmit }: Props) {
  const [draft, setDraft] = useState<TaskDraft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setDraft(
      task
        ? {
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate,
          }
        : emptyDraft,
    );
  }, [open, task]);

  function submit() {
    const title = draft.title.trim();
    if (!title) {
      setError("A title is required.");
      return;
    }
    onSubmit({ ...draft, title, description: draft.description.trim() });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-pixel text-sm">
            {task ? "Edit task" : "New task"}
          </DialogTitle>
          <DialogDescription>
            {task ? "Update the details of this card." : "Only a title is required."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="task-title"
              autoFocus
              value={draft.title}
              placeholder="Wire up the settings screen"
              onChange={(e) => {
                setDraft((d) => ({ ...d, title: e.target.value }));
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
            {error ? <p className="text-xs text-high">{error}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              rows={3}
              value={draft.description}
              placeholder="Optional notes, links, acceptance criteria…"
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label id="task-priority-label">Priority</Label>
              <div
                className="flex gap-1 rounded-md border border-border bg-input/40 p-1"
                role="group"
                aria-labelledby="task-priority-label"
              >
                {PRIORITIES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={draft.priority === p.id}
                    onClick={() => setDraft((d) => ({ ...d, priority: p.id }))}
                    className={cn(
                      "flex-1 rounded-sm px-2 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-popover",
                      draft.priority === p.id
                        ? "bg-primary font-bold text-primary-foreground underline decoration-2 underline-offset-4"
                        : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-due">Due date</Label>
              <Input
                id="task-due"
                type="date"
                value={draft.dueDate ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, dueDate: e.target.value ? e.target.value : null }))
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{task ? "Save changes" : "Add task"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
