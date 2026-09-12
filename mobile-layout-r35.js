(function () {
  var designWidth = 402, designHeight = 874;
  var demo = document.getElementById('demo');
  if (!demo || demo.parentElement.id === 'air2-phone-shell') return;

  var shell = document.createElement('main');
  shell.id = 'air2-phone-shell';
  demo.parentNode.insertBefore(shell, demo);
  shell.appendChild(demo);

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function layout() {
    var phone = window.innerWidth <= 600;
    document.documentElement.classList.toggle('air2-standalone', isStandalone());
    shell.dataset.displayMode = isStandalone() ? 'standalone' : 'browser';

    if (phone) {
      shell.style.removeProperty('--air2-scale');
      shell.style.removeProperty('--air2-shell-width');
      shell.style.removeProperty('--air2-shell-height');
      shell.style.removeProperty('--air2-canvas-height');
      return;
    }

    var scale = Math.max(.1, Math.min(window.innerWidth / designWidth, window.innerHeight / designHeight));
    shell.style.setProperty('--air2-scale', String(scale));
    shell.style.setProperty('--air2-shell-width', (designWidth * scale) + 'px');
    shell.style.setProperty('--air2-shell-height', (designHeight * scale) + 'px');
    shell.style.setProperty('--air2-canvas-height', designHeight + 'px');
  }

  layout();
  window.addEventListener('resize', layout, {passive:true});
  window.addEventListener('orientationchange', layout, {passive:true});
}());
