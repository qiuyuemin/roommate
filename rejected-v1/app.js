const app = document.querySelector('#app');
const reviewToolbar = document.querySelector('#review-toolbar');
const annotationEditor = document.querySelector('#annotation-editor');
const annotationText = document.querySelector('#annotation-text');

const state = {
  page: 'device',
  mode: 'stimulation',
  auto: false,
  pumping: false,
  program: null,
  lLevel: 2,
  rLevel: 4,
  speed: 5,
  both: true,
  timer: 0,
  lMilk: 0,
  rMilk: 0,
  modal: null,
  fitIndex: 0,
  listExpanded: null,
  toast: '',
  customPrograms: [],
  draft: { name: '', mode: 'Stimulation', level: 3, auto: false },
};

const reviews = JSON.parse(localStorage.getItem('air2-review-notes') || '[]');
let reviewMode = new URLSearchParams(location.search).get('review') === '1';
let marking = false;
let annotationPoint = null;
let holdTimer = null;
let toastTimer = null;

const MODE_NAMES = { stimulation: 'Stimulation', expression: 'Expression', mixed: 'Mixed' };
const formatTime = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const roundMilk = value => Math.round(value * 10) / 10;
const escapeHTML = value => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

function setToast(message, duration = 3200) {
  state.toast = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { state.toast = ''; render(); }, duration);
}

function statusBar() {
  return `<div class="statusbar"><span>9:41</span><span class="status-icons">▮▮▮ ◖ 100</span></div>`;
}

function bottomTabs(active) {
  return `<nav class="tabbar" aria-label="Main navigation">
    <button class="${active === 'device' ? 'active' : ''}" data-action="page-device"><span>⌂</span>My Device</button>
    <button class="${active === 'home' ? 'active' : ''}" data-action="page-home"><span>◌</span>Explore</button>
    <button data-action="show-toast" data-message="Messages are up to date"><span>⌕</span>Record</button>
    <button data-action="show-toast" data-message="Profile panel"><span>◯</span>Me</button>
  </nav>`;
}

function devicePage() {
  return `<section class="page device-page">${statusBar()}
    <div class="title-row"><h1>My Device</h1><button class="glass-button" data-action="show-toast" data-message="Add a device">+</button></div>
    <button class="device-card" data-action="page-home" aria-label="Open Air2 breast pump">
      <div class="device-card-head"><span class="device-dot">⌁</span><span><strong>Breast Pump</strong><small>Air2 <b class="battery">100%</b></small></span></div>
      <p class="device-card-copy">You have a little bunny<br>that loves you!</p>
      <span class="device-glow"></span><span class="device-drawing">Air<br><b>2</b></span>
      <div class="device-stage"><span class="mini-pump left">◒</span><span class="mini-pump right">◒</span><span>L&nbsp; ${state.lMilk ? state.lMilk.toFixed(1) : '8.0'} oz&nbsp;&nbsp; R&nbsp; ${state.rMilk ? state.rMilk.toFixed(1) : '7.5'} oz</span></div>
    </button>
    <section class="lactation-card"><h2>Lactation Period</h2><div class="lactation-body"><span class="lactation-icon">◔</span><p>No breast feeding record<br><small>Start your breastfeeding journey</small></p><button data-action="page-home">Go</button></div></section>
    ${bottomTabs('device')}
  </section>`;
}

function homePage() {
  const values = [24, 40, 33, 58, 45, 65, 56];
  return `<section class="page home-page">${statusBar()}
    <div class="title-row"><h1>Breast Pump</h1><button class="glass-button" data-action="show-toast" data-message="More devices">⌄</button></div>
    <section class="home-hero"><div><p>Hi, Mom</p><h2>Ready when you are.</h2><small>Air2 is connected and ready</small></div><span class="hero-ring">◒</span></section>
    <section class="trend-card"><div class="row-title"><span><b>Pumping Trend</b><small>Last 7 days</small></span><button data-action="show-toast" data-message="Pumping Trend">•••</button></div><div class="trend-graph">${values.map((v, i) => `<i style="height:${v}%"><em>${i + 12}</em></i>`).join('')}</div><div class="legend"><span><i></i>Left</span><span><i></i>Right</span><b>${state.lMilk + state.rMilk ? (state.lMilk + state.rMilk).toFixed(1) : '15.5'} oz</b></div></section>
    <section class="lactation-card home-lactation"><h2>Lactation</h2><div class="lactation-body"><span class="lactation-icon">♡</span><p>Breastfeeding is a journey<br><small>Track your comfort and progress</small></p><button data-action="show-toast" data-message="Lactation details">Go</button></div></section>
    <div class="control-dock"><button class="dock-device" data-action="page-device"><b>◒</b><span>Air2</span></button><button class="dock-control" data-action="page-control"><img src="./assets/figma/stimulation.svg" alt=""><span>Stimulation</span></button><button class="play-bubble" data-action="page-control" aria-label="Start pumping">▶</button></div>
    ${bottomTabs('home')}
  </section>`;
}

