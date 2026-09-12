/* R46: final review-screen repaint and the Milk Boost state card. */
(function () {
  function clock(seconds) {
    var value = Math.max(0, Math.floor(Number(seconds) || 0));
    return String(Math.floor(value / 60)).padStart(2, '0') + ':' + String(value % 60).padStart(2, '0');
  }

  function boostTiming() {
    return state.running ? clock(state.timer || 0) + ' / 20:00' : '20:00';
  }

  function boostHeader() {
    return '<div class="r43-boost-head">' +
      '<span class="r43-boost-title">Milk Boost <em class="r43-boost-time">' + boostTiming() + '</em></span>' +
      '<button class="r43-boost-arrow" data-v4="list" aria-label="Open program list"><span aria-hidden="true">›</span></button>' +
    '</div>';
  }

  function milkBoostCard() {
    if (!state.auto) {
      return '<section class="v4-auto-card r43-boost-card r43-boost-manual">' + boostHeader() +
        '<div class="r43-boost-program" aria-label="Milk Boost program sequence"><i class="r43-program-start"></i><i class="r43-program-middle"></i></div>' +
        '<div class="r43-boost-switch">Auto Switch ' + v4Switch() + '</div></section>';
    }
    var isExpression = state.mode === 'expression';
    var phase = isExpression ? 'Expression' : state.mode === 'mixed' ? 'Mixed' : 'Stimulation';
    return '<section class="v4-auto-card r43-boost-card ' + (isExpression ? 'r43-boost-expression' : 'r43-boost-stimulation') + '">' +
      boostHeader() + '<p class="r43-boost-phase">' + phase + '</p>' +
      '<div class="r43-boost-switch">Auto Switch ' + v4Switch() + '</div></section>';
  }

  var fallbackAutoCard = window.v4AutoCard;
  window.v4AutoCard = function (kind, title) {
    return typeof state !== 'undefined' && state.selectedProgram === 'Milk Boost'
      ? milkBoostCard()
      : fallbackAutoCard.apply(this, arguments);
  };

  window.h7Battery = function (side, value) {
    var level = Math.max(0, Math.min(100, Number(value) || 0));
    return '<span class="h7-battery r43-dock-battery"><b>' + side + '</b><i>' +
      '<span class="r43-battery-body" style="--r44-level:' + level + '%"><strong>' + value + '</strong></span><em></em></i></span>';
  };

  /* review-state intentionally freezes v4View. Repaint its one initial frame once
     all component overrides are available, without changing the review state. */
  function repaintFrozenReview() {
    var host = document.getElementById('demo');
    if (typeof state === 'undefined' || !state.reviewFrozen || !host) return;
    var registry = typeof AIR2_SCREEN_REGISTRY === 'undefined' ? [] : AIR2_SCREEN_REGISTRY;
    var record = registry.find(function (item) { return item.id === state.reviewScreenId; });
    var page = record && record.state && record.state.page;
    if (page === 'control' && typeof v4Control === 'function') host.innerHTML = v4Control();
    if (page === 'home' && typeof v4Home === 'function') host.innerHTML = v4Home();
  }

  repaintFrozenReview();
})();
