"""PostgreSQL storage and explicit, repeatable migration/seed commands."""
import json
import os
import sys
from pathlib import Path

try:
    import psycopg
except ImportError:
    psycopg = None
try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(path):
        if path.exists():
            raise RuntimeError("Install backend requirements to load backend/.env.")
class DatabaseUnavailable(Exception):
    pass

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")
DATABASE_ERRORS = (DatabaseUnavailable, psycopg.Error) if psycopg else (DatabaseUnavailable,)


def database_url():
    return os.getenv("DATABASE_URL", "").strip()


def connect():
    url = database_url()
    if not url:
        raise RuntimeError("Set DATABASE_URL in backend/.env before using PostgreSQL.")
    if psycopg is None:
        raise DatabaseUnavailable("Install backend requirements for PostgreSQL.")
    return psycopg.connect(url, connect_timeout=5)


def read_passages(language=None, level=None, passage_id=None):
    with connect() as conn:
        rows = conn.execute(
            """SELECT content FROM passages
               WHERE (%s::text IS NULL OR language = %s)
                 AND (%s::text IS NULL OR level = %s)
                 AND (%s::text IS NULL OR id = %s)
               ORDER BY sort_order, id""",
            (language, language, level, level, passage_id, passage_id),
        ).fetchall()
    return [row[0] for row in rows]


def migrate():
    with connect() as conn:
        conn.execute("SELECT pg_advisory_xact_lock(724091)")
        conn.execute("""CREATE TABLE IF NOT EXISTS schema_migrations (
            version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())""")
        for path in sorted((ROOT / "migrations").glob("*.sql")):
            if not conn.execute(
                "SELECT 1 FROM schema_migrations WHERE version = %s", (path.name,)
            ).fetchone():
                conn.execute(path.read_text(encoding="utf-8"))
                conn.execute("INSERT INTO schema_migrations(version) VALUES (%s)", (path.name,))


def seed():
    # Validate every draft before inserting. Existing edits and review status are preserved.
    from psycopg.types.json import Jsonb
    from app.main import Passage
    drafts = [
        Passage.model_validate(item).model_dump()
        for item in json.loads((ROOT / "app" / "passages.json").read_text(encoding="utf-8"))
    ]
    with connect() as conn:
        for index, item in enumerate(drafts):
            conn.execute(
                """INSERT INTO passages(id, language, level, content, sort_order)
                   VALUES (%s, %s, %s, %s, %s) ON CONFLICT (id) DO NOTHING""",
                (item["id"], item["language"], item["level"], Jsonb(item), index),
            )


if __name__ == "__main__":
    command = sys.argv[1] if len(sys.argv) == 2 else ""
    if command == "migrate":
        migrate()
    elif command == "seed":
        seed()
    else:
        raise SystemExit("Usage: python -m app.database migrate|seed")
    print(f"Database {command} completed.")

