function iniciarSesion() {
  const rol = document.getElementById('rol').value;
  const nombre = document.getElementById('nombre').value;
  const edad = document.getElementById('edad').value;
  const enfermedad = document.getElementById('enfermedad').value;

  if (!nombre) return alert("Por favor ingresa tu nombre");

  if (rol === 'paciente') {
    const pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
    pacientes.push({ nombre, edad, enfermedad, estado: "Estable", medicamentos: "N/A" });
    localStorage.setItem('pacientes', JSON.stringify(pacientes));
    localStorage.setItem('usuarioActual', nombre);
    location.href = 'paciente.html';
  } else {
    location.href = 'enfermero.html';
  }
}

if (location.pathname.endsWith('paciente.html')) {
  const nombre = localStorage.getItem('usuarioActual') || 'Paciente';
  document.getElementById('saludo').innerText = `Hola, ${nombre} 👋 Tu enfermera es Ana Pérez`;

  const alertas = [
    "Recuerda medir tu presión arterial a las 8:00 a.m.",
    "Toma suficiente agua durante el día 💧",
    "Tu próxima cita es mañana a las 10:00 a.m."
  ];
  const lista = document.getElementById('alertas');
  alertas.forEach(a => {
    const li = document.createElement('li');
    li.textContent = a;
    lista.appendChild(li);
  });
}

function solicitarVideollamada() {
  const nombre = localStorage.getItem('usuarioActual');
  const llamadas = JSON.parse(localStorage.getItem('llamadas') || '[]');
  llamadas.push({ paciente: nombre, hora: new Date().toLocaleTimeString() });
  localStorage.setItem('llamadas', JSON.stringify(llamadas));
  alert("📞 Videollamada solicitada. Tu enfermera te contactará pronto.");
}
function recordatorioMedicacion() { alert("💊 Toma tu medicación a las 8:00 a.m."); }
function mensajeEnfermera() { alert("💬 Tu enfermera: 'Excelente trabajo esta semana 💙'"); }
function recomendacionSalud() { alert("🧘‍♀️ Tip del día: realiza respiraciones profundas cada hora."); }

if (location.pathname.endsWith('enfermero.html')) {
  const pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
  const llamadas = JSON.parse(localStorage.getItem('llamadas') || '[]');

  const tPacientes = document.querySelector('#tablaPacientes tbody');
  const tEstados = document.querySelector('#tablaEstados tbody');
  const listaLlamadas = document.getElementById('listaLlamadas');

  pacientes.forEach(p => {
    tPacientes.innerHTML += `<tr><td>${p.nombre}</td><td>${p.edad}</td><td>${p.enfermedad}</td></tr>`;
    tEstados.innerHTML += `<tr><td>${p.nombre}</td><td>${p.estado}</td><td>${p.medicamentos}</td></tr>`;
  });

  llamadas.forEach(l => {
    const li = document.createElement('li');
    li.textContent = `${l.paciente} — solicitó a las ${l.hora}`;
    listaLlamadas.appendChild(li);
  });
}

function mostrarTab(id, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
}
function cerrarSesion() { localStorage.removeItem('usuarioActual'); location.href = 'login.html'; }
