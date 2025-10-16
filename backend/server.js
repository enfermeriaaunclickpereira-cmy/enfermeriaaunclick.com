import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = "./db.json";

// --- Funciones auxiliares ---
function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// --- RUTAS API ---
app.get("/api/pacientes", (req, res) => {
  const db = readDB();
  res.json(db.pacientes || []);
});

app.get("/api/recordatorios", (req, res) => {
  const db = readDB();
  res.json(db.recordatorios || []);
});

app.post("/api/videollamadas", (req, res) => {
  const db = readDB();
  const llamada = {
    paciente: req.body.paciente,
    hora: new Date().toLocaleTimeString(),
  };
  db.videollamadas.push(llamada);
  writeDB(db);
  res.json(llamada);
});

// --- PUERTO ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`✅ Servidor backend corriendo en puerto ${PORT}`)
);
