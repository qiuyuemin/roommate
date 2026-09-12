/* Session display rule: containers belong to an active session, never to a mode. */
function c15MilkState(amount) {
  if (amount <= 0.05) return 'empty';
  if (amount < 2.5) return 'low';
  if (amount < 5) return 'medium';
  return 'high';
}

function c15Flow(kind) {
  if (kind === 'empty') return '';
  const count = kind === 'low' ? 1 : kind === 'medium' ? 3 : 5;
  return `<span class="c15-flow c15-${kind}">${Array.from({ length: count }, (_, index) => `<img src="./assets/figma-control-r15/milk-drop.svg" style="--drop:${index}" alt="">`).join('')}</span>`;
}

function c15Hardware(side, amount) {
  const right = side === 'r';
  return `<div class="v4-pump ${right ? 'right' : ''}"><span class="hardware r2-hardware"><img src="${r2Asset('control-pumps.png')}" alt="Air 2 pump"></span><span class="r2-reflection"><img src="${r2Asset('control-pumps.png')}" alt=""></span><span class="amount">${amount.toFixed(1)} oz</span></div>`;
}

v4Hardware = function (side, amount) {
  /* `running` stays true when paused, so a paused session keeps its vessels visible. */
  if (!state.running) return c15Hardware(side, amount);
  const right = side === 'r';
  const kind = c15MilkState(amount);
  const fill = Math.round(Math.max(0, Math.min(48, amount / 7 * 48)));
  const label = amount <= 0.05 ? '0 oz' : `${amount.toFixed(1)} oz`;
  const file = `expr-pod-${right ? 'r' : 'l'}.svg`;
  return `<div class="v4-pump c15-pump ${right ? 'right' : ''}"><span class="r2-pod c15-vessel c15-${kind}" style="--milk-height:${fill}px"><img src="${r2Asset(file)}" alt="Milk vessel"><i class="c15-liquid"></i>${c15Flow(kind)}</span><span class="amount">${label}</span></div>`;
};
