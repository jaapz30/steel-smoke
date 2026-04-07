// ═══════════════════════════════════════════════════════════
//  STEEL & SMOKE — app.js
//  Full-stack local-first PWA
// ═══════════════════════════════════════════════════════════

'use strict';

// ── SERVICE WORKER ─────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// ── DATABASE (Dexie / IndexedDB) ───────────────────────────
const db = new Dexie('SteelSmoke');
db.version(1).stores({
  settings:   'key',
  weights:    '++id, date',
  meals:      '++id, date',
  trainings:  '++id, date',
  gpsRoutes:  '++id, date',
  foodLog:    '++id, date'
});

// ── FOOD DATABASE ──────────────────────────────────────────
const FOODS = [
  { id:'kwark',       emoji:'🥛', name:'Magere Kwark',    kcal:57,  protein:10, carbs:4,  fat:0.2  },
  { id:'kip',         emoji:'🍗', name:'Kipfilet',         kcal:165, protein:31, carbs:0,  fat:3.6  },
  { id:'havermout',   emoji:'🌾', name:'Havermout',         kcal:389, protein:17, carbs:66, fat:7    },
  { id:'broccoli',    emoji:'🥦', name:'Broccoli',          kcal:34,  protein:3,  carbs:7,  fat:0.4  },
  { id:'ei',          emoji:'🥚', name:'Eieren',            kcal:155, protein:13, carbs:1,  fat:11   },
  { id:'zalm',        emoji:'🐟', name:'Zalm',              kcal:208, protein:20, carbs:0,  fat:13   },
  { id:'banaan',      emoji:'🍌', name:'Banaan',            kcal:89,  protein:1,  carbs:23, fat:0.3  },
  { id:'appel',       emoji:'🍎', name:'Appel',             kcal:52,  protein:0.3,carbs:14, fat:0.2  },
  { id:'rijst',       emoji:'🍚', name:'Zilvervliesrijst',  kcal:130, protein:3,  carbs:28, fat:1    },
  { id:'tonijn',      emoji:'🐠', name:'Tonijn (blik)',     kcal:116, protein:26, carbs:0,  fat:1    },
  { id:'volkoren',    emoji:'🍞', name:'Volkoren Brood',    kcal:247, protein:9,  carbs:49, fat:3    },
  { id:'pindakaas',  emoji:'🥜', name:'Pindakaas',         kcal:588, protein:25, carbs:20, fat:50   },
  { id:'spinazie',    emoji:'🥬', name:'Spinazie',          kcal:23,  protein:3,  carbs:4,  fat:0.4  },
  { id:'komkommer',   emoji:'🥒', name:'Komkommer',         kcal:15,  protein:0.7,carbs:3,  fat:0.1  },
  { id:'tomaatjes',   emoji:'🍅', name:'Tomaatjes',         kcal:18,  protein:0.9,carbs:4,  fat:0.2  },
  { id:'griekseyo',  emoji:'🥣', name:'Griekse Yoghurt',   kcal:97,  protein:9,  carbs:4,  fat:5    },
  { id:'cottage',     emoji:'🧀', name:'Cottage Cheese',    kcal:103, protein:11, carbs:3,  fat:5    },
  { id:'edamame',     emoji:'🫘', name:'Edamame',           kcal:121, protein:11, carbs:9,  fat:5    },
  { id:'cashews',     emoji:'🌰', name:'Cashewnoten (30g)', kcal:163, protein:4,  carbs:9,  fat:13   },
  { id:'roerei',      emoji:'🍳', name:'Roerei (2 ei)',     kcal:185, protein:12, carbs:2,  fat:14   },
  { id:'proteinesha', emoji:'🥤', name:'Proteïneshake',    kcal:130, protein:25, carbs:5,  fat:2    },
  { id:'mageremelk',  emoji:'🥛', name:'Magere Melk',      kcal:35,  protein:3.5,carbs:5,  fat:0.1  },
  { id:'kalkoen',     emoji:'🦃', name:'Kalkoenfilet',      kcal:157, protein:30, carbs:0,  fat:3    },
  { id:'paprika',     emoji:'🫑', name:'Paprika',           kcal:31,  protein:1,  carbs:6,  fat:0.3  },
  { id:'knolselderij',emoji:'🥬', name:'Knolselderij',      kcal:42,  protein:1.5,carbs:9,  fat:0.3  },
  { id:'aardappel',   emoji:'🥔', name:'Gekookte Aardappel',kcal:86,  protein:2,  carbs:20, fat:0.1  },
  { id:'zonnebloem',  emoji:'🌻', name:'Zonnebloempitjes',  kcal:584, protein:21, carbs:20, fat:51   },
  { id:'kiwi',        emoji:'🥝', name:'Kiwi',              kcal:61,  protein:1,  carbs:15, fat:0.5  },
  { id:'mager_rund',  emoji:'🥩', name:'Mager Rundvlees',  kcal:215, protein:26, carbs:0,  fat:12   },
  { id:'witte_bonen', emoji:'🫘', name:'Witte Bonen',       kcal:127, protein:9,  carbs:23, fat:0.5  },
  { id:'hummus',      emoji:'🫙', name:'Hummus (50g)',      kcal:177, protein:5,  carbs:14, fat:11   },
  { id:'avocado',     emoji:'🥑', name:'Avocado (½)',       kcal:120, protein:1.5,carbs:6,  fat:11   },
];

// ── GYM ACTIVITIES ─────────────────────────────────────────
const GYM_ACTIVITIES = [
  { id:'roeier',    emoji:'🚣', name:'Roeitrainer',  met:7.0,  desc:'Volledig lichaam' },
  { id:'loopband',  emoji:'🏃', name:'Loopband',      met:8.5,  desc:'Cardio boost' },
  { id:'gewichten', emoji:'🏋️', name:'Gewichten',     met:5.0,  desc:'Kracht opbouw' },
  { id:'trap',      emoji:'🪜', name:'Trap',          met:8.0,  desc:'HIIT-style' },
  { id:'fietsen',   emoji:'🚴', name:'Hometrainer',   met:6.8,  desc:'Low-impact cardio' },
  { id:'zwemmen',   emoji:'🏊', name:'Zwemmen',       met:8.0,  desc:'Volledig lichaam' },
];

// ── HEALTH MILESTONES ──────────────────────────────────────
const HEALTH_MILESTONES = [
  { minutes:20,    title:'Hartslag normaliseert',        desc:'Je bloeddruk en hartslag dalen naar normaal niveau.' },
  { minutes:480,   title:'CO vrij uit bloed',            desc:'Koolmonoxide is volledig uit je bloedbaan verdwenen.' },
  { minutes:1440,  title:'Hartaanval risico daalt',      desc:'24 uur: je kans op een hartaanval begint te dalen.' },
  { minutes:2880,  title:'Smaak & geur terug',           desc:'48 uur: zenuwuiteinden herstellen. Smaken worden intenser.' },
  { minutes:4320,  title:'Longen beginnen te reinigen',  desc:'72 uur: slijm en afvalstoffen worden afgevoerd.' },
  { minutes:10080, title:'Conditie merkbaar beter',      desc:'1 week: je merkt dat lopen makkelijker gaat.' },
  { minutes:43200, title:'Longfunctie +10%',             desc:'1 maand: je longen functioneren significant beter.' },
  { minutes:129600,title:'Longfunctie +30%',             desc:'3 maanden: wimperharen in longen volledig hersteld.' },
  { minutes:525600,title:'Hart risico gehalveerd',       desc:'1 jaar: je risico op hartziekte is 50% lager dan een roker.' },
  { minutes:2628000,title:'Risico gelijk aan niet-roker',desc:'5 jaar: je hart-/vaatrisico is gelijk aan iemand die nooit rookte.' },
];

