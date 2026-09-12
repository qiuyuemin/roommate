/* The running control URL is a live demo, not a frozen review thumbnail. */
if (state.reviewFrozen && String(state.reviewScreenId || '').startsWith('control-')) {
  document.body.classList.remove('review-static');
  state.reviewFrozen = false;
  v4View = function () { root.innerHTML = v4Control(); };
  view = v4View;
  v4View();
}

/* The Figma device area is two 180px cells. These are the same coordinates as its idle render. */
function c31Vessel(side, amount) {
  const stage = c30Stage(amount), right = side === 'r';
  const source = `./assets/figma-control-r28/vessel-${right ? 'r' : 'l'}-empty.svg`;
  const level = stage === 'low' ? 22 : stage === 'medium' ? 34 : 46;
  const label = stage === 'empty' ? '0 oz' : `${amount.toFixed(1)} oz`;
  return `<div class="v4-pump c31-pump ${right?'right':''}"><span class="c31-vessel ${right?'c31-right':'c31-left'} c31-${stage}"><img class="c31-base" src="${source}" alt="Milk container">${stage==='empty'?'':`<span class="c31-liquid-clip"><span class="c31-liquid" style="--liquid-height:${level}px"><svg viewBox="0 0 100 16" preserveAspectRatio="none" aria-hidden="true"><path d="M0 8 Q12.5 4 25 8 T50 8 T75 8 T100 8 V16 H0Z"/></svg><i></i></span></span>`}${c30Drops(stage)}</span><span class="amount">${label}</span></div>`;
}
v4Hardware = function (side, amount) { return state.running ? c31Vessel(side, amount) : c15Hardware(side, amount); };

/* Dose/Both slider: each drag moves both sides by up to three 0–15 levels. */
(() => {
  let dose = null;
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
    v4View();
  }, true);
  window.addEventListener('pointerup', event => { if (dose && event.pointerId === dose.id) { event.stopImmediatePropagation(); dose = null; } }, true);
  window.addEventListener('pointercancel', () => { dose = null; }, true);
})();
