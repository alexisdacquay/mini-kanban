import sys
from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# Keep imports stable whether pytest is launched from the repository root or backend/.
BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from app.main import create_app
from app.store import InMemoryStore


@pytest.fixture
def client() -> Iterator[TestClient]:
    """Give each test a fresh copy of the deterministic in-memory board."""
    with TestClient(create_app(InMemoryStore.seeded())) as test_client:
        yield test_client
