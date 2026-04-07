'use strict';
// BUILD: 20260407-2100 — v5 ULTRA coach — bump to force reload

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

// ── DATABASE v5 ──────────────────────────────────────────────
const db = new Dexie('SteelSmoke');
db.version(1).stores({ settings:'key', weights:'++id,date', meals:'++id,date', trainings:'++id,date', gpsRoutes:'++id,date', foodLog:'++id,date' });
db.version(2).stores({ settings:'key', weights:'++id,date', meals:'++id,date', trainings:'++id,date', gpsRoutes:'++id,date', foodLog:'++id,date', customSports:'++id', customMenus:'++id' });
db.version(3).stores({ settings:'key', weights:'++id,date', meals:'++id,date', trainings:'++id,date', gpsRoutes:'++id,date', foodLog:'++id,date', customSports:'++id', customMenus:'++id', savedMeals:'++id' });
db.version(4).stores({ settings:'key', weights:'++id,date', meals:'++id,date', trainings:'++id,date,time', gpsRoutes:'++id,date', foodLog:'++id,date', customSports:'++id', customMenus:'++id', savedMeals:'++id' });
db.version(5).stores({ settings:'key', weights:'++id,date', meals:'++id,date', trainings:'++id,date,time', gpsRoutes:'++id,date', foodLog:'++id,date', customSports:'++id', customMenus:'++id', savedMeals:'++id', customFoods:'++id' });

// ── VASTE VOEDINGSMIDDELEN ────────────────────────────────────
const FOODS_BUILTIN = [
  {id:'volkoren',    emoji:'🍞', name:'Volkoren Brood',    kcal:80,  protein:3,   carbs:14, fat:1,   unit:'snee'},
  {id:'kaas',        emoji:'🧀', name:'Kaas (jong)',        kcal:75,  protein:5,   carbs:0,  fat:6,   unit:'plak'},
  {id:'boter',       emoji:'🧈', name:'Boter/Halvarine',   kcal:37,  protein:0,   carbs:0,  fat:4,   unit:'snee'},
  {id:'jam',         emoji:'🍓', name:'Jam',                kcal:39,  protein:0.1, carbs:10, fat:0,   unit:'el'},
  {id:'hagelslag',   emoji:'🍫', name:'Hagelslag',          kcal:60,  protein:0.8, carbs:10, fat:2.5, unit:'el'},
  {id:'pindakaas',   emoji:'🥜', name:'Pindakaas',          kcal:100, protein:3.8, carbs:3,  fat:8,   unit:'el'},
  {id:'honing',      emoji:'🍯', name:'Honing',             kcal:30,  protein:0,   carbs:8,  fat:0,   unit:'el'},
  {id:'ei',          emoji:'🥚', name:'Ei (gekookt)',        kcal:78,  protein:6,   carbs:0.6,fat:5,   unit:'stuk'},
  {id:'roerei',      emoji:'🍳', name:'Roerei (2 eieren)',  kcal:185, protein:12,  carbs:2,  fat:14,  unit:'port'},
  {id:'kwark',       emoji:'🥛', name:'Magere Kwark',       kcal:57,  protein:10,  carbs:4,  fat:0.2, unit:'100g'},
  {id:'griekseyo',   emoji:'🥣', name:'Griekse Yoghurt',   kcal:97,  protein:9,   carbs:4,  fat:5,   unit:'100g'},
  {id:'havermout',   emoji:'🌾', name:'Havermout (60g)',    kcal:233, protein:10,  carbs:40, fat:4,   unit:'port'},
  {id:'muesli',      emoji:'🌾', name:'Muesli (60g)',       kcal:218, protein:5,   carbs:39, fat:4,   unit:'port'},
  {id:'banaan',      emoji:'🍌', name:'Banaan',             kcal:89,  protein:1,   carbs:23, fat:0.3, unit:'stuk'},
  {id:'appel',       emoji:'🍎', name:'Appel',              kcal:52,  protein:0.3, carbs:14, fat:0.2, unit:'stuk'},
  {id:'kiwi',        emoji:'🥝', name:'Kiwi',               kcal:61,  protein:1,   carbs:15, fat:0.5, unit:'stuk'},
  {id:'sinaasappel', emoji:'🍊', name:'Sinaasappel',        kcal:62,  protein:1.2, carbs:15, fat:0.2, unit:'stuk'},
  {id:'kip',         emoji:'🍗', name:'Kipfilet',            kcal:165, protein:31,  carbs:0,  fat:3.6, unit:'100g'},
  {id:'kalkoen',     emoji:'🦃', name:'Kalkoenfilet',        kcal:157, protein:30,  carbs:0,  fat:3,   unit:'100g'},
  {id:'zalm',        emoji:'🐟', name:'Zalm',                kcal:208, protein:20,  carbs:0,  fat:13,  unit:'100g'},
  {id:'tonijn',      emoji:'🐠', name:'Tonijn (blik)',       kcal:116, protein:26,  carbs:0,  fat:1,   unit:'blik'},
  {id:'mager_rund',  emoji:'🥩', name:'Mager Rundvlees',    kcal:215, protein:26,  carbs:0,  fat:12,  unit:'100g'},
  {id:'rijst',       emoji:'🍚', name:'Zilvervliesrijst',   kcal:130, protein:3,   carbs:28, fat:1,   unit:'100g'},
  {id:'aardappel',   emoji:'🥔', name:'Gekookte Aardappel', kcal:86,  protein:2,   carbs:20, fat:0.1, unit:'100g'},
  {id:'broccoli',    emoji:'🥦', name:'Broccoli',            kcal:34,  protein:3,   carbs:7,  fat:0.4, unit:'100g'},
  {id:'spinazie',    emoji:'🥬', name:'Spinazie',            kcal:23,  protein:3,   carbs:4,  fat:0.4, unit:'100g'},
  {id:'komkommer',   emoji:'🥒', name:'Komkommer',           kcal:15,  protein:0.7, carbs:3,  fat:0.1, unit:'100g'},
  {id:'tomaatjes',   emoji:'🍅', name:'Tomaatjes',           kcal:18,  protein:0.9, carbs:4,  fat:0.2, unit:'100g'},
  {id:'paprika',     emoji:'🫑', name:'Paprika',             kcal:31,  protein:1,   carbs:6,  fat:0.3, unit:'100g'},
  {id:'avocado',     emoji:'🥑', name:'Avocado',             kcal:160, protein:2,   carbs:9,  fat:15,  unit:'stuk'},
  {id:'cottage',     emoji:'🧀', name:'Cottage Cheese',      kcal:103, protein:11,  carbs:3,  fat:5,   unit:'100g'},
  {id:'proteinesha', emoji:'🥤', name:'Proteïneshake',       kcal:130, protein:25,  carbs:5,  fat:2,   unit:'shaker'},
  {id:'mageremelk',  emoji:'🥛', name:'Magere Melk',         kcal:35,  protein:3.5, carbs:5,  fat:0.1, unit:'100ml'},
  {id:'hummus',      emoji:'🫙', name:'Hummus',              kcal:177, protein:5,   carbs:14, fat:11,  unit:'100g'},
  {id:'witte_bonen', emoji:'🫘', name:'Witte Bonen',         kcal:127, protein:9,   carbs:23, fat:0.5, unit:'100g'},
];
// Dynamisch aangevuld met eigen producten
let FOODS = [...FOODS_BUILTIN];

const PRESET_MENUS = [
  {id:'brood_kaas_3',    emoji:'🍞🧀', name:'3× boterham met kaas',     kcal:465, protein:24, carbs:48, fat:19, items:'3× Volkoren + 3× boter + 3× kaas'},
  {id:'brood_kaas_jam',  emoji:'🍞🧀🍓',name:'2 kaas + 1 jam',           kcal:426, protein:17, carbs:52, fat:16, items:'3× Volkoren + 2× kaas + 1× jam + 3× boter'},
  {id:'brood_hagelslag', emoji:'🍞🍫', name:'3× boterham hagelslag',    kcal:462, protein:10, carbs:66, fat:15, items:'3× Volkoren + 3× boter + 3× hagelslag'},
  {id:'brood_pindakaas', emoji:'🍞🥜', name:'2× boterham pindakaas',    kcal:360, protein:14, carbs:34, fat:18, items:'2× Volkoren + 2× pindakaas'},
  {id:'havermout_banaan',emoji:'🌾🍌', name:'Havermout met banaan',      kcal:358, protein:12, carbs:68, fat:5,  items:'60g havermout + 1 banaan + 200ml melk'},
  {id:'kwark_fruit',     emoji:'🥛🍓', name:'Kwark met fruit',           kcal:293, protein:27, carbs:42, fat:1,  items:'250g magere kwark + 1 banaan + 1 kiwi'},
  {id:'roerei_brood',    emoji:'🍳🍞', name:'Roerei met brood',          kcal:345, protein:18, carbs:30, fat:15, items:'Roerei (2 eieren) + 2× volkoren + boter'},
  {id:'kip_rijst',       emoji:'🍗🍚🥦',name:'Kip-rijst-broccoli',       kcal:445, protein:53, carbs:46, fat:7,  items:'150g kipfilet + 150g rijst + 200g broccoli'},
  {id:'zalm_aardappel',  emoji:'🐟🥔', name:'Zalm met aardappelen',      kcal:520, protein:36, carbs:44, fat:20, items:'150g zalm + 200g aardappelen + groenten'},
  {id:'tonijn_salade',   emoji:'🐠🥗', name:'Tonijnsalade met brood',    kcal:380, protein:38, carbs:32, fat:8,  items:'1 blik tonijn + groenten + 2× volkoren'},
  {id:'proteinesha_ban', emoji:'🥤🍌', name:'Proteïneshake + banaan',    kcal:219, protein:26, carbs:28, fat:2,  items:'1 shake + 1 banaan'},
  {id:'griekseyo_fruit', emoji:'🥣🍓', name:'Griekse yoghurt met fruit', kcal:270, protein:20, carbs:36, fat:10, items:'200g yoghurt + kiwi + banaan + honing'},
];

// ── SPORTADVIES POOL (14 wisselende adviezen) ────────────────
const SPORT_ADVICE_POOL = [
  {time:'20:00', emoji:'🏃', activity:'Avondloop 3 km',        desc:'Loop 3 km in jouw wijk. Start rustig, bouw op. Looproute: huis → park → huis.', duration:'~25 min', kcal:210},
  {time:'07:00', emoji:'🚶', activity:'Ochtendwandeling 30 min',desc:'30 min stevig doorwandelen voor het ontbijt. Vetverbranding op zijn best — nuchter bewegen.', duration:'30 min', kcal:130},
  {time:'19:30', emoji:'🚴', activity:'Fietstocht 12 km',      desc:'45 min fietsen, minimaal 12 km. Kies een rustige route. Fietsen spaart je knieën.', duration:'45 min', kcal:280},
  {time:'20:30', emoji:'💪', activity:'Krachtcircuit thuis',   desc:'3× 15 squats, 3× 10 push-ups, 3× 20 sec plank. Rust 60 sec tussen sets.', duration:'20 min', kcal:150},
  {time:'19:00', emoji:'🏊', activity:'Zwemmen 30 min',        desc:'30 min baantjes. Water draagt 90% van je gewicht — ideale sport bij overgewicht.', duration:'30 min', kcal:260},
  {time:'12:30', emoji:'🚶', activity:'Lunchpauze wandeling',  desc:'20 min wandelen tijdens de lunch. Na het eten wandelen verlaagt bloedsuiker met 30%.', duration:'20 min', kcal:87},
  {time:'21:00', emoji:'🧘', activity:'Stretchsessie 15 min',  desc:'15 min rekken en strekken. Goed voor herstel en soepelheid. Gebruik YouTube "stretch routine".', duration:'15 min', kcal:45},
  {time:'08:00', emoji:'🪜', activity:'Trap challenge',         desc:'10× de trap op en neer, 3× vandaag. Trap lopen verbrandt 3× meer kcal dan de lift.', duration:'15 min', kcal:95},
  {time:'19:00', emoji:'🚶', activity:'Avondwandeling 5 km',   desc:'Rustige avondwandeling van 5 km. Neem koptelefoon mee — 5 km = ~350 kcal verbrand.', duration:'55 min', kcal:215},
  {time:'20:00', emoji:'🚶', activity:'Stevig wandelen 5 km',    desc:'45 min stevig doorwandelen. Goed tempo, armen mee laten bewegen. Minimaal 5 km afleggen.', duration:'45 min', kcal:190},
  {time:'18:30', emoji:'🛵', activity:'E-bike tocht 1 uur',    desc:'1 uur e-biken, trap zoveel mogelijk mee. Kies een heuvelachtige route voor meer effect.', duration:'60 min', kcal:180},
  {time:'19:30', emoji:'💪', activity:'Dumbbell circuit',       desc:'Bicep curl, shoulder press, deadlift. 3 sets × 12 herhalingen. Rust 90 sec tussen sets.', duration:'35 min', kcal:175},
  {time:'07:00', emoji:'🚶', activity:'Ochtendwandeling 30 min', desc:'30 min stevig doorwandelen voor het ontbijt. Nuchter bewegen = vetverbranding op zijn best.', duration:'30 min', kcal:120},
  {time:'20:00', emoji:'🚶', activity:'10.000 stappen doel',    desc:'Zorg dat je vandaag 10.000 stappen haalt. Controleer je gezondheids-app — nog X stappen te gaan!', duration:'heel dag', kcal:350},
];

// ── VASTE SPORTSCHOOL REMINDER ────────────────────────────────
const GYM_REMINDER = { time:'06:15', msg:'💪 Sportschool tijd! Vertrek nu — voor 07:00 trainen!', speech:'Soldaat! Sportschool! Kom uit dat bed en pak je sporttas!' };

// ── GYM ACTIVITEITEN ─────────────────────────────────────────
const GYM_ACTIVITIES = [
  {id:'roeier',   emoji:'🚣', name:'Roeitrainer', met:7.0},
  {id:'loopband', emoji:'🏃', name:'Loopband',     met:8.5},
  {id:'gewichten',emoji:'🏋️', name:'Gewichten',    met:5.0},
  {id:'trap',     emoji:'🪜', name:'Trap lopen',   met:8.0},
  {id:'fietsen',  emoji:'🚴', name:'Hometrainer',  met:6.8},
  {id:'zwemmen',  emoji:'🏊', name:'Zwemmen',      met:8.0},
];

const GPS_ACTIVITIES = [
  {id:'wandelen_rustig',  emoji:'🚶', name:'Wandelen rustig',   met:2.8, kcalPer30min:98,  doel:'ontspanning'},
  {id:'wandelen_stevig',  emoji:'🚶', name:'Wandelen stevig',   met:3.8, kcalPer30min:133, doel:'conditie'},
  {id:'ebike_eco',        emoji:'⚡', name:'E-bike eco',        met:4.5, kcalPer30min:158, doel:'actief'},
  {id:'ebike_tour',       emoji:'⚡', name:'E-bike tour',       met:4.0, kcalPer30min:140, doel:'uitje'},
  {id:'ebike_sport',      emoji:'⚡', name:'E-bike sport',      met:5.5, kcalPer30min:193, doel:'intensief'},
  {id:'ebike_turbo',      emoji:'⚡', name:'E-bike turbo',      met:3.5, kcalPer30min:123, doel:'ontspannen'},
  {id:'scooter',          emoji:'🛵', name:'Scooter',           met:2.5, kcalPer30min:88,  doel:'vervoer'},
];

