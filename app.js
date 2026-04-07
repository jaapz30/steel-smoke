// ═══════════════════════════════════════════════════════════
//  STEEL & SMOKE — app.js v2
// ═══════════════════════════════════════════════════════════
'use strict';

// ── SERVICE WORKER ──────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// ── DATABASE ────────────────────────────────────────────────
const db = new Dexie('SteelSmoke');
db.version(1).stores({
  settings:'key', weights:'++id,date', meals:'++id,date',
  trainings:'++id,date', gpsRoutes:'++id,date', foodLog:'++id,date'
});
db.version(2).stores({
  settings:'key', weights:'++id,date', meals:'++id,date',
  trainings:'++id,date', gpsRoutes:'++id,date', foodLog:'++id,date',
  customSports:'++id', customMenus:'++id'
});

// ── FOOD DATABASE ────────────────────────────────────────────
const FOODS = [
  {id:'kwark',      emoji:'🥛',name:'Magere Kwark',     kcal:57,  protein:10, carbs:4,  fat:0.2},
  {id:'kip',        emoji:'🍗',name:'Kipfilet',          kcal:165, protein:31, carbs:0,  fat:3.6},
  {id:'havermout',  emoji:'🌾',name:'Havermout',          kcal:389, protein:17, carbs:66, fat:7},
  {id:'broccoli',   emoji:'🥦',name:'Broccoli',           kcal:34,  protein:3,  carbs:7,  fat:0.4},
  {id:'ei',         emoji:'🥚',name:'Eieren',             kcal:155, protein:13, carbs:1,  fat:11},
  {id:'zalm',       emoji:'🐟',name:'Zalm',               kcal:208, protein:20, carbs:0,  fat:13},
  {id:'banaan',     emoji:'🍌',name:'Banaan',             kcal:89,  protein:1,  carbs:23, fat:0.3},
  {id:'appel',      emoji:'🍎',name:'Appel',              kcal:52,  protein:0.3,carbs:14, fat:0.2},
  {id:'rijst',      emoji:'🍚',name:'Zilvervliesrijst',   kcal:130, protein:3,  carbs:28, fat:1},
  {id:'tonijn',     emoji:'🐠',name:'Tonijn (blik)',      kcal:116, protein:26, carbs:0,  fat:1},
  {id:'volkoren',   emoji:'🍞',name:'Volkoren Brood',     kcal:247, protein:9,  carbs:49, fat:3},
  {id:'pindakaas',  emoji:'🥜',name:'Pindakaas',          kcal:588, protein:25, carbs:20, fat:50},
  {id:'spinazie',   emoji:'🥬',name:'Spinazie',           kcal:23,  protein:3,  carbs:4,  fat:0.4},
  {id:'komkommer',  emoji:'🥒',name:'Komkommer',          kcal:15,  protein:0.7,carbs:3,  fat:0.1},
  {id:'tomaatjes',  emoji:'🍅',name:'Tomaatjes',          kcal:18,  protein:0.9,carbs:4,  fat:0.2},
  {id:'griekseyo',  emoji:'🥣',name:'Griekse Yoghurt',    kcal:97,  protein:9,  carbs:4,  fat:5},
  {id:'cottage',    emoji:'🧀',name:'Cottage Cheese',     kcal:103, protein:11, carbs:3,  fat:5},
  {id:'edamame',    emoji:'🫘',name:'Edamame',            kcal:121, protein:11, carbs:9,  fat:5},
  {id:'cashews',    emoji:'🌰',name:'Cashewnoten (30g)',  kcal:163, protein:4,  carbs:9,  fat:13},
  {id:'roerei',     emoji:'🍳',name:'Roerei (2 ei)',      kcal:185, protein:12, carbs:2,  fat:14},
  {id:'proteinesha',emoji:'🥤',name:'Proteïneshake',      kcal:130, protein:25, carbs:5,  fat:2},
  {id:'mageremelk', emoji:'🥛',name:'Magere Melk',        kcal:35,  protein:3.5,carbs:5,  fat:0.1},
  {id:'kalkoen',    emoji:'🦃',name:'Kalkoenfilet',        kcal:157, protein:30, carbs:0,  fat:3},
  {id:'paprika',    emoji:'🫑',name:'Paprika',             kcal:31,  protein:1,  carbs:6,  fat:0.3},
  {id:'aardappel',  emoji:'🥔',name:'Gekookte Aardappel', kcal:86,  protein:2,  carbs:20, fat:0.1},
  {id:'kiwi',       emoji:'🥝',name:'Kiwi',               kcal:61,  protein:1,  carbs:15, fat:0.5},
  {id:'mager_rund', emoji:'🥩',name:'Mager Rundvlees',    kcal:215, protein:26, carbs:0,  fat:12},
  {id:'witte_bonen',emoji:'🫘',name:'Witte Bonen',        kcal:127, protein:9,  carbs:23, fat:0.5},
  {id:'hummus',     emoji:'🫙',name:'Hummus (50g)',        kcal:177, protein:5,  carbs:14, fat:11},
  {id:'avocado',    emoji:'🥑',name:'Avocado (½)',         kcal:120, protein:1.5,carbs:6,  fat:11},
  {id:'boter',      emoji:'🧈',name:'Boter (10g)',         kcal:74,  protein:0.1,carbs:0,  fat:8.3},
  {id:'kaas',       emoji:'🧀',name:'Kaas (20g)',          kcal:80,  protein:5,  carbs:0,  fat:6.5},
  {id:'jam',        emoji:'🍓',name:'Jam (15g)',           kcal:39,  protein:0.1,carbs:10, fat:0},
  {id:'hagelslag',  emoji:'🍫',name:'Hagelslag (15g)',     kcal:79,  protein:0.8,carbs:11, fat:3.5},
  {id:'honing',     emoji:'🍯',name:'Honing (10g)',        kcal:30,  protein:0,  carbs:8,  fat:0},
  {id:'melk',       emoji:'🥛',name:'Volle Melk (200ml)',  kcal:130, protein:6.4,carbs:9.4,fat:7.2},
  {id:'muesli',     emoji:'🌾',name:'Muesli (60g)',        kcal:218, protein:5,  carbs:39, fat:4},
];

const GYM_ACTIVITIES = [
  {id:'roeier',   emoji:'🚣',name:'Roeitrainer', met:7.0, desc:'Volledig lichaam'},
  {id:'loopband', emoji:'🏃',name:'Loopband',     met:8.5, desc:'Cardio boost'},
  {id:'gewichten',emoji:'🏋️',name:'Gewichten',    met:5.0, desc:'Kracht opbouw'},
  {id:'trap',     emoji:'🪜',name:'Trap',         met:8.0, desc:'HIIT-style'},
  {id:'fietsen',  emoji:'🚴',name:'Hometrainer',  met:6.8, desc:'Low-impact cardio'},
  {id:'zwemmen',  emoji:'🏊',name:'Zwemmen',      met:8.0, desc:'Volledig lichaam'},
];

const HEALTH_MILESTONES = [
  {minutes:20,     title:'Hartslag normaliseert',         desc:'Bloeddruk en hartslag dalen naar normaal.'},
  {minutes:480,    title:'CO vrij uit bloed',             desc:'Koolmonoxide volledig uit je bloedbaan.'},
  {minutes:1440,   title:'Hartaanval risico daalt',       desc:'24u: kans op hartaanval begint te dalen.'},
  {minutes:2880,   title:'Smaak & geur terug',            desc:'48u: zenuwuiteinden herstellen.'},
  {minutes:4320,   title:'Longen beginnen te reinigen',   desc:'72u: slijm en afvalstoffen afgevoerd.'},
  {minutes:10080,  title:'Conditie merkbaar beter',       desc:'1 week: lopen gaat makkelijker.'},
  {minutes:43200,  title:'Longfunctie +10%',              desc:'1 maand: longen functioneren significant beter.'},
  {minutes:129600, title:'Longfunctie +30%',              desc:'3 maanden: wimperharen volledig hersteld.'},
  {minutes:525600, title:'Hart risico gehalveerd',        desc:'1 jaar: risico hartziekte 50% lager.'},
  {minutes:2628000,title:'Risico gelijk aan niet-roker',  desc:'5 jaar: hart-/vaatrisico gelijk aan niet-roker.'},
];

