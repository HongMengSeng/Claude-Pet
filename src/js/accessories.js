// accessories.js — Accessory slot system

const ACCESSORY_SLOTS = ['head', 'ears', 'face', 'neck', 'hand'];
const DEFAULT_ACCESSORIES = {
  head: null,
  ears: null,
  face: null,
  neck: null,
  hand: null
};

let accessories = { ...DEFAULT_ACCESSORIES };
let accessoryImages = {};

// Position offsets for each slot (relative to robot center, pre-scale)
const SLOT_OFFSETS = {
  head:  { x: 0, y: -68, w: 60, h: 40 },
  ears:  { x: 0, y: -20, w: 70, h: 30 },
  face:  { x: 0, y: -15, w: 50, h: 25 },
  neck:  { x: 0, y: 30, w: 44, h: 20 },
  hand:  { x: 0, y: 80, w: 30, h: 30 }
};

function loadAccessory(slot, imageDataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      accessoryImages[slot] = img;
      accessories[slot] = imageDataUrl;
      resolve();
    };
    img.onerror = reject;
    img.src = imageDataUrl;
  });
}

function removeAccessory(slot) {
  delete accessoryImages[slot];
  accessories[slot] = null;
}

function getAccessoryConfig() {
  return { ...accessories };
}

function loadAccessoryConfig(config) {
  if (!config) return;
  Object.keys(config).forEach(slot => {
    if (config[slot] && ACCESSORY_SLOTS.includes(slot)) {
      loadAccessory(slot, config[slot]).catch(() => {
        console.warn(`[Claude Pet] Failed to load accessory for slot: ${slot}`);
      });
    }
  });
}

// ─── Drawing ───

function drawAccessories(data) {
  const { cx, cy, scale: s } = getLayout();

  Object.keys(accessoryImages).forEach(slot => {
    const img = accessoryImages[slot];
    if (!img) return;
    const offset = SLOT_OFFSETS[slot];
    const sx = cx + offset.x * s - (offset.w * s) / 2;
    const sy = cy + offset.y * s + (data.breath || 0) + (data.jumpOffset || 0);
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.drawImage(img, sx, sy, offset.w * s, offset.h * s);
    ctx.restore();
  });

  // Draw default items when no custom accessory loaded
  if (data.holdingFish && !accessoryImages.hand) {
    drawDefaultFish(cx, cy, s, data);
  }
  if (data.holdingCoffee && !accessoryImages.hand) {
    drawDefaultCoffee(cx, cy, s, data);
  }
}

// ─── Default props ───

function drawDefaultFish(cx, cy, s, data) {
  const fx = cx + 30 * s + (data.fishX || 0);
  const fy = cy + 78 * s;
  ctx.save();
  // Fish body
  ctx.fillStyle = '#6cb4ee';
  ctx.beginPath();
  ctx.ellipse(fx, fy, 14 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  // Fish tail
  ctx.beginPath();
  ctx.moveTo(fx - 14 * s, fy);
  ctx.lineTo(fx - 22 * s, fy - 7 * s);
  ctx.lineTo(fx - 22 * s, fy + 7 * s);
  ctx.closePath();
  ctx.fill();
  // Fish eye
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(fx + 6 * s, fy - 2 * s, 3 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.arc(fx + 7 * s, fy - 2 * s, 1.5 * s, 0, Math.PI * 2);
  ctx.fill();
  // Fish mouth
  ctx.strokeStyle = '#4a90c4';
  ctx.lineWidth = s;
  ctx.beginPath();
  ctx.arc(fx + 10 * s, fy + 2 * s, 3 * s, 0, Math.PI);
  ctx.stroke();
  ctx.restore();
}

function drawDefaultCoffee(cx, cy, s, data) {
  const cupX = cx + 28 * s;
  const cupY = cy + 72 * s;
  ctx.save();
  // Cup
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.roundRect(cupX - 8 * s, cupY - 10 * s, 16 * s, 14 * s, 3 * s);
  ctx.fill();
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = s;
  ctx.stroke();
  // Coffee inside
  ctx.fillStyle = '#6B3A2A';
  ctx.fillRect(cupX - 6 * s, cupY - 6 * s, 12 * s, 8 * s);
  // Handle
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.arc(cupX + 8 * s, cupY - 3 * s, 5 * s, -0.5, Math.PI * 1.5);
  ctx.stroke();
  // Steam
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = s;
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    const sx = cupX - 3 * s + i * 6 * s;
    ctx.moveTo(sx, cupY - 10 * s);
    ctx.quadraticCurveTo(sx + 2 * s, cupY - 18 * s, sx, cupY - 22 * s);
    ctx.stroke();
  }
  ctx.restore();
}
