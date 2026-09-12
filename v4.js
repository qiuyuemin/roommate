var v4Drag = null;
var v4Hold = null;
var v4FitTimers = [];

state.hasLogged = false;
state.listExpanded = 'Milk Boost';
state.fitStage = 0;
state.fitAdjust = false;

function v4Status() {
  return `<div class="v4-status"><span>9:41</span><span class="levels"><img class="cell" src="./assets/figma-v2/status-cellular.svg" alt=""><img class="wifi" src="./assets/figma-v2/status-wifi.svg" alt=""><img class="battery" src="./assets/figma-v2/status-battery.svg" alt=""></span></div>`;
}
function v4Back(target) { return `<button class="v4-circle" data-v4="${target}" aria-label="Back"><img src="./assets/figma/back.svg" alt=""></button>`; }
function v4Hardware(side, amount, pod) {
  const droplets = pod === 'expression' ? '<span class="drops"><i></i><i></i><i></i><i></i></span>' : '';
  const podMarkup = pod ? `<span class="v4-pod">${pod === 'expression' || pod === 'boost-stimulation' ? '<i class="milk-band"></i>' : ''}${droplets}</span>` : `<span class="hardware"><img src="./assets/figma-v2/home-pumps.png" alt="Air2 pump"></span>`;
  return `<div class="v4-pump ${side === 'r' ? 'right' : ''}">${podMarkup}<span class="amount">${amount.toFixed(1)} oz</span></div>`;
}
function v4Nav(active) {
  return `<nav class="v4-nav"><button data-v4="home" class="${active === 'home' ? 'active' : ''}"><span>⌂</span>Home</button><button data-v4="device" class="${active === 'device' ? 'active' : ''}"><span>⬡</span>Device</button><button><span>◔</span>Community</button><button><span>♙</span>Me</button></nav>`;
}
function v4Device() {
  return `<section class="v4 v4-device">${v4Status()}<header class="v4-top v4-device-title"><h1>My Device</h1><button class="v4-circle" aria-label="Add device">+</button></header><button class="v4-device-card" data-v4="home"><span class="head"><i class="dev-dot">◉</i><span><strong>Breast Pump</strong><small>Air 2 <b>L 80</b><b>R 75</b></small></span></span><i class="chev">›</i><h2>No breast feeding<br>record available</h2><img class="art" src="./assets/figma-v2/device-group-a.svg" alt=""></button><img class="v4-device-line" src="./assets/figma-v2/device-card-illustration.svg" alt="">${v4Nav('device')}</section>`;
}
function v4Home() {
  const data = state.hasLogged;
  const trend = data ? `<div class="v4-trend-data"><div class="v4-bars"><i style="height:45%" data-time="9:41"></i><i style="height:65%" data-time="10:20"></i><i style="height:83%" data-time="11:04"></i><i style="height:58%" data-time="12:14"></i><i style="height:72%" data-time="1:05"></i></div><p class="v4-trend-total">${(state.milkL + state.milkR).toFixed(1)} oz recorded today</p></div>` : `<div class="v4-empty-trend">No pumping volume trend available<small>Start record to generate chart.</small></div>`;
  const lactation = data ? `<div class="v4-lactation-record">Latest session&nbsp; ${time(state.timer || 1200)}<br>${state.milkL.toFixed(1)} oz L　${state.milkR.toFixed(1)} oz R</div>` : `<img class="mother" src="./assets/figma-v2/home-group-b.svg" alt=""><div class="v4-lactation-record">No breast feeding record available</div><button class="v4-record-pill">Record</button>`;
  return `<section class="v4 v4-home">${v4Status()}<header class="v4-top">${v4Back('device')}<h1>Breast Pump</h1></header><main class="v4-home-cards"><section class="v4-home-card v4-trend"><div class="v4-card-title"><span><img src="./assets/figma-v2/icon-trend.svg" alt="">Pumping Trend</span><button>›</button></div>${trend}</section><section class="v4-home-card v4-lactation"><div class="v4-card-title"><span><img src="./assets/figma-v2/icon-stimulation.svg" alt="">Lactation</span><button class="v4-add">＋ Add Plan</button></div><small>Free AI-based plan from data and needs.</small>${lactation}</section></main><section class="v4-home-dock"><div class="v4-dock-head"><span class="v4-dock-pumps"><i class="v4-dock-pump"><img src="./assets/figma-v2/home-pumps.png" alt=""></i><i class="v4-dock-pump right"><img src="./assets/figma-v2/home-pumps.png" alt=""></i></span><span><b>Air 2</b><small>L　80　R　75</small></span><button class="go" data-v4="control">›</button></div><div class="v4-dock-rule"></div><div class="v4-dock-mode">♡　Stimulation <button class="v4-dock-play" data-v4="control">▶</button></div></section></section>`;
}
function v4Switch() { return `<button class="v4-switch ${state.auto ? 'on' : ''}" data-v4="auto" role="switch"><i></i></button>`; }
function v4ModeTab(mode, title, icon) { return `<button data-v4="mode" data-mode="${mode}" class="${state.mode === mode ? 'active' : ''}"><img src="${icon}" alt="">${title}</button>`; }
function v4Track(side, value) { const top = 134 - (value - 1) * 20; return `<section class="v4-level"><label>${side.toUpperCase()} Level</label><div class="v4-track" data-v4-drag="level" data-side="${side}"><span class="ticks">${'<i></i>'.repeat(6)}</span><span class="v4-level-value" style="top:${top}px">${value}</span></div></section>`; }
function v4AutoCard(kind, title, tag) {
  // Milk Boost has three mutually exclusive layouts. Resolve the dedicated
  // card here so an older post-render override cannot stack the layouts.
  if (state.selectedProgram === 'Milk Boost' && typeof window.h7MilkBoostCard === 'function') {
    return window.h7MilkBoostCard();
  }
  const expr = kind === 'expression';
  const icon = expr ? './assets/figma-v2/icon-expression.svg' : './assets/figma-v2/icon-stimulation.svg';
  return `<section class="v4-auto-card ${expr ? 'expression' : ''} ${state.selectedProgram ? 'program' : ''}"><div class="v4-auto-content"><span class="v4-auto-title"><img src="${icon}" alt="">${title}${tag ? `<em class="v4-time">${tag}</em>` : ''}</span><img class="v4-card-arrow" src="./assets/figma-v2/icon-arrow.svg" alt=""></div><p class="v4-auto-center">${expr ? 'Expression' : 'Stimulation'}</p><div class="v4-auto-line">Auto Switch ${v4Switch()}</div></section>`;
}
function v4ManualCard() {
  return `<section class="v4-manual-card"><div class="v4-manual-head"><span>Stimulation</span><img class="v4-card-arrow" src="./assets/figma-v2/icon-arrow.svg" alt=""></div><div class="v4-mode-tabs">${v4ModeTab('stimulation','Stimulation','./assets/figma-v2/icon-stimulation.svg')}${v4ModeTab('expression','Expression','./assets/figma-v2/icon-expression.svg')}${v4ModeTab('mixed','Mixed','./assets/figma-v2/icon-mixed.svg')}</div><div class="v4-auto-toggle">Auto Switch ${v4Switch()}</div></section>`;
}
function v4Controls() {
  return `<section class="v4-levels">${v4Track('l',state.levelL)}<section class="v4-both"><label>↔　Both</label><div class="v4-both-box" data-v4-drag="both"><span class="v4-both-lines">${'<i></i>'.repeat(7)}</span><i class="v4-both-knob">⌃<br>⌄</i></div></section>${v4Track('r',state.levelR)}</section><section class="v4-speed"><h2>Speed</h2><div class="v4-speed-list">${[1,2,3,4,5].map(n => `<button data-v4="speed" data-speed="${n}" class="${state.speed===n?'active':''}">${n}</button>`).join('')}</div></section>`;
}
function v4Control() {
  const expr = state.mode === 'expression';
  const running = state.running;
  const usePod = state.auto || state.selectedProgram;
  const podType = expr ? 'expression' : state.selectedProgram ? 'boost-stimulation' : usePod ? 'stimulation' : null;
  const title = state.selectedProgram || (expr ? 'Expression' : 'Stimulation');
  const tag = state.selectedProgram ? `${time(state.timer)} / 20:00` : expr ? time(state.timer) : '';
  const card = state.selectedProgram || state.auto ? v4AutoCard(expr?'expression':'stimulation',title,tag) : v4ManualCard();
  const topNotice = expr && state.auto ? `<p class="v4-switch-note">“ Looks like let-down has started. I’ve switched to<br>Expression mode for you. ”</p>` : '';
  const actions = running ? `<div class="v4-actions"><button class="v4-finish" data-v4="finish">■　Hold to Finish</button><button class="v4-pause ${state.paused?'play':''}" data-v4="pause">${state.paused?'▶':'<img src="./assets/figma-v2/icon-pause.svg" alt="Pause">'}</button></div>` : `<button class="v4-start" data-v4="start">Start Pumping</button>`;
  return `<section class="v4 v4-control ${expr?'expression':''}"><img class="v4-bg" src="./assets/figma-v2/control-bg.svg" alt="">${v4Status()}<header class="v4-top">${v4Back('home')}<h1>Pump Control</h1><button class="v4-circle"><img src="./assets/figma/settings.svg" alt="Settings"></button></header>${topNotice}<div class="v4-pump-row">${v4Hardware('l',state.milkL,podType)}${v4Hardware('r',state.milkR,podType)}</div><main class="v4-controls">${card}${v4Controls()}</main>${actions}<i class="v4-home-indicator"></i></section>`;
}
function v4ListCard(name, info, icon, selected, duration) { return `<button class="v4-list-card ${selected?'selected':''}" data-v4="manual" data-mode="${name.toLowerCase()}"><span class="icon">${icon}</span><span class="copy"><b>${name}${duration?` <em class="v4-time">${duration}</em>`:''}</b><small>${info}</small></span><i>›</i></button>`; }
function v4List() {
  const expanded = state.listExpanded === 'Milk Boost';
  return `<section class="v4 v4-list">${v4Status()}<header class="v4-top">${v4Back('control')}</header><h1>List</h1><div class="v4-list-auto">Auto Switch ${v4Switch()}</div><main class="v4-list-main"><p class="v4-section-label">Manual</p>${v4ListCard('Stimulation','Gentle and comfortable','♡',!state.selectedProgram&&state.mode==='stimulation','')}${v4ListCard('Expression','Fast-paced and intense','♨',!state.selectedProgram&&state.mode==='expression','02:01')}<button class="v4-create">＋ Create</button></main><main class="v4-list-main programs"><p class="v4-section-label">Programs</p><button class="v4-list-card"><span class="copy"><b>Cozy Flow <em class="v4-time">21:30</em></b></span><i class="play">▶</i></button><section class="v4-list-card ${expanded?'expanded':''}" data-v4="toggle-program">${expanded?`<div class="row"><span class="copy"><b>Milk Boost <em class="v4-time">20:00</em></b><small>Most suitable for daily use after successful<br>lactation</small></span><button class="play" data-v4="choose-program">▶</button></div><p> </p><span class="v4-program-bar"><i></i></span><span class="v4-legend"><span>Stimulate</span><span>Expression</span><b>?</b></span>`:`<div class="row"><span class="copy"><b>Milk Boost <em class="v4-time">20:00</em></b></span><button class="play" data-v4="choose-program">▶</button></div>`}</section><button class="v4-list-card"><span class="copy"><b>Power Pumping <em class="v4-time">45:00</em></b></span><i class="play">▶</i></button></main></section>`;
}
function v4Fit() {
  const stage=state.fitStage, checks=['posture','alignment','suction','Battery'];
  if(stage>=7) return `<div class="v4-overlay"><section class="v4-fit"><h2>Fit Check</h2><div class="v4-countdown">${stage===7?'3':stage===8?'2':stage===9?'1':'Start!'}<small>${stage===10?'Pumping begins now':''}</small></div></section></div>`;
  const done = i => stage > i+1 || stage===6;
  const active = i => stage===i+1;
  const lrL = stage>=3, lrR=stage>=4;
  return `<div class="v4-overlay"><section class="v4-fit"><h2>Fit Check</h2><div class="v4-fit-chips">${checks.map((c,i)=>`<span class="v4-fit-chip ${active(i)?'wait':''}"><i>${done(i)?'✓':active(i)?'•':''}</i>${c}</span>`).join('')}</div><p class="v4-fit-copy">${stage===6?'Everything is ok !':state.fitAdjust&&stage===2?'Almost there. Follow the on-screen guide to make a small adjustment.':'Checking your fit…'}</p><div class="v4-fit-pumps"><div class="v4-fit-unit"><span class="hardware"><img src="./assets/figma-v2/home-pumps.png" alt=""></span><p>L ${lrL?'<i>✓</i>':''}</p></div><div class="v4-fit-unit right"><span class="hardware"><img src="./assets/figma-v2/home-pumps.png" alt=""></span>${state.fitAdjust&&stage===2?'<i class="v4-fit-guide"></i>':''}<p>R ${lrR?'<i>✓</i>':''}</p></div></div></section></div>`;
}
function v4Confirm(){return `<div class="v4-overlay"><section class="v4-confirm"><h2>Switch to Program?</h2><p>The timer will reset.</p><button data-v4="confirm">Confirm Switch</button><button data-v4="cancel">Not Now</button></section></div>`;}
function v4Log(){const l=state.milkL||7.1,r=state.milkR||7.1;return `<div class="v4-overlay"><section class="v4-log"><button class="v4-circle close" data-v4="control">×</button><h1>Log Pumping Amount</h1><p class="v4-log-date">Apr 1, 9:41 AM</p><div class="v4-amounts"><div class="v4-vessel-wrap"><div class="v4-vessel"><i class="fill"></i><button data-v4="milk" data-side="l">⌃<br>⌄</button></div><p class="v4-amount-number">${l.toFixed(1)}<small>oz</small></p></div><div class="v4-measure"><b>10 oz</b>${'<i></i>'.repeat(10)}<b>0</b></div><div class="v4-vessel-wrap"><div class="v4-vessel"><i class="fill"></i><button data-v4="milk" data-side="r">⌃<br>⌄</button></div><p class="v4-amount-number">${r.toFixed(1)}<small>oz</small></p></div></div><button class="v4-duration"><span>Duration</span><b>20 min　⌄</b></button><button class="v4-start v4-save" data-v4="save">Save</button></section></div>`;}
function v4Logged(){return `<div class="v4-overlay"><section class="v4-logged"><img src="./assets/figma-v2/bunny-a.png" alt=""><h1>Logged</h1><p>Today's data has been updated.<br>Every little change means the baby is quietly growing.</p><i class="v4-home-indicator"></i></section></div>`;}
function v4View(){const page=state.page==='device'?v4Device():state.page==='home'?v4Home():state.page==='list'?v4List():v4Control();const modal=state.modal==='fit'?v4Fit():state.modal==='confirm'?v4Confirm():state.modal==='log'?v4Log():state.modal==='logged'?v4Logged():'';root.innerHTML=page+modal;}