const SOS_COMMANDS = [
  {cmd:'Doe nu 15 squats! Beweeg dat lijf!',      speech:'Doe nu vijftien squats! Kom op soldaat!'},
  {cmd:'20 push-ups! Geen excuses!',               speech:'Twintig push-ups! Nu! Geen enkel excuus!'},
  {cmd:'Loop 5 minuten buiten! Frisse lucht!',     speech:'Naar buiten! Loop vijf minuten!'},
  {cmd:'Drink een groot glas koud water!',          speech:'Pak een groot glas koud water en drink het op!'},
  {cmd:'Doe een 4-7-8 ademhaling! 3 keer!',        speech:'Adem in voor vier, vast voor zeven, uit voor acht!'},
  {cmd:'30 seconden plank! Sta sterk!',             speech:'Plank! Dertig seconden! Houd vol soldaat!'},
  {cmd:'15 jumping jacks! Activeer je lichaam!',   speech:'Vijftien jumping jacks! Nu!'},
  {cmd:'Bel iemand die je steunt!',                 speech:'Pak je telefoon en bel iemand die jou steunt!'},
  {cmd:'Poets je tanden! Afleiden werkt!',          speech:'Naar de badkamer. Poets je tanden!'},
  {cmd:'10 minuten wandelen buiten!',               speech:'Schoenen aan, deur uit. Tien minuten wandelen!'},
];

// ── STATE ────────────────────────────────────────────────────
let state = {
  profile: null, currentScreen: 'dashboard',
  mealSchedule: [], foodPreferences: [],
  activeTraining: null, timerInterval: null,
  timerPaused: false, timerPauseStart: null, timerPausedTotal: 0,
  gpsActive: false, gpsMode: 'wandelen', gpsWatchId: null,
  gpsPositions: [], gpsStartTime: null, gpsDistance: 0, gpsLastPos: null,
  sosActive: false, sosInterval: null,
  smokingStop: null, smokeInterval: null,
  currentMealIndex: null, activePeriod: 'dag',
  weightEntries: [], customSports: [],
  mealBuilder: [],   // items in the custom meal builder
};

// ══════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════
async function init() {
  const profileRec  = await db.settings.get('profile');
  state.profile     = profileRec ? profileRec.value : null;

  const smokeRec    = await db.settings.get('smokingStop');
  state.smokingStop = smokeRec ? new Date(smokeRec.value) : null;

  const prefsRec    = await db.settings.get('foodPreferences');
  state.foodPreferences = prefsRec ? prefsRec.value : [];

  const mealRec = await db.settings.get('mealSchedule');
  if (mealRec) state.mealSchedule = mealRec.value;
  else if (state.profile?.breakfastTime)
    state.mealSchedule = computeMealSchedule(state.profile.breakfastTime);

  state.weightEntries = await db.weights.orderBy('date').toArray();
  state.customSports  = await db.customSports.toArray();

  if (!state.profile || !state.profile.weight) showSetup();
  else { hideSetup(); initApp(); }

  startClockTick();
  renderFoodMatrix('food-matrix-setup', true);
}

function initApp() {
  renderFoodMatrix('food-matrix-main', false);
  renderGymButtons();
  updateDashboard();
  renderMealSlots();
  updateSmokeScreen();
  renderReport('dag');
  renderRecentTrainings();
  requestNotificationPermission();
  startSmokeInterval();
  scheduleMidnightReset();
  scheduleNotifications();
}

// ── CLOCK ─────────────────────────────────────────────────────
function startClockTick() {
  setInterval(() => {
    const now = new Date();
    const el = document.getElementById('dash-time');
    if (el) el.textContent = now.toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'});
    if (state.currentScreen === 'dashboard') updateDashboardLive();
    if (state.currentScreen === 'smoke') updateSmokeLive();
  }, 1000);
}

// ══════════════════════════════════════════════════════════════
//  SETUP
// ══════════════════════════════════════════════════════════════
function showSetup() {
  document.getElementById('setup-screen').classList.remove('hidden');
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const si = document.getElementById('smoke-stop-input');
  if (si) si.value = now.toISOString().slice(0,16);
}
function hideSetup() { document.getElementById('setup-screen').classList.add('hidden'); }

function setupStep2() {
  const w = parseFloat(document.getElementById('setup-weight').value);
  const h = parseInt(document.getElementById('setup-height').value);
  const a = parseInt(document.getElementById('setup-age').value);
  const n = document.getElementById('setup-name').value.trim() || 'Soldaat';
  if (!w||!h||!a) { toast('Vul alle velden in!','error'); return; }
  state.profile = {weight:w, startWeight:w, height:h, age:a, name:n, breakfastTime:'07:00'};
  showSetupStep(2);
}
function setupStep3() {
  const bt    = document.getElementById('setup-breakfast').value || '07:00';
  const cigs  = parseInt(document.getElementById('setup-cigs').value) || 20;
  const price = parseFloat(document.getElementById('setup-cig-price').value) || 9.50;
  state.profile.breakfastTime = bt;
  state.profile.cigsPerDay    = cigs;
  state.profile.cigPackPrice  = price;
  state.mealSchedule = computeMealSchedule(bt);
  showSetupStep(3);
}
async function finishSetup() {
  state.profile.setupDate = new Date().toISOString();
  await db.settings.put({key:'profile', value:state.profile});
  await db.settings.put({key:'mealSchedule', value:state.mealSchedule});
  const selected = [...document.querySelectorAll('#food-matrix-setup .food-item.selected')].map(el=>el.dataset.id);
  state.foodPreferences = selected.length > 0 ? selected : FOODS.map(f=>f.id);
  await db.settings.put({key:'foodPreferences', value:state.foodPreferences});
  await db.weights.add({date:new Date().toISOString(), weight:state.profile.startWeight});
  state.weightEntries = await db.weights.orderBy('date').toArray();
  hideSetup(); initApp(); showScreen('dashboard');
  toast('Missie gestart! Tijd voor actie!','success');
  speak('Welkom soldaat! De missie is gestart!');
}
async function skipSetup() {
  state.profile = {weight:115,startWeight:115,height:178,age:48,name:'Soldaat',
    breakfastTime:'07:00',cigsPerDay:20,cigPackPrice:9.50,setupDate:new Date().toISOString()};
  state.mealSchedule = computeMealSchedule('07:00');
  state.foodPreferences = FOODS.map(f=>f.id);
  await db.settings.put({key:'profile', value:state.profile});
  await db.settings.put({key:'mealSchedule', value:state.mealSchedule});
  await db.settings.put({key:'foodPreferences', value:state.foodPreferences});
  state.weightEntries = await db.weights.orderBy('date').toArray();
  hideSetup(); initApp(); showScreen('dashboard');
}
function showSetupStep(n) {
  document.querySelectorAll('.setup-step').forEach(el=>el.classList.remove('active'));
  document.getElementById('setup-step-'+n).classList.add('active');
}
function setupStepBack(n) { showSetupStep(n); }

// ══════════════════════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════════════════════
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('screen-'+name)?.classList.add('active');
  document.querySelector(`[data-screen="${name}"]`)?.classList.add('active');
  state.currentScreen = name;
  if (name==='dashboard') updateDashboard();
  if (name==='food')      renderMealSlots();
  if (name==='smoke')     updateSmokeScreen();
  if (name==='report')    renderReport(state.activePeriod);
  if (name==='training')  renderRecentTrainings();
  vibrate(20);
}

