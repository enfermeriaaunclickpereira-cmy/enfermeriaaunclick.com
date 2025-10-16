// Demo JS para navegación simple entre vistas
const state = {role:null, name:null};

function $(s){return document.querySelector(s)}
function $all(s){return document.querySelectorAll(s)}

function show(viewId){
  $all('.view').forEach(v=>v.classList.add('hidden'));
  const v = $(`#${viewId}`);
  if(v) v.classList.remove('hidden');
  // Al cambiar de vista, ocultar el chat para que solo se abra por el botón
  if(typeof closeChat === 'function') closeChat();
  // Inicializar panel de enfermero la primera vez que se muestra
  if(viewId === 'nurse' && typeof initNursePanel === 'function' && !window.nurseInitDone){ initNursePanel(); window.nurseInitDone = true; }
}

function toast(msg, timeout=3000){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(()=>t.classList.add('hidden'), timeout);
}

// Home buttons
$all('button[data-action="login"]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const role = btn.dataset.role;
    state.role = role;
    if(role === 'enfermero') {
      show('nurse');
    } else {
      show('login');
    }
  });
});

// Show register form from login
const showRegisterBtn = document.getElementById('show-register');
if(showRegisterBtn){ showRegisterBtn.addEventListener('click', ()=>{ show('register'); }); }

// Cancel register button
const cancelRegisterBtn = document.getElementById('cancel-register');
if(cancelRegisterBtn){ cancelRegisterBtn.addEventListener('click', ()=>{ show('login'); }); }

// Login 'Atrás' button
const loginBackBtn = document.getElementById('login-back');
if(loginBackBtn){ loginBackBtn.addEventListener('click', ()=>{ show('home'); }); }

// Register patient logic
const registerForm = document.getElementById('register-form');
if(registerForm){
  registerForm.addEventListener('submit', function(e){
    e.preventDefault();
    // Collect data
    const paciente = {
      nombre: document.getElementById('reg-nombre').value.trim(),
      apellido: document.getElementById('reg-apellido').value.trim(),
      tipoDocumento: document.getElementById('reg-doc-type').value,
      numeroDocumento: document.getElementById('reg-doc-num').value.trim(),
      ciudad: document.getElementById('reg-ciudad').value.trim(),
      enfermedad: document.getElementById('reg-enfermedad').value.trim(),
      contacto: document.getElementById('reg-contacto').value.trim(),
      edad: document.getElementById('reg-edad').value.trim(),
      password: document.getElementById('reg-password').value,
      password2: document.getElementById('reg-password2').value
    };
    // Validations
    if(!paciente.nombre || !paciente.apellido || !paciente.tipoDocumento || !paciente.numeroDocumento || !paciente.ciudad || !paciente.enfermedad || !paciente.contacto || !paciente.edad || !paciente.password || !paciente.password2){
      toast('Por favor complete todos los campos');
      return;
    }
    if(paciente.password !== paciente.password2){
      toast('Las contraseñas no coinciden');
      return;
    }
    // Save to localStorage (array of patients)
    let pacientes = [];
    try {
      pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
    } catch(e) {}
    pacientes.push({
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      tipoDocumento: paciente.tipoDocumento,
      numeroDocumento: paciente.numeroDocumento,
      ciudad: paciente.ciudad,
      enfermedad: paciente.enfermedad,
      contacto: paciente.contacto,
      edad: paciente.edad
    });
    // Try to register against backend API first
    const apiUrl = 'http://localhost:4000/api/patients/register';
    fetch(apiUrl, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      tipoDocumento: paciente.tipoDocumento,
      numeroDocumento: paciente.numeroDocumento,
      ciudad: paciente.ciudad,
      enfermedad: paciente.enfermedad,
      contacto: paciente.contacto,
      edad: paciente.edad,
      password: paciente.password
    })}).then(r=>{
      if(!r.ok) throw new Error('server');
      return r.json();
    }).then(js=>{
      // backend registered
      localStorage.setItem('lastSessionPatient', JSON.stringify(js.patient));
      toast('Registro exitoso (servidor)');
      state.role = 'paciente'; state.name = js.patient.nombre;
      setupPatient(); show('patient');
    }).catch(err=>{
      // fallback to localStorage-only behavior
      localStorage.setItem('pacientes', JSON.stringify(pacientes));
      const last = {
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        edad: paciente.edad,
        contacto: paciente.contacto,
        ciudad: paciente.ciudad,
        enfermedad: paciente.enfermedad,
        tipoDocumento: paciente.tipoDocumento,
        numeroDocumento: paciente.numeroDocumento
      };
      localStorage.setItem('lastSessionPatient', JSON.stringify(last));
      toast('Registro exitoso (offline)');
      state.role = 'paciente'; state.name = paciente.nombre;
      setupPatient(); show('patient');
    });
  });
}

