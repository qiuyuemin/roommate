var v4SeenExpression = false;
setInterval(() => {
  if (!state.running || state.paused) return;
  if (state.milkL < .1) { state.milkL = .1; state.milkR = .1; }
  if (state.selectedProgram === 'Milk Boost' && state.mode === 'stimulation' && state.milkL < 4) { state.milkL = 5.1; state.milkR = 6.3; }
  if (state.auto && state.mode === 'expression' && !state.selectedProgram && !v4SeenExpression) { state.milkL = 1.1; state.milkR = 1.3; v4SeenExpression = true; }
  if (state.selectedProgram === 'Milk Boost' && state.mode === 'expression' && state.milkL < 6) { state.milkL = 6.5; state.milkR = 6.9; }
  state.milkL = +(state.milkL + .04).toFixed(2);
  state.milkR = +(state.milkR + .05).toFixed(2);
  v4View();
}, 1000);
