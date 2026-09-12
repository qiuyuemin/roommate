/* Log modal: base vessel, clipped liquid surface, and control sit on separate layers. */
(function () {
  var CAPACITY = window.AIR2_BOWL_CAPACITY_OZ || 6.09;
  function vessel(side, amount) {
    var fill = Math.max(0, Math.min(100, amount / CAPACITY * 100));
    return '<div class="v4-vessel-wrap r37-log-wrap"><div class="r37-log-vessel" style="--fill:' + fill + '%"><img class="r37-log-base" src="' + r2Asset('log-shell.svg') + '" alt=""><span class="r37-log-fill"><img src="' + r2Asset('log-milk.svg') + '" alt=""></span><img class="r37-log-outline" src="' + r2Asset(side === 'l' ? 'log-l.svg' : 'log-r.svg') + '" alt=""><button data-r37-milk="' + side + '" aria-label="Adjust ' + side + ' amount"><img src="' + r2Asset('log-up.svg') + '" alt="Increase"><img src="' + r2Asset('log-down.svg') + '" alt="Decrease"></button></div><p class="v4-amount-number">' + amount.toFixed(1) + '<small>oz</small></p></div>';
  }
  window.v4Log = function () {
    var l = Number(state.milkL || 0), r = Number(state.milkR || 0);
    return '<div class="v4-overlay"><section class="v4-log r2-log r37-log"><button class="v4-circle close" data-v4="control"><img src="' + r2Asset('log-close.svg') + '" alt="Close"></button><h1>Log Pumping Amount</h1><p class="v4-log-date">Apr 1, 9:41 AM</p><div class="v4-amounts">' + vessel('l', l) + '<div class="v4-measure"><b>10 oz</b>' + '<i></i>'.repeat(10) + '<b>0</b></div>' + vessel('r', r) + '</div><button class="v4-duration"><span>Duration</span><b>20 min <img src="' + r2Asset('log-chevron.svg') + '" alt=""></b></button><button class="v4-start v4-save" data-v4="save">Save</button></section></div>';
  };
  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-r37-milk]'); if (!button) return;
    event.preventDefault(); event.stopImmediatePropagation();
    var key = button.dataset.r37Milk === 'l' ? 'milkL' : 'milkR';
    state[key] = Math.min(CAPACITY, air2Round((Number(state[key]) || 0) + .1));
    v4View();
  }, true);
})();
