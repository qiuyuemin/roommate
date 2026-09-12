# V3 / V3 Pro 佩戴检测提醒 Demo

本项目以 Air 2 H5 Demo 的完整页面、组件和素材体系为基础，验证同一 App 内 V3 / V3 Pro 在吸奶结束后的佩戴检测提醒。

## 体验方式

1. 打开右上角 `V3 Fit`。
2. 选择 V3 或 V3 Pro。
3. 选择无漏气、轻微漏气或严重漏气。
4. 进入 Pump Control，长按 `Hold to Finish`。
5. 保存奶量并查看对应结束分支。

轻微或严重漏气会进入：温馨提示 → 导管检查 → 奶碗检查 → 佩戴建议 → Logged。

新增功能集中在 `v3-fit-reminder.js` 和 `v3-fit-reminder.css`，其余页面继续使用 Air 2 的同源文件。
