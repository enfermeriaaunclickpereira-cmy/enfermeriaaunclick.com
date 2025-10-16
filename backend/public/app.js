// === Variables globales ===
const apiBase = ""; // mismo dominio (Render usa proxy)

// === Cargar recordatorios ===
async function cargarRecordatorios() {
  const res = await fetch(`${apiBase}/api/recordatorios`);
  const data = await res.json();
  const lista = document.getElementById("listaRecordatorios");
  if (lista) {
    lista.innerHTML = "";
    data.forEach(r => {
      const li = document.createElement("li");
      li.textContent = `${r.medicamento} - ${r.hora}`;
      lista.appendChild(li);
    });
  }
}

// === Guardar paciente ===
const formPaciente = document.getElementById("formPaciente");
if (formPaciente) {
  formPaciente.addEventListener("submit", async e => {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value;
    const edad = document.getElementById("edad").value;
    const condicion = document.getElementById("condicion").value;

    const res = await fetch(`${apiBase}/api/pacientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, edad, condicion }),
    });

    const result = await res.json();
    alert(`✅ ${result.mensaje}`);
    e.target.reset();
  });
}

// === Simulación de videollamada ===
const btnVideo = document.getElementById("btnVideo");
if (btnVideo) {
  btnVideo.addEventListener("click", async () => {
    alert("📞 Tu enfermera se conectará contigo en breve...");
    await fetch(`${apiBase}/api/videollamadas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paciente: "Paciente" }),
    });
  });
}

// === Mostrar pacientes (para enfermero) ===
async function cargarPacientes() {
  const tabla = document.getElementById("tablaPacientes");
  if (!tabla) return;

  const res = await fetch(`${apiBase}/api/pacientes`);
  const pacientes = await res.json();
  tabla.innerHTML = "";

  pacientes.forEach(p => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.edad}</td>
      <td>${p.condicion}</td>
      <td>
        <button class="btn-observar" onclick="abrirModal('${p.nombre}')">🩺 Observar</button>
      </td>
    `;
    tabla.appendChild(fila);
  });
}

// === Modal de observaciones ===
window.abrirModal = function(nombre) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Agregar observación para ${nombre}</h3>
      <textarea id="obsTexto" rows="4" placeholder="Escribe observación clínica..."></textarea>
      <button id="guardarObs">Guardar</button>
      <button onclick="cerrarModal()">Cerrar</button>
    </div>`;
  document.body.appendChild(modal);

  document.getElementById("guardarObs").onclick = async () => {
    const texto = document.getElementById("obsTexto").value;
    await fetch(`${apiBase}/api/observaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paciente: nombre, texto }),
    });
    alert("🩺 Observación registrada");
    cerrarModal();
  };
};

window.cerrarModal = function() {
  const modal = document.querySelector(".modal");
  if (modal) modal.remove();
};

// === Gráfico de medicamentos (Chart.js) ===
function crearGrafico() {
  const ctx = document.getElementById("graficoMedicamentos");
  if (!ctx) return;
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Losartán", "Metformina", "Atorvastatina"],
      datasets: [{
        label: "Dosis por día",
        data: [1, 2, 1],
        backgroundColor: ["#0d6efd", "#198754", "#ffc107"]
      }]
    }
  });
}

// === Inicialización ===
window.onload = () => {
  cargarRecordatorios();
  cargarPacientes();
  crearGrafico();
};
