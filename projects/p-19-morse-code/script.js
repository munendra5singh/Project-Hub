/* ============================================================
   1. CENTRAL MORSE DATA — official International Morse Code
   ============================================================ */
const MORSE_MAP = {
  A:'.-', B:'-...', C:'-.-.', D:'-..', E:'.', F:'..-.', G:'--.', H:'....',
  I:'..', J:'.---', K:'-.-', L:'.-..', M:'--', N:'-.', O:'---', P:'.--.',
  Q:'--.-', R:'.-.', S:'...', T:'-', U:'..-', V:'...-', W:'.--', X:'-..-',
  Y:'-.--', Z:'--..',
  '0':'-----', '1':'.----', '2':'..---', '3':'...--', '4':'....-',
  '5':'.....', '6':'-....', '7':'--...', '8':'---..', '9':'----.',
  '.':'.-.-.-', ',':'--..--', '?':'..--..', "'":'.----.', '!':'-.-.--',
  '/':'-..-.', '(':'-.--.', ')':'-.--.-', '&':'.-...', ':':'---...',
  ';':'-.-.-.', '=':'-...-', '+':'.-.-.', '-':'-....-', '_':'..--.-',
  '"':'.-..-.', '$':'...-..-', '@':'.--.-.'
};
const MORSE_TO_CHAR = {};
Object.keys(MORSE_MAP).forEach(k => MORSE_TO_CHAR[MORSE_MAP[k]] = k);

const CHAR_NAMES = {
  '.':'Period', ',':'Comma', '?':'Question mark', "'":'Apostrophe', '!':'Exclamation mark',
  '/':'Slash', '(':'Open parenthesis', ')':'Close parenthesis', '&':'Ampersand', ':':'Colon',
  ';':'Semicolon', '=':'Equals (BT)', '+':'Plus (AR)', '-':'Hyphen', '_':'Underscore',
  '"':'Quotation mark', '$':'Dollar sign', '@':'At sign'
};
function displayName(c){
  if (/[A-Z0-9]/.test(c)) return c;
  return CHAR_NAMES[c] || c;
}

/* ============================================================
   2. LESSON PROGRESSION
   ============================================================ */
const LESSONS = [
  {id:'l1',  title:'First Signals',    type:'letters', chars:['E','T']},
  {id:'l2',  title:'Second Signals',   type:'letters', chars:['A','N']},
  {id:'l3',  title:'Building Up',      type:'letters', chars:['I','M']},
  {id:'l4',  title:'Steady Pace',      type:'letters', chars:['S','O']},
  {id:'l5',  title:'New Ground',       type:'letters', chars:['H','R']},
  {id:'l6',  title:'Keep Going',       type:'letters', chars:['D','L']},
  {id:'l7',  title:'Halfway There',    type:'letters', chars:['U','C']},
  {id:'l8',  title:'Widening Out',     type:'letters', chars:['W','F']},
  {id:'l9',  title:'Sharper Ears',     type:'letters', chars:['K','G']},
  {id:'l10', title:'Fine Detail',      type:'letters', chars:['B','Y']},
  {id:'l11', title:'Almost There',     type:'letters', chars:['P','X']},
  {id:'l12', title:'Final Stretch',    type:'letters', chars:['V','J']},
  {id:'l13', title:'Alphabet Complete',type:'letters', chars:['Q','Z']},
  {id:'l14', title:'Numbers I',        type:'numbers', chars:['0','1','2','3','4']},
  {id:'l15', title:'Numbers II',       type:'numbers', chars:['5','6','7','8','9']},
  {id:'l16', title:'Stops & Questions',type:'symbols', chars:['.',',','?']},
  {id:'l17', title:'Marks & Breaks',   type:'symbols', chars:["'",'!','/']},
  {id:'l18', title:'Brackets & More',  type:'symbols', chars:['(',')','&']},
  {id:'l19', title:'Prosign Symbols',  type:'symbols', chars:[':',';','=']},
  {id:'l20', title:'More Symbols',     type:'symbols', chars:['+','-','_']},
  {id:'l21', title:'Final Symbols',    type:'symbols', chars:['"','$','@']},
  {id:'l22', title:'Word Practice',    type:'words',   chars:[]},
  {id:'l23', title:'Sentence Practice',type:'sentences',chars:[]},
];
const WORD_BANK = ['MORSE','SIGNAL','RADIO','LIGHT','WATCH','SOUND','SPARK','LEARN','QUICK','TRAIN',
  'CODE','DASH','DOT','WAVE','TOWER','ALERT','ECHO','PULSE','KEY','KNOB','KEEP','MOVE','NORTH','SOUTH'];
const SENTENCE_BANK = ['THE SUN IS UP', 'SEND HELP NOW', 'MEET ME AT NOON', 'ALL IS WELL',
  'GOOD MORNING', 'SHIP AHOY', 'STAY IN TOUCH', 'CALL ME BACK', 'WE ARE READY', 'HOLD YOUR POSITION'];

function allCharsUpTo(lessonIndex){
  const set = [];
  for (let i=0;i<=lessonIndex;i++){
    if (LESSONS[i].chars) set.push(...LESSONS[i].chars);
  }
  return set;
}
function lessonIndexById(id){ return LESSONS.findIndex(l=>l.id===id); }

/* ============================================================
   3. STATE + PERSISTENCE
   ============================================================ */
const STORAGE_KEY = 'keyline_state_v1';
function defaultState(){
  return {
    onboarded:false,
    name:'',
    goal:null,
    xp:0,
    level:1,
    streak:0,
    lastActiveDate:null,
    hearts:5,
    heartsMax:5,
    lastHeartRegen:Date.now(),
    dailyGoalXP:50,
    dailyXPToday:0,
    dailyXPDate:null,
    currentLessonIndex:0,
    completedLessons:{},
    mastery:{},        // char -> 0..100
    attempts:{},        // char -> {correct, total}
    mistakeLog:{},       // char -> count of recent misses
    achievements:{},
    dailyChallenge:{date:null, target:10, progress:0, done:false, rewardGiven:false},
    settings:{sound:true, wpmSlow:8, wpmNormal:15, wpmFast:24, theme:'dark', volume:0.5},
    stats:{lessonsCompleted:0, totalCorrect:0, totalAnswered:0, quizzesTaken:0, bestWPM:0, avgResponseMs:null}
  };
}
let state = loadState();
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return Object.assign(defaultState(), parsed, {
      mastery:Object.assign({}, parsed.mastery||{}),
      attempts:Object.assign({}, parsed.attempts||{}),
      mistakeLog:Object.assign({}, parsed.mistakeLog||{}),
      completedLessons:Object.assign({}, parsed.completedLessons||{}),
      achievements:Object.assign({}, parsed.achievements||{}),
      settings:Object.assign({}, defaultState().settings, parsed.settings||{}),
      stats:Object.assign({}, defaultState().stats, parsed.stats||{}),
      dailyChallenge:Object.assign({}, defaultState().dailyChallenge, parsed.dailyChallenge||{}),
    });
  }catch(e){ return defaultState(); }
}
function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){}
}
function todayStr(){ const d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }

function touchDailyStreak(){
  const t = todayStr();
  if (state.lastActiveDate === t) return;
  if (state.lastActiveDate){
    const prev = new Date(state.lastActiveDate);
    const now = new Date(t);
    const diffDays = Math.round((now - prev)/86400000);
    if (diffDays === 1) state.streak += 1;
    else if (diffDays > 1) state.streak = 1;
    else state.streak = state.streak || 1;
  } else {
    state.streak = 1;
  }
  state.lastActiveDate = t;
  if (state.dailyXPDate !== t){ state.dailyXPDate = t; state.dailyXPToday = 0; }
  if (state.dailyChallenge.date !== t){
    state.dailyChallenge = {date:t, target: 10, progress:0, done:false, rewardGiven:false};
  }
  saveState();
}

function regenHearts(){
  const now = Date.now();
  const REGEN_MS = 20*60*1000; // 20 min per heart
  if (state.hearts >= state.heartsMax) { state.lastHeartRegen = now; return; }
  const elapsed = now - state.lastHeartRegen;
  const gained = Math.floor(elapsed / REGEN_MS);
  if (gained > 0){
    state.hearts = Math.min(state.heartsMax, state.hearts + gained);
    state.lastHeartRegen = now - (elapsed % REGEN_MS);
    saveState();
  }
}

/* ============================================================
   4. XP / LEVEL / MASTERY LOGIC
   ============================================================ */