// Patient login submit (auth by document number + password optional)
const loginFormEl = document.getElementById('login-form');
if(loginFormEl){
  loginFormEl.addEventListener('submit', (e)=>{
    e.preventDefault();
    const tipo = document.getElementById('login-doc-type').value;
    const num = document.getElementById('login-doc-num').value.trim();
    const pwd = document.getElementById('login-password').value;
    // Try backend login first
    const apiUrl = 'http://localhost:4000/api/patients/login';
    fetch(apiUrl, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ tipoDocumento: tipo, numeroDocumento: num, password: pwd }) })
      .then(r=>{
        if(!r.ok) throw new Error('server');
        return r.json();
      }).then(js=>{
        localStorage.setItem('lastSessionPatient', JSON.stringify(js.patient));
        toast(`Bienvenido ${js.patient.nombre} ${js.patient.apellido}`);
        state.role='paciente'; state.name = js.patient.nombre;
        setupPatient(); show('patient');
      }).catch(err=>{
        // fallback: try localStorage match without password
        let pacientes = [];
        try{ pacientes = JSON.parse(localStorage.getItem('pacientes')) || []; }catch(e){}
        const found = pacientes.find(p => p.numeroDocumento === num && p.tipoDocumento === tipo);
        if(!found){ toast('Usuario no encontrado. Por favor registrese.'); show('register'); return; }
        const last = Object.assign({}, found);
        localStorage.setItem('lastSessionPatient', JSON.stringify(last));
        state.role = 'paciente'; state.name = found.nombre;
        setupPatient(); show('patient');
        toast(`Bienvenido ${found.nombre} ${found.apellido} (offline)`);
      });
  });
}

// Contacts button
const btnContacts = document.getElementById('btn-contacts');
if(btnContacts){ btnContacts.addEventListener('click', ()=>{ show('contacts'); populateContacts(); }); }

function populateContacts(){
  const container = document.getElementById('contacts-list');
  container.innerHTML = '';
  const raw = localStorage.getItem('lastSessionPatient');
  if(!raw){ container.innerHTML = '<p>No hay datos de contacto guardados.</p>'; return; }
  const p = JSON.parse(raw);
  container.innerHTML = `
    <div class="contact-card">
      <p><strong>Nombre:</strong> ${p.nombre || ''} ${p.apellido || ''}</p>
      <p><strong>Edad:</strong> ${p.edad || ''}</p>
      <p><strong>Ciudad:</strong> ${p.ciudad || ''}</p>
      <p><strong>Enfermedad:</strong> ${p.enfermedad || ''}</p>
      <p><strong>Contacto:</strong> ${p.contacto || ''}</p>
      <p><strong>Documento:</strong> ${p.tipoDocumento || ''} ${p.numeroDocumento || ''}</p>
    </div>
  `;
}

$all('button[data-action="guest"]').forEach(btn=>btn.addEventListener('click', ()=>{
  // demo guest -> patient view with sample name
  state.role = 'paciente'; state.name='María';
  setupPatient();
  show('patient');
  // asegurar que el chat esté cerrado al entrar como invitado
  if(typeof closeChat === 'function') closeChat();
  toast('Entrando en modo demostración...');
}));

// Hero continue button: just go to home (second menu)
const heroContinue = document.getElementById('btn-continue');
if(heroContinue){ heroContinue.addEventListener('click', ()=>{ show('home'); }); }

// Back buttons
$all('button[data-action="back"]').forEach(b=>b.addEventListener('click', ()=>show('home')));
$all('button[data-action="back-to"]').forEach(b=>b.addEventListener('click', e=>{
  const target = e.currentTarget.dataset.target || 'home'; show(target);
}));

// Unified login handler removed — using separate handlers for patient and nurse now.

