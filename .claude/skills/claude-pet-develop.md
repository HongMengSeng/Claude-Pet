---
name: claude-pet:develop
description: Claude Pet 项目开发主技能。修改任何代码前必须先加载此技能。确保架构一致性、编码规范、模块边界不被破坏。
---

# Claude Pet 开发技能

> **触发条件：** 任何涉及 Claude Pet 项目的代码修改、功能添加、bug 修复
> **前置条件：** 必须先读取 `CLAUDE.md` 了解项目架构

## 开发流程（必须遵守）

### 1. 修改前检查

在修改任何文件之前，确认：

- [ ] 已读取 `CLAUDE.md`，了解架构和模块边界
- [ ] 确认要修改的文件——是否属于正确的模块？
- [ ] 新功能是否需要修改状态机？如果需要，确认状态转换合法
- [ ] 是否需要新增 npm 依赖？**原则：不允许**（除非是 Electron 生态必需）

### 2. 模块边界检查

修改代码时必须问自己：

- **绘制逻辑** → 是否只在 `pet-core.js` 中？画新东西用 `draw*()` 函数
- **动画逻辑** → 是否只在 `animations.js` 中？通过 `ANIM_STATES` 条目定义
- **状态管理** → 是否通过 `petState.transition()` 而不是直接赋值？
- **配饰修改** → 是否只动 `accessories.js`，不动绘制核心？
- **设置 UI** → 是否只动 `settings.js` + `pet.css`，不动动画系统？

### 3. 不允许的跨模块操作

```
❌ animations.js → document.getElementById()
❌ pet-core.js  → petState.transition()
❌ states.js     → ctx.fillRect()
❌ accessories.js → ANIM_STATES
❌ settings.js   → requestAnimationFrame()
```

### 4. 添加功能的三步曲

新增任何功能按以下顺序：

1. **数据层** — 状态、配置、存储（states.js 或 settings.js）
2. **渲染层** — Canvas 绘制（pet-core.js）
3. **动画层** — 帧更新逻辑（animations.js）

### 5. 验证步骤

代码写完后必须：

1. `npm start` 启动，确认窗口正常显示
2. 右键打开设置面板，手动切换所有状态确认动画正常
3. 拖拽窗口确认位置正确
4. 确认点击穿透正常工作（桌面图标可被点击）

### 6. 提交规范

```bash
git add <具体文件>
git commit -m "feat: <简短描述>"
```

- 每个独立功能单独 commit
- commit message 用英文，小写开头
- 不要在 commit 中包含 `node_modules/` 或 `dist/`

## 常见问题处理

### 动画不流畅
- 检查 `requestAnimationFrame` 回调中是否有同步阻塞操作
- 确认 Canvas 尺寸没在每帧重复设置

### 配饰图片不显示
- 确认图片加载完成后再绘制（`img.onload`）
- 检查 `SLOT_OFFSETS` 偏移值是否正确

### 状态切换无效
- 检查 `STATE_TRANSITIONS` 是否包含该转换
- 确认是通过 `petState.setState()` 而非直接赋值

### 窗口不置顶
- 检查 `alwaysOnTop: true` 和 `setVisibleOnAllWorkspaces(true)`
- 某些 Linux 桌面环境可能不完全支持，需要 `--enable-transparent-visuals`
