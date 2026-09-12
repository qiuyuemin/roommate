/* Round 2 implementation from demo评审json. The registry remains the source of truth. */
function r2Asset(name) { return `./assets/figma-review-r2/${name}`; }

function r2IconStack(className, files) {
  return `<span class="${className}">${files.map(file => `<img src="${r2Asset(file)}" alt="">`).join('')}</span>`;
}

v4Back = function (target) {
  return `<button class="v4-circle" data-v4="${target}" aria-label="Back"><img src="${r2Asset('control-back.svg')}" alt=""></button>`;
};

v4Nav = function (active) {
  const items = [
    ['home','Home',['nav-home-a.svg','nav-home-b.svg']],
    ['device','Device',['nav-device.svg']],
    ['community','Community',['nav-community-a.svg','nav-community-b.svg']],
    ['me','Me',['nav-user-a.svg','nav-user-b.svg']]
  ];
  return `<nav class="v4-nav r2-nav">${items.map(([id,label,icons]) => `<button ${id === 'home' || id === 'device' ? `data-v4="${id}"` : ''} class="${active === id ? 'active' : ''}">${r2IconStack('r2-nav-icon',icons)}<small>${label}</small></button>`).join('')}</nav>`;
};

v4Device = function () {
  return `<section class="v4 v4-device r2-device">${v4Status()}<header class="v4-top v4-device-title"><h1>My Device</h1><button class="v4-circle r2-add" aria-label="Add device">＋</button></header><button class="v4-device-card" data-v4="home"><span class="head"><i class="dev-dot"><img src="${r2Asset('device-dot.svg')}" alt=""></i><span><strong>Breast Pump</strong><small><span>Air 2</span><span>L ${exactBattery(80)}</span><span>R ${exactBattery(75)}</span></small></span></span><img class="chev" src="${r2Asset('chevron-card.svg')}" alt=""><h2>No breast feeding<br>record available</h2><img class="art" src="./assets/figma-v2/device-group-a.svg" alt=""></button><img class="v4-device-line" src="./assets/figma-v2/device-card-illustration.svg" alt="">${v4Nav('device')}</section>`;
};

function r2EmptyTrend() {
  return `<div class="v4-empty-trend">No pumping volume trend available<small>Start record to generate chart.</small></div>`;
}

function r2TrendResult() {
  const values = [8.7,11.8,null,13.4,9.6,15.1,12.2,null,16.8,10.5,17.6,14.2,12.6,18.1,null,9.4,13.8,11.7,15.6,14.9,16.3,null,12.1,17.2,13.7,18.9,15.4,11.8,16.5,14.2];
  const days = values.map((value,index) => {
    const d = new Date(2026,6,index+1);
    const letter = ['S','M','T','W','T','F','S'][d.getDay()];
    const top = value == null ? 0 : Math.round(100 - value / 30 * 100);
    return `<button class="r2-day ${value == null ? 'missing' : ''}" data-r2-day="${index+1}" data-value="${value == null ? '' : value}" style="--point:${top}%"><i></i><span>${letter}<small>7/${index+1}</small></span></button>`;
  }).join('');
  return `<div class="r2-trend-wrap"><div class="r2-y-axis"><span>30</span><span>20</span><span>10</span><span>0</span></div><div class="r2-trend-scroll" data-r2-scroll="latest"><div class="r2-trend-track">${days}</div></div><b class="r2-latest">14.2 oz</b></div>${state.r2DayDetail ? `<div class="r2-day-detail"><b>Jul ${state.r2DayDetail.day}</b><span>${state.r2DayDetail.value ? `${state.r2DayDetail.value} oz · 20 min` : 'No pumping record'}</span></div>` : ''}`;
}

