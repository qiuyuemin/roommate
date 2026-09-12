/* Round-specific event ownership. This replaces post-v4.js so old decorators cannot overwrite Figma assets. */
document.addEventListener('click', event => {
  const toggle = event.target.closest('[data-v4="auto"]');
  if (!toggle || state.page !== 'list' || document.body.classList.contains('review-static')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  state.auto = !state.auto;
  if (!state.running) state.selectedProgram = null;
  v4View();
}, true);
