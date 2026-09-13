from typing import Annotated

from fastapi import Depends, Request

from app.store import SQLAlchemyStore


def get_store(request: Request) -> SQLAlchemyStore:
    return request.app.state.store


Store = Annotated[SQLAlchemyStore, Depends(get_store)]
