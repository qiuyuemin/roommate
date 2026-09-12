/* Fit Check is a staged inspection. Its visual state is independent of pump mode. */
function f21Icon(status) {
  const file = status === 'done' ? 'fit-posture.svg' : status === 'adjust' ? 'fit-alignment.svg' : 'fit-check.svg';
  return `<img src="${r2Asset(file)}" alt="">`;
}

function f21Status(stage) {
  return {
    posture: stage === 0 ? 'waiting' : 'done',
    alignment: stage === 0 ? 'waiting' : stage < 3 ? 'adjust' : 'done',
    suction: stage < 4 ? 'waiting' : 'done',
    battery: stage < 5 ? 'waiting' : 'done'
  };
}

v4Fit = function () {
  const stage = state.fitStage || 0;
  if (stage >= 6) {
    const count = stage === 6 ? '3' : stage === 7 ? '2' : stage === 8 ? '1' : 'START';
    return `<div class="v4-overlay"><section class="v4-fit r2-fit f21-fit f21-count"><h2>Fit Check</h2><div class="v4-countdown">${count}<small>${stage === 9 ? 'Pumping begins now' : ''}</small></div></section></div>`;
  }
  const status = f21Status(stage);
  const checks = [['Posture', status.posture], ['Alignment', status.alignment], ['Suction', status.suction], ['Battery', status.battery]];
  const adjusting = status.alignment === 'adjust';
  return `<div class="v4-overlay"><section class="v4-fit r2-fit f21-fit"><h2>Fit Check</h2><div class="v4-fit-chips f21-chips">${checks.map(([label, kind], index) => `<span class="v4-fit-chip f21-chip f21-${kind}" style="--delay:${index * 90}ms">${f21Icon(kind)}${label}</span>`).join('')}</div><p class="v4-fit-copy">${adjusting ? 'Almost there. Follow the on-screen guide to<br>make a small adjustment.' : stage >= 5 ? 'Everything is ok !' : 'Checking your fit…'}</p><div class="v4-fit-pumps f21-pumps"><div class="v4-fit-unit"><span class="hardware"><img src="${r2Asset('control-pumps.png')}" alt="Left pump"></span><p>L</p></div><div class="v4-fit-unit right ${adjusting ? 'f21-adjusting' : ''}">${adjusting ? `<img class="f21-guide" src="${r2Asset('fit-guide.svg')}" alt="Angle adjustment guide">` : ''}<span class="hardware"><img src="${r2Asset('control-pumps.png')}" alt="Right pump"></span><p>R</p></div></div></section></div>`;
};

v4RunFit = function () {
  v4FitTimers.forEach(clearTimeout);
  v4FitTimers = [];
  state.modal = 'fit'; state.fitAdjust = true; state.fitStage = 0; v4View();
  const stages = [[1,700],[2,550],[3,2350],[4,620],[5,620],[6,520],[7,700],[8,700],[9,700]];
  let elapsed = 0;
  stages.forEach(([next, wait]) => {
    elapsed += wait;
    v4FitTimers.push(setTimeout(() => { state.fitStage = next; v4View(); }, elapsed));
  });
  /* Keep START visible for 1.5 seconds before entering the control session. */
  v4FitTimers.push(setTimeout(() => { state.modal = null; state.running = true; state.paused = false; state.fitAdjust = false; v4View(); }, elapsed + 1500));
};
