/* The mode-tab component uses Figma's 13.33 × 17.72 Expression droplet export. */
v4ModeTab = function (mode, title, icon) {
  const active = state.mode === mode;
  const source = mode === 'stimulation'
    ? (active ? './assets/figma-v2/icon-stimulation.svg' : r2Asset('list-heart.svg'))
    : mode === 'expression'
      ? r2Asset('list-expression.svg')
      : icon;
  return `<button data-v4="mode" data-mode="${mode}" class="${active ? 'active' : ''}"><img src="${source}" alt="">${title}</button>`;
};
