---
name: claude-pet:add-accessory
description: 为 Claude Pet 添加新的配饰槽位或修改现有配饰系统。
---

# 添加配饰 / 修改配饰系统

## 配饰系统架构

```
accessories.js
├── ACCESSORY_SLOTS[]     → 可用槽位列表
├── SLOT_OFFSETS{}        → 每个槽位的 Canvas 坐标偏移
├── accessoryImages{}     → 已加载的 Image 对象
├── loadAccessory()       → 加载图片到槽位
├── removeAccessory()     → 清除槽位
├── drawAccessories()     → 绘制所有配饰（在 animationLoop 中调用）
└── drawDefaultFish()     → 默认手持道具（摸鱼的鱼）
```

## 添加新槽位

### Step 1: 注册槽位

在 `accessories.js` 顶部：

```javascript
const ACCESSORY_SLOTS = ['head', 'ears', 'face', 'neck', 'hand', 'back'];
//                                                               ^^^^^^ NEW
```

### Step 2: 添加坐标偏移

```javascript
const SLOT_OFFSETS = {
  // ... existing
  back: { x: 0, y: 10, w: 50, h: 50 },
  //     ^ 水平偏移  ^ 垂直偏移  ^ 宽度 ^ 高度
  // 负 y = 上方，正 y = 下方
};
```

坐标以机器人身体中心 (cx, cy) 为原点，单位是缩放前的逻辑像素。

### Step 3: 添加图标

在 `settings.js` 的 `getSlotIcon()` 中：

```javascript
function getSlotIcon(slot) {
  const icons = {
    head: '🎩', ears: '🎧', face: '👓', neck: '🧣', hand: '🐟',
    back: '🎒'  // NEW
  };
  return icons[slot] || '📎';
}
```

### Step 4: 槽位自动渲染

设置面板的配饰区域通过 `ACCESSORY_SLOTS.map()` 自动生成，无需额外修改 `settings.js` 的 HTML 模板。

### Step 5: 验证

1. `npm start`
2. 右键 → 设置面板 → 确认新槽位出现在配饰列表中
3. 点击 Import 导入一张测试图片
4. 确认图片显示在正确位置

## 添加默认道具

某些动画需要默认道具（如摸鱼动画的鱼）。在 `accessories.js` 中添加：

```javascript
function drawDefaultBackpack(cx, cy, s, data) {
  // 绘制默认背包
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(cx - 15 * s, cy + 10 * s, 30 * s, 35 * s);
  // 背带
  ctx.strokeStyle = '#654321';
  ctx.lineWidth = 3 * s;
  ctx.strokeRect(cx - 18 * s, cy + 5 * s, 36 * s, 5 * s);
}
```

然后在 `drawAccessories()` 中按条件调用：

```javascript
function drawAccessories(data) {
  // ... existing slot drawing

  // Draw default items if no custom accessory loaded
  if (data.showBackpack && !accessoryImages.back) {
    drawDefaultBackpack(cx, cy, s, data);
  }
}
```

## 配饰图片规范

- **格式:** PNG（推荐，支持透明）或 SVG
- **尺寸:** 建议 128x128px 以内
- **存储:** 以 Data URL 存入 localStorage，不用文件路径
- **性能:** 单个配饰图片不超过 500KB

## 注意事项

- 配饰绘制在 `drawAccessories()` 中，调用顺序在 `drawSign()` 之后、动画循环末尾
- 如果配饰需要在身体后方（如背部配饰），需在 `drawRobot()` 的身体绘制和手臂绘制之间额外调用
- 配饰跟随 `data.breath`（呼吸）和 `data.jumpOffset`（跳跃）偏移
