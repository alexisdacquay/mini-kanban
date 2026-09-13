"""SQLAlchemy persistence for the Mini Kanban backend."""

from __future__ import annotations

from enum import Enum
from time import time
from uuid import uuid4

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .database import (
    Base,
    PreferencesRecord,
    SessionFactory,
    TaskRecord,
    create_database_engine,
    create_session_factory,
    resolve_database_url,
)
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
            description="Connect the board to its FastAPI backend.",
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


class SQLAlchemyStore:
    """Persist the board through short-lived SQLAlchemy sessions."""

    def __init__(self, database_url: str | None = None) -> None:
        self.database_url = resolve_database_url(database_url)
        self._engine = create_database_engine(self.database_url)
        self._sessions = create_session_factory(self._engine)
        Base.metadata.create_all(self._engine)
        self._seed_new_database()

    def close(self) -> None:
        """Release pooled database connections."""

        self._engine.dispose()

    @staticmethod
    def _to_task(record: TaskRecord) -> Task:
        return Task(
            id=record.id,
            title=record.title,
            description=record.description,
            priority=record.priority,
            dueDate=record.due_date,
            column=record.column,
            createdAt=record.created_at,
        )

    @staticmethod
    def _to_record(task: Task, position: int) -> TaskRecord:
        return TaskRecord(
            id=task.id,
            title=task.title,
            description=task.description,
            priority=task.priority.value,
            due_date=task.due_date,
            column=task.column.value,
            created_at=task.created_at,
            position=position,
        )

    @staticmethod
    def _ordered_records(session: Session) -> list[TaskRecord]:
        statement = select(TaskRecord).order_by(TaskRecord.position, TaskRecord.id)
        return list(session.scalars(statement))

    @staticmethod
    def _find_record(records: list[TaskRecord], task_id: str) -> TaskRecord:
        for record in records:
            if record.id == task_id:
                return record
        raise TaskNotFound(task_id)

    @staticmethod
    def _renumber(records: list[TaskRecord]) -> None:
        for position, record in enumerate(records):
            record.position = position

    @staticmethod
    def _preferences_from_record(record: PreferencesRecord) -> Preferences:
        return Preferences(theme=record.theme, compact=record.compact)

    def _seed_new_database(self) -> None:
        with self._sessions.begin() as session:
            task_count = session.scalar(
                select(func.count()).select_from(TaskRecord)
            )
            preferences = session.get(PreferencesRecord, 1)

            if task_count == 0 and preferences is None:
                session.add_all(
                    self._to_record(task, position)
                    for position, task in enumerate(_seed_tasks())
                )

            if preferences is None:
                session.add(
                    PreferencesRecord(
                        id=1,
                        theme=Theme.CATHODE.value,
                        compact=False,
                    )
                )

    def list_tasks(self) -> list[Task]:
        with self._sessions() as session:
            return [self._to_task(record) for record in self._ordered_records(session)]

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

        with self._sessions.begin() as session:
            records = self._ordered_records(session)
            insertion_index = next(
                (
                    index
                    for index, record in enumerate(records)
                    if record.column == Column.TODO.value
                ),
                len(records),
            )
            record = self._to_record(task, insertion_index)
            records.insert(insertion_index, record)
            self._renumber(records)
            session.add(record)
            return self._to_task(record)

    def update_task(self, task_id: str, data: TaskUpdate) -> Task:
        with self._sessions.begin() as session:
            record = session.get(TaskRecord, task_id)
            if record is None:
                raise TaskNotFound(task_id)

            for field_name, value in data.model_dump(exclude_unset=True).items():
                if isinstance(value, Enum):
                    value = value.value
                setattr(record, field_name, value)
            return self._to_task(record)

    def delete_task(self, task_id: str) -> None:
        with self._sessions.begin() as session:
            records = self._ordered_records(session)
            record = self._find_record(records, task_id)
            records.remove(record)
            session.delete(record)
            self._renumber(records)

    def place_task(self, task_id: str, placement: TaskPlacement) -> list[Task]:
        """Place a task at its final zero-based position in a destination column."""

        with self._sessions.begin() as session:
            records = self._ordered_records(session)
            moving_record = self._find_record(records, task_id)
            records.remove(moving_record)
            moving_record.column = placement.column.value
            destination_positions = [
                index
                for index, record in enumerate(records)
                if record.column == placement.column.value
            ]

            if placement.index < len(destination_positions):
                insertion_index = destination_positions[placement.index]
            elif destination_positions:
                insertion_index = destination_positions[-1] + 1
            else:
                insertion_index = len(records)

            records.insert(insertion_index, moving_record)
            self._renumber(records)
            return [self._to_task(record) for record in records]

    def get_preferences(self) -> Preferences:
        with self._sessions() as session:
            record = session.get(PreferencesRecord, 1)
            if record is None:
                raise RuntimeError("Database preferences have not been initialized.")
            return self._preferences_from_record(record)

    def replace_preferences(self, preferences: Preferences) -> Preferences:
        with self._sessions.begin() as session:
            record = session.get(PreferencesRecord, 1)
            if record is None:
                record = PreferencesRecord(id=1)
                session.add(record)
            record.theme = preferences.theme.value
            record.compact = preferences.compact
            return self._preferences_from_record(record)
