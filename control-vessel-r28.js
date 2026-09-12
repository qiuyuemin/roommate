/* Container rendering follows the Figma hierarchy exactly:
   1) exported empty-vessel base, 2) masked animated milk surface, 3) independent flow drops. */
function c28Stage(amount) { return amount <= .05 ? 'empty' : amount < 2.5 ? 'low' : amount < 5 ? 'medium' : 'high'; }
function c28Drops(stage) {
  if (stage === 'empty') return '';
  const count = stage === 'low' ? 1 : stage === 'medium' ? 3 : 6;
  return `<span class="c28-drops c28-${stage}" aria-hidden="true">${Array.from({length:count}, (_, i) => `<img src="./assets/figma-control-r15/milk-drop.svg" style="--drop:${i}" alt="">`).join('')}</span>`;
}
function c28Vessel(side, amount) {
  const stage = c28Stage(amount), right = side === 'r';
  const level = stage === 'empty' ? 0 : stage === 'low' ? 17 : stage === 'medium' ? 28 : 39;
  const source = `./assets/figma-control-r28/vessel-${right ? 'r' : 'l'}-empty.svg`;
  const label = stage === 'empty' ? '0 oz' : `${amount.toFixed(1)} oz`;
  return `<div class="v4-pump c28-pump ${right ? 'right' : ''}"><span class="c28-vessel ${right ? 'c28-right' : 'c28-left'} c28-${stage}" style="--milk-level:${level}px"><img class="c28-base" src="${source}" alt="Milk container"><i class="c28-milk"><i class="c28-wave"></i></i>${c28Drops(stage)}</span><span class="amount">${label}</span></div>`;
}
v4Hardware = function (side, amount) { return state.running ? c28Vessel(side, amount) : c15Hardware(side, amount); };
/* review-state intentionally freezes its initial paint; update once when this final renderer is installed. */
if (state.reviewFrozen && String(state.reviewScreenId || '').startsWith('control-')) root.innerHTML = v4Control();
