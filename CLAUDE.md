# Claude Pet — Project Guide

> **Identity:** Claude Pet 是一个跨平台桌面宠物应用。本体是一个小机器人（显示器头 + 机械臂 + 暖橙配色），在桌面上根据 Claude Code 会话状态展示不同动画。

---

## 1. 架构总览

```
┌─────────────────────────────────────────────────┐
│                  Electron Main                   │
│  main.js: 窗口管理 / HTTP Server / IPC           │
│  preload.js: contextBridge API                   │
├─────────────────────────────────────────────────┤
│                  Renderer (Canvas)               │
│  pet-core.js   → 机器人绘制 (SVG/Canvas2D)       │
│  states.js     → 状态机 (idle/working/review)    │
│  animations.js → 动画循环 + 粒子/气泡/举牌       │
│  accessories.js → 配饰槽位 (5 slots)             │
│  settings.js   → 设置面板 UI + 存储              │
│  app.js        → 入口，串联所有模块              │
└─────────────────────────────────────────────────┘
```

**核心原则：所有渲染走 Canvas，不引入 DOM 框架。** 保持零依赖（仅 Electron + electron-builder）。

---

## 2. 文件职责

| 文件 | 职责 | 不可做的事 |
|------|------|-----------|
| `electron/main.js` | 窗口创建、HTTP Server、IPC handlers、生命周期 | 不可放业务逻辑 |
| `electron/preload.js` | 暴露 `window.petAPI` 给渲染进程 | 不可放业务逻辑 |
| `src/js/pet-core.js` | Canvas 绘制函数：drawHead/drawBody/drawArm/drawDesk/drawEyes | 不可放动画逻辑 |
| `src/js/states.js` | 状态机：PetStateMachine 类，状态转换 + 空闲周期 | 不可碰 DOM |
| `src/js/animations.js` | 动画循环、ANIM_STATES 定义、粒子/气泡类 | 不可直接操作状态机 |
| `src/js/accessories.js` | 配饰图片加载、存储、Canvas 叠加绘制 | 不可碰状态机 |
| `src/js/settings.js` | 设置面板 DOM、localStorage、导入导出 | 可操作 DOM，不可碰动画 |
| `src/js/app.js` | 入口：连接状态机→动画，监听 window.petAPI | 只做串联，不加新功能 |

---

## 3. 状态机

```
     ┌──────────┐
     │   IDLE   │ ←── 默认状态，定时随机触发 idle_action
     └────┬─────┘
          │ session_start
          ▼
     ┌──────────┐
     │ WORKING  │ ←── 敲键盘 + 代码粒子
     └────┬─────┘
          │ review_requested
          ▼
     ┌──────────────┐
     │ REVIEW_PENDING│ ←── 举黄牌 "⏳ Review Pending..."
     └──────┬───────┘
            │ review_done
            ▼
     ┌────────────────┐
     │ REVIEW_APPROVED │ ←── 绿牌庆祝 → 4s 后自动回 WORKING
     └────────────────┘
```

**空闲动作池 (idle_actions):** `snoring` | `fish` | `coffee` | `selfcheck`
**随机触发间隔:** 默认 30s–120s（可配置）

**状态转换规则（不可违背）：**
- IDLE → WORKING, REVIEW_PENDING
- WORKING → IDLE, REVIEW_PENDING
- REVIEW_PENDING → REVIEW_APPROVED, IDLE
- REVIEW_APPROVED → WORKING, IDLE
- 不允许跨级跳转（如 IDLE → REVIEW_APPROVED）

---

## 4. 动画系统

### 4.1 动画循环

```
requestAnimationFrame → animationLoop() → activeAnim.update(data, frame) → drawRobot(data)
```

- `frame` 从 0 开始累加，每帧 +1
- `currentAnimData` 是动画状态的共享数据对象
- 每个 ANIM_STATES 条目有：`expression`, `init(data)`, `update(data, frame)`

### 4.2 动画数据对象 (currentAnimData)

```javascript
{
  expression: 'normal',    // 'working'|'sleeping'|'happy'|'worried'|'normal'
  armLeft: 0,              // 0=自然下垂, 0.5=中等抬起, 1=高举
  armRight: 0,
  bubbles: [],             // Bubble 实例（Zzz 气泡）
  particles: [],           // CodeParticle 实例（代码粒子）
  sign: null,              // { text, color } 举牌内容
  breath: 0,               // 呼吸起伏偏移
  fishX: 0,                // 鱼的水平位置
  holdingFish: false,      // 是否抱鱼
  sway: 0,                 // 身体摇晃偏移
  jumpOffset: 0,           // 跳跃偏移
}
```

### 4.3 添加新动画

1. 在 `animations.js` 的 `ANIM_STATES` 中添加新条目
2. 实现 `init(data)` — 初始化数据（粒子、气泡、sign 等）
3. 实现 `update(data, frame)` — 每帧更新逻辑
4. 在 `app.js` 的映射表中注册（STATE_ANIM_MAP 或 IDLE_ANIM_MAP）
5. 如果数据有新字段，在 `pet-core.js` 的 `drawRobot()` 中使用

