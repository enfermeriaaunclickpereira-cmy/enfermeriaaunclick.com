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
    $('#login-title').textContent = role === 'enfermero' ? 'Login Enfermero' : 'Registro / Login Paciente';
    // Prepare form fields depending on role
    if(role === 'enfermero'){
      // hide and disable patient-only fields to avoid browser validation errors
      const patientSelectors = ['#name','#dob','#phone','#meds','#allergies','#em-name','#em-phone','#address','#condition','#other-condition','#other-input','#contact-pref','#lang','.avatar-label','.consent','#password2'];
      patientSelectors.forEach(sel=>{
        const el = document.querySelector(sel);
        if(!el) return;
        // hide label or element
        if(el.closest && el.closest('label')) el.closest('label').classList.add('hidden'); else el.classList.add('hidden');
        // disable actual input(s) inside (if any) so form validation ignores them
        const inputs = el.querySelectorAll ? Array.from(el.querySelectorAll('input,select,textarea')) : [];
        if(inputs.length === 0){ if(['INPUT','SELECT','TEXTAREA'].includes(el.tagName)) inputs.push(el); }
        inputs.forEach(i=>{ try{ i.disabled = true; i.removeAttribute('required'); }catch(e){} });
      });
      // ensure email/password enabled and required for enfermero
      const emailEl = $('#email'); const passEl = $('#password');
      if(emailEl){ emailEl.disabled = false; emailEl.required = true; }
      if(passEl){ passEl.disabled = false; passEl.required = true; }
    } else {
      // show all fields for paciente
      const patientSelectors = ['#name','#dob','#phone','#meds','#allergies','#em-name','#em-phone','#address','#condition','#other-condition','#other-input','#contact-pref','#lang','.avatar-label','.consent','#password2'];
      patientSelectors.forEach(sel=>{
        const el = document.querySelector(sel);
        if(!el) return;
        if(el.closest && el.closest('label')) el.closest('label').classList.remove('hidden'); else el.classList.remove('hidden');
        const inputs = el.querySelectorAll ? Array.from(el.querySelectorAll('input,select,textarea')) : [];
        if(inputs.length === 0){ if(['INPUT','SELECT','TEXTAREA'].includes(el.tagName)) inputs.push(el); }
        inputs.forEach(i=>{ try{ i.disabled = false; }catch(e){} });
      });
      // ensure proper required flags for paciente
      const emailEl = $('#email'); const passEl = $('#password'); const pass2El = $('#password2'); const consentEl = $('#consent');
      if(emailEl) emailEl.required = true;
      if(passEl) passEl.required = true;
      if(pass2El) pass2El.required = true;
      if(consentEl) consentEl.required = true;
    }
    show('login');
  })
});

$all('button[data-action="guest"]').forEach(btn=>btn.addEventListener('click', ()=>{
  // demo guest -> patient view with sample name
  state.role = 'paciente'; state.name='María';
  setupPatient();
  show('patient');
  // asegurar que el chat esté cerrado al entrar como invitado
  if(typeof closeChat === 'function') closeChat();
  toast('Entrando en modo demostración...');
}));

// Back buttons
$all('button[data-action="back"]').forEach(b=>b.addEventListener('click', ()=>show('home')));
$all('button[data-action="back-to"]').forEach(b=>b.addEventListener('click', e=>{
  const target = e.currentTarget.dataset.target || 'home'; show(target);
}));

// Login form - unified handler for paciente and enfermero
if($('#login-form')){
  $('#login-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    // Enfermero: only email + password
    if(state.role === 'enfermero'){
      const email = $('#email').value || '';
      const pass = $('#password').value || '';
      if(!email || !/\S+@\S+\.\S+/.test(email)){ alert('Ingrese un correo válido'); return; }
      if(!pass || pass.length < 4){ alert('Ingrese la contraseña (mínimo 4 caracteres)'); return; }
      // Simular autenticación
      state.role = 'enfermero'; state.name = email.split('@')[0];
      // cargar datos específicos de enfermero
      setupNurse(state.name);
      show('nurse');
      if(typeof closeChat === 'function') closeChat();
      toast('Bienvenido, enfermero ' + state.name);
      return;
    }
    // Paciente flow
    const data = collectFormData();
    const err = validateForm(data);
    if(err){ alert(err); return; }
    state.role = 'paciente'; state.name = data.name || 'Paciente';
    localStorage.setItem('lastSessionPatient', JSON.stringify(data));
    setupPatient();
    show('patient');
    if(typeof closeChat === 'function') closeChat();
    toast(`Bienvenida, ${state.name}`);
  });
}

