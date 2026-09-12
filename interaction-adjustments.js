(() => {
  let bothDrag = null;

  document.addEventListener('pointerdown', event => {
    const track = event.target.closest('#demo [data-v4-drag="both"]');
    if (!track || document.body.classList.contains('review-static')) return;
    bothDrag = {
      track,
      knob:track.querySelector('.v4-both-knob'),
      startY:event.clientY,
      startL:state.levelL,
      startR:state.levelR,
      pointerId:event.pointerId
    };
    bothDrag.knob?.classList.add('dragging');
  }, true);

  document.addEventListener('pointermove', event => {
    if (!bothDrag || event.pointerId !== bothDrag.pointerId) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const distance = clamp(event.clientY - bothDrag.startY, -64, 64);
    const step = clamp(Math.round(-distance / 21), -3, 3);
    if (bothDrag.knob) bothDrag.knob.style.transform = `translateY(${distance}px)`;
    state.levelL = clamp(bothDrag.startL + step, 1, 9);
    state.levelR = clamp(bothDrag.startR + step, 1, 9);
  }, true);

  const releaseBoth = event => {
    if (!bothDrag || (event.pointerId !== undefined && event.pointerId !== bothDrag.pointerId)) return;
    event?.preventDefault();
    event?.stopImmediatePropagation();
    v4Drag = null;
    const knob = bothDrag.knob;
    if (knob) {
      knob.classList.remove('dragging');
      knob.style.transform = 'translateY(0)';
    }
    bothDrag = null;
    setTimeout(v4View, 180);
  };

  document.addEventListener('pointerup', releaseBoth, true);
  document.addEventListener('pointercancel', releaseBoth, true);
})();
