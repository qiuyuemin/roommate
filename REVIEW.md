# Air2 页面平铺评审

启动本地服务后打开：

```text
http://127.0.0.1:4173/review-board.html
```

平铺页包含 15 个主流程状态。每个画板右上角的“批注”按钮均可拖拽框选、填写意见，并导出 `air2-review-notes.json`。

完整交互版本仍为：

```text
http://127.0.0.1:4173/index.html
```

页面关系保存在 `screen-registry.js` 的 `AIR2_SCREEN_RELATIONS` 中。平铺页通过 `index.html?screen=<screen-id>` 复用同一套页面渲染代码，不复制页面实现。
