import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = process.env.DATA_DIR;
if (dataDir) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath =
  process.env.DB_PATH ||
  (dataDir ? path.resolve(dataDir, 'rocade.sqlite3') : path.resolve(__dirname, '..', 'rocade.sqlite3'));

const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS rocade_manager_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data_json TEXT NOT NULL,
    ui_state_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/api/rocade/state', (_req, res) => {
  const row = db
    .prepare('SELECT data_json, ui_state_json, updated_at FROM rocade_manager_state WHERE id = 1')
    .get();

  if (!row) {
    return res.status(200).json({ data: null, uiState: null, updatedAt: null });
  }

  return res.status(200).json({
    data: row.data_json,
    uiState: row.ui_state_json,
    updatedAt: row.updated_at,
  });
});

app.put('/api/rocade/state', (req, res) => {
  const payload = req.body || {};
  const data = payload.data;
  const uiState = payload.uiState;

  if (data == null || uiState == null) {
    return res.status(400).json({ error: 'Payload incomplet.' });
  }

  const nowIso = new Date().toISOString();
  const dataJson = typeof data === 'string' ? data : JSON.stringify(data);
  const uiStateJson = typeof uiState === 'string' ? uiState : JSON.stringify(uiState);

  db.prepare(
    `
      INSERT INTO rocade_manager_state (id, data_json, ui_state_json, updated_at)
      VALUES (1, ?, ?, ?)
      ON CONFLICT(id)
      DO UPDATE SET
        data_json = excluded.data_json,
        ui_state_json = excluded.ui_state_json,
        updated_at = excluded.updated_at
    `
  ).run(dataJson, uiStateJson, nowIso);

  return res.status(200).json({ ok: true, updatedAt: nowIso });
});

app.delete('/api/rocade/state', (_req, res) => {
  db.prepare('DELETE FROM rocade_manager_state WHERE id = 1').run();
  return res.status(200).json({ ok: true });
});

const distPath = path.resolve(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      next();
      return;
    }

    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Rocade JS active sur http://localhost:${PORT} (db: ${dbPath})`);
});
