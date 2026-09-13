.PHONY: run frontend backend test

FRONTEND_PORT ?= 8080
BACKEND_PORT ?= 8091
API_URL ?= http://localhost:$(BACKEND_PORT)/api/v1

run:
	@$(MAKE) --no-print-directory -j2 frontend backend

frontend:
	cd frontend && VITE_API_URL=$(API_URL) bun run dev --port $(FRONTEND_PORT)

backend:
	cd backend && uv run uvicorn app.main:app --reload --port $(BACKEND_PORT)

test:
	cd frontend && bun test
	cd backend && uv run pytest
