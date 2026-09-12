if (new URLSearchParams(location.search).get('review') === '1') {
  const notes = JSON.parse(localStorage.getItem('air2-v2-review') || '[]');
  let marking = false;
  const tools = document.createElement('aside');
  tools.className = 'review-tools';
  tools.innerHTML = '<b>Review mode</b><button data-review="mark">Mark screen</button><button data-review="copy">Copy notes</button><button data-review="export">Export JSON</button><button data-review="clear">Clear notes</button>';
  document.body.append(tools);
  const save = () => localStorage.setItem('air2-v2-review', JSON.stringify(notes));
  const draw = () => { root.querySelectorAll('.review-pin').forEach(pin => pin.remove()); notes.filter(n => n.page === state.page && n.modal === state.modal).forEach((n, i) => { const pin = document.createElement('i'); pin.className = 'review-pin'; pin.style.left = n.x + '%'; pin.style.top = n.y + '%'; pin.textContent = i + 1; root.append(pin); }); };
  const observer = new MutationObserver(draw); observer.observe(root, {childList:true}); draw();
  tools.addEventListener('click', async event => { const action = event.target.dataset.review; if (action === 'mark') { marking = !marking; event.target.classList.toggle('marking', marking); event.target.textContent = marking ? 'Tap target…' : 'Mark screen'; } if (action === 'copy') { await navigator.clipboard.writeText(JSON.stringify(notes, null, 2)); } if (action === 'export') { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(notes, null, 2)], {type:'application/json'})); a.download = 'air2-review-notes.json'; a.click(); URL.revokeObjectURL(a.href); } if (action === 'clear' && confirm('Clear saved notes?')) { notes.length = 0; save(); draw(); } });
  root.addEventListener('click', event => { if (!marking) return; event.preventDefault(); event.stopImmediatePropagation(); const box = root.getBoundingClientRect(); const note = prompt('Describe this adjustment'); if (!note) return; notes.push({page:state.page,modal:state.modal,x:+((event.clientX-box.left)/box.width*100).toFixed(2),y:+((event.clientY-box.top)/box.height*100).toFixed(2),note,createdAt:new Date().toISOString()}); save(); marking = false; tools.querySelector('[data-review="mark"]').classList.remove('marking'); tools.querySelector('[data-review="mark"]').textContent = 'Mark screen'; draw(); }, true);
}
