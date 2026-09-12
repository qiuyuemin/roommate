/* Running vessels use the Figma-exported matte base asset. */
function c32Vessel(side, amount) {
  var stage = c30Stage(amount), right = side === 'r';
  var source = `./assets/figma-control-r32/vessel-${right ? 'r' : 'l'}.svg`;
  var raw = Math.max(0, Number(amount) || 0);
  var level = Math.round(Math.min(1, raw / 7) * 58);
  var label = raw <= .05 ? '0 oz' : `${raw.toFixed(1)} oz`;
  return `<div class="v4-pump c32-pump ${right ? 'right' : ''}"><span class="c32-vessel ${right ? 'c32-right' : 'c32-left'} c32-${stage}"><img class="c32-base" src="${source}" alt="Milk container">${stage === 'empty' ? '' : `<span class="c32-liquid-clip"><span class="c32-liquid" style="--liquid-height:${Math.max(18,level)}px"><svg viewBox="0 0 100 16" preserveAspectRatio="none" aria-hidden="true"><path d="M0 8 Q12.5 4 25 8 T50 8 T75 8 T100 8 V16 H0Z"/></svg><i></i></span></span>`}${c30Drops(stage)}</span><span class="amount">${label}</span></div>`;
}
v4Hardware = function (side, amount) { return state.running ? c32Vessel(side, amount) : c15Hardware(side, amount); };

if (state.reviewFrozen && String(state.reviewScreenId || '').startsWith('control-')) {
  document.body.classList.remove('review-static');
  state.reviewFrozen = false;
  v4View = function () { root.innerHTML = v4Control(); };
  view = v4View;
}

/* Direct, pointer-captured Dose controller: three positions, shared 0–15 range. */
(function () {
  var dose = null;
  function slot(value) { return value <= 5 ? 0 : value <= 10 ? 1 : 2; }
  window.addEventListener('pointerdown', function (event) {
    var track = event.target.closest && event.target.closest('#demo [data-v4-drag="both"]');
    if (!track) return;
    event.preventDefault();
    track.setPointerCapture && track.setPointerCapture(event.pointerId);
    dose = { id:event.pointerId, y:event.clientY, l:state.levelL, r:state.levelR };
  }, true);
  window.addEventListener('pointermove', function (event) {
    if (!dose || event.pointerId !== dose.id) return;
    event.preventDefault();
    var delta = Math.max(-3, Math.min(3, Math.round((dose.y - event.clientY) / 18)));
    state.levelL = Math.max(0, Math.min(15, dose.l + delta));
    state.levelR = Math.max(0, Math.min(15, dose.r + delta));
    state.dosePosition = slot(Math.round((state.levelL + state.levelR) / 2));
    v4View();
  }, true);
  window.addEventListener('pointerup', function (event) { if (dose && event.pointerId === dose.id) dose = null; }, true);
  window.addEventListener('pointercancel', function () { dose = null; }, true);
})();

if (String(state.reviewScreenId || '').startsWith('control-')) v4View();
