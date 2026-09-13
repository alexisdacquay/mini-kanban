import sys
from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# Keep imports stable whether pytest is launched from the repository root or backend/.
BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from app.main import create_app


@pytest.fixture
def database_url(tmp_path: Path) -> str:
    """Give each test its own file-backed SQLite database."""
    return f"sqlite+pysqlite:///{tmp_path / 'board.db'}"


@pytest.fixture
def client(database_url: str) -> Iterator[TestClient]:
    """Give each test an isolated database seeded with the demonstration board."""
    with TestClient(create_app(database_url=database_url)) as test_client:
        yield test_client
