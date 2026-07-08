---
name: claude-pet:add-animation
description: 为 Claude Pet 添加新的动画（空闲动作或新状态动画）。指导如何正确在动画系统中注册和实现。
---

# 添加新动画

用此技能添加新的宠物动画——无论是新的空闲动作（如"发呆"、"跳舞"）还是新的状态动画。

## 动画类型判断

### A. 空闲动作 (Idle Action)
- 触发方式：随机，由状态机的 `idleActions` 数组控制
- 持续时间：无限（持续到下一个随机切换或状态变更）
- 示例：snoring、fish、coffee、selfcheck

### B. 状态动画 (State Animation)
- 触发方式：状态机状态变更时
- 持续时间：随状态持续
- 示例：working、review_pending、review_approved

## 添加步骤

### Step 1: 确定数据字段

检查 `currentAnimData` 是否需要新字段。如果需要（如新动画需要特殊的粒子效果、新类型的浮动对象），在 `animations.js` 顶部 `currentAnimData` 对象中添加。

```javascript
// 例如：添加 "星光" 动画需要 sparkles 数组
let currentAnimData = {
  // ... existing fields
  sparkles: [],  // NEW: 星光粒子数组
};
```

### Step 2: 实现 ANIM_STATES 条目

在 `animations.js` 的 `ANIM_STATES` 对象中添加：

```javascript
idle_stargazing: {
  expression: 'normal',     // 表情：'working'|'sleeping'|'happy'|'worried'|'normal'
  armLeft: 0,               // 左臂初始角度
  armRight: 0,              // 右臂初始角度
  init(data) {
    // 初始化：创建粒子、设置 sign、清空气泡
    data.bubbles = [];
    data.particles = [];
    data.sign = null;
    data.sparkles = Array.from({ length: 10 }, () => ({
      x: (Math.random() - 0.5) * 200,
      y: -50 - Math.random() * 100,
      size: 2 + Math.random() * 4,
      twinkle: Math.random() * Math.PI * 2
    }));
  },
  update(data, frame) {
    // 每帧更新
    data.expression = 'happy';
    // 闪烁星星
    data.sparkles.forEach(s => {
      s.twinkle += 0.05;
      s.y += 0.2;
      if (s.y > 100) s.y = -100;
    });
  }
}
```

### Step 3: 在 pet-core.js 添加绘制逻辑（如需新绘制）

如果新动画需要绘制当前 `drawRobot()` 不覆盖的内容，在 `pet-core.js` 中添加对应的 `draw*()` 函数，并暴露给动画循环调用。

```javascript
// 在 pet-core.js 中
function drawSparkles(data) {
  if (!data.sparkles || data.sparkles.length === 0) return;
  const { cx, cy, scale: s } = getLayout();
  data.sparkles.forEach(sp => {
    ctx.fillStyle = `rgba(255,215,0,${0.5 + Math.sin(sp.twinkle) * 0.5})`;
    ctx.beginPath();
    ctx.arc(cx + sp.x * s, cy + sp.y * s, sp.size * s, 0, Math.PI * 2);
    ctx.fill();
  });
}
```

然后在 `animationLoop()` 中调用：

```javascript
function animationLoop() {
  // ... existing
  drawSparkles(currentAnimData);
  // ...
}
```

### Step 4: 注册动画映射

**空闲动作：** 在 `app.js` 的 `IDLE_ANIM_MAP` 中添加：

```javascript
const IDLE_ANIM_MAP = {
  // ... existing
  'stargazing': 'idle_stargazing',
};
```

同时将动作名加入 `states.js` 的 `idleActions` 数组：

```javascript
this.idleActions = ['snoring', 'fish', 'coffee', 'selfcheck', 'stargazing'];
```

**状态动画：** 在 `app.js` 的 `STATE_ANIM_MAP` 中添加：

```javascript
const STATE_ANIM_MAP = {
  // ... existing
  'new_state': 'new_state_anim',
};
```

### Step 5: 验证

1. `npm start` 启动
2. 右键 → 设置面板 → 手动切换触发新动画的状态
3. 确认动画流畅、无闪烁、无残留

## 动画编写原则

- **init() 必须清空 data** — 不清理会导致上一个动画的粒子/气泡残留
- **用正弦函数做循环动画** — `Math.sin(frame * speed)` 天然循环，不需要手动重置
- **避免大数组** — 粒子/气泡不超过 20 个，防止性能问题
- **expression 是必须的** — 每个动画必须设置表情，否则显示默认眼睛
