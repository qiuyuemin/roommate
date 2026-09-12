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
  const query = `build=device-v4&screen=${encodeURIComponent(screen.id)}`;
  article.innerHTML = `<iframe title="${screen.title}" loading="lazy" src="./index.html?embedded=1&${query}"></iframe><footer><button type="button" data-board-mark>框选标记</button><a href="./index.html?${query}" target="_blank">单独打开</a></footer>`;
  board.append(article);
});
board.addEventListener('click', event => {
  const trigger = event.target.closest('[data-board-mark]');
  if (!trigger) return;
  trigger.closest('.board-item')?.querySelector('iframe')?.contentDocument?.querySelector('[data-review="mark"]')?.click();
});
