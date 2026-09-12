const board = document.querySelector('#review-board');
let lastGroup = '';

AIR2_SCREEN_REGISTRY.forEach(screen => {
  if (screen.group !== lastGroup) {
    const heading = document.createElement('h2');
    heading.className = 'board-group';
    heading.textContent = screen.group;
    board.append(heading);
    lastGroup = screen.group;
  }

  const article = document.createElement('article');
  article.className = 'board-item';
  article.dataset.screen = screen.id;
  const query = `build=r3&screen=${encodeURIComponent(screen.id)}`;
  article.innerHTML = `
    <header><div><b>${screen.title}</b><small>${screen.id}${screen.figma ? ` · Figma ${screen.figma}` : ''}</small></div><a href="./index.html?${query}" target="_blank">单独打开</a></header>
    <iframe title="${screen.title}" loading="lazy" src="./index.html?embedded=1&${query}"></iframe>
  `;
  board.append(article);
});
