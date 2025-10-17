import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// Paths base
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "db.json");
const PUBLIC_PATH = path.join(__dirname, "public");

// Servir frontend
app.use(express.static(PUBLIC_PATH));

// DB helpers
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch {
    return { usuarios: [], pacientes: [], recordatorios: [], videollamadas: [], observaciones: [] };
  }
}
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Ping API
app.get("/api", (req, res) => res.json({ ok: true }));

// ---------- AUTH DEMO ----------
app.post("/api/auth/register", (req, res) => {
  const { nombre, email, password, rol } = req.body || {};
  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ ok: false, mensaje: "Faltan campos" });
  }
  const db = readDB();
  const existe = (db.usuarios || []).find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existe) return res.status(409).json({ ok: false, mensaje: "El correo ya está registrado" });

  const nuevo = {
    id: (db.usuarios?.length || 0) + 1,
    nombre,
    email: email.toLowerCase(),
    password, // demo: sin hash
    rol // "paciente" | "enfermero"
  };
  db.usuarios = db.usuarios || [];
  db.usuarios.push(nuevo);
  writeDB(db);

  res.json({ ok: true, usuario: { id: nuevo.id, nombre: nuevo.nombre, email: nuevo.email, rol: nuevo.rol } });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ ok: false, mensaje: "Faltan credenciales" });

  const db = readDB();
  const user = (db.usuarios || []).find(
    u => u.email === email.toLowerCase() && u.password === password
  );
  if (!user) return res.status(401).json({ ok: false, mensaje: "Credenciales inválidas" });

  res.json({ ok: true, usuario: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
});
// ---------- FIN AUTH ----------

// Pacientes (igual que tenías; mantiene compatibilidad)
app.get("/api/pacientes", (req, res) => res.json(readDB().pacientes || []));
app.post("/api/pacientes", (req, res) => {
  const db = readDB();
  const nuevo = {
    id: (db.pacientes?.length || 0) + 1,
    nombre: req.body.nombre,
    edad: req.body.edad,
    condicion: req.body.condicion
  };
  db.pacientes = db.pacientes || [];
  db.pacientes.push(nuevo);
  writeDB(db);
  res.json({ mensaje: "Paciente agregado", paciente: nuevo });
});

// Catch-all → index
app.get("*", (req, res) => res.sendFile(path.join(PUBLIC_PATH, "index.html")));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));
