import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// === Configuración de rutas y paths ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "db.json");
const PUBLIC_PATH = path.join(__dirname, "public");

// === Archivos estáticos ===
app.use(express.static(PUBLIC_PATH));

// === Funciones para DB ===
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch {
    return { pacientes: [], recordatorios: [], videollamadas: [], observaciones: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// === Endpoints API ===
app.get("/api", (req, res) => res.send("✅ API activa desde Render"));

app.get("/api/pacientes", (req, res) => res.json(readDB().pacientes || []));
app.post("/api/pacientes", (req, res) => {
  const db = readDB();
  const nuevo = {
    id: db.pacientes.length + 1,
    nombre: req.body.nombre,
    edad: req.body.edad,
    condicion: req.body.condicion
  };
  db.pacientes.push(nuevo);
  writeDB(db);
  res.json({ mensaje: "Paciente agregado", paciente: nuevo });
});

// === Catch-all: frontend ===
app.get("*", (req, res) => {
  res.sendFile(path.join(PUBLIC_PATH, "index.html"));
});

// === Puerto dinámico ===
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));
