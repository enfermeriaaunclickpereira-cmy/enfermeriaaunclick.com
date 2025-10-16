Instrucciones para correr el backend demo (Node.js + SQLite)

Requisitos:
- Node.js (v14+ recomendado)

Instalación:

```powershell
cd c:\Users\santi\OneDrive\Documents\mimonita-main\backend
npm install
npm start
```

El servidor arrancará en http://localhost:4000

Credenciales seedadas:
- Enfermero: nurse@demo.com / enfermero123

Endpoints principales:
- POST /api/patients/register  -> { nombre, apellido, tipoDocumento, numeroDocumento, ciudad, enfermedad, contacto, edad, password }
- POST /api/patients/login     -> { tipoDocumento, numeroDocumento, password }
- POST /api/nurse/login        -> { email, password }
- GET  /api/patients           -> requires Authorization: Bearer <token> (nurse)

Notas de seguridad:
- Este backend es sólo para demo. Cambia el JWT_SECRET antes de producción.
- No uses esta base de datos para información real de pacientes.
