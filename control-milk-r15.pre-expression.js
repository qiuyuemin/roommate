function c15MilkState(amount) {
  if (amount <= 0.05) return 'empty';
  if (amount < 2.5) return 'low';
  if (amount < 5) return 'medium';
  return 'high';
}
function c15Flow(stateName) {
  if (stateName === 'empty') return '';
  const drops = stateName === 'low' ? 1 : stateName === 'medium' ? 3 : 5;
  return `<span class="c15-flow c15-${stateName}">${Array.from({length:drops}, (_, index) => `<img src="./assets/figma-control-r15/milk-drop.svg" style="--drop:${index}" alt="">`).join('')}</span>`;
}

v4Hardware = function (side, amount, pod) {
  const right = side === 'r';
  if (!pod) return `<div class="v4-pump ${right?'right':''}"><span class="hardware r2-hardware"><img src="${r2Asset('control-pumps.png')}" alt="Air2 pump"></span><span class="r2-reflection"><img src="${r2Asset('control-pumps.png')}" alt=""></span><span class="amount">${amount.toFixed(1)} oz</span></div>`;
  const expression = pod === 'expression' || state.mode === 'expression';
  const file = expression ? `expr-pod-${right?'r':'l'}.svg` : `auto-pod-${right?'r':'l'}.svg`;
  const visual = c15MilkState(amount);
  const fill = Math.round(Math.max(0, Math.min(48, amount / 7 * 48)));
  return `<div class="v4-pump c15-pump ${right?'right':''}"><span class="r2-pod c15-vessel c15-${visual} ${expression?'expression':''}" style="--milk-height:${fill}px"><img src="${r2Asset(file)}" alt="Milk vessel"><i class="c15-liquid"></i>${c15Flow(visual)}</span><span class="amount">${amount.toFixed(1)} oz</span></div>`;
};
