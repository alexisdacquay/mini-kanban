from typing import Any

from fastapi.testclient import TestClient
from pytest import MonkeyPatch

from app.main import create_app


TASK_KEYS = {
    "id",
    "title",
    "description",
    "priority",
    "dueDate",
    "column",
    "createdAt",
}


def assert_task_shape(task: dict[str, Any]) -> None:
    assert set(task) == TASK_KEYS
    assert isinstance(task["id"], str) and task["id"]
    assert isinstance(task["title"], str) and task["title"].strip()
    assert isinstance(task["description"], str)
    assert task["priority"] in {"low", "medium", "high"}
    assert task["dueDate"] is None or isinstance(task["dueDate"], str)
    assert task["column"] in {"todo", "doing", "done"}
    assert type(task["createdAt"]) is int


def assert_error_shape(response: Any, status_code: int) -> None:
    assert response.status_code == status_code
    error = response.json()
    assert set(error) == {"code", "message"}
    assert isinstance(error["code"], str) and error["code"]
    assert isinstance(error["message"], str) and error["message"]


def list_tasks(client: TestClient) -> list[dict[str, Any]]:
    response = client.get("/api/v1/tasks")
    assert response.status_code == 200
    tasks = response.json()
    assert isinstance(tasks, list)
    for task in tasks:
        assert_task_shape(task)
    return tasks


def ids_in_column(tasks: list[dict[str, Any]], column: str) -> list[str]:
    return [task["id"] for task in tasks if task["column"] == column]


def task_in_column(tasks: list[dict[str, Any]], column: str) -> dict[str, Any]:
    return next(task for task in tasks if task["column"] == column)


def test_seeded_board_has_one_ordered_task_per_column(client: TestClient) -> None:
    tasks = list_tasks(client)

    assert [(task["title"], task["column"]) for task in tasks] == [
        ("Plan the week", "todo"),
        ("Build the API", "doing"),
        ("Ship the first board", "done"),
    ]
    assert len({task["id"] for task in tasks}) == len(tasks)


def test_create_uses_defaults_and_places_task_at_top_of_todo(client: TestClient) -> None:
    existing_todo_ids = ids_in_column(list_tasks(client), "todo")

    response = client.post("/api/v1/tasks", json={"title": "Write focused tests"})

    assert response.status_code == 201
    created = response.json()
    assert_task_shape(created)
    assert {
        key: created[key]
        for key in ("title", "description", "priority", "dueDate", "column")
    } == {
        "title": "Write focused tests",
        "description": "",
        "priority": "medium",
        "dueDate": None,
        "column": "todo",
    }
    assert ids_in_column(list_tasks(client), "todo") == [created["id"], *existing_todo_ids]


def test_whitespace_only_titles_are_rejected_without_mutating_tasks(client: TestClient) -> None:
    original_tasks = list_tasks(client)
    target = original_tasks[0]

    assert_error_shape(client.post("/api/v1/tasks", json={"title": " \t\n "}), 422)
    assert_error_shape(
        client.patch(f"/api/v1/tasks/{target['id']}", json={"title": "   "}),
        422,
    )
    assert list_tasks(client) == original_tasks


def test_edit_preserves_task_placement_and_order(client: TestClient) -> None:
    before = list_tasks(client)
    target = task_in_column(before, "doing")

    response = client.patch(
        f"/api/v1/tasks/{target['id']}",
        json={
            "title": "Polish the API",
            "description": "Keep the contract small.",
            "priority": "high",
            "dueDate": "2026-09-30",
        },
    )

    assert response.status_code == 200
    updated = response.json()
    assert_task_shape(updated)
    assert updated == {
        **target,
        "title": "Polish the API",
        "description": "Keep the contract small.",
        "priority": "high",
        "dueDate": "2026-09-30",
    }
    after = list_tasks(client)
    assert [task["id"] for task in after] == [task["id"] for task in before]


