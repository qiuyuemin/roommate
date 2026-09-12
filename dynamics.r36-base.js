/* 55-second mock: physiological flow is independent from the selected pumping mode.
   One bowl holds 180 ml = 6.09 oz; this mock ends the session at its full capacity. */
var AIR2_BOWL_CAPACITY_OZ = 6.09;
var air2DemoRun = { prompted:false, lastFlow:'none', autoMoved:false, finishing:false };
function air2Round(value) { return Math.round(value * 100) / 100; }
function air2FlowAt(second) {
  var t = Math.max(0, second || 0);
  if (t < 8) return 0;
  if (t < 18) return .012 + (t - 8) * .006;             // barely perceptible
  if (t < 31) return .10 + (t - 18) * .022;              // let-down builds
  if (t < 43) return .386 - (t - 31) * .018;             // peak then declines
  return Math.max(.018, .17 - (t - 43) * .024);          // single-drop tail
}
function air2FlowKind(flow) { return flow < .01 ? 'none' : flow < .09 ? 'low' : flow < .22 ? 'medium' : 'high'; }
function air2IntegratedMilk(second, side) {
  var total = 0, t = Math.max(0, Math.floor(second || 0));
  for (var s = 0; s < t; s += 1) total += air2FlowAt(s);
  /* Both bowls follow the same fingerprint; only a subtle fixed side difference remains. */
  return Math.min(AIR2_BOWL_CAPACITY_OZ, total * (side === 'r' ? 1.025 : .985));
}
function air2DismissNotice() { state.controlNotice = null; }
function air2ShowNotice(kind, text) {
  state.controlNotice = { kind:kind, text:text, id:Date.now() };
  setTimeout(function () { if (state.controlNotice && state.controlNotice.kind === kind) { air2DismissNotice(); v4View(); } }, 3600);
}
function air2FinishFullBowl() {
  if (air2DemoRun.finishing) return;
  air2DemoRun.finishing = true;
  state.running = false; state.paused = false;
  air2ShowNotice('complete', 'One bowl is full. Pumping has finished.');
  setTimeout(function () { state.controlNotice = null; state.modal = 'log'; state.timer = 0; air2DemoRun.finishing = false; v4View(); }, 750);
}
function air2PaintRun() {
  if (!state.running) return;
  if (state.paused) return;
  var t = state.timer || 0;
  var flow = air2FlowAt(t);
  var kind = air2FlowKind(flow);
  state.flowKind = kind;
  state.flowRate = flow;
  state.milkL = air2Round(air2IntegratedMilk(t, 'l'));
  state.milkR = air2Round(air2IntegratedMilk(t, 'r'));
  if (!air2DemoRun.autoMoved && t >= 18 && state.auto && state.mode === 'stimulation') {
    air2DemoRun.autoMoved = true; state.mode = 'expression';
    air2ShowNotice('auto', 'Let-down detected. Switched to Expression mode.');
  }
  if (!air2DemoRun.prompted && t >= 18 && !state.auto && state.mode === 'stimulation') {
    air2DemoRun.prompted = true;
    air2ShowNotice('suggestion', 'Let-down detected. We recommend switching to Expression mode.');
  }
  if (state.milkL >= AIR2_BOWL_CAPACITY_OZ || state.milkR >= AIR2_BOWL_CAPACITY_OZ) air2FinishFullBowl();
}
setInterval(function () {
  if (!state.running || state.paused) return;
  air2PaintRun(); v4View();
}, 1000);
