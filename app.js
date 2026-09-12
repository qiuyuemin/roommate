/* Let the page background extend behind the iOS status bar. The 402px design
   already reserves its own top safe spacing for the header controls. */
const viewportMeta = document.querySelector('meta[name="viewport"]');
if (viewportMeta) viewportMeta.content = 'width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover';
let themeMeta = document.querySelector('meta[name="theme-color"]');
if (!themeMeta) {
  themeMeta = document.createElement('meta');
  themeMeta.name = 'theme-color';
  document.head.appendChild(themeMeta);
}
themeMeta.content = '#f9f7f5';
let appleStatusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
if (!appleStatusMeta) {
  appleStatusMeta = document.createElement('meta');
  appleStatusMeta.name = 'apple-mobile-web-app-status-bar-style';
  document.head.appendChild(appleStatusMeta);
}
appleStatusMeta.content = 'black-translucent';

const root = document.querySelector('#demo');

const state = {
  page: 'device',
  modal: null,
  mode: 'stimulation',
  auto: false,
  running: false,
  paused: false,
  levelL: 2,
  levelR: 4,
  speed: 5,
  both: false,
  timer: 0,
  milkL: 0,
  milkR: 0,
  selectedProgram: null,
  programExpanded: true,
  fitStep: 0,
};

let holdTimer = null;
let fitTimer = null;
const fmt = n => String(n).padStart(2, '0');
const time = n => `${fmt(Math.floor(n / 60))}:${fmt(n % 60)}`;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