// Setup nurse panel with nurse-specific data (no patient fields)
function setupNurse(username){
  try{
    // show name in header
    const title = $('#nurse-title'); if(title) title.textContent = `Panel del Enfermero — ${username}`;
    // populate nurse list with registered patients
    const nurseList = document.getElementById('patient-list');
    if(!nurseList) return;
    const pacientes = readPatients();
    renderPatientList(pacientes);
    updateNurseStats(pacientes);
    // clear nurse detail area
    const dn = $('#detail-name'); if(dn) dn.textContent = 'Selecciona un paciente';
    const notes = $('#detail-notes'); if(notes) notes.textContent = 'Aquí aparecerán notas y recomendaciones del paciente.';
  }catch(e){ console.error('setupNurse error', e); }
}

function readPatients(){
  try{ return JSON.parse(localStorage.getItem('pacientes')) || []; }catch(e){ return []; }
}

function renderPatientList(patients){
  const list = document.getElementById('patient-list');
  list.innerHTML = '';
  if(!patients || patients.length === 0){ list.innerHTML = '<div>No hay pacientes registrados.</div>'; return; }
  patients.forEach((p, idx) => {
    const status = p.status || (idx % 3 === 0 ? 'green' : (idx % 3 === 1 ? 'yellow' : 'red'));
    const item = document.createElement('div');
    item.className = 'patient-item';
    item.dataset.id = idx; item.dataset.name = `${p.nombre} ${p.apellido}`; item.dataset.status = status;
    item.innerHTML = `<div class="pi-left"><strong>${p.nombre} ${p.apellido}</strong><small>${p.enfermedad || ''}</small></div>
      <div class="pi-right"><span class="status ${status}">${status==='green'?'Estable':status==='yellow'?'Observación':'Alerta'}</span></div>`;
    item.addEventListener('click', ()=> onSelectPatient(idx));
    list.appendChild(item);
  });
}

function updateNurseStats(patients){
  const totalEl = document.getElementById('count-total'); if(totalEl) totalEl.textContent = (patients||[]).length;
  const green = (patients||[]).filter((p,i)=> (p.status || (i%3===0?'green':i%3===1?'yellow':'red')) === 'green').length;
  const yellow = (patients||[]).filter((p,i)=> (p.status || (i%3===0?'green':i%3===1?'yellow':'red')) === 'yellow').length;
  const red = (patients||[]).filter((p,i)=> (p.status || (i%3===0?'green':i%3===1?'yellow':'red')) === 'red').length;
  const statEl = document.querySelector('.stat-card p:nth-child(2)');
  if(statEl) statEl.innerHTML = `<span class="status green inline">${green}</span> Estables • <span class="status yellow inline">${yellow}</span> Observación • <span class="status red inline">${red}</span> Alerta`;
}

function onSelectPatient(index){
  const patients = readPatients();
  const p = patients[index];
  if(!p) return;
  // populate detail pane
  $('#detail-name').textContent = `${p.nombre} ${p.apellido} • ${p.edad || ''} años`;
  $('#v-glu').textContent = p.vitals && p.vitals.glucose ? (p.vitals.glucose + ' mg/dL') : '-- mg/dL';
  $('#v-bp').textContent = p.vitals && p.vitals.bp ? p.vitals.bp : '-- / -- mmHg';
  $('#v-hr').textContent = p.vitals && p.vitals.hr ? (p.vitals.hr + ' bpm') : '-- bpm';
  $('#v-temp').textContent = p.vitals && p.vitals.temp ? (p.vitals.temp + ' °C') : '-- °C';
  $('#detail-meds').textContent = p.meds || p.medicacion || 'No registrada';
  $('#detail-allergies').textContent = p.allergies || '-';
  $('#detail-emergency').textContent = (p.emName ? `${p.emName} (${p.emPhone||''})` : '-');
  // history list
  const hist = $('#detail-history'); hist.innerHTML = '';
  const history = p.history || [];
  if(history.length === 0) hist.innerHTML = '<li>No hay visitas registradas</li>'; else history.forEach(h=>{ const li = document.createElement('li'); li.textContent = `${h.date} — ${h.summary}`; hist.appendChild(li); });
  // notes
  $('#detail-notes').textContent = p.notes || 'Sin notas recientes';
  // open nurse detail view if not visible (for smaller screens)
  show('nurse-panel');
}

