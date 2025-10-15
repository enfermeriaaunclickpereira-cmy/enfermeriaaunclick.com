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
  $('#patient-greet').textContent = `Hola, ${name}, tu enfermera es Ana Pérez`;
  $('#alert-text').textContent = 'Recuerda medir tu glucosa hoy a las 8 a.m.';
  $('#message-text').textContent = 'Tu enfermera ha revisado tus signos y te felicita por tu control.';
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
}

// Mostrar campo 'Especifique' si la condición es 'Otra'
const conditionSelect = $('#condition');
if(conditionSelect){
  conditionSelect.addEventListener('change', (e)=>{
    const other = $('#other-condition');
    if(e.target.value === 'Otra') other.classList.remove('hidden'); else other.classList.add('hidden');
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
