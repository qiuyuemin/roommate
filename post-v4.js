function decorateV4Components() {
  const deviceIcon = root.querySelector('.v4-device-card .dev-dot');
  if (deviceIcon) deviceIcon.innerHTML = '<img src="./assets/figma-v2/device-group-b.svg" alt="">';
  const icons = root.querySelectorAll('.v4-list-card .icon');
  if (icons[0]) icons[0].innerHTML = '<img src="./assets/figma-v2/icon-stimulation.svg" alt="Stimulation">';
  if (icons[1]) icons[1].innerHTML = '<img src="./assets/figma-v2/icon-expression.svg" alt="Expression">';
}
new MutationObserver(decorateV4Components).observe(root, {childList:true});
decorateV4Components();
window.addEventListener('click', event => {
  const auto = event.target.closest('[data-v4="auto"]');
  if (!auto || state.page !== 'list') return;
  event.preventDefault(); event.stopImmediatePropagation();
  state.auto = !state.auto;
  /* Auto Switch is a control capability, not a program selection. */
  if (!state.running) state.selectedProgram = null;
  v4View();
}, true);
