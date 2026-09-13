.PHONY: run frontend backend

FRONTEND_PORT ?= 8080
BACKEND_PORT ?= 8091

run:
	@$(MAKE) --no-print-directory -j2 frontend backend

frontend:
	cd frontend && bun run dev --port $(FRONTEND_PORT)

backend:
	cd backend && uv run uvicorn app.main:app --reload --port $(BACKEND_PORT)

