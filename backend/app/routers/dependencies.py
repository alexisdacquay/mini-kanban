from typing import Annotated

from fastapi import Depends, Request

from app.store import InMemoryStore


def get_store(request: Request) -> InMemoryStore:
    return request.app.state.store


Store = Annotated[InMemoryStore, Depends(get_store)]

