/* Running state only: Figma's vessel base remains in the same two 180px cells as idle hardware. */
function c32Vessel(side, amount) {
  const stage = c30Stage(amount), right = side === 'r';
  const source = `./assets/figma-control-r32/vessel-${right ? 'r' : 'l'}.svg`;
  const raw = Math.max(0, Number(amount) || 0);
  const fill = Math.round(Math.min(1, raw / 7) * 58);
  const level = stage === 'low' ? Math.max(18, fill) : stage === 'medium' ? Math.max(29, fill) : Math.max(42, fill);
  const label = raw <= .05 ? '0 oz' : `${raw.toFixed(1)} oz`;
  return `<div class="v4-pump c32-pump ${right ? 'right' : ''}"><span class="c32-vessel ${right ? 'c32-right' : 'c32-left'} c32-${stage}"><img class="c32-base" src="${source}" alt="Milk container">${stage === 'empty' ? '' : `<span class="c32-liquid-clip"><span class="c32-liquid" style="--liquid-height:${level}px"><svg viewBox="0 0 100 16" preserveAspectRatio="none" aria-hidden="true"><path d="M0 8 Q12.5 4 25 8 T50 8 T75 8 T100 8 V16 H0Z"/></svg><i></i></span></span>`}${c30Drops(stage)}</span><span class="amount">${label}</span></div>`;
}
v4Hardware = function (side, amount) { return state.running ? c32Vessel(side, amount) : c15Hardware(side, amount); };

/* This control screen is a live H5 demo: don't let the review wrapper consume the slider. */
if (state.reviewFrozen && String(state.reviewScreenId || '').startsWith('control-')) {
  document.body.classList.remove('review-static');
  state.reviewFrozen = false;
  v4View = function () { root.innerHTML = v4Control(); };
  view = v4View;
  v4View();
}

/* Both/Dose has exactly three visual positions. A vertical drag changes both side values by 0–3 levels. */
(() => {
  let dose = null;
  const position = value => value <= 5 ? 0 : value <= 10 ? 1 : 2;
  const render = () => v4View();
  window.addEventListener('pointerdown', event => {
    const track = event.target.closest?.('#demo [data-v4-drag="both"]');
    if (!track) return;
    event.preventDefault(); event.stopImmediatePropagation();
    dose = { id:event.pointerId, y:event.clientY, l:state.levelL, r:state.levelR };
  }, true);
  window.addEventListener('pointermove', event => {
    if (!dose || event.pointerId !== dose.id) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const change = Math.max(-3, Math.min(3, Math.round((dose.y - event.clientY) / 18)));
    state.levelL = Math.max(0, Math.min(15, dose.l + change));
    state.levelR = Math.max(0, Math.min(15, dose.r + change));
    state.dosePosition = position(Math.round((state.levelL + state.levelR) / 2));
    render();
  }, true);
  window.addEventListener('pointerup', event => { if (dose && event.pointerId === dose.id) { event.stopImmediatePropagation(); dose = null; } }, true);
  window.addEventListener('pointercancel', () => { dose = null; }, true);
})();