function xpForLevel(level){ return 100 + (level-1)*60; }
function addXP(amount, opts){
  opts = opts||{};
  state.xp += amount;
  const t = todayStr();
  if (state.dailyXPDate !== t){ state.dailyXPDate = t; state.dailyXPToday = 0; }
  state.dailyXPToday += amount;
  let leveledUp = false;
  while (state.xp >= xpForLevel(state.level)){
    state.xp -= xpForLevel(state.level);
    state.level += 1;
    leveledUp = true;
  }
  saveState();
  if (!opts.silent) showToast('+'+amount+' XP'+(leveledUp?' · Level up! 🎉':''));
  checkAchievements();
  return leveledUp;
}
function loseHeart(){
  if (state.hearts > 0){ state.hearts -= 1; state.lastHeartRegen = Date.now(); saveState(); }
}
function gainHeart(n){
  state.hearts = Math.min(state.heartsMax, state.hearts + (n||1));
  saveState();
}
function updateMastery(ch, correct){
  const m = state.mastery[ch] ?? 0;
  const a = state.attempts[ch] || {correct:0,total:0};
  a.total += 1; if (correct) a.correct += 1;
  state.attempts[ch] = a;
  let next = correct ? m + (100-m)*0.28 + 3 : m - m*0.35 - 6;
  next = Math.max(0, Math.min(100, Math.round(next)));
  state.mastery[ch] = next;
  if (!correct){
    state.mistakeLog[ch] = (state.mistakeLog[ch]||0) + 1;
  } else if (state.mistakeLog[ch]){
    state.mistakeLog[ch] = Math.max(0, state.mistakeLog[ch]-1);
  }
  state.stats.totalAnswered += 1;
  if (correct) state.stats.totalCorrect += 1;
  saveState();
}
function masteredChars(){
  return Object.keys(state.mastery).filter(c => state.mastery[c] >= 60);
}
function weakChars(){
  return Object.keys(state.mastery).filter(c=>state.mastery[c] < 60 && state.attempts[c] && state.attempts[c].total>0)
    .sort((a,b)=> state.mastery[a]-state.mastery[b]);
}
function learnedCharsSoFar(){
  const idx = state.currentLessonIndex;
  const list = [];
  for (let i=0;i<Math.min(idx, LESSONS.length); i++){
    if (LESSONS[i].chars) list.push(...LESSONS[i].chars);
  }
  return [...new Set(list)];
}

/* ============================================================
   5. ACHIEVEMENTS
   ============================================================ */
