import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "db.json");
const PUBLIC_PATH = path.join(__dirname, "public");

// === Helpers ===
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch {
    return { usuarios: [], pacientes: [], videollamadas: [], observaciones: [] };
  }
}
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// === Servir frontend ===
app.use(express.static(PUBLIC_PATH));

// === Registro/Login ===
app.post("/api/auth/register", (req, res) => {
  const { nombre, email, password, rol } = req.body || {};
  if (!nombre || !email || !password || !rol)
    return res.status(400).json({ ok: false, mensaje: "Faltan campos" });

  const db = readDB();
  const existe = (db.usuarios || []).find(u => u.email === email.toLowerCase());
  if (existe) return res.status(409).json({ ok: false, mensaje: "Correo ya registrado" });

  const nuevo = {
    id: (db.usuarios?.length || 0) + 1,
    nombre,
    email: email.toLowerCase(),
    password,
    rol
  };
  db.usuarios.push(nuevo);
  writeDB(db);
  res.json({ ok: true, usuario: nuevo });
});
// = genera error estado de autenticación = 401 (generar correcion 2 sprint 22 oct )
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = (db.usuarios || []).find(
    u => u.email === email.toLowerCase() && u.password === password
  );
  if (!user) return res.status(401).json({ ok: false, mensaje: "Usuario o contraseña incorrecto" });
  res.json({ ok: true, usuario: user });
});


// === Pacientes ===
app.get("/api/pacientes", (req, res) => {
  res.json(readDB().pacientes || []);
});

app.post("/api/pacientes", (req, res) => {
  const { nombre, edad, condicion } = req.body;
  if (!nombre || !edad || !condicion)
    return res.status(400).json({ ok: false, mensaje: "Faltan datos" });
  const db = readDB();
  const nuevo = { id: (db.pacientes?.length || 0) + 1, nombre, edad, condicion };
  db.pacientes.push(nuevo);
  writeDB(db);
  res.json({ ok: true, mensaje: "Paciente agregado", paciente: nuevo });
});

// === Enfermeros (listar) ===
app.get("/api/enfermeros", (req, res) => {
  const db = readDB();
  res.json((db.usuarios || []).filter(u => u.rol === "enfermero"));
});

// === Videollamadas ===
app.post("/api/videollamadas", (req, res) => {
  const { paciente, enfermero, fecha, hora } = req.body;
  if (!paciente || !enfermero || !fecha || !hora)
    return res.status(400).json({ ok: false, mensaje: "Faltan datos" });

  const db = readDB();
  const nueva = {
    id: (db.videollamadas?.length || 0) + 1,
    paciente,
    enfermero,
    fecha,
    hora,
    estado: "Pendiente"
  };
  db.videollamadas.push(nueva);
  writeDB(db);
  res.json({ ok: true, videollamada: nueva });
});

app.get("/api/videollamadas/:enfermero", (req, res) => {
  const db = readDB();
  const citas = (db.videollamadas || []).filter(
    v => v.enfermero.toLowerCase() === req.params.enfermero.toLowerCase()
  );
  res.json(citas);
});

// === Catch-all ===
app.get("*", (req, res) => res.sendFile(path.join(PUBLIC_PATH, "index.html")));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));