function status() { return `<div class="status"><span>9:41</span><i>▮▮▮ ◔ ▰</i></div>`; }
function backButton(action = 'back') { return `<button class="circle-btn" data-action="${action}" aria-label="Back"><img src="./assets/figma/back.svg" alt=""></button>`; }
function pump(side, amount = null) {
  return `<div class="pump ${side}"><div class="pump-image"><img src="./assets/figma-v2/home-pumps.png" alt="Air2 ${side === 'r' ? 'right' : 'left'} pump"></div>${amount !== null ? `<span class="oz">${amount.toFixed(1)} oz</span>` : ''}</div>`;
}
function nav(active) {
  return `<nav class="bottom-tabs" aria-label="Main navigation">
    <button data-action="home" class="${active === 'home' ? 'active' : ''}"><span>⌂</span>Home</button>
    <button data-action="device" class="${active === 'device' ? 'active' : ''}"><span>⬡</span>Device</button>
    <button data-action="community"><span>◔</span>Community</button>
    <button data-action="me"><span>♙</span>Me</button>
  </nav>`;
}
function deviceScreen() {
  return `<section class="screen device">${status()}
    <header class="top device-title"><h1>My Device</h1><button class="circle-btn" data-action="add" aria-label="Add device">+</button></header>
    <button class="device-card" data-action="home" aria-label="Open Breast Pump">
      <span class="device-card-info"><i class="round-brand">◉</i><span><strong>Breast Pump</strong><small>Air 2 <b>L 80</b><b>R 75</b></small></span></span><i class="arrow">›</i>
      <h2>No breast feeding<br>record available</h2><img class="device-illustration" src="./assets/figma-v2/device-card-illustration.svg" alt="">
    </button>
    <img class="device-line" src="./assets/figma-v2/device-page-line.svg" alt="">${nav('device')}
  </section>`;
}
function homeScreen() {
  return `<section class="screen home">${status()}<header class="top">${backButton('device')}<h1>Breast Pump</h1><span></span></header>
    <main class="home-cards"><section class="home-card trend"><div class="home-card-title"><span><b class="accent">⌁</b>Pumping Trend</span><button data-action="trend">›</button></div><div class="trend-empty">No pumping volume trend available<small>Start record to generate chart.</small></div></section>
      <section class="home-card lactation"><div class="home-card-title"><span><b class="accent">✦</b>Lactation</span><button class="add" data-action="plan">＋ Add Plan</button></div><small style="color:#8d7f86;font-size:12px">Free AI-based plan from data and needs.</small><img class="home-illustration" src="./assets/figma-v2/home-illustration.svg" alt=""><div class="record-empty">No breast feeding record available</div><button class="record-pill" data-action="record">Record</button></section></main>
    <section class="home-dock"><div class="dock-row"><div class="dock-pumps"><i class="mini"><img src="./assets/figma-v2/home-pumps.png" alt=""></i><i class="mini right"><img src="./assets/figma-v2/home-pumps.png" alt=""></i></div><span><b>Air 2</b><small>L　80　 R　75</small></span><button class="go" data-action="control">›</button></div><div class="dock-rule"></div><div class="dock-mode"><span>♡</span>Stimulation <button class="dock-play" data-action="control">▶</button></div></section>
  </section>`;
}
function modeTab(key, label, file) { return `<button class="${state.mode === key ? 'active' : ''}" data-action="mode" data-mode="${key}"><img src="${file}" alt="">${label}</button>`; }
function track(side, level) {
  const top = 134 - (level - 1) * 20;
  return `<section class="level"><label>${side.toUpperCase()} Level</label><div class="level-track"><span class="tick-list">${'<i></i>'.repeat(6)}</span><button class="level-button" data-action="level" data-side="${side}" style="top:${top}px">${level}</button></div></section>`;
}
function controlScreen() {
  const l = state.milkL, r = state.milkR;
  const isRunning = state.running && !state.paused;
  const manualTitle = state.selectedProgram || (state.mode === 'expression' ? 'Expression' : state.mode === 'mixed' ? 'Mixed' : 'Stimulation');
  return `<section class="screen control ${isRunning ? 'is-running' : ''}"><img class="control-bg" src="./assets/figma-v2/control-bg.svg" alt="">${status()}
    <header class="top">${backButton('home')}<h1>Pump Control</h1><button class="circle-btn" data-action="settings"><img src="./assets/figma/settings.svg" alt="Settings"></button></header>
    <div class="session-readout">${time(state.timer)}</div><div class="pump-row">${pump('l', l)}${pump('r', r)}</div>
    <main class="control-main"><section class="mode-panel"><div class="mode-heading"><button data-action="list">${manualTitle}${isRunning ? `<span class="duration">${time(state.timer)}</span>` : ''}</button><img src="./assets/figma-v2/icon-chevron.svg" alt=""></div>
      <div class="mode-tabs">${modeTab('stimulation','Stimulation','./assets/figma-v2/icon-stimulation.svg')}${modeTab('expression','Expression','./assets/figma-v2/icon-expression.svg')}${modeTab('mixed','Mixed','./assets/figma-v2/icon-mixed.svg')}</div>
      <div class="auto-line">Auto Switch <button class="switch ${state.auto ? 'on' : ''}" data-action="auto" role="switch" aria-checked="${state.auto}"><i></i></button></div>
    </section><section class="level-panel">${track('l', state.levelL)}<section class="both"><label>↔　Both</label><div class="both-track"><span class="both-lines">${'<i></i>'.repeat(7)}</span><button class="both-toggle" data-action="both">⌃<br>⌄</button></div></section>${track('r',state.levelR)}</section>
      <section class="speed-panel"><h2>Speed</h2><div class="speeds">${[1,2,3,4,5].map(n => `<button class="${state.speed === n ? 'active' : ''}" data-action="speed" data-speed="${n}">${n}</button>`).join('')}</div></section>
    </main>${isRunning ? `<div class="finish-row"><button class="finish" data-action="finish">■　Hold to Finish</button><button class="pause" data-action="pause">Ⅱ</button></div>` : `<button class="primary" data-action="start">Start Pumping</button>`}<i class="home-indicator"></i>
  </section>`;
}
function listScreen() {
  const manual = `<button class="program ${!state.selectedProgram && state.mode === 'stimulation' ? 'selected' : ''}" data-action="manual" data-mode="stimulation"><span class="symbol">♡</span><span class="copy"><b>Stimulation</b><small>Gentle and comfortable</small></span><i class="play">▶</i></button><button class="program ${!state.selectedProgram && state.mode === 'expression' ? 'selected' : ''}" data-action="manual" data-mode="expression"><span class="symbol">♨</span><span class="copy"><b>Expression <em class="duration">02:01</em></b><small>Fast-paced and intense</small></span><i class="signal">〽</i></button>`;
  return `<section class="screen list">${status()}<header class="top"><button class="circle-btn close" data-action="control">×</button><span></span></header><h1>List</h1><div class="list-auto">Auto Switch <button class="switch on" data-action="auto"><i></i></button></div>
    <main class="list-section"><p class="section-label">Manual</p>${manual}<button class="create" data-action="create">＋ Create</button></main>
    <main class="list-section programs"><p class="section-label">Programs</p><button class="program" data-action="program" data-program="Cozy Flow"><span class="copy"><b>Cozy Flow <em class="duration">21:30</em></b></span><i class="play">▶</i></button><button class="program expanded" data-action="program" data-program="Milk Boost"><span class="top-row"><span class="copy"><b>Milk Boost <em class="duration">20:00</em></b><small>Most suitable for daily use after successful<br>lactation</small></span><i class="play">▶</i></span><span class="program-bar"><i></i></span><span class="legend"><span>Stimulate</span><span>Expression</span><b>?</b></span></button><button class="program" data-action="program" data-program="Power Pumping"><span class="copy"><b>Power Pumping <em class="duration">45:00</em></b></span><i class="play">▶</i></button></main>
  </section>`;
}
function fitOverlay() {
  const posture = state.fitStep > 0;
  const alignment = state.fitStep > 1;
  return `<div class="overlay"><section class="fit-card ${alignment ? 'ready' : ''}"><h2>Fit Check</h2><div class="check-chips"><span class="chip"><b>${posture ? '✓' : '•'}</b>posture</span><span class="chip ${alignment ? '' : 'pending'}"><b>${alignment ? '✓' : '•'}</b>alignment</span></div><p class="fit-copy">${alignment ? 'Perfect fit detected. Starting your pumping session.' : 'Almost there. Follow the on-screen guide to<br>make a small adjustment.'}</p><div class="fit-pumps"><div class="fit-unit">${pump('l')}<p>L <b>${posture ? '✓' : '…'}</b></p></div><div class="fit-unit r">${pump('r')}<i class="fit-guide"></i><p>R <b>${alignment ? '✓' : '…'}</b></p></div></div></section></div>`;
}
function confirmOverlay() { return `<div class="overlay"><section class="confirm"><h2>Switch to Program?</h2><p>The timer will reset.</p><button data-action="confirm">Confirm Switch</button><button data-action="cancel">Not Now</button></section></div>`; }
function logOverlay() {
  const l = state.milkL || 7.1, r = state.milkR || 7.1;
  return `<div class="overlay"><section class="log-sheet"><button class="circle-btn sheet-close" data-action="control">×</button><h1>Log Pumping Amount</h1><p class="log-date">Apr 1, 9:41 AM</p><div class="amounts"><div class="vessel-wrap"><div class="vessel"><i class="milk-fill"></i><button class="updown" data-action="milk" data-side="l">⌃<br>⌄</button></div><p class="amount-number">${l.toFixed(1)}<small>oz</small></p></div><div class="measure"><b>10 oz</b>${'<i></i>'.repeat(10)}<b>0</b></div><div class="vessel-wrap"><div class="vessel"><i class="milk-fill"></i><button class="updown" data-action="milk" data-side="r">⌃<br>⌄</button></div><p class="amount-number">${r.toFixed(1)}<small>oz</small></p></div></div><button class="duration-row" data-action="duration"><span>Duration</span><b>20 min　⌄</b></button><button class="primary save" data-action="save">Save</button></section></div>`;
}
function loggedOverlay() { return `<div class="overlay"><section class="logged-sheet"><img class="bunny-img" src="./assets/figma-v2/bunny-a.png" alt=""><h1>Logged</h1><p>Today's data has been updated.<br>Every little change means the baby is quietly growing.</p><i class="home-indicator"></i></section></div>`; }
function view() {
  const page = state.page === 'device' ? deviceScreen() : state.page === 'home' ? homeScreen() : state.page === 'list' ? listScreen() : controlScreen();
  root.innerHTML = page + (state.modal === 'fit' ? fitOverlay() : state.modal === 'confirm' ? confirmOverlay() : state.modal === 'log' ? logOverlay() : state.modal === 'logged' ? loggedOverlay() : '');
}
function startFit() {
  state.modal = 'fit'; state.fitStep = 0; view(); clearTimeout(fitTimer);
  fitTimer = setTimeout(() => { state.fitStep = 1; view(); fitTimer = setTimeout(() => { state.fitStep = 2; view(); fitTimer = setTimeout(() => { state.modal = null; state.running = true; state.paused = false; view(); }, 700); }, 720); }, 700);
}
function applyProgram() { state.modal = null; state.page = 'control'; state.selectedProgram = 'Milk Boost'; state.mode = 'stimulation'; state.auto = true; state.timer = 0; state.running = true; state.paused = false; view(); }
function holdFinish(button) { if (holdTimer) return; button.classList.add('holding'); holdTimer = setTimeout(() => { holdTimer = null; state.running = false; state.modal = 'log'; view(); }, 900); }
function cancelHold() { if (!holdTimer) return; clearTimeout(holdTimer); holdTimer = null; const b = root.querySelector('.finish'); if (b) b.classList.remove('holding'); }

