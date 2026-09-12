/* Keep flat-review frames visually clean; the board footer opens marking mode when needed. */
if (new URLSearchParams(location.search).has('embedded')) {
  document.body.classList.add('review-embedded');
}
