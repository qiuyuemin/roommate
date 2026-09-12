/* Reveal checks cumulatively: a new check is inserted only after the preceding one passes. */
function f24Checks(stage) {
  if (stage === 0) return [['Posture', 'waiting']];
  if (stage < 3) return [['Posture', 'done'], ['Alignment', 'adjust']];
  if (stage === 3) return [['Posture', 'done'], ['Alignment', 'done'], ['Suction', 'waiting']];
  if (stage === 4) return [['Posture', 'done'], ['Alignment', 'done'], ['Suction', 'done'], ['Battery', 'waiting']];
  return [['Posture', 'done'], ['Alignment', 'done'], ['Suction', 'done'], ['Battery', 'done']];
}

v4Fit = function () {
  const rawStage = state.fitStage || 0;
  const counting = rawStage >= 6;
  const stage = counting ? 5 : rawStage;
  const checks = f24Checks(stage);
  const adjusting = checks.some(([label, kind]) => label === 'Alignment' && kind === 'adjust');
  const count = rawStage === 6 ? '3' : rawStage === 7 ? '2' : rawStage === 8 ? '1' : 'START';
  const copy = counting
    ? `<span class="f22-count-copy">${count}<small>${count === 'START' ? 'Pumping begins now' : ''}</small></span>`
    : adjusting ? 'Almost there. Follow the on-screen guide to<br>make a small adjustment.'
      : stage >= 5 ? 'Everything is ok !' : 'Checking your fit…';
  return `<div class="v4-overlay"><section class="v4-fit r2-fit f21-fit f22-fit ${counting ? 'f22-counting' : ''}"><h2>Fit Check</h2><div class="v4-fit-chips f21-chips">${checks.map(([label, kind], index) => `<span class="v4-fit-chip f21-chip f21-${kind}" style="--delay:${index * 90}ms">${f21Icon(kind)}${label}</span>`).join('')}</div><p class="v4-fit-copy">${copy}</p><div class="v4-fit-pumps f21-pumps"><div class="v4-fit-unit"><span class="hardware"><img src="${r2Asset('control-pumps.png')}" alt="Left pump"></span><p>L</p></div><div class="v4-fit-unit right ${adjusting ? 'f21-adjusting' : ''}">${adjusting ? `<img class="f21-guide" src="${r2Asset('fit-guide.svg')}" alt="Angle adjustment guide">` : ''}<span class="hardware"><img src="${r2Asset('control-pumps.png')}" alt="Right pump"></span><p>R</p></div></div></section></div>`;
};
