import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// === Configuración de base de datos local ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "db.json");

function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("⚠️ Error leyendo DB:", err);
    return { pacientes: [], recordatorios: [], videollamadas: [], observaciones: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// === Rutas ===

// 1️⃣ Ruta raíz
app.get("/", (req, res) => {
  res.send("✅ Backend de Enfermería a un Click activo");
});

// 2️⃣ Pacientes
app.get("/api/pacientes", (req, res) => {
  const db = readDB();
  res.json(db.pacientes || []);
});

app.post("/api/pacientes", (req, res) => {
  const db = readDB();
  const nuevo = {
    id: db.pacientes.length + 1,
    nombre: req.body.nombre,
    edad: req.body.edad,
    condicion: req.body.condicion,
  };
  db.pacientes.push(nuevo);
  writeDB(db);
  res.json({ mensaje: "Paciente registrado correctamente", paciente: nuevo });
});

// 3️⃣ Recordatorios
app.get("/api/recordatorios", (req, res) => {
  const db = readDB();
  res.json(db.recordatorios || []);
});

// 4️⃣ Videollamadas
app.post("/api/videollamadas", (req, res) => {
  const db = readDB();
  const llamada = {
    id: db.videollamadas.length + 1,
    paciente: req.body.paciente,
    fecha: new Date().toLocaleString(),
  };
  db.videollamadas.push(llamada);
  writeDB(db);
  res.json({ mensaje: "Videollamada registrada", llamada });
});

// 5️⃣ Observaciones clínicas (enfermero)
app.post("/api/observaciones", (req, res) => {
  const db = readDB();
  const nueva = {
    id: db.observaciones.length + 1,
    paciente: req.body.paciente,
    texto: req.body.texto,
    fecha: new Date().toLocaleString(),
  };
  db.observaciones.push(nueva);
  writeDB(db);
  res.json({ mensaje: "Observación registrada", observacion: nueva });
});

app.get("/api/observaciones", (req, res) => {
  const db = readDB();
  res.json(db.observaciones || []);
});

// === Puerto dinámico (Render asigna uno) ===
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Servidor backend corriendo en puerto ${PORT}`));