const HEALTH_MILESTONES = [
  {minutes:20,     title:'Hartslag normaliseert',        desc:'Bloeddruk en hartslag dalen.'},
  {minutes:480,    title:'CO vrij uit bloed',            desc:'Koolmonoxide volledig weg.'},
  {minutes:1440,   title:'Hartaanval risico daalt',      desc:'24u: risico begint te dalen.'},
  {minutes:2880,   title:'Smaak & geur terug',           desc:'48u: zenuwuiteinden herstellen.'},
  {minutes:4320,   title:'Longen beginnen te reinigen',  desc:'72u: slijm wordt afgevoerd.'},
  {minutes:10080,  title:'Conditie merkbaar beter',      desc:'1 week: lopen gaat makkelijker.'},
  {minutes:43200,  title:'Longfunctie +10%',             desc:'1 maand: longen beter.'},
  {minutes:129600, title:'Longfunctie +30%',             desc:'3 maanden: wimperharen hersteld.'},
  {minutes:525600, title:'Hart risico gehalveerd',       desc:'1 jaar: 50% lager risico.'},
  {minutes:2628000,title:'Risico gelijk aan niet-roker', desc:'5 jaar: volledig normaal.'},
];

const SOS_COMMANDS = [
  {cmd:'Doe nu 15 squats!',            speech:'Doe nu vijftien squats! Beweeg dat lijf soldaat!'},
  {cmd:'20 push-ups! Geen excuses!',   speech:'Twintig push-ups! Nu! Geen enkel excuus!'},
  {cmd:'Loop 5 minuten buiten!',       speech:'Naar buiten! Loop vijf minuten. Jij kan dit!'},
  {cmd:'Drink een groot glas water!',  speech:'Pak een groot glas koud water en drink het nu op!'},
  {cmd:'3× diep ademhalen — 4-7-8',   speech:'Adem in voor vier, houd vast voor zeven, uit voor acht. Drie keer!'},
  {cmd:'30 sec plank! Sta sterk!',     speech:'Plank positie! Dertig seconden! Houd vol!'},
  {cmd:'15 jumping jacks!',           speech:'Vijftien jumping jacks! Activeer je lichaam!'},
  {cmd:'Bel iemand die je steunt!',   speech:'Pak je telefoon en bel iemand die jou steunt. Nu!'},
  {cmd:'Poets je tanden!',            speech:'Naar de badkamer. Poets je tanden. Afleiding werkt.'},
  {cmd:'10 min wandelen — nu!',       speech:'Schoenen aan, deur uit. Tien minuten wandelen!'},
];

// ── BEWEEGDOEL per dag ────────────────────────────────────────
const DAILY_MOVE_GOAL_MIN = 30; // minuten actief per dag

// ═══════════════════════════════════════════════════════════════
//  COACH ENGINE — slim sportadvies op basis van jouw regels
// ═══════════════════════════════════════════════════════════════

// Jouw persoonlijke regels
const COACH_RULES = {
  gymBeforeHour: 7,          // Sportschool ALLEEN voor 07:00
  noRunning: true,           // Nooit hardlopen
  preferredActivities: ['wandelen_rustig','wandelen_stevig','ebike_eco','ebike_tour','ebike_sport','ebike_turbo'],
};

// Hoeveel minuten kost elke activiteit om het dagdoel te halen?
// Berekend op basis van MET × gewicht × tijd = kcal
// We werken puur in minuten richting dagdoel
function getActivityMinutesForGoal(activityId, remainingMinutes) {
  const act = GPS_ACTIVITIES.find(a => a.id === activityId);
  if (!act) return null;
  return {
    id: act.id,
    name: act.name,
    emoji: act.emoji,
    minutes: Math.ceil(remainingMinutes),
    met: act.met,
  };
}

// Bepaal het volgende beste sportmoment op basis van:
// - huidig tijdstip
// - hoeveel minuten al bewogen
// - jouw regels (geen hardlopen, gym voor 7u)
async function computeNextSportMoment() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const today = now.toISOString().split('T')[0];
  const trainings = await db.trainings.where('date').startsWith(today).toArray();
  const totalMovedMin = Math.round(trainings.reduce((s, t) => s + (t.duration || 0), 0) / 60);
  const remaining = Math.max(0, DAILY_MOVE_GOAL_MIN - totalMovedMin);

  if (remaining <= 0) {
    return { done: true, msg: '✅ Daaldoel bereikt! Goed gedaan!', next: null };
  }

  let activity, timeLabel, reason;

  // Voor 07:00 — sportschool optie
  if (h < COACH_RULES.gymBeforeHour) {
    activity = { id:'gewichten', name:'Sportschool', emoji:'🏋️', minutes: 45 };
    timeLabel = 'Nu (' + String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ')';
    reason = 'Voor 07:00 — sportschool is nu de ideale keuze';
  }
  // Overdag (7-12) — ochtendwandeling
  else if (h < 12) {
    const actId = 'wandelen_stevig';
    const act = GPS_ACTIVITIES.find(a => a.id === actId);
    activity = { id: actId, name: act.name, emoji: act.emoji, minutes: Math.min(45, remaining + 5) };
    timeLabel = 'Nu';
    reason = 'Ochtend is het beste moment voor vetverbranding';
  }
  // Middag (12-17) — kort wandelen
  else if (h < 17) {
    const actId = h < 14 ? 'wandelen_rustig' : 'ebike_tour';
    const act = GPS_ACTIVITIES.find(a => a.id === actId);
    activity = { id: actId, name: act.name, emoji: act.emoji, minutes: Math.min(30, remaining + 5) };
    timeLabel = h === 12 ? '12:30' : h < 14 ? '13:00' : '16:00';
    reason = remaining > 20 ? 'Goed moment voor een middagactiviteit' : 'Korte sessie om doel te halen';
  }
  // Avond (17-21) — e-bike of wandelen
  else if (h < 21) {
    const preferEvening = h < 19 ? 'ebike_sport' : 'wandelen_stevig';
    const act = GPS_ACTIVITIES.find(a => a.id === preferEvening);
    const suggestTime = h < 19 ? '18:30' : h < 20 ? '19:30' : '20:00';
    activity = { id: preferEvening, name: act.name, emoji: act.emoji, minutes: Math.min(60, remaining + 10) };
    timeLabel = suggestTime;
    reason = remaining > 15 ? 'Avond ideaal voor e-bike of stevig wandelen' : 'Nog ' + remaining + ' min nodig voor je dagdoel';
  }
  // Laat avond (21+) — rustig wandelen of niets
  else {
    if (remaining <= 15) {
      const act = GPS_ACTIVITIES.find(a => a.id === 'wandelen_rustig');
      activity = { id: 'wandelen_rustig', name: act.name, emoji: act.emoji, minutes: remaining };
      timeLabel = 'Nu';
      reason = 'Nog ' + remaining + ' min — rustig avondwandelingetje';
    } else {
      return {
        done: false,
        msg: '😴 Te laat voor intensief sporten. Morgen vroeg beginnen!',
        next: null,
        remaining,
      };
    }
  }

  return {
    done: false,
    next: activity,
    timeLabel,
    reason,
    remaining,
    msg: activity.emoji + ' ' + activity.name + ' — ' + activity.minutes + ' min om ' + timeLabel,
  };
}

// Render het volgende sportmoment op dashboard
async function renderNextSportMoment() {
  const c = document.getElementById('next-sport-card');
  if (!c) return;
  const result = await computeNextSportMoment();

  if (result.done) {
    c.innerHTML = '<div style="font-family:var(--font-display);font-size:18px;letter-spacing:1px;color:var(--green-bright)">✅ Daaldoel bereikt!</div>' +
      '<div style="font-size:13px;color:var(--steel);margin-top:4px">Je hebt vandaag je beweegdoel gehaald. Top!</div>';
    c.style.borderColor = 'var(--green)';
    return;
  }

  c.style.borderColor = 'var(--amber)';
  let html = '';
  if (result.next) {
    const kcalEst = result.next.minutes ? Math.round((result.next.met||3.5) * (state.profile?.weight||115) * (result.next.minutes/60) * 1.05) : 0;
    html = '<div style="display:flex;align-items:flex-start;gap:10px;">' +
      '<span style="font-size:28px">' + result.next.emoji + '</span>' +
      '<div style="flex:1">' +
        '<div style="font-family:var(--font-display);font-size:17px;letter-spacing:1px;color:var(--amber)">' + result.next.name + '</div>' +
        '<div style="font-size:12px;color:var(--steel);font-family:var(--font-mono);margin:2px 0">' + result.timeLabel + ' · ' + result.next.minutes + ' min · ~' + kcalEst + ' kcal</div>' +
        '<div style="font-size:13px;color:var(--steel-light);margin-top:4px">' + result.reason + '</div>' +
        '<div style="font-size:12px;color:var(--steel);margin-top:6px;font-style:italic">Nog ' + result.remaining + ' min voor dagdoel</div>' +
      '</div>' +
    '</div>';
  } else {
    html = '<div style="font-size:14px;color:var(--steel)">' + result.msg + '</div>';
  }
  c.innerHTML = html;
}

// ── STATE ─────────────────────────────────────────────────────
let state = {
  profile:null, currentScreen:'dashboard', mealSchedule:[], foodPreferences:[],
  activeTraining:null, timerInterval:null, timerPaused:false, timerPauseStart:null, timerPausedTotal:0,
  gpsActive:false, gpsActivityId:null, gpsWatchId:null, gpsPositions:[], gpsStartTime:null,
  gpsDistance:0, gpsLastPos:null, sosActive:false, sosInterval:null,
  smokingStop:null, smokeInterval:null, currentMealIndex:null, menuItems:[],
  activePeriod:'dag', weightEntries:[], customSports:[], savedMeals:[], customFoods:[],
  settings:{ notifications:true, backgroundSync:true, sound:true, gymReminderEnabled:true },
  todayAdviceIndex:0,
};

// ══════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════
async function init() {
  const profileRec  = await db.settings.get('profile');       state.profile = profileRec?.value || null;
  const smokeRec    = await db.settings.get('smokingStop');    state.smokingStop = smokeRec ? new Date(smokeRec.value) : null;
  const prefsRec    = await db.settings.get('foodPreferences');state.foodPreferences = prefsRec?.value || [];
  const mealRec     = await db.settings.get('mealSchedule');   state.mealSchedule = mealRec?.value || computeMealSchedule(state.profile?.breakfastTime||'07:00');
  const settRec     = await db.settings.get('appSettings');    if (settRec) state.settings = {...state.settings,...settRec.value};
  const advIdxRec   = await db.settings.get('adviceIndex');    state.todayAdviceIndex = advIdxRec?.value ?? (Math.floor(Date.now()/86400000) % SPORT_ADVICE_POOL.length);
  state.weightEntries = await db.weights.orderBy('date').toArray();
  state.customSports  = await db.customSports.toArray();
  state.savedMeals    = await db.savedMeals.toArray();
  state.customFoods   = await db.customFoods.toArray();
  // Merge custom foods into FOODS array
  FOODS = [...FOODS_BUILTIN, ...state.customFoods.map(f => ({...f, id:'custom_'+f.id}))];
  // Laad food frequency voor zelflerend systeem
  const ffRec = await db.settings.get('foodFrequency');
  state.foodFrequency = ffRec?.value || {};
  // Laad daglog cache voor synchrone adviezen
  await refreshFoodCache();
  if (!state.profile?.weight) { showSetup(); } else { hideSetup(); initApp(); }
  startClockTick();
  renderFoodMatrix('food-matrix-setup', true);
}

function initApp() {
  FOODS = [...FOODS_BUILTIN, ...state.customFoods.map(f => ({...f, id:'custom_'+f.id}))];
  renderFoodMatrix('food-matrix-main', false);
  renderGymButtons();
  renderGPSButtons();
  updateDashboard();
  renderMealSlots();
  updateSmokeScreen();
  renderReport('dag');
  renderRecentTrainings();
  renderDailyAdvice();
  renderDashAdvice();
  renderNextSportMoment();
  populateMenuProductSelect();
  if (state.settings.notifications) requestNotificationPermission();
  startSmokeInterval();
  scheduleAllNotifications();
}

// ── CLOCK ────────────────────────────────────────────────────
function startClockTick() {
  setInterval(() => {
    const el = document.getElementById('dash-time');
    if (el) el.textContent = new Date().toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'});
    if (state.currentScreen==='dashboard') { updateDashSmoke(); updateMovementBar(); }
    if (state.currentScreen==='smoke')     updateSmokeLive();
    if (state.activeTraining && !state.timerPaused) updateGymTimer();
    checkGymReminder();
  }, 1000);
}

// ══════════════════════════════════════════════════════════
//  SETUP
// ══════════════════════════════════════════════════════════
function showSetup() { document.getElementById('setup-screen').classList.remove('hidden'); }
function hideSetup() { document.getElementById('setup-screen').classList.add('hidden'); }
function setupStep2() {
  const w=parseFloat(document.getElementById('setup-weight').value);
  const h=parseInt(document.getElementById('setup-height').value);
  const a=parseInt(document.getElementById('setup-age').value);
  if(!w||!h||!a){toast('Vul alle velden in!','error');return;}
  state.profile={weight:w,startWeight:w,height:h,age:a,name:document.getElementById('setup-name').value.trim()||'Soldaat',breakfastTime:'07:00',cigsPerDay:20,cigPackPrice:9.50};
  showSetupStep(2);
}
function setupStep3() {
  state.profile.breakfastTime=document.getElementById('setup-breakfast').value||'07:00';
  state.profile.cigsPerDay=parseInt(document.getElementById('setup-cigs').value)||20;
  state.profile.cigPackPrice=parseFloat(document.getElementById('setup-cig-price').value)||9.50;
  state.mealSchedule=computeMealSchedule(state.profile.breakfastTime);
  showSetupStep(3);
}
async function finishSetup() {
  state.profile.setupDate=new Date().toISOString();
  await db.settings.put({key:'profile',value:state.profile});
  await db.settings.put({key:'mealSchedule',value:state.mealSchedule});
  const sel=[...document.querySelectorAll('#food-matrix-setup .food-item.selected')].map(el=>el.dataset.id);
  state.foodPreferences=sel.length>0?sel:FOODS.map(f=>f.id);
  await db.settings.put({key:'foodPreferences',value:state.foodPreferences});
  await db.weights.add({date:new Date().toISOString(),weight:state.profile.startWeight});
  state.weightEntries=await db.weights.orderBy('date').toArray();
  hideSetup(); initApp(); showScreen('dashboard');
  toast('Missie gestart! Tijd voor actie!','success');
  speak('Welkom soldaat! De missie is gestart!');
}
async function skipSetup() {
  state.profile={weight:115,startWeight:115,height:178,age:48,name:'Soldaat',breakfastTime:'07:00',cigsPerDay:20,cigPackPrice:9.50,setupDate:new Date().toISOString()};
  state.mealSchedule=computeMealSchedule('07:00');
  state.foodPreferences=FOODS.map(f=>f.id);
  await db.settings.put({key:'profile',value:state.profile});
  await db.settings.put({key:'mealSchedule',value:state.mealSchedule});
  await db.settings.put({key:'foodPreferences',value:state.foodPreferences});
  state.weightEntries=await db.weights.orderBy('date').toArray();
  hideSetup(); initApp(); showScreen('dashboard');
  toast('App gestart!','success');
}
function showSetupStep(n){document.querySelectorAll('.setup-step').forEach(el=>el.classList.remove('active'));document.getElementById('setup-step-'+n).classList.add('active');}
function setupStepBack(n){showSetupStep(n);}

// ══════════════════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════════════════
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('screen-'+name)?.classList.add('active');
  document.querySelector(`[data-screen="${name}"]`)?.classList.add('active');
  state.currentScreen=name;
  if(name==='dashboard') updateDashboard();
  if(name==='food')      { refreshFoodCache().then(() => renderMealSlots()); }
  if(name==='smoke')     updateSmokeScreen();
  if(name==='report')    renderReport(state.activePeriod);
  if(name==='training')  { renderRecentTrainings(); renderDailyAdvice(); }
  if(name==='settings')  renderSettings();
  vibrate(20);
}
function goHome() { showScreen('dashboard'); }

