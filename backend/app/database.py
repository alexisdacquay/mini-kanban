"""Database configuration and SQLAlchemy persistence models."""

from __future__ import annotations

import os
from datetime import date
from pathlib import Path

from sqlalchemy import BigInteger, Boolean, Date, Integer, String, Text
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine, make_url
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker
from sqlalchemy.pool import StaticPool


DEFAULT_DATABASE_PATH = Path(__file__).resolve().parents[1] / "mini-kanban.db"
DEFAULT_DATABASE_URL = f"sqlite:///{DEFAULT_DATABASE_PATH.as_posix()}"


class Base(DeclarativeBase):
    """Base class for database records."""


class TaskRecord(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(String(16), nullable=False)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    column: Mapped[str] = mapped_column(String(16), nullable=False)
    created_at: Mapped[int] = mapped_column(BigInteger, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)


class PreferencesRecord(Base):
    __tablename__ = "preferences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    theme: Mapped[str] = mapped_column(String(16), nullable=False)
    compact: Mapped[bool] = mapped_column(Boolean, nullable=False)


SessionFactory = sessionmaker[Session]


def resolve_database_url(database_url: str | None = None) -> str:
    """Resolve an explicit URL, the environment, or the local SQLite default."""

    return database_url or os.getenv("DATABASE_URL") or DEFAULT_DATABASE_URL


def create_database_engine(database_url: str) -> Engine:
    """Create an engine with the one connection option SQLite needs locally."""

    url = make_url(database_url)
    if url.get_backend_name() != "sqlite":
        return create_engine(url)

    options: dict[str, object] = {
        "connect_args": {"check_same_thread": False},
    }
    if url.database in (None, "", ":memory:"):
        options["poolclass"] = StaticPool
    return create_engine(url, **options)


def create_session_factory(engine: Engine) -> SessionFactory:
    """Create short-lived sessions bound to the supplied engine."""

    return sessionmaker(bind=engine, expire_on_commit=False)
