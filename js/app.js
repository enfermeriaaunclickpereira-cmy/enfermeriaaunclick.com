const API_URL = "http://localhost:4000/api";

async function login() {
  const rol = document.getElementById("rol").value;
  const nombre = document.getElementById("nombre").value;
  const edad = document.getElementById("edad").value;
  const enfermedad = document.getElementById("enfermedad").value;

  if (!rol || !nombre) {
    alert("Completa los campos requeridos");
    return;
  }

  if (rol === "paciente") {
    await fetch(`${API_URL}/pacientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, edad, enfermedad }),
    });
    localStorage.setItem("usuario", nombre);
    location.href = "paciente.html";
  } else if (rol === "enfermero") {
    location.href = "enfermero.html";
  }
}

async function cargarDashboard() {
  const pacientes = await fetch(`${API_URL}/pacientes`).then(r => r.json());
  const llamadas = await fetch(`${API_URL}/videollamadas`).then(r => r.json());

  document.getElementById("countPacientes").textContent = pacientes.length;
  document.getElementById("countLlamadas").textContent = llamadas.length;

  const tbody = document.querySelector("#tablaPacientes tbody");
  tbody.innerHTML = "";
  pacientes.forEach(p => {
    tbody.innerHTML += `
      <tr>
        <td>${p.nombre}</td><td>${p.edad}</td><td>${p.enfermedad}</td>
        <td>${p.presion}</td><td>${p.ritmo}</td><td>${p.estado}</td>
      </tr>`;
  });

  const ctx = document.getElementById("ritmoChart");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: pacientes.map(p => p.nombre),
      datasets: [{
        label: "Ritmo Cardiaco",
        data: pacientes.map(p => p.ritmo),
        borderColor: "#00e0c0",
        backgroundColor: "rgba(0,224,192,0.2)",
        fill: true,
        tension: 0.3
      }]
    },
    options: { scales: { y: { beginAtZero: false } } }
  });
}

function cerrarSesion() {
  localStorage.clear();
  location.href = "login.html";
}

if (location.pathname.endsWith("enfermero.html")) {
  cargarDashboard();
}