function pumpImage(side) {
  return `<div class="pump-wrap ${side}"><img class="pump-sprite" src="./assets/figma/air2-pumps.png" alt="Air2 breast pump"></div>`;
}

function modeTab(key) {
  return `<button class="${state.mode === key ? 'active' : ''}" data-action="mode" data-mode="${key}">${MODE_NAMES[key]}</button>`;
}

function levelControl(side) {
  const value = side === 'l' ? state.lLevel : state.rLevel;
  const label = side === 'l' ? 'L' : 'R';
  return `<div class="level-control"><span class="level-label">${label}</span><button data-action="level" data-side="${side}" data-delta="1" aria-label="Increase ${label} level">+</button><span class="level-number">${value}</span><button data-action="level" data-side="${side}" data-delta="-1" aria-label="Decrease ${label} level">−</button></div>`;
}

function controlPage() {
  const runningClass = state.pumping ? 'running' : '';
  const actionText = state.pumping ? 'Hold to Finish' : 'Start Pumping';
  const descriptor = state.program ? state.program : state.auto ? `Auto · ${MODE_NAMES[state.mode]}` : MODE_NAMES[state.mode];
  return `<section class="page control-page ${runningClass}">${statusBar()}
    <header class="topbar"><button class="icon-btn" data-action="page-home" aria-label="Back"><img src="./assets/figma/back.svg" alt=""></button><h1>Pump Control</h1><button class="icon-btn" data-action="settings" aria-label="Settings"><img src="./assets/figma/settings.svg" alt=""></button></header>
    <div class="program-bar"><button data-action="program-list"><span>${state.program ? 'Program' : 'Manual'}</span><b>${escapeHTML(descriptor)}</b><i>⌄</i></button><span class="program-time">${state.pumping ? formatTime(state.timer) : '00:00'}</span></div>
    <div class="pump-pair ${state.pumping ? 'pumping' : ''}">${pumpImage('left')}${pumpImage('right')}<span class="pulse-ring a"></span><span class="pulse-ring b"></span></div>
    <section class="mode-card"><div class="mode-main"><img src="./assets/figma/stimulation.svg" alt=""><div><b>${MODE_NAMES[state.mode]}</b><small>${state.mode === 'stimulation' ? 'Short, quick rhythms to start let-down' : state.mode === 'expression' ? 'A steady rhythm for milk flow' : 'Balanced stimulation and expression'}</small></div></div>
      <div class="mode-tabs">${modeTab('stimulation')}${modeTab('expression')}${modeTab('mixed')}</div></section>
    <div class="auto-row"><span><b>Auto Switch</b><small>Switch modes when let-down is detected</small></span><button class="switch ${state.auto ? 'on' : ''}" data-action="auto" role="switch" aria-checked="${state.auto}"><i></i></button></div>
    <section class="controls-card"><div class="level-grid">${levelControl('l')}<button class="both-control ${state.both ? 'active' : ''}" data-action="both"><span>↔</span><small>Both</small></button>${levelControl('r')}</div>
      <section class="speed-card"><span><b>Speed</b><small>Find your comfortable rhythm</small></span><div class="speed-options">${[1,2,3,4,5].map(value => `<button class="${value === state.speed ? 'active' : ''}" data-action="speed" data-value="${value}">${value}</button>`).join('')}</div></section></section>
    <div class="control-actions">${state.pumping ? '<button class="pause-btn" data-action="pause">Ⅱ</button>' : ''}<button class="primary-action ${state.pumping ? 'finish' : ''}" data-action="${state.pumping ? 'hold-finish' : 'start'}"><span>${actionText}</span><i class="hold-progress"></i></button></div>
    ${bottomTabs('')}
  </section>`;
}