view=v4View;
function v4RunFit(){v4FitTimers.forEach(clearTimeout);v4FitTimers=[];state.modal='fit';state.fitStage=0;v4View();[1,2,3,4,5,6,7,8,9,10].forEach((stage,index)=>v4FitTimers.push(setTimeout(()=>{state.fitStage=stage;v4View();if(stage===10)setTimeout(()=>{state.modal=null;state.running=true;state.paused=false;v4View();},450)},(index+1)*650)));}
function v4StartHold(button){if(v4Hold)return;button.classList.add('holding');v4Hold=setTimeout(()=>{v4Hold=null;state.running=false;state.modal='log';v4View();},900)}
function v4CancelHold(){if(!v4Hold)return;clearTimeout(v4Hold);v4Hold=null;root.querySelector('.v4-finish')?.classList.remove('holding')}
root.addEventListener('pointerdown',event=>{const drag=event.target.closest('[data-v4-drag]');const finish=event.target.closest('[data-v4="finish"]');if(finish){event.preventDefault();v4StartHold(finish);return}if(!drag)return;event.preventDefault();v4Drag={kind:drag.dataset.v4Drag,side:drag.dataset.side,startY:event.clientY,l:state.levelL,r:state.levelR};drag.setPointerCapture?.(event.pointerId)},true);
root.addEventListener('pointermove',event=>{if(!v4Drag)return;const delta=clamp(Math.round((v4Drag.startY-event.clientY)/28),-3,3);if(v4Drag.kind==='level'){const key=v4Drag.side==='l'?'levelL':'levelR';state[key]=clamp((v4Drag.side==='l'?v4Drag.l:v4Drag.r)+delta,1,9)}else{state.levelL=clamp(v4Drag.l+delta,1,9);state.levelR=clamp(v4Drag.r+delta,1,9)}},true);
root.addEventListener('pointerup',()=>{if(v4Drag){v4Drag=null;v4View()}v4CancelHold()},true);root.addEventListener('pointercancel',()=>{v4Drag=null;v4CancelHold()},true);
root.addEventListener('click',event=>{const el=event.target.closest('[data-v4]');if(!el)return;event.preventDefault();event.stopImmediatePropagation();const action=el.dataset.v4;if(action==='device'){state.page='device';state.modal=null}if(action==='home'){state.page='home';state.modal=null}if(action==='control'){state.page='control';state.modal=null}if(action==='start'){v4RunFit();return}if(action==='mode'){state.mode=el.dataset.mode;state.selectedProgram=null}if(action==='auto'){state.auto=!state.auto}if(action==='speed'){state.speed=Number(el.dataset.speed)}if(action==='pause'){state.paused=!state.paused}if(action==='list'){state.page='list'}if(action==='manual'){state.mode=el.dataset.mode;state.selectedProgram=null;state.page='control'}if(action==='toggle-program'){state.listExpanded=state.listExpanded==='Milk Boost'?null:'Milk Boost'}if(action==='choose-program'){state.modal='confirm'}if(action==='confirm'){state.modal=null;state.page='control';state.selectedProgram='Milk Boost';state.mode='stimulation';state.auto=true;state.timer=0;state.running=true;state.paused=false}if(action==='cancel'){state.modal=null}if(action==='milk'){const key=el.dataset.side==='l'?'milkL':'milkR';state[key]=+(Math.max(7.1,state[key])+.1).toFixed(1)}if(action==='save'){state.modal='logged';state.hasLogged=true;setTimeout(()=>{if(state.modal==='logged'){state.modal=null;state.page='home';v4View()}},3300)}v4View()},true);
v4View();