// ══════════════════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════════════════
async function updateDashboard() {
  if(!state.profile) return;
  const now=new Date();
  const days=['Zondag','Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag'];
  const mons=['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('dash-date',`${days[now.getDay()]} ${now.getDate()} ${mons[now.getMonth()]}`);
  const h=now.getHours();
  set('greeting-text',(h<6?'Goedenacht, ':h<12?'Goedmorgen, ':h<18?'Goedmiddag, ':'Goedenavond, ')+(state.profile.name||'Soldaat')+'!');
  const startW=state.profile.startWeight||state.profile.weight||115;
  const currentW=state.weightEntries.length>0?state.weightEntries[state.weightEntries.length-1].weight:startW;
  set('dash-weight-start',startW.toFixed(1));
  set('dash-weight-now',currentW.toFixed(1));
  set('dash-weight-lost',((startW-currentW)>=0?'-':'+')+Math.abs(startW-currentW).toFixed(1));
  set('dash-bmi',(currentW/Math.pow((state.profile.height||178)/100,2)).toFixed(1));
  set('dash-streak',`🔥 ${await computeStreak()} dagen`);
  const log=await getTodayFoodLog();
  const eaten=log.reduce((s,e)=>s+(e.kcal||0),0);
  const burned=await getTodayCaloriesBurned();
  const bmr=computeBMR();
  set('dash-kcal-eaten',eaten+' kcal');
  set('dash-kcal-burned',burned+' kcal');
  set('dash-kcal-goal',bmr+' kcal');
  const bar=document.getElementById('dash-cal-bar');
  if(bar) bar.style.width=Math.min(100,Math.round(eaten/bmr*100))+'%';
  updateDashSmoke();
  updateNextMeal();
  updateMovementBar();
  renderDashAdvice();
  renderNextSportMoment();
  drawWeightChart();
  renderWeightTrend();
}

function updateDashSmoke() {
  const el=document.getElementById('dash-smoke-status'),el2=document.getElementById('dash-smoke-saved');
  if(!el) return;
  if(!state.smokingStop){el.textContent='Stel stopmoment in →';el.style.color='var(--steel)';if(el2)el2.textContent='';return;}
  const diff=Date.now()-state.smokingStop.getTime();
  el.textContent=formatDuration(diff);el.style.color='var(--green-bright)';
  if(el2) el2.textContent=`€${computeMoneySaved(diff)} bespaard · ${computeCigsNotSmoked(diff)} sigaretten`;
}

function updateNextMeal() {
  const el=document.getElementById('dash-next-meal');if(!el||!state.mealSchedule.length)return;
  const now=new Date(),nowMin=now.getHours()*60+now.getMinutes();
  let nextIdx=-1,nextTime=null;
  state.mealSchedule.forEach((t,i)=>{const[h,m]=t.split(':').map(Number);if(h*60+m>nowMin&&nextIdx===-1){nextIdx=i;nextTime=t;}});
  if(nextTime!==null){
    const[h,m]=nextTime.split(':').map(Number);
    const mins=h*60+m-nowMin;
    const adv=getMealNutritionAdvice(nextIdx);
    const names=['Ontbijt','Tussendoor','Lunch','Tussendoor','Avondeten','Snack'];
    el.innerHTML=`<div style="cursor:pointer;" onclick="showScreen('food');openMealModal(${nextIdx})">
      <div style="margin-bottom:4px"><strong style="color:var(--amber);font-family:var(--font-mono)">${nextTime}</strong>
      <span style="color:var(--steel);font-size:13px"> — over ${mins} min — ${names[nextIdx]}</span></div>
      <div style="font-size:12px;color:var(--steel-light);line-height:1.4">${adv.suggestions?.[0]?.food||adv.suggestion?.food||'—'}</div>
      <div style="font-size:11px;color:var(--steel);font-family:var(--font-mono);margin-top:2px">${adv.mealKcal} kcal · ${adv.mealProtein}g eiwit doel</div>
      <div style="font-size:11px;color:var(--amber);margin-top:2px">👆 Tik om te loggen</div>
    </div>`;
  } else {
    el.textContent='Geen eetmomenten meer vandaag!';
  }
}

// ── BEWEEGVOORTGANG BALK ──────────────────────────────────────
async function updateMovementBar() {
  const today=new Date().toISOString().split('T')[0];
  const trainings=await db.trainings.where('date').startsWith(today).toArray();
  const totalMin=Math.round(trainings.reduce((s,t)=>s+(t.duration||0),0)/60);
  const pct=Math.min(100,Math.round(totalMin/DAILY_MOVE_GOAL_MIN*100));
  const el=document.getElementById('move-bar-fill');
  const lbl=document.getElementById('move-bar-label');
  const status=document.getElementById('move-bar-status');
  if(el) el.style.width=pct+'%';
  if(lbl) lbl.textContent=`${totalMin}/${DAILY_MOVE_GOAL_MIN} min bewogen`;
  if(status) {
    if(pct>=100) { status.textContent='✅ Daaldoel gehaald!'; status.style.color='var(--green-bright)'; }
    else         { status.textContent=`Nog ${DAILY_MOVE_GOAL_MIN-totalMin} min te gaan`; status.style.color='var(--steel)'; }
  }
  // Color coding
  if(el) el.style.background = pct>=100?'var(--green)':pct>=50?'var(--amber)':'var(--red)';
  // Update sport advies na elke beweegupdate
  renderNextSportMoment();
}

// ── SPORT ADVIES OP DASHBOARD ──────────────────────────────────
function renderDashAdvice() {
  const c=document.getElementById('dash-advice-card');if(!c)return;
  const adv=SPORT_ADVICE_POOL[state.todayAdviceIndex];
  c.innerHTML=`<div style="display:flex;align-items:flex-start;gap:10px;">
    <span style="font-size:28px">${adv.emoji}</span>
    <div style="flex:1">
      <div style="font-family:var(--font-display);font-size:17px;letter-spacing:1px;color:var(--red-hot)">${adv.activity}</div>
      <div style="font-size:12px;color:var(--steel);font-family:var(--font-mono);margin:2px 0">${adv.time} · ${adv.duration} · ~${adv.kcal} kcal</div>
      <div style="font-size:13px;color:var(--steel-light);margin-top:6px;line-height:1.5">${adv.desc}</div>
    </div>
    <button onclick="nextAdvice()" style="background:var(--border);border:none;color:var(--steel-light);padding:5px 8px;border-radius:4px;font-size:11px;cursor:pointer;white-space:nowrap;">🔄 Ander</button>
  </div>`;
}

// ── BEWEEGADVIES PAGINA ───────────────────────────────────────
function renderDailyAdvice() {
  const c=document.getElementById('daily-advice-card');if(!c)return;
  const adv=SPORT_ADVICE_POOL[state.todayAdviceIndex];
  c.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
    <div>
      <div style="font-family:var(--font-display);font-size:20px;letter-spacing:1px;color:var(--red-hot)">${adv.emoji} ${adv.activity}</div>
      <div style="font-size:12px;color:var(--steel);font-family:var(--font-mono)">${adv.time} · ${adv.duration} · ~${adv.kcal} kcal</div>
    </div>
    <button onclick="nextAdvice()" style="background:var(--border);border:none;color:var(--steel-light);padding:6px 10px;border-radius:4px;font-size:12px;cursor:pointer;">🔄 Ander advies</button>
  </div>
  <div style="font-size:14px;line-height:1.6;">${adv.desc}</div>`;
}

async function nextAdvice() {
  state.todayAdviceIndex=(state.todayAdviceIndex+1)%SPORT_ADVICE_POOL.length;
  await db.settings.put({key:'adviceIndex',value:state.todayAdviceIndex});
  renderDashAdvice();
  renderDailyAdvice();
  vibrate(15);
}

// ── SPORTSCHOOL REMINDER ──────────────────────────────────────
let _lastGymReminderMin = -1;
function checkGymReminder() {
  if(!state.settings.gymReminderEnabled) return;
  const now=new Date();
  const nowMin=now.getHours()*60+now.getMinutes();
  const [rh,rm]=GYM_REMINDER.time.split(':').map(Number);
  const reminderMin=rh*60+rm;
  if(nowMin===reminderMin && _lastGymReminderMin!==nowMin) {
    _lastGymReminderMin=nowMin;
    toast('💪 '+GYM_REMINDER.msg,'success');
    if(state.settings.sound) speak(GYM_REMINDER.speech);
    if(Notification.permission==='granted') {
      new Notification('💪 Steel & Smoke — Sportschool!',{body:GYM_REMINDER.msg,icon:'./icons/icon-192.png'});
    }
  }
}

// ── WEIGHT CHART ──────────────────────────────────────────────
function drawWeightChart() {
  const canvas=document.getElementById('weight-chart'),emptyEl=document.getElementById('weight-chart-empty');
  if(!canvas)return;
  const entries=state.weightEntries.slice(-30);
  if(entries.length<2){canvas.style.display='none';if(emptyEl)emptyEl.style.display='block';return;}
  canvas.style.display='block';if(emptyEl)emptyEl.style.display='none';
  const W=canvas.offsetWidth||320,H=100;
  canvas.width=W*devicePixelRatio;canvas.height=H*devicePixelRatio;
  canvas.style.width=W+'px';canvas.style.height=H+'px';
  const ctx=canvas.getContext('2d');ctx.scale(devicePixelRatio,devicePixelRatio);
  const ws=entries.map(e=>e.weight),minW=Math.min(...ws)-1,maxW=Math.max(...ws)+1;
  const pad=8,cW=W-pad*2,cH=H-pad*2;
  ctx.fillStyle='#161616';ctx.fillRect(0,0,W,H);
  const px=i=>pad+(i/(entries.length-1))*cW,py=w=>pad+cH-((w-minW)/(maxW-minW||1))*cH;
  ctx.beginPath();ctx.strokeStyle='#27ae60';ctx.lineWidth=2;ctx.lineJoin='round';
  entries.forEach((e,i)=>i===0?ctx.moveTo(px(i),py(e.weight)):ctx.lineTo(px(i),py(e.weight)));ctx.stroke();
  ctx.beginPath();entries.forEach((e,i)=>i===0?ctx.moveTo(px(i),py(e.weight)):ctx.lineTo(px(i),py(e.weight)));
  ctx.lineTo(px(entries.length-1),pad+cH);ctx.lineTo(px(0),pad+cH);ctx.closePath();
  ctx.fillStyle='rgba(39,174,96,0.1)';ctx.fill();
  entries.forEach((e,i)=>{ctx.beginPath();ctx.arc(px(i),py(e.weight),3,0,Math.PI*2);ctx.fillStyle='#27ae60';ctx.fill();});
  ctx.fillStyle='#7f8c8d';ctx.font='10px monospace';ctx.textAlign='left';ctx.fillText(maxW.toFixed(1)+'kg',pad,pad+10);
  ctx.textAlign='right';ctx.fillText(minW.toFixed(1)+'kg',W-pad,H-2);
}

// ── GEWICHTSTREND ANALYSE ────────────────────────────────────
function renderWeightTrend() {
  const c = document.getElementById('dash-weight-trend');
  if (!c || state.weightEntries.length < 2) return;
  const recent = state.weightEntries.slice(-7);
  const oldest = recent[0].weight;
  const newest = recent[recent.length - 1].weight;
  const diff = newest - oldest;
  const days = recent.length - 1;
  let icon, color, label;
  if (diff < -0.3) {
    icon = '📉'; color = 'var(--green-bright)';
    label = diff.toFixed(1) + ' kg afgelopen ' + days + ' dgn';
  } else if (diff > 0.3) {
    icon = '📈'; color = 'var(--red-hot)';
    label = '+' + diff.toFixed(1) + ' kg afgelopen ' + days + ' dgn';
  } else {
    icon = '➡️'; color = 'var(--steel)';
    label = 'Stabiel afgelopen ' + days + ' dagen';
  }
  c.innerHTML = '<span style="color:' + color + ';font-size:13px">' + icon + ' ' + label + '</span>';
}

// ── WEIGHT LOG ────────────────────────────────────────────────
function showWeightModal(){document.getElementById('weight-modal').classList.add('active');renderWeightHistory();}
function renderWeightHistory(){
  const c=document.getElementById('weight-history');if(!c)return;
  const entries=[...state.weightEntries].reverse().slice(0,15);
  if(!entries.length){c.innerHTML='';return;}
  let html='<div style="font-family:var(--font-display);font-size:14px;letter-spacing:1px;color:var(--steel);margin-bottom:8px;">GEWICHTSLOG</div>';
  entries.forEach((e,i)=>{
    const prev=entries[i+1],delta=prev?e.weight-prev.weight:0;
    const ds=delta!==0?(delta>0?'+':'')+delta.toFixed(1)+' kg':'—';
    html+=`<div class="weight-entry"><span class="we-date">${new Date(e.date).toLocaleDateString('nl-NL',{day:'2-digit',month:'short'})}</span><span class="we-val">${e.weight.toFixed(1)} kg</span><span class="we-delta ${delta<0?'down':delta>0?'up':''}">${ds}</span></div>`;
  });
  c.innerHTML=html;
}
async function logWeight(){
  const w=parseFloat(document.getElementById('weight-input').value);
  if(!w||w<30||w>300){toast('Voer een geldig gewicht in!','error');return;}
  await db.weights.add({date:new Date().toISOString(),weight:w});
  state.weightEntries=await db.weights.orderBy('date').toArray();
  state.profile.weight=w;await db.settings.put({key:'profile',value:state.profile});
  document.getElementById('weight-input').value='';
  toast(w+' kg gelogd!','success');vibrate([30,20,30]);
  renderWeightHistory();drawWeightChart();updateDashboard();
  const prev=state.weightEntries[state.weightEntries.length-2];
  if(prev&&w<prev.weight)speak(`Goed bezig soldaat! ${(prev.weight-w).toFixed(1)} kilo lichter!`);
}

// ══════════════════════════════════════════════════════════
//  VANDAAG OVERZICHT
// ══════════════════════════════════════════════════════════
async function showTodayDetail() {
  const today=new Date().toISOString().split('T')[0];
  const foodLog=await getTodayFoodLog();
  const trainings=await db.trainings.where('date').startsWith(today).toArray();
  const totEaten=foodLog.reduce((s,e)=>s+(e.kcal||0),0);
  const totProt=foodLog.reduce((s,e)=>s+(e.protein||0),0);
  const totCarbs=foodLog.reduce((s,e)=>s+(e.carbs||0),0);
  const totFat=foodLog.reduce((s,e)=>s+(e.fat||0),0);
  const totBurned=trainings.reduce((s,t)=>s+(t.kcal||0),0);
  const totDur=Math.round(trainings.reduce((s,t)=>s+(t.duration||0),0)/60);
  const bmr=computeBMR();
  const netKcal=totEaten-totBurned;
  const names=['Ontbijt','Tussendoor','Lunch','Tussendoor','Avondeten','Snack'];
  // Doelen berekenen
  const proteinGoal=Math.round(state.profile?.weight||115)*1.6; // 1.6g/kg
  const fatGoal=Math.round(bmr*0.25/9); // 25% van kcal uit vet
  const carbGoal=Math.round((bmr-proteinGoal*4-fatGoal*9)/4); // rest uit koolhydraten

  let html=`<div style="padding:0 16px 16px;">
    <div style="font-family:var(--font-display);font-size:20px;letter-spacing:1px;margin:16px 0 4px">📅 ${new Date().toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long'})}</div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">
      <div class="stat-block ${totEaten<=bmr?'green':'red'}"><div class="stat-value" style="font-size:20px">${totEaten}</div><div class="stat-label">kcal gegeten</div></div>
      <div class="stat-block green"><div class="stat-value" style="font-size:20px">${totBurned}</div><div class="stat-label">kcal verbrand</div></div>
      <div class="stat-block ${netKcal<=bmr?'amber':'red'}"><div class="stat-value" style="font-size:20px">${netKcal}</div><div class="stat-label">netto</div></div>
    </div>

    <div class="progress-bar-wrap" style="margin:0 0 6px">
      <div class="progress-label"><span>Caloriedoel</span><span>${totEaten}/${bmr} kcal</span></div>
      <div class="progress-bar"><div class="progress-fill ${totEaten<=bmr?'green':'red'}" style="width:${Math.min(100,Math.round(totEaten/bmr*100))}%;background:${totEaten<=bmr?'var(--green)':'var(--red)'}"></div></div>
    </div>
    <div class="progress-bar-wrap" style="margin:0 0 6px">
      <div class="progress-label"><span>Eiwit</span><span>${Math.round(totProt)}/${proteinGoal}g</span></div>
      <div class="progress-bar"><div class="progress-fill amber" style="width:${Math.min(100,Math.round(totProt/proteinGoal*100))}%;background:var(--amber)"></div></div>
    </div>
    <div class="progress-bar-wrap" style="margin:0 0 6px">
      <div class="progress-label"><span>Koolhydraten</span><span>${Math.round(totCarbs)}/${carbGoal}g</span></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100,Math.round(totCarbs/carbGoal*100))}%;background:var(--steel)"></div></div>
    </div>
    <div class="progress-bar-wrap" style="margin:0 0 12px">
      <div class="progress-label"><span>Vet</span><span>${Math.round(totFat)}/${fatGoal}g</span></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100,Math.round(totFat/fatGoal*100))}%;background:#8e44ad"></div></div>
    </div>
    <div class="progress-bar-wrap" style="margin:0 0 16px">
      <div class="progress-label"><span>🏃 Bewegen</span><span>${totDur}/${DAILY_MOVE_GOAL_MIN} min</span></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100,Math.round(totDur/DAILY_MOVE_GOAL_MIN*100))}%;background:${totDur>=DAILY_MOVE_GOAL_MIN?'var(--green)':'var(--amber)'}"></div></div>
    </div>`;

  // Gegeten
  html+=`<div style="font-family:var(--font-display);font-size:15px;letter-spacing:1px;color:var(--steel-light);margin-bottom:8px;">🍽️ GEGETEN</div>`;
  if(foodLog.length===0) html+=`<div style="color:var(--steel);font-size:14px;margin-bottom:12px;">Nog niets gegeten</div>`;
  foodLog.forEach(entry=>{
    const logTime=entry.logTime?new Date(entry.logTime).toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'}):entry.time||'';
    html+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);">
      <div style="flex:1"><div style="font-weight:700;font-size:14px">${names[entry.mealIndex]||'Maaltijd'}</div>
      <div style="font-size:13px;color:var(--steel-light)">${entry.food}</div>
      <div style="font-size:11px;color:var(--steel);font-family:var(--font-mono)">${logTime}${entry.protein?' · '+Math.round(entry.protein)+'g P':''}${entry.carbs?' · '+Math.round(entry.carbs)+'g K':''}${entry.fat?' · '+Math.round(entry.fat)+'g V':''}</div></div>
      <div style="text-align:right;min-width:60px">
        <div style="font-family:var(--font-mono);color:var(--amber);font-size:16px">${entry.kcal||0}</div>
        <div style="font-size:10px;color:var(--steel)">kcal</div>
        <button onclick="deleteFoodEntry(${entry.id})" style="background:none;border:none;color:var(--red-hot);font-size:16px;cursor:pointer;padding:2px">🗑️</button>
      </div>
    </div>`;
  });

  // Beweging
  html+=`<div style="font-family:var(--font-display);font-size:15px;letter-spacing:1px;color:var(--steel-light);margin:16px 0 8px;">🏋️ BEWEGING</div>`;
  if(trainings.length===0) html+=`<div style="color:var(--steel);font-size:14px;">Nog geen beweging gelogd</div>`;
  trainings.forEach(t=>{
    const distStr=t.distance?` · ${t.distance.toFixed(2)} km`:'';
    html+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);">
      <div><div style="font-weight:700;font-size:14px">${t.name}</div>
      <div style="font-size:11px;color:var(--steel);font-family:var(--font-mono)">${t.time||''} · ${formatSeconds(t.duration)}${distStr}</div></div>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="font-family:var(--font-mono);color:var(--green-bright);font-size:16px">${t.kcal} kcal</div>
        <button onclick="deleteTraining(${t.id})" style="background:none;border:none;color:var(--red-hot);font-size:16px;cursor:pointer;padding:4px">🗑️</button>
      </div>
    </div>`;
  });
  html+=`</div>`;
  document.getElementById('today-detail-content').innerHTML=html;
  document.getElementById('today-detail-overlay').classList.add('active');
}
async function deleteFoodEntry(id){
  await db.foodLog.delete(id);toast('Verwijderd','success');showTodayDetail();updateDashboard();renderMealSlots();
}
async function deleteTraining(id){
  await db.trainings.delete(id);toast('Training verwijderd','success');showTodayDetail();renderRecentTrainings();updateDashboard();
}
function closeTodayDetail(){document.getElementById('today-detail-overlay').classList.remove('active');}

// ══════════════════════════════════════════════════════════
//  SLIMME VOEDINGSCOACH — echte intelligentie
//  Berekent per eetmoment wat er nog nodig is die dag
//  en past de suggesties aan op basis van tekorten
// ══════════════════════════════════════════════════════════

// Dagdoelen op basis van profiel (gecached per sessie)
function getDailyTargets() {
  const bmr = computeBMR();
  const w = state.profile?.weight || 115;
  const proteinGoal = Math.round(w * 1.6);       // 1.6g eiwit per kg
  const fatGoal     = Math.round(bmr * 0.25 / 9); // 25% kcal uit vet
  const carbGoal    = Math.round((bmr - proteinGoal*4 - fatGoal*9) / 4);
  return { kcal: bmr, protein: proteinGoal, fat: fatGoal, carbs: carbGoal };
}

// Synchrone versie voor gebruik in renderMealSlots (cache van vandaag)
let _todayFoodCache = { log: [], date: '' };

function getMealNutritionAdvice(mealIndex) {
  const targets = getDailyTargets();
  const mealNames = ['Ontbijt','Tussendoor','Lunch','Tussendoor','Avondeten','Snack'];

  // Gebruik gecachede daglog (wordt async ververst door refreshFoodCache)
  const today = new Date().toISOString().split('T')[0];
  const log = _todayFoodCache.date === today ? _todayFoodCache.log : [];

  // Wat is er al gegeten voor dit eetmoment?
  const alreadyEaten = log.filter(e => e.mealIndex < mealIndex);
  const eatenKcal    = alreadyEaten.reduce((s,e) => s + (e.kcal||0), 0);
  const eatenProtein = alreadyEaten.reduce((s,e) => s + (e.protein||0), 0);
  const eatenFat     = alreadyEaten.reduce((s,e) => s + (e.fat||0), 0);
  const eatenCarbs   = alreadyEaten.reduce((s,e) => s + (e.carbs||0), 0);

  // Hoeveel maaltijden zijn er nog (inclusief deze)?
  const mealsLeft = 6 - mealIndex;

  // Verdeel het resterende doel gelijkmatig over de rest
  // met weging: hoofdmaaltijden (0,2,4) krijgen meer dan tussendoor (1,3,5)
  const weights     = [2.0, 0.8, 2.2, 0.8, 2.2, 0.8];
  const weightSlice = weights[mealIndex];
  const totalWeightLeft = weights.slice(mealIndex).reduce((s,w) => s+w, 0);
  const fraction = totalWeightLeft > 0 ? weightSlice / totalWeightLeft : 1/mealsLeft;

  const remainKcal    = Math.max(0, targets.kcal    - eatenKcal);
  const remainProtein = Math.max(0, targets.protein  - eatenProtein);
  const remainFat     = Math.max(0, targets.fat      - eatenFat);
  const remainCarbs   = Math.max(0, targets.carbs    - eatenCarbs);

  const mealKcal    = Math.round(remainKcal    * fraction);
  const mealProtein = Math.round(remainProtein * fraction);
  const mealFat     = Math.round(remainFat     * fraction);
  const mealCarbs   = Math.round(remainCarbs   * fraction);

  // ── SLIMME SUGGESTIES ────────────────────────────────────────
  // Kies suggesties die het grootste tekort aanvullen
  // Sorteervolgorde: eiwit-tekort > kcal-tekort > vet-tekort

  // Pool van alle bekende maaltijden (uitbreidbaar met eigen producten)
  const allMealOptions = _buildMealOptionPool(mealIndex, targets, eatenKcal, eatenProtein, eatenFat, eatenCarbs);

  // Score elke optie op basis van hoe goed het de tekorten aanvult
  const scored = allMealOptions.map(opt => {
    let score = 0;
    // Beloon eiwit (hoog prioriteit bij 115kg / spierbehoud)
    if (remainProtein > 10) score += Math.min(opt.protein, remainProtein) * 3;
    // Beloon kcal in juiste range (niet te veel, niet te weinig)
    const kcalDiff = Math.abs(opt.kcal - mealKcal);
    score += Math.max(0, 100 - kcalDiff) * 0.5;
    // Bonus voor eigen producten die je eerder hebt gelogd (zelflerend!)
    const freq = state.foodFrequency?.[opt.id] || 0;
    score += freq * 5;
    // Bonus voor producten in je voorkeuren
    if (state.foodPreferences?.includes(opt.id)) score += 10;
    return { ...opt, score };
  });

  // Sorteer op score, pak de top 4
  scored.sort((a, b) => b.score - a.score);
  const suggestions = scored.slice(0, 4);

  // Als nog geen data: gebruik statische fallback
  const fallback = _getStaticSuggestions(mealIndex);
  const finalSuggestions = suggestions.length >= 2 ? suggestions : fallback;

  // De top suggestie is de aanbeveling
  const day = new Date().getDay();
  const suggestion = finalSuggestions[day % finalSuggestions.length] || finalSuggestions[0];

  return {
    mealKcal, mealProtein, mealFat, mealCarbs,
    suggestion,
    suggestions: finalSuggestions,
    mealName: mealNames[mealIndex],
    remainKcal, remainProtein, remainFat, remainCarbs,
    eatenKcal, eatenProtein
  };
}

// Bouw een pool van maaltijdopties op basis van FOODS + eigen producten
function _buildMealOptionPool(mealIndex, targets, eatenKcal, eatenProtein, eatenFat, eatenCarbs) {
  const allFoods = FOODS || [];
  const pool = [];

  // Voeg FOODS toe als enkelvoudige producten (met typische portiegrootte)
  allFoods.forEach(food => {
    // Schat een realistische portie per eetmoment
    const portions = {
      'snee': 3, 'plak': 2, 'el': 2, 'stuk': 1,
      '100g': 1.5, '100ml': 2, 'port': 1, 'blik': 1, 'shaker': 1
    };
    const qty = portions[food.unit] || 1;
    pool.push({
      id: food.id,
      food: `${food.emoji} ${food.name} (${qty}× ${food.unit})`,
      kcal: Math.round(food.kcal * qty),
      protein: Math.round(food.protein * qty),
      carbs: Math.round(food.carbs * qty),
      fat: Math.round(food.fat * qty),
    });
  });

  // Voeg samengestelde maaltijden toe (statisch per categorie)
  const combined = _getCombinedMeals(mealIndex);
  combined.forEach(m => pool.push(m));

  // Filter op redelijke kcal range voor dit eetmoment (± 60%)
  const bmr = targets.kcal;
  const distribution = [0.20, 0.10, 0.25, 0.10, 0.25, 0.10];
  const targetKcal = bmr * distribution[mealIndex];
  return pool.filter(opt => opt.kcal > 40 && opt.kcal < targetKcal * 2.5);
}

// Statische samengestelde maaltijden per categorie
function _getCombinedMeals(mealIndex) {
  const all = {
    0: [ // Ontbijt
      {id:'combo_ob1', food:'🍞 3× volkoren + 2× kaas + boter', kcal:425, protein:22, carbs:48, fat:16},
      {id:'combo_ob2', food:'🌾 Havermout (60g) + banaan + kwark', kcal:390, protein:22, carbs:62, fat:5},
      {id:'combo_ob3', food:'🍳 Roerei (2 ei) + 2× volkoren', kcal:345, protein:18, carbs:30, fat:15},
      {id:'combo_ob4', food:'🥣 Griekse yoghurt (200g) + fruit', kcal:270, protein:20, carbs:36, fat:10},
      {id:'combo_ob5', food:'🍞 2× volkoren + pindakaas + banaan', kcal:380, protein:12, carbs:52, fat:16},
    ],
    1: [ // Tussendoor ochtend
      {id:'combo_td1', food:'🍎 Appel + 20g noten', kcal:172, protein:4, carbs:23, fat:9},
      {id:'combo_td2', food:'🥛 150g magere kwark + kiwi', kcal:148, protein:17, carbs:14, fat:1},
      {id:'combo_td3', food:'🍌 Banaan + kwark (100g)', kcal:146, protein:11, carbs:27, fat:0},
      {id:'combo_td4', food:'🥤 Proteïneshake', kcal:130, protein:25, carbs:5, fat:2},
    ],
    2: [ // Lunch
      {id:'combo_lu1', food:'🍞 3× volkoren + tonijn + salade', kcal:420, protein:35, carbs:44, fat:9},
      {id:'combo_lu2', food:'🍗 Kip (150g) + groenten + olijfolie', kcal:380, protein:38, carbs:15, fat:18},
      {id:'combo_lu3', food:'🍞 2× volkoren + 2 eieren + tomaat', kcal:320, protein:20, carbs:30, fat:12},
      {id:'combo_lu4', food:'🥗 Grote salade + ei + volkoren', kcal:350, protein:18, carbs:32, fat:14},
      {id:'combo_lu5', food:'🐠 Tonijn + 2× volkoren + komkommer', kcal:380, protein:35, carbs:32, fat:8},
    ],
    3: [ // Tussendoor middag
      {id:'combo_tm1', food:'🧀 Cottage cheese (100g) + groenten', kcal:118, protein:12, carbs:5, fat:5},
      {id:'combo_tm2', food:'🥜 1× volkoren + pindakaas', kcal:180, protein:6, carbs:17, fat:10},
      {id:'combo_tm3', food:'🍊 Sinaasappel + handje noten', kcal:152, protein:4, carbs:22, fat:7},
      {id:'combo_tm4', food:'🥤 Proteïneshake', kcal:130, protein:25, carbs:5, fat:2},
    ],
    4: [ // Avondeten
      {id:'combo_av1', food:'🍗 Kip (150g) + rijst + broccoli', kcal:445, protein:53, carbs:46, fat:7},
      {id:'combo_av2', food:'🐟 Zalm (150g) + aardappelen + groenten', kcal:520, protein:36, carbs:44, fat:20},
      {id:'combo_av3', food:'🥩 Rund (150g) + rijst + spinazie', kcal:480, protein:42, carbs:38, fat:14},
      {id:'combo_av4', food:'🫘 Witte bonen (200g) + kip + groenten', kcal:420, protein:45, carbs:38, fat:8},
      {id:'combo_av5', food:'🍳 Omelet (3 ei) + groenten + volkoren', kcal:380, protein:28, carbs:20, fat:20},
    ],
    5: [ // Avondsnack
      {id:'combo_sn1', food:'🥛 200g magere kwark', kcal:114, protein:20, carbs:8, fat:0},
      {id:'combo_sn2', food:'🍎 Appel of peer', kcal:75, protein:1, carbs:19, fat:0},
      {id:'combo_sn3', food:'🥣 Griekse yoghurt (150g) + kiwi', kcal:193, protein:15, carbs:22, fat:7},
      {id:'combo_sn4', food:'🧀 Cottage cheese (100g)', kcal:103, protein:11, carbs:3, fat:5},
    ],
  };
  return all[mealIndex] || all[0];
}

// Fallback statische suggesties
function _getStaticSuggestions(mealIndex) {
  return _getCombinedMeals(mealIndex);
}

// Ververs de foodlog cache async — wordt aangeroepen na elke opslag
async function refreshFoodCache() {
  const today = new Date().toISOString().split('T')[0];
  const log = await db.foodLog.where('date').equals(today).toArray();
  _todayFoodCache = { log, date: today };
}

// ══════════════════════════════════════════════════════════
//  MEAL SCHEDULE
// ══════════════════════════════════════════════════════════
function computeMealSchedule(bt){
  const[h,m]=bt.split(':').map(Number);
  return Array.from({length:6},(_,i)=>{const tot=h*60+m+i*180;return `${String(Math.floor(tot/60)%24).padStart(2,'0')}:${String(tot%60).padStart(2,'0')}`;});
}
function shiftMealsNow(){
  const now=new Date(),nowMin=now.getHours()*60+now.getMinutes();
  const idx=state.mealSchedule.findIndex(t=>{const[h,m]=t.split(':').map(Number);return h*60+m>nowMin-30;});
  if(idx===-1){toast('Geen eetmomenten meer!');return;}
  const ns=[...state.mealSchedule];
  for(let i=idx;i<6;i++){const tot=nowMin+(i-idx)*180;ns[i]=`${String(Math.floor(tot/60)%24).padStart(2,'0')}:${String(tot%60).padStart(2,'0')}`;}
  state.mealSchedule=ns;db.settings.put({key:'mealSchedule',value:ns});
  renderMealSlots();toast('Schema verschoven!','success');vibrate(30);
}
function showBreakfastPicker(){document.getElementById('breakfast-time-input').value=state.mealSchedule[0]||'07:00';document.getElementById('breakfast-modal').classList.add('active');}
function updateBreakfastTime(){
  const t=document.getElementById('breakfast-time-input').value;
  state.mealSchedule=computeMealSchedule(t);
  if(state.profile){state.profile.breakfastTime=t;db.settings.put({key:'profile',value:state.profile});}
  db.settings.put({key:'mealSchedule',value:state.mealSchedule});
  closeModal('breakfast-modal');renderMealSlots();toast('Schema bijgewerkt!','success');
}
async function renderMealSlots(){
  const container=document.getElementById('meal-slots-container');if(!container)return;
  // Ververs cache zodat adviezen kloppen
  await refreshFoodCache();
  const todayLog=_todayFoodCache.log;
  const now=new Date(),nowMin=now.getHours()*60+now.getMinutes();
  const names=['Ontbijt','Tussendoor','Lunch','Tussendoor','Avondeten','Snack'];
  let html='';
  state.mealSchedule.forEach((time,i)=>{
    const[h,m]=time.split(':').map(Number),mealMin=h*60+m;
    const done=todayLog.find(e=>e.mealIndex===i);
    const isNow=Math.abs(mealMin-nowMin)<30&&!done;
    const isFuture=mealMin>nowMin+30&&!done;
    const isPast=mealMin<nowMin-30&&!done;

    // Altijd klikbaar — ook toekomstige en gemiste momenten
    let cls=done?'done':isNow?'active-now':isPast?'past-meal':'';
    let check=done?'✅':isNow?'🔔':isPast?'⚠️':'○';

    const adv=getMealNutritionAdvice(i);
    let label, kcalLbl, sublabel='';

    if(done){
      label=done.food;
      kcalLbl=done.kcal+' kcal gegeten';
    } else if(isPast){
      label='Niet gelogd — klik om alsnog in te voeren';
      kcalLbl=adv.mealKcal+' kcal doel';
    } else {
      // Toon slimste suggestie
      const topSugg=adv.suggestions?.[0];
      label=topSugg?topSugg.food:'—';
      kcalLbl=adv.mealKcal+' kcal doel · '+adv.mealProtein+'g eiwit';
      if(adv.remainProtein>20) sublabel='⚠️ Nog '+Math.round(adv.remainProtein)+'g eiwit nodig vandaag';
    }

    html+=`<div class="meal-slot ${cls}" onclick="openMealModal(${i})" style="cursor:pointer;">
      <div class="meal-time" style="${isPast&&!done?'color:var(--red-hot)':''}">${time}</div>
      <div style="flex:1">
        <div class="meal-name">${names[i]}${isFuture?' <span style="font-size:10px;color:var(--steel)">(gepland)</span>':''}</div>
        <div class="meal-kcal" style="font-size:12px;line-height:1.4;">${label}</div>
        <div style="font-size:10px;color:var(--steel);font-family:var(--font-mono)">${kcalLbl}</div>
        ${sublabel?`<div style="font-size:10px;color:var(--amber);margin-top:2px">${sublabel}</div>`:''}
      </div>
      <div class="meal-check">${check}</div>
    </div>`;
  });
  container.innerHTML=html;
  updateFoodTotals();
}

// ── MEAL MODAL MET SLIMME VOEDINGSADVIES ─────────────────────
function openMealModal(i){
  state.currentMealIndex=i;state.menuItems=[];
  const adv=getMealNutritionAdvice(i);
  const names=['Ontbijt','Tussendoor','Lunch','Tussendoor','Avondeten','Snack'];
  document.getElementById('meal-modal-title').textContent=`${names[i]} — ${state.mealSchedule[i]}`;

  // Toon slimme voedingsadvies banner met tekorten van vandaag
  const banner=document.getElementById('meal-nutrition-advice');
  if(banner){
    const kcalPct = adv.eatenKcal > 0 ? Math.round(adv.eatenKcal / getDailyTargets().kcal * 100) : 0;
    const proteinStatus = adv.remainProtein > 20
      ? `⚠️ Nog ${Math.round(adv.remainProtein)}g eiwit nodig!`
      : adv.remainProtein > 0
      ? `${Math.round(adv.remainProtein)}g eiwit nog nodig`
      : '✅ Eiwit doel gehaald';
    const kcalStatus = adv.remainKcal > 0
      ? `Nog ${adv.remainKcal} kcal ruimte vandaag`
      : `Let op: caloriedoel bereikt!`;

    banner.innerHTML=`<div style="background:rgba(39,174,96,0.1);border-left:3px solid var(--green);padding:10px 12px;border-radius:2px;margin-bottom:12px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--green-bright);margin-bottom:6px;">🧠 Coach — Wat heb jij nu nodig?</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
        <div style="background:rgba(0,0,0,0.2);border-radius:3px;padding:6px;text-align:center;">
          <div style="font-family:var(--font-mono);font-size:16px;color:var(--amber)">${adv.mealKcal}</div>
          <div style="font-size:10px;color:var(--steel)">kcal doel nu</div>
        </div>
        <div style="background:rgba(0,0,0,0.2);border-radius:3px;padding:6px;text-align:center;">
          <div style="font-family:var(--font-mono);font-size:16px;color:var(--amber)">${adv.mealProtein}g</div>
          <div style="font-size:10px;color:var(--steel)">eiwit doel nu</div>
        </div>
      </div>
      <div style="font-size:12px;color:var(--green-bright);margin-bottom:3px;">${proteinStatus}</div>
      <div style="font-size:12px;color:var(--steel)">${kcalStatus} · Al gegeten: ${adv.eatenKcal} kcal</div>
    </div>`;
  }

  // Render slimme suggesties (gesorteerd op score)
  renderSmartSuggestions(i, adv);
  mealTab('suggest');
  document.getElementById('meal-modal').classList.add('active');
}

// ── SLIMME SUGGESTIES RENDEREN ────────────────────────────────
function renderSmartSuggestions(mealIndex, adv) {
  const c = document.getElementById('meal-tab-suggest');
  if (!c) return;

  const suggestions = adv.suggestions || _getCombinedMeals(mealIndex);
  const allFoods = FOODS || [];

  // Eigen producten die je eerder hebt gelogd — bovenaan
  const frequentFoods = allFoods
    .filter(f => (state.foodFrequency[f.id] || 0) > 0)
    .sort((a,b) => (state.foodFrequency[b.id]||0) - (state.foodFrequency[a.id]||0))
    .slice(0, 3);

  let html = '';

  // Toon eigen veelgebruikte producten bovenaan
  if (frequentFoods.length > 0) {
    html += '<div style="font-size:11px;color:var(--amber);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">⭐ Jouw meest gekozen producten</div>';
    frequentFoods.forEach(food => {
      const portions = {'snee':3,'plak':2,'el':2,'stuk':1,'100g':1.5,'100ml':2,'port':1,'blik':1,'shaker':1};
      const qty = portions[food.unit] || 1;
      const kcal = Math.round(food.kcal * qty);
      const protein = Math.round(food.protein * qty);
      const freq = state.foodFrequency[food.id] || 0;
      html += `<div class="meal-preset-card" onclick="quickLogFood('${food.id}',${qty})" style="border-left:3px solid var(--amber);margin-bottom:6px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:22px">${food.emoji}</span>
          <div style="flex:1">
            <div style="font-weight:700;font-size:14px">${food.name} <span style="font-size:11px;color:var(--amber)">(${freq}× gebruikt)</span></div>
            <div style="font-size:11px;color:var(--steel)">${qty}× ${food.unit} · ${kcal} kcal · ${protein}g eiwit</div>
          </div>
          <div style="text-align:right;min-width:50px">
            <div style="font-family:var(--font-mono);font-size:16px;color:var(--amber)">${kcal}</div>
            <div style="font-size:9px;color:var(--steel)">kcal</div>
          </div>
        </div>
      </div>`;
    });
    html += '<div style="height:4px"></div>';
  }

  // Coach-gesorteerde suggesties
  html += '<div style="font-size:11px;color:var(--green-bright);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">🧠 Coach aanbevelingen</div>';
  suggestions.slice(0, 5).forEach((s, idx) => {
    const isTop = idx === 0;
    html += `<div class="meal-preset-card" onclick="quickLogCombo('${s.id || 'combo'}','${(s.food||'').replace(/'/g,'')}',${s.kcal},${s.protein||0},${s.carbs||0},${s.fat||0})" style="${isTop ? 'border-left:3px solid var(--green-bright);' : ''}margin-bottom:6px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:20px">${isTop ? '🥇' : '  '}</span>
        <div style="flex:1">
          <div style="font-weight:700;font-size:13px">${s.food}</div>
          <div style="font-size:11px;color:var(--steel)">${s.protein||0}g eiwit · ${s.carbs||0}g koolh · ${s.fat||0}g vet</div>
        </div>
        <div style="text-align:right;min-width:50px">
          <div style="font-family:var(--font-mono);font-size:16px;color:var(--amber)">${s.kcal}</div>
          <div style="font-size:9px;color:var(--steel)">kcal</div>
        </div>
      </div>
    </div>`;
  });

  html += '<button class="btn btn-green mt-8" style="width:100%" onclick="confirmSuggestLog()">✅ Geselecteerde optie loggen</button>';
  c.innerHTML = html;
  state._selectedSuggest = null;
}

// Directe log van een FOODS-product
async function quickLogFood(foodId, qty) {
  const food = FOODS.find(f => f.id === foodId);
  if (!food) return;
  const kcal = Math.round(food.kcal * qty);
  const protein = Math.round(food.protein * qty);
  const carbs = Math.round(food.carbs * qty);
  const fat = Math.round(food.fat * qty);
  const desc = `${food.emoji} ${food.name} (${qty}× ${food.unit})`;
  await saveMealEntry(state.currentMealIndex, desc, kcal, protein, carbs, fat);
}

// Directe log van een combo suggestie
async function quickLogCombo(id, food, kcal, protein, carbs, fat) {
  // Markeer als geselecteerd en log meteen
  document.querySelectorAll('.meal-preset-card').forEach(el => {
    el.style.borderColor = 'var(--border)';
    el.style.background = 'var(--card)';
  });
  // Slight feedback
  vibrate(15);
  await saveMealEntry(state.currentMealIndex, food, kcal, protein, carbs, fat);
}

function mealTab(tab){
  ['suggest','preset','menu','custom','saved'].forEach(t=>{const el=document.getElementById('meal-tab-'+t);if(el)el.style.display=t===tab?'block':'none';});
  document.querySelectorAll('.meal-tab-btn').forEach(b=>b.classList.remove('active-tab'));
  document.getElementById('meal-tabBtn-'+tab)?.classList.add('active-tab');
}

let selectedPresetId=null;
function renderPresetMenus(){
  const c=document.getElementById('meal-tab-preset');if(!c)return;
  let html='<div style="font-size:12px;color:var(--steel);margin-bottom:10px;text-transform:uppercase;letter-spacing:1px;">Kies een compleet menu</div>';
  PRESET_MENUS.forEach(menu=>{
    html+=`<div class="meal-preset-card" onclick="selectPreset('${menu.id}')" id="preset-${menu.id}">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:22px">${menu.emoji}</span>
        <div style="flex:1"><div style="font-weight:700;font-size:14px">${menu.name}</div><div style="font-size:11px;color:var(--steel)">${menu.items}</div></div>
        <div style="text-align:right;min-width:55px"><div style="font-family:var(--font-mono);font-size:16px;color:var(--amber)">${menu.kcal}</div><div style="font-size:9px;color:var(--steel)">kcal</div></div>
      </div>
      <div style="font-size:11px;color:var(--steel);margin-top:4px">${menu.protein}g eiwit · ${menu.carbs}g koolh · ${menu.fat}g vet</div>
    </div>`;
  });
  c.innerHTML=html+'<button class="btn btn-green mt-8" onclick="markMealDonePreset()">✅ Dit heb ik gegeten!</button>';
}
function selectPreset(id){
  selectedPresetId=id;
  document.querySelectorAll('.meal-preset-card').forEach(el=>{el.style.borderColor='var(--border)';el.style.background='var(--card)';});
  const el=document.getElementById('preset-'+id);
  if(el){el.style.borderColor='var(--amber)';el.style.background='rgba(230,126,34,0.12)';}
  vibrate(15);
}
async function markMealDonePreset(){
  if(!selectedPresetId){toast('Selecteer eerst een menu!','error');return;}
  const menu=PRESET_MENUS.find(m=>m.id===selectedPresetId);if(!menu)return;
  await saveMealEntry(state.currentMealIndex,menu.name,menu.kcal,menu.protein,menu.carbs,menu.fat);
  selectedPresetId=null;
}

// ── MENU BUILDER ──────────────────────────────────────────────
function populateMenuProductSelect(){
  const sel=document.getElementById('menu-product-select');if(!sel)return;
  const prefs=state.foodPreferences.length>0?FOODS.filter(f=>state.foodPreferences.includes(f.id)):FOODS;
  sel.innerHTML=prefs.map(f=>`<option value="${f.id}">${f.emoji} ${f.name} (per ${f.unit})</option>`).join('');
}
function addMenuProduct(){
  const selEl=document.getElementById('menu-product-select');
  const qtyEl=document.getElementById('menu-qty');
  const food=FOODS.find(f=>f.id===selEl?.value);
  const qty=parseFloat(qtyEl?.value)||1;
  if(!food)return;
  state.menuItems.push({...food,qty});
  if(qtyEl)qtyEl.value='';
  renderMenuItems();vibrate(15);
}
function renderMenuItems(){
  const c=document.getElementById('menu-items-list'),tot=document.getElementById('menu-total-bar');
  if(!c)return;
  if(!state.menuItems.length){c.innerHTML='<div style="color:var(--steel);font-size:13px;padding:8px 0">Nog niets toegevoegd</div>';if(tot)tot.textContent='';return;}
  let totK=0,totP=0,totC=0,totF=0,html='';
  state.menuItems.forEach((item,idx)=>{
    const k=Math.round(item.kcal*item.qty);totK+=k;totP+=item.protein*item.qty;totC+=item.carbs*item.qty;totF+=item.fat*item.qty;
    html+=`<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
      <span style="font-size:18px">${item.emoji}</span>
      <div style="flex:1;font-size:13px"><strong>${item.qty}× ${item.name}</strong> <span style="color:var(--steel)">${k} kcal</span></div>
      <button onclick="removeMenuItem(${idx})" style="background:none;border:none;color:var(--red-hot);font-size:18px;cursor:pointer;padding:4px">✕</button>
    </div>`;
  });
  c.innerHTML=html;
  if(tot)tot.textContent=`Totaal: ${Math.round(totK)} kcal · ${Math.round(totP)}g P · ${Math.round(totC)}g K · ${Math.round(totF)}g V`;
}
function removeMenuItem(idx){state.menuItems.splice(idx,1);renderMenuItems();}
async function markMealDoneMenu(){
  if(!state.menuItems.length){toast('Voeg eerst producten toe!','error');return;}
  const totK=Math.round(state.menuItems.reduce((s,x)=>s+x.kcal*x.qty,0));
  const totP=Math.round(state.menuItems.reduce((s,x)=>s+x.protein*x.qty,0));
  const totC=Math.round(state.menuItems.reduce((s,x)=>s+x.carbs*x.qty,0));
  const totF=Math.round(state.menuItems.reduce((s,x)=>s+x.fat*x.qty,0));
  const desc=state.menuItems.map(x=>`${x.qty}× ${x.name}`).join(', ');
  await saveMealEntry(state.currentMealIndex,desc,totK,totP,totC,totF);state.menuItems=[];
}
async function saveCurrentMenu(){
  if(!state.menuItems.length){toast('Bouw eerst een menu!','error');return;}
  const nameEl=document.getElementById('save-menu-name');
  const name=nameEl?.value.trim()||'Menu '+new Date().toLocaleDateString('nl-NL');
  const totK=Math.round(state.menuItems.reduce((s,x)=>s+x.kcal*x.qty,0));
  const totP=Math.round(state.menuItems.reduce((s,x)=>s+x.protein*x.qty,0));
  const totC=Math.round(state.menuItems.reduce((s,x)=>s+x.carbs*x.qty,0));
  const totF=Math.round(state.menuItems.reduce((s,x)=>s+x.fat*x.qty,0));
  const desc=state.menuItems.map(x=>`${x.qty}× ${x.name}`).join(', ');
  await db.savedMeals.add({name,desc,kcal:totK,protein:totP,carbs:totC,fat:totF,date:new Date().toISOString()});
  state.savedMeals=await db.savedMeals.toArray();
  if(nameEl)nameEl.value='';
  toast('Menu opgeslagen: '+name,'success');renderSavedMeals();vibrate([30,20,30]);
}
function renderSavedMeals(){
  const c=document.getElementById('meal-tab-saved');if(!c)return;
  if(!state.savedMeals.length){c.innerHTML='<div style="color:var(--steel);font-size:14px;padding:16px 0">Nog geen opgeslagen maaltijden</div>';return;}
  let html='';
  [...state.savedMeals].reverse().forEach(meal=>{
    html+=`<div class="meal-preset-card" onclick="useSavedMeal(${meal.id})">
      <div style="display:flex;align-items:center;gap:10px;justify-content:space-between">
        <div style="flex:1"><div style="font-weight:700;font-size:14px">🍽️ ${meal.name}</div><div style="font-size:11px;color:var(--steel)">${meal.desc}</div></div>
        <div style="text-align:right;min-width:55px"><div style="font-family:var(--font-mono);font-size:16px;color:var(--amber)">${meal.kcal}</div><div style="font-size:9px;color:var(--steel)">kcal</div></div>
        <button onclick="event.stopPropagation();deleteSavedMeal(${meal.id})" style="background:none;border:none;color:var(--red-hot);font-size:18px;cursor:pointer;padding:4px">🗑️</button>
      </div>
      <div style="font-size:11px;color:var(--steel);margin-top:4px">${meal.protein}g eiwit · ${meal.carbs}g koolh · ${meal.fat}g vet</div>
    </div>`;
  });
  c.innerHTML=html;
}
async function useSavedMeal(id){const meal=state.savedMeals.find(m=>m.id===id);if(!meal)return;await saveMealEntry(state.currentMealIndex,meal.name,meal.kcal,meal.protein,meal.carbs,meal.fat);}
async function deleteSavedMeal(id){await db.savedMeals.delete(id);state.savedMeals=await db.savedMeals.toArray();renderSavedMeals();toast('Verwijderd');}

// ── VRIJE INVOER ──────────────────────────────────────────────
async function markMealDoneCustom(){
  const desc=document.getElementById('custom-meal-desc').value.trim();
  const kcal=parseInt(document.getElementById('custom-meal-kcal').value)||0;
  const prot=parseFloat(document.getElementById('custom-meal-protein').value)||0;
  const carb=parseFloat(document.getElementById('custom-meal-carbs').value)||0;
  const fat =parseFloat(document.getElementById('custom-meal-fat').value)||0;
  if(!desc){toast('Vul een omschrijving in!','error');return;}
  if(!kcal){toast('Vul de calorieën in! (verplicht)','error');return;}

  // ── PERSISTENT opslaan in Mijn Producten als aangevinkt ──────
  const saveAsProduct = document.getElementById('custom-save-as-product')?.checked;
  if (saveAsProduct && desc) {
    const newFood = {
      name: desc,
      emoji: '🍽️',
      kcal: kcal,
      protein: Math.round(prot || 0),
      carbs: Math.round(carb || 0),
      fat: Math.round(fat || 0),
      unit: 'port',
      savedAt: new Date().toISOString(),
    };
    const savedId = await db.customFoods.add(newFood);
    state.customFoods = await db.customFoods.toArray();
    FOODS = [...FOODS_BUILTIN, ...state.customFoods.map(f => ({...f, id:'custom_'+f.id}))];
    // Voeg toe aan voorkeuren
    const customFoodId = 'custom_' + savedId;
    if (!state.foodPreferences.includes(customFoodId)) {
      state.foodPreferences.push(customFoodId);
      await db.settings.put({key:'foodPreferences', value:state.foodPreferences});
    }
    renderFoodMatrix('food-matrix-main', false);
    populateMenuProductSelect();
    await refreshFoodCache();
    toast('✅ Product opgeslagen in Mijn Producten!', 'success');
  }

  await saveMealEntry(state.currentMealIndex,desc,kcal,prot,carb,fat);
  ['custom-meal-desc','custom-meal-kcal','custom-meal-protein','custom-meal-carbs','custom-meal-fat'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const cb = document.getElementById('custom-save-as-product');
  if (cb) cb.checked = false;
}

async function saveMealEntry(mealIndex,food,kcal,protein,carbs,fat){
  const now=new Date();
  await db.foodLog.add({date:now.toISOString().split('T')[0],logTime:now.toISOString(),mealIndex,time:state.mealSchedule[mealIndex],food,kcal,protein:Math.round(protein||0),carbs:Math.round(carbs||0),fat:Math.round(fat||0)});

  // Zelflerend: bijhouden welke producten/maaltijden je kiest
  if (food) {
    const foodKey = food.trim().toLowerCase().substring(0,40);
    if (!state.foodFrequency) state.foodFrequency = {};
    state.foodFrequency[foodKey] = (state.foodFrequency[foodKey] || 0) + 1;
    // Ook FOODS-id tracken als het een bekend product is
    const matchedFood = FOODS.find(f => food.includes(f.name));
    if (matchedFood) state.foodFrequency[matchedFood.id] = (state.foodFrequency[matchedFood.id]||0) + 1;
    await db.settings.put({key:'foodFrequency', value:state.foodFrequency});
  }

  // Ververs de daglog cache zodat het volgende advies meteen klopt
  await refreshFoodCache();

  closeModal('meal-modal');selectedPresetId=null;
  toast('✅ Opgeslagen!','success');vibrate([50,20,50]);
  showScreen('dashboard');
}

async function getTodayFoodLog(){return db.foodLog.where('date').equals(new Date().toISOString().split('T')[0]).toArray();}
async function updateFoodTotals(){
  const log=await getTodayFoodLog();
  const t=log.reduce((a,e)=>({kcal:a.kcal+(e.kcal||0),protein:a.protein+(e.protein||0),carbs:a.carbs+(e.carbs||0),fat:a.fat+(e.fat||0)}),{kcal:0,protein:0,carbs:0,fat:0});
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('food-total-kcal',Math.round(t.kcal));set('macro-protein',Math.round(t.protein)+'g');
  set('macro-carbs',Math.round(t.carbs)+'g');set('macro-fat',Math.round(t.fat)+'g');set('macro-kcal',Math.round(t.kcal));
}

// ── FOOD MATRIX + EIGEN PRODUCTEN ────────────────────────────
function renderFoodMatrix(containerId,setupMode){
  const c=document.getElementById(containerId);if(!c)return;
  let html='';
  FOODS.forEach(food=>{
    const sel=setupMode?state.foodPreferences.length===0||state.foodPreferences.includes(food.id):state.foodPreferences.includes(food.id);
    const isCustom=food.id.startsWith('custom_');
    html+=`<div class="food-item ${sel?'selected':''}" data-id="${food.id}" onclick="toggleFood(this,'${containerId}')">
      <div class="food-emoji">${food.emoji}</div>
      <div class="food-info"><div class="food-name">${food.name}${isCustom?' ⭐':''}</div><div class="food-macro">${food.kcal} kcal/${food.unit}</div></div>
      <div class="food-cb">${sel?'✓':''}</div>
    </div>`;
  });
  // Voeg eigen product knop toe
  if(containerId==='food-matrix-main'){
    html+=`<div class="food-item" onclick="showAddFoodModal()" style="border-style:dashed;opacity:0.8;">
      <div class="food-emoji">➕</div>
      <div class="food-info"><div class="food-name">Eigen product toevoegen</div><div class="food-macro">Permanent opslaan</div></div>
      <div class="food-cb"></div>
    </div>`;
  }
  c.innerHTML=html;
}
async function toggleFood(el,containerId){
  el.classList.toggle('selected');
  el.querySelector('.food-cb').textContent=el.classList.contains('selected')?'✓':'';
  if(containerId==='food-matrix-main'){
    state.foodPreferences=[...document.querySelectorAll('#food-matrix-main .food-item.selected')].map(e=>e.dataset.id);
    await db.settings.put({key:'foodPreferences',value:state.foodPreferences});
    populateMenuProductSelect();
  }
  vibrate(15);
}

// ── EIGEN PRODUCT TOEVOEGEN (permanent) ──────────────────────
function showAddFoodModal(){document.getElementById('add-food-modal').classList.add('active');}
async function saveCustomFood(){
  const name  =document.getElementById('new-food-name').value.trim();
  const emoji =document.getElementById('new-food-emoji').value.trim()||'🍽️';
  const unit  =document.getElementById('new-food-unit').value.trim()||'100g';
  const kcal  =parseFloat(document.getElementById('new-food-kcal').value)||0;
  const prot  =parseFloat(document.getElementById('new-food-protein').value)||0;
  const carbs =parseFloat(document.getElementById('new-food-carbs').value)||0;
  const fat   =parseFloat(document.getElementById('new-food-fat').value)||0;
  if(!name||!kcal){toast('Naam en calorieën zijn verplicht!','error');return;}
  const id=await db.customFoods.add({name,emoji,unit,kcal,protein:prot,carbs,fat});
  state.customFoods=await db.customFoods.toArray();
  FOODS=[...FOODS_BUILTIN,...state.customFoods.map(f=>({...f,id:'custom_'+f.id}))];
  // Auto-select het nieuwe product
  state.foodPreferences.push('custom_'+id);
  await db.settings.put({key:'foodPreferences',value:state.foodPreferences});
  closeModal('add-food-modal');
  renderFoodMatrix('food-matrix-main',false);
  populateMenuProductSelect();
  toast(`${emoji} ${name} permanent opgeslagen!`,'success');
  ['new-food-name','new-food-emoji','new-food-unit','new-food-kcal','new-food-protein','new-food-carbs','new-food-fat'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
}

// ══════════════════════════════════════════════════════════
//  GYM TRAINING
// ══════════════════════════════════════════════════════════
function renderGymButtons(){
  const c=document.getElementById('gym-buttons-grid');if(!c)return;
  let html='';
  [...GYM_ACTIVITIES,...state.customSports].forEach(act=>{
    const isCustom=!GYM_ACTIVITIES.find(a=>a.id===act.id);
    const onclick=isCustom?`startCustomActivity(${act.id})`:`startGymActivity('${act.id}')`;
    html+=`<div class="gym-btn" id="gym-btn-${act.id}" onclick="${onclick}">
      <div class="gym-icon">${act.emoji||'🏅'}</div><div>${act.name}</div><div class="gym-met">MET ${act.met}</div>
    </div>`;
  });
  html+=`<div class="gym-btn" onclick="showAddSportModal()" style="border-style:dashed;opacity:0.7;"><div class="gym-icon">➕</div><div>Eigen Sport</div><div class="gym-met">Toevoegen</div></div>`;
  c.innerHTML=html;
}
function startGymActivity(id){const act=GYM_ACTIVITIES.find(a=>a.id===id);if(act)startActivity(act);}
function startCustomActivity(id){const act=state.customSports.find(a=>a.id===id);if(act)startActivity(act);}
function startActivity(act){
  if(state.activeTraining){toast('Stop eerst huidige activiteit!','error');return;}
  state.activeTraining={id:act.id,name:act.name,met:act.met,startTime:Date.now(),type:'gym',startTimeStr:new Date().toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'})};
  state.timerPaused=false;state.timerPausedTotal=0;
  document.getElementById('timer-activity-name').textContent=(act.emoji||'🏋️')+' '+act.name.toUpperCase();
  document.getElementById('training-timer-panel').style.display='block';
  document.querySelectorAll('.gym-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('gym-btn-'+act.id)?.classList.add('active');
  vibrate([30,10,30]);
  speak(`${act.name} gestart! Kom op soldaat!`);
}
function updateGymTimer(){
  if(!state.activeTraining)return;
  const elapsed=(Date.now()-state.activeTraining.startTime-(state.timerPausedTotal||0))/1000;
  const el=document.getElementById('timer-display');if(el)el.textContent=formatSeconds(elapsed);
  const kcal=Math.round(state.activeTraining.met*(state.profile?.weight||115)*(elapsed/3600)*1.05);
  const kEl=document.getElementById('timer-kcal-display');if(kEl)kEl.textContent=kcal+' kcal';
}
function toggleTimerPause(){
  if(!state.activeTraining)return;
  const btn=document.getElementById('timer-pause-btn');
  if(state.timerPaused){state.timerPausedTotal=(state.timerPausedTotal||0)+(Date.now()-state.timerPauseStart);state.timerPaused=false;btn.textContent='⏸ Pauze';toast('Hervat!');}
  else{state.timerPauseStart=Date.now();state.timerPaused=true;btn.textContent='▶ Hervat';toast('Gepauzeerd');}
  vibrate(20);
}
async function stopTraining(){
  if(!state.activeTraining)return;
  const elapsed=(Date.now()-state.activeTraining.startTime-(state.timerPausedTotal||0))/1000;
  const kcal=Math.round(state.activeTraining.met*(state.profile?.weight||115)*(elapsed/3600)*1.05);
  await db.trainings.add({date:new Date().toISOString(),time:state.activeTraining.startTimeStr||new Date().toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'}),type:state.activeTraining.type||'gym',name:state.activeTraining.name,duration:Math.round(elapsed),kcal,met:state.activeTraining.met,distance:state.activeTraining.distance||null});
  toast(`✅ ${state.activeTraining.name}: ${formatSeconds(elapsed)} · ${kcal} kcal!`,'success');
  if(state.settings.sound)speak(`Sessie complete. ${kcal} calorieën verbrand. Sterk!`);
  vibrate([50,30,50,30,50]);
  state.activeTraining=null;state.timerPaused=false;state.timerPausedTotal=0;
  document.getElementById('training-timer-panel').style.display='none';
  document.querySelectorAll('.gym-btn,.gps-activity-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('gps-stop-btn').style.display='none';
  renderRecentTrainings();updateDashboard();updateMovementBar();renderNextSportMoment();
}

async function renderRecentTrainings(){
  const c=document.getElementById('recent-trainings');if(!c)return;
  const trainings=await db.trainings.orderBy('date').reverse().limit(8).toArray();
  if(!trainings.length){c.innerHTML='<div style="color:var(--steel);font-size:14px;">Nog geen trainingen gelogd</div>';return;}
  c.innerHTML=trainings.map(t=>{
    const distStr=t.distance?` · ${t.distance.toFixed(2)} km`:'';
    const timeStr=t.time?` · ${t.time}`:'';
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
      <div><div style="font-weight:700;font-size:14px">${t.name}</div>
      <div style="font-size:11px;color:var(--steel);font-family:var(--font-mono)">${new Date(t.date).toLocaleDateString('nl-NL')}${timeStr} · ${formatSeconds(t.duration)}${distStr}</div></div>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="font-family:var(--font-mono);color:var(--amber);font-size:16px">${t.kcal} kcal</div>
        <button onclick="deleteTrainingFromList(${t.id})" style="background:none;border:none;color:var(--red-hot);font-size:16px;cursor:pointer;padding:4px">🗑️</button>
      </div>
    </div>`;
  }).join('');
}
async function deleteTrainingFromList(id){await db.trainings.delete(id);toast('Training verwijderd','success');renderRecentTrainings();updateDashboard();updateMovementBar();}
async function getTodayCaloriesBurned(){return(await db.trainings.where('date').startsWith(new Date().toISOString().split('T')[0]).toArray()).reduce((s,t)=>s+(t.kcal||0),0);}

