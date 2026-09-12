/* Fixed Figma-size vessel layers: base → masked liquid → flow drops. */
function c29Stage(amount) { return amount <= .05 ? 'empty' : amount < 2.5 ? 'low' : amount < 5 ? 'medium' : 'high'; }
function c29Drops(stage) {
  if (stage === 'empty') return '';
  const count = stage === 'low' ? 1 : stage === 'medium' ? 3 : 6;
  return `<span class="c29-drops c29-${stage}" aria-hidden="true">${Array.from({length:count}, (_, i) => `<img src="./assets/figma-control-r15/milk-drop.svg" style="--drop:${i}" alt="">`).join('')}</span>`;
}
function c29Liquid(stage) {
  if (stage === 'empty') return '<span class="c29-liquid-clip"></span>';
  const height = stage === 'low' ? 22 : stage === 'medium' ? 34 : 46;
  return `<span class="c29-liquid-clip"><span class="c29-liquid" style="--liquid-height:${height}px"><svg class="c29-wave" viewBox="0 0 240 20" preserveAspectRatio="none" aria-hidden="true"><path d="M0 10 Q15 1 30 10 T60 10 T90 10 T120 10 T150 10 T180 10 T210 10 T240 10 V20 H0Z"/></svg><i></i></span></span>`;
}
function c29Vessel(side, amount) {
  const stage = c29Stage(amount), right = side === 'r';
  const source = `./assets/figma-control-r28/vessel-${right ? 'r' : 'l'}-empty.svg`;
  const label = stage === 'empty' ? '0 oz' : `${amount.toFixed(1)} oz`;
  return `<div class="v4-pump c29-pump ${right ? 'right' : ''}"><span class="c29-vessel c29-${stage} ${right ? 'c29-right' : 'c29-left'}"><img class="c29-base" src="${source}" alt="Milk container">${c29Liquid(stage)}${c29Drops(stage)}</span><span class="amount">${label}</span></div>`;
}
v4Hardware = function (side, amount) { return state.running ? c29Vessel(side, amount) : c15Hardware(side, amount); };
if (state.reviewFrozen && String(state.reviewScreenId || '').startsWith('control-')) root.innerHTML = v4Control();
