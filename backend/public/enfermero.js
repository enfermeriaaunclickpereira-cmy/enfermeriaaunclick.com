const user = JSON.parse(localStorage.getItem("eaac_user"));
if (!user || user.rol !== "enfermero") window.location.href = "/";

document.getElementById("nombreEnfermero").textContent = `👩‍⚕️ ${user.nombre}`;

async function cargarPacientes() {
  const res = await fetch("/api/pacientes").then(r => r.json());
  const tbody = document.querySelector("#tablaPacientes tbody");
  tbody.innerHTML = "";
  res.forEach(p => {
    tbody.innerHTML += `<tr><td>${p.nombre}</td><td>${p.edad}</td><td>${p.condicion}</td></tr>`;
  });
}

async function cargarCitas() {
  const res = await fetch("/api/videollamadas/" + user.nombre).then(r => r.json());
  const tbody = document.querySelector("#tablaCitas tbody");
  tbody.innerHTML = "";
  res.forEach(c => {
    tbody.innerHTML += `<tr><td>${c.paciente}</td><td>${c.fecha}</td><td>${c.hora}</td><td>${c.estado}</td></tr>`;
  });
}

cargarPacientes();
cargarCitas();

function logout() {
  localStorage.removeItem("eaac_user");
  window.location.href = "/";
}
