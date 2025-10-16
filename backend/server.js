// --- IMPORTS ---
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- CONFIGURACIÓN INICIAL ---
const app = express();
app.use(cors());
app.use(express.json());

// --- BASE DE DATOS LOCAL ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "db.json");

function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("⚠️ Error leyendo DB:", err);
    return { pacientes: [], recordatorios: [], videollamadas: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// --- SERVIR FRONTEND ---
app.use(express.static(path.join(__dirname, "public")));

// --- RUTA PRINCIPAL ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- RUTA: Pacientes ---
app.get("/api/pacientes", (req, res) => {
  const db = readDB();
  res.json(db.pacientes || []);
});

// --- RUTA: Recordatorios ---
app.get("/api/recordatorios", (req, res) => {
  const db = readDB();
  res.json(db.recordatorios || []);
});

// --- RUTA: Videollamadas ---
app.post("/api/videollamadas", (req, res) => {
  const db = readDB();
  const nuevaLlamada = {
    paciente: req.body.paciente || "Anónimo",
    hora: new Date().toLocaleTimeString(),
  };
  db.videollamadas.push(nuevaLlamada);
  writeDB(db);
  res.json({ mensaje: "Videollamada registrada", llamada: nuevaLlamada });
});

// --- PUERTO ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Servidor backend corriendo en puerto ${PORT}`);
});
