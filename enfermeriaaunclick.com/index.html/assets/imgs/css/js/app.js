function loginSimulado() {
  const rol = document.getElementById('rol').value;
  const nombre = document.getElementById('nombre').value || 'Usuario';

  if (rol === 'paciente') {
    localStorage.setItem('nombrePaciente', nombre);
    location.href = 'paciente.html';
  } else if (rol === 'enfermero') {
    location.href = 'enfermero.html';
  } else {
    location.href = 'paciente.html';
  }
}

// Personalizar saludo en panel del paciente
if (location.pathname.endsWith('paciente.html')) {
  const nombre = localStorage.getItem('nombrePaciente') || 'Paciente';
  document.getElementById('saludo').innerText =
    `Hola, ${nombre}. Tu enfermera es Ana Pérez 👩‍⚕️`;

  const alertas = [
    "Recuerda medir tu glucosa a las 8 a.m.",
    "Toma suficiente agua durante el día 💧",
    "Tu presión arterial se mantiene estable ✅"
  ];
  const lista = document.getElementById('alertas-list');
  alertas.forEach(a => {
    const li = document.createElement('li');
    li.textContent = a;
    lista.appendChild(li);
  });
}
if (location.pathname.endsWith('paciente.html')) {
  setTimeout(() => alert('Su enfermera se conectará en 5 minutos 🕒'), 8000);
}