// ══════════════════════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════════════════════
async function updateDashboard() {
  if (!state.profile) return;
  const now = new Date();
  const days   = ['Zondag','Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag'];
  const months = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
  const dateEl = document.getElementById('dash-date');
  if (dateEl) dateEl.textContent = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  const h = now.getHours();
  const greet = h<6?'Nog wakker, ':h<12?'Goedmorgen, ':h<18?'Goedmiddag, ':'Goedenavond, ';
  const gt = document.getElementById('greeting-text');
  if (gt) gt.textContent = greet + (state.profile.name||'Soldaat') + '!';

  const startW   = state.profile.startWeight || 115;
  const currentW = state.weightEntries.length > 0
    ? state.weightEntries[state.weightEntries.length-1].weight : startW;
  const lost = startW - currentW;
  const bmi  = currentW / Math.pow((state.profile.height||178)/100, 2);

  setText('dash-weight-start', startW.toFixed(1));
  setText('dash-weight-now',   currentW.toFixed(1));
  setText('dash-weight-lost',  (lost>=0?'-':'+')+Math.abs(lost).toFixed(1));
  setText('dash-bmi',          bmi.toFixed(1));

  const streak = await computeStreak();
  setText('dash-streak', `🔥 ${streak} dagen`);

  const todayLog = await getTodayFoodLog();
  const eaten = todayLog.reduce((s,e)=>s+(e.kcal||0),0);
  const burned = await getTodayCaloriesBurned();
  const bmr   = computeBMR();
  setText('dash-kcal-eaten', eaten+' kcal');
  setText('dash-kcal-burned', burned+' kcal');
  setText('dash-kcal-goal', bmr+' kcal');
  const pct = Math.min(100, Math.round(eaten/bmr*100));
  const bar = document.getElementById('dash-cal-bar');
  if (bar) bar.style.width = pct+'%';

  updateDashSmoke();
  updateNextMeal();
  drawWeightChart();
}

function updateDashboardLive() { updateDashSmoke(); updateNextMeal(); }

function updateDashSmoke() {
  const el  = document.getElementById('dash-smoke-status');
  const el2 = document.getElementById('dash-smoke-saved');
  if (!el) return;
  if (!state.smokingStop) {
    el.textContent  = 'Stel stopmoment in →';
    el.style.color  = 'var(--steel)';
    if (el2) el2.textContent = '';
    return;
  }
  const diff = Date.now() - state.smokingStop.getTime();
  el.textContent = formatDuration(diff);
  el.style.color = 'var(--green-bright)';
  if (el2) el2.textContent = `€${computeMoneySaved(diff)} bespaard · ${computeCigsNotSmoked(diff)} sigaretten gemist`;
}

function updateNextMeal() {
  const el = document.getElementById('dash-next-meal');
  if (!el || !state.mealSchedule.length) return;
  const now    = new Date();
  const nowMin = now.getHours()*60 + now.getMinutes();
  const next   = state.mealSchedule.find(m => { const [h,m2]=m.split(':').map(Number); return h*60+m2 > nowMin; });
  if (next) {
    const [h,m] = next.split(':').map(Number);
    const mins  = h*60+m - nowMin;
    el.innerHTML = `<strong style="color:var(--amber);font-family:var(--font-mono)">${next}</strong> — over ${mins} minuten`;
  } else {
    el.textContent = 'Geen eetmomenten meer vandaag. Goed gedaan!';
  }
}

// ── WEIGHT CHART ─────────────────────────────────────────────
function drawWeightChart() {
  const canvas  = document.getElementById('weight-chart');
  const emptyEl = document.getElementById('weight-chart-empty');
  if (!canvas) return;
  const entries = state.weightEntries.slice(-30);
  if (entries.length < 2) {
    canvas.style.display='none';
    if (emptyEl) emptyEl.style.display='block';
    return;
  }
  canvas.style.display='block';
  if (emptyEl) emptyEl.style.display='none';
  const W=canvas.offsetWidth||320, H=100;
  canvas.width=W*devicePixelRatio; canvas.height=H*devicePixelRatio;
  canvas.style.width=W+'px'; canvas.style.height=H+'px';
  const ctx=canvas.getContext('2d');
  ctx.scale(devicePixelRatio,devicePixelRatio);
  const ws=entries.map(e=>e.weight);
  const minW=Math.min(...ws)-1, maxW=Math.max(...ws)+1, rng=maxW-minW||1;
  const pad=8, cW=W-pad*2, cH=H-pad*2;
  ctx.fillStyle='#161616'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#2a2a2a'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.moveTo(pad,pad+cH/2); ctx.lineTo(W-pad,pad+cH/2); ctx.stroke();
  ctx.setLineDash([]);
  const px=(i)=>pad+(i/(entries.length-1))*cW;
  const py=(w)=>pad+cH-((w-minW)/rng)*cH;
  ctx.beginPath(); ctx.strokeStyle='#27ae60'; ctx.lineWidth=2; ctx.lineJoin='round';
  entries.forEach((e,i)=>i===0?ctx.moveTo(px(i),py(e.weight)):ctx.lineTo(px(i),py(e.weight)));
  ctx.stroke();
  ctx.beginPath();
  entries.forEach((e,i)=>i===0?ctx.moveTo(px(i),py(e.weight)):ctx.lineTo(px(i),py(e.weight)));
  ctx.lineTo(px(entries.length-1),pad+cH); ctx.lineTo(pad,pad+cH); ctx.closePath();
  ctx.fillStyle='rgba(39,174,96,0.1)'; ctx.fill();
  entries.forEach((e,i)=>{
    ctx.beginPath(); ctx.arc(px(i),py(e.weight),3,0,Math.PI*2);
    ctx.fillStyle='#27ae60'; ctx.fill();
  });
  ctx.fillStyle='#7f8c8d'; ctx.font='10px Share Tech Mono,monospace';
  ctx.textAlign='left';  ctx.fillText(maxW.toFixed(1)+'kg',pad,pad+10);
  ctx.textAlign='right'; ctx.fillText(minW.toFixed(1)+'kg',W-pad,H-pad);
}

// ── WEIGHT LOG ────────────────────────────────────────────────
function showWeightModal() {
  document.getElementById('weight-modal').classList.add('active');
  renderWeightHistory();
}
function renderWeightHistory() {
  const c = document.getElementById('weight-history');
  if (!c) return;
  const entries = [...state.weightEntries].reverse().slice(0,15);
  if (!entries.length) { c.innerHTML=''; return; }
  let html='<div style="font-family:var(--font-display);font-size:14px;letter-spacing:1px;color:var(--steel);margin-bottom:8px;">GEWICHTSLOG</div>';
  entries.forEach((e,i)=>{
    const prev=entries[i+1];
    const delta=prev?e.weight-prev.weight:0;
    const ds=delta!==0?(delta>0?'+':'')+delta.toFixed(1)+' kg':'—';
    const dc=delta<0?'down':delta>0?'up':'';
    const date=new Date(e.date);
    html+=`<div class="weight-entry">
      <span class="we-date">${date.toLocaleDateString('nl-NL',{day:'2-digit',month:'short'})}</span>
      <span class="we-val">${e.weight.toFixed(1)} kg</span>
      <span class="we-delta ${dc}">${ds}</span>
    </div>`;
  });
  c.innerHTML=html;
}
async function logWeight() {
  const w = parseFloat(document.getElementById('weight-input').value);
  if (!w||w<30||w>300) { toast('Voer een geldig gewicht in!','error'); return; }
  await db.weights.add({date:new Date().toISOString(), weight:w});
  state.weightEntries = await db.weights.orderBy('date').toArray();
  state.profile.weight = w;
  await db.settings.put({key:'profile', value:state.profile});
  document.getElementById('weight-input').value='';
  toast(`${w} kg gelogd!`,'success');
  vibrate([30,20,30]);
  renderWeightHistory(); drawWeightChart(); updateDashboard();
  const prev = state.weightEntries[state.weightEntries.length-2];
  if (prev && w < prev.weight) speak(`Goed bezig soldaat! Je bent ${(prev.weight-w).toFixed(1)} kilo lichter!`);
}

