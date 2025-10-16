Demo completo "Enfermera a un CLICK" - instrucciones

Este repo contiene una demo frontend (estática) y un backend ligero (Node.js + SQLite) para simular registro y login de pacientes y login de enfermero.

Estructura
- `demo.html`, `demo.js`, `styles.css` -> frontend
- `backend/` -> servidor Node.js con SQLite (demo)

Para ejecutar localmente (Windows PowerShell):

1) Abrir una terminal y arrancar el backend

```powershell
cd C:\Users\santi\OneDrive\Documents\mimonita-main\backend
npm install
npm start
```

El backend escuchará en http://localhost:4000

2) Abrir el frontend

```powershell
Start-Process "C:\Users\santi\OneDrive\Documents\mimonita-main\demo.html"
```

3) Credenciales seedadas (backend):
- Enfermero: nurse@demo.com / enfermero123

Notas
- El backend es sólo para demo. Cambia el secreto JWT y no uses esta DB para datos reales.
- El frontend intentará usar el backend; si no está disponible, fallará a un modo offline usando localStorage.

Publicar en GitHub y compartir enlace
------------------------------------

1) Inicializar git y empujar al repositorio remoto (ejemplo con GitHub CLI `gh`):

```powershell
cd C:\Users\santi\OneDrive\Documents\mimonita-main
git init
git add .
git commit -m "Demo: enfermera a un click — interfaz y backend demo"
# crea el repo y hace push (instala GitHub CLI y autentícate si no lo has hecho)
gh repo create <tu-usuario>/<nombre-repo> --public --source=. --remote=origin --push
```

Si no usas `gh`, crea el repo en GitHub vía web y luego ejecuta:

```powershell
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
```

2) Compartir el enlace de la demo
- Si sólo quieres compartir la interfaz estática, habilita GitHub Pages en el repo (settings → Pages) y publica el contenido del branch `main` o `gh-pages`.
- Si quieres que el backend también esté disponible en línea, despliega la carpeta `backend` en servicios como Railway, Render o Fly.io y configura la URL pública en el frontend (reemplazando http://localhost:4000 en `demo.js`).

3) (Opcional) Automatizar despliegue front con GitHub Actions
- Puedo añadir un workflow que publique `demo.html` + assets en GitHub Pages cada vez que pushes a `main`.

¿Quieres que haga: (A) crear pacientes demo en `backend/db.json`, (B) añadir un workflow de GitHub Actions para Pages, o (C) generar un script PowerShell para inicializar y publicar en GitHub automáticamente? Indica la letra que prefieres y lo preparo.

Uso rápido del script de publicación (Windows PowerShell)
----------------------------------------------------

He incluido `publish.ps1` en la raíz que automatiza la mayoría de pasos para inicializar git, crear el repo con `gh` (opcional) y publicar una rama `gh-pages` con los archivos estáticos.

Ejemplo de uso:

```powershell
cd C:\Users\santi\OneDrive\Documents\mimonita-main
# Ejecutar script interactivo
.\publish.ps1
```

Si quieres que el script también genere la rama `gh-pages` automáticamente desde la rama `main`, ejecútalo con el parámetro `-CreatePagesBranch`.

