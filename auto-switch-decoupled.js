(function () {
  if (!document.querySelector('link[data-auto-switch-decoupled]')) {
    var styles = document.createElement('link');
    styles.rel = 'stylesheet';
    styles.href = './auto-switch-decoupled.css?v=20260817-13';
    styles.setAttribute('data-auto-switch-decoupled', '');
    document.head.appendChild(styles);
  }
  if (!document.querySelector('link[data-vessel-outline-fix]')) {
    var vesselStyles = document.createElement('link');
    vesselStyles.rel = 'stylesheet';
    vesselStyles.href = './vessel-outline-fix.css?v=1';
    vesselStyles.setAttribute('data-vessel-outline-fix', '');
    document.head.appendChild(vesselStyles);
  }

  function syncSystemBarColor() {
    var theme = document.querySelector('meta[name="theme-color"]');
    if (!theme) return;
    var page = document.querySelector('#demo > .v4-home') ? 'home' :
      document.querySelector('#demo > .v4-control.expression') ? 'expression' : 'default';
    theme.content = page === 'home' ? '#ffd9e0' : page === 'expression' ? '#ffdadd' : '#f9f7f5';
    document.documentElement.classList.remove('air2-page-home', 'air2-page-expression', 'air2-page-default');
    document.documentElement.classList.add('air2-page-' + page);
  }
  new MutationObserver(syncSystemBarColor).observe(document.getElementById('demo'), {childList:true,subtree:false,attributes:true});

  function switchComponent() {
    var control = v4Switch().replace('role="switch"', 'role="switch" aria-checked="' + state.auto + '" aria-label="Auto Switch"');
    return '<section class="auto-switch-component ' + (state.auto ? 'is-on' : 'is-off') + '" aria-label="Auto Switch control">' +
      '<span class="auto-switch-component__icon" aria-hidden="true"><i></i><b>✦</b></span>' +
      '<span class="auto-switch-component__copy"><span><b>Auto Switch</b><em>SMART</em></span><small>Automatically switch modes based on your milk flow</small></span>' +
      control +
    '</section>';
  }

  function syncAutoSwitchRing() {
    document.querySelectorAll('#demo .v4-controls').forEach(function (controls) {
      controls.classList.toggle('auto-switch-ring-on', !!state.auto);
    });
  }

  var holdToFinish = null;
  var holdToFinishPointer = null;
  function cancelHoldToFinish() {
    if (holdToFinish) clearTimeout(holdToFinish);
    holdToFinish = null;
    holdToFinishPointer = null;
    var finish = document.querySelector('#demo .v4-finish');
    if (finish) finish.classList.remove('holding');
  }

  function completeHoldToFinish() {
    holdToFinish = null;
    holdToFinishPointer = null;
    state.running = false;
    state.paused = false;
    state.modal = 'log';
    if (typeof window.v4View === 'function') window.v4View();
  }

  document.addEventListener('pointerdown', function (event) {
    var finish = event.target.closest && event.target.closest('#demo [data-v4="finish"]');
    if (!finish || document.body.classList.contains('review-static')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    cancelHoldToFinish();
    holdToFinishPointer = event.pointerId;
    finish.classList.add('holding');
    if (finish.setPointerCapture) {
      try { finish.setPointerCapture(event.pointerId); } catch (_) {}
    }
    holdToFinish = setTimeout(completeHoldToFinish, 2000);
  }, true);

  document.addEventListener('pointerup', function (event) {
    if (holdToFinishPointer == null || event.pointerId !== holdToFinishPointer) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    cancelHoldToFinish();
  }, true);

  document.addEventListener('pointercancel', function (event) {
    if (holdToFinishPointer == null || event.pointerId !== holdToFinishPointer) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    cancelHoldToFinish();
  }, true);

  document.addEventListener('click', function (event) {
    var finish = event.target.closest && event.target.closest('#demo [data-v4="finish"]');
    if (!finish) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  function stripEmbeddedSwitch(markup) {
    return markup
      .replace(/<div class="v4-auto-toggle">Auto Switch[\s\S]*?<\/div>(?=<\/section>)/, '')
      .replace(/<div class="v4-auto-line">Auto Switch[\s\S]*?<\/div>(?=<\/section>)/, '')
      .replace(/<div class="r43-boost-switch">Auto Switch[\s\S]*?<\/div>(?=<\/section>)/, '')
      .replace(/<div class="r49-boost__switch"><span>Auto Switch<\/span>[\s\S]*?<\/div>(?=<\/section>)/, '')
      .replace(/class="([^"]*(?:v4-manual-card|v4-auto-card|r49-boost-card)[^"]*)"/, function (_, classes) {
        return 'class="' + classes + (state.auto ? ' auto-switch-linked' : '') + '"';
      });
  }

  var previousManualCard = window.v4ManualCard;
  var previousAutoCard = window.v4AutoCard;

  window.v4ManualCard = v4ManualCard = function () {
    return stripEmbeddedSwitch(previousManualCard.apply(this, arguments)) + switchComponent();
  };

  window.v4AutoCard = v4AutoCard = function () {
    /* Auto Switch does not replace the manual program selector. Keep the
       Stimulation / Expression / Mixed controls available at all times. */
    if (!state.selectedProgram) {
      return stripEmbeddedSwitch(previousManualCard.apply(this, arguments)) + switchComponent();
    }
    return stripEmbeddedSwitch(previousAutoCard.apply(this, arguments)) + switchComponent();
  };

  var previousView = window.v4View;
  if (typeof previousView === 'function') {
    window.v4View = v4View = function () {
      previousView.apply(this, arguments);
      syncAutoSwitchRing();
      syncSystemBarColor();
    };
  }

  if (typeof window.v4View === 'function') window.v4View();
  syncAutoSwitchRing();
  syncSystemBarColor();
}());