// ══════════════════════════════════════════════════════════════
//  MEAL SCHEDULE
// ══════════════════════════════════════════════════════════════
function computeMealSchedule(bt) {
  const [h,m] = bt.split(':').map(Number);
  return Array.from({length:6},(_,i)=>{
    const tot=h*60+m+i*180;
    return `${String(Math.floor(tot/60)%24).padStart(2,'0')}:${String(tot%60).padStart(2,'0')}`;
  });
}
function shiftMealsNow() {
  const now=new Date(), nowMin=now.getHours()*60+now.getMinutes();
  const idx=state.mealSchedule.findIndex(t=>{const[h,m]=t.split(':').map(Number);return h*60+m>nowMin-30;});
  if (idx===-1){toast('Geen eetmomenten meer vandaag!'); return;}
  const ns=[...state.mealSchedule];
  for(let i=idx;i<6;i++){const tot=nowMin+(i-idx)*180; ns[i]=`${String(Math.floor(tot/60)%24).padStart(2,'0')}:${String(tot%60).padStart(2,'0')}`;}
  state.mealSchedule=ns;
  db.settings.put({key:'mealSchedule',value:ns});
  renderMealSlots(); toast('Schema verschoven!','success'); vibrate(30);
}
function showBreakfastPicker() {
  document.getElementById('breakfast-time-input').value=state.mealSchedule[0]||'07:00';
  document.getElementById('breakfast-modal').classList.add('active');
}
function updateBreakfastTime() {
  const t=document.getElementById('breakfast-time-input').value;
  state.mealSchedule=computeMealSchedule(t);
  if (state.profile){state.profile.breakfastTime=t; db.settings.put({key:'profile',value:state.profile});}
  db.settings.put({key:'mealSchedule',value:state.mealSchedule});
  closeModal('breakfast-modal'); renderMealSlots(); toast('Schema bijgewerkt!','success');
}

async function renderMealSlots() {
  const container=document.getElementById('meal-slots-container');
  if (!container) return;
  const todayLog=await getTodayFoodLog();
  const now=new Date(), nowMin=now.getHours()*60+now.getMinutes();
  const names=['Ontbijt','Tussendoor','Lunch','Tussendoor','Avondeten','Tussendoor'];
  let html='';
  state.mealSchedule.forEach((time,i)=>{
    const [h,m]=time.split(':').map(Number), mealMin=h*60+m;
    const done=todayLog.find(e=>e.mealIndex===i);
    const active=Math.abs(mealMin-nowMin)<30&&!done;
    const cls=done?'done':active?'active-now':'';
    const check=done?'✅':active?'🔔':'○';
    const eaten=done?`<span style="color:var(--green-bright);font-size:12px;">✓ ${done.description||done.food}</span>`
      :`<span style="color:var(--steel);font-size:12px;">${getSuggestionForMeal(i)?.name||'—'}</span>`;
    html+=`<div class="meal-slot ${cls}" onclick="openMealModal(${i})">
      <div class="meal-time">${time}</div>
      <div style="flex:1;"><div class="meal-name">${names[i]}</div>${eaten}</div>
      <div class="meal-check">${check}</div>
    </div>`;
  });
  container.innerHTML=html;
  updateFoodTotals();
}

function getSuggestionForMeal(idx) {
  const prefs=state.foodPreferences.length>0?FOODS.filter(f=>state.foodPreferences.includes(f.id)):FOODS;
  if (!prefs.length) return null;
  return prefs[(idx*7+new Date().getDay()*3)%prefs.length];
}

// ── MEAL MODAL — custom menu builder ─────────────────────────
function openMealModal(mealIndex) {
  state.currentMealIndex = mealIndex;
  state.mealBuilder = [];
  const names=['Ontbijt','Tussendoor','Lunch','Tussendoor','Avondeten','Tussendoor'];
  document.getElementById('meal-modal-title').textContent=`${names[mealIndex]} — ${state.mealSchedule[mealIndex]}`;
  renderMealBuilder();
  document.getElementById('meal-modal').classList.add('active');
}

function renderMealBuilder() {
  const c = document.getElementById('meal-modal-suggestions');
  if (!c) return;

  // Builder summary
  const totalKcal = state.mealBuilder.reduce((s,i)=>s+i.kcal,0);
  const totalP    = state.mealBuilder.reduce((s,i)=>s+i.protein,0);

  let html = `<div style="margin-bottom:12px;">
    <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--steel);margin-bottom:6px;">📋 Jouw Menu</div>`;

  if (state.mealBuilder.length===0) {
    html += `<div style="color:var(--steel);font-size:13px;font-style:italic;">Voeg producten toe hieronder</div>`;
  } else {
    state.mealBuilder.forEach((item,idx)=>{
      html += `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);">
        <span style="font-size:18px;">${item.emoji}</span>
        <div style="flex:1;">
          <span style="font-size:14px;font-weight:700;">${item.qty}x ${item.name}</span>
          <span style="font-size:12px;color:var(--steel);margin-left:6px;">${item.kcal} kcal</span>
        </div>
        <button onclick="removeMealItem(${idx})" style="background:none;border:none;color:var(--red-hot);font-size:18px;cursor:pointer;">×</button>
      </div>`;
    });
    html += `<div style="margin-top:8px;font-family:var(--font-mono);font-size:13px;color:var(--amber);">
      Totaal: ${Math.round(totalKcal)} kcal · ${Math.round(totalP)}g eiwit
    </div>`;
  }
  html += `</div>`;

  // Vrij invoeren
  html += `<div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--steel);margin-bottom:8px;">✏️ Vrij Invoeren</div>
  <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;">
    <input id="custom-food-name" type="text" class="input-field" placeholder="Bijv. Brood met kaas" style="flex:2;font-size:13px;padding:8px;">
    <input id="custom-food-kcal" type="number" class="input-field" placeholder="kcal" inputmode="numeric" style="flex:1;font-size:13px;padding:8px;min-width:60px;">
    <button class="btn btn-amber btn-sm" onclick="addCustomFoodEntry()" style="white-space:nowrap;">+ Add</button>
  </div>`;

  // Product suggesties
  html += `<div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--steel);margin-bottom:8px;">🏪 Producten Toevoegen</div>
  <div style="display:flex;flex-wrap:wrap;gap:6px;">`;

  const prefs = state.foodPreferences.length>0
    ? FOODS.filter(f=>state.foodPreferences.includes(f.id)) : FOODS;
  const show  = prefs.slice(0, 20);

  show.forEach(food=>{
    html+=`<button onclick="addMealItem('${food.id}')" style="display:flex;align-items:center;gap:6px;background:var(--card);border:1px solid var(--border);border-radius:4px;padding:6px 10px;cursor:pointer;font-size:12px;color:var(--white);">
      <span>${food.emoji}</span><span>${food.name}</span>
    </button>`;
  });
  html+=`</div>`;

  // Quantity selector for last added
  if (state.mealBuilder.length > 0) {
    const last = state.mealBuilder[state.mealBuilder.length-1];
    html += `<div style="margin-top:12px;font-size:12px;color:var(--steel);">
      Hoeveelheid van <strong style="color:var(--white);">${last.name}</strong>:
      <div style="display:flex;gap:6px;margin-top:6px;">
        ${[1,2,3,4,5].map(n=>`<button onclick="setLastItemQty(${n})" style="background:${last.qty===n?'var(--amber)':'var(--card)'};border:1px solid var(--border);border-radius:4px;padding:6px 12px;cursor:pointer;color:var(--white);font-size:14px;">${n}x</button>`).join('')}
      </div>
    </div>`;
  }

  c.innerHTML = html;
}

function addMealItem(foodId) {
  const food = FOODS.find(f=>f.id===foodId);
  if (!food) return;
  const existing = state.mealBuilder.find(i=>i.foodId===foodId);
  if (existing) { existing.qty++; existing.kcal=food.kcal*existing.qty; existing.protein=food.protein*existing.qty; }
  else state.mealBuilder.push({foodId, emoji:food.emoji, name:food.name, qty:1,
    kcal:food.kcal, protein:food.protein, carbs:food.carbs, fat:food.fat});
  vibrate(15); renderMealBuilder();
}

function removeMealItem(idx) {
  state.mealBuilder.splice(idx,1);
  renderMealBuilder();
}

function setLastItemQty(qty) {
  if (!state.mealBuilder.length) return;
  const item = state.mealBuilder[state.mealBuilder.length-1];
  const food = FOODS.find(f=>f.id===item.foodId);
  if (food) { item.qty=qty; item.kcal=food.kcal*qty; item.protein=food.protein*qty; item.carbs=food.carbs*qty; item.fat=food.fat*qty; }
  renderMealBuilder();
}