// Logout
$all('button[data-action="logout"]').forEach(b=>b.addEventListener('click', ()=>{
  state.role=null; state.name=null; show('home'); toast('Sesión cerrada');
  if(typeof closeChat === 'function') closeChat();
  chatOpened = false;
}))

// Quick actions
$all('button[data-action="video"]').forEach(b=>b.addEventListener('click', ()=>{
  toast('Su enfermera se conectará en 5 minutos');
}));
$all('button[data-action="reminder"]').forEach(b=>b.addEventListener('click', ()=>{
  alert('Recordatorio: Tomar medicación a las 8:00 AM');
}));
$all('button[data-action="chat"]').forEach(b=>b.addEventListener('click', ()=>{
  openChat();
}));

// Delegated listener: abrir chat sólo cuando se hace click en un elemento con data-action="chat"
document.addEventListener('click', (e)=>{
  try{
    const el = e.target.closest && e.target.closest('[data-action="chat"]');
    if(el){ e.preventDefault(); openChat(); }
  }catch(err){ /* safe fallback for older browsers */ }
});
$all('button[data-action="view-education"]').forEach(b=>b.addEventListener('click', ()=>show('education')));

// Contact form
$('#contact-form').addEventListener('submit', (e)=>{e.preventDefault(); toast('Mensaje enviado (simulado)'); show('home');});

function setupPatient(){
  const name = state.name || 'Paciente';
    try{
      const raw = localStorage.getItem('lastSessionPatient') || localStorage.getItem('demoPatient');
      if(raw){
        const p = JSON.parse(raw);
        const fullName = `${p.nombre || p.name || ''} ${p.apellido || ''}`.trim();
        const age = p.edad || (p.dob ? calculateAge(p.dob) : null);
        const ageTxt = age ? ` — ${age} años` : '';
        const greet = `Hola, ${fullName}${ageTxt}. Tu enfermera es Ana Pérez`;
        const el = document.getElementById('patient-greet'); if(el) el.textContent = greet;
        const at = document.getElementById('alert-text'); if(at) at.textContent = 'Recuerda medir tu glucosa hoy a las 8 a.m.';
        const mt = document.getElementById('message-text'); if(mt) mt.textContent = 'Tu enfermera ha revisado tus signos y te felicita por tu control.';
      }
    }catch(e){ console.error('setupPatient', e); }
    populatePatientMeta();
}

// Avatar modal open on click
document.addEventListener('click', (e)=>{
  const av = e.target.closest && e.target.closest('#patient-avatar');
  if(av && av.querySelector && av.querySelector('img')){
    const src = av.querySelector('img').getAttribute('src');
    const af = $('#avatar-frame'); af.innerHTML = `<img src="${src}" alt="avatar grande"/>`;
    const am = $('#avatar-modal'); am.classList.remove('hidden'); am.setAttribute('aria-hidden','false');
  }
  if(e.target && e.target.matches && e.target.matches('#avatar-modal .video-modal-close')){
    const am = $('#avatar-modal'); am.classList.add('hidden'); am.setAttribute('aria-hidden','true'); $('#avatar-frame').innerHTML='';
  }
  if(e.target && e.target.closest && e.target.closest('#avatar-modal .video-modal-backdrop')){
    const am = $('#avatar-modal'); am.classList.add('hidden'); am.setAttribute('aria-hidden','true'); $('#avatar-frame').innerHTML='';
  }
});

// Populate patient meta (avatar, meds, IMC) if available
function populatePatientMeta(){
  try{
    const raw = localStorage.getItem('lastSessionPatient') || localStorage.getItem('demoPatient');
    if(!raw) return;
    const p = JSON.parse(raw);
    if(p.avatar){ const av = $('#patient-avatar'); av.innerHTML = `<img src="${p.avatar}" alt="avatar"/>`; }
    if(p.meds){ $('#patient-meds').textContent = p.meds; }
    // load last IMC
    const imcRaw = localStorage.getItem('lastIMC');
    if(imcRaw){ const im = JSON.parse(imcRaw); $('#patient-imc-summary').textContent = `Último IMC: ${im.imc} (${im.category}). Peso ideal: ${im.minW}-${im.maxW} kg.`; }
  }catch(e){ console.error('populatePatientMeta', e); }
}

// Initial view
show('home');

