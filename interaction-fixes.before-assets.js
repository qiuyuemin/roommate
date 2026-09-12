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