const ACHIEVEMENTS = [
  {id:'first', ic:'🏆', t:'First Morse', d:'Learn your first character', check:s=>Object.keys(s.mastery).length>=1},
  {id:'alpha', ic:'🔤', t:'Alphabet Complete', d:'Learn A–Z', check:s=>['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].every(c=>c in s.mastery)},
  {id:'nums', ic:'🔢', t:'Number Master', d:'Learn 0–9', check:s=>'0123456789'.split('').every(c=>c in s.mastery)},
  {id:'syms', ic:'✳️', t:'Symbol Master', d:'Learn all symbols', check:s=>Object.keys(CHAR_NAMES).every(c=>c in s.mastery)},
  {id:'streak7', ic:'🔥', t:'7 Day Streak', d:'Practice 7 days in a row', check:s=>s.streak>=7},
  {id:'speed', ic:'⚡', t:'Speed Demon', d:'Complete a fast-speed challenge', check:s=>s.stats.bestWPM>=20},
  {id:'perfect', ic:'💯', t:'Perfect Lesson', d:'Finish a lesson with no mistakes', check:s=>!!s.achievements._perfectFlag},
  {id:'hundred', ic:'⭐', t:'Century', d:'Earn 100 XP total', check:s=>(s.level>1 || s.xp>=100)},
];
function checkAchievements(){
  let any=false;
  ACHIEVEMENTS.forEach(a=>{
    if (!state.achievements[a.id] && a.check(state)){
      state.achievements[a.id]=true; any=true;
      showToast(a.ic+' Achievement: '+a.t);
    }
  });
  if (any) saveState();
}

/* ============================================================
   6. TEXT <-> MORSE UTIL
   ============================================================ */
function textToMorse(text){
  return text.toUpperCase().split(' ').map(word=>
    word.split('').map(c=> MORSE_MAP[c] || '').filter(x=>x!=='').join(' ')
  ).join(' / ');
}
function morseToText(morse){
  return morse.trim().split('/').map(word=>
    word.trim().split(/\s+/).map(code=> MORSE_TO_CHAR[code] || (code?'?':'')).join('')
  ).join(' ');
}

/* ============================================================
   7. AUDIO ENGINE (Web Audio API) — accurate PARIS timing
   ============================================================ */
const MorseAudio = (function(){
  let ctx = null;
  function getCtx(){
    if (!ctx) ctx = new (window.AudioContext||window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  let activeTimeouts = [];
  function stopAll(){ activeTimeouts.forEach(t=>clearTimeout(t)); activeTimeouts=[]; }
  // unit length in ms from WPM using standard PARIS word timing
  function unitMs(wpm){ return 1200/wpm; }
  function toneAt(startTime, durSec, freq, vol){
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.frequency.value = freq;
    osc.type='sine';
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime+0.005);
    gain.gain.setValueAtTime(vol, startTime+durSec-0.008);
    gain.gain.linearRampToValueAtTime(0, startTime+durSec);
    osc.connect(gain); gain.connect(ac.destination);
    osc.start(startTime); osc.stop(startTime+durSec+0.01);
  }
  // plays a morse string (dots/dashes/spaces, '/' for word gap), returns {promise, cancel}
  function play(morse, wpm, opts){
    opts = opts||{};
    if (!state.settings.sound) return {promise:Promise.resolve(), cancel:()=>{}};
    const ac = getCtx();
    const u = unitMs(wpm)/1000;
    const freq = opts.freq || 600;
    const vol = (opts.volume!=null?opts.volume:state.settings.volume) * 0.5;
    let t = ac.currentTime + 0.05;
    let totalMs = 0;
    const symbols = morse.split('');
    let cancelled = false;
    symbols.forEach((sym, i)=>{
      if (sym === '.'){ if(!cancelled) toneAt(t, u, freq, vol); t += u; totalMs += u; t += u; totalMs += u; }
      else if (sym === '-'){ if(!cancelled) toneAt(t, u*3, freq, vol); t += u*3; totalMs += u*3; t += u; totalMs += u; }
      else if (sym === ' '){ t += u*2; totalMs += u*2; } // total gap becomes 3u between chars
      else if (sym === '/'){ t += u*6; totalMs += u*6; } // total gap becomes 7u between words
    });
    const timeoutMs = Math.max(0, (t - ac.currentTime))*1000;
    const promise = new Promise(res=>{
      const id = setTimeout(res, timeoutMs);
      activeTimeouts.push(id);
    });
    return {promise, cancel:()=>{cancelled=true; stopAll();}};
  }
  return {play, unitMs, stopAll};
})();
// Normalizes a "textToMorse"-style string (which uses " / " as word separator)
// into the compact per-symbol format MorseAudio.play expects (single '/' with no surrounding spaces).
function normalizeMorseForPlayback(s){
  return s.replace(/\s*\/\s*/g, '/').replace(/ {2,}/g, ' ').trim();
}

/* ============================================================
   8. TAP TRAINER LOGIC (shared by tap page + watch page)
   ============================================================ */
function createTapDecoder(onSymbol, onCharComplete, onWordComplete){
  let pressStart = null;
  let buffer = '';
  let charTimer = null;
  let wordTimer = null;
  const DOT_MAX = 260; // ms; below = dot, above = dash
  const CHAR_GAP = 900; // ms after release to finalize a character
  const WORD_GAP = 2200; // ms to finalize a word gap
  function clearTimers(){ if(charTimer) clearTimeout(charTimer); if(wordTimer) clearTimeout(wordTimer); }
  function down(){
    clearTimers();
    pressStart = Date.now();
  }
  function up(){
    if (pressStart==null) return;
    const dur = Date.now()-pressStart;
    pressStart=null;
    const sym = dur < DOT_MAX ? '.' : '-';
    buffer += sym;
    onSymbol && onSymbol(sym, buffer);
    clearTimers();
    charTimer = setTimeout(()=>{
      if (buffer){ onCharComplete && onCharComplete(buffer); buffer=''; }
    }, CHAR_GAP);
    wordTimer = setTimeout(()=>{ onWordComplete && onWordComplete(); }, WORD_GAP);
  }
  function reset(){ buffer=''; pressStart=null; clearTimers(); }
  return {down, up, reset};
}

/* ============================================================
   9. ROUTER
   ============================================================ */
const ROUTES = [
  {id:'home', ic:'🏠', label:'Home'},
  {id:'learn', ic:'📚', label:'Learn'},
  {id:'practice', ic:'🎯', label:'Practice'},
  {id:'progress', ic:'🏆', label:'Progress'},
  {id:'profile', ic:'👤', label:'Profile'},
];
let currentRoute = 'home';
let currentSub = null; // sub-view payload

function navigate(route, sub){
  currentRoute = route;
  currentSub = sub || null;
  window.scrollTo(0,0);
  render();
}

function showToast(msg){
  const el = document.createElement('div');
  el.className='toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 2200);
}

/* ============================================================
   10. RENDER: SHELL (nav bars)
   ============================================================ */
function renderShell(){
  const bn = document.getElementById('bottomnav');
  bn.innerHTML = ROUTES.map(r=>
    `<button data-route="${r.id}" class="${currentRoute===r.id?'active':''}">
      <span class="ic">${r.ic}</span><span>${r.label}</span>
    </button>`).join('');
  bn.querySelectorAll('button').forEach(b=>b.onclick=()=>navigate(b.dataset.route));

  const sn = document.getElementById('sidebar-nav');
  sn.innerHTML = ROUTES.map(r=>
    `<button data-route="${r.id}" class="${currentRoute===r.id?'active':''}">
      <span class="ic">${r.ic}</span><span>${r.label}</span>
    </button>`).join('');
  sn.querySelectorAll('button').forEach(b=>b.onclick=()=>navigate(b.dataset.route));

  const statsHtml = `
    <div class="flex-gap" style="flex-direction:column;gap:8px;">
      <div class="stat-pill">🔥 ${state.streak}</div>
      <div class="stat-pill">⭐ ${state.xp} XP</div>
      <div class="stat-pill">${heartsIcons()}</div>
    </div>`;
  document.getElementById('sidebar-stats').innerHTML = statsHtml;
  document.getElementById('topbar-stats').innerHTML = `
    <div class="stat-pill">🔥 ${state.streak}</div>
    <div class="stat-pill">⭐ ${state.xp}</div>
    <div class="stat-pill">${heartsIcons()}</div>`;
}
function heartsIcons(){
  let s='';
  for(let i=0;i<state.heartsMax;i++) s += i<state.hearts ? '❤️' : '🤍';
  return `<span style="letter-spacing:1px;font-size:11px;">${s}</span>`;
}

/* ============================================================
   11. MAIN RENDER DISPATCH (see full implementation in section 19,
   which also accounts for the Practice hub's sub-tools)
   ============================================================ */

/* ============================================================
   12. ONBOARDING
   ============================================================ */
function renderOnboarding(view){
  const step = currentSub && currentSub.step || 0;
  const wrap = document.createElement('div');
  wrap.className='onb-wrap';
  if (step===0){
    wrap.innerHTML = `
      <div class="hero-lamp"><div class="lamp-ring"><div class="lamp-core"></div></div></div>
      <h1>Learn Morse Code 🚀</h1>
      <p class="sub">Start from zero and master Morse step by step — by sight, by sound, and by touch.</p>
      <button class="btn btn-primary btn-block" id="ob-start" style="max-width:320px;margin-bottom:10px;">Start Learning</button>
      <button class="btn btn-outline btn-block" id="ob-chart" style="max-width:320px;">Explore Morse Chart</button>
    `;
    view.appendChild(wrap);
    document.getElementById('ob-start').onclick = ()=>{ currentSub={type:'onb',step:1}; render(); };
    document.getElementById('ob-chart').onclick = ()=>{ state.onboarded=true; saveState(); navigate('learn'); showToast('Explore any lesson — locked ones unlock as you progress'); };
    return;
  }
  if (step===1){
    wrap.innerHTML = `
      <h1 style="font-size:24px;">What's your name?</h1>
      <p class="sub">So we can welcome you back.</p>
      <input id="ob-name" class="txt-in" placeholder="Your name" style="max-width:280px;width:100%;text-align:center;margin-bottom:16px;padding:12px;font-size:15px;border-radius:12px;">
      <button class="btn btn-primary btn-block" id="ob-next" style="max-width:320px;">Continue</button>
    `;
    view.appendChild(wrap);
    document.getElementById('ob-next').onclick=()=>{
      state.name = document.getElementById('ob-name').value.trim() || 'Operator';
      currentSub={type:'onb',step:2}; render();
    };
    return;
  }
  if (step===2){
    const goals = [
      {k:'curious', l:'Just curious 👀'},
      {k:'learn', l:'Learn Morse Code 📖'},
      {k:'comms', l:'Learn for communication 📡'},
      {k:'fast', l:'Become fast at Morse ⚡'},
    ];
    wrap.innerHTML = `
      <h1 style="font-size:24px;">What's your goal?</h1>
      <p class="sub">We'll tune your pacing — you can change this anytime.</p>
      <div id="ob-goals" style="width:100%;max-width:340px;"></div>
    `;
    view.appendChild(wrap);
    const gwrap = document.getElementById('ob-goals');
    goals.forEach(g=>{
      const b = document.createElement('button');
      b.className='onb-choice'; b.textContent=g.l;
      b.onclick=()=>{
        state.goal = g.k;
        state.onboarded = true;
        touchDailyStreak();
        saveState();
        navigate('home');
        showToast('Welcome, '+state.name+'! 🎉');
      };
      gwrap.appendChild(b);
    });
    return;
  }
}

/* ============================================================
   13. HOME DASHBOARD
   ============================================================ */
function renderHome(view){
  touchDailyStreak();
  const idx = Math.min(state.currentLessonIndex, LESSONS.length-1);
  const lesson = LESSONS[idx];
  const totalLessons = LESSONS.length;
  const doneCount = Object.keys(state.completedLessons).length;
  const pct = Math.round((doneCount/totalLessons)*100);
  const dailyPct = Math.min(100, Math.round((state.dailyXPToday/state.dailyGoalXP)*100));

  view.innerHTML = `
    <div class="hero-lamp">
      <div class="lamp-ring"><div class="lamp-core"></div></div>
      <h1>Welcome back, ${escapeHtml(state.name||'Operator')} 👋</h1>
      <p class="sub">Your Morse journey — ${pct}% of the course complete</p>
    </div>

    <div class="stat-grid">
      <div class="stat-box"><div class="v">🔥${state.streak}</div><div class="l">Streak</div></div>
      <div class="stat-box"><div class="v">⭐${state.xp}</div><div class="l">XP</div></div>
      <div class="stat-box"><div class="v">Lv${state.level}</div><div class="l">Level</div></div>
      <div class="stat-box"><div class="v">${state.hearts}/${state.heartsMax}</div><div class="l">Hearts</div></div>
    </div>

    <div class="continue-card" style="margin-top:16px;">
      <div class="eyebrow">${lesson.type==='letters'?'Lesson '+(idx+1):lesson.type.toUpperCase()}</div>
      <div class="lesson-name">${lesson.title}</div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      <button class="btn btn-primary btn-block" id="continue-btn" style="margin-top:14px;">Continue Learning →</button>
    </div>

    <div class="section-title">Today's goal</div>
    <div class="card">
      <div class="row"><span style="font-weight:600;font-size:13.5px;">Daily XP goal</span><span class="mono" style="color:var(--accent);font-weight:700;">${state.dailyXPToday}/${state.dailyGoalXP}</span></div>
      <div class="progress-track" style="margin-top:8px;"><div class="progress-fill spark" style="width:${dailyPct}%"></div></div>
    </div>

    <div class="section-title">Quick actions</div>
    <div class="quick-grid">
      <button class="quick-tile" id="qt-daily"><div class="ic">🎯</div><div class="t">Daily Challenge</div><div class="d">${state.dailyChallenge.done?'Completed ✓':state.dailyChallenge.progress+'/'+state.dailyChallenge.target+' done'}</div></button>
      <button class="quick-tile" id="qt-mistakes"><div class="ic">🔁</div><div class="t">Review Mistakes</div><div class="d">${weakChars().length} weak chars</div></button>
      <button class="quick-tile" id="qt-sound"><div class="ic">🔊</div><div class="t">Sound Trainer</div><div class="d">Train your ear</div></button>
      <button class="quick-tile" id="qt-achieve"><div class="ic">🏆</div><div class="t">Achievements</div><div class="d">${Object.keys(state.achievements).filter(k=>!k.startsWith('_')).length}/${ACHIEVEMENTS.length} earned</div></button>
    </div>
  `;
  document.getElementById('continue-btn').onclick=()=> navigate('learn', {type:'lesson', lessonId: lesson.id});
  document.getElementById('qt-daily').onclick=()=> openDailyChallenge();
  document.getElementById('qt-mistakes').onclick=()=> startMistakeReview();
  document.getElementById('qt-sound').onclick=()=> navigate('practice', {type:'quiz', config:{mode:'sound', pool:learnedCharsSoFar(), count:8, label:'Sound Trainer'}});
  document.getElementById('qt-achieve').onclick=()=> navigate('progress');
}
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ============================================================
   14. LEARNING PATH
   ============================================================ */
function renderLearnPath(view){
  const wrap = document.createElement('div');
  wrap.innerHTML = `<h2 style="font-size:20px;margin-bottom:2px;">Learning Path</h2><p style="color:var(--text-dim);font-size:13.5px;margin-bottom:4px;">Complete lessons in order to unlock the next.</p>`;
  const path = document.createElement('div');
  path.className='path';
  LESSONS.forEach((l, i)=>{
    const done = !!state.completedLessons[l.id];
    const isCurrent = i === state.currentLessonIndex;
    const locked = i > state.currentLessonIndex;
    const node = document.createElement('button');
    node.className = 'path-node ' + (done?'done':(isCurrent?'current':'locked'));
    const iconChar = l.chars && l.chars.length ? l.chars.join('') : (l.type==='words'?'W':'S');
    node.innerHTML = `<div class="circ">${done?'✓':(locked?'🔒':iconChar)}</div>
      <div class="lbl">${l.title}</div>
      <div class="sub">${l.type}</div>`;
    node.disabled = locked;
    node.onclick = ()=>{ if(!locked) navigate('learn', {type:'lesson', lessonId:l.id}); };
    path.appendChild(node);
  });
  wrap.appendChild(path);
  view.appendChild(wrap);
}

/* ============================================================
   15. LESSON FLOW: intro chars -> practice -> completion
   ============================================================ */
let lessonFlowState = null;
function renderLessonFlow(view, lessonId){
  const idx = lessonIndexById(lessonId);
  const lesson = LESSONS[idx];
  if (!lessonFlowState || lessonFlowState.lessonId !== lessonId){
    lessonFlowState = {
      lessonId, phase:'intro', introIndex:0,
      mistakesThisLesson:0,
    };
  }
  if (lessonFlowState.phase === 'done'){
    renderLessonComplete(view, lesson);
    return;
  }
  if (lesson.type === 'words'){ renderWordSentencePractice(view, 'words', null, lesson); return; }
  if (lesson.type === 'sentences'){ renderWordSentencePractice(view, 'sentences', null, lesson); return; }

  if (lessonFlowState.phase === 'intro'){
    renderCharIntro(view, lesson, lessonFlowState.introIndex);
    return;
  }
  if (lessonFlowState.phase === 'practice'){
    renderLessonPracticeRound(view, lesson);
    return;
  }
}

function renderCharIntro(view, lesson, i){
  const ch = lesson.chars[i];
  const morse = MORSE_MAP[ch];
  const wpm = state.settings.wpmNormal;
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="row" style="margin-bottom:6px;">
      <button class="btn btn-ghost btn-sm" id="exit-lesson">✕ Exit</button>
      <div class="progress-track" style="flex:1;margin:0 12px;"><div class="progress-fill" style="width:${((i)/lesson.chars.length)*100}%"></div></div>
      <span class="mono" style="font-size:12px;color:var(--text-faint);">${i+1}/${lesson.chars.length}</span>
    </div>
    <div class="char-hero">
      <div class="big">${ch}</div>
      <div class="morse">${morse.split('').join(' ')}</div>
      ${!/[A-Z0-9]/.test(ch) ? `<div class="badge gold" style="margin-top:6px;">${CHAR_NAMES[ch]}</div>` : ''}
    </div>
    <div class="signal-row" id="signal-row">
      ${morse.split('').map(s=>`<div class="signal-unit ${s==='.'?'dot':'dash'}"></div>`).join('')}
    </div>
    <button class="play-btn" id="play-char">▶</button>
    <div class="mode-row" id="speed-row">
      <button data-spd="slow">Slow</button>
      <button data-spd="normal" class="active">Normal</button>
      <button data-spd="fast">Fast</button>
    </div>
    <div class="diff-note">
      ${morse.length<=2? 'Dot = short signal (1 unit). Dash = long signal (3 units).' : 'Notice the rhythm — dots are short, dashes are three times as long.'}
    </div>
    <button class="btn btn-primary btn-block" id="next-char" style="margin-top:22px;">${i+1<lesson.chars.length ? 'Next character' : 'Start practice →'}</button>
  `;
  view.appendChild(wrap);
  document.getElementById('exit-lesson').onclick = ()=>{ lessonFlowState=null; navigate('learn'); };
  let spd = 'normal';
  wrap.querySelectorAll('#speed-row button').forEach(b=>{
    b.onclick = ()=>{ spd=b.dataset.spd; wrap.querySelectorAll('#speed-row button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); };
  });
  function speedWpm(){ return spd==='slow'?state.settings.wpmSlow: spd==='fast'?state.settings.wpmFast: state.settings.wpmNormal; }
  document.getElementById('play-char').onclick = ()=> playAndAnimate(morse, speedWpm(), wrap.querySelector('#signal-row'));
  document.getElementById('next-char').onclick = ()=>{
    if (i+1 < lesson.chars.length){ lessonFlowState.introIndex += 1; render(); }
    else { lessonFlowState.phase='practice'; render(); }
  };
  // auto play once on load
  setTimeout(()=>playAndAnimate(morse, speedWpm(), wrap.querySelector('#signal-row')), 300);
}

function playAndAnimate(morse, wpm, rowEl){
  const units = rowEl ? Array.from(rowEl.children) : [];
  MorseAudio.play(morse, wpm);
  if (!units.length) return;
  const u = MorseAudio.unitMs(wpm);
  let t = 0;
  let ui = 0;
  morse.split('').forEach(sym=>{
    if (sym==='.'||sym==='-'){
      const dur = sym==='.'? u : u*3;
      const el = units[ui];
      setTimeout(()=>{ if(el) el.classList.add('active'); }, t);
      setTimeout(()=>{ if(el) el.classList.remove('active'); }, t+dur);
      t += dur + u;
      ui++;
    }
  });
}

/* ---- lesson practice round (mixed modes 1/2/3) ---- */
function renderLessonPracticeRound(view, lesson){
  if (!lessonFlowState.questions){
    const pool = [...lesson.chars];
    const review = weakChars().filter(c=>learnedCharsSoFar().includes(c) && !pool.includes(c)).slice(0,2);
    const fullPool = [...pool, ...review];
    const qs = [];
    lesson.chars.forEach(ch=>{
      qs.push(buildQuestion('morse2char', ch, fullPool.length>=4?fullPool:learnedFallback(fullPool)));
      qs.push(buildQuestion('char2morse', ch, fullPool.length>=4?fullPool:learnedFallback(fullPool)));
      qs.push(buildQuestion('sound2char', ch, fullPool.length>=4?fullPool:learnedFallback(fullPool)));
    });
    review.forEach(ch=> qs.push(buildQuestion('morse2char', ch, fullPool.length>=4?fullPool:learnedFallback(fullPool))));
    lessonFlowState.questions = shuffle(qs);
    lessonFlowState.qi = 0;
    lessonFlowState.correctCount = 0;
  }
  renderQuestionScreen(view, lessonFlowState.questions[lessonFlowState.qi], {
    progressCurrent: lessonFlowState.qi, progressTotal: lessonFlowState.questions.length,
    onExit: ()=>{ lessonFlowState=null; navigate('learn'); },
    onAnswer:(correct)=>{
      if (correct) lessonFlowState.correctCount++;
      else lessonFlowState.mistakesThisLesson++;
    },
    onNext:()=>{
      lessonFlowState.qi++;
      if (lessonFlowState.qi >= lessonFlowState.questions.length){
        lessonFlowState.phase='done';
      }
      render();
    }
  });
}
function learnedFallback(pool){
  const learned = learnedCharsSoFar();
  const merged = [...new Set([...pool, ...learned])];
  return merged.length>=4? merged : Object.keys(MORSE_MAP);
}

function renderLessonComplete(view, lesson){
  const idx = lessonIndexById(lesson.id);
  if (!state.completedLessons[lesson.id]){
    state.completedLessons[lesson.id] = true;
    state.stats.lessonsCompleted += 1;
    const perfect = lessonFlowState.mistakesThisLesson === 0;
    let xp = 50;
    if (perfect){ xp += 25; state.achievements._perfectFlag = true; }
    if (idx === state.currentLessonIndex && idx+1 < LESSONS.length) state.currentLessonIndex = idx+1;
    else if (idx === state.currentLessonIndex) state.currentLessonIndex = idx;
    saveState();
    addXP(xp, {silent:true});
    lessonFlowState.awardedXP = xp;
    lessonFlowState.perfect = perfect;
    checkAchievements();
  }
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="hero-lamp">
      <div class="lamp-ring"><div class="lamp-core"></div></div>
      <h1>Lesson complete! 🎉</h1>
      <p class="sub">${lesson.title}</p>
    </div>
    <div class="card" style="text-align:center;">
      <div style="font-family:var(--font-display);font-size:30px;font-weight:700;color:var(--accent);">+${lessonFlowState.awardedXP||50} XP</div>
      ${lessonFlowState.perfect? '<div class="badge gold" style="margin-top:8px;">💯 Perfect lesson</div>' : `<div style="color:var(--text-dim);font-size:13px;margin-top:6px;">${lessonFlowState.correctCount||0}/${(lessonFlowState.questions||[]).length} correct</div>`}
    </div>
    <button class="btn btn-primary btn-block" id="back-path" style="margin-top:18px;">Back to path</button>
  `;
  view.appendChild(wrap);
  document.getElementById('back-path').onclick=()=>{ lessonFlowState=null; navigate('learn'); };
}

/* ============================================================
   16. QUESTION / QUIZ ENGINE
   ============================================================ */
function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
function pickDistractors(correct, pool, n){
  const candidates = pool.filter(c=>c!==correct);
  // prefer confusable (similar morse length) distractors
  const correctLen = MORSE_MAP[correct] ? MORSE_MAP[correct].length : 1;
  const sorted = shuffle(candidates).sort((a,b)=>{
    const da = Math.abs((MORSE_MAP[a]||'').length - correctLen);
    const db = Math.abs((MORSE_MAP[b]||'').length - correctLen);
    return da-db;
  });
  return sorted.slice(0,n);
}
function buildQuestion(mode, ch, pool){
  const options = shuffle([ch, ...pickDistractors(ch, pool.length>=4?pool:Object.keys(MORSE_MAP), 3)]);
  return {mode, ch, options};
}

function renderQuestionScreen(view, q, handlers){
  const morse = MORSE_MAP[q.ch];
  const wrap = document.createElement('div');
  let promptHtml = '';
  if (q.mode==='morse2char'){
    promptHtml = `<div class="label">What character is this?</div><div class="big-morse">${morse.split('').join(' ')}</div>`;
  } else if (q.mode==='char2morse'){
    promptHtml = `<div class="label">Tap the correct Morse code</div><div class="big-char">${q.ch}</div>`;
  } else if (q.mode==='sound2char'){
    promptHtml = `<div class="label">Listen, then choose the character</div><div style="margin-top:6px;">🔊</div>`;
  }
  wrap.innerHTML = `
    <div class="quiz-header">
      <button class="btn btn-ghost btn-sm" id="exit-quiz">✕</button>
      <div class="progress-track"><div class="progress-fill" style="width:${(handlers.progressCurrent/handlers.progressTotal)*100}%"></div></div>
      <span class="mono" style="font-size:12px;color:var(--text-faint);">${handlers.progressCurrent+1}/${handlers.progressTotal}</span>
    </div>
    <div class="quiz-prompt">${promptHtml}
      ${q.mode==='sound2char' ? '<button class="play-btn" id="replay-sound">▶</button>' : ''}
    </div>
    <div class="opt-grid" id="opt-grid">
      ${q.options.map(o=>`<button class="opt-btn" data-opt="${escapeHtml(o)}">${q.mode==='char2morse'? MORSE_MAP[o] : o}</button>`).join('')}
    </div>
  `;
  view.appendChild(wrap);
  document.getElementById('exit-quiz').onclick = handlers.onExit;
  if (q.mode==='sound2char'){
    const playIt = ()=> MorseAudio.play(morse, state.settings._quizWpmOverride || state.settings.wpmNormal);
    document.getElementById('replay-sound').onclick = playIt;
    setTimeout(playIt, 350);
  }
  let answered = false;
  const startTime = Date.now();
  wrap.querySelectorAll('.opt-btn').forEach(btn=>{
    btn.onclick = ()=>{
      if (answered) return;
      answered = true;
      const chosen = btn.dataset.opt;
      const correct = chosen === q.ch;
      const rt = Date.now()-startTime;
      wrap.querySelectorAll('.opt-btn').forEach(b=>{
        b.disabled = true;
        if (b.dataset.opt === q.ch) b.classList.add('correct');
        else if (b === btn && !correct) b.classList.add('wrong');
      });
      updateMastery(q.ch, correct);
      if (correct){
        addXP(10, {silent:true});
        showFeedbackBar(true, 'Correct!', morse);
      } else {
        loseHeart();
        showFeedbackBar(false, 'Not quite — it was '+ (q.mode==='char2morse'? MORSE_MAP[q.ch] : q.ch), morse);
      }
      updateDailyChallengeProgress();
      handlers.onAnswer && handlers.onAnswer(correct);
      setTimeout(()=>{
        hideFeedbackBar();
        handlers.onNext && handlers.onNext();
      }, 1150);
    };
  });
}
function showFeedbackBar(correct, text, morse){
  hideFeedbackBar();
  const bar = document.createElement('div');
  bar.id='fb-bar';
  bar.className='feedback-bar '+(correct?'correct':'wrong');
  bar.innerHTML = `<div class="feedback-inner">
    <div><div class="feedback-txt">${correct?'✓ ':'✕ '}${text}</div><div class="feedback-sub">${morse}</div></div>
    <div>${!correct?heartsIcons():''}</div>
  </div>`;
  document.body.appendChild(bar);
}
function hideFeedbackBar(){ const b=document.getElementById('fb-bar'); if(b) b.remove(); }

function updateDailyChallengeProgress(){
  const t = todayStr();
  if (state.dailyChallenge.date !== t){ state.dailyChallenge = {date:t,target:10,progress:0,done:false,rewardGiven:false}; }
  if (!state.dailyChallenge.done){
    state.dailyChallenge.progress += 1;
    if (state.dailyChallenge.progress >= state.dailyChallenge.target){
      state.dailyChallenge.done = true;
      if (!state.dailyChallenge.rewardGiven){
        state.dailyChallenge.rewardGiven = true;
        addXP(30);
      }
    }
  }
  saveState();
}
function openDailyChallenge(){
  showToast('Daily challenge: decode '+state.dailyChallenge.target+' signals ('+state.dailyChallenge.progress+'/'+state.dailyChallenge.target+')');
  const pool = learnedCharsSoFar().length>=4? learnedCharsSoFar() : Object.keys(MORSE_MAP).slice(0,10);
  navigate('practice', {type:'quiz', config:{mode:'mixed', pool, count:10, label:'Daily Challenge'}});
}
function startMistakeReview(){
  const weak = weakChars();
  const pool = weak.length? weak : learnedCharsSoFar();
  if (!pool.length){ showToast('No mistakes yet — keep learning!'); navigate('learn'); return; }
  navigate('practice', {type:'quiz', config:{mode:'mixed', pool, count:Math.max(5,Math.min(12,pool.length*2)), label:'Review Mistakes', reviewMode:true}});
}

/* ---- generic quiz flow (used by Practice hub tiles) ---- */
let quizFlowState = null;
function renderQuizFlow(view, config){
  if (!quizFlowState || quizFlowState.key !== JSON.stringify(config)){
    const pool = config.pool && config.pool.length>=4 ? config.pool : Object.keys(MORSE_MAP);
    const modes = config.mode==='mixed' ? ['morse2char','char2morse','sound2char'] : [config.mode];
    const chars = shuffle(pool);
    const qs = [];
    for (let i=0;i<config.count;i++){
      const ch = chars[i % chars.length];
      const mode = modes[Math.floor(Math.random()*modes.length)];
      qs.push(buildQuestion(mode, ch, pool));
    }
    quizFlowState = {key:JSON.stringify(config), config, questions:qs, qi:0, correct:0, startTime:Date.now()};
  }
  if (quizFlowState.qi >= quizFlowState.questions.length){
    renderQuizResult(view);
    return;
  }
  renderQuestionScreen(view, quizFlowState.questions[quizFlowState.qi], {
    progressCurrent: quizFlowState.qi, progressTotal: quizFlowState.questions.length,
    onExit: ()=>{ quizFlowState=null; navigate('practice'); },
    onAnswer:(correct)=>{ if(correct) quizFlowState.correct++; },
    onNext:()=>{ quizFlowState.qi++; render(); }
  });
}
function renderQuizResult(view){
  const total = quizFlowState.questions.length;
  const correct = quizFlowState.correct;
  const pct = Math.round((correct/total)*100);
  const elapsedMin = (Date.now()-quizFlowState.startTime)/60000;
  state.stats.quizzesTaken += 1;
  saveState();
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="hero-lamp">
      <div class="lamp-ring"><div class="lamp-core"></div></div>
      <h1>${pct>=80?'Great work! 🎉':'Round complete'}</h1>
      <p class="sub">${quizFlowState.config.label||'Practice'} · ${correct}/${total} correct (${pct}%)</p>
    </div>
    <div class="quick-grid">
      <button class="quick-tile" id="retry-q"><div class="ic">🔁</div><div class="t">Retry</div></button>
      <button class="quick-tile" id="back-q"><div class="ic">🏠</div><div class="t">Back to Practice</div></button>
    </div>
  `;
  view.appendChild(wrap);
  document.getElementById('retry-q').onclick = ()=>{ quizFlowState=null; render(); };
  document.getElementById('back-q').onclick = ()=>{ quizFlowState=null; navigate('practice'); };
}

/* ============================================================
   17. CHARACTER DETAIL (Alphabet / Numbers / Symbols cards)
   ============================================================ */
function renderCharDetail(view, ch){
  const morse = MORSE_MAP[ch];
  const mastery = state.mastery[ch] ?? 0;
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <button class="btn btn-ghost btn-sm" id="back-btn">← Back</button>
    <div class="char-hero">
      <div class="big">${ch}</div>
      <div class="morse">${morse.split('').join(' ')}</div>
      ${!/[A-Z0-9]/.test(ch)?`<div class="badge gold" style="margin-top:8px;">${CHAR_NAMES[ch]}</div>`:''}
    </div>
    <div class="signal-row" id="signal-row">${morse.split('').map(s=>`<div class="signal-unit ${s==='.'?'dot':'dash'}"></div>`).join('')}</div>
    <button class="play-btn" id="play-char">▶</button>
    <div class="mode-row" id="speed-row">
      <button data-spd="slow">Slow</button><button data-spd="normal" class="active">Normal</button><button data-spd="fast">Fast</button>
    </div>
    <div class="card" style="margin-top:20px;">
      <div class="row"><span style="font-weight:600;font-size:13.5px;">Mastery</span><span class="mono" style="color:var(--spark);font-weight:700;">${mastery}%</span></div>
      <div class="progress-track" style="margin-top:8px;"><div class="progress-fill spark" style="width:${mastery}%"></div></div>
    </div>
    <button class="btn btn-primary btn-block" id="practice-char" style="margin-top:18px;">Practice this character</button>
  `;
  view.appendChild(wrap);
  document.getElementById('back-btn').onclick = ()=>{ currentSub=null; render(); };
  let spd='normal';
  wrap.querySelectorAll('#speed-row button').forEach(b=>b.onclick=()=>{ spd=b.dataset.spd; wrap.querySelectorAll('#speed-row button').forEach(x=>x.classList.remove('active')); b.classList.add('active');});
  function wpmFor(){ return spd==='slow'?state.settings.wpmSlow:spd==='fast'?state.settings.wpmFast:state.settings.wpmNormal; }
  document.getElementById('play-char').onclick = ()=> playAndAnimate(morse, wpmFor(), wrap.querySelector('#signal-row'));
  document.getElementById('practice-char').onclick = ()=>{
    const learned = learnedCharsSoFar();
    const pool = learned.includes(ch)? learned : [...learned, ch];
    navigate('practice', {type:'quiz', config:{mode:'mixed', pool, count:6, label:ch+' practice'}});
  };
}

/* ============================================================
   18. ALPHABET / NUMBERS / SYMBOLS SECTIONS
   ============================================================ */
function renderCharGrid(view, title, chars, backRoute){
  const wrap = document.createElement('div');
  wrap.innerHTML = `<h2 style="font-size:20px;margin-bottom:12px;">${title}</h2>`;
  const grid = document.createElement('div');
  grid.className='az-grid';
  chars.forEach(ch=>{
    const m = MORSE_MAP[ch];
    const mastery = state.mastery[ch] ?? 0;
    const learned = learnedCharsSoFar().includes(ch);
    const card = document.createElement('button');
    card.className='az-card';
    card.style.opacity = learned? '1':'0.55';
    card.innerHTML = `<div class="l">${ch}</div><div class="m">${m}</div>
      <div class="mastery-track"><div class="mastery-fill" style="width:${mastery}%"></div></div>`;
    card.onclick = ()=> navigate(backRoute, {type:'char', ch});
    grid.appendChild(card);
  });
  wrap.appendChild(grid);
  view.appendChild(wrap);
}

/* ============================================================
   19. PRACTICE HUB
   ============================================================ */
function renderPracticeHub(view){
  state.settings._quizWpmOverride = null;
  const wrap = document.createElement('div');
  wrap.innerHTML = `<h2 style="font-size:20px;margin-bottom:2px;">Practice</h2><p style="color:var(--text-dim);font-size:13.5px;margin-bottom:14px;">Train recognition, sound, and rhythm.</p>`;

  const sec1 = document.createElement('div');
  sec1.innerHTML = `<div class="section-title">Quizzes</div>`;
  const list1 = document.createElement('div'); list1.className='tile-list';
  const learned = learnedCharsSoFar();
  const tiles1 = [
    {ic:'🔀', t:'Mixed Quiz', d:'All modes, all learned characters', cfg:{mode:'mixed', pool:learned, count:10, label:'Mixed Quiz'}},
    {ic:'👁️', t:'Morse → Letter', d:'Read dots and dashes', cfg:{mode:'morse2char', pool:learned, count:10, label:'Morse → Letter'}},
    {ic:'✍️', t:'Letter → Morse', d:'Recall the code', cfg:{mode:'char2morse', pool:learned, count:10, label:'Letter → Morse'}},
    {ic:'🔊', t:'Sound → Letter', d:'Recognize by ear', cfg:{mode:'sound2char', pool:learned, count:10, label:'Sound → Letter'}},
    {ic:'🔢', t:'Numbers Quiz', d:'0–9 recognition', cfg:{mode:'mixed', pool:learned.filter(c=>/[0-9]/.test(c)), count:8, label:'Numbers Quiz'}},
    {ic:'✳️', t:'Symbols Quiz', d:'Punctuation recognition', cfg:{mode:'mixed', pool:learned.filter(c=>/[^A-Z0-9]/.test(c)), count:8, label:'Symbols Quiz'}},
    {ic:'⚡', t:'Speed Quiz', d:'Faster WPM, quick recall', cfg:{mode:'sound2char', pool:learned, count:12, label:'Speed Quiz', speed:'fast'}},
  ];
  tiles1.forEach(t=>{
    const row = document.createElement('button'); row.className='tile-row';
    row.innerHTML = `<div class="ic-wrap">${t.ic}</div><div class="txt"><div class="t">${t.t}</div><div class="d">${t.d}</div></div><div class="chev">›</div>`;
    row.onclick = ()=>{
      if (!t.cfg.pool || t.cfg.pool.length < 2){ showToast('Learn more characters first!'); return; }
      if (t.cfg.speed==='fast'){
        state.settings._quizWpmOverride = state.settings.wpmFast;
        state.stats.bestWPM = Math.max(state.stats.bestWPM||0, state.settings.wpmFast);
        saveState(); checkAchievements();
      } else {
        state.settings._quizWpmOverride = null;
      }
      navigate('practice', {type:'quiz', config:t.cfg});
    };
    list1.appendChild(row);
  });
  sec1.appendChild(list1);
  wrap.appendChild(sec1);

  const sec2 = document.createElement('div');
  sec2.innerHTML = `<div class="section-title">Hands-on trainers</div>`;
  const list2 = document.createElement('div'); list2.className='tile-list';
  const tiles2 = [
    {ic:'👆', t:'Tap / Signal Trainer', d:'Tap for dot, hold for dash', go:'tap'},
    {ic:'🔦', t:'Watch / Light Mode', d:'Visual signal training', go:'watch'},
    {ic:'🔤', t:'Word Practice', d:'Decode and build words', go:'words'},
    {ic:'📝', t:'Sentence Practice', d:'Full sentences in Morse', go:'sentences'},
    {ic:'⇄', t:'Text ⇄ Morse Decoder', d:'Convert freely between text and code', go:'decoder'},
  ];
  tiles2.forEach(t=>{
    const row = document.createElement('button'); row.className='tile-row';
    row.innerHTML = `<div class="ic-wrap">${t.ic}</div><div class="txt"><div class="t">${t.t}</div><div class="d">${t.d}</div></div><div class="chev">›</div>`;
    row.onclick = ()=>{ practiceSubView = t.go; render(); };
    list2.appendChild(row);
  });
  sec2.appendChild(list2);
  wrap.appendChild(sec2);

  view.appendChild(wrap);
}
let practiceSubView = null;

/* main render dispatch: also accounts for the Practice hub's sub-tools */
function render(){
  regenHearts();
  renderShell();
  const view = document.getElementById('view');
  view.innerHTML = '';
  if (!state.onboarded){ renderOnboarding(view); return; }
  if (currentRoute !== 'practice') practiceSubView = null;
  if (currentSub && currentSub.type === 'lesson'){ renderLessonFlow(view, currentSub.lessonId); return; }
  if (currentSub && currentSub.type === 'quiz'){ renderQuizFlow(view, currentSub.config); return; }
  if (currentSub && currentSub.type === 'char'){ renderCharDetail(view, currentSub.ch); return; }
  if (currentRoute === 'practice' && practiceSubView){ renderPracticeSubTool(view, practiceSubView); return; }
  switch(currentRoute){
    case 'home': renderHome(view); break;
    case 'learn': renderLearnPath(view); break;
    case 'practice': renderPracticeHub(view); break;
    case 'progress': renderProgress(view); break;
    case 'profile': renderProfile(view); break;
    default: renderHome(view);
  }
}

function renderPracticeSubTool(view, tool){
  const backBtn = `<button class="btn btn-ghost btn-sm" id="sub-back">← Back</button>`;
  if (tool==='tap'){ renderTapTrainer(view, backBtn); return; }
  if (tool==='watch'){ renderWatchMode(view, backBtn); return; }
  if (tool==='decoder'){ renderDecoder(view, backBtn); return; }
  if (tool==='words'){ renderWordSentencePractice(view, 'words', backBtn); return; }
  if (tool==='sentences'){ renderWordSentencePractice(view, 'sentences', backBtn); return; }
}

/* ---- Tap / Signal Trainer ---- */
function renderTapTrainer(view, backBtn){
  const wrap = document.createElement('div');
  wrap.innerHTML = `${backBtn}
    <h2 style="font-size:19px;margin:12px 0 4px;">Tap / Signal Trainer</h2>
    <p style="color:var(--text-dim);font-size:13px;margin-bottom:14px;">Short tap = dot. Press and hold = dash. Pause to finish a character.</p>
    <div class="tap-decoded" id="tap-decoded">—</div>
    <div class="tap-readout" id="tap-readout">&nbsp;</div>
    <div class="tap-pad" id="tap-pad">Tap or click here</div>
    <div class="row" style="margin-top:16px;">
      <button class="btn btn-outline btn-sm" id="tap-clear">Clear</button>
      <span class="badge" id="tap-status">Ready</span>
    </div>
    <div class="card" style="margin-top:18px;">
      <div style="font-weight:700;font-size:13.5px;margin-bottom:8px;">Try sending a letter</div>
      <div style="color:var(--text-dim);font-size:13px;">Target: <span class="mono" id="tap-target-ch" style="color:var(--accent);font-weight:700;"></span> (<span class="mono" id="tap-target-m"></span>)</div>
      <button class="btn btn-spark btn-block" id="tap-new-target" style="margin-top:12px;">New target letter</button>
    </div>
  `;
  view.appendChild(wrap);
  document.getElementById('sub-back').onclick=()=>{ practiceSubView=null; render(); };
  const pad = document.getElementById('tap-pad');
  const readout = document.getElementById('tap-readout');
  const decodedEl = document.getElementById('tap-decoded');
  let target = pickRandomTarget();
  function pickRandomTarget(){
    const pool = learnedCharsSoFar().length? learnedCharsSoFar() : ['E','T','A','N'];
    return pool[Math.floor(Math.random()*pool.length)];
  }
  function setTarget(ch){ target=ch; document.getElementById('tap-target-ch').textContent=ch; document.getElementById('tap-target-m').textContent=MORSE_MAP[ch]; }
  setTarget(target);
  document.getElementById('tap-new-target').onclick=()=>setTarget(pickRandomTarget());

  const decoder = createTapDecoder(
    (sym, buf)=>{ readout.textContent = buf; },
    (buf)=>{
      const ch = MORSE_TO_CHAR[buf];
      decodedEl.textContent = ch || '?';
      readout.textContent = '';
      if (ch){
        const correct = ch === target;
        document.getElementById('tap-status').textContent = correct? 'Correct! 🎉' : ('Got "'+ch+'"');
        document.getElementById('tap-status').className = 'badge '+(correct?'spark':'');
        if (correct) { addXP(8); setTarget(pickRandomTarget()); }
      } else {
        document.getElementById('tap-status').textContent = 'Unrecognized pattern';
      }
    },
    ()=>{}
  );
  function press(down){
    pad.classList.toggle('pressed', down);
    if (down) decoder.down(); else decoder.up();
  }
  pad.addEventListener('mousedown', ()=>press(true));
  pad.addEventListener('mouseup', ()=>press(false));
  pad.addEventListener('mouseleave', ()=>{ if(pad.classList.contains('pressed')) press(false); });
  pad.addEventListener('touchstart', e=>{ e.preventDefault(); press(true); }, {passive:false});
  pad.addEventListener('touchend', e=>{ e.preventDefault(); press(false); }, {passive:false});
  document.getElementById('tap-clear').onclick=()=>{ decoder.reset(); readout.textContent=''; decodedEl.textContent='—'; };
}

/* ---- Watch / Light Mode ---- */
function renderWatchMode(view, backBtn){
  const wrap = document.createElement('div');
  wrap.innerHTML = `${backBtn}
    <h2 style="font-size:19px;margin:12px 0 4px;">Watch / Light Mode</h2>
    <p style="color:var(--text-dim);font-size:13px;margin-bottom:6px;">Watch the light flash a character, then identify it — or tap the light yourself to send Morse.</p>
    <div class="watch-face"><div class="watch-light" id="watch-light"></div></div>
    <div class="row" style="justify-content:center;gap:10px;">
      <button class="btn btn-primary" id="watch-play">▶ Flash a character</button>
    </div>
    <div class="opt-grid" id="watch-opts" style="display:none;"></div>
    <div class="card" style="margin-top:20px;">
      <div style="font-weight:700;font-size:13.5px;margin-bottom:8px;">Send with the light</div>
      <div class="tap-decoded" id="watch-decoded">—</div>
      <div class="tap-readout" id="watch-readout">&nbsp;</div>
      <p style="color:var(--text-faint);font-size:12px;text-align:center;">Tap the light: short = dot, hold = dash</p>
    </div>
  `;
  view.appendChild(wrap);
  document.getElementById('sub-back').onclick=()=>{ practiceSubView=null; render(); };
  const light = document.getElementById('watch-light');
  let currentTarget = null;
  function flashChar(ch){
    const morse = MORSE_MAP[ch];
    const wpm = state.settings.wpmNormal;
    const u = MorseAudio.unitMs(wpm);
    MorseAudio.play(morse, wpm);
    let t=0;
    morse.split('').forEach(sym=>{
      const dur = sym==='.'?u:u*3;
      setTimeout(()=>light.classList.add('on'), t);
      setTimeout(()=>light.classList.remove('on'), t+dur);
      t += dur+u;
    });
  }
  document.getElementById('watch-play').onclick=()=>{
    const pool = learnedCharsSoFar().length? learnedCharsSoFar() : ['E','T'];
    currentTarget = pool[Math.floor(Math.random()*pool.length)];
    flashChar(currentTarget);
    const opts = shuffle([currentTarget, ...pickDistractors(currentTarget, pool.length>=4?pool:Object.keys(MORSE_MAP),3)]);
    const optWrap = document.getElementById('watch-opts');
    optWrap.style.display='grid';
    optWrap.innerHTML = opts.map(o=>`<button class="opt-btn" data-o="${o}">${o}</button>`).join('');
    optWrap.querySelectorAll('.opt-btn').forEach(b=>b.onclick=()=>{
      const correct = b.dataset.o===currentTarget;
      optWrap.querySelectorAll('.opt-btn').forEach(x=>{x.disabled=true; if(x.dataset.o===currentTarget)x.classList.add('correct'); else if(x===b)x.classList.add('wrong');});
      updateMastery(currentTarget, correct);
      if (correct) addXP(10); else { loseHeart(); showToast('It was '+currentTarget); }
    });
  };
  const decoder = createTapDecoder(
    (sym,buf)=>{ document.getElementById('watch-readout').textContent = buf; },
    (buf)=>{
      const ch = MORSE_TO_CHAR[buf];
      document.getElementById('watch-decoded').textContent = ch||'?';
      document.getElementById('watch-readout').textContent='';
    }, ()=>{}
  );
  function press(down){ light.classList.toggle('on', down); if(down) decoder.down(); else decoder.up(); }
  light.addEventListener('mousedown', ()=>press(true));
  light.addEventListener('mouseup', ()=>press(false));
  light.addEventListener('touchstart', e=>{e.preventDefault();press(true);}, {passive:false});
  light.addEventListener('touchend', e=>{e.preventDefault();press(false);}, {passive:false});
}

/* ---- Text <-> Morse Decoder ---- */
function renderDecoder(view, backBtn){
  const wrap = document.createElement('div');
  wrap.innerHTML = `${backBtn}
    <h2 style="font-size:19px;margin:12px 0 4px;">Morse Decoder</h2>
    <p style="color:var(--text-dim);font-size:13px;margin-bottom:14px;">Convert freely between text and Morse. Words are separated by " / ".</p>
    <div class="section-title" style="margin-top:0;">Text → Morse</div>
    <textarea class="decoder-input" id="txt-in" placeholder="Type a word or sentence..."></textarea>
    <textarea class="decoder-input mono-out" id="morse-out" readonly placeholder="Morse output appears here"></textarea>
    <div class="flex-gap" style="margin-top:8px;">
      <button class="btn btn-outline btn-sm" id="play-out">🔊 Play</button>
      <button class="btn btn-outline btn-sm" id="copy-out">Copy</button>
    </div>
    <div class="section-title">Morse → Text</div>
    <textarea class="decoder-input mono-out" id="morse-in" placeholder=".... . .-.. .-.. --- / .-- --- .-. .-.. -.."></textarea>
    <textarea class="decoder-input" id="txt-out" readonly placeholder="Decoded text appears here"></textarea>
    <div class="flex-gap" style="margin-top:8px;">
      <button class="btn btn-outline btn-sm" id="copy-out2">Copy</button>
    </div>
  `;
  view.appendChild(wrap);
  document.getElementById('sub-back').onclick=()=>{ practiceSubView=null; render(); };
  const txtIn = document.getElementById('txt-in'), morseOut = document.getElementById('morse-out');
  const morseIn = document.getElementById('morse-in'), txtOut = document.getElementById('txt-out');
  txtIn.oninput = ()=>{ morseOut.value = textToMorse(txtIn.value); };
  morseIn.oninput = ()=>{ txtOut.value = morseToText(morseIn.value); };
  document.getElementById('play-out').onclick = ()=>{
    if (!morseOut.value) return;
    MorseAudio.play(normalizeMorseForPlayback(morseOut.value), state.settings.wpmNormal);
  };
  document.getElementById('copy-out').onclick=()=>{ navigator.clipboard?.writeText(morseOut.value); showToast('Copied'); };
  document.getElementById('copy-out2').onclick=()=>{ navigator.clipboard?.writeText(txtOut.value); showToast('Copied'); };
}

/* ---- Word / Sentence Practice ---- */
function renderWordSentencePractice(view, kind, backBtn, lessonCtx){
  const bank = kind==='words'? WORD_BANK : SENTENCE_BANK;
  const inLesson = !!lessonCtx;
  if (inLesson && (!lessonFlowState.wsGoal)){
    lessonFlowState.wsGoal = 5; lessonFlowState.wsCorrect = 0; lessonFlowState.wsWrong = 0;
  }
  let word = renderWordSentencePractice._current && renderWordSentencePractice._kind===kind
    ? renderWordSentencePractice._current
    : bank[Math.floor(Math.random()*bank.length)];
  renderWordSentencePractice._current = word;
  renderWordSentencePractice._kind = kind;
  const morse = textToMorse(word);
  const wrap = document.createElement('div');
  const progressHtml = inLesson ? `
    <div class="row" style="margin-bottom:6px;">
      <button class="btn btn-ghost btn-sm" id="ws-exit">✕ Exit</button>
      <div class="progress-track" style="flex:1;margin:0 12px;"><div class="progress-fill" style="width:${(lessonFlowState.wsCorrect/lessonFlowState.wsGoal)*100}%"></div></div>
      <span class="mono" style="font-size:12px;color:var(--text-faint);">${lessonFlowState.wsCorrect}/${lessonFlowState.wsGoal}</span>
    </div>` : (backBtn||'');
  wrap.innerHTML = `${progressHtml}
    <h2 style="font-size:19px;margin:12px 0 4px;">${kind==='words'?'Word Practice':'Sentence Practice'}</h2>
    <p style="color:var(--text-dim);font-size:13px;margin-bottom:14px;">Elements: 1 unit gap · Characters: 3 unit gap · Words: 7 unit gap</p>
    <div class="card" style="text-align:center;">
      <div style="font-family:var(--font-display);font-weight:700;font-size:24px;letter-spacing:1px;">${word}</div>
      <div class="mono" style="color:var(--accent);font-size:16px;margin-top:8px;letter-spacing:2px;word-break:break-all;">${morse}</div>
      <button class="play-btn" id="play-ws">▶</button>
    </div>
    <div class="section-title">Type what you hear</div>
    <input class="txt-in" id="ws-answer" style="width:100%;padding:12px;font-size:15px;border-radius:12px;" placeholder="Type the word/sentence...">
    <button class="btn btn-primary btn-block" id="ws-check" style="margin-top:12px;">Check answer</button>
    <div id="ws-result" style="text-align:center;margin-top:10px;font-weight:700;"></div>
    <button class="btn btn-outline btn-block" id="ws-next" style="margin-top:10px;">New ${kind==='words'?'word':'sentence'}</button>
  `;
  view.appendChild(wrap);
  if (backBtn && !inLesson) document.getElementById('sub-back').onclick=()=>{ practiceSubView=null; render(); };
  if (inLesson) document.getElementById('ws-exit').onclick=()=>{ lessonFlowState=null; navigate('learn'); };
  document.getElementById('play-ws').onclick=()=> MorseAudio.play(normalizeMorseForPlayback(morse), state.settings.wpmNormal);
  document.getElementById('ws-check').onclick=()=>{
    const val = document.getElementById('ws-answer').value.trim().toUpperCase();
    const correct = val === word;
    const res = document.getElementById('ws-result');
    res.style.color = correct? 'var(--spark)':'var(--danger)';
    res.textContent = correct? 'Correct! 🎉 +20 XP' : 'Not quite. It was: '+word;
    if (correct){ addXP(20); if (inLesson) lessonFlowState.wsCorrect++; }
    else { loseHeart(); if (inLesson) lessonFlowState.wsWrong++; }
    if (inLesson && lessonFlowState.wsCorrect >= lessonFlowState.wsGoal){
      lessonFlowState.mistakesThisLesson = lessonFlowState.wsWrong;
      lessonFlowState.correctCount = lessonFlowState.wsCorrect;
      lessonFlowState.questions = new Array(lessonFlowState.wsCorrect + lessonFlowState.wsWrong);
      setTimeout(()=>{ lessonFlowState.phase='done'; render(); }, 900);
      return;
    }
    setTimeout(()=>{
      renderWordSentencePractice._current = bank[Math.floor(Math.random()*bank.length)];
      render();
    }, 900);
  };
  document.getElementById('ws-next').onclick=()=>{
    renderWordSentencePractice._current = bank[Math.floor(Math.random()*bank.length)];
    render();
  };
  setTimeout(()=>MorseAudio.play(normalizeMorseForPlayback(morse), state.settings.wpmNormal), 300);
}

/* ============================================================
   20. PROGRESS PAGE
   ============================================================ */
function renderProgress(view){
  const learned = learnedCharsSoFar();
  const masteredCount = masteredChars().length;
  const acc = state.stats.totalAnswered? Math.round((state.stats.totalCorrect/state.stats.totalAnswered)*100) : 0;
  const strong = [...learned].filter(c=>state.mastery[c]>=80).sort((a,b)=>(state.mastery[b]||0)-(state.mastery[a]||0)).slice(0,6);
  const weak = weakChars().slice(0,6);

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <h2 style="font-size:20px;margin-bottom:12px;">Progress</h2>
    <div class="stat-grid">
      <div class="stat-box"><div class="v">${state.xp+((state.level-1)*0)}</div><div class="l">XP</div></div>
      <div class="stat-box"><div class="v">Lv${state.level}</div><div class="l">Level</div></div>
      <div class="stat-box"><div class="v">🔥${state.streak}</div><div class="l">Streak</div></div>
      <div class="stat-box"><div class="v">${acc}%</div><div class="l">Accuracy</div></div>
    </div>
    <div class="stat-grid" style="margin-top:8px;">
      <div class="stat-box"><div class="v">${state.stats.lessonsCompleted}</div><div class="l">Lessons</div></div>
      <div class="stat-box"><div class="v">${masteredCount}</div><div class="l">Mastered</div></div>
      <div class="stat-box"><div class="v">${state.stats.quizzesTaken}</div><div class="l">Quizzes</div></div>
      <div class="stat-box"><div class="v">${state.stats.bestWPM||'—'}</div><div class="l">Best WPM</div></div>
    </div>

    <div class="section-title">Strong characters</div>
    <div class="card">${strong.length? strong.map(c=>masteryBar(c)).join('') : '<div class="empty-state">Keep practicing to build mastery.</div>'}</div>

    <div class="section-title">Needs review</div>
    <div class="card">${weak.length? weak.map(c=>masteryBar(c)).join('') : '<div class="empty-state">No weak spots right now — nice!</div>'}</div>

    <div class="section-title">Achievements</div>
    <div class="ach-grid">
      ${ACHIEVEMENTS.map(a=>`
        <div class="ach-card ${state.achievements[a.id]?'':'locked'}">
          <div class="ic">${a.ic}</div><div class="t">${a.t}</div><div class="d">${a.d}</div>
        </div>`).join('')}
    </div>
  `;
  view.appendChild(wrap);
}
function masteryBar(ch){
  const m = state.mastery[ch]||0;
  return `<div style="display:flex;align-items:center;gap:10px;padding:6px 0;">
    <div class="mono" style="width:22px;font-weight:700;color:var(--accent);">${ch}</div>
    <div class="progress-track" style="flex:1;"><div class="progress-fill spark" style="width:${m}%"></div></div>
    <div class="mono" style="width:34px;text-align:right;font-size:12px;color:var(--text-dim);">${m}%</div>
  </div>`;
}

/* ============================================================
   21. PROFILE / SETTINGS
   ============================================================ */
function renderProfile(view){
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <h2 style="font-size:20px;margin-bottom:4px;">Profile</h2>
    <div class="card" style="text-align:center;margin-top:8px;">
      <div style="width:56px;height:56px;border-radius:50%;background:var(--accent-soft);color:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:22px;margin:0 auto 10px;">${(state.name||'O')[0].toUpperCase()}</div>
      <div style="font-weight:700;font-size:16px;">${escapeHtml(state.name||'Operator')}</div>
      <div style="color:var(--text-faint);font-size:12.5px;margin-top:2px;">Level ${state.level} · ${state.xp} XP</div>
    </div>

    <div class="section-title">Alphabet / Numbers / Symbols</div>
    <div class="tile-list">
      <button class="tile-row" id="go-az"><div class="ic-wrap">🔤</div><div class="txt"><div class="t">Alphabet A–Z</div><div class="d">26 letters</div></div><div class="chev">›</div></button>
      <button class="tile-row" id="go-num"><div class="ic-wrap">🔢</div><div class="txt"><div class="t">Numbers 0–9</div><div class="d">Digits</div></div><div class="chev">›</div></button>
      <button class="tile-row" id="go-sym"><div class="ic-wrap">✳️</div><div class="txt"><div class="t">Symbols</div><div class="d">Punctuation</div></div><div class="chev">›</div></button>
    </div>

    <div class="section-title">Settings</div>
    <div class="card">
      <div class="settings-item">
        <div><div class="t">Sound</div><div class="d">Play audio during lessons</div></div>
        <div class="switch ${state.settings.sound?'on':''}" id="sw-sound"><div class="knob"></div></div>
      </div>
      <div class="settings-item">
        <div><div class="t">Daily XP goal</div><div class="d">${state.dailyGoalXP} XP / day</div></div>
        <select class="sel" id="sel-goal">
          <option value="30">30</option><option value="50">50</option><option value="80">80</option><option value="120">120</option>
        </select>
      </div>
      <div class="settings-item">
        <div><div class="t">Volume</div></div>
        <input type="range" min="0" max="1" step="0.1" id="rng-vol" style="width:110px;" value="${state.settings.volume}">
      </div>
      <div class="settings-item">
        <div><div class="t">Speed presets (WPM)</div><div class="d">Slow / Normal / Fast</div></div>
        <div style="display:flex;gap:4px;">
          <input class="txt-in" id="wpm-slow" style="width:44px;text-align:center;" value="${state.settings.wpmSlow}">
          <input class="txt-in" id="wpm-normal" style="width:44px;text-align:center;" value="${state.settings.wpmNormal}">
          <input class="txt-in" id="wpm-fast" style="width:44px;text-align:center;" value="${state.settings.wpmFast}">
        </div>
      </div>
    </div>

    <div class="section-title">Data</div>
    <div class="card">
      <button class="btn btn-danger btn-block" id="reset-btn">Reset Learning Progress</button>
    </div>
  `;
  view.appendChild(wrap);
  document.getElementById('go-az').onclick=()=> renderCharSection('az');
  document.getElementById('go-num').onclick=()=> renderCharSection('num');
  document.getElementById('go-sym').onclick=()=> renderCharSection('sym');
  document.getElementById('sw-sound').onclick=(e)=>{ state.settings.sound=!state.settings.sound; saveState(); render(); };
  document.getElementById('sel-goal').value = state.dailyGoalXP;
  document.getElementById('sel-goal').onchange=(e)=>{ state.dailyGoalXP=parseInt(e.target.value); saveState(); };
  document.getElementById('rng-vol').oninput=(e)=>{ state.settings.volume=parseFloat(e.target.value); saveState(); };
  ['wpm-slow','wpm-normal','wpm-fast'].forEach((id,i)=>{
    const keys=['wpmSlow','wpmNormal','wpmFast'];
    document.getElementById(id).onchange=(e)=>{ const v=parseInt(e.target.value)||10; state.settings[keys[i]]=v; saveState(); };
  });
  document.getElementById('reset-btn').onclick=()=> openResetModal();
}
function renderCharSection(which){
  const view = document.getElementById('view');
  view.innerHTML='';
  const back = document.createElement('button');
  back.className='btn btn-ghost btn-sm'; back.textContent='← Back'; back.style.marginBottom='10px';
  back.onclick=()=>{ navigate('profile'); };
  view.appendChild(back);
  if (which==='az') renderCharGrid(view, 'Alphabet A–Z', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), 'profile');
  if (which==='num') renderCharGrid(view, 'Numbers 0–9', '0123456789'.split(''), 'profile');
  if (which==='sym') renderCharGrid(view, 'Symbols', Object.keys(CHAR_NAMES), 'profile');
}

function openResetModal(){
  const bd = document.createElement('div');
  bd.className='modal-backdrop';
  bd.innerHTML = `<div class="modal-card">
    <h3 style="font-size:17px;margin-bottom:8px;">Reset all progress?</h3>
    <p style="color:var(--text-dim);font-size:13.5px;margin-bottom:18px;">This deletes your XP, streak, mastery, and lesson progress. This cannot be undone.</p>
    <div style="display:flex;gap:10px;">
      <button class="btn btn-ghost btn-block" id="rm-cancel">Cancel</button>
      <button class="btn btn-danger btn-block" id="rm-confirm">Delete everything</button>
    </div>
  </div>`;
  document.body.appendChild(bd);
  document.getElementById('rm-cancel').onclick=()=>bd.remove();
  document.getElementById('rm-confirm').onclick=()=>{
    localStorage.removeItem(STORAGE_KEY);
    state = defaultState();
    bd.remove();
    navigate('home');
    showToast('Progress reset');
  };
}

/* ============================================================
   22. BOOT
   ============================================================ */
render();