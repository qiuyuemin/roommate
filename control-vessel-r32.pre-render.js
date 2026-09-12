/* Running state only: exact Figma vessel base in the same two 180px cells as idle renders. */
function c32Vessel(side, amount) {
  const stage = c30Stage(amount), right = side === 'r';
  const source = `./assets/figma-control-r32/vessel-${right ? 'r' : 'l'}.svg`;
  const level = stage === 'low' ? 22 : stage === 'medium' ? 34 : 46;
  const label = stage === 'empty' ? '0 oz' : `${amount.toFixed(1)} oz`;
  return `<div class="v4-pump c32-pump ${right ? 'right' : ''}"><span class="c32-vessel ${right ? 'c32-right' : 'c32-left'} c32-${stage}"><img class="c32-base" src="${source}" alt="Milk container">${stage === 'empty' ? '' : `<span class="c32-liquid-clip"><span class="c32-liquid" style="--liquid-height:${level}px"><svg viewBox="0 0 100 16" preserveAspectRatio="none" aria-hidden="true"><path d="M0 8 Q12.5 4 25 8 T50 8 T75 8 T100 8 V16 H0Z"/></svg><i></i></span></span>`}${c30Drops(stage)}</span><span class="amount">${label}</span></div>`;
}
v4Hardware = function (side, amount) { return state.running ? c32Vessel(side, amount) : c15Hardware(side, amount); };

/* Keep review URLs interactive only for the central Both/Dose control. */
(() => {
  let dose = null;
  window.addEventListener('pointerdown', event => {
    const track = event.target.closest?.('#demo [data-v4-drag="both"]');
    if (!track) return;
    event.preventDefault(); event.stopImmediatePropagation();
    dose = { id: event.pointerId, y: event.clientY, l: state.levelL, r: state.levelR };
  }, true);
  window.addEventListener('pointermove', event => {
    if (!dose || event.pointerId !== dose.id) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const delta = Math.max(-3, Math.min(3, Math.round((dose.y - event.clientY) / 18)));
    state.levelL = Math.max(0, Math.min(15, dose.l + delta));
    state.levelR = Math.max(0, Math.min(15, dose.r + delta));
    root.innerHTML = v4Control();
  }, true);
  window.addEventListener('pointerup', event => { if (dose && event.pointerId === dose.id) { event.stopImmediatePropagation(); dose = null; } }, true);
  window.addEventListener('pointercancel', () => { dose = null; }, true);
})();
