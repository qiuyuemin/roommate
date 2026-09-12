/* Final control-page state rendering.  All modes use the same session clock. */
(function () {
  function currentTitle() {
    if (state.selectedProgram) return state.selectedProgram;
    return state.mode === 'expression' ? 'Expression' : state.mode === 'mixed' ? 'Mixed' : 'Stimulation';
  }
  function timerMarkup() {
    return state.running ? `<em class="v4-time c35-time">${time(state.timer || 0)}</em>` : '';
  }
  v4ManualCard = function () {
    var title = currentTitle();
    var suggestion = state.letDownPrompt && state.mode === 'stimulation'
      ? '<p class="c35-letdown">Let-down detected. We recommend switching to Expression mode.</p>' : '';
    return `<section class="v4-manual-card c12-manual c35-manual ${state.mode==='expression'?'expression':''}">${suggestion}<div class="v4-manual-head"><span>${title}${timerMarkup()}</span><button class="r2-card-arrow" data-v4="list"><img src="${r2Asset('auto-chevron.svg')}" alt="Open list"></button></div><div class="v4-mode-tabs">${v4ModeTab('stimulation','Stimulation','./assets/figma-v2/icon-stimulation.svg')}${v4ModeTab('expression','Expression','./assets/figma-v2/icon-expression.svg')}${v4ModeTab('mixed','Mixed','./assets/figma-v2/icon-mixed.svg')}</div><div class="v4-auto-toggle">Auto Switch ${v4Switch()}</div></section>`;
  };
  v4AutoCard = function (kind, title) {
    var expression = kind === 'expression';
    return `<section class="v4-auto-card r2-auto-card c12-auto ${expression?'expression':''} ${state.selectedProgram?'program':''}"><div class="v4-auto-content"><span class="v4-auto-title"><img src="${expression?r2Asset('list-expression.svg'):r2Asset('auto-heart.svg')}" alt="">${title || currentTitle()}${timerMarkup()}</span><button class="r2-card-arrow" data-v4="list"><img src="${r2Asset('auto-chevron.svg')}" alt="Open list"></button></div><div class="v4-auto-line">Auto Switch ${v4Switch()}</div></section>`;
  };
  v4Control = function () {
    var expression = state.mode === 'expression';
    var title = currentTitle();
    var card = state.selectedProgram || state.auto ? v4AutoCard(expression ? 'expression' : 'stimulation', title) : v4ManualCard();
    var autoNotice = expression && state.auto ? '<p class="v4-switch-note">“ Looks like let-down has started. I’ve switched to<br>Expression mode for you. ”</p>' : '';
    var actions = state.running ? `<div class="v4-actions"><button class="v4-finish" data-v4="finish"><i></i>Hold to Finish</button><button class="v4-pause ${state.paused?'play':''}" data-v4="pause">${state.paused?'▶':`<img src="${r2Asset('pause.svg')}" alt="Pause">`}</button></div>` : '<button class="v4-start" data-v4="start">Start Pumping</button>';
    var settings = r2IconStack('r2-settings',['control-setting-a.svg','control-setting-b.svg']);
    return `<section class="v4 v4-control ${expression?'expression':''}"><img class="v4-bg" src="./assets/figma-v2/control-bg.svg" alt="">${v4Status()}<header class="v4-top">${v4Back('home')}<h1>Pump Control</h1><button class="v4-circle">${settings}</button></header>${autoNotice}<div class="v4-pump-row">${v4Hardware('l',state.milkL)}${v4Hardware('r',state.milkR)}</div><main class="v4-controls">${card}${v4Controls()}</main>${actions}<i class="v4-home-indicator"></i></section>`;
  };
  /* Manual interaction clears the suggestion and starts the fast, expression curve. */
  document.addEventListener('click', function (event) {
    var expression = event.target.closest('#demo [data-v4="mode"][data-mode="expression"]');
    if (!expression) return;
    state.letDownPrompt = false;
    if (state.running && air2DemoRun.expressionAt == null) air2DemoRun.expressionAt = state.timer || 0;
  }, true);
  /* The old prototype has an 8-second auto transition. Keep this demo's threshold at 18s. */
  setInterval(function () {
    if (state.running && state.auto && (state.timer || 0) < 18 && state.mode === 'expression') {
      state.mode = 'stimulation';
    }
  }, 100);
  v4View();
})();