// ── SOS COMMANDS ───────────────────────────────────────────
const SOS_COMMANDS = [
  { cmd:'Doe nu 15 squats! Beweeg dat lijf!', speech:'Doe nu 15 squats! Kom op soldaat, beweeg!' },
  { cmd:'20 push-ups! Geen excuses!', speech:'Twintig push-ups! Nu! Geen enkel excuus!' },
  { cmd:'Loop 5 minuten buiten! Frisse lucht!', speech:'Naar buiten! Loop vijf minuten. Jij kan dit!' },
  { cmd:'Drink een groot glas koud water!', speech:'Pak een groot glas koud water en drink het nu op!' },
  { cmd:'Doe een 4-7-8 ademhaling! 3 keer!', speech:'Adem in voor vier seconden, houd vast voor zeven, uit voor acht. Drie keer!' },
  { cmd:'30 seconden plank! Sta sterk!', speech:'Plank positie! Dertig seconden! Houd vol soldaat!' },
  { cmd:'15 jumping jacks! Activeer je lichaam!', speech:'Vijftien jumping jacks! Activeer je lichaam nu!' },
  { cmd:'Bel iemand die je steunt!', speech:'Pak je telefoon en bel iemand die jou steunt. Nu!' },
  { cmd:'Poets je tanden! Afleiden werkt!', speech:'Naar de badkamer. Poets je tanden. Afleiding werkt altijd.' },
  { cmd:'10 minuten wandelen buiten!', speech:'Schoenen aan, deur uit. Tien minuten wandelen. Jij kan dit!' },
];

// ── STATE ──────────────────────────────────────────────────
let state = {
  profile: null,
  currentScreen: 'dashboard',
  mealSchedule: [],
  foodPreferences: [],
  activeTraining: null,
  timerInterval: null,
  timerPaused: false,
  timerPauseStart: null,
  timerPausedTotal: 0,
  gpsActive: false,
  gpsManualEbike: false,
  gpsWatchId: null,
  gpsPositions: [],
  gpsStartTime: null,
  gpsDistance: 0,
  gpsLastPos: null,
  sosActive: false,
  sosInterval: null,
  smokingStop: null,
  smokeInterval: null,
  currentMealIndex: null,
  activePeriod: 'dag',
  weightEntries: [],
  todayFoodLog: [],
};

// ══════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════
async function init() {
  // Load profile
  const profileRec = await db.settings.get('profile');
  state.profile = profileRec ? profileRec.value : null;

  const smokeRec = await db.settings.get('smokingStop');
  state.smokingStop = smokeRec ? new Date(smokeRec.value) : null;

  const prefsRec = await db.settings.get('foodPreferences');
  state.foodPreferences = prefsRec ? prefsRec.value : [];

  const mealRec = await db.settings.get('mealSchedule');
  if (mealRec) {
    state.mealSchedule = mealRec.value;
  } else if (state.profile && state.profile.breakfastTime) {
    state.mealSchedule = computeMealSchedule(state.profile.breakfastTime);
  }

  // Load weight entries
  state.weightEntries = await db.weights.orderBy('date').toArray();

  // Show setup or main app
  if (!state.profile || !state.profile.weight) {
    showSetup();
  } else {
    hideSetup();
    initApp();
  }

  // Always start background ticks
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
}

// ══════════════════════════════════════════════════════════
//  CLOCK TICK — every second
// ══════════════════════════════════════════════════════════
function startClockTick() {
  setInterval(() => {
    updateClock();
    if (state.currentScreen === 'dashboard') updateDashboardLive();
    if (state.currentScreen === 'smoke') updateSmokeLive();
  }, 1000);
}

function updateClock() {
  const now = new Date();
  const timeEl = document.getElementById('dash-time');
  if (timeEl) timeEl.textContent = now.toLocaleTimeString('nl-NL', { hour:'2-digit', minute:'2-digit' });
}

// ══════════════════════════════════════════════════════════
//  SETUP / ONBOARDING
// ══════════════════════════════════════════════════════════
function showSetup() {
  document.getElementById('setup-screen').classList.remove('hidden');
  // Pre-fill datetime for smoking stop
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const smokeInput = document.getElementById('smoke-stop-input');
  if (smokeInput) smokeInput.value = now.toISOString().slice(0,16);
}

function hideSetup() {
  document.getElementById('setup-screen').classList.add('hidden');
}

function setupStep2() {
  const w = parseFloat(document.getElementById('setup-weight').value);
  const h = parseInt(document.getElementById('setup-height').value);
  const a = parseInt(document.getElementById('setup-age').value);
  const n = document.getElementById('setup-name').value.trim() || 'Soldaat';

  if (!w || !h || !a) { toast('Vul alle verplichte velden in!', 'error'); return; }

  // Save partial profile
  state.profile = { weight: w, startWeight: w, height: h, age: a, name: n, breakfastTime: '07:00' };
  showSetupStep(2);
}

function setupStep3() {
  const bt = document.getElementById('setup-breakfast').value || '07:00';
  const cigs = parseInt(document.getElementById('setup-cigs').value) || 20;
  const price = parseFloat(document.getElementById('setup-cig-price').value) || 9.50;

  state.profile.breakfastTime = bt;
  state.profile.cigsPerDay = cigs;
  state.profile.cigPackPrice = price;
  state.mealSchedule = computeMealSchedule(bt);

  showSetupStep(3);
}

async function finishSetup() {
  // Save profile
  state.profile.setupDate = new Date().toISOString();
  await db.settings.put({ key: 'profile', value: state.profile });
  await db.settings.put({ key: 'mealSchedule', value: state.mealSchedule });

  // Save food preferences
  const selected = [...document.querySelectorAll('#food-matrix-setup .food-item.selected')].map(el => el.dataset.id);
  state.foodPreferences = selected.length > 0 ? selected : FOODS.map(f => f.id);
  await db.settings.put({ key: 'foodPreferences', value: state.foodPreferences });

  // Log start weight
  await db.weights.add({ date: new Date().toISOString(), weight: state.profile.startWeight });
  state.weightEntries = await db.weights.orderBy('date').toArray();

  hideSetup();
  initApp();
  showScreen('dashboard');
  toast('Missie gestart! Tijd voor actie, ' + state.profile.name + '!', 'success');
  speak('Welkom soldaat! De missie is gestart. Tijd om stalen discipline te tonen!');
}

async function skipSetup() {
  // Minimal default profile
  state.profile = {
    weight: 115, startWeight: 115, height: 178, age: 48, name: 'Soldaat',
    breakfastTime: '07:00', cigsPerDay: 20, cigPackPrice: 9.50,
    setupDate: new Date().toISOString()
  };
  state.mealSchedule = computeMealSchedule('07:00');
  state.foodPreferences = FOODS.map(f => f.id);
  await db.settings.put({ key: 'profile', value: state.profile });
  await db.settings.put({ key: 'mealSchedule', value: state.mealSchedule });
  await db.settings.put({ key: 'foodPreferences', value: state.foodPreferences });
  state.weightEntries = await db.weights.orderBy('date').toArray();
  hideSetup();
  initApp();
  showScreen('dashboard');
  toast('App gestart! Vul je profiel later in via Instellingen.', 'success');
}

function showSetupStep(n) {
  document.querySelectorAll('.setup-step').forEach(el => el.classList.remove('active'));
  document.getElementById('setup-step-' + n).classList.add('active');
}
function setupStepBack(n) { showSetupStep(n); }

// ══════════════════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════════════════
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const screen = document.getElementById('screen-' + name);
  if (screen) screen.classList.add('active');

  const navItem = document.querySelector(`[data-screen="${name}"]`);
  if (navItem) navItem.classList.add('active');

  state.currentScreen = name;

  // Refresh on switch
  if (name === 'dashboard') updateDashboard();
  if (name === 'food') renderMealSlots();
  if (name === 'smoke') updateSmokeScreen();
  if (name === 'report') renderReport(state.activePeriod);
  if (name === 'training') renderRecentTrainings();

  vibrate(20);
}