// Setup nurse panel with nurse-specific data (no patient fields)
function setupNurse(username){
  try{
    // show name in header
    const title = $('#nurse-title'); if(title) title.textContent = `Panel del Enfermero — ${username}`;
    // populate stats: use existing patient items to count
    const items = Array.from($all('.patient-item'));
    $('#count-total').textContent = items.length;
    const red = items.filter(i=>i.dataset.status==='red').length;
    const yellow = items.filter(i=>i.dataset.status==='yellow').length;
    const green = items.filter(i=>i.dataset.status==='green').length;
    // update inline counts
    const statEl = $('#count-total'); if(statEl) statEl.textContent = items.length;
    const statText = document.querySelector('.stat-card p:nth-child(2)'); if(statText) statText.innerHTML = `<span class="status green inline">${green}</span> Estables • <span class="status yellow inline">${yellow}</span> Observación • <span class="status red inline">${red}</span> Alerta`;
    // populate schedule (basic demo)
    const sched = document.querySelector('.schedule-card ul'); if(sched){ sched.innerHTML = `<li>09:00 - Visita a María</li><li>11:00 - Llamada con Juan</li><li>15:00 - Revisión de Ana</li>`; }
    // clear nurse detail area
    const dn = $('#detail-name'); if(dn) dn.textContent = 'Selecciona un paciente';
    const notes = $('#detail-notes'); if(notes) notes.textContent = 'Aquí aparecerán notas y recomendaciones del paciente.';
  }catch(e){ console.error('setupNurse error', e); }
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
  // compute age if available in stored profile
  let ageTxt = '';
  try{
    const raw = localStorage.getItem('lastSessionPatient') || localStorage.getItem('demoPatient');
    if(raw){ const p = JSON.parse(raw); if(p.dob){ const age = calculateAge(p.dob); if(age !== null) ageTxt = ` — ${age} años`; }}
  }catch(e){}
  $('#patient-greet').textContent = `Hola, ${name}${ageTxt}, tu enfermera es Ana Pérez`;
  $('#alert-text').textContent = 'Recuerda medir tu glucosa hoy a las 8 a.m.';
  $('#message-text').textContent = 'Tu enfermera ha revisado tus signos y te felicita por tu control.';
  // populate meta (avatar, meds, imc)
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
    const url = thumb.dataset.videoUrl;
    const fb = thumb.dataset.videoFallback || url;
    openVideoModal(url, fb);
  }
  if(e.target && e.target.matches && e.target.matches('.video-modal-close')) closeVideoModal();
  if(e.target && e.target.closest && e.target.closest('.video-modal-backdrop')) closeVideoModal();
});

// ------ IMC / BMI Calculator Logic ------
(() => {
  const inputWeight = $('#imc-weight');
  const inputHeight = $('#imc-height');
  const imcValueEl = $('#imc-value');
  const imcIdealEl = $('#imc-ideal');
  const imcBarFill = $('#imc-bar-fill');
  const imcMarker = $('#imc-marker');
  const imcMessage = $('#imc-message');

  function resetIMC(){
    if(imcValueEl) imcValueEl.textContent='--';
    if(imcIdealEl) imcIdealEl.textContent='--';
    if(imcBarFill) imcBarFill.style.width='0%';
    if(imcMarker) imcMarker.style.left='0%';
    if(imcMessage) { imcMessage.textContent='Introduce tus datos para calcular'; imcMessage.className='imc-message'; }
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