function addCustomFoodEntry() {
  const name = document.getElementById('custom-food-name')?.value.trim();
  const kcal = parseFloat(document.getElementById('custom-food-kcal')?.value);
  if (!name) { toast('Voer een naam in!','error'); return; }
  state.mealBuilder.push({foodId:'custom', emoji:'🍽️', name, qty:1,
    kcal: isNaN(kcal)?0:kcal, protein:0, carbs:0, fat:0});
  document.getElementById('custom-food-name').value='';
  document.getElementById('custom-food-kcal').value='';
  vibrate(15); renderMealBuilder();
}

async function markMealDone() {
  const i = state.currentMealIndex;
  if (i===null) return;

  let kcal=0, protein=0, carbs=0, fat=0, description='';

  if (state.mealBuilder.length > 0) {
    kcal    = Math.round(state.mealBuilder.reduce((s,it)=>s+it.kcal,0));
    protein = Math.round(state.mealBuilder.reduce((s,it)=>s+it.protein,0));
    carbs   = Math.round(state.mealBuilder.reduce((s,it)=>s+it.carbs,0));
    fat     = Math.round(state.mealBuilder.reduce((s,it)=>s+it.fat,0));
    description = state.mealBuilder.map(it=>`${it.qty}x ${it.name}`).join(', ');
  } else {
    const sug = getSuggestionForMeal(i);
    if (sug) { kcal=sug.kcal; protein=sug.protein; carbs=sug.carbs; fat=sug.fat; description=sug.name; }
  }

  await db.foodLog.add({
    date: new Date().toISOString().split('T')[0],
    mealIndex: i, time: state.mealSchedule[i],
    food: description, description, kcal, protein, carbs, fat,
  });
  closeModal('meal-modal');
  toast(`Gegeten! ${kcal} kcal gelogd!`,'success');
  vibrate(30); renderMealSlots();
}

async function getTodayFoodLog() {
  const today=new Date().toISOString().split('T')[0];
  return db.foodLog.where('date').equals(today).toArray();
}
async function updateFoodTotals() {
  const log=await getTodayFoodLog();
  const t=log.reduce((a,e)=>({kcal:a.kcal+(e.kcal||0),protein:a.protein+(e.protein||0),carbs:a.carbs+(e.carbs||0),fat:a.fat+(e.fat||0)}),{kcal:0,protein:0,carbs:0,fat:0});
  setText('food-total-kcal',Math.round(t.kcal));
  setText('macro-protein',Math.round(t.protein)+'g');
  setText('macro-carbs',Math.round(t.carbs)+'g');
  setText('macro-fat',Math.round(t.fat)+'g');
  setText('macro-kcal',Math.round(t.kcal));
}

// ── FOOD MATRIX ───────────────────────────────────────────────
function renderFoodMatrix(containerId, setupMode) {
  const c=document.getElementById(containerId);
  if (!c) return;
  let html='';
  FOODS.forEach(food=>{
    const sel=setupMode
      ? state.foodPreferences.includes(food.id)||state.foodPreferences.length===0
      : state.foodPreferences.includes(food.id);
    html+=`<div class="food-item ${sel?'selected':''}" data-id="${food.id}" onclick="toggleFood(this,'${containerId}')">
      <div class="food-emoji">${food.emoji}</div>
      <div class="food-info"><div class="food-name">${food.name}</div><div class="food-macro">${food.kcal} kcal · ${food.protein}g P</div></div>
      <div class="food-cb">${sel?'✓':''}</div>
    </div>`;
  });
  c.innerHTML=html;
}
async function toggleFood(el, containerId) {
  el.classList.toggle('selected');
  el.querySelector('.food-cb').textContent=el.classList.contains('selected')?'✓':'';
  if (containerId==='food-matrix-main') {
    state.foodPreferences=[...document.querySelectorAll('#food-matrix-main .food-item.selected')].map(e=>e.dataset.id);
    await db.settings.put({key:'foodPreferences',value:state.foodPreferences});
  }
  vibrate(15);
}

// ══════════════════════════════════════════════════════════════
//  GYM TRAINING
// ══════════════════════════════════════════════════════════════
function renderGymButtons() {
  const c=document.getElementById('gym-buttons-grid');
  if (!c) return;
  let html='';
  GYM_ACTIVITIES.forEach(act=>{
    html+=`<div class="gym-btn" id="gym-${act.id}" onclick="startGymActivityById('${act.id}')">
      <div class="gym-icon">${act.emoji}</div>
      <div>${act.name}</div>
      <div class="gym-met">MET ${act.met} · ${act.desc}</div>
    </div>`;
  });
  state.customSports.forEach(act=>{
    html+=`<div class="gym-btn" id="gym-c${act.id}" onclick="startCustomSport(${act.id})">
      <div class="gym-icon">${act.emoji||'🏅'}</div>
      <div>${act.name}</div>
      <div class="gym-met">MET ${act.met} · Eigen sport</div>
    </div>`;
  });
  html+=`<div class="gym-btn" onclick="showAddSportModal()" style="border-style:dashed;opacity:0.7;">
    <div class="gym-icon">➕</div><div>Voeg Sport Toe</div><div class="gym-met">Eigen activiteit</div>
  </div>`;
  c.innerHTML=html;
}

