(() => {
  const STORAGE_KEY = 'air2-v2-review';
  const params = new URLSearchParams(location.search);
  const notes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

  let selecting = false;
  let startPoint = null;
  let pendingRect = null;
  let selectionLayer = null;
  let draft = null;
  let rendering = false;

  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'review-launcher';
  launcher.innerHTML = '<span aria-hidden="true">⌗</span> 批注';
  launcher.setAttribute('aria-label', '打开页面批注工具');

  const tools = document.createElement('aside');
  tools.className = 'review-tools';
  tools.hidden = params.get('review') !== '1';
  tools.innerHTML = `
    <div class="review-tools__head">
      <div><b>页面批注</b><small data-review-count></small></div>
      <button type="button" class="review-close" data-review="close" aria-label="收起批注工具">×</button>
    </div>
    <button type="button" class="review-primary" data-review="mark">框选标记</button>
    <button type="button" data-review="copy">复制标注 JSON</button>
    <button type="button" data-review="export">导出 JSON</button>
    <button type="button" data-review="clear">清空标注</button>
    <p class="review-status" aria-live="polite">拖拽框选页面区域，再填写修改意见。</p>
  `;

  const editor = document.createElement('section');
  editor.className = 'review-editor';
  editor.hidden = true;
  editor.innerHTML = `
    <b>填写修改意见</b>
    <textarea rows="4" placeholder="例如：这里的奶量容器高度应与 Figma 一致"></textarea>
    <div>
      <button type="button" data-editor="cancel">取消</button>
      <button type="button" class="review-editor__save" data-editor="save">保存标记</button>
    </div>
  `;

  document.body.append(launcher, tools, editor);

  const status = tools.querySelector('.review-status');
  const count = tools.querySelector('[data-review-count]');
  const markButton = tools.querySelector('[data-review="mark"]');
  const textarea = editor.querySelector('textarea');

  const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  const currentPage = () => typeof state === 'undefined' ? null : state.page;
  const currentModal = () => typeof state === 'undefined' ? null : state.modal;
  const matchesCurrentView = note => note.page === currentPage() && (note.modal || null) === (currentModal() || null);

  function setStatus(message) {
    status.textContent = message;
  }

  function refreshCount() {
    const visible = notes.filter(matchesCurrentView).length;
    count.textContent = `${notes.length} 条 · 当前页 ${visible} 条`;
  }

  function renderAnnotations() {
    if (rendering) return;
    rendering = true;
    observer.disconnect();
    root.querySelectorAll('.review-annotation').forEach(node => node.remove());

    notes.filter(matchesCurrentView).forEach((note, index) => {
      const annotation = document.createElement(note.width && note.height ? 'div' : 'i');
      annotation.className = note.width && note.height
        ? 'review-annotation review-box'
        : 'review-annotation review-pin';
      annotation.style.left = `${note.x}%`;
      annotation.style.top = `${note.y}%`;
      annotation.title = note.note || '';

      if (note.width && note.height) {
        annotation.style.width = `${note.width}%`;
        annotation.style.height = `${note.height}%`;
        annotation.innerHTML = `<span>${index + 1}</span>`;
      } else {
        annotation.textContent = index + 1;
      }
      root.append(annotation);
    });

    observer.observe(root, { childList: true });
    refreshCount();
    rendering = false;
  }

  function removeSelectionLayer() {
    selectionLayer?.remove();
    selectionLayer = null;
    draft = null;
    startPoint = null;
  }

  function finishSelectionMode({ keepEditor = false } = {}) {
    selecting = false;
    removeSelectionLayer();
    markButton.classList.remove('marking');
    markButton.textContent = '框选标记';
    if (!keepEditor) {
      pendingRect = null;
      editor.hidden = true;
      textarea.value = '';
    }
  }

  function localPoint(event) {
    const box = root.getBoundingClientRect();
    return {
      x: Math.min(box.width, Math.max(0, event.clientX - box.left)),
      y: Math.min(box.height, Math.max(0, event.clientY - box.top)),
      width: box.width,
      height: box.height,
      left: box.left,
      top: box.top
    };
  }

  function updateDraft(point) {
    if (!startPoint || !draft) return;
    const left = Math.min(startPoint.x, point.x);
    const top = Math.min(startPoint.y, point.y);
    const width = Math.abs(point.x - startPoint.x);
    const height = Math.abs(point.y - startPoint.y);
    Object.assign(draft.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`
    });
  }

  function openEditor(point) {
    editor.hidden = false;
    const editorWidth = 316;
    const left = Math.min(window.innerWidth - editorWidth - 12, Math.max(12, point.left + point.x));
    const top = Math.min(window.innerHeight - 210, Math.max(12, point.top + point.y + 12));
    editor.style.left = `${left}px`;
    editor.style.top = `${top}px`;
    requestAnimationFrame(() => textarea.focus());
  }

  function startSelection() {
    finishSelectionMode();
    selecting = true;
    markButton.classList.add('marking');
    markButton.textContent = '正在框选…';
    setStatus('在手机页面上按住并拖拽，框出需要修改的区域。');

    selectionLayer = document.createElement('div');
    selectionLayer.className = 'review-selection-layer review-ui-in-root';
    selectionLayer.setAttribute('aria-label', '拖拽框选批注区域');
    root.append(selectionLayer);

    selectionLayer.addEventListener('pointerdown', event => {
      event.preventDefault();
      event.stopPropagation();
      selectionLayer.setPointerCapture(event.pointerId);
      startPoint = localPoint(event);
      draft = document.createElement('div');
      draft.className = 'review-selection-draft';
      selectionLayer.append(draft);
      updateDraft(startPoint);
    });

    selectionLayer.addEventListener('pointermove', event => {
      if (!startPoint) return;
      event.preventDefault();
      updateDraft(localPoint(event));
    });

    selectionLayer.addEventListener('pointerup', event => {
      if (!startPoint) return;
      event.preventDefault();
      event.stopPropagation();
      const end = localPoint(event);
      const left = Math.min(startPoint.x, end.x);
      const top = Math.min(startPoint.y, end.y);
      const width = Math.abs(end.x - startPoint.x);
      const height = Math.abs(end.y - startPoint.y);
      if (width < 6 || height < 6) {
        draft?.remove();
        draft = null;
        startPoint = null;
        setStatus('框选范围太小，请按住并拖出一个区域。');
        return;
      }

      pendingRect = {
        x: +(left / end.width * 100).toFixed(2),
        y: +(top / end.height * 100).toFixed(2),
        width: +(width / end.width * 100).toFixed(2),
        height: +(height / end.height * 100).toFixed(2)
      };
      openEditor({ ...end, x: left, y: top + height });
      setStatus('填写意见并保存；取消不会留下标记。');
    });
  }

  function savePendingNote() {
    const noteText = textarea.value.trim();
    if (!pendingRect || !noteText) {
      textarea.focus();
      setStatus('请先填写修改意见。');
      return;
    }

    const snapshot = typeof state === 'undefined' ? {} : {
      running: state.running,
      mode: state.mode,
      auto: state.auto,
      selectedProgram: state.selectedProgram
    };
    notes.push({
      kind: 'rect',
      page: currentPage(),
      modal: currentModal(),
      ...pendingRect,
      note: noteText,
      state: snapshot,
      viewport: { width: Math.round(root.clientWidth), height: Math.round(root.clientHeight) },
      createdAt: new Date().toISOString()
    });
    persist();
    finishSelectionMode();
    renderAnnotations();
    setStatus('标记已保存。可继续框选，或复制/导出 JSON。');
  }

  async function copyNotes() {
    const json = JSON.stringify(notes, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setStatus('标注 JSON 已复制到剪贴板。');
    } catch (_) {
      const helper = document.createElement('textarea');
      helper.value = json;
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.append(helper);
      helper.select();
      document.execCommand('copy');
      helper.remove();
      setStatus('标注 JSON 已复制到剪贴板。');
    }
  }

  const observer = new MutationObserver(records => {
    if (rendering) return;
    const appChanged = records.some(record => [...record.addedNodes, ...record.removedNodes].some(node => {
      return node.nodeType !== Node.ELEMENT_NODE || !node.classList.contains('review-ui-in-root');
    }));
    if (!appChanged) return;
    if (selecting) {
      finishSelectionMode();
      setStatus('页面已切换，请重新框选。');
    }
    renderAnnotations();
  });

  launcher.addEventListener('click', () => {
    tools.hidden = !tools.hidden;
    launcher.classList.toggle('active', !tools.hidden);
    if (!tools.hidden) refreshCount();
  });

  tools.addEventListener('click', event => {
    const action = event.target.closest('[data-review]')?.dataset.review;
    if (!action) return;
    if (action === 'mark') selecting ? finishSelectionMode() : startSelection();
    if (action === 'copy') copyNotes();
    if (action === 'export') {
      const url = URL.createObjectURL(new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'air2-review-notes.json';
      link.click();
      URL.revokeObjectURL(url);
      setStatus('已导出 air2-review-notes.json。');
    }
    if (action === 'clear' && confirm('确定清空全部已保存标注吗？')) {
      notes.length = 0;
      persist();
      finishSelectionMode();
      renderAnnotations();
      setStatus('全部标注已清空。');
    }
    if (action === 'close') {
      finishSelectionMode();
      tools.hidden = true;
      launcher.classList.remove('active');
    }
  });

  editor.addEventListener('click', event => {
    const action = event.target.closest('[data-editor]')?.dataset.editor;
    if (action === 'save') savePendingNote();
    if (action === 'cancel') {
      finishSelectionMode();
      setStatus('已取消本次标记。');
    }
  });

  textarea.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') savePendingNote();
    if (event.key === 'Escape') {
      finishSelectionMode();
      setStatus('已取消本次标记。');
    }
  });

  observer.observe(root, { childList: true });
  launcher.classList.toggle('active', !tools.hidden);
  renderAnnotations();
})();
