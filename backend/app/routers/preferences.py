from fastapi import APIRouter

from app.models import Error, Preferences
from app.routers.dependencies import Store

router = APIRouter(prefix="/preferences", tags=["Preferences"])

BAD_REQUEST = {400: {"model": Error, "description": "The request body is not valid JSON"}}
VALIDATION_ERROR = {
    422: {"model": Error, "description": "The request contains invalid values"}
}


@router.get("", response_model=Preferences, operation_id="getPreferences")
async def get_preferences(store: Store) -> Preferences:
    return store.get_preferences()


@router.put(
    "",
    response_model=Preferences,
    operation_id="replacePreferences",
    responses=BAD_REQUEST | VALIDATION_ERROR,
)
async def replace_preferences(preferences: Preferences, store: Store) -> Preferences:
    return store.replace_preferences(preferences)
