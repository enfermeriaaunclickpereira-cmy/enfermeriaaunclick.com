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

// Login form
$('#login-form').addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = $('#name').value || 'Paciente';
  state.name = name;
  if(state.role === 'enfermero'){
    show('nurse');
    // asegurar que el chat no se abra automáticamente cuando se loguea un enfermero
    if(typeof closeChat === 'function') closeChat();
    toast('Bienvenido, enfermero');
  } else {
    setupPatient();
    show('patient');
    // asegurar que el chat no se abra automáticamente al iniciar sesión como paciente
    if(typeof closeChat === 'function') closeChat();
    toast(`Bienvenida, ${name}`);
  }
});

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
  const it = $(`.patient-item[data-id="${id}"]`);
  if(!it) return;
  const name = it.dataset.name;
  $('#detail-name').textContent = name;
  // valores simulados
  $('#v-glu').textContent = Math.floor(80 + Math.random()*80) + ' mg/dL';
  $('#v-bp').textContent = `${110+Math.floor(Math.random()*30)}/${70+Math.floor(Math.random()*10)}`;
  $('#v-hr').textContent = 60+Math.floor(Math.random()*30) + ' bpm';
  $('#detail-notes').textContent = `Notas simuladas para ${name}: observar signos vitales y revisar medicación.`;
  // permitir acciones con contexto
  $('#nurse-chat').onclick = ()=>{ openChat(); setTimeout(()=>addBotMessage('Abriendo chat con '+name+'...'),400); };
  $('#nurse-call').onclick = ()=>{ toast('Iniciando videollamada con '+name+' (simulado)'); };
  $('#nurse-alert').onclick = ()=>{ toast('Alerta añadida para '+name); };
}

// Inicializar panel cuando se muestra
document.addEventListener('click', (e)=>{
  // si se muestra la vista nurse, inicializamos
  if(e.target && e.target.matches && (e.target.matches('[data-action="login"]') || e.target.matches('button[data-action="guest"]'))){
    // nothing here
  }
});

// Ejecutar initNursePanel la primera vez que se entre al panel
let nurseInited = false;
const origShow = show;
function show(viewId){
  $all('.view').forEach(v=>v.classList.add('hidden'));
  const v = $(`#${viewId}`);
  if(v) v.classList.remove('hidden');
  if(typeof closeChat === 'function') closeChat();
  if(viewId==='nurse' && !nurseInited){ initNursePanel(); nurseInited=true; }
  // control visibility of Edit Profile button: only show on patient view when logged as paciente
  try{
    const ep = $('#edit-profile');
    if(ep){
      if(viewId === 'patient' && state.role === 'paciente') ep.style.display = '';
      else ep.style.display = 'none';
    }
  }catch(e){}
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
  if(!chatWidget) return;
  // solo abrir si está oculto (evita reabrir si ya está visible)
  if(!chatWidget.classList.contains('hidden')) return;
  // asegurar visibilidad y animación
  chatWidget.classList.remove('hidden');
  chatWidget.style.display = 'flex';
  // small animation class
  setTimeout(()=>chatWidget.classList.add('open'), 10);
  chatWidget.setAttribute('aria-hidden','false');
  // welcome message solo la primera vez por sesión
  if(!chatOpened){
    addBotMessage('Hola 👋, soy tu enfermera virtual de demostración. ¿En qué puedo ayudarte hoy?');
    chatOpened = true;
  }
  // focus input
  if(chatInput) chatInput.focus();
}

function closeChat(){
  if(!chatWidget) return;
  // reverse animation then hide
  chatWidget.classList.remove('open');
  chatWidget.setAttribute('aria-hidden','true');
  setTimeout(()=>{
    chatWidget.classList.add('hidden');
    chatWidget.style.display = 'none';
  }, 180);
}

function addBotMessage(text){
  if(!chatMessages) return;
  const d = document.createElement('div'); d.className='msg bot'; d.textContent = text; chatMessages.appendChild(d); chatMessages.scrollTop = chatMessages.scrollHeight;
}
function addUserMessage(text){
  if(!chatMessages) return;
  const d = document.createElement('div'); d.className='msg user'; d.textContent = text; chatMessages.appendChild(d); chatMessages.scrollTop = chatMessages.scrollHeight;
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
    const w = inputWeight ? parseFloat(inputWeight.value) : NaN;
    const hcm = inputHeight ? parseFloat(inputHeight.value) : NaN;
    if(!w || !hcm || hcm <= 0){ resetIMC(); return; }
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
