/* Keep Expression's screen neutral. The warm gradient belongs only to the let-down notice. */
v4ModeTab = function (mode, title, icon) {
  const active = state.mode === mode;
  const mapped = mode === 'stimulation'
    ? (active ? './assets/figma-v2/icon-stimulation.svg' : r2Asset('list-heart.svg'))
    : mode === 'expression'
      ? (active ? './assets/figma-v2/icon-expression.svg' : r2Asset('list-expression.svg'))
      : icon;
  return `<button data-v4="mode" data-mode="${mode}" class="${active ? 'active' : ''}"><img src="${mapped}" alt="">${title}</button>`;
};

/* Auto control uses empty vessels until the milk-flow animation is implemented. */
v4Hardware = function (side, amount, pod) {
  const right = side === 'r';
  if (!pod) return `<div class="v4-pump ${right?'right':''}"><span class="hardware r2-hardware"><img src="${r2Asset('control-pumps.png')}" alt="Air2 pump"></span><span class="r2-reflection"><img src="${r2Asset('control-pumps.png')}" alt=""></span><span class="amount">${amount.toFixed(1)} oz</span></div>`;
  const expression = pod === 'expression' || state.mode === 'expression';
  const file = expression ? `expr-pod-${right?'r':'l'}.svg` : `auto-pod-${right?'r':'l'}.svg`;
  return `<div class="v4-pump c14-empty-pump ${right?'right':''}"><span class="r2-pod ${expression?'expression':''}"><img src="${r2Asset(file)}" alt="Empty milk vessel"></span><span class="amount">0 oz</span></div>`;
};