function programRows() {
  const preset = [
    ['Stimulation', 'A gentle start to help initiate let-down', 'stimulation'],
    ['Expression', 'A steady rhythm for collecting milk', 'expression'],
  ];
  const programs = [
    ['Cozy Flow', 'A calm, gentle rhythm for daily sessions'],
    ['Milk Boost', 'A focused program to encourage milk flow'],
    ['Power Pumping', 'Alternating stages to mimic cluster feeding'],
    ...state.customPrograms.map(program => [program.name, `${program.mode} · Level ${program.level}`, 'custom']),
  ];
  const manual = preset.map(([name, copy, mode]) => `<button class="program-row ${!state.program && state.mode === mode ? 'selected' : ''}" data-action="select-manual" data-mode="${mode}"><span class="tab-icon">${mode === 'stimulation' ? '⌁' : '⌇'}</span><span><b>${name}</b><small>${copy}</small></span><i>›</i></button>`).join('');
  const list = programs.map(([name, copy, type]) => {
    const expanded = state.listExpanded === name;
    return `<div class="program-item ${expanded ? 'expanded' : ''}"><button class="program-row ${state.program === name ? 'selected' : ''}" data-action="expand-program" data-program="${escapeHTML(name)}"><span class="tab-icon">${name === 'Milk Boost' ? '✦' : '◌'}</span><span><b>${escapeHTML(name)}</b><small>${escapeHTML(copy)}</small></span><i>${expanded ? '⌃' : '⌄'}</i></button>${expanded ? `<div class="expanded-copy"><p>${name === 'Milk Boost' ? 'Start with stimulation, then let Air2 move into expression mode as your flow begins.' : 'Use this preset whenever it feels right for you.'}</p><button class="play-small" data-action="choose-program" data-program="${escapeHTML(name)}">Choose ${escapeHTML(name)} <b>▶</b></button></div>` : ''}</div>`;
  }).join('');
  return `<div class="program-group-title">Manual</div>${manual}<div class="program-group-title">Programs</div>${list}<button class="create-link" data-action="create-program">＋ Create your own program</button>`;
}

function programSheet() {
  return `<div class="overlay" data-action="dismiss-modal"><section class="sheet program-sheet" role="dialog" aria-label="Programs" onclick="event.stopPropagation()"><div class="sheet-header"><button class="close-sheet" data-action="dismiss-modal">×</button><h2>List</h2><span></span></div><div class="program-auto"><span><b>Auto Switch</b><small>Use detection to switch modes</small></span><button class="switch ${state.auto ? 'on' : ''}" data-action="auto"><i></i></button></div>${programRows()}</section></div>`;
}

function switchDialog() {
  return `<div class="overlay" data-action="dismiss-modal"><section class="dialog" role="dialog" aria-label="Switch program" onclick="event.stopPropagation()"><div class="dialog-icon">↺</div><h2>Switch to ${escapeHTML(state.pendingProgram || 'this program')}?</h2><p>The timer will reset. Your current settings will be replaced by this program.</p><button class="primary-action" data-action="confirm-program">Confirm Switch</button><button class="secondary-action" data-action="dismiss-modal">Not Now</button></section></div>`;
}

function fitCheck() {
  const checks = [
    ['Position', 'Breast pump is positioned comfortably', '◒'],
    ['Alignment', 'Nipple is centered in the flange', '◎'],
    ['Suction', 'A comfortable seal has been detected', '◌'],
    ['Battery', 'Both pumps are ready to begin', '▰'],
  ];
  const passed = state.fitIndex >= checks.length;
  return `<div class="overlay"><section class="sheet fit-sheet" role="dialog" aria-label="Fit Check"><div class="sheet-header"><button class="close-sheet" data-action="cancel-fit">×</button><h2>Fit Check</h2><span></span></div><div class="fit-pumps">${pumpImage('left')}${pumpImage('right')}</div><p class="fit-copy">${passed ? 'Everything looks great. Let’s start your session.' : 'Checking your fit before we begin…'}</p><div class="fit-checks">${checks.map(([title, copy, icon], index) => `<div class="fit-check ${index < state.fitIndex ? 'active' : index === state.fitIndex ? 'pending' : ''}"><span>${index < state.fitIndex ? '✓' : icon}</span><p><b>${title}</b><small>${index < state.fitIndex ? copy : index === state.fitIndex ? 'Checking…' : 'Waiting to check'}</small></p><i>${index < state.fitIndex ? '✓' : ''}</i></div>`).join('')}</div>${passed ? `<button class="primary-action" data-action="complete-fit">Start Pumping</button>` : '<div class="fit-progress"><i style="width:' + (state.fitIndex / checks.length * 100) + '%"></i></div>'}</section></div>`;
}