function r2LactationResult() {
  const sessions = [
    ['20','12:00','done'],['20','13:00','done'],['','15:00','edit'],['20','16:00','done'],['','','add']
  ];
  return `<div class="r2-lactation-summary"><span><small>Last Pump</small><b>2<em>h</em> 45<em>m ago</em></b></span><span><small>Sessions</small><b>4</b><em>Next session · 1h 15m</em></span></div><div class="r2-session-chart"><div class="r2-session-scroll">${sessions.map(([value,label,type]) => `<button class="r2-session ${type}">${type==='done'?`<small>${value}</small><i></i>`:`<img src="${r2Asset(type==='edit'?'lactation-edit.svg':'lactation-add-session.svg')}" alt="">`}<span>${label}</span></button>`).join('')}</div><div class="r2-session-y"><span>OZ</span><span>30</span><span>20</span><span>10</span><span>0</span></div></div>`;
}

v4Home = function () {
  const data = state.hasLogged;
  const running = state.running && !state.paused;
  const trend = data ? r2TrendResult() : r2EmptyTrend();
  const lactation = data ? r2LactationResult() : `<img class="mother" src="./assets/figma-v2/home-group-b.svg" alt=""><div class="v4-lactation-record">No breast feeding record available</div><button class="v4-record-pill">Record</button>`;
  const records = state.r2RecordsOpen ? `<div class="r2-records"><button data-r2="close-records">×</button><h2>Pumping Records</h2><p>Apr 1 · 14.2 oz · 20 min</p><p>Mar 31 · 12.6 oz · 18 min</p></div>` : '';
  return `<section class="v4 v4-home ${data ? 'r2-home-result' : 'r2-home-empty'}">${v4Status()}<header class="v4-top">${v4Back('device')}<h1>Breast Pump</h1></header><main class="v4-home-cards"><section class="v4-home-card v4-trend"><div class="v4-card-title"><button class="r2-title-link" data-r2="records"><span><img src="${r2Asset(data?'trend-icon.svg':'trend-icon.svg')}" alt="">Pumping Trend</span></button><button data-r2="records"><img src="${r2Asset('home-chevron.svg')}" alt=""></button></div>${trend}</section><section class="v4-home-card v4-lactation"><div class="v4-card-title"><button class="r2-title-link" data-r2="records"><span><img src="${r2Asset('lactation-icon.svg')}" alt="">Lactation</span></button><button class="v4-add"><img src="${r2Asset('lactation-plus.svg')}" alt=""> Add Plan</button></div>${data ? '' : '<small>Free AI-based plan from data and needs.</small>'}${lactation}</section></main><section class="v4-home-dock"><div class="v4-dock-head"><span class="v4-dock-pumps"><img src="${r2Asset('home-pumps.png')}" alt="Air 2"></span><span class="v4-dock-copy"><b>Air 2 <img src="${r2Asset('home-setting.svg')}" alt=""></b><small><span>L ${exactBattery(80,'white')}</span><span>R ${exactBattery(75,'white')}</span></small></span><button class="go" data-v4="control"><img src="${r2Asset('home-chevron.svg')}" alt=""></button></div><div class="v4-dock-rule"></div><div class="v4-dock-mode"><img src="${r2Asset('auto-heart.svg')}" alt="">Stimulation <button class="v4-dock-play" data-quick-start="${running ? 'pause' : 'start'}"><img src="${running ? r2Asset('pause.svg') : r2Asset('home-play.svg')}" alt="${running ? 'Pause' : 'Start'}"></button></div></section>${records}</section>`;
};