---

## 5. 机器人绘制系统

### 5.1 坐标系统

所有绘制以 Canvas 中心为原点，通过 `getLayout()` 获取：
```javascript
{ cx: W/2, cy: H*0.35, scale: Math.min(W/300, H/400) }
```
- `cx, cy` — 机器人身体中心（屏幕中上方）
- `scale` — 缩放因子，保证不同窗口大小下机器人比例一致
- 所有绘制坐标都乘以 `scale`

### 5.2 绘制层级（由下到上）

1. 桌子 `drawDesk()`
2. 身体 `drawBody()`
3. 手臂 x2 `drawArm()` — 受 armLeft/armRight 控制
4. 头部 `drawHead()`
5. 眼睛/表情 `drawEyes()` — 受 expression 控制
6. 键盘 `drawKeyboard()`
7. 举牌 `drawSign()` — 来自 animations.js
8. 气泡 `drawBubbles()` — 来自 animations.js
9. 粒子 `drawParticles()` — 来自 animations.js
10. 配饰 `drawAccessories()` — 来自 accessories.js

### 5.3 配色常量

```javascript
COLORS = {
  body: '#2d2d44',        // 深灰机身
  bodyLight: '#3a3a5c',   // 浅灰
  screen: '#1a1a2e',      // 屏幕底色（深蓝黑）
  screenBorder: '#444',   // 屏幕边框
  accent: '#ff8c42',      // Claude 暖橙
  arm: '#3a3a5c',
  hand: '#4a4a6a',
  eye: '#ff8c42',
  highlight: '#d4a574'    // 身体高光线
}
```

---

## 6. 配饰系统

### 6.1 槽位

| 槽位 | 位置 | 默认偏移 |
|------|------|---------|
| `head` | 头部上方 | y: -68 |
| `ears` | 头部两侧 | y: -20 |
| `face` | 屏幕前方 | y: -15 |
| `neck` | 脖子 | y: +30 |
| `hand` | 手部 | y: +80 |

### 6.2 添加新配饰槽位

1. 在 `ACCESSORY_SLOTS` 数组添加名称
2. 在 `SLOT_OFFSETS` 添加位置偏移
3. 在 `getSlotIcon()` 添加 emoji 图标
4. 在 `settings.js` 的 setting-section 会自动渲染

---

## 7. Claude Code 集成

### 7.1 通信协议

- **端口:** `127.0.0.1:18923`
- **POST /pet/state** `{ "state": "session_start|session_end|review_requested|review_done" }`
- **GET /pet/health** → `{ "status": "ok", "state": "..." }`

### 7.2 Hook 配置

用户需在 `~/.claude/settings.json` 配置 hooks，调用 `hook/claude-code-hook.js`。
宠物端通过 `window.petAPI.onStateChange()` 接收状态变更。

---

## 8. 编码规范

### 必须遵守

- **零框架依赖** — 只用 vanilla JS + Canvas + CSS，不引入 React/Vue/jQuery
- **模块化但不使用 ES modules** — 通过 `<script>` 标签顺序加载，全局命名空间
- **函数命名** — 绘制函数用 `draw*` 前缀，状态相关用 `handle*` 前缀
- **Canvas 绘图全部走 pet-core.js** — 其他模块不要直接 `ctx.fillRect()`
- **状态变更走状态机** — 不要直接修改 `currentAnimData` 来切换状态
- **设置持久化用 localStorage** — key 前缀 `claude-pet-`

### 禁止

- ❌ 引入 npm 依赖（除了 electron 和 electron-builder）
- ❌ 在绘制函数中放动画逻辑
- ❌ 在动画函数中直接操作 DOM
- ❌ 硬编码尺寸（都用 scale 缩放）
- ❌ 跨模块直接访问其他模块的私有变量

### 提交规范

- `feat:` — 新功能
- `fix:` — 修复
- `refactor:` — 重构
- `docs:` — 文档
- `style:` — 样式调整
- `chore:` — 杂项

---

## 9. 开发流程

```
修改代码 → npm start 验证 → 肉眼确认动画 → git commit
```

- 每次 commit 前必须 `npm start` 确认窗口能正常显示
- 修改绘制逻辑后检查不同窗口大小下机器人是否正常
- 新增状态/动画后确认状态转换逻辑正确

---

## 10. 已知限制 & 设计决策

- **为什么不用 React/Vue？** — 保持极简，Canvas 渲染不需要 DOM diff，减少包体积
- **为什么不拆分 ES modules？** — Electron 渲染进程直接用 file:// 协议加载，避免 CORS 和打包配置复杂度
- **为什么窗口 400x500？** — 足够展示机器人 + 桌子 + 动画，不占用太多桌面空间
- **为什么点击穿透默认开启？** — 桌面宠物不应阻挡用户操作，右键打开设置面板