function logSheet() {
  const left = Math.max(state.lMilk, 2.4);
  const right = Math.max(state.rMilk, 2.1);
  return `<div class="overlay"><section class="sheet log-sheet" role="dialog" aria-label="Log pumping amount"><div class="sheet-header"><button class="close-sheet" data-action="dismiss-modal">×</button><h2>Log Pumping Amount</h2><span></span></div><p class="date">Today, ${new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date())}</p><div class="amount-grid"><div class="amount-card"><div class="amount-vessel"><i class="amount-fill" style="height:${clamp(left * 9, 20, 92)}%"></i><button class="amount-control" data-action="adjust-milk" data-side="l">+</button></div><p class="amount-value">${left.toFixed(1)} <small>oz</small></p></div><span class="milk-value">+</span><div class="amount-card"><div class="amount-vessel"><i class="amount-fill" style="height:${clamp(right * 9, 20, 92)}%"></i><button class="amount-control" data-action="adjust-milk" data-side="r">+</button></div><p class="amount-value">${right.toFixed(1)} <small>oz</small></p></div></div><button class="duration-select" data-action="cycle-duration"><span>Duration</span><b>${formatTime(state.timer || 1200)} ›</b></button><button class="primary-action" data-action="save-log">Save</button></section></div>`;
}

function loggedSheet() {
  const total = state.lMilk + state.rMilk;
  return `<div class="overlay"><section class="logged-sheet" role="dialog" aria-label="Pumping recorded"><div class="bunny">◡͜◡</div><h2>Logged</h2><p>${total ? `${total.toFixed(1)} oz was added to today’s record.` : 'Your pumping record has been added. You’re doing amazing.'}</p><button class="primary-action" data-action="close-logged">Done</button></section></div>`;
}

function settingsSheet() {
  return `<div class="overlay" data-action="dismiss-modal"><section class="sheet settings-sheet" role="dialog" onclick="event.stopPropagation()"><div class="sheet-header"><button class="close-sheet" data-action="dismiss-modal">×</button><h2>Pump Settings</h2><span></span></div><button class="program-row" data-action="show-toast" data-message="Firmware is up to date"><span class="tab-icon">◒</span><span><b>Device status</b><small>Air2 is connected · Battery 100%</small></span><i>›</i></button><button class="program-row" data-action="show-toast" data-message="Session reminder changed"><span class="tab-icon">◷</span><span><b>Session reminder</b><small>Notify me after 20 minutes</small></span><i>›</i></button><button class="program-row" data-action="show-toast" data-message="Sound preference changed"><span class="tab-icon">♬</span><span><b>Sound</b><small>Gentle chime</small></span><i>›</i></button></section></div>`;
}

function createProgramSheet() {
  return `<div class="overlay"><section class="sheet create-sheet" role="dialog"><div class="sheet-header"><button class="close-sheet" data-action="dismiss-modal">×</button><h2>New Program</h2><span></span></div><label>Program name<input data-field="name" value="${escapeHTML(state.draft.name)}" placeholder="e.g. Evening comfort"></label><label>Mode<select data-field="mode"><option ${state.draft.mode === 'Stimulation' ? 'selected' : ''}>Stimulation</option><option ${state.draft.mode === 'Expression' ? 'selected' : ''}>Expression</option><option ${state.draft.mode === 'Mixed' ? 'selected' : ''}>Mixed</option></select></label><label>Comfort level<div class="draft-level"><button data-action="draft-level" data-delta="-1">−</button><b>${state.draft.level}</b><button data-action="draft-level" data-delta="1">+</button></div></label><div class="auto-row"><span><b>Auto Switch</b><small>Enable automatic mode switching</small></span><button class="switch ${state.draft.auto ? 'on' : ''}" data-action="draft-auto"><i></i></button></div><button class="primary-action" data-action="save-program">Save Program</button></section></div>`;
}

