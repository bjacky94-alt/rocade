import sqlite3
import json
import hashlib
import os
from datetime import datetime
from pathlib import Path

from flask import Flask, g, jsonify, render_template, request
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.getenv("DATA_DIR", str(BASE_DIR)))
DB_PATH = DATA_DIR / "rocade.sqlite3"
AUTO_BACKUP_DIR = DATA_DIR / "backups" / "auto"
AUTO_BACKUP_META_PATH = AUTO_BACKUP_DIR / "_meta.json"
AUTO_BACKUP_MIN_INTERVAL_SECONDS = 120
AUTO_BACKUP_KEEP_FILES = 200

app = Flask(__name__)
app.config["SECRET_KEY"] = "rocade-dev-secret"

DEFAULT_CORS_ORIGINS = [
    "https://bjacky94-alt.github.io",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

raw_origins = os.getenv("ALLOWED_CLOUD_ORIGINS", ",".join(DEFAULT_CORS_ORIGINS))
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
CORS(app, resources={r"/api/*": {"origins": allowed_origins}})


def _state_hash(data_json: str, ui_state_json: str) -> str:
    payload = f"{data_json}\n{ui_state_json}".encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def _prune_auto_backups() -> None:
    snapshots = sorted(AUTO_BACKUP_DIR.glob("rocade_state_*.json"))
    if len(snapshots) <= AUTO_BACKUP_KEEP_FILES:
        return

    for old_file in snapshots[: len(snapshots) - AUTO_BACKUP_KEEP_FILES]:
        old_file.unlink(missing_ok=True)


def create_auto_backup(data_json: str, ui_state_json: str, force: bool = False) -> bool:
    AUTO_BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    now = datetime.now()
    current_hash = _state_hash(data_json, ui_state_json)
    should_write = True

    if not force and AUTO_BACKUP_META_PATH.exists():
        try:
            meta = json.loads(AUTO_BACKUP_META_PATH.read_text())
            if meta.get("last_hash") == current_hash:
                should_write = False
            else:
                last_backup_at = meta.get("last_backup_at")
                if last_backup_at:
                    last_dt = datetime.fromisoformat(last_backup_at)
                    delta_seconds = (now - last_dt).total_seconds()
                    if delta_seconds < AUTO_BACKUP_MIN_INTERVAL_SECONDS:
                        should_write = False
        except Exception:
            should_write = True

    if not should_write:
        return False

    snapshot_name = f"rocade_state_{now.strftime('%Y%m%d_%H%M%S')}.json"
    snapshot_path = AUTO_BACKUP_DIR / snapshot_name
    snapshot_payload = {
        "data": data_json,
        "uiState": ui_state_json,
        "updatedAt": now.isoformat(timespec="seconds"),
    }

    snapshot_path.write_text(json.dumps(snapshot_payload))

    meta_payload = {
        "last_backup_at": now.isoformat(timespec="seconds"),
        "last_hash": current_hash,
        "last_file": snapshot_name,
    }
    AUTO_BACKUP_META_PATH.write_text(json.dumps(meta_payload))

    _prune_auto_backups()
    return True


def get_db() -> sqlite3.Connection:
    if "db" not in g:
        connection = sqlite3.connect(DB_PATH)
        connection.row_factory = sqlite3.Row
        g.db = connection
    return g.db


@app.teardown_appcontext
def close_db(error):
    del error
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DB_PATH)
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS rocade_manager_state (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            data_json TEXT NOT NULL,
            ui_state_json TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        """
    )
    db.commit()
    db.close()


@app.route("/api/rocade/state", methods=["GET"])
def get_rocade_state():
    db = get_db()
    row = db.execute(
        """
        SELECT data_json, ui_state_json, updated_at
        FROM rocade_manager_state
        WHERE id = 1
        """
    ).fetchone()

    if row is None:
        return jsonify({"data": None, "uiState": None, "updatedAt": None}), 200

    return jsonify(
        {
            "data": row["data_json"],
            "uiState": row["ui_state_json"],
            "updatedAt": row["updated_at"],
        }
    ), 200


@app.route("/api/rocade/state", methods=["PUT"])
def save_rocade_state():
    payload = request.get_json(silent=True) or {}
    data = payload.get("data")
    ui_state = payload.get("uiState")

    if data is None or ui_state is None:
        return jsonify({"error": "Payload incomplet."}), 400

    data_json = data if isinstance(data, str) else json.dumps(data)
    ui_state_json = ui_state if isinstance(ui_state, str) else json.dumps(ui_state)
    now_iso = datetime.now().isoformat(timespec="seconds")

    db = get_db()
    db.execute(
        """
        INSERT INTO rocade_manager_state (id, data_json, ui_state_json, updated_at)
        VALUES (1, ?, ?, ?)
        ON CONFLICT(id)
        DO UPDATE SET
            data_json = excluded.data_json,
            ui_state_json = excluded.ui_state_json,
            updated_at = excluded.updated_at
        """,
        (data_json, ui_state_json, now_iso),
    )
    db.commit()

    try:
        create_auto_backup(data_json, ui_state_json)
    except Exception as backup_error:
        app.logger.warning("Auto-backup skipped: %s", backup_error)

    return jsonify({"ok": True, "updatedAt": now_iso}), 200


@app.route("/api/rocade/state", methods=["DELETE"])
def reset_rocade_state():
    db = get_db()

    row = db.execute(
        """
        SELECT data_json, ui_state_json
        FROM rocade_manager_state
        WHERE id = 1
        """
    ).fetchone()

    if row is not None:
        try:
            create_auto_backup(row["data_json"], row["ui_state_json"], force=True)
        except Exception as backup_error:
            app.logger.warning("Auto-backup before reset skipped: %s", backup_error)

    db.execute("DELETE FROM rocade_manager_state WHERE id = 1")
    db.commit()
    return jsonify({"ok": True}), 200


@app.route("/")
def dashboard():
    return render_template("dashboard.html")


init_db()


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)