// --- Nurse panel interactions ---
function initNursePanel(){
  const search = $('#patient-search');
  const filters = $all('.filter-btn');
  const items = Array.from($all('.patient-item'));

  if(search){
    search.addEventListener('input', ()=>{
      const q = search.value.toLowerCase();
      items.forEach(it=>{
        const name = it.dataset.name.toLowerCase();
        it.style.display = name.includes(q) ? '' : 'none';
      });
    });
  }

  filters.forEach(f=>f.addEventListener('click', (e)=>{
    filters.forEach(x=>x.classList.remove('active'));
    e.currentTarget.classList.add('active');
    const filter = e.currentTarget.dataset.filter;
    items.forEach(it=>{
      const st = it.dataset.status;
      it.style.display = (filter==='all' || st===filter) ? '' : 'none';
    });
  }));

  items.forEach(it=>it.addEventListener('click', ()=>{
    const id = it.dataset.id; selectPatient(id);
  }));
}

function selectPatient(id){
  // query DOM elements directly (avoid referencing variables that may be in TDZ)
  const cw = document.getElementById('chat-widget');
  const ci = document.getElementById('chat-input');
  if(!cw) return;
  // only open if hidden (avoid reopening)
  if(!cw.classList.contains('hidden')) return;
  cw.classList.remove('hidden');
  cw.style.display = 'flex';
  setTimeout(()=>cw.classList.add('open'), 10);
  cw.setAttribute('aria-hidden','false');
  if(!chatOpened){
    addBotMessage('Hola 👋, soy tu enfermera virtual de demostración. ¿En qué puedo ayudarte hoy?');
    chatOpened = true;
  }
  if(ci) ci.focus();
}

// Mostrar campo 'Especifique' si la condición es 'Otra'
const conditionSelect = $('#condition');
if(conditionSelect){
  conditionSelect.addEventListener('change', (e)=>{
    const other = $('#other-condition');
    if(e.target.value === 'Otra') other.classList.remove('hidden'); else other.classList.add('hidden');
  });
}

// ------ Expanded patient form logic ------
const loginForm = $('#login-form');
const avatarInput = $('#avatar');
const avatarPreview = $('#avatar-preview');
const saveDemoBtn = $('#save-demo');
const loadDemoBtn = $('#load-demo');
const editProfileBtn = $('#edit-profile');
const dobField = $('#dob');

// live age display next to DOB
function updateDobAge(){
  const el = document.querySelector('.dob-age');
  if(!dobField) return;
  const val = dobField.value;
  const age = calculateAge(val);
  if(!el){
    const label = dobField.parentNode;
    const span = document.createElement('span'); span.className='dob-age'; span.textContent = age !== null ? `${age} años` : '';
    label.appendChild(span);
  } else { el.textContent = age !== null ? `${age} años` : ''; }
}
if(dobField) dobField.addEventListener('change', updateDobAge);

function calculateAge(dob){
  if(!dob) return null;
  const b = new Date(dob); const diff = Date.now() - b.getTime(); const ageDt = new Date(diff); return Math.abs(ageDt.getUTCFullYear() - 1970);
}

if(avatarInput){
  avatarInput.addEventListener('change', (e)=>{
    const f = e.target.files && e.target.files[0];
    if(!f) { avatarPreview.innerHTML=''; return; }
    if(f.size > 2_000_000){ alert('La imagen es muy grande (máx 2MB)'); avatarInput.value=''; return; }
    const reader = new FileReader();
    reader.onload = ()=>{ avatarPreview.innerHTML = `<img src="${reader.result}" alt="avatar"/>`; avatarPreview.dataset.url = reader.result; };
    reader.readAsDataURL(f);
  });
}

function collectFormData(){
  return {
    name: $('#name').value || '',
    dob: $('#dob').value || '',
    email: $('#email').value || '',
    phone: $('#phone').value || '',
    condition: $('#condition').value || '',
    otherCondition: $('#other-input').value || '',
    meds: $('#meds').value || '',
    allergies: $('#allergies').value || '',
    emName: $('#em-name').value || '',
    emPhone: $('#em-phone').value || '',
    address: $('#address').value || '',
    contactPref: $('#contact-pref').value || '',
    lang: $('#lang').value || '',
    consent: !!$('#consent').checked,
    avatar: avatarPreview && avatarPreview.dataset && avatarPreview.dataset.url ? avatarPreview.dataset.url : null
  };
}

