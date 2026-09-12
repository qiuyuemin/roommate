/* Review notes 2026-08-13: list state and running-vessel presentation. */
(function () {
  /* Session analytics live only for this HTML lifetime. A refresh/new open
     starts from an empty chart; each completed pumping run appends one item. */
  state.air2SessionHistory = [];
  state.air2ActiveSessionId = null;
  state.lastSessionL = 0;
  state.lastSessionR = 0;
  state.lastSessionTotal = 0;
  /* Fit Check: preserve every check, remove only 3/2/1, then keep Start. */
  var r56FitTimers = [];
  window.v4RunFit = function () {
    r56FitTimers.forEach(clearTimeout);
    r56FitTimers = [];
    state.modal = 'fit';
    state.fitAdjust = true;
    state.fitStage = 0;
    air2DemoRun.leakTriggered = false;
    v4View();
    [[1,360],[2,720],[3,1420],[4,1760],[5,2100],[6,2440],[7,2820]].forEach(function (entry) {
      r56FitTimers.push(setTimeout(function () {
        state.fitStage = entry[0];
        v4View();
      }, entry[1]));
    });
    r56FitTimers.push(setTimeout(function () {
      state.modal = null;
      state.fitAdjust = false;
      state.running = true;
      state.paused = false;
      v4View();
    }, 3900));
  };

  var r56Fit = window.v4Fit;
  window.v4Fit = function () {
    if ((state.fitStage || 0) >= 7) {
      return '<div class="v4-overlay"><section class="v4-fit r2-fit f21-fit f22-fit"><h2>Fit Check</h2><div class="v4-countdown">Start!<small>Pumping begins now</small></div></section></div>';
    }
    var html = r56Fit();
    if ((state.fitStage || 0) === 6) {
      html = html.replace(/\s*f22-counting/g, '')
        .replace(/<p class="v4-fit-copy"><span class="f22-count-copy">[\s\S]*?<\/span><\/p>/, '<p class="v4-fit-copy">Everything is ok !</p>');
    }
    return html;
  };

  var FULL_OZ = 6.09;
  function air2CaptureSession(left, right) {
    state.lastSessionL = Math.max(0, Number(left) || 0);
    state.lastSessionR = Math.max(0, Number(right) || 0);
    state.lastSessionTotal = air2Round(state.lastSessionL + state.lastSessionR);
    if (!Array.isArray(state.air2SessionHistory)) state.air2SessionHistory = [];
    var id = state.air2ActiveSessionId || ('session-' + Date.now());
    var existing = state.air2SessionHistory.find(function (item) { return item.id === id; });
    var record = { id: id, left: state.lastSessionL, right: state.lastSessionR, total: state.lastSessionTotal };
    if (existing) Object.assign(existing, record);
    else state.air2SessionHistory.push(record);
    state.air2ActiveSessionId = id;
  }
  function air2LastSessionTotal() {
    if (isFinite(Number(state.lastSessionTotal)) && Number(state.lastSessionTotal) > 0) return Number(state.lastSessionTotal);
    return Math.max(0, (Number(state.milkL) || 0) + (Number(state.milkR) || 0));
  }
  function air2ResetSelectionAfterEnd() {
    /* Manual runs always return to manual Stimulation. Program runs retain
       the chosen program but rewind its internal phase to Stimulation. */
    state.mode = 'stimulation';
    if (!state.selectedProgram && !state.air2SettlementProgram) state.selectedProgram = null;
    else state.selectedProgram = state.selectedProgram || state.air2SettlementProgram;
  }

  /* Final authority for automatic settlement. Milk Boost is a sensor-led
     demo: the bowls do not need to be full. The curve reaches roughly 4.2 oz
     per side, drops into the no-milk band, then settles after the notice. */
  function milkSignalAt(second) {
    var t = Math.max(0, Number(second) || 0);
    if (t < 10) return 0;                         // stimulation: no milk
    if (t < 14) return .008;                      // one slow droplet, held long enough to read
    if (t < 16) return .035;                      // small pre-let-down rise, still one droplet
    if (t < 30) return .145;                      // let-down surge; mode remains for 2 s
    if (t < 80) return Math.max(.025, .145 - (t - 30) * .00245); // gradual fade; about 4.2 oz at the end
    return .025;                                  // end signal (<= .03 g/s)
  }
  window.air2FlowAt = milkSignalAt;
  window.air2IntegratedMilk = function (second, side) {
    var grams = 0, t = Math.max(0, Math.floor(Number(second) || 0));
    for (var s = 0; s < t; s += 1) grams += milkSignalAt(s);
    var acceleratedOz = grams * 18 / 28.3495;
    return Math.min(FULL_OZ, acceleratedOz * (side === 'r' ? 1.018 : 1.015));
  };
  window.air2FinishFullBowl = function () {
    var left = Number(state.milkL) || 0, right = Number(state.milkR) || 0;
    if (left < FULL_OZ - .005 || right < FULL_OZ - .005 || air2DemoRun.finishing) return false;
    state.milkL = FULL_OZ;
    state.milkR = FULL_OZ;
    air2CaptureSession(state.milkL, state.milkR);
    state.air2SettlementProgram = state.selectedProgram || '';
    air2ResetSelectionAfterEnd();
    air2DemoRun.finishing = true;
    state.air2SessionEnded = true;
    state.running = false;
    state.paused = false;
    air2ShowNotice('complete', 'Both bowls are full. Pumping has finished.');
    setTimeout(function () {
      state.controlNotice = null;
      state.modal = 'log';
      air2DemoRun.finishing = false;
      v4View();
    }, 4000);
    return true;
  };
  window.air2PaintRun = function () {
    if (!state.running || state.paused) return;
    var t = Number(state.timer) || 0, flow = window.air2FlowAt(t);
    /* Legacy timers may still attempt to force Expression. Until this state
       machine has observed two real seconds of sustained high flow, keep the
       visible mode locked to Stimulation. */
    if (state.auto && !air2DemoRun.autoMoved && state.mode === 'expression') state.mode = 'stimulation';
    var extracting = state.mode === 'expression' || state.mode === 'mixed';
    var visualFlow = flow >= .05 && !extracting ? .012 : flow;
    var displayedFlow = state.auto && state.mode === 'stimulation' ? flow : visualFlow;
    state.flowKind = air2FlowKind(displayedFlow);
    state.flowRate = displayedFlow;
    var previousTick = Number(air2DemoRun.lastMilkTick);
    if (!isFinite(previousTick) || previousTick > t) previousTick = Math.max(0, t - 1);
    var elapsedTicks = Math.max(0, Math.min(2, t - previousTick));
    if (elapsedTicks > 0) {
      state.milkL = air2Round(Math.min(FULL_OZ, (Number(state.milkL) || 0) + visualFlow * 18 / 28.3495 * 1.015 * elapsedTicks));
      state.milkR = air2Round(Math.min(FULL_OZ, (Number(state.milkR) || 0) + visualFlow * 18 / 28.3495 * 1.018 * elapsedTicks));
    }
    air2DemoRun.lastMilkTick = t;
    var startSignal = flow >= .05;
    var endSignal = flow <= .03 && extracting;
    /* Use the session clock instead of render-call counts. v4View can render
       several times inside one second, which previously consumed the delay
       instantly and made Auto Switch appear simultaneous with let-down. */
    if (startSignal) {
      if (air2DemoRun.letdownDetectedAtMs == null || !isFinite(Number(air2DemoRun.letdownDetectedAtMs))) air2DemoRun.letdownDetectedAtMs = Date.now();
    } else {
      air2DemoRun.letdownDetectedAtMs = null;
    }
    var letdownVisibleMs = startSignal && air2DemoRun.letdownDetectedAtMs != null && isFinite(Number(air2DemoRun.letdownDetectedAtMs))
      ? Math.max(0, Date.now() - Number(air2DemoRun.letdownDetectedAtMs)) : 0;
    /* Use the session clock here too. Re-renders must not accelerate the
       low-flow confirmation. Two real demo seconds confirm the end. */
    if (endSignal) {
      if (!isFinite(Number(air2DemoRun.endSignalStartedAt))) air2DemoRun.endSignalStartedAt = t;
    } else {
      air2DemoRun.endSignalStartedAt = null;
    }
    var endSignalSeconds = endSignal && isFinite(Number(air2DemoRun.endSignalStartedAt))
      ? Math.max(0, t - Number(air2DemoRun.endSignalStartedAt)) : 0;
    /* Mock a transient seal loss after expression has been running long
       enough to feel realistic. The alert owns its lifecycle so the normal
       3.3 s let-down notification timer cannot cut the recovery state off. */
    if (!air2DemoRun.leakTriggered && t >= 42 && extracting) {
      air2DemoRun.leakTriggered = true;
      air2ShowLeakSequence();
    }
    /* Keep the high-flow readout and denser droplets visible for two complete
       seconds before switching: let-down -> sensor confirmation -> mode. */
    if (!air2DemoRun.autoMoved && letdownVisibleMs >= 2000 && state.auto && state.mode === 'stimulation') {
      air2DemoRun.autoMoved = true;
      state.mode = 'expression';
      air2ShowNotice('auto', 'Let-down detected. Switched to Expression mode.');
    }
    if (letdownVisibleMs >= 2000 && !state.auto && state.mode === 'stimulation' && !air2DemoRun.prompted) {
      air2DemoRun.prompted = true;
      air2ShowNotice('suggestion', 'Let-down detected. Switch to Expression mode for stronger milk flow.');
    }
    if (endSignalSeconds >= 2 && !air2DemoRun.endNotified) {
      air2DemoRun.endNotified = true;
      if (state.auto) {
        air2ShowNotice('ending', 'Let-down has ended. This pumping session is complete.');
        air2DemoRun.autoEndAt = t + 4;
      } else {
        air2ShowNotice('suggestion', 'Let-down has ended. You can finish pumping now.');
      }
    }
    if (state.auto && air2DemoRun.autoEndAt && t >= air2DemoRun.autoEndAt) {
      air2DemoRun.autoEndAt = 0;
      air2DemoRun.finishing = true;
      /* This is the sensor-led no-milk settlement path. Only this automatic
         ending is eligible for the five-second unattended log submission. */
      state.air2AutoSubmitPending = true;
      state.air2AutoSubmitCancelled = false;
      state.air2SessionEnded = true;
      state.running = false;
      state.paused = false;
      state.air2SettlementProgram = state.selectedProgram || '';
      air2CaptureSession(state.milkL, state.milkR);
      air2ResetSelectionAfterEnd();
      state.controlNotice = null;
      state.modal = 'log';
      air2DemoRun.finishing = false;
      v4View();
      return;
    }
    if (state.milkL >= FULL_OZ - .005 && state.milkR >= FULL_OZ - .005) window.air2FinishFullBowl();
  };

  var r72LeakTimers = [];
  function r72ClearLeakTimers() {
    r72LeakTimers.forEach(clearTimeout);
    r72LeakTimers = [];
  }
  function r72SetLeakPhase(phase) {
    state.controlNotice = {
      kind: 'leak',
      phase: phase,
      id: Date.now() + Math.random(),
      text: phase === 'warning' ? 'Air leak detected' : 'Suction pressure normal'
    };
    v4View();
  }
  function air2ShowLeakSequence() {
    r72ClearLeakTimers();
    /* A seal loss pauses pumping, rather than merely painting an alert. Keep
       the user's prior pause state so recovery only resumes an active run. */
    air2DemoRun.leakWasPaused = !!state.paused;
    state.leakSide = 'r';
    state.leakAdjusting = true;
    state.paused = true;
    state.flowRate = 0;
    state.flowKind = 'paused';
    r72SetLeakPhase('warning');
    r72LeakTimers.push(setTimeout(function () { r72SetLeakPhase('closing'); }, 3800));
    r72LeakTimers.push(setTimeout(function () {
      if (state.controlNotice && state.controlNotice.kind === 'leak') {
        state.controlNotice = null;
        v4View();
      }
    }, 4140));
    r72LeakTimers.push(setTimeout(function () {
      state.leakAdjusting = false;
      state.paused = !!air2DemoRun.leakWasPaused;
      r72SetLeakPhase('recovered');
    }, 4480));
    r72LeakTimers.push(setTimeout(function () { r72SetLeakPhase('closing-recovered'); }, 7680));
    r72LeakTimers.push(setTimeout(function () {
      if (state.controlNotice && state.controlNotice.kind === 'leak') {
        state.controlNotice = null;
        state.leakSide = null;
        v4View();
      }
    }, 8020));
  }
  window.air2ShowLeakSequence = air2ShowLeakSequence;

  /* Convert only the leak notification to the compact Figma 60:5908 glass
     pill. Other let-down/end notices retain their established presentation. */
  var r72Control = window.v4Control || v4Control;
  window.v4Control = v4Control = function () {
    var markup = r72Control.apply(this, arguments);
    var notice = state.controlNotice;
    if (!notice || notice.kind !== 'leak') return markup;
    var phase = notice.phase || 'warning';
    var classes = phase === 'closing-recovered' ? 'r72-closing r72-recovered' : 'r72-' + phase;
    var leakMarkup = '<section class="c36-notice c36-leak r72-leak-notice ' + classes + '" data-notice="' + notice.id + '">' +
      '<div class="r72-leak-stage r72-leak-warning"><div class="r72-leak-line"><i class="r72-alert-mark">!</i><b>Air leak detected</b><span class="r72-up-caret">⌃</span><img src="./assets/figma-r72/notice-close.svg" alt=""></div><small>Follow the on-screen guide to adjust it</small></div>' +
      '<div class="r72-leak-stage r72-leak-recovered"><div class="r72-leak-line"><i class="r72-check-mark">✓</i><b>Suction pressure normal</b><img src="./assets/figma-r72/notice-close.svg" alt=""></div><small>Negative pressure detection is normal</small></div>' +
      '</section>';
    return markup.replace(/<section class="c36-notice[\s\S]*?<\/section>/, leakMarkup);
  };

  /* Live flow readouts sit above each running bowl. They are rendered with the
     bowl once, then refreshed in-place by updateRunningControl below. */
  var r60Hardware = window.v4Hardware;
  function sideFlow(side) {
    var rate = state.paused ? 0 : Math.max(0, Number(state.flowRate) || 0);
    return rate * (side === 'r' ? 1.018 : 1.015);
  }
  function sideFlowOz(side) { return sideFlow(side) / 28.3495; }
  window.v4Hardware = function (side, amount) {
    var html = r60Hardware.apply(this, arguments);
    if (!state.running) return html;
    var readout = '<span class="r60-flow-readout" data-flow-side="' + side + '"><b>' + sideFlowOz(side).toFixed(3) + '</b><em>oz/s</em></span>';
    if (state.leakAdjusting && state.leakSide === side) {
      html = html.replace(/(<span class="c32-vessel)([^>]*>)/, '$1 r97-leak-adjusting$2');
      html = html.replace(/(<span class="c32-vessel[^>]*>)/,
        '<img class="r97-leak-guide" src="' + r2Asset('fit-guide.svg') + '" alt="Adjust leaking bowl angle">$1');
    }
    return html.replace(/(<span class="c32-vessel[^>]*>)/, '$1' + readout);
  };

  function smoothPath(points) {
    if (!points.length) return '';
    var path = 'M ' + points[0][0] + ' ' + points[0][1];
    for (var i = 0; i < points.length - 1; i += 1) {
      var p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      path += ' C ' + c1x.toFixed(2) + ' ' + c1y.toFixed(2) + ', ' + c2x.toFixed(2) + ' ' + c2y.toFixed(2) + ', ' + p2[0] + ' ' + p2[1];
    }
    return path;
  }

  window.r2TrendResult = function () {
    var history = Array.isArray(state.air2SessionHistory) ? state.air2SessionHistory : [];
    /* Trend points are daily totals. Six prior days mock roughly five
       sessions/day × 120 ml (about 20.3 oz/day), with natural variation. The
       final point is today's sum of the per-session records captured below. */
    var current = history.reduce(function (sum, item) { return sum + (Number(item.total) || 0); }, 0);
    var values = [18.7, 21.4, 19.6, 23.1, 17.9, 20.8, Number(current.toFixed(1))];
    var width = 690, step = (width - 46) / (values.length - 1);
    var chartHeight = 125;
    var points = values.map(function (value, index) { return [23 + index * step, Math.round(chartHeight - Math.max(0, Math.min(30, value)) / 30 * chartHeight)]; });
    var latestTop = Math.max(0, Math.min(chartHeight - 18, Math.round(points[points.length - 1][1] - 9)));
    var path = smoothPath(points);
    var days = values.map(function (value, index) {
      var d = new Date(); d.setDate(d.getDate() - (values.length - 1 - index));
      var letter = ['S','M','T','W','T','F','S'][d.getDay()];
      return '<button class="r53-trend-day" data-r2-day="' + (index + 1) + '" data-value="' + value.toFixed(1) + '" style="left:' + Math.max(0, points[index][0] - 23) + 'px"><span>' + letter + '<small>' + (d.getMonth() + 1) + '/' + d.getDate() + '</small></span></button>';
    }).join('');
    return '<div class="r2-trend-wrap r53-smooth-trend"><div class="r2-y-axis"><span>30</span><span>20</span><span>10</span><span>0</span></div><div class="r2-trend-scroll" data-r2-scroll="latest"><div class="r53-trend-track" style="width:' + width + 'px"><svg viewBox="0 0 ' + width + ' 125" preserveAspectRatio="none" aria-label="Pumping volume trend"><path d="' + path + '"></path>' + points.map(function (point, index) { return '<circle class="' + (index === points.length - 1 ? 'r102-current-point' : '') + '" cx="' + point[0] + '" cy="' + point[1] + '" r="' + (index === points.length - 1 ? '4' : '3') + '"></circle>'; }).join('') + '</svg>' + days + '</div></div><b class="r2-latest" style="top:' + latestTop + 'px">' + current.toFixed(1) + ' oz</b></div>';
  };

  window.r2LactationResult = function () {
    var total = air2LastSessionTotal();
    function bar(value, label) {
      var height = Math.max(4, Math.min(110, value / 30 * 110));
      return '<button class="r2-session done r53-real-session"><small>' + value.toFixed(1) + '</small><i style="height:' + height.toFixed(1) + 'px"></i><span>' + label + '</span></button>';
    }
    var history = Array.isArray(state.air2SessionHistory) ? state.air2SessionHistory : [];
    var bars = history.map(function (item, index) { return bar(Number(item.total) || 0, 'S' + (index + 1)); }).join('');
    return '<div class="r2-lactation-summary r53-lactation-summary"><span><small>Last Pump</small><b>' + (history.length ? 'Just now' : '—') + '</b></span><span><small>Sessions</small><b>' + history.length + '</b></span></div><div class="r2-session-chart"><div class="r2-session-scroll r53-real-sessions">' + bars + '<button class="r55-add-session" data-r55-add-milk aria-label="Log pumping amount"><img src="' + r2Asset('lactation-add-session.svg') + '" alt=""><span></span></button></div><div class="r2-session-y"><span>OZ</span><span>30</span><span>20</span><span>10</span><span>0</span></div></div>';
  };

  var r53AutoCard = window.v4AutoCard;
  function r61CloudField(expression) {
    var base = './assets/figma-r61/';
    if (expression) {
      var exact = './assets/figma-r80/';
      return '<span class="r54-flow-field r61-cloud-field r80-figma-cloud" aria-hidden="true">' +
        '<img class="r80-cloud r80-cloud-base" src="' + exact + 'cloud-base.png" alt="">' +
        '<img class="r80-cloud r80-cloud-pink" src="' + exact + 'cloud-pink.svg" alt="">' +
        '<img class="r80-cloud r80-cloud-indigo" src="' + exact + 'cloud-indigo.svg" alt="">' +
        '<img class="r80-cloud r80-cloud-purple" src="' + exact + 'cloud-purple.svg" alt="">' +
        '</span>';
    }
    return '<span class="r54-flow-field r61-cloud-field" aria-hidden="true">' +
      '<img class="r61-cloud r61-cloud-a" src="' + base + 'stim-a.svg" alt="">' +
      '<img class="r61-cloud r61-cloud-b" src="' + base + 'stim-b.svg" alt="">' +
      '<img class="r61-cloud r61-cloud-c" src="' + base + 'stim-c.svg" alt="">' +
      '</span>';
  }
  window.v4AutoCard = function (kind, title, tag) {
    var expression = kind === 'expression';
    var displayTime = tag || (state.running ? time(state.timer || 0) : '');
    var root = './assets/figma-r54/';
    var icon = expression ? root + 'expression-drop.svg' : r2Asset('auto-heart.svg');
    if (state.selectedProgram) {
      var program = r53AutoCard.apply(this, arguments);
      /* A program may still be internally parked on Expression when the user
         turns Auto Switch off. In that manual state the base Milk Boost card
         is authoritative: keep its warm neutral background and progress bar,
         and do not inject either mode's animated cloud layer. */
      if (!state.auto) return program;
      return program
        .replace(/<section class="([^"]+)">/, '<section class="$1 r54-auto-card r55-program-flow ' + (expression ? 'r54-expression' : 'r54-stimulation') + '">' + r61CloudField(expression))
        .replace(/(<button class="r43-boost-arrow"[^>]*>)[\s\S]*?(<\/button>)/, '$1<img class="r106-boost-chevron" src="./assets/figma-r106-arrow.svg" alt="Open list">$2');
    }
    return '<section class="v4-auto-card r54-auto-card ' + (expression ? 'r54-expression' : 'r54-stimulation') + '">' +
      r61CloudField(expression) +
      '<div class="v4-auto-content"><span class="v4-auto-title"><img class="r54-mode-icon" src="' + icon + '" alt="">' + title + (displayTime ? '<em class="v4-time">' + displayTime + '</em>' : '') + '</span><button class="r2-card-arrow" data-v4="list"><img src="' + r2Asset('auto-chevron.svg') + '" alt="Open list"></button></div>' +
      '<div class="v4-auto-line">Auto Switch ' + v4Switch() + '</div></section>';
  };

  /* Keep the running control DOM alive. Replacing innerHTML every second
     restarted the composited gradient animation and produced a visible
     one-second hitch. Only rebuild when the structural state changes. */
  var r54View = window.v4View;
  var r54Signature = '';
  function controlSignature() {
    /* flowKind changes are paint-only. Including them here rebuilt both flow
       labels and restarted their entrance animation during ordinary ticks. */
    return [state.page, state.modal || '', state.mode, !!state.auto, state.selectedProgram || '', !!state.running, !!state.paused, state.levelL, state.levelR, state.speed, state.controlNotice ? state.controlNotice.id : ''].join('|');
  }
  function updateRunningControl() {
    var host = document.querySelector('#demo .v4-control');
    if (!host) return false;
    var timerText = time(state.timer || 0);
    var timer = host.querySelector('.v4-time,.r49-boost__timer,.r43-boost-time');
    if (timer) timer.textContent = timerText + (state.selectedProgram ? ' / 20:00' : '');
    var pumps = host.querySelectorAll('.c32-pump');
    [Number(state.milkL) || 0, Number(state.milkR) || 0].forEach(function (amount, index) {
      var pump = pumps[index];
      if (!pump) return;
      var label = pump.querySelector('.amount');
      if (label) label.textContent = (amount <= .02 ? '0' : amount.toFixed(1)) + ' oz';
      var liquid = pump.querySelector('.c32-liquid');
      if (liquid) {
        var level = Math.max(0, Math.min(94, Math.round(amount / FULL_OZ * 94)));
        liquid.style.setProperty('--liquid-height', level + 'px');
        liquid.style.height = level + 'px';
        liquid.style.display = level === 0 ? 'none' : '';
      }
      /* Flow changes are deliberately patched in place. Previously the DOM
         stayed in its initial `none` state until the mode card rebuilt, so
         the first visible frame jumped straight from no drops to many. */
      var vessel = pump.querySelector('.c32-vessel');
      var nextFlow = state.paused ? 'paused' : (state.flowKind || 'none');
      if (vessel) {
        ['none','low','medium','high','paused'].forEach(function (kind) {
          vessel.classList.remove('c32-flow-' + kind);
        });
        vessel.classList.add('c32-flow-' + nextFlow);
        var oldDrops = vessel.querySelector('.c32-drops');
        var oldFlow = oldDrops ? (oldDrops.getAttribute('data-flow-kind') || '') : '';
        if (oldDrops && oldFlow !== nextFlow) oldDrops.remove();
        if (nextFlow !== 'none' && nextFlow !== 'paused' && (!oldDrops || oldFlow !== nextFlow)) {
          var count = nextFlow === 'low' ? 1 : nextFlow === 'medium' ? 3 : 6;
          var drops = document.createElement('span');
          drops.className = 'c32-drops c32-drops-' + nextFlow;
          drops.setAttribute('data-flow-kind', nextFlow);
          for (var dropIndex = 0; dropIndex < count; dropIndex += 1) {
            var drop = document.createElement('img');
            drop.src = './assets/figma-control-r15/milk-drop.svg';
            drop.alt = '';
            drop.style.setProperty('--drop', dropIndex);
            drops.appendChild(drop);
          }
          var clip = vessel.querySelector('.c32-liquid-clip');
          if (clip) clip.appendChild(drops);
        }
      }
    });
    host.querySelectorAll('.r60-flow-readout').forEach(function (readout) {
      var value = readout.querySelector('b');
      var nextValue = sideFlowOz(readout.getAttribute('data-flow-side')).toFixed(3);
      if (value && value.textContent !== nextValue) value.textContent = nextValue;
    });
    return true;
  }
  window.v4View = function () {
    var signature = controlSignature();
    if (state.page === 'control' && !state.modal && signature === r54Signature && updateRunningControl()) return;
    var result = r54View.apply(this, arguments);
    r54Signature = controlSignature();
    return result;
  };
  view = window.v4View;

  function listCard(name, detail, icon, selected, duration, action) {
    var runningTime = state.running && selected && duration ? ' <em>' + duration + '</em>' : '';
    return '<button class="r2-list-card ' + (selected ? 'selected' : '') + '" ' + (action || '') + '>' +
      '<img class="mode-icon" src="' + r2Asset(icon) + '" alt=""><span><b>' + name + runningTime + '</b>' +
      (detail ? '<small>' + detail + '</small>' : '') + '</span>' +
      (selected ? '<img class="wave" src="' + r2Asset('list-wave.svg') + '" alt="">' : '<img class="play" src="' + r2Asset('list-play.svg') + '" alt="Play">') + '</button>';
  }

  window.v4List = function () {
    var expanded = state.listExpanded === 'Milk Boost';
    var stimulationSelected = state.mode === 'stimulation' && !state.running;
    var expressionSelected = state.mode === 'expression' && !state.running;
    var programs = ['Cozy Flow|21:30', 'Milk Boost|20:00', 'Power Pumping|45:00'].map(function (item) {
      var parts = item.split('|'), name = parts[0], duration = parts[1];
      if (name === 'Milk Boost' && expanded) return '<section class="r2-program-expanded" data-v4="toggle-program"><div><b>' + name + ' <em>' + duration + '</em></b><button data-v4="choose-program"><img src="' + r2Asset('list-play.svg') + '" alt="Play"></button></div><small>Most suitable for daily use after successful lactation</small><i class="r2-program-timeline"><b></b></i><footer><span>● Stimulate</span><span>● Expression</span></footer></section>';
      return '<button class="r2-program-row" ' + (name === 'Milk Boost' ? 'data-v4="toggle-program"' : '') + '><b>' + name + ' <em>' + duration + '</em></b><img src="' + r2Asset('list-play.svg') + '" alt="Play"></button>';
    }).join('');
    return '<section class="v4 v4-list r2-list">' + v4Status() + '<header class="v4-top">' + v4Back('control') + '</header><h1>List</h1><div class="v4-list-auto">Auto Switch ' + v4Switch() + '</div><main class="r2-list-content"><p>Manual</p>' +
      listCard('Stimulation', 'Gentle and comfortable', 'list-heart.svg', stimulationSelected, '', 'data-v4="manual" data-mode="stimulation"') +
      listCard('Expression', 'Fast-paced and intense', 'list-expression.svg', expressionSelected, time(state.timer), 'data-v4="manual" data-mode="expression"') +
      '<header><span>Programs</span><button><img src="' + r2Asset('list-create.svg') + '" alt=""> Create</button></header>' + programs + '</main></section>';
  };

  window.addEventListener('click', function (event) {
    if (!event.target.closest || !event.target.closest('[data-v4="list"]')) return;
    state.listExpanded = null;
    if (!state.running && state.selectedProgram === 'Milk Boost') state.selectedProgram = null;
  }, true);
  /* The card visibly selected on List is the source of truth when returning.
     This prevents a stale Milk Boost program from overriding a selected
     manual Stimulation/Expression rhythm. Auto Switch remains independent. */
  window.addEventListener('click', function (event) {
    if (!event.target.closest || !event.target.closest('[data-v4="control"]') || state.page !== 'list') return;
    var selectedManual = document.querySelector('#demo .r2-list-card.selected[data-v4="manual"]');
    if (!selectedManual) return;
    state.mode = selectedManual.getAttribute('data-mode') || 'stimulation';
    state.selectedProgram = null;
  }, true);
  window.addEventListener('click', function (event) {
    var add = event.target.closest && event.target.closest('[data-r55-add-milk]');
    if (!add) return;
    event.preventDefault();
    state.logOriginPage = state.page;
    state.air2SessionEnded = true;
    state.running = false;
    state.paused = false;
    state.modal = 'log';
    v4View();
  }, true);

  /* A manually finished session always starts the next run from Stimulation.
     Keep the current mode while the amount sheet is open, then reset as the
     user closes or saves that sheet. */
  document.addEventListener('pointerdown', function (event) {
    if (!event.target.closest || !event.target.closest('[data-v4="finish"]')) return;
    air2CaptureSession(state.milkL, state.milkR);
    state.air2SessionEnded = true;
    state.running = false;
    state.paused = false;
    state.air2ManualFinish = !state.auto && !state.selectedProgram;
    state.air2SettlementProgram = state.selectedProgram || '';
    air2ResetSelectionAfterEnd();
  }, true);

  /* A manually opened amount sheet belongs to its source page. Close and
     Save dismiss it in place instead of reusing the control-page close route. */
  window.addEventListener('click', function (event) {
    var target = event.target.closest && event.target.closest('[data-v4="save"],[data-v4="control"]');
    if (!target || state.modal !== 'log' || !state.logOriginPage) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    var saved = target.getAttribute('data-v4') === 'save';
    state.page = state.logOriginPage;
    state.logOriginPage = null;
    state.modal = null;
    state.running = false;
    state.paused = false;
    if (saved) state.hasLogged = true;
    v4View();
  }, true);
  document.addEventListener('click', function (event) {
    if (!event.target.closest || !event.target.closest('[data-v4="save"],[data-v4="control"]')) return;
    if (state.modal === 'log' || state.air2ManualFinish || state.air2SettlementProgram != null || state.air2SessionEnded) {
      state.air2SessionEnded = true;
      state.running = false;
      state.paused = false;
      state.timer = 0;
      state.controlNotice = null;
    }
    if (!state.air2ManualFinish && state.air2SettlementProgram == null) return;
    state.mode = 'stimulation';
    state.selectedProgram = state.air2SettlementProgram || null;
    state.air2ManualFinish = false;
    state.air2SettlementProgram = null;
  }, true);

  /* Global session invariant: once a session has ended, returning to Control
     can never resurrect a stale running snapshot. Only the Start action may
     open a new run and clear this terminal flag. */
  document.addEventListener('click', function (event) {
    if (!event.target.closest) return;
    if (event.target.closest('[data-v4="start"],[data-v4="confirm"]')) {
      state.air2SessionEnded = false;
      state.air2ActiveSessionId = 'session-' + Date.now();
      return;
    }
    if (event.target.closest('[data-v4="control"]') && state.air2SessionEnded) {
      state.running = false;
      state.paused = false;
      state.timer = 0;
    }
  }, true);

  if (!state.reviewFrozen && state.page === 'list' && state.modal == null) state.listExpanded = null;
  if (state.page === 'list' && typeof window.v4View === 'function') window.v4View();
}());

/* R112: five-second auto-submit for sensor-led automatic settlement. */
(function () {
  var countdownTimer = null;
  var remaining = 0;

  function saveButton() {
    return document.querySelector('#demo .v4-overlay .v4-save[data-v4="save"]');
  }

  function paintCountdown() {
    var button = saveButton();
    if (!button) return;
    if (state.air2AutoSubmitPending && !state.air2AutoSubmitCancelled && remaining > 0) {
      button.textContent = 'Save automatically in ' + remaining + 's';
      button.setAttribute('aria-label', 'Save automatically in ' + remaining + ' seconds');
      button.classList.add('air2-auto-submit');
    } else {
      button.textContent = 'Save';
      button.setAttribute('aria-label', 'Save pumping record');
      button.classList.remove('air2-auto-submit');
    }
  }

  function stopCountdown(cancelled) {
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = null;
    remaining = 0;
    if (cancelled) {
      state.air2AutoSubmitPending = false;
      state.air2AutoSubmitCancelled = true;
    }
    paintCountdown();
  }

  function submitAutomatically() {
    var button = saveButton();
    stopCountdown(false);
    state.air2AutoSubmitPending = false;
    state.air2AutoSubmitCancelled = false;
    if (button) button.click();
  }

  function startCountdownIfNeeded() {
    var eligible = state.modal === 'log' && state.air2AutoSubmitPending && !state.air2AutoSubmitCancelled;
    if (!eligible) {
      if (countdownTimer) stopCountdown(false);
      return;
    }
    if (countdownTimer) {
      paintCountdown();
      return;
    }
    remaining = 5;
    paintCountdown();
    countdownTimer = setInterval(function () {
      if (state.modal !== 'log' || !state.air2AutoSubmitPending || state.air2AutoSubmitCancelled) {
        stopCountdown(false);
        return;
      }
      remaining -= 1;
      if (remaining <= 0) submitAutomatically();
      else paintCountdown();
    }, 1000);
  }

  /* A real user gesture cancels this settlement's automation permanently.
     Synthetic button.click() used at zero is not trusted and does not cancel. */
  function cancelOnInteraction(event) {
    if (!event.isTrusted || !countdownTimer || state.modal !== 'log') return;
    stopCountdown(true);
  }
  document.addEventListener('pointerdown', cancelOnInteraction, true);
  document.addEventListener('keydown', cancelOnInteraction, true);

  var countdownView = window.v4View;
  window.v4View = function () {
    var result = countdownView.apply(this, arguments);
    startCountdownIfNeeded();
    return result;
  };
  view = window.v4View;
  startCountdownIfNeeded();
}());

/* The in-place Fit Check must load after this legacy review layer, which also
   defines an older standalone Start overlay. */
(function () {
  var script = document.createElement('script');
  script.src = './fit-dock-r50.js?v=fit-dock-r51';
  document.body.appendChild(script);
}());