function showAddSportModal(){document.getElementById('add-sport-modal').classList.add('active');}
async function saveCustomSport(){
  const name=document.getElementById('new-sport-name').value.trim();
  const emoji=document.getElementById('new-sport-emoji').value.trim()||'🏅';
  const met=parseFloat(document.getElementById('new-sport-met').value)||5.0;
  if(!name){toast('Geef de sport een naam!','error');return;}
  await db.customSports.add({name,emoji,met});state.customSports=await db.customSports.toArray();
  closeModal('add-sport-modal');renderGymButtons();toast(`${emoji} ${name} toegevoegd!`,'success');
  ['new-sport-name','new-sport-emoji','new-sport-met'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
}

// ── GPS TRACKING ──────────────────────────────────────────────
function renderGPSButtons(){
  const c=document.getElementById('gps-activity-buttons');if(!c)return;
  let html='';
  GPS_ACTIVITIES.forEach(act=>{
    const kcalPer30 = act.kcalPer30min || Math.round(act.met*(state.profile?.weight||115)*0.5*1.05);
    html+=`<div class="gps-activity-btn" id="gps-act-${act.id}" onclick="startGPS('${act.id}')">
      <span style="font-size:22px">${act.emoji}</span>
      <div style="font-size:12px;font-weight:700">${act.name}</div>
      <div style="font-size:10px;color:var(--steel)">~${kcalPer30} kcal/30min</div>
    </div>`;
  });
  c.innerHTML=html;
}
function startGPS(activityId){
  if(!navigator.geolocation){toast('GPS niet beschikbaar','error');return;}
  if(state.activeTraining){toast('Stop eerst huidige activiteit!','error');return;}
  const act=GPS_ACTIVITIES.find(a=>a.id===activityId);if(!act)return;
  state.gpsActive=true;state.gpsActivityId=activityId;state.gpsPositions=[];state.gpsDistance=0;state.gpsLastPos=null;state.gpsStartTime=Date.now();
  const startTimeStr=new Date().toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'});
  document.querySelectorAll('.gps-activity-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('gps-act-'+activityId)?.classList.add('active');
  document.getElementById('gps-stop-btn').style.display='block';
  document.getElementById('gps-status').textContent='Verbinden...';
  document.getElementById('gps-mode-label').textContent=act.emoji+' '+act.name+' — actief';
  state.activeTraining={id:'gps-'+activityId,name:act.emoji+' '+act.name,met:act.met,startTime:Date.now(),type:'gps',startTimeStr};
  state.timerPaused=false;state.timerPausedTotal=0;
  document.getElementById('timer-activity-name').textContent=act.emoji+' '+act.name.toUpperCase();
  document.getElementById('training-timer-panel').style.display='block';
  state.gpsWatchId=navigator.geolocation.watchPosition(onGPSPos,onGPSErr,{enableHighAccuracy:true,timeout:15000,maximumAge:3000});
  toast(`${act.emoji} ${act.name} gestart!`,'success');vibrate([30,10,30]);
  if(state.settings.sound)speak(`${act.name} tracking gestart. Kom op soldaat!`);
}
function onGPSPos(pos){
  const{latitude:lat,longitude:lng,speed,accuracy}=pos.coords;
  document.getElementById('gps-status').textContent=`acc: ${Math.round(accuracy)}m`;
  if(state.gpsLastPos&&accuracy<60){const d=haversine(state.gpsLastPos.lat,state.gpsLastPos.lng,lat,lng);if(d>0.003)state.gpsDistance+=d;}
  state.gpsLastPos={lat,lng};state.gpsPositions.push({lat,lng,t:Date.now()});
  const kmh=speed?speed*3.6:computeSpeed();
  document.getElementById('gps-distance').textContent=state.gpsDistance.toFixed(2);
  document.getElementById('gps-speed').textContent=kmh.toFixed(1);
  const elapsed=(Date.now()-state.gpsStartTime)/3600000;
  const met=state.activeTraining?.met||3.5;
  document.getElementById('gps-kcal').textContent=Math.round(met*(state.profile?.weight||115)*elapsed*1.05);
  if(state.activeTraining)state.activeTraining.distance=state.gpsDistance;
}
function onGPSErr(err){document.getElementById('gps-status').textContent='Fout: '+err.message;toast('GPS fout — check permissie','error');}
function computeSpeed(){const p=state.gpsPositions;if(p.length<2)return 0;const a=p[p.length-2],b=p[p.length-1];const d=haversine(a.lat,a.lng,b.lat,b.lng);const t=(b.t-a.t)/3600000;return t>0?d/t:0;}
function haversine(lat1,lon1,lat2,lon2){const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180;const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
async function stopGPS(){
  if(state.gpsWatchId!==null){navigator.geolocation.clearWatch(state.gpsWatchId);state.gpsWatchId=null;}
  state.gpsActive=false;
  document.getElementById('gps-stop-btn').style.display='none';
  document.querySelectorAll('.gps-activity-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('gps-mode-label').textContent='Kies een activiteit';
  document.getElementById('gps-status').textContent='';
  if(state.gpsPositions.length>0)await db.gpsRoutes.add({date:new Date().toISOString(),mode:state.gpsActivityId,positions:state.gpsPositions,distance:state.gpsDistance});
  await stopTraining();
  state.gpsDistance=0;state.gpsPositions=[];
  ['gps-distance','gps-speed','gps-kcal'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent='0.0';});
}

// ══════════════════════════════════════════════════════════
//  INSTELLINGEN
// ══════════════════════════════════════════════════════════
function renderSettings(){
  const c=document.getElementById('settings-content');if(!c)return;
  const p=state.profile||{};
  c.innerHTML=`
    <div class="card card-steel">
      <div class="card-title">👤 Profiel</div>
      <div class="input-group"><label class="input-label">Naam</label><input type="text" class="input-field" id="sett-name" value="${p.name||'Soldaat'}"></div>
      <div class="input-group"><label class="input-label">Gewicht (kg)</label><input type="number" class="input-field" id="sett-weight" value="${p.weight||115}" inputmode="decimal" step="0.1"></div>
      <div class="input-group"><label class="input-label">Lengte (cm)</label><input type="number" class="input-field" id="sett-height" value="${p.height||178}" inputmode="numeric"></div>
      <div class="input-group"><label class="input-label">Leeftijd</label><input type="number" class="input-field" id="sett-age" value="${p.age||48}" inputmode="numeric"></div>
      <button class="btn btn-green btn-sm" onclick="saveProfileSettings()">✅ Profiel Opslaan</button>
    </div>
    <div class="card card-steel">
      <div class="card-title">🍳 Eetschema</div>
      <div class="input-group"><label class="input-label">Ontbijttijd</label><input type="time" class="input-field" id="sett-breakfast" value="${p.breakfastTime||'07:00'}"></div>
      <div class="input-group"><label class="input-label">Sigaretten per dag</label><input type="number" class="input-field" id="sett-cigs" value="${p.cigsPerDay||20}" inputmode="numeric"></div>
      <div class="input-group"><label class="input-label">Prijs per pakje (€)</label><input type="number" class="input-field" id="sett-cigprice" value="${p.cigPackPrice||9.50}" inputmode="decimal" step="0.10"></div>
      <button class="btn btn-amber btn-sm" onclick="saveMealSettings()">✅ Schema Opslaan</button>
    </div>
    <div class="card card-steel">
      <div class="card-title">🔔 Notificaties & Geluid</div>
      ${renderToggle('notifications','Eetmoment notificaties','Herinneringen voor maaltijden')}
      ${renderToggle('gymReminderEnabled','💪 Sportschool reminder','Dagelijks om 06:15 — voor 07:00 trainen')}
      ${renderToggle('sound','Sergeant geluid','Spraakberichten aan/uit')}
      ${renderToggle('backgroundSync','Achtergrond actief','Rookvrij-teller blijft lopen')}
    </div>
    <div class="card card-steel">
      <div class="card-title">🎯 Beweegdoel</div>
      <div style="font-size:14px;color:var(--steel-light);margin-bottom:8px">Dagdoel: <strong>${DAILY_MOVE_GOAL_MIN} minuten</strong> actief bewegen per dag</div>
      <div style="font-size:12px;color:var(--steel);margin-bottom:12px">De app berekent automatisch jouw volgende sportmoment om dit doel te halen.</div>
      <div style="font-size:13px;color:var(--steel-light);font-weight:700;margin-bottom:6px">Jouw sport regels:</div>
      <div style="font-size:12px;color:var(--steel);margin-bottom:4px">• Sportschool: alleen vóór 07:00</div>
      <div style="font-size:12px;color:var(--steel);margin-bottom:4px">• Wandelen: rustig of stevig</div>
      <div style="font-size:12px;color:var(--steel);margin-bottom:4px">• E-bike: eco, tour, sport of turbo</div>
      <div style="font-size:12px;color:var(--steel)">• Geen hardlopen</div>
    </div>
    <div class="card card-red">
      <div class="card-title">⚠️ Data Beheer</div>
      <div style="font-size:13px;color:var(--steel);margin-bottom:10px">Wis je testdata voordat je de app echt gaat gebruiken.</div>
      <button class="btn btn-red btn-sm" onclick="confirmFullReset()" style="margin-bottom:8px">🗑️ Alles Wissen (testfase)</button>
      <button class="btn btn-ghost btn-sm" onclick="exportText()">📋 Exporteer data eerst</button>
    </div>
    <div style="height:16px"></div>`;
}
function renderToggle(key,title,desc){
  return `<div class="flex-between" style="padding:12px 0;border-bottom:1px solid var(--border)">
    <div><div style="font-weight:700;font-size:14px">${title}</div><div style="font-size:12px;color:var(--steel)">${desc}</div></div>
    <div class="toggle-switch ${state.settings[key]?'on':''}" onclick="toggleSetting('${key}')"><div class="toggle-knob"></div></div>
  </div>`;
}
async function saveProfileSettings(){
  if(!state.profile)state.profile={};
  state.profile.name  =document.getElementById('sett-name').value.trim()||'Soldaat';
  state.profile.weight=parseFloat(document.getElementById('sett-weight').value)||115;
  state.profile.height=parseInt(document.getElementById('sett-height').value)||178;
  state.profile.age   =parseInt(document.getElementById('sett-age').value)||48;
  await db.settings.put({key:'profile',value:state.profile});
  toast('Profiel opgeslagen!','success');updateDashboard();
}
async function saveMealSettings(){
  if(!state.profile)state.profile={};
  state.profile.breakfastTime=document.getElementById('sett-breakfast').value||'07:00';
  state.profile.cigsPerDay=parseInt(document.getElementById('sett-cigs').value)||20;
  state.profile.cigPackPrice=parseFloat(document.getElementById('sett-cigprice').value)||9.50;
  state.mealSchedule=computeMealSchedule(state.profile.breakfastTime);
  await db.settings.put({key:'profile',value:state.profile});
  await db.settings.put({key:'mealSchedule',value:state.mealSchedule});
  toast('Schema opgeslagen!','success');renderMealSlots();
}
async function toggleSetting(key){
  state.settings[key]=!state.settings[key];
  await db.settings.put({key:'appSettings',value:state.settings});
  if(key==='backgroundSync'){
    if(!state.settings.backgroundSync){if(state.smokeInterval){clearInterval(state.smokeInterval);state.smokeInterval=null;}}
    else startSmokeInterval();
  }
  renderSettings();toast(state.settings[key]?'Ingeschakeld ✅':'Uitgeschakeld');
}
function confirmFullReset(){
  if(confirm('⚠️ ALLES WISSEN?\n\nDit verwijdert:\n• Alle gewichtsmetingen\n• Alle trainingen\n• Alle eetlogs\n• Opgeslagen menu\'s\n• GPS routes\n\nJouw profiel en instellingen blijven bewaard.\n\nWeet je het zeker?')) fullReset();
}
async function fullReset(){
  await Promise.all([
    db.weights.clear(),
    db.trainings.clear(),
    db.foodLog.clear(),
    db.gpsRoutes.clear(),
    db.savedMeals.clear(),
    db.customFoods.clear(),
    db.customSports.clear(),
    db.settings.clear(),
  ]);
  // Reset state volledig
  state.weightEntries = [];
  state.savedMeals = [];
  state.customFoods = [];
  state.customSports = [];
  state.foodPreferences = [];
  state.profile = null;
  FOODS = [...FOODS_BUILTIN];
  toast('✅ Alle data gewist — app herstart', 'success');
  setTimeout(() => window.location.reload(true), 1500);
}

// ══════════════════════════════════════════════════════════
//  SMOKING MODULE
// ══════════════════════════════════════════════════════════
async function setSmokingStop(){
  const val=document.getElementById('smoke-stop-input').value;
  if(!val){toast('Selecteer datum en tijd!','error');return;}
  const dt=new Date(val);if(isNaN(dt)){toast('Ongeldige datum!','error');return;}
  state.smokingStop=dt;await db.settings.put({key:'smokingStop',value:dt.toISOString()});
  toast('Stopmoment geregistreerd!','success');vibrate([50,30,50]);
  if(state.settings.sound)speak('Geregistreerd! Jij hebt de kracht!');
  updateSmokeScreen();startSmokeInterval();
}
function startSmokeInterval(){
  if(state.smokeInterval)clearInterval(state.smokeInterval);
  if(state.smokingStop&&state.settings.backgroundSync){state.smokeInterval=setInterval(updateSmokeLive,1000);updateSmokeLive();}
}
function updateSmokeScreen(){
  const has=!!state.smokingStop;
  document.getElementById('smoke-setup-card').style.display=has?'none':'block';
  document.getElementById('smoke-counter-section').style.display=has?'block':'none';
  if(has){document.getElementById('smoke-header-sub').textContent='Jij staat sterk!';updateSmokeLive();renderHealthMilestones();}
  else{const now=new Date();now.setMinutes(now.getMinutes()-now.getTimezoneOffset());const el=document.getElementById('smoke-stop-input');if(el)el.value=now.toISOString().slice(0,16);}
}
function updateSmokeLive(){
  if(!state.smokingStop)return;
  const diff=Date.now()-state.smokingStop.getTime();
  const total=Math.floor(diff/1000),days=Math.floor(total/86400),hours=Math.floor((total%86400)/3600),mins=Math.floor((total%3600)/60),secs=total%60;
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('smoke-time-display',`${String(days).padStart(2,'0')}:${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`);
  set('smoke-days-display',`${days} dagen, ${hours} uur, ${mins} minuten`);
  set('smoke-cigs-not',computeCigsNotSmoked(diff));
  set('smoke-money-saved','€'+computeMoneySaved(diff));
  const lm=computeCigsNotSmoked(diff)*11;
  set('smoke-life-gained',lm>=1440?Math.floor(lm/1440)+' dag':lm>=60?Math.floor(lm/60)+' uur':lm+' min');
  set('smoke-kcal-saved',Math.round(computeCigsNotSmoked(diff)*10));
  renderHealthMilestones();
}
function computeCigsNotSmoked(ms){return Math.floor((ms/3600000)*((state.profile?.cigsPerDay||20)/24));}
function computeMoneySaved(ms){return(computeCigsNotSmoked(ms)*(state.profile?.cigPackPrice||9.50)/20).toFixed(2);}
function renderHealthMilestones(){
  const c=document.getElementById('health-milestones');if(!c||!state.smokingStop)return;
  const diffMin=(Date.now()-state.smokingStop.getTime())/60000;
  c.innerHTML=HEALTH_MILESTONES.map((ms,i)=>{
    const done=diffMin>=ms.minutes,isNext=!done&&(i===0||diffMin>=HEALTH_MILESTONES[i-1]?.minutes);
    return `<div class="milestone ${done?'done':isNext?'next':''}"><div class="ms-dot"></div><div>
      <div class="ms-title">${ms.title}</div>
      <div class="ms-time">${done?'bereikt ✓':'over '+formatDuration((ms.minutes-diffMin)*60000)}</div>
      <div class="ms-desc">${ms.desc}</div>
    </div></div>`;
  }).join('');
}
function resetSmokeStop(){state.smokingStop=null;db.settings.delete('smokingStop');if(state.smokeInterval)clearInterval(state.smokeInterval);updateSmokeScreen();}

function activateSOS(){
  if(state.sosActive)return;state.sosActive=true;
  document.getElementById('sos-overlay').classList.add('active');
  document.getElementById('sos-btn').classList.add('pulsing');
  const cmd=SOS_COMMANDS[Math.floor(Math.random()*SOS_COMMANDS.length)];
  document.getElementById('sos-command-text').textContent=cmd.cmd;
  const diff=state.smokingStop?Date.now()-state.smokingStop.getTime():0;
  document.getElementById('sos-stats-text').innerHTML=`Al <strong>${formatDuration(diff)}</strong> rookvrij · <strong>${computeCigsNotSmoked(diff)}</strong> sigaretten niet gerookt · <strong>€${computeMoneySaved(diff)}</strong> bespaard<br><br>Jij bent sterker!`;
  if(state.settings.sound)setTimeout(()=>speak(cmd.speech),500);
  let rem=600;const timerEl=document.getElementById('sos-timer-display');
  state.sosInterval=setInterval(()=>{
    rem--;if(timerEl)timerEl.textContent=`${String(Math.floor(rem/60)).padStart(2,'0')}:${String(rem%60).padStart(2,'0')}`;
    if(rem===480&&state.settings.sound)speak('Goed bezig! Nog 8 minuten!');
    if(rem===300&&state.settings.sound)speak('Halverwege! De craving gaat voorbij!');
    if(rem<=0){clearInterval(state.sosInterval);if(state.settings.sound)speak('Bravo soldaat! Gewonnen!');vibrate([100,50,100,50,100]);setTimeout(closeSOS,2000);}
  },1000);
  vibrate([100,50,100]);
}
function closeSOS(){state.sosActive=false;clearInterval(state.sosInterval);document.getElementById('sos-overlay').classList.remove('active');document.getElementById('sos-btn').classList.remove('pulsing');window.speechSynthesis?.cancel();}

// ══════════════════════════════════════════════════════════
//  REPORTS
// ══════════════════════════════════════════════════════════
function showPeriod(period,el){
  state.activePeriod=period;
  document.querySelectorAll('.period-tab').forEach(t=>t.classList.remove('active'));
  if(el)el.classList.add('active');renderReport(period);
}
async function renderReport(period){
  const c=document.getElementById('report-content');if(!c)return;
  const now=new Date();let startDate=new Date();
  if(period==='dag')    startDate.setHours(0,0,0,0);
  else if(period==='week')  startDate.setDate(now.getDate()-7);
  else if(period==='maand') startDate.setDate(now.getDate()-30);
  else startDate=new Date(state.profile?.setupDate||now);
  const trainings=await db.trainings.where('date').aboveOrEqual(startDate.toISOString()).toArray();
  const foodLogs=await db.foodLog.where('date').aboveOrEqual(startDate.toISOString().split('T')[0]).toArray();
  const totBurned=trainings.reduce((s,t)=>s+(t.kcal||0),0);
  const totEaten=foodLogs.reduce((s,f)=>s+(f.kcal||0),0);
  const totDur=trainings.reduce((s,t)=>s+(t.duration||0),0);
  const startW=state.profile?.startWeight||115,currentW=state.weightEntries.length>0?state.weightEntries[state.weightEntries.length-1].weight:startW;
  const smokeDiff=state.smokingStop?Date.now()-state.smokingStop.getTime():0;
  const labels={dag:'Vandaag',week:'7 dagen',maand:'30 dagen',totaal:'Totaal'};
  c.innerHTML=`<div class="report-section">
    <h3>${labels[period]}</h3>
    <div class="stats-grid" style="margin:0 0 16px">
      <div class="stat-block amber"><div class="stat-value">${trainings.length}</div><div class="stat-label">Trainingen</div></div>
      <div class="stat-block green"><div class="stat-value">${totBurned}</div><div class="stat-label">kcal Verbrand</div></div>
      <div class="stat-block"><div class="stat-value">${formatSeconds(totDur)}</div><div class="stat-label">Bewogen</div></div>
      <div class="stat-block red"><div class="stat-value">${totEaten}</div><div class="stat-label">kcal Gegeten</div></div>
    </div>
    ${period==='totaal'?`<div class="card card-green" style="margin:0 0 12px"><div class="card-title">🏆 Resultaten</div>
      <div style="font-family:var(--font-mono);font-size:18px;color:var(--green-bright)">${(startW-currentW)>=0?'-':'+'}${Math.abs(startW-currentW).toFixed(1)} kg</div>
      <div style="font-size:14px;color:var(--steel)">Van ${startW} → ${currentW.toFixed(1)} kg</div></div>`:''}
    ${state.smokingStop?`<div class="card card-green" style="margin:0 0 12px"><div class="card-title">🚭 Rookvrij</div>
      <div style="font-family:var(--font-mono);font-size:20px;color:var(--green-bright)">${formatDuration(smokeDiff)}</div>
      <div style="font-size:14px;color:var(--steel);margin-top:6px">€${computeMoneySaved(smokeDiff)} bespaard · ${computeCigsNotSmoked(smokeDiff)} sigaretten</div></div>`:''}
    ${trainings.length?`<div class="card card-amber" style="margin:0"><div class="card-title">Trainingslog</div>
      ${trainings.slice(-10).reverse().map(t=>{const dist=t.distance?` · ${t.distance.toFixed(2)}km`:'',ttime=t.time?` · ${t.time}`:'';
        return`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
          <div><div style="font-weight:700;font-size:13px">${t.name}</div><div style="font-size:11px;color:var(--steel);font-family:var(--font-mono)">${new Date(t.date).toLocaleDateString('nl-NL')}${ttime} · ${formatSeconds(t.duration)}${dist}</div></div>
          <div style="font-family:var(--font-mono);color:var(--amber);font-size:14px">${t.kcal} kcal</div></div>`;
      }).join('')}</div>`:'<div style="color:var(--steel);font-size:14px;padding:16px">Geen trainingen</div>'}
  </div>`;
}

async function exportPDF(){
  const{jsPDF}=window.jspdf;if(!jsPDF){toast('PDF library niet geladen','error');return;}
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const smokeDiff=state.smokingStop?Date.now()-state.smokingStop.getTime():0;
  const startW=state.profile?.startWeight||115,currentW=state.weightEntries.length>0?state.weightEntries[state.weightEntries.length-1].weight:startW;
  const trainings=await db.trainings.toArray(),now=new Date();
  doc.setFont('helvetica','bold');doc.setFontSize(22);doc.setTextColor(192,57,43);doc.text('STEEL & SMOKE — RAPPORT',20,25);
  doc.setTextColor(100,100,100);doc.setFontSize(10);doc.setFont('helvetica','normal');
  doc.text(`${now.toLocaleDateString('nl-NL')} | ${state.profile?.name||'—'} | ${state.profile?.age||'—'}j | ${state.profile?.height||'—'}cm`,20,33);
  doc.line(20,38,190,38);let y=46;
  const L=(txt)=>{doc.text(txt,20,y);y+=7;};const H=(txt)=>{doc.setFont('h','bold');doc.setFontSize(12);doc.text(txt,20,y);y+=8;doc.setFont('h','normal');doc.setFontSize(10);};
  H('GEWICHT');L(`Start: ${startW}kg → Nu: ${currentW.toFixed(1)}kg → Verlies: ${(startW-currentW).toFixed(1)}kg`);y+=3;doc.line(20,y,190,y);y+=8;
  H('ROOKVRIJ');if(state.smokingStop){L(`Rookvrij: ${formatDuration(smokeDiff)}`);L(`Bespaard: €${computeMoneySaved(smokeDiff)} | Sigaretten: ${computeCigsNotSmoked(smokeDiff)}`);}else L('Niet ingesteld');y+=3;doc.line(20,y,190,y);y+=8;
  H('TRAINING');L(`Totaal: ${trainings.length} sessies | ${trainings.reduce((s,t)=>s+(t.kcal||0),0)} kcal verbrand`);y+=4;
  trainings.slice(-15).forEach(t=>{if(y>270)return;const d=t.distance?` | ${t.distance.toFixed(2)}km`:'';L(`${new Date(t.date).toLocaleDateString('nl-NL')} | ${t.name} | ${formatSeconds(t.duration)} | ${t.kcal}kcal${d}`);});
  doc.setFontSize(8);doc.setTextColor(150,150,150);doc.text('Steel & Smoke PWA — Voor medisch gebruik',20,285);
  doc.save(`steel-smoke-${now.toISOString().split('T')[0]}.pdf`);toast('PDF geëxporteerd!','success');
}
async function exportText(){
  const smokeDiff=state.smokingStop?Date.now()-state.smokingStop.getTime():0;
  const startW=state.profile?.startWeight||115,currentW=state.weightEntries.length>0?state.weightEntries[state.weightEntries.length-1].weight:startW;
  const trainings=await db.trainings.toArray();
  const text=`STEEL & SMOKE\n${new Date().toLocaleDateString('nl-NL')}\n\nGEWICHT: ${startW} → ${currentW.toFixed(1)} kg\nROOKVRIJ: ${state.smokingStop?formatDuration(smokeDiff)+' | €'+computeMoneySaved(smokeDiff):'Niet ingesteld'}\n\nTRAININGEN:\n${trainings.map(t=>`${new Date(t.date).toLocaleDateString('nl-NL')} | ${t.name} | ${formatSeconds(t.duration)} | ${t.kcal}kcal${t.distance?` | ${t.distance.toFixed(2)}km`:''}`).join('\n')}`;
  const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob([text],{type:'text/plain'})),download:`steel-smoke-${new Date().toISOString().split('T')[0]}.txt`});a.click();
  toast('Gedownload!','success');
}

