import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- CONFIGURACIÓN INICIAL ---
const app = express();
app.use(cors());
app.use(express.json());

// --- RUTA ABSOLUTA DEL ARCHIVO db.json ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "db.json");

// --- FUNCIONES DE BASE DE DATOS LOCAL ---
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data || "{}");
  } catch (err) {
    console.error("⚠️ Error leyendo DB:", err);
    return { pacientes: [], videollamadas: [], recordatorios: [] };
  }
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
  res.json({ mensaje: "Videollamada registrada correctamente", llamada });
});

// --- PUERTO ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Servidor backend corriendo en puerto ${PORT}`);
});
