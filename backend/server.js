app.get("/api/pacientes", (req, res) => {
  const db = readDB();
  res.json(db.pacientes || []);
});

app.get("/api/recordatorios", (req, res) => {
  const db = readDB();
  res.json(db.recordatorios || []);
});

app.post("/api/videollamadas", (req, res) => {
  const db = readDB();
  const llamada = {
    paciente: req.body.paciente,
    hora: new Date().toLocaleTimeString(),
  };
  db.videollamadas.push(llamada);
  writeDB(db);
  res.json(llamada);
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Servidor backend corriendo en puerto ${PORT}`));