function startGymActivityById(id) {
  const act=GYM_ACTIVITIES.find(a=>a.id===id);
  if (act) startActivityObj(act, 'gym-'+id);
}
function startCustomSport(id) {
  const act=state.customSports.find(a=>a.id===id);
  if (act) startActivityObj(act, 'gym-c'+id);
}
function startActivityObj(act, btnId) {
  if (state.activeTraining){toast('Stop eerst de huidige activiteit!','error'); return;}
  state.activeTraining={id:act.id, name:act.name, met:act.met, startTime:Date.now(), type:'gym'};
  state.timerPaused=false; state.timerPausedTotal=0;
  setText('timer-activity-name',(act.emoji||'🏋️')+' '+act.name.toUpperCase());
  document.getElementById('training-timer-panel').style.display='block';
  document.querySelectorAll('.gym-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(btnId)?.classList.add('active');
  state.timerInterval=setInterval(updateGymTimer,1000);
  vibrate([30,10,30]);
  speak(`${act.name} gestart! Kom op soldaat!`);
}

function updateGymTimer() {
  if (state.timerPaused||!state.activeTraining) return;
  const elapsed=(Date.now()-state.activeTraining.startTime-state.timerPausedTotal)/1000;
  setText('timer-display', formatSeconds(elapsed));
  const kcal=Math.round(state.activeTraining.met*(state.profile?.weight||115)*(elapsed/3600)*1.05);
  setText('timer-kcal-display', kcal+' kcal');
}
function toggleTimerPause() {
  if (!state.activeTraining) return;
  const btn=document.getElementById('timer-pause-btn');
  if (state.timerPaused) {
    state.timerPausedTotal+=Date.now()-state.timerPauseStart;
    state.timerPaused=false; btn.textContent='⏸ Pauze'; toast('Hervat!');
  } else {
    state.timerPauseStart=Date.now(); state.timerPaused=true; btn.textContent='▶ Hervat'; toast('Gepauzeerd');
  }
  vibrate(20);
}
async function stopTraining() {
  if (!state.activeTraining) return;
  clearInterval(state.timerInterval);
  const elapsed=(Date.now()-state.activeTraining.startTime-state.timerPausedTotal)/1000;
  const kcal=Math.round(state.activeTraining.met*(state.profile?.weight||115)*(elapsed/3600)*1.05);
  await db.trainings.add({date:new Date().toISOString(), type:state.activeTraining.type||'gym',
    name:state.activeTraining.name, duration:Math.round(elapsed), kcal, met:state.activeTraining.met});
  toast(`✅ ${state.activeTraining.name}: ${formatSeconds(elapsed)} · ${kcal} kcal`,'success');
  speak(`Sessie complete. ${kcal} calorieën verbrand. Jij bent een machine!`);
  vibrate([50,30,50,30,50]);
  state.activeTraining=null; state.timerPaused=false; state.timerPausedTotal=0;
  document.getElementById('training-timer-panel').style.display='none';
  document.querySelectorAll('.gym-btn').forEach(b=>b.classList.remove('active'));
  renderRecentTrainings(); updateDashboard();
}

async function renderRecentTrainings() {
  const c=document.getElementById('recent-trainings');
  if (!c) return;
  const ts=await db.trainings.orderBy('date').reverse().limit(5).toArray();
  if (!ts.length){c.innerHTML='<div style="color:var(--steel);font-size:14px;">Nog geen trainingen gelogd</div>'; return;}
  c.innerHTML=ts.map(t=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);">
    <div>
      <div style="font-weight:700;font-size:14px;">${t.name}</div>
      <div style="font-size:12px;color:var(--steel);font-family:var(--font-mono);">${new Date(t.date).toLocaleDateString('nl-NL')} · ${formatSeconds(t.duration)}</div>
    </div>
    <div style="font-family:var(--font-mono);color:var(--amber);font-size:16px;">${t.kcal} kcal</div>
  </div>`).join('');
}
async function getTodayCaloriesBurned() {
  const today=new Date().toISOString().split('T')[0];
  const ts=await db.trainings.where('date').startsWith(today).toArray();
  return ts.reduce((s,t)=>s+(t.kcal||0),0);
}

// ── ADD CUSTOM SPORT ──────────────────────────────────────────
function showAddSportModal() {
  document.getElementById('add-sport-modal').classList.add('active');
}
async function saveCustomSport() {
  const name  = document.getElementById('sport-name-input').value.trim();
  const met   = parseFloat(document.getElementById('sport-met-input').value);
  const emoji = document.getElementById('sport-emoji-input').value.trim() || '🏅';
  if (!name||!met||met<1||met>20){toast('Vul naam en MET in (1-20)!','error'); return;}
  const id = await db.customSports.add({name, met, emoji});
  state.customSports = await db.customSports.toArray();
  closeModal('add-sport-modal');
  document.getElementById('sport-name-input').value='';
  document.getElementById('sport-met-input').value='';
  document.getElementById('sport-emoji-input').value='';
  renderGymButtons();
  toast(`${emoji} ${name} toegevoegd!`,'success');
}

// ══════════════════════════════════════════════════════════════
//  GPS TRACKING
// ══════════════════════════════════════════════════════════════
function startGPS(mode) {
  if (!navigator.geolocation){toast('GPS niet beschikbaar','error'); return;}
  if (state.gpsActive){toast('GPS al actief!','error'); return;}
  state.gpsActive=true; state.gpsMode=mode;
  state.gpsPositions=[]; state.gpsDistance=0;
  state.gpsLastPos=null; state.gpsStartTime=Date.now();

  const modeNames={wandelen:'Wandelen 🚶',ebike:'E-bike 🚴',hardlopen:'Hardlopen 🏃'};
  const metValues={wandelen:3.5, ebike:5.0, hardlopen:8.5};

  document.getElementById('gps-start-buttons').style.display='none';
  document.getElementById('gps-stop-btn').style.display='block';
  setText('gps-status','GPS actief — bezig met tracken...');
  setText('gps-mode-label', modeNames[mode]||mode);
  const tagColors={wandelen:'tag-green',ebike:'tag-amber',hardlopen:'tag-red'};
  document.getElementById('gps-mode-tag').innerHTML=`<span class="tag ${tagColors[mode]||'tag-green'}">${modeNames[mode]||mode}</span>`;

  state.activeTraining={id:'gps', name:modeNames[mode]||mode,
    met:metValues[mode]||3.5, startTime:Date.now(), type:'gps'};
  state.timerPaused=false; state.timerPausedTotal=0;
  setText('timer-activity-name','🗺️ GPS TRACKING');
  document.getElementById('training-timer-panel').style.display='block';
  state.timerInterval=setInterval(updateGymTimer,1000);

  state.gpsWatchId=navigator.geolocation.watchPosition(
    onGPSPosition, onGPSError,
    {enableHighAccuracy:true, timeout:15000, maximumAge:5000}
  );
  toast(`GPS gestart — ${modeNames[mode]||mode}!`,'success');
  vibrate([30,10,30]);
}

function onGPSPosition(pos) {
  const {latitude:lat, longitude:lng, speed, accuracy}=pos.coords;
  setText('gps-status',`Nauwkeurigheid: ${Math.round(accuracy)}m`);
  if (state.gpsLastPos && accuracy<50) {
    const d=haversine(state.gpsLastPos.lat,state.gpsLastPos.lng,lat,lng);
    if (d>0.002) state.gpsDistance+=d;
  }
  state.gpsLastPos={lat,lng};
  state.gpsPositions.push({lat,lng,t:Date.now()});

  const kmh = speed ? speed*3.6 : computeSpeed();

  // Auto-update MET based on actual speed (unless e-bike mode forced)
  if (state.gpsMode !== 'ebike') {
    if (kmh > 15)     { state.activeTraining.met=5.0; } // e-bike speed
    else if (kmh > 6) { state.activeTraining.met=8.5; } // hardlopen
    else              { state.activeTraining.met=3.5; } // wandelen
  }

  setText('gps-distance', state.gpsDistance.toFixed(2));
  setText('gps-speed', kmh.toFixed(1));
  const elapsed=(Date.now()-state.gpsStartTime)/1000/3600;
  const kcal=Math.round(state.activeTraining.met*(state.profile?.weight||115)*elapsed*1.05);
  setText('gps-kcal', kcal);
}

function onGPSError(err) {
  setText('gps-status','GPS fout: '+err.message);
  toast('GPS fout — check permissies','error');
}
function computeSpeed() {
  const ps=state.gpsPositions;
  if (ps.length<2) return 0;
  const d=haversine(ps[ps.length-2].lat,ps[ps.length-2].lng,ps[ps.length-1].lat,ps[ps.length-1].lng);
  const t=(ps[ps.length-1].t-ps[ps.length-2].t)/3600000;
  return t>0?d/t:0;
}
function haversine(la1,lo1,la2,lo2) {
  const R=6371, dLat=(la2-la1)*Math.PI/180, dLon=(lo2-lo1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
async function stopGPS() {
  if (state.gpsWatchId!==null){navigator.geolocation.clearWatch(state.gpsWatchId); state.gpsWatchId=null;}
  state.gpsActive=false;
  document.getElementById('gps-start-buttons').style.display='flex';
  document.getElementById('gps-stop-btn').style.display='none';
  setText('gps-status','GPS gestopt');
  if (state.gpsPositions.length>0)
    await db.gpsRoutes.add({date:new Date().toISOString(), positions:state.gpsPositions, distance:state.gpsDistance});
  if (state.activeTraining?.type==='gps') await stopTraining();
  toast(`🗺️ Route opgeslagen — ${state.gpsDistance.toFixed(2)} km`,'success');
  state.gpsDistance=0; state.gpsPositions=[];
  setText('gps-distance','0.0'); setText('gps-speed','0.0'); setText('gps-kcal','0');
}

// ══════════════════════════════════════════════════════════════
//  SMOKING MODULE
// ══════════════════════════════════════════════════════════════
async function setSmokingStop() {
  const val=document.getElementById('smoke-stop-input').value;
  if (!val){toast('Selecteer datum en tijd!','error'); return;}
  const dt=new Date(val);
  if (isNaN(dt.getTime())){toast('Ongeldige datum!','error'); return;}
  state.smokingStop=dt;
  await db.settings.put({key:'smokingStop', value:dt.toISOString()});
  toast('Stopmoment geregistreerd! Jij kan dit!','success');
  vibrate([50,30,50]);
  speak('Geregistreerd! De missie is gestart! Jij hebt de kracht!');
  updateSmokeScreen(); startSmokeInterval();
}
function startSmokeInterval() {
  if (state.smokeInterval) clearInterval(state.smokeInterval);
  if (state.smokingStop) { state.smokeInterval=setInterval(updateSmokeLive,1000); updateSmokeLive(); }
}
function updateSmokeScreen() {
  const has=!!state.smokingStop;
  document.getElementById('smoke-setup-card').style.display=has?'none':'block';
  document.getElementById('smoke-counter-section').style.display=has?'block':'none';
  if (has){ setText('smoke-header-sub','Jij staat sterk!'); updateSmokeLive(); renderHealthMilestones(); }
}
function updateSmokeLive() {
  if (!state.smokingStop) return;
  const diff=Date.now()-state.smokingStop.getTime();
  if (diff<0) return;
  const s=Math.floor(diff/1000), d=Math.floor(s/86400), h=Math.floor((s%86400)/3600), m=Math.floor((s%3600)/60), sec=s%60;
  setText('smoke-time-display',`${String(d).padStart(2,'0')}:${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`);
  setText('smoke-days-display',`${d} dagen, ${h} uur, ${m} minuten`);
  setText('smoke-cigs-not', computeCigsNotSmoked(diff));
  setText('smoke-money-saved','€'+computeMoneySaved(diff));
  const lifeMin=computeCigsNotSmoked(diff)*11;
  setText('smoke-life-gained', lifeMin>=1440?Math.floor(lifeMin/1440)+' dag':lifeMin>=60?Math.floor(lifeMin/60)+' uur':lifeMin+' min');
  setText('smoke-kcal-saved', Math.round(computeCigsNotSmoked(diff)*10));
  renderHealthMilestones();
}
function computeCigsNotSmoked(ms){return Math.floor((ms/3600000)*((state.profile?.cigsPerDay||20)/24));}
function computeMoneySaved(ms){return (computeCigsNotSmoked(ms)*(state.profile?.cigPackPrice||9.50)/20).toFixed(2);}
function renderHealthMilestones() {
  const c=document.getElementById('health-milestones');
  if (!c||!state.smokingStop) return;
  const diffMin=(Date.now()-state.smokingStop.getTime())/60000;
  c.innerHTML=HEALTH_MILESTONES.map((ms,i)=>{
    const done=diffMin>=ms.minutes;
    const isNext=!done&&(i===0||diffMin>=HEALTH_MILESTONES[i-1]?.minutes);
    const remaining=done?null:(ms.minutes-diffMin)*60000;
    const timeStr=done?'bereikt ✓':'over '+formatDuration(remaining);
    return `<div class="milestone ${done?'done':isNext?'next':''}">
      <div class="ms-dot"></div>
      <div><div class="ms-title">${ms.title}</div><div class="ms-time">${timeStr}</div><div class="ms-desc">${ms.desc}</div></div>
    </div>`;
  }).join('');
}
function resetSmokeStop() {
  state.smokingStop=null; db.settings.delete('smokingStop');
  if (state.smokeInterval) clearInterval(state.smokeInterval);
  updateSmokeScreen();
}

// ══════════════════════════════════════════════════════════════
//  SOS
// ══════════════════════════════════════════════════════════════
function activateSOS() {
  if (state.sosActive) return;
  state.sosActive=true;
  document.getElementById('sos-overlay').classList.add('active');
  document.getElementById('sos-btn').classList.add('pulsing');
  const cmd=SOS_COMMANDS[Math.floor(Math.random()*SOS_COMMANDS.length)];
  setText('sos-command-text', cmd.cmd);
  const diff=state.smokingStop?Date.now()-state.smokingStop.getTime():0;
  document.getElementById('sos-stats-text').innerHTML=
    `Je bent al <strong>${formatDuration(diff)}</strong> rookvrij<br>
     <strong>${computeCigsNotSmoked(diff)}</strong> sigaretten niet gerookt<br>
     <strong>€${computeMoneySaved(diff)}</strong> bespaard<br><br>Jij bent sterker dan die craving!`;
  setTimeout(()=>speak(cmd.speech),500);
  let remaining=600;
  setText('sos-timer-display','10:00');
  state.sosInterval=setInterval(()=>{
    remaining--;
    const mn=Math.floor(remaining/60), sc=remaining%60;
    setText('sos-timer-display',`${String(mn).padStart(2,'0')}:${String(sc).padStart(2,'0')}`);
    if (remaining===480) speak('Goed bezig! Nog 8 minuten. Jij haalt dit!');
    if (remaining===300) speak('Halverwege! De craving gaat voorbij!');
    if (remaining===120) speak('Nog 2 minuten soldaat. Je hebt gewonnen!');
    if (remaining<=0){clearInterval(state.sosInterval); speak('Bravo! Je hebt de craving verslagen!'); vibrate([100,50,100,50,100]); setTimeout(closeSOS,2000);}
  },1000);
  vibrate([100,50,100]);
}
function closeSOS() {
  state.sosActive=false; clearInterval(state.sosInterval);
  document.getElementById('sos-overlay').classList.remove('active');
  document.getElementById('sos-btn').classList.remove('pulsing');
  window.speechSynthesis?.cancel();
}

// ══════════════════════════════════════════════════════════════
//  REPORTS
// ══════════════════════════════════════════════════════════════
function showPeriod(period, el) {
  state.activePeriod=period;
  document.querySelectorAll('.period-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  renderReport(period);
}
async function renderReport(period) {
  const c=document.getElementById('report-content');
  if (!c) return;
  const now=new Date();
  let start=new Date();
  if (period==='dag')    start.setHours(0,0,0,0);
  else if(period==='week') start.setDate(now.getDate()-7);
  else if(period==='maand') start.setDate(now.getDate()-30);
  else start=new Date(state.profile?.setupDate||now);
  const ts=await db.trainings.where('date').aboveOrEqual(start.toISOString()).toArray();
  const fl=await db.foodLog.where('date').aboveOrEqual(start.toISOString().split('T')[0]).toArray();
  const kcalBurned=ts.reduce((s,t)=>s+(t.kcal||0),0);
  const kcalEaten=fl.reduce((s,f)=>s+(f.kcal||0),0);
  const dur=ts.reduce((s,t)=>s+(t.duration||0),0);
  const startW=state.profile?.startWeight||115;
  const curW=state.weightEntries.length>0?state.weightEntries[state.weightEntries.length-1].weight:startW;
  const smokeDiff=state.smokingStop?Date.now()-state.smokingStop.getTime():0;
  const labels={dag:'Vandaag',week:'Afgelopen 7 dagen',maand:'Afgelopen 30 dagen',totaal:'Totale Voortgang'};
  c.innerHTML=`<div class="report-section"><h3>${labels[period]||period}</h3>
    <div class="stats-grid" style="margin:0 0 16px;">
      <div class="stat-block amber"><div class="stat-value">${ts.length}</div><div class="stat-label">Trainingen</div></div>
      <div class="stat-block green"><div class="stat-value">${kcalBurned}</div><div class="stat-label">kcal Verbrand</div></div>
      <div class="stat-block"><div class="stat-value">${formatSeconds(dur)}</div><div class="stat-label">Trainingstijd</div></div>
      <div class="stat-block red"><div class="stat-value">${kcalEaten}</div><div class="stat-label">kcal Gegeten</div></div>
    </div>
    ${period==='totaal'?`<div class="card card-green" style="margin:0 0 12px;">
      <div class="card-title">🏆 Totale Resultaten</div>
      <div style="font-family:var(--font-mono);font-size:18px;color:var(--green-bright);">${(startW-curW).toFixed(1)>0?'-':'+'}${Math.abs(startW-curW).toFixed(1)} kg</div>
      <div style="font-size:14px;color:var(--steel);">Van ${startW} → ${curW.toFixed(1)} kg</div>
    </div>`:''}
    ${state.smokingStop?`<div class="card card-green" style="margin:0 0 12px;">
      <div class="card-title">🚭 Rookvrij</div>
      <div style="font-family:var(--font-mono);font-size:18px;color:var(--green-bright);">${formatDuration(smokeDiff)}</div>
      <div style="font-size:14px;color:var(--steel);">€${computeMoneySaved(smokeDiff)} bespaard · ${computeCigsNotSmoked(smokeDiff)} sigaretten gemist</div>
    </div>`:''}
    ${ts.length>0?`<div class="card card-amber" style="margin:0;">
      <div class="card-title">Trainingslog</div>
      ${ts.slice(-8).reverse().map(t=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
        <div><div style="font-weight:700;font-size:13px;">${t.name}</div>
        <div style="font-size:11px;color:var(--steel);font-family:var(--font-mono);">${new Date(t.date).toLocaleDateString('nl-NL')} · ${formatSeconds(t.duration)}</div></div>
        <div style="font-family:var(--font-mono);color:var(--amber);">${t.kcal} kcal</div>
      </div>`).join('')}
    </div>`:'<div style="color:var(--steel);font-size:14px;padding:16px;">Geen trainingen in deze periode</div>'}
  </div>`;
}

// ══════════════════════════════════════════════════════════════
//  EXPORT
// ══════════════════════════════════════════════════════════════
async function exportPDF() {
  const {jsPDF}=window.jspdf;
  if (!jsPDF){toast('PDF library laden...','error'); return;}
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const now=new Date(), smokeDiff=state.smokingStop?Date.now()-state.smokingStop.getTime():0;
  const startW=state.profile?.startWeight||115;
  const curW=state.weightEntries.length>0?state.weightEntries[state.weightEntries.length-1].weight:startW;
  const ts=await db.trainings.toArray();
  doc.setFont('helvetica','bold'); doc.setFontSize(22); doc.setTextColor(192,57,43);
  doc.text('STEEL & SMOKE',20,25); doc.text('Voortgangsrapport',20,33);
  doc.setTextColor(100,100,100); doc.setFontSize(10); doc.setFont('helvetica','normal');
  doc.text(`Gegenereerd: ${now.toLocaleDateString('nl-NL')}`,20,40);
  doc.text(`Naam: ${state.profile?.name||'—'} | Leeftijd: ${state.profile?.age||'—'} | Lengte: ${state.profile?.height||'—'}cm`,20,46);
  doc.line(20,50,190,50);
  doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.setTextColor(0,0,0);
  doc.text('GEWICHT',20,60); doc.setFont('helvetica','normal'); doc.setFontSize(11);
  doc.text(`Startgewicht: ${startW} kg`,20,68);
  doc.text(`Huidig: ${curW.toFixed(1)} kg`,20,74);
  doc.text(`Verlies: ${(startW-curW).toFixed(1)} kg`,20,80);
  doc.text(`BMI: ${(curW/Math.pow((state.profile?.height||178)/100,2)).toFixed(1)}`,20,86);
  doc.line(20,92,190,92);
  doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.text('ROOKVRIJ',20,100);
  doc.setFont('helvetica','normal'); doc.setFontSize(11);
  if (state.smokingStop) {
    doc.text(`Stopmoment: ${state.smokingStop.toLocaleDateString('nl-NL')}`,20,108);
    doc.text(`Rookvrij: ${formatDuration(smokeDiff)}`,20,114);
    doc.text(`Sigaretten niet gerookt: ${computeCigsNotSmoked(smokeDiff)}`,20,120);
    doc.text(`Bespaard: €${computeMoneySaved(smokeDiff)}`,20,126);
  } else { doc.text('Nog geen stopmoment ingesteld',20,108); }
  doc.line(20,132,190,132);
  doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.text('TRAINING',20,140);
  doc.setFont('helvetica','normal'); doc.setFontSize(11);
  doc.text(`Totaal trainingen: ${ts.length}`,20,148);
  doc.text(`Totaal kcal: ${ts.reduce((s,t)=>s+(t.kcal||0),0)}`,20,154);
  doc.text(`Totale tijd: ${formatSeconds(ts.reduce((s,t)=>s+(t.duration||0),0))}`,20,160);
  doc.save(`steel-smoke-${now.toISOString().split('T')[0]}.pdf`);
  toast('PDF geëxporteerd!','success');
}
async function exportText() {
  const smokeDiff=state.smokingStop?Date.now()-state.smokingStop.getTime():0;
  const startW=state.profile?.startWeight||115;
  const curW=state.weightEntries.length>0?state.weightEntries[state.weightEntries.length-1].weight:startW;
  const ts=await db.trainings.toArray();
  const txt=`STEEL & SMOKE — RAPPORT\n${'='.repeat(40)}\nGegenereerd: ${new Date().toLocaleDateString('nl-NL')}\n\nGEWICHT\nStart: ${startW}kg | Nu: ${curW.toFixed(1)}kg | Verlies: ${(startW-curW).toFixed(1)}kg\n\nROOKVRIJ\n${state.smokingStop?`${formatDuration(smokeDiff)} rookvrij\n€${computeMoneySaved(smokeDiff)} bespaard\n${computeCigsNotSmoked(smokeDiff)} sigaretten gemist`:'Niet ingesteld'}\n\nTRAINING (${ts.length} sessies)\n${ts.slice(-20).map(t=>`${new Date(t.date).toLocaleDateString('nl-NL')} | ${t.name} | ${formatSeconds(t.duration)} | ${t.kcal}kcal`).join('\n')}`;
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([txt],{type:'text/plain'}));
  a.download=`steel-smoke-${new Date().toISOString().split('T')[0]}.txt`;
  a.click(); toast('Tekstbestand gedownload!','success');
}

