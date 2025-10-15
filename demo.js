// Demo JS para navegación simple entre vistas
const state = {role:null, name:null};

function $(s){return document.querySelector(s)}
function $all(s){return document.querySelectorAll(s)}

function show(viewId){
  $all('.view').forEach(v=>v.classList.add('hidden'));
  const v = $(`#${viewId}`);
  if(v) v.classList.remove('hidden');
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
    toast('Bienvenido, enfermero');
  } else {
    setupPatient();
    show('patient');
    toast(`Bienvenida, ${name}`);
  }
});

// Logout
$all('button[data-action="logout"]').forEach(b=>b.addEventListener('click', ()=>{state.role=null; state.name=null; show('home'); toast('Sesión cerrada');}))

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

function openChat(){
  if(!chatWidget) return;
  chatWidget.classList.remove('hidden');
  chatWidget.setAttribute('aria-hidden','false');
  // welcome message
  addBotMessage('Hola 👋, soy tu enfermera virtual de demostración. ¿En qué puedo ayudarte hoy?');
}

function closeChat(){
  if(!chatWidget) return;
  chatWidget.classList.add('hidden');
  chatWidget.setAttribute('aria-hidden','true');
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
