/* A 20-minute pumping session compressed into a 55-second product demo.
   Both sides share one curve; the right side only carries a small (+3%) offset. */
var air2DemoRun = { expressionAt: null, prompted: false };
function air2Round(value) { return Math.round(value * 100) / 100; }
function air2Amounts(seconds, mode) {
  var t = Math.max(0, seconds || 0), base;
  if (mode === 'stimulation') base = Math.min(.28, Math.max(0, (t - 3) * .018));
  else {
    var expressionSeconds = Math.max(0, t - (air2DemoRun.expressionAt == null ? 18 : air2DemoRun.expressionAt));
    base = Math.min(6.8, .28 + expressionSeconds * .18);
  }
  return { l: air2Round(base), r: air2Round(Math.min(6.95, base * 1.035 + (base ? .01 : 0))) };
}
function air2PaintRun() {
  if (!state.running) {
    air2DemoRun.expressionAt = null; air2DemoRun.prompted = false;
    state.letDownPrompt = false; state.timer = 0;
    return;
  }
  if (state.paused) return;
  var seconds = state.timer || 0;
  if (seconds >= 18 && state.mode === 'stimulation') {
    if (state.auto) { state.mode = 'expression'; air2DemoRun.expressionAt = seconds; state.letDownPrompt = false; }
    else if (!air2DemoRun.prompted) { air2DemoRun.prompted = true; state.letDownPrompt = true; }
  }
  if (state.mode === 'expression' && air2DemoRun.expressionAt == null) air2DemoRun.expressionAt = seconds;
  var amounts = air2Amounts(seconds, state.mode === 'mixed' ? 'expression' : state.mode);
  state.milkL = amounts.l; state.milkR = amounts.r;
}
setInterval(function () {
  if (!state.running) { if (state.timer) state.timer = 0; return; }
  if (state.paused) return;
  air2PaintRun(); v4View();
}, 1000);