v4Hardware = function (side, amount, pod) {
  const right = side === 'r';
  if (!pod) return `<div class="v4-pump ${right?'right':''}"><span class="hardware r2-hardware"><img src="${r2Asset('control-pumps.png')}" alt="Air2 pump"></span><span class="r2-reflection"><img src="${r2Asset('control-pumps.png')}" alt=""></span><span class="amount">${amount.toFixed(1)} oz</span></div>`;
  const expression = pod === 'expression' || (state.mode === 'expression');
  const file = expression ? `expr-pod-${right?'r':'l'}.svg` : `auto-pod-${right?'r':'l'}.svg`;
  const stage = milkStage(amount);
  return `<div class="v4-pump ${right?'right':''}"><span class="r2-pod ${stage} ${expression?'expression':''}"><img src="${r2Asset(file)}" alt=""><i class="r2-milk-level" style="--milk:${Math.min(86,Math.max(0,amount/8*86))}%"></i><span class="r2-drops"><i></i><i></i><i></i><i></i></span></span><span class="amount">${amount.toFixed(1)} oz</span></div>`;
};

v4Controls = function () {
  return `<section class="v4-levels">${v4Track('l',state.levelL)}<section class="v4-both"><label><img src="${r2Asset('control-link.svg')}" alt=""> Both</label><div class="v4-both-box" data-v4-drag="both"><span class="v4-both-lines">${'<i></i>'.repeat(7)}</span><i class="v4-both-knob"><img src="${reviewAsset('both-knob.svg')}" alt="Drag both levels"></i></div></section>${v4Track('r',state.levelR)}</section><section class="v4-speed"><h2>Speed</h2><div class="v4-speed-list">${[1,2,3,4,5].map(n => `<button data-v4="speed" data-speed="${n}" class="${state.speed===n?'active':''}">${n}</button>`).join('')}</div></section>`;
};

v4AutoCard = function (kind, title, tag) {
  const expr = kind === 'expression';
  return `<section class="v4-auto-card r2-auto-card ${expr?'expression':''} ${state.selectedProgram?'program':''}"><div class="v4-auto-content"><span class="v4-auto-title"><img src="${expr?r2Asset('list-expression.svg'):r2Asset('auto-heart.svg')}" alt="">${title}${tag?`<em class="v4-time">${tag}</em>`:''}</span><button class="r2-card-arrow" data-v4="list"><img src="${r2Asset('auto-chevron.svg')}" alt="Open list"></button></div><div class="v4-auto-line">Auto Switch ${v4Switch()}</div></section>`;
};

v4ManualCard = function () {
  return `<section class="v4-manual-card"><div class="v4-manual-head"><span>Stimulation</span><button class="r2-card-arrow" data-v4="list"><img src="${r2Asset('auto-chevron.svg')}" alt="Open list"></button></div><div class="v4-mode-tabs">${v4ModeTab('stimulation','Stimulation','./assets/figma-v2/icon-stimulation.svg')}${v4ModeTab('expression','Expression','./assets/figma-v2/icon-expression.svg')}${v4ModeTab('mixed','Mixed','./assets/figma-v2/icon-mixed.svg')}</div><div class="v4-auto-toggle">Auto Switch ${v4Switch()}</div></section>`;
};

v4Control = function () {
  const expr = state.mode === 'expression';
  const usePod = state.auto || state.selectedProgram;
  const podType = expr ? 'expression' : state.selectedProgram ? 'boost-stimulation' : usePod ? 'stimulation' : null;
  const title = state.selectedProgram || (expr ? 'Expression' : 'Stimulation');
  const tag = state.selectedProgram ? `${time(state.timer)} / 20:00` : expr ? time(state.timer) : '';
  const card = state.selectedProgram || state.auto ? v4AutoCard(expr?'expression':'stimulation',title,tag) : v4ManualCard();
  const notice = expr && state.auto ? `<p class="v4-switch-note">“ Looks like let-down has started. I’ve switched to<br>Expression mode for you. ”</p>` : '';
  const actions = state.running ? `<div class="v4-actions"><button class="v4-finish" data-v4="finish"><i></i>Hold to Finish</button><button class="v4-pause ${state.paused?'play':''}" data-v4="pause">${state.paused?'▶':`<img src="${r2Asset('pause.svg')}" alt="Pause">`}</button></div>` : `<button class="v4-start" data-v4="start">Start Pumping</button>`;
  const settings = r2IconStack('r2-settings',['control-setting-a.svg','control-setting-b.svg']);
  return `<section class="v4 v4-control ${expr?'expression':''}">${expr?'<span class="r2-expression-bg"></span>':'<img class="v4-bg" src="./assets/figma-v2/control-bg.svg" alt="">'}${v4Status()}<header class="v4-top">${v4Back('home')}<h1>Pump Control</h1><button class="v4-circle">${settings}</button></header>${notice}<div class="v4-pump-row">${v4Hardware('l',state.milkL,podType)}${v4Hardware('r',state.milkR,podType)}</div><main class="v4-controls">${card}${v4Controls()}</main>${actions}<i class="v4-home-indicator"></i></section>`;
};

