"""Pydantic models for the Mini Kanban API contract."""

from __future__ import annotations

from collections.abc import Mapping
from datetime import date
from enum import Enum
from typing import Annotated, Any

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator


TrimmedTitle = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, pattern=r".*\S.*"),
]
TrimmedDescription = Annotated[str, StringConstraints(strip_whitespace=True)]
NonEmptyString = Annotated[str, StringConstraints(min_length=1)]
StrictInteger = Annotated[int, Field(strict=True)]
DestinationIndex = Annotated[int, Field(strict=True, ge=0)]
StrictBoolean = Annotated[bool, Field(strict=True)]


class Column(str, Enum):
    TODO = "todo"
    DOING = "doing"
    DONE = "done"


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Theme(str, Enum):
    CATHODE = "cathode"
    DAYLIGHT = "daylight"
    MIDNIGHT = "midnight"


class APIModel(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class Task(APIModel):
    id: NonEmptyString
    title: TrimmedTitle
    description: TrimmedDescription
    priority: Priority
    due_date: date | None = Field(alias="dueDate")
    column: Column
    created_at: StrictInteger = Field(alias="createdAt")


class TaskCreate(APIModel):
    title: TrimmedTitle
    description: TrimmedDescription = ""
    priority: Priority = Priority.MEDIUM
    due_date: date | None = Field(default=None, alias="dueDate")


class TaskUpdate(APIModel):
    model_config = ConfigDict(json_schema_extra={"minProperties": 1})

    title: TrimmedTitle | None = None
    description: TrimmedDescription | None = None
    priority: Priority | None = None
    due_date: date | None = Field(default=None, alias="dueDate")

    @model_validator(mode="before")
    @classmethod
    def require_an_editable_field(cls, value: Any) -> Any:
        if not isinstance(value, Mapping):
            return value

        editable_fields = {"title", "description", "priority", "dueDate", "due_date"}
        if not editable_fields.intersection(value):
            raise ValueError("At least one editable field must be provided.")

        for field_name in ("title", "description", "priority"):
            if field_name in value and value[field_name] is None:
                raise ValueError(f"{field_name} cannot be null.")

        return value


class TaskPlacement(APIModel):
    column: Column
    index: DestinationIndex


class Preferences(APIModel):
    theme: Theme
    compact: StrictBoolean


class Error(APIModel):
    code: str
    message: str