// ── SPEECH ─────────────────────────────────────────────────────
function speak(text){
  if(!window.speechSynthesis||!state.settings.sound)return;
  window.speechSynthesis.cancel();
  const utt=new SpeechSynthesisUtterance(text);
  utt.lang='nl-NL';utt.rate=1.05;utt.pitch=0.85;utt.volume=1.0;
  const voices=window.speechSynthesis.getVoices();
  const voice=voices.find(v=>v.lang==='nl-NL')||voices.find(v=>v.lang.startsWith('nl'));
  if(voice)utt.voice=voice;
  window.speechSynthesis.speak(utt);
}

// ── NOTIFICATIES ──────────────────────────────────────────────
function requestNotificationPermission(){if('Notification'in window&&Notification.permission==='default')Notification.requestPermission();}
function scheduleAllNotifications(){
  setInterval(async()=>{
    if(Notification.permission!=='granted'||!state.settings.notifications)return;
    const now=new Date(),nowMin=now.getHours()*60+now.getMinutes();
    const names=['Ontbijt','Tussendoor','Lunch','Tussendoor','Avondeten','Snack'];
    // Eetmoment notificaties
    state.mealSchedule.forEach((time,i)=>{
      const[h,m]=time.split(':').map(Number);
      if(h*60+m===nowMin){
        const adv=getMealNutritionAdvice(i);
        new Notification(`🍽️ ${names[i]} tijd!`,{body:`Doel: ${adv.mealKcal} kcal · ${adv.mealProtein}g eiwit\n${adv.suggestion?.food||''}`,icon:'./icons/icon-192.png'});
      }
    });
    // Sport moment notificatie om 20:00 als doel niet gehaald
    const h=now.getHours(),m=now.getMinutes();
    if(h===20&&m===0){
      const today=now.toISOString().split('T')[0];
      const trainings=await db.trainings.where('date').startsWith(today).toArray();
      const totalMovedMin=Math.round(trainings.reduce((s,t)=>s+(t.duration||0),0)/60);
      const remaining=DAILY_MOVE_GOAL_MIN-totalMovedMin;
      if(remaining>5){
        new Notification('🏃 Steel & Smoke — Bewegen!',{
          body:`Nog ${remaining} min nodig voor je dagdoel. Ga nu stevig wandelen of een e-bike ritje maken!`,
          icon:'./icons/icon-192.png'
        });
        if(state.settings.sound)speak(`Soldaat! Nog ${remaining} minuten bewegen voor je dagdoel. Ga nu wandelen!`);
      }
    }
  },60000);
}