function r2ListCard(name, detail, icon, selected, duration, action) {
  return `<button class="r2-list-card ${selected?'selected':''}" ${action||''}><img class="mode-icon" src="${r2Asset(icon)}" alt=""><span><b>${name}${duration?` <em>${duration}</em>`:''}</b>${detail?`<small>${detail}</small>`:''}</span>${selected?`<img class="wave" src="${r2Asset('list-wave.svg')}" alt="">`:`<img class="play" src="${r2Asset('list-play.svg')}" alt="Play">`}</button>`;
}

v4List = function () {
  const expanded = state.listExpanded === 'Milk Boost';
  return `<section class="v4 v4-list r2-list">${v4Status()}<header class="v4-top">${v4Back('control')}</header><h1>List</h1><div class="v4-list-auto">Auto Switch ${v4Switch()}</div><main class="r2-list-content"><p>Manual</p>${r2ListCard('Stimulation','Gentle and comfortable','list-heart.svg',!state.selectedProgram&&state.mode==='stimulation','',`data-v4="manual" data-mode="stimulation"`)}${r2ListCard('Expression','Fast-paced and intense','list-expression.svg',!state.selectedProgram&&state.mode==='expression','02:01',`data-v4="manual" data-mode="expression"`)}<header><span>Programs</span><button><img src="${r2Asset('list-create.svg')}" alt=""> Create</button></header>${['Cozy Flow|21:30','Milk Boost|20:00','Power Pumping|45:00'].map(item=>{const [name,duration]=item.split('|');if(name==='Milk Boost'&&expanded)return `<section class="r2-program-expanded" data-v4="toggle-program"><div><b>${name} <em>${duration}</em></b><button data-v4="choose-program"><img src="${r2Asset('list-play.svg')}" alt="Play"></button></div><small>Most suitable for daily use after successful lactation</small><i class="r2-program-timeline"><b></b></i><footer><span>● Stimulate</span><span>● Expression</span></footer></section>`;return `<button class="r2-program-row" ${name==='Milk Boost'?'data-v4="toggle-program"':''}><b>${name} <em>${duration}</em></b><img src="${r2Asset('list-play.svg')}" alt="Play"></button>`;}).join('')}</main></section>`;
};

