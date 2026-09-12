/* Control components are driven by the active pumping mode, not by page-only CSS. */
function c12Limit() { return state.mode === 'expression' ? 9 : 5; }
function c12ClampLevels() {
  const max = c12Limit();
  state.levelL = Math.max(1, Math.min(max, state.levelL));
  state.levelR = Math.max(1, Math.min(max, state.levelR));
}

v4Track = function (side, value) {
  const max = c12Limit();
  const top = Math.round((max - value) / (max - 1) * 134);
  return `<section class="v4-level c12-level c12-${max}"><label>${side.toUpperCase()} Level</label><div class="v4-track" data-v4-drag="level" data-side="${side}"><span class="ticks">${'<i></i>'.repeat(max)}</span><span class="v4-level-value" style="top:${top}px">${value}</span></div></section>`;
};

v4Controls = function () {
  c12ClampLevels();
  return `<section class="v4-levels c12-levels c12-${c12Limit()}">${v4Track('l',state.levelL)}<section class="v4-both"><label><img src="${r2Asset('control-link.svg')}" alt=""> Both</label><div class="v4-both-box" data-v4-drag="both"><span class="v4-both-lines">${'<i></i>'.repeat(7)}</span><i class="v4-both-knob"><img src="${reviewAsset('both-knob.svg')}" alt="Drag both levels"></i></div></section>${v4Track('r',state.levelR)}</section><section class="v4-speed"><h2>Speed</h2><div class="v4-speed-list">${[1,2,3,4,5].map(n => `<button data-v4="speed" data-speed="${n}" class="${state.speed===n?'active':''}">${n}</button>`).join('')}</div></section>`;
};

v4ManualCard = function () {
  const expression = state.mode === 'expression';
  const title = expression ? 'Expression' : 'Stimulation';
  const tag = expression ? '<em class="v4-time c12-time">02:01</em>' : '';
  return `<section class="v4-manual-card c12-manual ${expression?'expression':''}"><div class="v4-manual-head"><span>${title}${tag}</span><button class="r2-card-arrow" data-v4="list"><img src="${r2Asset('auto-chevron.svg')}" alt="Open list"></button></div><div class="v4-mode-tabs">${v4ModeTab('stimulation','Stimulation','./assets/figma-v2/icon-stimulation.svg')}${v4ModeTab('expression','Expression','./assets/figma-v2/icon-expression.svg')}${v4ModeTab('mixed','Mixed','./assets/figma-v2/icon-mixed.svg')}</div><div class="v4-auto-toggle">Auto Switch ${v4Switch()}</div></section>`;
};

v4AutoCard = function (kind, title, tag) {
  const expression = kind === 'expression';
  const modeTitle = title || (expression ? 'Expression' : 'Stimulation');
  const timer = tag || (expression ? '02:01' : '');
  return `<section class="v4-auto-card r2-auto-card c12-auto ${expression?'expression':''} ${state.selectedProgram?'program':''}"><div class="v4-auto-content"><span class="v4-auto-title"><img src="${expression?r2Asset('list-expression.svg'):r2Asset('auto-heart.svg')}" alt="">${modeTitle}${timer?`<em class="v4-time c12-time">${timer}</em>`:''}</span><button class="r2-card-arrow" data-v4="list"><img src="${r2Asset('auto-chevron.svg')}" alt="Open list"></button></div><div class="v4-auto-line">Auto Switch ${v4Switch()}</div></section>`;
};

document.addEventListener('click', event => {
  const expression = event.target.closest('#demo [data-v4="mode"][data-mode="expression"]');
  if (!expression || document.body.classList.contains('review-static')) return;
  if (state.auto && !state.running) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }
  state.levelL = 5;
  state.levelR = 9;
}, true);

document.addEventListener('click', event => {
  const stimulation = event.target.closest('#demo [data-v4="mode"][data-mode="stimulation"]');
  if (!stimulation || document.body.classList.contains('review-static')) return;
  state.levelL = 2;
  state.levelR = 4;
}, true);