// ══════════════════════════════════════════════════════════════
//  SPEECH
// ══════════════════════════════════════════════════════════════
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang='nl-NL'; u.rate=1.05; u.pitch=0.85; u.volume=1.0;
  const vs=window.speechSynthesis.getVoices();
  const v=vs.find(v=>v.lang==='nl-NL')||vs.find(v=>v.lang.startsWith('nl'));
  if (v) u.voice=v;
  window.speechSynthesis.speak(u);
}

// ══════════════════════════════════════════════════════════════
//  NOTIFICATIONS & MIDNIGHT RESET
// ══════════════════════════════════════════════════════════════
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission==='default') Notification.requestPermission();
}
function scheduleNotifications() {
  setInterval(async()=>{
    if (Notification.permission!=='granted') return;
    const now=new Date(), nowMin=now.getHours()*60+now.getMinutes();
    const names=['Ontbijt','Tussendoor','Lunch','Tussendoor','Avondeten','Tussendoor'];
    state.mealSchedule.forEach((time,i)=>{
      const [h,m]=time.split(':').map(Number);
      if (h*60+m===nowMin) new Notification('🍽️ Steel & Smoke',{body:`${names[i]} tijd! Vul je magazijn.`,icon:'./icons/icon-192.png'});
    });
  },60000);
}
function scheduleMidnightReset() {
  const now=new Date(), midnight=new Date(now);
  midnight.setHours(24,0,0,0);
  setTimeout(()=>{
    if (state.profile?.breakfastTime) {
      state.mealSchedule=computeMealSchedule(state.profile.breakfastTime);
      db.settings.put({key:'mealSchedule',value:state.mealSchedule});
      renderMealSlots();
    }
    scheduleMidnightReset();
  }, midnight-now);
}

