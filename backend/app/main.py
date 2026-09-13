from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.models import Error
from app.routers import preferences, tasks
from app.store import InMemoryStore, TaskNotFound

API_PREFIX = "/api/v1"


def create_app(store: InMemoryStore | None = None) -> FastAPI:
    app = FastAPI(title="Mini Kanban API", version="1.0.0")
    app.state.store = store if store is not None else InMemoryStore()

    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):\d+$",
        allow_credentials=False,
        allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type"],
    )

    @app.exception_handler(TaskNotFound)
    async def task_not_found_handler(_request: Request, exc: TaskNotFound) -> JSONResponse:
        error = Error(code="task_not_found", message=f'Task "{exc.task_id}" was not found.')
        return JSONResponse(status_code=404, content=error.model_dump())

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        _request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        malformed_json = any(error["type"] == "json_invalid" for error in exc.errors())
        if malformed_json:
            error = Error(code="bad_request", message="The request body is not valid JSON.")
            return JSONResponse(status_code=400, content=error.model_dump())

        error = Error(code="validation_error", message="The request contains invalid values.")
        return JSONResponse(status_code=422, content=error.model_dump())

    app.include_router(tasks.router, prefix=API_PREFIX)
    app.include_router(preferences.router, prefix=API_PREFIX)
    return app


app = create_app()

