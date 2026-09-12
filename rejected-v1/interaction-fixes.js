/* Runtime refinement: finish requires a continuous press, never a delayed click. */
app.addEventListener('pointerdown', event => {
  const finish = event.target.closest('[data-action="hold-finish"]');
  if (!finish) return;
  event.preventDefault();
  beginHold(finish);
}, true);

app.addEventListener('click', event => {
  if (!event.target.closest('[data-action="hold-finish"]')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true);

/* Attach Figma's independent vector assets without turning any screen into an image. */
const addFigmaDecorations = () => {
  const control = app.querySelector('.control-page');
  if (control && !control.querySelector('.figma-control-bg')) {
    control.insertAdjacentHTML('afterbegin', '<img class="figma-control-bg" src="./assets/figma/control-bg.svg" alt="" aria-hidden="true">');
  }
  const list = app.querySelector('.program-sheet');
  if (list && !list.querySelector('.figma-list-bg')) {
    list.insertAdjacentHTML('afterbegin', '<img class="figma-list-bg" src="./assets/figma/list-bg.svg" alt="" aria-hidden="true">');
  }
  const log = app.querySelector('.log-sheet');
  if (log && !log.querySelector('.figma-log-bg')) {
    log.insertAdjacentHTML('afterbegin', '<img class="figma-log-bg" src="./assets/figma/log-bg.svg" alt="" aria-hidden="true">');
    log.querySelectorAll('.amount-vessel').forEach(vessel => vessel.insertAdjacentHTML('afterbegin', '<img class="figma-milk-vessel" src="./assets/figma/milk.svg" alt="" aria-hidden="true">'));
  }
};
new MutationObserver(addFigmaDecorations).observe(app, { childList: true });
addFigmaDecorations();