def test_placement_uses_final_destination_index_for_reorder_and_move(
    client: TestClient,
) -> None:
    first = client.post("/api/v1/tasks", json={"title": "First new card"}).json()
    second = client.post("/api/v1/tasks", json={"title": "Second new card"}).json()
    before = list_tasks(client)
    seeded_todo_id = next(
        task["id"] for task in before if task["title"] == "Plan the week"
    )
    seeded_doing_id = task_in_column(before, "doing")["id"]
    assert ids_in_column(before, "todo") == [second["id"], first["id"], seeded_todo_id]

    reordered_response = client.put(
        f"/api/v1/tasks/{second['id']}/placement",
        json={"column": "todo", "index": 2},
    )

    assert reordered_response.status_code == 200
    reordered = reordered_response.json()
    assert ids_in_column(reordered, "todo") == [first["id"], seeded_todo_id, second["id"]]
    for task in reordered:
        assert_task_shape(task)

    moved_response = client.put(
        f"/api/v1/tasks/{second['id']}/placement",
        json={"column": "doing", "index": 0},
    )

    assert moved_response.status_code == 200
    moved = moved_response.json()
    assert ids_in_column(moved, "todo") == [first["id"], seeded_todo_id]
    assert ids_in_column(moved, "doing") == [second["id"], seeded_doing_id]
    moved_task = next(task for task in moved if task["id"] == second["id"])
    assert moved_task == {**second, "column": "doing"}


def test_delete_removes_task_and_missing_task_returns_contract_error(
    client: TestClient,
) -> None:
    target = task_in_column(list_tasks(client), "done")

    response = client.delete(f"/api/v1/tasks/{target['id']}")

    assert response.status_code == 204
    assert response.content == b""
    assert target["id"] not in {task["id"] for task in list_tasks(client)}
    assert_error_shape(client.delete(f"/api/v1/tasks/{target['id']}"), 404)


def test_preferences_have_defaults_and_can_be_replaced(client: TestClient) -> None:
    response = client.get("/api/v1/preferences")
    assert response.status_code == 200
    assert response.json() == {"theme": "cathode", "compact": False}

    response = client.put(
        "/api/v1/preferences",
        json={"theme": "midnight", "compact": True},
    )
    assert response.status_code == 200
    assert response.json() == {"theme": "midnight", "compact": True}

    response = client.get("/api/v1/preferences")
    assert response.status_code == 200
    assert response.json() == {"theme": "midnight", "compact": True}


def test_board_state_survives_app_recreation(database_url: str) -> None:
    with TestClient(create_app(database_url=database_url)) as first_client:
        original_tasks = list_tasks(first_client)
        deleted_task = next(
            task for task in original_tasks if task["title"] == "Plan the week"
        )

        create_response = first_client.post(
            "/api/v1/tasks", json={"title": "Persist this card"}
        )
        assert create_response.status_code == 201
        created_task = create_response.json()

        placement_response = first_client.put(
            f"/api/v1/tasks/{created_task['id']}/placement",
            json={"column": "doing", "index": 0},
        )
        assert placement_response.status_code == 200
        assert first_client.delete(
            f"/api/v1/tasks/{deleted_task['id']}"
        ).status_code == 204

        preferences_response = first_client.put(
            "/api/v1/preferences",
            json={"theme": "midnight", "compact": True},
        )
        assert preferences_response.status_code == 200
        expected_tasks = list_tasks(first_client)

    with TestClient(create_app(database_url=database_url)) as restarted_client:
        assert list_tasks(restarted_client) == expected_tasks
        assert restarted_client.get("/api/v1/preferences").json() == {
            "theme": "midnight",
            "compact": True,
        }


def test_intentionally_empty_board_is_not_reseeded(database_url: str) -> None:
    with TestClient(create_app(database_url=database_url)) as first_client:
        for task in list_tasks(first_client):
            response = first_client.delete(f"/api/v1/tasks/{task['id']}")
            assert response.status_code == 204
        assert list_tasks(first_client) == []

    with TestClient(create_app(database_url=database_url)) as restarted_client:
        assert list_tasks(restarted_client) == []


def test_database_url_environment_variable_selects_database(
    database_url: str, monkeypatch: MonkeyPatch
) -> None:
    monkeypatch.setenv("DATABASE_URL", database_url)

    with TestClient(create_app()) as environment_client:
        response = environment_client.post(
            "/api/v1/tasks", json={"title": "Stored through DATABASE_URL"}
        )
        assert response.status_code == 201
        created_task = response.json()

    with TestClient(create_app(database_url=database_url)) as explicit_client:
        assert created_task in list_tasks(explicit_client)


def test_sqlite_memory_database_is_shared_with_request_threads() -> None:
    with TestClient(create_app(database_url="sqlite:///:memory:")) as memory_client:
        tasks = list_tasks(memory_client)

    assert [task["title"] for task in tasks] == [
        "Plan the week",
        "Build the API",
        "Ship the first board",
    ]