function validateForm(data){
  if(!data.name) return 'Por favor ingrese el nombre.';
  if(!data.dob) return 'Por favor ingrese la fecha de nacimiento.';
  if(new Date(data.dob) > new Date()) return 'La fecha de nacimiento no puede estar en el futuro.';
  if(!data.email || !/\S+@\S+\.\S+/.test(data.email)) return 'Por favor ingrese un correo válido.';
  if(!data.consent) return 'Debe aceptar el consentimiento para continuar.';
  if($('#password').value !== $('#password2').value) return 'Las contraseñas no coinciden.';
  if($('#password').value.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  return null;
}

if(saveDemoBtn) saveDemoBtn.addEventListener('click', ()=>{
  const data = collectFormData();
  try{
    const exists = !!localStorage.getItem('demoPatient');
    if(exists){
      const ok = confirm('Ya existen datos guardados de demo. ¿Deseas sobrescribirlos?');
      if(!ok){ toast('Guardado cancelado'); return; }
    }
    localStorage.setItem('demoPatient', JSON.stringify(data));
    toast('Datos guardados en localStorage (demo)');
  }catch(e){ console.error(e); toast('Error guardando datos'); }
});

if(loadDemoBtn) loadDemoBtn.addEventListener('click', ()=>{
  const raw = localStorage.getItem('demoPatient');
  if(!raw){ toast('No hay datos de demo guardados'); return; }
  const d = JSON.parse(raw);
  // fill fields
  $('#name').value = d.name || '';
  $('#dob').value = d.dob || '';
  $('#email').value = d.email || '';
  $('#phone').value = d.phone || '';
  $('#condition').value = d.condition || '';
  if(d.condition === 'Otra') $('#other-condition').classList.remove('hidden'); else $('#other-condition').classList.add('hidden');
  $('#other-input').value = d.otherCondition || '';
  $('#meds').value = d.meds || '';
  $('#allergies').value = d.allergies || '';
  $('#em-name').value = d.emName || '';
  $('#em-phone').value = d.emPhone || '';
  $('#address').value = d.address || '';
  $('#contact-pref').value = d.contactPref || '';
  $('#lang').value = d.lang || '';
  if(d.avatar){ avatarPreview.innerHTML = `<img src="${d.avatar}" alt="avatar"/>`; avatarPreview.dataset.url = d.avatar; }
  toast('Datos de demo cargados');
});

if(loginForm){
  loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = collectFormData();
    const err = validateForm(data);
    if(err){ alert(err); return; }
    // save patient to state and navigate
    state.role = 'paciente'; state.name = data.name || 'Paciente';
    // persist demo to localStorage user copy
    localStorage.setItem('lastSessionPatient', JSON.stringify(data));
    setupPatient();
    show('patient');
    toast(`Bienvenida, ${state.name}`);
  });
}

// Edit profile button: load lastSessionPatient/demoPatient into form and open login view
if(editProfileBtn){
  editProfileBtn.addEventListener('click', ()=>{
    // If a nurse is logged, don't load patient profile into the patient form
    if(state.role === 'enfermero'){ toast('Estás en modo enfermero. Selecciona un paciente para ver o editar su información.'); show('nurse'); return; }
    const raw = localStorage.getItem('lastSessionPatient') || localStorage.getItem('demoPatient');
    if(!raw){ toast('No hay perfil guardado para editar'); return; }
    const p = JSON.parse(raw);
    // populate form (reuse load logic)
    $('#name').value = p.name || '';
    $('#dob').value = p.dob || ''; updateDobAge();
    $('#email').value = p.email || '';
    $('#phone').value = p.phone || '';
    $('#condition').value = p.condition || ''; if(p.condition==='Otra') $('#other-condition').classList.remove('hidden');
    $('#other-input').value = p.otherCondition || '';
    $('#meds').value = p.meds || '';
    $('#allergies').value = p.allergies || '';
    $('#em-name').value = p.emName || '';
    $('#em-phone').value = p.emPhone || '';
    $('#address').value = p.address || '';
    $('#contact-pref').value = p.contactPref || '';
    $('#lang').value = p.lang || '';
    if(p.avatar){ avatarPreview.innerHTML = `<img src="${p.avatar}" alt="avatar"/>`; avatarPreview.dataset.url = p.avatar; }
    show('login');
    toast('Perfil cargado para edición');
  });
}

