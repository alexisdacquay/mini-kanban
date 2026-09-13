from typing import Annotated

from fastapi import APIRouter, Path, Response, status

from app.models import Error, Task, TaskCreate, TaskPlacement, TaskUpdate
from app.routers.dependencies import Store

router = APIRouter(prefix="/tasks", tags=["Tasks"])
TaskId = Annotated[str, Path(min_length=1, description="Stable task identifier")]

BAD_REQUEST = {400: {"model": Error, "description": "The request body is not valid JSON"}}
NOT_FOUND = {404: {"model": Error, "description": "No task has the supplied identifier"}}
VALIDATION_ERROR = {
    422: {"model": Error, "description": "The request contains invalid values"}
}


@router.get("", response_model=list[Task], operation_id="listTasks")
async def list_tasks(store: Store) -> list[Task]:
    return store.list_tasks()


@router.post(
    "",
    response_model=Task,
    status_code=status.HTTP_201_CREATED,
    operation_id="createTask",
    responses=BAD_REQUEST | VALIDATION_ERROR,
)
async def create_task(data: TaskCreate, store: Store) -> Task:
    return store.create_task(data)


@router.patch(
    "/{taskId}",
    response_model=Task,
    operation_id="updateTask",
    responses=BAD_REQUEST | NOT_FOUND | VALIDATION_ERROR,
)
async def update_task(taskId: TaskId, data: TaskUpdate, store: Store) -> Task:
    return store.update_task(taskId, data)


@router.delete(
    "/{taskId}",
    status_code=status.HTTP_204_NO_CONTENT,
    operation_id="deleteTask",
    responses=NOT_FOUND,
)
async def delete_task(taskId: TaskId, store: Store) -> Response:
    store.delete_task(taskId)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put(
    "/{taskId}/placement",
    response_model=list[Task],
    operation_id="placeTask",
    responses=BAD_REQUEST | NOT_FOUND | VALIDATION_ERROR,
)
async def place_task(taskId: TaskId, placement: TaskPlacement, store: Store) -> list[Task]:
    return store.place_task(taskId, placement)