// ── UTILITIES ─────────────────────────────────────────────────
function computeBMR(){if(!state.profile)return 2000;return Math.round((10*(state.profile.weight||115)+6.25*(state.profile.height||178)-5*(state.profile.age||48)+5)*1.4);}
async function computeStreak(){
  const t=await db.trainings.orderBy('date').toArray();if(!t.length)return 0;
  const dates=[...new Set(t.map(tr=>tr.date.split('T')[0]))].sort().reverse();
  let streak=0,check=new Date();check.setHours(0,0,0,0);
  for(const d of dates){const diff=Math.round((check-new Date(d))/86400000);if(diff<=1){streak++;check=new Date(d);}else break;}
  return streak;
}
function formatSeconds(s){const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=Math.floor(s%60);return h>0?`${h}u ${m}m`:m>0?`${m}m ${sec}s`:`${sec}s`;}
function formatDuration(ms){const s=Math.floor(ms/1000),d=Math.floor(s/86400),h=Math.floor((s%86400)/3600),m=Math.floor((s%3600)/60);return d>0?`${d}d ${h}u ${m}m`:h>0?`${h}u ${m}m`:`${m}m`;}
function vibrate(p){try{navigator.vibrate?.(p);}catch(e){}}
function toast(msg,type=''){
  const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=msg;
  document.getElementById('toast-container').appendChild(el);setTimeout(()=>el.remove(),3000);
}
function closeModal(id){document.getElementById(id)?.classList.remove('active');}
function scheduleMidnightReset(){
  const now=new Date(),midnight=new Date(now);midnight.setHours(24,0,0,0);
  setTimeout(()=>{
    if(state.profile?.breakfastTime){state.mealSchedule=computeMealSchedule(state.profile.breakfastTime);db.settings.put({key:'mealSchedule',value:state.mealSchedule});renderMealSlots();}
    state.todayAdviceIndex=Math.floor(Date.now()/86400000)%SPORT_ADVICE_POOL.length;
    scheduleMidnightReset();
  },midnight-now);
}

window.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.modal-overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('active');}));
  init();scheduleMidnightReset();
  if(window.speechSynthesis)window.speechSynthesis.onvoiceschanged=()=>{};
});