// ══════════════════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════════════════
async function updateDashboard() {
  if (!state.profile) return;

  const now = new Date();
  const days = ['Zondag','Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag'];
  const months = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];

  document.getElementById('dash-date').textContent =
    `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  // Greeting
  const h = now.getHours();
  let greet = h < 6 ? 'Nog wakker, ' : h < 12 ? 'Goedmorgen, ' : h < 18 ? 'Goedmiddag, ' : 'Goedenavond, ';
  document.getElementById('greeting-text').textContent = greet + (state.profile.name || 'Soldaat') + '!';

  // Weight stats
  const startW = state.profile.startWeight || state.profile.weight || 115;
  const currentW = state.weightEntries.length > 0
    ? state.weightEntries[state.weightEntries.length - 1].weight
    : startW;
  const lost = startW - currentW;
  const bmi = currentW / Math.pow((state.profile.height || 178) / 100, 2);

  document.getElementById('dash-weight-start').textContent = startW.toFixed(1);
  document.getElementById('dash-weight-now').textContent = currentW.toFixed(1);
  document.getElementById('dash-weight-lost').textContent = (lost >= 0 ? '-' : '+') + Math.abs(lost).toFixed(1);
  document.getElementById('dash-bmi').textContent = bmi.toFixed(1);

  // Streak
  const streak = await computeStreak();
  document.getElementById('dash-streak').textContent = `🔥 ${streak} dagen`;

  // Calories
  const todayLog = await getTodayFoodLog();
  const totalEaten = todayLog.reduce((sum, e) => sum + (e.kcal || 0), 0);
  const burned = await getTodayCaloriesBurned();
  const bmr = computeBMR();
  document.getElementById('dash-kcal-eaten').textContent = totalEaten + ' kcal';
  document.getElementById('dash-kcal-burned').textContent = burned + ' kcal';
  document.getElementById('dash-kcal-goal').textContent = bmr + ' kcal';
  const pct = Math.min(100, Math.round(totalEaten / bmr * 100));
  document.getElementById('dash-cal-bar').style.width = pct + '%';

  // Smoke status
  updateDashSmoke();

  // Next meal
  updateNextMeal();

  // Weight chart
  drawWeightChart();
}

function updateDashboardLive() {
  updateDashSmoke();
}

function updateDashSmoke() {
  const el = document.getElementById('dash-smoke-status');
  const el2 = document.getElementById('dash-smoke-saved');
  if (!state.smokingStop) {
    el.textContent = 'Stel stopmoment in →';
    el.style.color = 'var(--steel)';
    el2.textContent = '';
    return;
  }
  const diff = Date.now() - state.smokingStop.getTime();
  el.textContent = formatDuration(diff);
  el.style.color = 'var(--green-bright)';
  const saved = computeMoneySaved(diff);
  el2.textContent = `€${saved} bespaard • ${computeCigsNotSmoked(diff)} sigaretten gemist`;
}

function updateNextMeal() {
  const el = document.getElementById('dash-next-meal');
  if (!state.mealSchedule || state.mealSchedule.length === 0) {
    el.textContent = 'Geen schema ingesteld';
    return;
  }
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const next = state.mealSchedule.find(m => {
    const [h, min] = m.split(':').map(Number);
    return h * 60 + min > nowMin;
  });
  if (next) {
    const [h, m] = next.split(':').map(Number);
    const mins = h * 60 + m - nowMin;
    el.innerHTML = `<strong style="color:var(--amber);font-family:var(--font-mono)">${next}</strong> — over ${mins} minuten`;
  } else {
    el.textContent = 'Geen eetmomenten meer vandaag. Goed gedaan!';
  }
}

// ══════════════════════════════════════════════════════════
//  WEIGHT CHART (Canvas)
// ══════════════════════════════════════════════════════════
function drawWeightChart() {
  const canvas = document.getElementById('weight-chart');
  const emptyEl = document.getElementById('weight-chart-empty');
  if (!canvas) return;

  const entries = state.weightEntries.slice(-30); // last 30 entries

  if (entries.length < 2) {
    canvas.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }

  canvas.style.display = 'block';
  if (emptyEl) emptyEl.style.display = 'none';

  const W = canvas.offsetWidth || 320;
  const H = 100;
  canvas.width = W * window.devicePixelRatio;
  canvas.height = H * window.devicePixelRatio;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const weights = entries.map(e => e.weight);
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;
  const rangeW = maxW - minW || 1;

  const pad = 8;
  const chartW = W - pad * 2;
  const chartH = H - pad * 2;

  // Background
  ctx.fillStyle = '#161616';
  ctx.fillRect(0, 0, W, H);

  // Grid line
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  const midY = pad + chartH / 2;
  ctx.beginPath(); ctx.moveTo(pad, midY); ctx.lineTo(W - pad, midY); ctx.stroke();
  ctx.setLineDash([]);

  // Line
  ctx.beginPath();
  ctx.strokeStyle = '#27ae60';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';

  entries.forEach((e, i) => {
    const x = pad + (i / (entries.length - 1)) * chartW;
    const y = pad + chartH - ((e.weight - minW) / rangeW) * chartH;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Area fill
  ctx.beginPath();
  entries.forEach((e, i) => {
    const x = pad + (i / (entries.length - 1)) * chartW;
    const y = pad + chartH - ((e.weight - minW) / rangeW) * chartH;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(pad + chartW, pad + chartH);
  ctx.lineTo(pad, pad + chartH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(39,174,96,0.1)';
  ctx.fill();

  // Dots
  entries.forEach((e, i) => {
    const x = pad + (i / (entries.length - 1)) * chartW;
    const y = pad + chartH - ((e.weight - minW) / rangeW) * chartH;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#27ae60';
    ctx.fill();
  });

  // Labels
  ctx.fillStyle = '#7f8c8d';
  ctx.font = '10px Share Tech Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(maxW.toFixed(1) + 'kg', pad, pad + 10);
  ctx.textAlign = 'right';
  ctx.fillText(minW.toFixed(1) + 'kg', W - pad, H - pad);
}

// ══════════════════════════════════════════════════════════
//  WEIGHT LOGGING
// ══════════════════════════════════════════════════════════
function showWeightModal() {
  const modal = document.getElementById('weight-modal');
  modal.classList.add('active');
  renderWeightHistory();
}

function renderWeightHistory() {
  const container = document.getElementById('weight-history');
  if (!container) return;
  const entries = [...state.weightEntries].reverse().slice(0, 15);
  if (entries.length === 0) { container.innerHTML = ''; return; }

  let html = '<div style="font-family:var(--font-display);font-size:14px;letter-spacing:1px;color:var(--steel);margin-bottom:8px;">GEWICHTSLOG</div>';
  entries.forEach((e, i) => {
    const prev = entries[i + 1];
    const delta = prev ? e.weight - prev.weight : 0;
    const deltaStr = delta !== 0 ? (delta > 0 ? '+' : '') + delta.toFixed(1) + ' kg' : '—';
    const deltaClass = delta < 0 ? 'down' : delta > 0 ? 'up' : '';
    const date = new Date(e.date);
    html += `<div class="weight-entry">
      <span class="we-date">${date.toLocaleDateString('nl-NL', {day:'2-digit',month:'short'})}</span>
      <span class="we-val">${e.weight.toFixed(1)} kg</span>
      <span class="we-delta ${deltaClass}">${deltaStr}</span>
    </div>`;
  });
  container.innerHTML = html;
}

async function logWeight() {
  const input = document.getElementById('weight-input');
  const w = parseFloat(input.value);
  if (!w || w < 30 || w > 300) { toast('Voer een geldig gewicht in!', 'error'); return; }

  await db.weights.add({ date: new Date().toISOString(), weight: w });
  state.weightEntries = await db.weights.orderBy('date').toArray();

  // Update current weight in profile
  state.profile.weight = w;
  await db.settings.put({ key: 'profile', value: state.profile });

  input.value = '';
  toast(`${w} kg gelogd!`, 'success');
  vibrate([30, 20, 30]);
  renderWeightHistory();
  drawWeightChart();
  updateDashboard();

  const prev = state.weightEntries[state.weightEntries.length - 2];
  if (prev && w < prev.weight) {
    const diff = (prev.weight - w).toFixed(1);
    speak(`Goed bezig soldaat! Je bent ${diff} kilo lichter. Strak!`);
  }
}

// ══════════════════════════════════════════════════════════
//  MEAL SCHEDULE
// ══════════════════════════════════════════════════════════
function computeMealSchedule(breakfastTime) {
  const [h, m] = breakfastTime.split(':').map(Number);
  return Array.from({ length: 6 }, (_, i) => {
    const totalMin = h * 60 + m + i * 180;
    const hh = Math.floor(totalMin / 60) % 24;
    const mm = totalMin % 60;
    return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
  });
}

function shiftMealsNow() {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const currentIdx = state.mealSchedule.findIndex(t => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m > nowMin - 30;
  });
  if (currentIdx === -1) { toast('Geen eetmomenten meer vandaag!'); return; }

  // Shift current and future meals from now
  const newSchedule = [...state.mealSchedule];
  for (let i = currentIdx; i < 6; i++) {
    const offset = (i - currentIdx) * 180;
    const totalMin = nowMin + offset;
    const hh = Math.floor(totalMin / 60) % 24;
    const mm = totalMin % 60;
    newSchedule[i] = `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
  }
  state.mealSchedule = newSchedule;
  db.settings.put({ key: 'mealSchedule', value: state.mealSchedule });
  renderMealSlots();
  toast('Schema verschoven naar nu!', 'success');
  vibrate(30);
}