// Chat widget logic
const chatWidget = $('#chat-widget');
const chatMessages = $('#chat-messages');
const chatForm = $('#chat-form');
const chatInput = $('#chat-input');
let chatOpened = false; // bandera para evitar mensajes de bienvenida duplicados

// Asegurar estado inicial: oculto y sin mensajes de bienvenida añadidos
if(chatWidget){
  chatWidget.classList.add('hidden');
  chatWidget.setAttribute('aria-hidden','true');
  chatOpened = false;
}

function openChat(){
  // query DOM directly to avoid TDZ on lexical bindings
  const cw = document.getElementById('chat-widget');
  const ci = document.getElementById('chat-input');
  if(!cw) return;
  if(!cw.classList.contains('hidden')) return;
  cw.classList.remove('hidden');
  cw.style.display = 'flex';
  setTimeout(()=>cw.classList.add('open'), 10);
  cw.setAttribute('aria-hidden','false');
  if(!chatOpened){ addBotMessage('Hola 👋, soy tu enfermera virtual de demostración. ¿En qué puedo ayudarte hoy?'); chatOpened = true; }
  if(ci) ci.focus();
}

function closeChat(){
  const cw = document.getElementById('chat-widget');
  if(!cw) return;
  cw.classList.remove('open');
  cw.setAttribute('aria-hidden','true');
  setTimeout(()=>{ cw.classList.add('hidden'); cw.style.display = 'none'; }, 180);
}

function addBotMessage(text){
  const cm = document.getElementById('chat-messages');
  if(!cm) return;
  const d = document.createElement('div'); d.className='msg bot'; d.textContent = text; cm.appendChild(d); cm.scrollTop = cm.scrollHeight;
}
function addUserMessage(text){
  const cm = document.getElementById('chat-messages');
  if(!cm) return;
  const d = document.createElement('div'); d.className='msg user'; d.textContent = text; cm.appendChild(d); cm.scrollTop = cm.scrollHeight;
}

// close button
document.addEventListener('click', (e)=>{
  if(e.target.classList && e.target.classList.contains('chat-close')) closeChat();
});

if(chatForm){
  chatForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const txt = chatInput.value.trim();
    if(!txt) return;
    addUserMessage(txt);
    chatInput.value='';
    setTimeout(()=>{
      addBotMessage('Gracias por tu mensaje. En la demo, tu enfermera respondería aquí.');
    },800);
  });
}

// Also allow opening chat from patient quick-actions if already on patient view
// (some buttons call openChat directly)

// --- Video thumbnails and modal player ---
const videoModal = $('#video-modal');
const videoFrame = $('#video-frame');
const videoFallback = $('#video-fallback');
const videoOpenLink = $('#video-open-link');

function makeEmbedUrlFromLink(link){
  // try to extract mid query param and create bing embed URL
  try{
    const u = new URL(link);
    // if path contains /videos/embed already, return as-is
    if(u.pathname && u.pathname.includes('/videos/embed')) return link;
    const mid = u.searchParams.get('mid');
    if(mid) return `https://www.bing.com/videos/embed?mid=${mid}`;
    // fallback: try to use the original link
    return link;
  }catch(e){ return link; }
}

function openVideoModal(url, fallback){
  if(!videoModal) return;
  // construct embed URL when possible
  const embed = makeEmbedUrlFromLink(url);
  // remove any previous iframe
  videoFrame.innerHTML = '';
  videoFallback.style.display = 'none';
  videoOpenLink.href = fallback || url;
  // create iframe
  const ifr = document.createElement('iframe');
  ifr.setAttribute('src', embed);
  ifr.setAttribute('allowfullscreen','');
  ifr.setAttribute('sandbox','allow-same-origin allow-scripts allow-popups');
  videoFrame.appendChild(ifr);
  // show modal
  videoModal.classList.remove('hidden');
  videoModal.setAttribute('aria-hidden','false');
  // If embed equals original (likely not embeddable) show fallback link to open in new tab
  if(embed === url) videoFallback.style.display = '';
}

function closeVideoModal(){
  if(!videoModal) return;
  videoModal.classList.add('hidden');
  videoModal.setAttribute('aria-hidden','true');
  // remove iframe to stop playback
  videoFrame.innerHTML = '';
}