function modalView() {
  if (state.modal === 'list') return programSheet();
  if (state.modal === 'confirm') return switchDialog();
  if (state.modal === 'fit') return fitCheck();
  if (state.modal === 'log') return logSheet();
  if (state.modal === 'logged') return loggedSheet();
  if (state.modal === 'settings') return settingsSheet();
  if (state.modal === 'create') return createProgramSheet();
  return '';
}

function annotationView() {
  if (!reviewMode) return '';
  const pins = reviews.filter(note => note.page === state.page && note.modal === state.modal).map((note, index) => `<span class="annotation-pin" style="left:${note.x}%;top:${note.y}%" title="${escapeHTML(note.note)}">${index + 1}</span>`).join('');
  return `${marking ? '<div class="annotation-layer" aria-label="Mark screen"></div>' : ''}${pins}`;
}

function render() {
  const page = state.page === 'device' ? devicePage() : state.page === 'home' ? homePage() : controlPage();
  app.innerHTML = `${page}${modalView()}${state.toast ? `<div class="toast">${escapeHTML(state.toast)}</div>` : ''}${annotationView()}`;
  reviewToolbar.hidden = !reviewMode;
  document.querySelector('#mark-toggle').classList.toggle('active', marking);
  document.querySelector('#mark-toggle').textContent = marking ? 'Tap screen to mark' : 'Mark screen';
}

function startPumping() {
  state.modal = null;
  state.pumping = true;
  state.timer = state.timer || 0;
  state.lMilk = Math.max(state.lMilk, 0.2);
  state.rMilk = Math.max(state.rMilk, 0.2);
  setToast('Pumping started. You’re all set.', 2200);
  render();
}

function chooseProgram(program) {
  state.pendingProgram = program;
  state.modal = 'confirm';
  render();
}

function confirmProgram() {
  const name = state.pendingProgram;
  state.program = name;
  state.timer = 0;
  state.mode = 'stimulation';
  state.auto = true;
  state.pumping = true;
  state.modal = null;
  state.listExpanded = null;
  setToast(`${name} is now running.`, 2400);
  render();
}

function handleAction(button) {
  const action = button.dataset.action;
  if (!action) return;
  if (action === 'page-device') { state.page = 'device'; state.modal = null; }
  if (action === 'page-home') { state.page = 'home'; state.modal = null; }
  if (action === 'page-control') { state.page = 'control'; state.modal = null; }
  if (action === 'show-toast') setToast(button.dataset.message || 'Done');
  if (action === 'mode') { state.mode = button.dataset.mode; state.program = null; }
  if (action === 'auto') state.auto = !state.auto;
  if (action === 'both') state.both = !state.both;
  if (action === 'level') {
    const delta = Number(button.dataset.delta);
    const key = button.dataset.side === 'l' ? 'lLevel' : 'rLevel';
    state[key] = clamp(state[key] + delta, 1, 9);
    if (state.both) state[button.dataset.side === 'l' ? 'rLevel' : 'lLevel'] = state[key];
  }
  if (action === 'speed') state.speed = Number(button.dataset.value);
  if (action === 'start') { state.modal = 'fit'; state.fitIndex = 0; render(); runFitCheck(); return; }
  if (action === 'pause') { state.pumping = false; setToast('Pumping paused'); }
  if (action === 'hold-finish') beginHold(button);
  if (action === 'program-list') state.modal = 'list';
  if (action === 'settings') state.modal = 'settings';
  if (action === 'dismiss-modal' || action === 'cancel-fit') state.modal = null;
  if (action === 'select-manual') { state.mode = button.dataset.mode; state.program = null; state.modal = null; }
  if (action === 'expand-program') state.listExpanded = state.listExpanded === button.dataset.program ? null : button.dataset.program;
  if (action === 'choose-program') { chooseProgram(button.dataset.program); return; }
  if (action === 'confirm-program') { confirmProgram(); return; }
  if (action === 'complete-fit') { startPumping(); return; }
  if (action === 'adjust-milk') { const key = button.dataset.side === 'l' ? 'lMilk' : 'rMilk'; state[key] = roundMilk(Math.max(state[key], 2) + .1); }
  if (action === 'cycle-duration') { state.timer = state.timer >= 1800 ? 900 : state.timer + 300; }
  if (action === 'save-log') { state.modal = 'logged'; setToast('Session saved'); }
  if (action === 'close-logged') { state.modal = null; state.page = 'home'; state.pumping = false; }
  if (action === 'create-program') state.modal = 'create';
  if (action === 'draft-level') state.draft.level = clamp(state.draft.level + Number(button.dataset.delta), 1, 9);
  if (action === 'draft-auto') state.draft.auto = !state.draft.auto;
  if (action === 'save-program') {
    state.customPrograms.push({ ...state.draft, name: state.draft.name.trim() || 'My Air2 Program' });
    state.modal = 'list'; state.draft = { name: '', mode: 'Stimulation', level: 3, auto: false }; setToast('New program saved');
  }
  render();
}

