// === Ejemplo básico de consumo de API ===

// Mostrar recordatorios
async function mostrarRecordatorios() {
  const res = await fetch('/api/recordatorios');
  const data = await res.json();
  console.log('📋 Recordatorios:', data);
}

// Registrar videollamada
async function nuevaVideollamada() {
  await fetch('/api/videollamadas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paciente: 'Juan Pérez' })
  });
  console.log('📞 Videollamada registrada');
}

// Ejecutar al cargar
mostrarRecordatorios();
