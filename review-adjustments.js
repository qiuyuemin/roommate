const reviewAsset = name => `./assets/figma-review/${name}`;

function exactBattery(level, tone = 'red') {
  return `<span class="exact-battery ${tone}"><img src="${reviewAsset('battery-outline-red.svg')}" alt=""><i style="width:${Math.max(3, Math.min(15, level / 100 * 15))}px"></i><b>${level}</b></span>`;
}

function exactStackIcon(className, files) {
  return `<span class="${className}">${files.map(file => `<img src="${reviewAsset(file)}" alt="">`).join('')}</span>`;
}

v4Status = function () {
  return `<div class="v4-status"><span>9:41</span><span class="levels"><img class="cell" src="${reviewAsset('status-cellular.svg')}" alt=""><img class="wifi" src="${reviewAsset('status-wifi.svg')}" alt=""><img class="battery" src="${reviewAsset('status-battery.svg')}" alt=""></span></div>`;
};

v4Nav = function (active) {
  const entries = [
    ['home','Home',exactStackIcon('exact-nav-icon',['nav-home-a.svg','nav-home-b.svg'])],
    ['device','Device',exactStackIcon('exact-nav-icon',['nav-device.svg'])],
    ['community','Community',exactStackIcon('exact-nav-icon',['nav-community-a.svg','nav-community-b.svg'])],
    ['me','Me',exactStackIcon('exact-nav-icon',['nav-user-a.svg','nav-user-b.svg'])]
  ];
  return `<nav class="v4-nav">${entries.map(([id,label,icon]) => `<button ${id === 'home' || id === 'device' ? `data-v4="${id}"` : ''} class="${active === id ? 'active' : ''}">${icon}${label}</button>`).join('')}</nav>`;
};

v4Device = function () {
  return `<section class="v4 v4-device">${v4Status()}<header class="v4-top v4-device-title"><h1>My Device</h1><button class="v4-circle" aria-label="Add device">+</button></header><button class="v4-device-card" data-v4="home"><span class="head"><i class="dev-dot"><img src="./assets/figma-v2/device-group-b.svg" alt=""></i><span><strong>Breast Pump</strong><small><span>Air 2</span><span>L ${exactBattery(80)}</span><span>R ${exactBattery(75)}</span></small></span></span><i class="chev">›</i><h2>No breast feeding<br>record available</h2><img class="art" src="./assets/figma-v2/device-group-a.svg" alt=""></button><img class="v4-device-line" src="./assets/figma-v2/device-card-illustration.svg" alt="">${v4Nav('device')}</section>`;
};

function exactTrendResult() {
  const points = [72,51,61,39,55,28,43];
  return `<div class="exact-trend"><div class="exact-trend-grid"><span>8 oz</span><span>4 oz</span><span>0</span></div><div class="exact-trend-line">${points.map((top,index) => `<i style="--top:${top}px;--next:${points[index+1] ?? top}px"><b></b></i>`).join('')}</div><div class="exact-trend-days"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div><p><b>${(state.milkL + state.milkR).toFixed(1)} oz</b><span>Last pumping · 20 min</span></p></div>`;
}

function exactSessionResult() {
  return `<div class="exact-session"><div class="exact-session-bars"><span><i style="height:92px"></i><b>${state.milkL.toFixed(1)} oz</b><small>Left</small></span><span><i style="height:89px"></i><b>${state.milkR.toFixed(1)} oz</b><small>Right</small></span></div><p>Apr 1, 9:41 AM <b>${time(state.timer || 1200)}</b></p></div>`;
}

v4Home = function () {
  const data = state.hasLogged;
  const trend = data ? exactTrendResult() : `<div class="v4-empty-trend">No pumping volume trend available<small>Start record to generate chart.</small></div>`;
  const lactation = data ? exactSessionResult() : `<img class="mother" src="./assets/figma-v2/home-group-b.svg" alt=""><div class="v4-lactation-record">No breast feeding record available</div><button class="v4-record-pill">Record</button>`;
  const running = state.running && !state.paused;
  return `<section class="v4 v4-home">${v4Status()}<header class="v4-top">${v4Back('device')}<h1>Breast Pump</h1></header><main class="v4-home-cards"><section class="v4-home-card v4-trend"><div class="v4-card-title"><span><img src="./assets/figma-v2/icon-trend.svg" alt="">Pumping Trend</span><button>›</button></div>${trend}</section><section class="v4-home-card v4-lactation"><div class="v4-card-title"><span><img src="./assets/figma-v2/icon-stimulation.svg" alt="">Lactation</span><button class="v4-add">＋ Add Plan</button></div><small>Free AI-based plan from data and needs.</small>${lactation}</section></main><section class="v4-home-dock"><div class="v4-dock-head"><span class="v4-dock-pumps"><img src="${reviewAsset('home-pumps.png')}" alt="Air 2"></span><span class="v4-dock-copy"><b>Air 2 <img src="${reviewAsset('home-setting.svg')}" alt=""></b><small><span>L ${exactBattery(80,'white')}</span><span>R ${exactBattery(75,'white')}</span></small></span><button class="go" data-v4="control">›</button></div><div class="v4-dock-rule"></div><div class="v4-dock-mode"><img src="./assets/figma-v2/icon-stimulation.svg" alt="">Stimulation <button class="v4-dock-play" data-quick-start="${running ? 'pause' : 'start'}"><img src="${running ? './assets/figma-v2/icon-pause.svg' : reviewAsset('home-play.svg')}" alt="${running ? 'Pause' : 'Start'}"></button></div></section></section>`;
};

function milkStage(amount) {
  if (amount <= .05) return 'empty';
  if (amount < .35) return 'drop';
  if (amount < 2) return 'thin';
  return 'thick';
}