root.addEventListener('pointerdown', event => { const finish = event.target.closest('[data-action="finish"]'); if (finish) { event.preventDefault(); holdFinish(finish); } });
root.addEventListener('pointerup', cancelHold); root.addEventListener('pointercancel', cancelHold); root.addEventListener('pointerleave', event => { if (event.target.closest('.finish')) cancelHold(); });
root.addEventListener('click', event => {
  const b = event.target.closest('[data-action]'); if (!b || b.dataset.action === 'finish') return; const action = b.dataset.action;
  if (action === 'device') { state.page = 'device'; state.modal = null; }
  if (action === 'home') { state.page = 'home'; state.modal = null; }
  if (action === 'control') { state.page = 'control'; state.modal = null; }
  if (action === 'start') { startFit(); return; }
  if (action === 'mode') { state.mode = b.dataset.mode; state.selectedProgram = null; }
  if (action === 'auto') state.auto = !state.auto;
  if (action === 'both') state.both = !state.both;
  if (action === 'level') { const key = b.dataset.side === 'l' ? 'levelL' : 'levelR'; state[key] = state[key] === 9 ? 1 : state[key] + 1; if (state.both) state[key === 'levelL' ? 'levelR' : 'levelL'] = state[key]; }
  if (action === 'speed') state.speed = Number(b.dataset.speed);
  if (action === 'pause') state.paused = !state.paused;
  if (action === 'list') state.page = 'list';
  if (action === 'manual') { state.mode = b.dataset.mode; state.selectedProgram = null; state.page = 'control'; }
  if (action === 'program') { if (b.dataset.program === 'Milk Boost') state.modal = 'confirm'; }
  if (action === 'confirm') { applyProgram(); return; }
  if (action === 'cancel') state.modal = null;
  if (action === 'milk') { const key = b.dataset.side === 'l' ? 'milkL' : 'milkR'; state[key] = +(Math.max(7.1, state[key]) + .1).toFixed(1); }
  if (action === 'save') { state.modal = 'logged'; setTimeout(() => { if (state.modal === 'logged') { state.modal = null; state.page = 'home'; view(); } }, 3300); }
  view();
});
setInterval(() => { if (!state.running || state.paused) return; state.timer += 1; view(); }, 1000);
view();
