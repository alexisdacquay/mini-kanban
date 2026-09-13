"""In-memory persistence for the mocked Mini Kanban backend."""

from __future__ import annotations

from threading import RLock
from time import time
from uuid import uuid4

from .models import (
    Column,
    Preferences,
    Priority,
    Task,
    TaskCreate,
    TaskPlacement,
    TaskUpdate,
    Theme,
)


class TaskNotFound(LookupError):
    """Raised when a task identifier does not exist in the store."""

    def __init__(self, task_id: str) -> None:
        self.task_id = task_id
        super().__init__(f"Task '{task_id}' was not found.")


def _seed_tasks() -> list[Task]:
    return [
        Task(
            id="seed-plan-week",
            title="Plan the week",
            description="Choose the most important work for this week.",
            priority=Priority.MEDIUM,
            dueDate=None,
            column=Column.TODO,
            createdAt=1_757_750_400_000,
        ),
        Task(
            id="seed-build-api",
            title="Build the API",
            description="Connect the board to its mocked FastAPI backend.",
            priority=Priority.HIGH,
            dueDate=None,
            column=Column.DOING,
            createdAt=1_757_750_400_001,
        ),
        Task(
            id="seed-ship-board",
            title="Ship the first board",
            description="Verify the core Kanban workflow end to end.",
            priority=Priority.LOW,
            dueDate=None,
            column=Column.DONE,
            createdAt=1_757_750_400_002,
        ),
    ]


class InMemoryStore:
    """Canonical task order and preferences held for the process lifetime."""

    def __init__(self, *, seed: bool = True) -> None:
        self._lock = RLock()
        self._tasks = _seed_tasks() if seed else []
        self._preferences = Preferences(theme=Theme.CATHODE, compact=False)

    @classmethod
    def seeded(cls) -> InMemoryStore:
        """Create a fresh store populated with the demonstration board."""

        return cls(seed=True)

    @staticmethod
    def _copy_task(task: Task) -> Task:
        return task.model_copy(deep=True)

    def _task_index(self, task_id: str) -> int:
        for index, task in enumerate(self._tasks):
            if task.id == task_id:
                return index
        raise TaskNotFound(task_id)

    def _task_snapshot(self) -> list[Task]:
        return [self._copy_task(task) for task in self._tasks]

    def list_tasks(self) -> list[Task]:
        with self._lock:
            return self._task_snapshot()

    def create_task(self, data: TaskCreate) -> Task:
        task = Task(
            id=f"t_{uuid4().hex}",
            title=data.title,
            description=data.description,
            priority=data.priority,
            dueDate=data.due_date,
            column=Column.TODO,
            createdAt=int(time() * 1_000),
        )

        with self._lock:
            insertion_index = next(
                (
                    index
                    for index, existing_task in enumerate(self._tasks)
                    if existing_task.column == Column.TODO
                ),
                len(self._tasks),
            )
            self._tasks.insert(insertion_index, task)
            return self._copy_task(task)

    def update_task(self, task_id: str, data: TaskUpdate) -> Task:
        with self._lock:
            task_index = self._task_index(task_id)
            changes = data.model_dump(exclude_unset=True)
            updated_task = self._tasks[task_index].model_copy(update=changes)
            self._tasks[task_index] = updated_task
            return self._copy_task(updated_task)

    def delete_task(self, task_id: str) -> None:
        with self._lock:
            del self._tasks[self._task_index(task_id)]

    def place_task(self, task_id: str, placement: TaskPlacement) -> list[Task]:
        """Place a task at its final zero-based position in a destination column."""

        with self._lock:
            moving_task = self._tasks.pop(self._task_index(task_id))
            moved_task = moving_task.model_copy(update={"column": placement.column})
            destination_positions = [
                index
                for index, task in enumerate(self._tasks)
                if task.column == placement.column
            ]

            if placement.index < len(destination_positions):
                insertion_index = destination_positions[placement.index]
            elif destination_positions:
                insertion_index = destination_positions[-1] + 1
            else:
                insertion_index = len(self._tasks)

            self._tasks.insert(insertion_index, moved_task)
            return self._task_snapshot()

    def get_preferences(self) -> Preferences:
        with self._lock:
            return self._preferences.model_copy(deep=True)

    def replace_preferences(self, preferences: Preferences) -> Preferences:
        with self._lock:
            self._preferences = preferences.model_copy(deep=True)
            return self._preferences.model_copy(deep=True)