v4Hardware = function (side, amount, pod) {
  if (!pod) return `<div class="v4-pump ${side === 'r' ? 'right' : ''}"><span class="hardware"><img src="${reviewAsset('home-pumps.png')}" alt="Air2 pump"></span><span class="amount">${amount.toFixed(1)} oz</span></div>`;
  const orientation = side === 'r' ? 'r' : 'l';
  const stage = milkStage(amount);
  return `<div class="v4-pump ${orientation === 'r' ? 'right' : ''}"><span class="v4-pod exact-pod ${stage}"><img class="pod-empty" src="${reviewAsset(`pod-stimulation-${orientation}.svg`)}" alt=""><img class="pod-filled" src="${reviewAsset(`pod-expression-${orientation}.svg`)}" alt=""><span class="milk-motion"><i></i><i></i><i></i><i></i></span></span><span class="amount">${amount.toFixed(1)} oz</span></div>`;
};

v4Controls = function () {
  return `<section class="v4-levels">${v4Track('l',state.levelL)}<section class="v4-both"><label><span class="link-glyph">↔</span> Both</label><div class="v4-both-box" data-v4-drag="both"><span class="v4-both-lines">${'<i></i>'.repeat(7)}</span><i class="v4-both-knob"><img src="${reviewAsset('both-knob.svg')}" alt="Drag both levels"></i></div></section>${v4Track('r',state.levelR)}</section><section class="v4-speed"><h2>Speed</h2><div class="v4-speed-list">${[1,2,3,4,5].map(n => `<button data-v4="speed" data-speed="${n}" class="${state.speed===n?'active':''}">${n}</button>`).join('')}</div></section>`;
};

v4Control = function () {
  const expr = state.mode === 'expression';
  const running = state.running;
  const usePod = state.auto || state.selectedProgram;
  const podType = expr ? 'expression' : state.selectedProgram ? 'boost-stimulation' : usePod ? 'stimulation' : null;
  const title = state.selectedProgram || (expr ? 'Expression' : 'Stimulation');
  const tag = state.selectedProgram ? `${time(state.timer)} / 20:00` : expr ? time(state.timer) : '';
  const card = state.selectedProgram || state.auto ? v4AutoCard(expr?'expression':'stimulation',title,tag) : v4ManualCard();
  const topNotice = expr && state.auto ? `<p class="v4-switch-note">“ Looks like let-down has started. I’ve switched to<br>Expression mode for you. ”</p>` : '';
  const actions = running ? `<div class="v4-actions"><button class="v4-finish" data-v4="finish"><i></i> Hold to Finish</button><button class="v4-pause ${state.paused?'play':''}" data-v4="pause">${state.paused?'▶':'<img src="./assets/figma-v2/icon-pause.svg" alt="Pause">'}</button></div>` : `<button class="v4-start" data-v4="start">Start Pumping</button>`;
  const settings = exactStackIcon('exact-settings',['control-settings-a.svg','control-settings-b.svg']);
  return `<section class="v4 v4-control ${expr?'expression':''}"><img class="v4-bg" src="./assets/figma-v2/control-bg.svg" alt="">${v4Status()}<header class="v4-top">${v4Back('home')}<h1>Pump Control</h1><button class="v4-circle">${settings}</button></header>${topNotice}<div class="v4-pump-row">${v4Hardware('l',state.milkL,podType)}${v4Hardware('r',state.milkR,podType)}</div><main class="v4-controls">${card}${v4Controls()}</main>${actions}<i class="v4-home-indicator"></i></section>`;
};

function exactLogVessel(side, amount) {
  const orientation = side === 'r' ? 'r' : 'l';
  return `<div class="v4-vessel-wrap"><div class="v4-vessel exact-log-vessel"><img class="base" src="${reviewAsset('log-vessel-base.svg')}" alt=""><img class="shell" src="${reviewAsset(`log-vessel-${orientation}.svg`)}" alt=""><img class="milk" src="${reviewAsset('log-milk.svg')}" alt=""><button data-v4="milk" data-side="${orientation}"><img src="${reviewAsset('knob-up.svg')}" alt="Increase"><img src="${reviewAsset('knob-down.svg')}" alt="Decrease"></button></div><p class="v4-amount-number">${amount.toFixed(1)}<small>oz</small></p></div>`;
}

v4Log = function () {
  const l=state.milkL||7.1,r=state.milkR||7.1;
  return `<div class="v4-overlay"><section class="v4-log"><button class="v4-circle close" data-v4="control">×</button><h1>Log Pumping Amount</h1><p class="v4-log-date">Apr 1, 9:41 AM</p><div class="v4-amounts">${exactLogVessel('l',l)}<div class="v4-measure"><b>10 oz</b>${'<i></i>'.repeat(10)}<b>0</b></div>${exactLogVessel('r',r)}</div><button class="v4-duration"><span>Duration</span><b>20 min　⌄</b></button><button class="v4-start v4-save" data-v4="save">Save</button></section></div>`;
};

function runQuickFit() {
  v4FitTimers.forEach(clearTimeout);
  v4FitTimers=[];
  state.modal='fit'; state.fitStage=0; state.fitAdjust=true; v4View();
  [1,2,3,4,5,6,7,8,9,10].forEach((stage,index)=>v4FitTimers.push(setTimeout(()=>{
    state.fitStage=stage; v4View();
    if(stage===10)setTimeout(()=>{state.modal=null;state.running=true;state.paused=false;v4View();},450);
  },(index+1)*650)));
}

root.addEventListener('click', event => {
  const quick = event.target.closest('[data-quick-start]');
  if (!quick) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (quick.dataset.quickStart === 'start') runQuickFit();
  else { state.paused = !state.paused; v4View(); }
}, true);

v4View();
