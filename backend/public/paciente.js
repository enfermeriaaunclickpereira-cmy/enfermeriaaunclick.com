const user = JSON.parse(localStorage.getItem("eaac_user"));
if (!user || user.rol !== "paciente") window.location.href = "/";

document.getElementById("nombrePaciente").textContent = `👋 Hola ${user.nombre}`;

const modal = document.getElementById("modalCita");
document.getElementById("btnProgramar").addEventListener("click", async () => {
  modal.setAttribute("aria-hidden", "false");
  const lista = document.getElementById("listaEnfermeros");
  lista.innerHTML = "";
  const enfermeros = await fetch("/api/enfermeros").then(r => r.json());
  enfermeros.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e.nombre;
    opt.textContent = e.nombre;
    lista.appendChild(opt);
  });
});

document.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => {
  modal.setAttribute("aria-hidden", "true");
}));

document.getElementById("formCita").addEventListener("submit", async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    paciente: user.nombre,
    enfermero: fd.get("enfermero"),
    fecha: fd.get("fecha"),
    hora: fd.get("hora")
  };
  const res = await fetch("/api/videollamadas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(r => r.json());
  document.getElementById("msgCita").textContent = res.mensaje || "Cita guardada";
  setTimeout(() => modal.setAttribute("aria-hidden", "true"), 1000);
  cargarVideollamadas();
});

async function cargarVideollamadas() {
  const res = await fetch("/api/videollamadas/" + user.nombre).then(r => r.json());
  const tbody = document.querySelector("#tablaVideollamadas tbody");
  tbody.innerHTML = "";
  res.forEach(v => {
    tbody.innerHTML += `<tr><td>${v.enfermero}</td><td>${v.fecha}</td><td>${v.hora}</td><td>${v.estado}</td></tr>`;
  });
}
cargarVideollamadas();

function logout() {
  localStorage.removeItem("eaac_user");
  window.location.href = "/";
}
