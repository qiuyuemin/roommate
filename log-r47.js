/* Air 2 log sheet: model-aware capacity and independently layered vessel fill. */
(function () {
  var MODEL_CAPACITY_ML = { 'Air 2': 180, air2: 180 };
  var ML_PER_OZ = 29.5735;

  function capacityMl() {
    var model = state.deviceModel || state.model || 'Air 2';
    return Number(state.bowlCapacityMl) || MODEL_CAPACITY_ML[model] || 180;
  }

  function capacityOz() {
    return capacityMl() / ML_PER_OZ;
  }
  window.air2CapacityOz = capacityOz;

  function asset(name) {
    return r2Asset(name);
  }

  function vessel(side, amount) {
    var safeAmount = Math.max(0, Math.min(capacityOz(), Number(amount) || 0));
    var fill = Math.max(0, Math.min(100, safeAmount / capacityOz() * 100));
    return '<div class="v4-vessel-wrap r47-log-wrap">' +
      '<div class="r37-log-vessel r47-log-' + side + '" style="--fill:' + fill.toFixed(2) + '%;--fill-px:' + (139 * fill / 100).toFixed(2) + 'px;--knob-top:' + ((100 - fill) * 1.49).toFixed(2) + 'px">' +
        '<img class="r37-log-base" src="' + asset(side === 'l' ? 'log-l.svg' : 'log-r.svg') + '" alt="">' +
        '<span class="r37-log-fill" aria-hidden="true"><img src="' + asset('log-milk.svg') + '" alt=""></span>' +
        '<button data-r47-milk="' + side + '" aria-label="Adjust ' + side + ' amount">' +
          '<img src="' + asset('log-up.svg') + '" alt="Increase">' +
          '<img src="' + asset('log-down.svg') + '" alt="Decrease">' +
        '</button>' +
      '</div>' +
      '<p class="v4-amount-number">' + safeAmount.toFixed(1) + '<small>oz</small></p>' +
    '</div>';
  }

  function measure() {
    return '<div class="r47-measure" aria-label="Pump capacity scale"><b>' + capacityOz().toFixed(1) + ' oz</b>' +
      '<span>' + '<i></i>'.repeat(10) + '</span><b>0</b></div>';
  }

  window.v4Log = function () {
    var left = Number(state.milkL || 0);
    var right = Number(state.milkR || 0);
    return '<div class="v4-overlay"><section class="v4-log r2-log r47-log">' +
      '<button class="v4-circle close" data-v4="control"><img src="' + asset('log-close.svg') + '" alt="Close"></button>' +
      '<h1>Log Pumping Amount</h1><p class="v4-log-date">Apr 1, 9:41 AM</p>' +
      '<div class="r47-log-amounts">' + vessel('l', left) + measure() + vessel('r', right) + '</div>' +
      '<button class="v4-duration"><span>Duration</span><b>20 min <img src="' + asset('log-chevron.svg') + '" alt=""></b></button>' +
      '<button class="v4-start v4-save" data-v4="save">Save</button>' +
    '</section></div>';
  };

  document.addEventListener('click', function (event) {
    var control = event.target.closest('[data-r47-milk]');
    if (!control) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    /* Values are adjusted by vertical drag; a tap is inert. */
  }, true);

  /* review-state intentionally freezes v4View; repaint the open log review once. */
  if (state.reviewFrozen && state.modal === 'log') {
    root.innerHTML = v4Control() + window.v4Log();
  }
}());


/* R49: direct pointer drag keeps the handle at the true milk surface. */
(function () {
  var drag;
  function cap() { return typeof window.air2CapacityOz === "function" ? window.air2CapacityOz() : 180 / 29.5735; }
  function clamp(value) { return Math.round(Math.max(0, Math.min(cap(), value)) * 10) / 10; }
  function sync(side, amount) {
    var vessel = document.querySelector(".r47-log-" + side);
    if (!vessel) return;
    var fill = Math.max(0, Math.min(100, amount / cap() * 100));
    vessel.style.setProperty("--fill", fill.toFixed(2) + "%");
    vessel.style.setProperty("--fill-px", (139 * fill / 100).toFixed(2) + "px");
    vessel.style.setProperty("--knob-top", ((100 - fill) * 1.49).toFixed(2) + "px");
    var label = vessel.parentNode.querySelector(".v4-amount-number");
    if (label) label.innerHTML = amount.toFixed(1) + "<small>oz</small>";
  }
  document.addEventListener("pointerdown", function (event) {
    var button = event.target.closest("[data-r47-milk]");
    if (!button) return;
    event.preventDefault(); event.stopImmediatePropagation();
    var side = button.dataset.r47Milk;
    drag = { side: side, id: event.pointerId, y: event.clientY, start: Number(state[side === "l" ? "milkL" : "milkR"]) || 0 };
    if (button.setPointerCapture) button.setPointerCapture(event.pointerId);
  }, true);
  document.addEventListener("pointermove", function (event) {
    if (!drag || event.pointerId !== drag.id) return;
    event.preventDefault();
    var amount = clamp(drag.start - (event.clientY - drag.y) / 149 * cap());
    state[drag.side === "l" ? "milkL" : "milkR"] = amount;
    sync(drag.side, amount);
  }, true);
  document.addEventListener("pointerup", function (event) {
    if (drag && event.pointerId === drag.id) drag = null;
  }, true);
  document.addEventListener("pointercancel", function () { drag = null; }, true);
}());
