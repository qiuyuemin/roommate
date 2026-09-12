(function () {
  var designWidth = 402, designHeight = 874;
  var demo = document.getElementById('demo');
  if (!demo || demo.parentElement.id === 'air2-phone-shell') return;
  var shell = document.createElement('main');
  shell.id = 'air2-phone-shell';
  demo.parentNode.insertBefore(shell, demo);
  shell.appendChild(demo);
  function resizePhone() {
    /* Adapt to both width and height; never lock the canvas at 1x. */
    var scale = Math.min(window.innerWidth / designWidth, window.innerHeight / designHeight);
    scale = Math.max(.1, scale);
    shell.style.setProperty('--air2-scale', String(scale));
  }
  resizePhone();
  window.addEventListener('resize', resizePhone, { passive:true });
  window.addEventListener('orientationchange', resizePhone, { passive:true });
})();
