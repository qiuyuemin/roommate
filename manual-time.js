function installManualTime() {
  if (!state.running || state.auto || state.selectedProgram) return;
  const title = root.querySelector('.v4-manual-head > span');
  if (title && !title.querySelector('.v4-time')) title.insertAdjacentHTML('beforeend', ` <em class="v4-time">${time(state.timer)}</em>`);
}
new MutationObserver(installManualTime).observe(root, {childList:true});
installManualTime();
