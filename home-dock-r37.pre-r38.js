/* Home dock is a projection of the shared pumping state, not a separate flow. */
(function () {
  function duration(seconds) { var min = Math.floor((seconds || 0) / 60), sec = (seconds || 0) % 60; return String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0'); }
  function paintDock() {
    var dock = document.querySelector('#demo .h7-home-dock'); if (!dock) return;
    var mode = dock.querySelector('.h7-dock-mode'); if (!mode) return;
    var isProgram = state.selectedProgram === 'Milk Boost', active = !!state.running, playing = active && !state.paused;
    var title = isProgram ? 'Milk Boost' : (state.mode === 'expression' ? 'Expression' : state.mode === 'mixed' ? 'Mixed' : 'Stimulation');
    var total = state.programTotal || '20:00', timer = isProgram ? (active ? duration(state.timer) + ' / ' + total : total) : (active ? duration(state.timer) : '');
    var signature = [title, timer, active, playing].join('|'); if (mode.dataset.r37Dock === signature) return;
    mode.dataset.r37Dock = signature;
    var icon = isProgram ? '' : '<img src="' + h7Asset('dock-heart.svg') + '" alt="">';
    mode.innerHTML = '<span class="r37-dock-label">' + icon + '<b>' + title + '</b><em>' + timer + '</em></span><button data-v4="' + (active ? 'pause' : 'start') + '" aria-label="' + (playing ? 'Pause pumping' : 'Start or resume pumping') + '"><img src="' + (playing ? r2Asset('pause.svg') : h7Asset('dock-play.svg')) + '" alt=""></button>';
  }
  new MutationObserver(function () { requestAnimationFrame(paintDock); }).observe(document.getElementById('demo'), {childList:true, subtree:true});
  document.addEventListener('DOMContentLoaded', paintDock); paintDock();
})();
