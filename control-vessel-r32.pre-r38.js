/* Running vessels use the exported Figma base. Liquid and drops are independent overlay layers. */
function c32Vessel(side, amount) {
  var right = side === 'r', raw = Math.max(0, Number(amount) || 0);
  var level = Math.max(0, Math.min(58, Math.round(raw / AIR2_BOWL_CAPACITY_OZ * 58)));
  var flow = state.paused ? 'paused' : (state.flowKind || 'none');
  var label = raw <= .02 ? '0 oz' : `${raw.toFixed(1)} oz`;
  return `<div class="v4-pump c32-pump ${right ? 'right' : ''}"><span class="c32-vessel ${right ? 'c32-right' : 'c32-left'} c32-flow-${flow}"><img class="c32-base" src="./assets/figma-control-r32/vessel-${right ? 'r' : 'l'}.svg" alt="Milk container"><span class="c32-liquid-clip" style="--liquid-height:${level}px"><span class="c32-liquid"><svg viewBox="0 0 100 16" preserveAspectRatio="none" aria-hidden="true"><path d="M0 8 Q12.5 4 25 8 T50 8 T75 8 T100 8 V16 H0Z"/></svg><i></i></span></span>${c32Drops(flow)}</span><span class="amount">${label}</span></div>`;
}
function c32Drops(flow) {
  var count = flow === 'low' ? 1 : flow === 'medium' ? 3 : flow === 'high' ? 6 : 0;
  return count ? `<span class="c32-drops c32-drops-${flow}">${Array.from({length:count},function(_,i){return `<img src="./assets/figma-control-r15/milk-drop.svg" style="--drop:${i}" alt="">`;}).join('')}</span>` : '';
}
v4Hardware = function (side, amount) { return state.running ? c32Vessel(side, amount) : c15Hardware(side, amount); };
if (state.reviewFrozen && String(state.reviewScreenId || '').startsWith('control-')) { document.body.classList.remove('review-static'); state.reviewFrozen=false; v4View=function(){root.innerHTML=v4Control();}; view=v4View; }

/* Spring slider: temporary visual offset ±3; release returns to center but retains both values. */
(function () {
  var dose = null;
  function clamp15(value) { return Math.max(0, Math.min(15, value)); }
  window.addEventListener('pointerdown', function(event) {
    var track = event.target.closest && event.target.closest('#demo [data-v4-drag="both"]'); if (!track) return;
    event.preventDefault(); track.setPointerCapture && track.setPointerCapture(event.pointerId);
    dose={id:event.pointerId,y:event.clientY,l:state.levelL,r:state.levelR}; state.doseDrag=0;
  }, true);
  window.addEventListener('pointermove', function(event) {
    if (!dose || event.pointerId !== dose.id) return; event.preventDefault();
    var delta=Math.max(-3,Math.min(3,Math.round((dose.y-event.clientY)/18)));
    state.doseDrag=delta; state.levelL=clamp15(dose.l+delta); state.levelR=clamp15(dose.r+delta); v4View();
  }, true);
  function release(event){if(!dose || (event && event.pointerId!==dose.id))return;dose=null;state.doseDrag=0;v4View();}
  window.addEventListener('pointerup',release,true); window.addEventListener('pointercancel',release,true);
})();
if (String(state.reviewScreenId || '').startsWith('control-')) v4View();