// ══════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════
function computeBMR() {
  const {weight:w=115,height:h=178,age:a=48}=state.profile||{};
  return Math.round((10*w+6.25*h-5*a+5)*1.4);
}
async function computeStreak() {
  const ts=await db.trainings.orderBy('date').toArray();
  if (!ts.length) return 0;
  const dates=[...new Set(ts.map(t=>t.date.split('T')[0]))].sort().reverse();
  let streak=0, check=new Date(); check.setHours(0,0,0,0);
  for (const ds of dates) {
    const d=new Date(ds);
    if (Math.round((check-d)/86400000)<=1){streak++; check=d;} else break;
  }
  return streak;
}
function formatSeconds(s) {
  s=Math.floor(s);
  const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), sec=s%60;
  return h>0?`${h}u ${m}m ${sec}s`:`${m}m ${sec}s`;
}
function formatDuration(ms) {
  const s=Math.floor(ms/1000), d=Math.floor(s/86400), h=Math.floor((s%86400)/3600), m=Math.floor((s%3600)/60);
  if (d>0) return `${d}d ${h}u ${m}m`;
  if (h>0) return `${h}u ${m}m`;
  return `${m}m`;
}
function vibrate(p) { try{navigator.vibrate?.(p);}catch(e){} }
function setText(id, val) { const el=document.getElementById(id); if(el) el.textContent=val; }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }
document.addEventListener('click', e=>{ if(e.target.classList.contains('modal-overlay')) e.target.classList.remove('active'); });

// ── START ────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', ()=>{
  init();
  if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged=()=>{};
});
