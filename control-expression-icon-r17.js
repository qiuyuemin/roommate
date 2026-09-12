/* Figma's Expression tab uses the same droplet glyph in both states.
   The active-tab CSS turns this exact wine glyph white. */
v4ModeTab = function (mode, title, icon) {
  const active = state.mode === mode;
  const source = mode === 'stimulation'
    ? (active ? './assets/figma-v2/icon-stimulation.svg' : r2Asset('list-heart.svg'))
    : mode === 'expression'
      ? './assets/figma-v2/icon-expression.svg'
      : icon;
  return `<button data-v4="mode" data-mode="${mode}" class="${active ? 'active' : ''}"><img src="${source}" alt="">${title}</button>`;
};
