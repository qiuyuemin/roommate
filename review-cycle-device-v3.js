/* The V2 device annotations were exported to 评审V2; begin this corrected pass cleanly. */
(() => {
  const notesKey = 'air2-v2-review';
  const cycleKey = 'air2-review-cycle';
  const cycle = '2026-08-11-device-v3-clean';
  if (localStorage.getItem(cycleKey) === cycle) return;
  const previous = localStorage.getItem(notesKey);
  if (previous && previous !== '[]') localStorage.setItem(`air2-v2-review-backup-${cycle}`, previous);
  localStorage.removeItem(notesKey);
  localStorage.setItem(cycleKey, cycle);
})();