function runFitCheck() {
  const loop = () => {
    if (state.modal !== 'fit') return;
    if (state.fitIndex < 4) { state.fitIndex += 1; render(); setTimeout(loop, 680); }
    else render();
  };
  setTimeout(loop, 680);
}

function beginHold(button) {
  if (holdTimer) return;
  button.classList.add('holding');
  holdTimer = setTimeout(() => {
    holdTimer = null;
    state.pumping = false;
    state.modal = 'log';
    render();
  }, 900);
}

function cancelHold() {
  if (!holdTimer) return;
  clearTimeout(holdTimer);
  holdTimer = null;
  const button = document.querySelector('[data-action="hold-finish"]');
  if (button) button.classList.remove('holding');
  setToast('Hold for a moment to finish your session.', 1800);
}

app.addEventListener('click', event => {
  const layer = event.target.closest('.annotation-layer');
  if (layer) {
    const rect = app.getBoundingClientRect();
    annotationPoint = { x: ((event.clientX - rect.left) / rect.width * 100).toFixed(2), y: ((event.clientY - rect.top) / rect.height * 100).toFixed(2) };
    annotationEditor.hidden = false;
    annotationEditor.style.left = `${Math.min(event.clientX + 12, window.innerWidth - 292)}px`;
    annotationEditor.style.top = `${Math.min(event.clientY + 12, window.innerHeight - 156)}px`;
    annotationText.focus();
    return;
  }
  const button = event.target.closest('[data-action]');
  if (button) handleAction(button);
});

app.addEventListener('pointerup', cancelHold);
app.addEventListener('pointercancel', cancelHold);
app.addEventListener('pointerleave', event => { if (event.target.closest('[data-action="hold-finish"]')) cancelHold(); });
app.addEventListener('input', event => { if (event.target.dataset.field) { state.draft[event.target.dataset.field] = event.target.value; } });
app.addEventListener('change', event => { if (event.target.dataset.field) { state.draft[event.target.dataset.field] = event.target.value; } });

setInterval(() => {
  if (!state.pumping) return;
  state.timer += 1;
  const rate = state.mode === 'expression' ? .013 : .006;
  state.lMilk = roundMilk(state.lMilk + rate);
  state.rMilk = roundMilk(state.rMilk + rate * .93);
  if (state.auto && state.mode === 'stimulation' && state.timer === 7) {
    state.mode = 'expression';
    setToast('Let-down detected. Switched to Expression mode.', 3600);
  }
  render();
}, 1000);

document.querySelector('#mark-toggle').addEventListener('click', () => { marking = !marking; render(); });
document.querySelector('#annotation-cancel').addEventListener('click', () => { annotationPoint = null; annotationText.value = ''; annotationEditor.hidden = true; });
document.querySelector('#annotation-save').addEventListener('click', () => {
  if (!annotationPoint || !annotationText.value.trim()) return;
  reviews.push({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), page: state.page, modal: state.modal, ...annotationPoint, note: annotationText.value.trim(), createdAt: new Date().toISOString() });
  localStorage.setItem('air2-review-notes', JSON.stringify(reviews));
  annotationPoint = null; annotationText.value = ''; annotationEditor.hidden = true; marking = false; render();
});
document.querySelector('#copy-notes').addEventListener('click', async () => { await navigator.clipboard.writeText(JSON.stringify(reviews, null, 2)); setToast('Review notes copied'); });
document.querySelector('#export-notes').addEventListener('click', () => { const blob = new Blob([JSON.stringify(reviews, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'air2-demo-review-notes.json'; link.click(); URL.revokeObjectURL(link.href); });
document.querySelector('#clear-notes').addEventListener('click', () => { if (confirm('Clear all saved review notes?')) { reviews.length = 0; localStorage.removeItem('air2-review-notes'); render(); } });

render();