v4Fit = function () {
  const stage = state.fitStage;
  if (stage >= 7) return `<div class="v4-overlay"><section class="v4-fit r2-fit"><h2>Fit Check</h2><div class="v4-countdown">${stage===7?'3':stage===8?'2':stage===9?'1':'Start!'}<small>${stage===10?'Pumping begins now':''}</small></div></section></div>`;
  const checks = [['Posture','fit-posture.svg'],['Alignment','fit-alignment.svg'],['Suction','auto-heart.svg'],['Battery','fit-check.svg']];
  const done = i => stage > i+1 || stage===6;
  const active = i => stage===i+1;
  return `<div class="v4-overlay"><section class="v4-fit r2-fit"><h2>Fit Check</h2><div class="v4-fit-chips">${checks.map(([label,icon],i)=>`<span class="v4-fit-chip ${active(i)?'wait':''} ${done(i)?'done':''}" style="--delay:${i*70}ms"><img src="${r2Asset(done(i)?'fit-check.svg':icon)}" alt="">${label}</span>`).join('')}</div><p class="v4-fit-copy">${stage===6?'Everything is ok !':state.fitAdjust&&stage===2?'Almost there. Follow the on-screen guide to make a small adjustment.':'Checking your fit…'}</p><div class="v4-fit-pumps"><div class="v4-fit-unit"><span class="hardware"><img src="${r2Asset('control-pumps.png')}" alt=""></span><p>L ${stage>=3?`<img src="${r2Asset('fit-check.svg')}" alt="">`:''}</p></div><div class="v4-fit-unit right"><span class="hardware ${state.fitAdjust&&stage===2?'adjusting':''}"><img src="${state.fitAdjust&&stage===2?r2Asset('fit-adjust.png'):r2Asset('control-pumps.png')}" alt=""></span>${state.fitAdjust&&stage===2?`<img class="r2-fit-guide" src="${r2Asset('fit-guide.svg')}" alt="Adjustment guide">`:''}<p>R ${stage>=4?`<img src="${r2Asset('fit-check.svg')}" alt="">`:''}</p></div></div></section></div>`;
};

function r2LogVessel(side, amount) {
  return `<div class="v4-vessel-wrap"><div class="r2-log-vessel"><img src="${r2Asset('log-shell.svg')}" alt=""><img src="${r2Asset(side==='l'?'log-l.svg':'log-r.svg')}" alt=""><img class="milk" src="${r2Asset('log-milk.svg')}" alt=""><button data-v4="milk" data-side="${side}"><img src="${r2Asset('log-up.svg')}" alt="Increase"><img src="${r2Asset('log-down.svg')}" alt="Decrease"></button></div><p class="v4-amount-number">${amount.toFixed(1)}<small>oz</small></p></div>`;
}

v4Log = function () {
  const l=state.milkL||7.1,r=state.milkR||7.1;
  return `<div class="v4-overlay"><section class="v4-log r2-log"><button class="v4-circle close" data-v4="control"><img src="${r2Asset('log-close.svg')}" alt="Close"></button><h1>Log Pumping Amount</h1><p class="v4-log-date">Apr 1, 9:41 AM</p><div class="v4-amounts">${r2LogVessel('l',l)}<div class="v4-measure"><b>10 oz</b>${'<i></i>'.repeat(10)}<b>0</b></div>${r2LogVessel('r',r)}</div><button class="v4-duration"><span>Duration</span><b>20 min <img src="${r2Asset('log-chevron.svg')}" alt=""></b></button><button class="v4-start v4-save" data-v4="save">Save</button></section></div>`;
};

document.addEventListener('click', event => {
  const action = event.target.closest('[data-r2]');
  if (!action || document.body.classList.contains('review-static')) return;
  event.preventDefault(); event.stopImmediatePropagation();
  if (action.dataset.r2 === 'records') state.r2RecordsOpen = true;
  if (action.dataset.r2 === 'close-records') state.r2RecordsOpen = false;
  v4View();
}, true);

let r2DayHold = null;
document.addEventListener('pointerdown', event => {
  const day = event.target.closest('[data-r2-day]');
  if (!day || document.body.classList.contains('review-static')) return;
  r2DayHold = setTimeout(() => {
    state.r2DayDetail = {day:Number(day.dataset.r2Day),value:day.dataset.value};
    v4View();
  }, 520);
}, true);
document.addEventListener('pointerup', () => { clearTimeout(r2DayHold); r2DayHold=null; }, true);
document.addEventListener('pointercancel', () => { clearTimeout(r2DayHold); r2DayHold=null; }, true);

function r2PostRender() {
  root.querySelectorAll('[data-r2-scroll="latest"]').forEach(scroller => { scroller.scrollLeft = scroller.scrollWidth; });
}
new MutationObserver(r2PostRender).observe(root,{childList:true});
v4View();
r2PostRender();
