import sqlite3
import json
from datetime import datetime
from pathlib import Path

from flask import Flask, g, jsonify, render_template, request

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "rocade.sqlite3"

app = Flask(__name__)
app.config["SECRET_KEY"] = "rocade-dev-secret"


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
    return jsonify({"ok": True, "updatedAt": now_iso}), 200


@app.route("/api/rocade/state", methods=["DELETE"])
def reset_rocade_state():
    db = get_db()
    db.execute("DELETE FROM rocade_manager_state WHERE id = 1")
    db.commit()
    return jsonify({"ok": True}), 200


@app.route("/")
def dashboard():
    return render_template("dashboard.html")


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