// click on thumbnail
document.addEventListener('click', (e)=>{
  const thumb = e.target.closest && e.target.closest('.video-thumb');
  if(thumb){
      // refresh nurse list from stored patients (keeps consistent behavior)
      const patients = readPatients();
      renderPatientList(patients);
      updateNurseStats(patients);
      if(imcMessage) { imcMessage.textContent='Introduce tus datos para calcular'; imcMessage.className='imc-message'; }
  }

// Nurse login handling -> open nurse-panel dashboard
const nurseLoginForm = document.getElementById('nurse-login-form');
if(nurseLoginForm){
  nurseLoginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = document.getElementById('nurse-email').value.trim();
    const pass = document.getElementById('nurse-password').value;
    if(!email || !pass){ toast('Ingrese correo y clave'); return; }
    const apiLogin = 'http://localhost:4000/api/nurse/login';
    fetch(apiLogin, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password: pass }) })
      .then(r=>{ if(!r.ok) throw new Error('server'); return r.json(); })
      .then(js=>{
        state.role = 'enfermero'; state.name = js.nurse.email.split('@')[0];
        // fetch patients
        return fetch('http://localhost:4000/api/patients', { headers: { 'Authorization': 'Bearer '+js.token } }).then(r=>{ if(!r.ok) throw new Error('server'); return r.json(); });
      }).then(data=>{
        // populate nurse-panel with server data
        localStorage.setItem('pacientes', JSON.stringify(data.patients));
        setupNurse(state.name);
        show('nurse-panel');
        toast('Bienvenido, enfermero ' + state.name);
      }).catch(err=>{
        // fallback: localStorage
        state.role = 'enfermero'; state.name = email.split('@')[0];
        setupNurse(state.name);
        show('nurse-panel');
        toast('Bienvenido, enfermero ' + state.name + ' (offline)');
      });
  });
}

  function computeIMC(){
    console.log('computeIMC() called');
    if(!inputWeight || !inputHeight){ console.error('IMC inputs not found', inputWeight, inputHeight); toast('Error: campos de IMC no disponibles'); return; }
    const w = parseFloat(inputWeight.value);
    const hcm = parseFloat(inputHeight.value);
    console.log('IMC inputs:', {weight: inputWeight.value, height: inputHeight.value});
    if(!w || !hcm || isNaN(w) || isNaN(hcm) || hcm <= 0){ resetIMC(); toast('Introduce peso y estatura válidos antes de calcular'); return; }
    const hm = hcm/100;
    const imc = +(w / (hm*hm)).toFixed(1);
    if(imcValueEl) imcValueEl.textContent = imc;
    const minW = Math.round(18.5 * hm * hm);
    const maxW = Math.round(24.9 * hm * hm);
    if(imcIdealEl) imcIdealEl.textContent = `${minW} - ${maxW} kg`;
    const min = 10, max = 40; const pct = Math.max(0, Math.min(100, (imc - min) / (max - min) * 100));
    if(imcBarFill) imcBarFill.style.width = pct + '%';
    if(imcMarker) imcMarker.style.left = pct + '%';
    let cat='';
    if(imc < 18.5) { cat='Bajo peso'; if(imcMessage) imcMessage.className='imc-message imc-warning'; }
    else if(imc < 25) { cat='Normal'; if(imcMessage) imcMessage.className='imc-message imc-good'; }
    else { cat='Sobrepeso / Obesidad'; if(imcMessage) imcMessage.className='imc-message imc-bad'; }
    if(imcMessage) imcMessage.textContent = `${cat} — tu IMC es ${imc}. Rango ideal: ${minW}-${maxW} kg.`;
    // save last IMC in localStorage for profile
    try{
      const payload = { imc, minW, maxW, category: cat, date: (new Date()).toISOString() };
      localStorage.setItem('lastIMC', JSON.stringify(payload));
      console.log('IMC result saved', payload);
    }catch(e){ /* ignore */ }
  }
  if(inputWeight) inputWeight.addEventListener('input', computeIMC);
  if(inputHeight) inputHeight.addEventListener('input', computeIMC);
  // Button to explicitly calculate IMC
  const imcCalcBtn = $('#imc-calc');
  if(imcCalcBtn) imcCalcBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    // small press animation
    imcCalcBtn.classList.add('pressed');
    setTimeout(()=>imcCalcBtn.classList.remove('pressed'), 220);
    computeIMC();
    // feedback
    try{ toast('IMC calculado'); }catch(e){}
  });
})();
