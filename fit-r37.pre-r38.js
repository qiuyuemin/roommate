/* One deterministic fit-check timeline shared by Home and Pump Control. */
(function () {
  var timers = [];
  function clearTimeline() { timers.forEach(clearTimeout); timers = []; }
  window.v4RunFit = function () {
    clearTimeline(); state.modal = 'fit'; state.fitAdjust = true; state.fitStage = 0; v4View();
    [[1,620],[2,1180],[3,2380],[4,3060],[5,3720],[6,4380],[7,5380],[8,6380],[9,7380]].forEach(function (entry) {
      timers.push(setTimeout(function () { state.fitStage = entry[0]; v4View(); }, entry[1]));
    });
    /* START renders once, then remains visible for 1.5 seconds. */
    timers.push(setTimeout(function () { state.modal = null; state.fitAdjust = false; state.running = true; state.paused = false; v4View(); }, 8880));
  };
})();
