const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = 'demo_secret_change_me';
const PORT = process.env.PORT || 4000;

const DB_FILE = path.join(__dirname, 'db.json');
function readDB(){ try{ return JSON.parse(fs.readFileSync(DB_FILE,'utf8')); }catch(e){ return { nurses: [], patients: [] }; } }
function writeDB(db){ fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }

// ensure db exists
if(!fs.existsSync(DB_FILE)){
  writeDB({ nurses: [], patients: [] });
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Register patient
app.post('/api/patients/register', async (req, res) => {
  try{
    const { nombre, apellido, tipoDocumento, numeroDocumento, ciudad, enfermedad, contacto, edad, password } = req.body;
    if(!nombre || !apellido || !tipoDocumento || !numeroDocumento || !password) return res.status(400).json({error:'Faltan campos'});
  const hashed = bcrypt.hashSync(password, 8);
    const DB = readDB();
    if(DB.patients.find(x => x.numeroDocumento === numeroDocumento && x.tipoDocumento === tipoDocumento)){
      return res.status(409).json({ error: 'Paciente ya existe' });
    }
    const newId = (DB.patients.reduce((m,p)=>Math.max(m,p.id||0),0) || 0) + 1;
    const patient = { id: newId, nombre, apellido, tipoDocumento, numeroDocumento, ciudad, enfermedad, contacto, edad };
    // store hashed password separately
    patient.password = hashed;
    DB.patients.push(patient);
    writeDB(DB);
    const token = jwt.sign({id: patient.id, role:'patient'}, JWT_SECRET, { expiresIn: '12h' });
    res.json({patient, token});
  }catch(e){
    console.error('register error', e);
    res.status(500).json({error: 'Error interno'});
  }
});

// Patient login
app.post('/api/patients/login', (req, res)=>{
  try{
    const { tipoDocumento, numeroDocumento, password } = req.body;
    if(!tipoDocumento || !numeroDocumento || !password) return res.status(400).json({error:'Faltan campos'});
  const DB = readDB();
  const p = DB.patients.find(x => x.numeroDocumento === numeroDocumento && x.tipoDocumento === tipoDocumento);
  if(!p) return res.status(404).json({error:'Paciente no encontrado'});
  const ok = bcrypt.compareSync(password, p.password || '');
    if(!ok) return res.status(401).json({error:'Clave incorrecta'});
    const patient = {id:p.id,nombre:p.nombre,apellido:p.apellido,tipoDocumento:p.tipoDocumento,numeroDocumento:p.numeroDocumento,ciudad:p.ciudad,enfermedad:p.enfermedad,contacto:p.contacto,edad:p.edad};
    const token = jwt.sign({id: patient.id, role:'patient'}, JWT_SECRET, { expiresIn: '12h' });
    res.json({patient, token});
  }catch(e){ console.error('login err', e); res.status(500).json({error:'Error interno'}); }
});

// Nurse login
app.post('/api/nurse/login', (req, res)=>{
  try{
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({error:'Faltan campos'});
  const DB = readDB();
  const n = DB.nurses.find(x => x.email === email);
  if(!n) return res.status(404).json({error:'Enfermero no encontrado'});
  const ok = bcrypt.compareSync(password, n.password || '');
    if(!ok) return res.status(401).json({error:'Clave incorrecta'});
    const token = jwt.sign({id: n.id, role:'nurse'}, JWT_SECRET, { expiresIn: '12h' });
    res.json({nurse:{id:n.id,email:n.email}, token});
  }catch(e){ console.error('nurse login err', e); res.status(500).json({error:'Error interno'}); }
});

// Protected: list patients (simple token verify)
function verifyToken(req){
  const auth = req.headers['authorization'];
  if(!auth) return null;
  const parts = auth.split(' ');
  if(parts.length!==2) return null;
  try{ return jwt.verify(parts[1], JWT_SECRET); }catch(e){ return null; }
}

app.get('/api/patients', (req,res)=>{
  const t = verifyToken(req);
  if(!t || t.role!=='nurse') return res.status(401).json({error:'No autorizado'});
  const DB = readDB();
  const list = DB.patients.map(p=>({ id:p.id, nombre:p.nombre, apellido:p.apellido, tipoDocumento:p.tipoDocumento, numeroDocumento:p.numeroDocumento, ciudad:p.ciudad, enfermedad:p.enfermedad, contacto:p.contacto, edad:p.edad }));
  res.json({patients: list});
});

app.listen(PORT, ()=>console.log('Backend demo escuchando en http://localhost:'+PORT));