function showBreakfastPicker() {
  const modal = document.getElementById('breakfast-modal');
  document.getElementById('breakfast-time-input').value = state.mealSchedule[0] || '07:00';
  modal.classList.add('active');
}

function updateBreakfastTime() {
  const t = document.getElementById('breakfast-time-input').value;
  state.mealSchedule = computeMealSchedule(t);
  if (state.profile) {
    state.profile.breakfastTime = t;
    db.settings.put({ key: 'profile', value: state.profile });
  }
  db.settings.put({ key: 'mealSchedule', value: state.mealSchedule });
  closeModal('breakfast-modal');
  renderMealSlots();
  toast('Schema bijgewerkt!', 'success');
}

async function renderMealSlots() {
  const container = document.getElementById('meal-slots-container');
  if (!container) return;

  const todayLog = await getTodayFoodLog();
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const mealNames = ['Ontbijt', 'Tussendoor', 'Lunch', 'Tussendoor', 'Avondeten', 'Tussendoor'];

  let html = '';
  state.mealSchedule.forEach((time, i) => {
    const [h, m] = time.split(':').map(Number);
    const mealMin = h * 60 + m;
    const isDone = todayLog.some(e => e.mealIndex === i);
    const isActive = Math.abs(mealMin - nowMin) < 30 && !isDone;
    const cls = isDone ? 'done' : isActive ? 'active-now' : '';

    // Find suggestion
    const suggestion = getSuggestionForMeal(i);
    const check = isDone ? '✅' : isActive ? '🔔' : '○';

    html += `<div class="meal-slot ${cls}" onclick="openMealModal(${i})">
      <div class="meal-time">${time}</div>
      <div>
        <div class="meal-name">${mealNames[i]}</div>
        <div class="meal-kcal">${suggestion ? suggestion.name + ' · ' + suggestion.kcal + ' kcal' : '—'}</div>
      </div>
      <div class="meal-check">${check}</div>
    </div>`;
  });

  container.innerHTML = html;
  updateFoodTotals();
}

function getSuggestionForMeal(mealIndex) {
  const prefs = state.foodPreferences.length > 0
    ? FOODS.filter(f => state.foodPreferences.includes(f.id))
    : FOODS;

  if (prefs.length === 0) return null;

  // Deterministic but varied selection based on meal index and day
  const day = new Date().getDay();
  const idx = (mealIndex * 7 + day * 3) % prefs.length;
  return prefs[idx];
}

function openMealModal(mealIndex) {
  state.currentMealIndex = mealIndex;
  const mealNames = ['Ontbijt', 'Tussendoor', 'Lunch', 'Tussendoor', 'Avondeten', 'Tussendoor'];
  document.getElementById('meal-modal-title').textContent =
    `${mealNames[mealIndex]} — ${state.mealSchedule[mealIndex]}`;

  const prefs = state.foodPreferences.length > 0
    ? FOODS.filter(f => state.foodPreferences.includes(f.id))
    : FOODS;

  const suggestions = [];
  for (let i = 0; i < 4; i++) {
    const day = new Date().getDay();
    const idx = (mealIndex * 7 + day * 3 + i * 11) % prefs.length;
    const food = prefs[idx];
    if (food && !suggestions.find(s => s.id === food.id)) suggestions.push(food);
  }

  const container = document.getElementById('meal-modal-suggestions');
  let html = '<div style="font-size:13px;color:var(--steel);margin-bottom:10px;letter-spacing:1px;text-transform:uppercase;">Suggesties voor jou</div>';
  suggestions.forEach(food => {
    html += `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);">
      <span style="font-size:24px;">${food.emoji}</span>
      <div style="flex:1;">
        <div style="font-weight:700;font-size:15px;">${food.name}</div>
        <div style="font-size:12px;color:var(--steel);">${food.kcal} kcal · ${food.protein}g eiwit · ${food.carbs}g koolh · ${food.fat}g vet</div>
      </div>
    </div>`;
  });
  container.innerHTML = html;
  document.getElementById('meal-modal').classList.add('active');
}

async function markMealDone() {
  const i = state.currentMealIndex;
  if (i === null) return;
  const suggestion = getSuggestionForMeal(i);
  const entry = {
    date: new Date().toISOString().split('T')[0],
    mealIndex: i,
    time: state.mealSchedule[i],
    food: suggestion ? suggestion.name : 'Onbekend',
    kcal: suggestion ? suggestion.kcal : 0,
    protein: suggestion ? suggestion.protein : 0,
    carbs: suggestion ? suggestion.carbs : 0,
    fat: suggestion ? suggestion.fat : 0,
  };
  await db.foodLog.add(entry);
  closeModal('meal-modal');
  toast('Gegeten! Goed bezig!', 'success');
  vibrate(30);
  renderMealSlots();
}

async function getTodayFoodLog() {
  const today = new Date().toISOString().split('T')[0];
  return db.foodLog.where('date').equals(today).toArray();
}

async function updateFoodTotals() {
  const log = await getTodayFoodLog();
  const totals = log.reduce((acc, e) => {
    acc.kcal += e.kcal || 0;
    acc.protein += e.protein || 0;
    acc.carbs += e.carbs || 0;
    acc.fat += e.fat || 0;
    return acc;
  }, { kcal:0, protein:0, carbs:0, fat:0 });

  const el = document.getElementById('food-total-kcal');
  if (el) el.textContent = totals.kcal;
  const ep = document.getElementById('macro-protein'); if (ep) ep.textContent = Math.round(totals.protein) + 'g';
  const ec = document.getElementById('macro-carbs'); if (ec) ec.textContent = Math.round(totals.carbs) + 'g';
  const ef = document.getElementById('macro-fat'); if (ef) ef.textContent = Math.round(totals.fat) + 'g';
  const ek = document.getElementById('macro-kcal'); if (ek) ek.textContent = Math.round(totals.kcal);
}

// ══════════════════════════════════════════════════════════
//  FOOD MATRIX (preferences)
// ══════════════════════════════════════════════════════════
function renderFoodMatrix(containerId, setupMode) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let html = '';
  FOODS.forEach(food => {
    const isSelected = setupMode
      ? state.foodPreferences.includes(food.id) || state.foodPreferences.length === 0
      : state.foodPreferences.includes(food.id);
    const sel = isSelected ? 'selected' : '';
    html += `<div class="food-item ${sel}" data-id="${food.id}" onclick="toggleFood(this,'${containerId}')">
      <div class="food-emoji">${food.emoji}</div>
      <div class="food-info">
        <div class="food-name">${food.name}</div>
        <div class="food-macro">${food.kcal} kcal · ${food.protein}g P</div>
      </div>
      <div class="food-cb">${isSelected ? '✓' : ''}</div>
    </div>`;
  });
  container.innerHTML = html;
}

