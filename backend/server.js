import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = "./db.json";

// Leer base de datos
function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

// Guardar base de datos
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Obtener todos los pacientes
app.get("/api/pacientes", (req, res) => {
  const db = readDB();
  res.json(db.pacientes);
});

// Registrar nuevo paciente
app.post("/api/pacientes", (req, res) => {
  const db = readDB();
  const nuevo = {
    id: Date.now(),
    nombre: req.body.nombre,
    edad: req.body.edad,
    enfermedad: req.body.enfermedad,
    estado: "Estable",
    presion: "110/70",
    ritmo: Math.floor(Math.random() * (100 - 60) + 60),
  };
  db.pacientes.push(nuevo);
  writeDB(db);
  res.json(nuevo);
});

// Obtener videollamadas
app.get("/api/videollamadas", (req, res) => {
  const db = readDB();
  res.json(db.videollamadas);
});

// Agregar videollamada
app.post("/api/videollamadas", (req, res) => {
  const db = readDB();
  const llamada = {
    id: Date.now(),
    paciente: req.body.paciente,
    hora: new Date().toLocaleTimeString(),
  };
  db.videollamadas.push(llamada);
  writeDB(db);
  res.json(llamada);
});

app.listen(4000, () => console.log("✅ Servidor backend corriendo en http://localhost:4000"));