async function toggleFood(el, containerId) {
  el.classList.toggle('selected');
  const cb = el.querySelector('.food-cb');
  cb.textContent = el.classList.contains('selected') ? '✓' : '';

  if (containerId === 'food-matrix-main') {
    const selected = [...document.querySelectorAll('#food-matrix-main .food-item.selected')].map(e => e.dataset.id);
    state.foodPreferences = selected;
    await db.settings.put({ key: 'foodPreferences', value: state.foodPreferences });
    // Sync to setup matrix if visible
    renderFoodMatrix('food-matrix-setup', true);
  }
  vibrate(15);
}

// ══════════════════════════════════════════════════════════
//  GYM TRAINING
// ══════════════════════════════════════════════════════════
function renderGymButtons() {
  const container = document.getElementById('gym-buttons-grid');
  if (!container) return;
  let html = '';
  GYM_ACTIVITIES.forEach(act => {
    html += `<div class="gym-btn" id="gym-${act.id}" onclick="startGymActivity('${act.id}')">
      <div class="gym-icon">${act.emoji}</div>
      <div>${act.name}</div>
      <div class="gym-met">MET ${act.met} · ${act.desc}</div>
    </div>`;
  });
  container.innerHTML = html;
}

function startGymActivity(activityId) {
  if (state.activeTraining) { toast('Stop eerst de huidige activiteit!', 'error'); return; }

  const act = GYM_ACTIVITIES.find(a => a.id === activityId);
  if (!act) return;

  state.activeTraining = {
    id: activityId,
    name: act.name,
    met: act.met,
    startTime: Date.now(),
    pausedTotal: 0,
    type: 'gym'
  };
  state.timerPaused = false;
  state.timerPausedTotal = 0;

  document.getElementById('timer-activity-name').textContent = act.emoji + ' ' + act.name.toUpperCase();
  document.getElementById('training-timer-panel').style.display = 'block';

  document.querySelectorAll('.gym-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('gym-' + activityId)?.classList.add('active');

  state.timerInterval = setInterval(updateGymTimer, 1000);
  vibrate([30, 10, 30]);
  speak(`${act.name} gestart! Kom op soldaat!`);
}

function updateGymTimer() {
  if (state.timerPaused) return;
  const elapsed = (Date.now() - state.activeTraining.startTime - state.timerPausedTotal) / 1000;
  document.getElementById('timer-display').textContent = formatSeconds(elapsed);

  const weight = state.profile?.weight || 115;
  const kcal = Math.round(state.activeTraining.met * weight * (elapsed / 3600) * 1.05);
  document.getElementById('timer-kcal-display').textContent = kcal + ' kcal';
}

function toggleTimerPause() {
  if (!state.activeTraining) return;
  const btn = document.getElementById('timer-pause-btn');
  if (state.timerPaused) {
    state.timerPausedTotal += Date.now() - state.timerPauseStart;
    state.timerPaused = false;
    btn.textContent = '⏸ Pauze';
    toast('Hervat!');
  } else {
    state.timerPauseStart = Date.now();
    state.timerPaused = true;
    btn.textContent = '▶ Hervat';
    toast('Gepauzeerd');
  }
  vibrate(20);
}

async function stopTraining() {
  if (!state.activeTraining) return;
  clearInterval(state.timerInterval);

  const elapsed = (Date.now() - state.activeTraining.startTime - state.timerPausedTotal) / 1000;
  const weight = state.profile?.weight || 115;
  const kcal = Math.round(state.activeTraining.met * weight * (elapsed / 3600) * 1.05);

  // Save to DB
  await db.trainings.add({
    date: new Date().toISOString(),
    type: state.activeTraining.type || 'gym',
    name: state.activeTraining.name,
    duration: Math.round(elapsed),
    kcal: kcal,
    met: state.activeTraining.met,
  });

  const durationStr = formatSeconds(elapsed);
  toast(`✅ ${state.activeTraining.name}: ${durationStr} · ${kcal} kcal verbrand!`, 'success');
  speak(`Sessie complete. ${durationStr} gesloopt. ${kcal} calorieën verbrand. Jij bent een machine!`);
  vibrate([50, 30, 50, 30, 50]);

  state.activeTraining = null;
  state.timerPaused = false;
  state.timerPausedTotal = 0;
  document.getElementById('training-timer-panel').style.display = 'none';
  document.querySelectorAll('.gym-btn').forEach(b => b.classList.remove('active'));

  renderRecentTrainings();
  updateDashboard();
}

async function renderRecentTrainings() {
  const container = document.getElementById('recent-trainings');
  if (!container) return;

  const trainings = await db.trainings.orderBy('date').reverse().limit(5).toArray();
  if (trainings.length === 0) {
    container.innerHTML = '<div style="color:var(--steel);font-size:14px;">Nog geen trainingen gelogd</div>';
    return;
  }

  let html = '';
  trainings.forEach(t => {
    const date = new Date(t.date);
    html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);">
      <div>
        <div style="font-weight:700;font-size:14px;">${t.name}</div>
        <div style="font-size:12px;color:var(--steel);font-family:var(--font-mono);">${date.toLocaleDateString('nl-NL')} · ${formatSeconds(t.duration)}</div>
      </div>
      <div style="font-family:var(--font-mono);color:var(--amber);font-size:16px;">${t.kcal} kcal</div>
    </div>`;
  });
  container.innerHTML = html;
}

async function getTodayCaloriesBurned() {
  const today = new Date().toISOString().split('T')[0];
  const trainings = await db.trainings.where('date').startsWith(today).toArray();
  return trainings.reduce((sum, t) => sum + (t.kcal || 0), 0);
}

// ══════════════════════════════════════════════════════════
//  GPS TRACKING
// ══════════════════════════════════════════════════════════
function startGPS() {
  if (!navigator.geolocation) { toast('GPS niet beschikbaar op dit apparaat', 'error'); return; }

  state.gpsActive = true;
  state.gpsPositions = [];
  state.gpsDistance = 0;
  state.gpsLastPos = null;
  state.gpsStartTime = Date.now();

  document.getElementById('gps-start-btn').style.display = 'none';
  document.getElementById('gps-stop-btn').style.display = 'flex';
  document.getElementById('gps-status').textContent = 'GPS actief — Bezig met tracken...';

  // Also start a training timer for GPS
  state.activeTraining = {
    id: 'gps',
    name: state.gpsManualEbike ? 'E-bike' : 'Wandelen/Fietsen',
    met: 3.5, // will be updated dynamically
    startTime: Date.now(),
    pausedTotal: 0,
    type: 'gps'
  };
  document.getElementById('timer-activity-name').textContent = '🗺️ GPS TRACKING';
  document.getElementById('training-timer-panel').style.display = 'block';
  state.timerPaused = false;
  state.timerPausedTotal = 0;
  state.timerInterval = setInterval(updateGymTimer, 1000);

  state.gpsWatchId = navigator.geolocation.watchPosition(
    onGPSPosition,
    onGPSError,
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
  );

  toast('GPS gestart! Loop soldaat!', 'success');
  vibrate([30, 10, 30]);
}

function onGPSPosition(pos) {
  const { latitude, longitude, speed, accuracy } = pos.coords;
  const statusEl = document.getElementById('gps-status');

  if (statusEl) statusEl.textContent = `Acc: ${Math.round(accuracy)}m | ${new Date().toLocaleTimeString('nl-NL')}`;

  if (state.gpsLastPos) {
    const dist = haversine(state.gpsLastPos.lat, state.gpsLastPos.lng, latitude, longitude);
    if (dist > 0.002 && accuracy < 50) { // min 2m movement, max 50m accuracy
      state.gpsDistance += dist;
    }
  }

  state.gpsLastPos = { lat: latitude, lng: longitude };
  state.gpsPositions.push({ lat: latitude, lng: longitude, t: Date.now() });

  // Speed: use GPS speed or compute from positions
  const kmh = speed ? speed * 3.6 : computeSpeed();
  const isEbike = state.gpsManualEbike || kmh > 15;

  // Update MET based on activity
  let met, modeLabel, modeTag;
  if (isEbike) {
    met = 5.0; modeLabel = 'E-bike'; modeTag = '<span class="tag tag-amber">🚴 E-bike</span>';
  } else if (kmh > 6) {
    met = 8.0; modeLabel = 'Hardlopen'; modeTag = '<span class="tag tag-red">🏃 Hardlopen</span>';
  } else {
    met = 3.5; modeLabel = 'Wandelen'; modeTag = '<span class="tag tag-green">🚶 Wandelen</span>';
  }

  if (state.activeTraining) state.activeTraining.met = met;

  // Update UI
  document.getElementById('gps-distance').textContent = state.gpsDistance.toFixed(2);
  document.getElementById('gps-speed').textContent = kmh.toFixed(1);
  document.getElementById('gps-mode-label').textContent = modeLabel;
  document.getElementById('gps-mode-tag').innerHTML = modeTag;

  // Kcal
  const elapsed = (Date.now() - state.gpsStartTime) / 1000 / 3600;
  const weight = state.profile?.weight || 115;
  const kcal = Math.round(met * weight * elapsed * 1.05);
  document.getElementById('gps-kcal').textContent = kcal;
}

function onGPSError(err) {
  const statusEl = document.getElementById('gps-status');
  if (statusEl) statusEl.textContent = 'GPS fout: ' + err.message;
  toast('GPS fout — check permissies', 'error');
}

function computeSpeed() {
  const positions = state.gpsPositions;
  if (positions.length < 2) return 0;
  const last = positions[positions.length - 1];
  const prev = positions[positions.length - 2];
  const dist = haversine(prev.lat, prev.lng, last.lat, last.lng); // km
  const time = (last.t - prev.t) / 3600000; // hours
  return time > 0 ? dist / time : 0;
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function stopGPS() {
  if (state.gpsWatchId !== null) {
    navigator.geolocation.clearWatch(state.gpsWatchId);
    state.gpsWatchId = null;
  }
  state.gpsActive = false;

  document.getElementById('gps-start-btn').style.display = 'flex';
  document.getElementById('gps-stop-btn').style.display = 'none';
  document.getElementById('gps-status').textContent = 'GPS gestopt';

  // Save GPS training
  if (state.activeTraining && state.activeTraining.type === 'gps') {
    await stopTraining();
  }

  // Save route
  if (state.gpsPositions.length > 0) {
    await db.gpsRoutes.add({
      date: new Date().toISOString(),
      positions: state.gpsPositions,
      distance: state.gpsDistance,
    });
  }

  toast(`🗺️ Route opgeslagen — ${state.gpsDistance.toFixed(2)} km`, 'success');

  // Reset GPS display
  state.gpsDistance = 0;
  state.gpsPositions = [];
  document.getElementById('gps-distance').textContent = '0.0';
  document.getElementById('gps-speed').textContent = '0.0';
  document.getElementById('gps-kcal').textContent = '0';
}

function toggleGPSManual() {
  state.gpsManualEbike = !state.gpsManualEbike;
  const modeTag = document.getElementById('gps-mode-tag');
  if (state.gpsManualEbike) {
    modeTag.innerHTML = '<span class="tag tag-amber">🚴 E-bike (handmatig)</span>';
    toast('E-bike modus actief');
  } else {
    modeTag.innerHTML = '<span class="tag tag-green">🚶 Wandelen</span>';
    toast('Automatische detectie actief');
  }
}

// ══════════════════════════════════════════════════════════
//  SMOKING / STOP MODULE
// ══════════════════════════════════════════════════════════
async function setSmokingStop() {
  const input = document.getElementById('smoke-stop-input');
  if (!input.value) { toast('Selecteer een datum en tijd!', 'error'); return; }

  const dt = new Date(input.value);
  if (isNaN(dt.getTime())) { toast('Ongeldige datum!', 'error'); return; }

  state.smokingStop = dt;
  await db.settings.put({ key: 'smokingStop', value: dt.toISOString() });

  toast('Stopmoment geregistreerd! Jij kan dit!', 'success');
  vibrate([50, 30, 50]);
  speak('Geregistreerd! Jij hebt de kracht om dit te doen! De missie is gestart!');

  updateSmokeScreen();
  startSmokeInterval();
}

function startSmokeInterval() {
  if (state.smokeInterval) clearInterval(state.smokeInterval);
  if (state.smokingStop) {
    state.smokeInterval = setInterval(updateSmokeLive, 1000);
    updateSmokeLive();
  }
}

function updateSmokeScreen() {
  const hasStop = !!state.smokingStop;
  document.getElementById('smoke-setup-card').style.display = hasStop ? 'none' : 'block';
  document.getElementById('smoke-counter-section').style.display = hasStop ? 'block' : 'none';

  if (hasStop) {
    document.getElementById('smoke-header-sub').textContent = 'Jij staat sterk!';
    updateSmokeLive();
    renderHealthMilestones();
  }
}

function updateSmokeLive() {
  if (!state.smokingStop) return;
  const diff = Date.now() - state.smokingStop.getTime();
  if (diff < 0) return;

  // Time display
  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const timeEl = document.getElementById('smoke-time-display');
  if (timeEl) timeEl.textContent =
    `${String(days).padStart(2,'0')}:${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;

  const daysEl = document.getElementById('smoke-days-display');
  if (daysEl) daysEl.textContent = `${days} dagen, ${hours} uur, ${mins} minuten`;

  // Stats
  const cigsEl = document.getElementById('smoke-cigs-not');
  if (cigsEl) cigsEl.textContent = computeCigsNotSmoked(diff);

  const moneyEl = document.getElementById('smoke-money-saved');
  if (moneyEl) moneyEl.textContent = '€' + computeMoneySaved(diff);

  const lifeEl = document.getElementById('smoke-life-gained');
  if (lifeEl) {
    const lifeMin = computeCigsNotSmoked(diff) * 11;
    lifeEl.textContent = lifeMin >= 1440 ? Math.floor(lifeMin/1440) + ' dag' : lifeMin >= 60 ? Math.floor(lifeMin/60) + ' uur' : lifeMin + ' min';
  }

  const kcalEl = document.getElementById('smoke-kcal-saved');
  if (kcalEl) kcalEl.textContent = Math.round(computeCigsNotSmoked(diff) * 10);

  // Update milestones
  renderHealthMilestones();
}

function computeCigsNotSmoked(diffMs) {
  const hours = diffMs / 3600000;
  const perHour = (state.profile?.cigsPerDay || 20) / 24;
  return Math.floor(hours * perHour);
}

function computeMoneySaved(diffMs) {
  const cigs = computeCigsNotSmoked(diffMs);
  const price = state.profile?.cigPackPrice || 9.50;
  const perCig = price / 20;
  return (cigs * perCig).toFixed(2);
}

function renderHealthMilestones() {
  const container = document.getElementById('health-milestones');
  if (!container || !state.smokingStop) return;

  const diff = Date.now() - state.smokingStop.getTime();
  const diffMin = diff / 60000;

  let html = '';
  HEALTH_MILESTONES.forEach((ms, i) => {
    const done = diffMin >= ms.minutes;
    const isNext = !done && (i === 0 || diffMin >= HEALTH_MILESTONES[i-1]?.minutes);

    let timeLeft = '';
    if (!done) {
      const remaining = (ms.minutes - diffMin) * 60000;
      timeLeft = 'over ' + formatDuration(remaining);
    } else {
      timeLeft = 'bereikt ✓';
    }

    html += `<div class="milestone ${done ? 'done' : isNext ? 'next' : ''}">
      <div class="ms-dot"></div>
      <div>
        <div class="ms-title">${ms.title}</div>
        <div class="ms-time">${timeLeft}</div>
        <div class="ms-desc">${ms.desc}</div>
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

function resetSmokeStop() {
  state.smokingStop = null;
  db.settings.delete('smokingStop');
  if (state.smokeInterval) clearInterval(state.smokeInterval);
  updateSmokeScreen();
}

// ══════════════════════════════════════════════════════════
//  SOS MODULE
// ══════════════════════════════════════════════════════════
function activateSOS() {
  if (state.sosActive) return;
  state.sosActive = true;

  const overlay = document.getElementById('sos-overlay');
  overlay.classList.add('active');
  document.getElementById('sos-btn').classList.add('pulsing');

  // Pick random command
  const cmd = SOS_COMMANDS[Math.floor(Math.random() * SOS_COMMANDS.length)];
  document.getElementById('sos-command-text').textContent = cmd.cmd;

  // Stats
  const diff = state.smokingStop ? Date.now() - state.smokingStop.getTime() : 0;
  const statsEl = document.getElementById('sos-stats-text');
  statsEl.innerHTML = `Je bent al <strong>${formatDuration(diff)}</strong> rookvrij<br>
    <strong>${computeCigsNotSmoked(diff)}</strong> sigaretten niet gerookt<br>
    <strong>€${computeMoneySaved(diff)}</strong> bespaard<br>
    <br>Jij bent sterker dan die craving!`;

  // Speak the command
  setTimeout(() => speak(cmd.speech), 500);

  // 10 minute timer
  let remaining = 600;
  const timerEl = document.getElementById('sos-timer-display');
  timerEl.textContent = '10:00';

  state.sosInterval = setInterval(() => {
    remaining--;
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    timerEl.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

    // Motivate every 2 minutes
    if (remaining === 480) speak('Goed bezig! Nog 8 minuten. Jij haalt dit!');
    if (remaining === 300) speak('Halverwege! 5 minuten. De craving gaat voorbij!');
    if (remaining === 120) speak('Nog 2 minuten soldaat. Je hebt gewonnen!');
    if (remaining <= 0) {
      clearInterval(state.sosInterval);
      speak('Bravo soldaat! Je hebt de craving verslagen! Jij bent ijzersterk!');
      vibrate([100, 50, 100, 50, 100]);
      setTimeout(closeSOS, 2000);
    }
  }, 1000);

  vibrate([100, 50, 100]);
}

function closeSOS() {
  state.sosActive = false;
  clearInterval(state.sosInterval);
  document.getElementById('sos-overlay').classList.remove('active');
  document.getElementById('sos-btn').classList.remove('pulsing');
  window.speechSynthesis?.cancel();
}

// ══════════════════════════════════════════════════════════
//  REPORTS
// ══════════════════════════════════════════════════════════
function showPeriod(period) {
  state.activePeriod = period;
  document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  renderReport(period);
}

async function renderReport(period) {
  const container = document.getElementById('report-content');
  if (!container) return;

  const now = new Date();
  let startDate = new Date();

  if (period === 'dag') startDate.setHours(0, 0, 0, 0);
  else if (period === 'week') startDate.setDate(now.getDate() - 7);
  else if (period === 'maand') startDate.setDate(now.getDate() - 30);
  else startDate = new Date(state.profile?.setupDate || now);

  const trainings = await db.trainings.where('date').aboveOrEqual(startDate.toISOString()).toArray();
  const foodLogs = await db.foodLog.where('date').aboveOrEqual(startDate.toISOString().split('T')[0]).toArray();

  const totalKcalBurned = trainings.reduce((s, t) => s + (t.kcal || 0), 0);
  const totalKcalEaten = foodLogs.reduce((s, f) => s + (f.kcal || 0), 0);
  const totalDuration = trainings.reduce((s, t) => s + (t.duration || 0), 0);

  // Weight
  const startW = state.profile?.startWeight || state.profile?.weight || 115;
  const currentW = state.weightEntries.length > 0
    ? state.weightEntries[state.weightEntries.length - 1].weight : startW;
  const lostTotal = (startW - currentW).toFixed(1);

  // Smoke
  const smokeDiff = state.smokingStop ? Date.now() - state.smokingStop.getTime() : 0;
  const periodLabel = { dag: 'Vandaag', week: 'Afgelopen 7 dagen', maand: 'Afgelopen 30 dagen', totaal: 'Totale Voortgang' }[period];

  container.innerHTML = `
    <div class="report-section">
      <h3>${periodLabel}</h3>
      <div class="stats-grid" style="margin:0 0 16px;">
        <div class="stat-block amber">
          <div class="stat-value">${trainings.length}</div>
          <div class="stat-label">Trainingen</div>
        </div>
        <div class="stat-block green">
          <div class="stat-value">${totalKcalBurned}</div>
          <div class="stat-label">kcal Verbrand</div>
        </div>
        <div class="stat-block">
          <div class="stat-value">${formatSeconds(totalDuration)}</div>
          <div class="stat-label">Totaal Tijd</div>
        </div>
        <div class="stat-block red">
          <div class="stat-value">${totalKcalEaten}</div>
          <div class="stat-label">kcal Gegeten</div>
        </div>
      </div>

      ${period === 'totaal' ? `
      <div class="card card-green" style="margin:0 0 12px;">
        <div class="card-title">🏆 Totale Resultaten</div>
        <div style="font-family:var(--font-mono);font-size:18px;color:var(--green-bright);margin-bottom:6px;">${lostTotal > 0 ? '-' + lostTotal : '+' + Math.abs(lostTotal)} kg gewicht</div>
        <div style="font-size:14px;color:var(--steel);">Van ${startW} kg → ${currentW.toFixed(1)} kg</div>
      </div>` : ''}

      ${state.smokingStop ? `
      <div class="card card-green" style="margin:0 0 12px;">
        <div class="card-title">🚭 Rookvrij Status</div>
        <div style="font-family:var(--font-mono);font-size:20px;color:var(--green-bright);">${formatDuration(smokeDiff)}</div>
        <div style="font-size:14px;color:var(--steel);margin-top:6px;">€${computeMoneySaved(smokeDiff)} bespaard · ${computeCigsNotSmoked(smokeDiff)} sigaretten gemist</div>
      </div>` : ''}

      ${trainings.length > 0 ? `
      <div class="card card-amber" style="margin:0;">
        <div class="card-title">Trainingslog</div>
        ${trainings.slice(-8).reverse().map(t => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
            <div>
              <div style="font-weight:700;font-size:13px;">${t.name}</div>
              <div style="font-size:11px;color:var(--steel);font-family:var(--font-mono);">${new Date(t.date).toLocaleDateString('nl-NL')} · ${formatSeconds(t.duration)}</div>
            </div>
            <div style="font-family:var(--font-mono);color:var(--amber);font-size:14px;">${t.kcal} kcal</div>
          </div>`).join('')}
      </div>` : '<div style="color:var(--steel);font-size:14px;">Geen trainingen in deze periode</div>'}
    </div>`;
}

// ══════════════════════════════════════════════════════════
//  EXPORT
// ══════════════════════════════════════════════════════════
async function exportPDF() {
  const { jsPDF } = window.jspdf;
  if (!jsPDF) { toast('PDF library laden...', 'error'); return; }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const now = new Date();
  const smokeDiff = state.smokingStop ? Date.now() - state.smokingStop.getTime() : 0;
  const startW = state.profile?.startWeight || 115;
  const currentW = state.weightEntries.length > 0
    ? state.weightEntries[state.weightEntries.length - 1].weight : startW;
  const trainings = await db.trainings.toArray();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(192, 57, 43);
  doc.text('STEEL & SMOKE', 20, 25);
  doc.text('Voortgangsrapport', 20, 33);

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gegenereerd: ${now.toLocaleDateString('nl-NL')} ${now.toLocaleTimeString('nl-NL')}`, 20, 40);
  doc.text(`Naam: ${state.profile?.name || 'Onbekend'} | Leeftijd: ${state.profile?.age || '—'} | Lengte: ${state.profile?.height || '—'}cm`, 20, 46);

  doc.setDrawColor(200, 200, 200);
  doc.line(20, 50, 190, 50);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text('GEWICHT', 20, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Startgewicht: ${startW} kg`, 20, 68);
  doc.text(`Huidig gewicht: ${currentW.toFixed(1)} kg`, 20, 74);
  doc.text(`Verlies: ${(startW - currentW).toFixed(1)} kg`, 20, 80);
  doc.text(`BMI: ${(currentW / Math.pow((state.profile?.height || 178) / 100, 2)).toFixed(1)}`, 20, 86);

  doc.line(20, 92, 190, 92);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('ROOKVRIJ', 20, 100);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  if (state.smokingStop) {
    doc.text(`Stopmoment: ${state.smokingStop.toLocaleDateString('nl-NL')} ${state.smokingStop.toLocaleTimeString('nl-NL')}`, 20, 108);
    doc.text(`Rookvrij: ${formatDuration(smokeDiff)}`, 20, 114);
    doc.text(`Sigaretten niet gerookt: ${computeCigsNotSmoked(smokeDiff)}`, 20, 120);
    doc.text(`Bespaard: €${computeMoneySaved(smokeDiff)}`, 20, 126);
  } else {
    doc.text('Nog geen stopmoment ingesteld', 20, 108);
  }

  doc.line(20, 132, 190, 132);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('TRAINING', 20, 140);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Totaal aantal trainingen: ${trainings.length}`, 20, 148);
  doc.text(`Totaal kcal verbrand: ${trainings.reduce((s, t) => s + (t.kcal || 0), 0)}`, 20, 154);
  doc.text(`Totale trainingstijd: ${formatSeconds(trainings.reduce((s, t) => s + (t.duration || 0), 0))}`, 20, 160);

  let y = 168;
  doc.line(20, y - 2, 190, y - 2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Datum', 20, y + 6);
  doc.text('Activiteit', 60, y + 6);
  doc.text('Duur', 130, y + 6);
  doc.text('kcal', 165, y + 6);
  y += 12;

  doc.setFont('helvetica', 'normal');
  trainings.slice(-15).forEach(t => {
    if (y > 270) return;
    doc.text(new Date(t.date).toLocaleDateString('nl-NL'), 20, y);
    doc.text(t.name.substring(0, 25), 60, y);
    doc.text(formatSeconds(t.duration), 130, y);
    doc.text(String(t.kcal), 165, y);
    y += 7;
  });

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Gegenereerd door Steel & Smoke PWA — Voor medisch gebruik', 20, 285);

  doc.save(`steel-smoke-rapport-${now.toISOString().split('T')[0]}.pdf`);
  toast('PDF geëxporteerd!', 'success');
}

async function exportText() {
  const smokeDiff = state.smokingStop ? Date.now() - state.smokingStop.getTime() : 0;
  const startW = state.profile?.startWeight || 115;
  const currentW = state.weightEntries.length > 0
    ? state.weightEntries[state.weightEntries.length - 1].weight : startW;
  const trainings = await db.trainings.toArray();

  const text = `STEEL & SMOKE — VOORTGANGSRAPPORT
Gegenereerd: ${new Date().toLocaleDateString('nl-NL')}

PROFIEL
=======
Naam: ${state.profile?.name || '—'}
Leeftijd: ${state.profile?.age || '—'} jaar
Lengte: ${state.profile?.height || '—'} cm

GEWICHT
=======
Startgewicht: ${startW} kg
Huidig gewicht: ${currentW.toFixed(1)} kg
Verlies: ${(startW - currentW).toFixed(1)} kg
BMI: ${(currentW / Math.pow((state.profile?.height || 178) / 100, 2)).toFixed(1)}

ROOKVRIJ
========
${state.smokingStop
    ? `Stopmoment: ${state.smokingStop.toLocaleDateString('nl-NL')}
Rookvrij: ${formatDuration(smokeDiff)}
Sigaretten niet gerookt: ${computeCigsNotSmoked(smokeDiff)}
Bespaard: €${computeMoneySaved(smokeDiff)}`
    : 'Nog geen stopmoment ingesteld'}

TRAINING
========
Totaal trainingen: ${trainings.length}
Totaal kcal verbrand: ${trainings.reduce((s, t) => s + (t.kcal || 0), 0)}
Totale tijd: ${formatSeconds(trainings.reduce((s, t) => s + (t.duration || 0), 0))}

${trainings.slice(-20).map(t =>
    `${new Date(t.date).toLocaleDateString('nl-NL')} | ${t.name} | ${formatSeconds(t.duration)} | ${t.kcal} kcal`
  ).join('\n')}
`;

  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `steel-smoke-${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Tekstbestand gedownload!', 'success');
}

// ══════════════════════════════════════════════════════════
//  SPEECH (Web Speech API)
// ══════════════════════════════════════════════════════════
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'nl-NL';
  utt.rate = 1.05;
  utt.pitch = 0.85;
  utt.volume = 1.0;

  // Pick a deep voice if available
  const voices = window.speechSynthesis.getVoices();
  const nlVoice = voices.find(v => v.lang === 'nl-NL' && v.name.toLowerCase().includes('male'))
    || voices.find(v => v.lang === 'nl-NL')
    || voices.find(v => v.lang.startsWith('nl'));
  if (nlVoice) utt.voice = nlVoice;

  window.speechSynthesis.speak(utt);
}

// ══════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ══════════════════════════════════════════════════════════
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function scheduleNotifications() {
  // Check every minute for meal reminders
  setInterval(async () => {
    if (Notification.permission !== 'granted') return;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    state.mealSchedule.forEach(async (time, i) => {
      const [h, m] = time.split(':').map(Number);
      const mealMin = h * 60 + m;
      if (Math.abs(mealMin - nowMin) === 0) {
        const mealNames = ['Ontbijt', 'Tussendoor', 'Lunch', 'Tussendoor', 'Avondeten', 'Tussendoor'];
        new Notification('🍽️ Steel & Smoke', {
          body: `${mealNames[i]} tijd! Vul je magazijn.`,
          icon: '/icons/icon-192.png'
        });
      }
    });
  }, 60000);
}

// ══════════════════════════════════════════════════════════
//  UTILITY FUNCTIONS
// ══════════════════════════════════════════════════════════
function computeBMR() {
  if (!state.profile) return 2000;
  const { weight, height, age } = state.profile;
  // Mifflin-St Jeor for men
  const bmr = 10 * (weight || 115) + 6.25 * (height || 178) - 5 * (age || 48) + 5;
  return Math.round(bmr * 1.4); // TDEE with light activity
}

async function computeStreak() {
  const trainings = await db.trainings.orderBy('date').toArray();
  if (trainings.length === 0) return 0;

  const dates = [...new Set(trainings.map(t => t.date.split('T')[0]))].sort().reverse();
  let streak = 0;
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  for (const dateStr of dates) {
    const d = new Date(dateStr);
    const diffDays = Math.round((checkDate - d) / 86400000);
    if (diffDays <= 1) {
      streak++;
      checkDate = d;
    } else break;
  }
  return streak;
}

function formatSeconds(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  if (h > 0) return `${h}u ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  if (days > 0) return `${days}d ${hours}u ${mins}m`;
  if (hours > 0) return `${hours}u ${mins}m`;
  return `${mins}m`;
}

function vibrate(pattern) {
  try { navigator.vibrate?.(pattern); } catch(e) {}
}

// ══════════════════════════════════════════════════════════
//  MODAL HELPERS
// ══════════════════════════════════════════════════════════
function closeModal(id) {
  document.getElementById(id)?.classList.remove('active');
}

// Close modals on backdrop click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('active');
  });
});

// ══════════════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════════════
function toast(message, type = '') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ══════════════════════════════════════════════════════════
//  MIDNIGHT RESET (reset daily meal shifts)
// ══════════════════════════════════════════════════════════
function scheduleMidnightReset() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = midnight - now;

  setTimeout(() => {
    // Reset meal schedule to default breakfast time
    if (state.profile?.breakfastTime) {
      state.mealSchedule = computeMealSchedule(state.profile.breakfastTime);
      db.settings.put({ key: 'mealSchedule', value: state.mealSchedule });
      renderMealSlots();
    }
    scheduleMidnightReset();
  }, msUntilMidnight);
}

// ══════════════════════════════════════════════════════════
//  START
// ══════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  init();
  scheduleMidnightReset();
  scheduleNotifications();

  // Load voices async
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }
});
