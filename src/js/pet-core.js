// pet-core.js — Cute Claude Pet drawing on Canvas

const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ─── Cute Color Palette ───
const C = {
  body:        '#FFF8F0',  // warm cream
  bodyDark:    '#E8DDD0',  // shadow
  screenBg:    '#1E1E2E',  // dark screen
  screenFrame: '#3D3D50',  // screen bezel
  accent:      '#FF8C42',  // Claude orange
  accentLight: '#FFB380',  // lighter orange
  blush:       '#FFB8B8',  // soft pink blush
  eyeWhite:    '#FFFFFF',
  pupil:       '#2D2D44',
  mouth:       '#666',
  antenna:     '#FF8C42',
  desk:        '#E8D5C4',
  deskLeg:     '#D4C0AE',
  keyboard:    '#D4D4DC',
  keyDark:     '#B0B0B8'
};

// ─── Layout ───
function getLayout() {
  const cx = W / 2;
  const cy = H * 0.38;
  const scale = Math.min(W / 280, H / 420);
  return { cx, cy, scale };
}

// ─── Helper: rounded rect ───
function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Draw Feet ───
function drawFeet(cx, cy, s) {
  const fy = cy + 72 * s;
  // Left foot
  ctx.fillStyle = C.bodyDark;
  ctx.beginPath();
  ctx.ellipse(cx - 16 * s, fy, 14 * s, 8 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  // Right foot
  ctx.beginPath();
  ctx.ellipse(cx + 16 * s, fy, 14 * s, 8 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  // Foot highlights
  ctx.fillStyle = C.body;
  ctx.beginPath();
  ctx.ellipse(cx - 16 * s, fy - 2 * s, 9 * s, 4 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 16 * s, fy - 2 * s, 9 * s, 4 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Draw Body (chubby rounded pill) ───
function drawBody(cx, cy, s) {
  // Main body - soft rounded pill shape
  const bw = 38 * s, bh = 50 * s;
  const bx = cx - bw, by = cy + 14 * s;

  // Body shadow (bottom)
  ctx.fillStyle = C.bodyDark;
  roundRect(bx - 2 * s, by + 4 * s, bw * 2 + 4 * s, bh, 22 * s);
  ctx.fill();

  // Body main
  ctx.fillStyle = C.body;
  roundRect(bx, by, bw * 2, bh, 22 * s);
  ctx.fill();

  // Body highlight (top-left shine)
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  roundRect(bx + 6 * s, by + 4 * s, bw * 1.2, bh * 0.4, 16 * s);
  ctx.fill();

  // Claude accent stripe on chest
  ctx.fillStyle = C.accent;
  roundRect(cx - 10 * s, cy + 32 * s, 20 * s, 5 * s, 2.5 * s);
  ctx.fill();

  // Small heart on chest
  ctx.fillStyle = C.accentLight;
  const hx = cx, hy = cy + 48 * s;
  ctx.beginPath();
  ctx.moveTo(hx, hy + 4 * s);
  ctx.bezierCurveTo(hx - 5 * s, hy - 2 * s, hx - 7 * s, hy + 2 * s, hx, hy + 6 * s);
  ctx.bezierCurveTo(hx + 7 * s, hy + 2 * s, hx + 5 * s, hy - 2 * s, hx, hy + 4 * s);
  ctx.fill();
}

// ─── Draw Head (big round monitor) ───
function drawHead(cx, cy, s) {
  const hw = 50 * s, hh = 42 * s;
  const hx = cx - hw, hy = cy - 34 * s - hh;

  // Neck
  ctx.fillStyle = C.bodyDark;
  roundRect(cx - 10 * s, cy - 34 * s, 20 * s, 12 * s, 4 * s);
  ctx.fill();

  // Head shadow
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  roundRect(hx + 3 * s, hy + 4 * s, hw * 2, hh * 2, 16 * s);
  ctx.fill();

  // Head outer frame
  ctx.fillStyle = C.screenFrame;
  roundRect(hx, hy, hw * 2, hh * 2, 16 * s);
  ctx.fill();

  // Head top highlight
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  roundRect(hx + 6 * s, hy + 3 * s, hw * 1.6, hh * 0.5, 12 * s);
  ctx.fill();

  // Screen inner
  const sm = 6 * s;
  ctx.fillStyle = C.screenBg;
  roundRect(hx + sm, hy + sm, hw * 2 - sm * 2, hh * 2 - sm * 2, 12 * s);
  ctx.fill();

  // Screen subtle inner glow
  ctx.fillStyle = 'rgba(255,140,66,0.04)';
  roundRect(hx + sm, hy + sm, hw * 2 - sm * 2, hh * 2 - sm * 2, 12 * s);
  ctx.fill();

  // Antenna ears (cat-ear style)
  drawAntenna(cx - 20 * s, hy + 4 * s, s, -1);
  drawAntenna(cx + 20 * s, hy + 4 * s, s, 1);
}

function drawAntenna(ax, ay, s, dir) {
  ctx.fillStyle = C.accent;
  ctx.beginPath();
  // Triangle ear shape
  ctx.moveTo(ax, ay + 10 * s);
  ctx.lineTo(ax + dir * 10 * s, ay - 14 * s);
  ctx.lineTo(ax + dir * 16 * s, ay + 6 * s);
  ctx.closePath();
  ctx.fill();

  // Inner ear highlight
  ctx.fillStyle = C.accentLight;
  ctx.beginPath();
  ctx.moveTo(ax + dir * 2 * s, ay + 6 * s);
  ctx.lineTo(ax + dir * 7 * s, ay - 6 * s);
  ctx.lineTo(ax + dir * 12 * s, ay + 4 * s);
  ctx.closePath();
  ctx.fill();
}

// ─── Draw Eyes ───
function drawEyes(cx, cy, s, expression) {
  const ey = cy - 55 * s;
  const es = s;

  switch (expression) {
    case 'working':
      // Focused: > < (cute version)
      ctx.fillStyle = C.eyeWhite;
      // Left eye
      roundRect(cx - 20 * es, ey - 8 * es, 14 * es, 16 * es, 7 * es);
      ctx.fill();
      // Right eye
      roundRect(cx + 6 * es, ey - 8 * es, 14 * es, 16 * es, 7 * es);
      ctx.fill();
      // Pupils - looking down at keyboard
      ctx.fillStyle = C.pupil;
      ctx.beginPath();
      ctx.arc(cx - 13 * es, ey + 4 * es, 5 * es, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 13 * es, ey + 4 * es, 5 * es, 0, Math.PI * 2);
      ctx.fill();
      // Determined eyebrows
      ctx.strokeStyle = C.pupil;
      ctx.lineWidth = 2.5 * es;
      ctx.beginPath();
      ctx.moveTo(cx - 26 * es, ey - 12 * es);
      ctx.lineTo(cx - 8 * es, ey - 7 * es);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 26 * es, ey - 12 * es);
      ctx.lineTo(cx + 8 * es, ey - 7 * es);
      ctx.stroke();
      break;

    case 'sleeping':
      // Sleepy: closed eyes with Zzz
      ctx.strokeStyle = C.pupil;
      ctx.lineWidth = 2.5 * es;
      ctx.lineCap = 'round';
      // Left eye closed
      ctx.beginPath();
      ctx.moveTo(cx - 24 * es, ey);
      ctx.quadraticCurveTo(cx - 13 * es, ey + 6 * es, cx - 2 * es, ey);
      ctx.stroke();
      // Right eye closed
      ctx.beginPath();
      ctx.moveTo(cx + 2 * es, ey);
      ctx.quadraticCurveTo(cx + 13 * es, ey + 6 * es, cx + 24 * es, ey);
      ctx.stroke();
      ctx.lineCap = 'butt';
      break;

    case 'happy':
      // Happy: ^ ^ with sparkle
      ctx.fillStyle = C.eyeWhite;
      roundRect(cx - 20 * es, ey - 6 * es, 14 * es, 14 * es, 7 * es);
      ctx.fill();
      roundRect(cx + 6 * es, ey - 6 * es, 14 * es, 14 * es, 7 * es);
      ctx.fill();
      // Big sparkly pupils
      ctx.fillStyle = C.pupil;
      ctx.beginPath();
      ctx.arc(cx - 13 * es, ey + 1 * es, 5 * es, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 13 * es, ey + 1 * es, 5 * es, 0, Math.PI * 2);
      ctx.fill();
      // Catchlights
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(cx - 10 * es, ey - 2 * es, 2 * es, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 16 * es, ey - 2 * es, 2 * es, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'worried':
      // Worried: big round eyes with sweat
      ctx.fillStyle = C.eyeWhite;
      roundRect(cx - 22 * es, ey - 8 * es, 16 * es, 18 * es, 8 * es);
      ctx.fill();
      roundRect(cx + 6 * es, ey - 8 * es, 16 * es, 18 * es, 8 * es);
      ctx.fill();
      ctx.fillStyle = C.pupil;
      ctx.beginPath();
      ctx.arc(cx - 14 * es, ey + 1 * es, 6 * es, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 14 * es, ey + 1 * es, 6 * es, 0, Math.PI * 2);
      ctx.fill();
      // Tiny catchlights
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(cx - 11 * es, ey - 2 * es, 2 * es, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 17 * es, ey - 2 * es, 2 * es, 0, Math.PI * 2);
      ctx.fill();
      // Sweat drop
      ctx.fillStyle = '#87CEEB';
      ctx.beginPath();
      ctx.arc(cx + 30 * es, ey - 5 * es, 5 * es, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(cx + 32 * es, ey - 7 * es, 1.5 * es, 0, Math.PI * 2);
      ctx.fill();
      break;

    default:
      // Normal: big cute round eyes
      ctx.fillStyle = C.eyeWhite;
      roundRect(cx - 20 * es, ey - 6 * es, 14 * es, 14 * es, 7 * es);
      ctx.fill();
      roundRect(cx + 6 * es, ey - 6 * es, 14 * es, 14 * es, 7 * es);
      ctx.fill();
      // Pupils
      ctx.fillStyle = C.pupil;
      ctx.beginPath();
      ctx.arc(cx - 13 * es, ey + 2 * es, 5 * es, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 13 * es, ey + 2 * es, 5 * es, 0, Math.PI * 2);
      ctx.fill();
      // Catchlights
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(cx - 10 * es, ey - 1 * es, 2.5 * es, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 16 * es, ey - 1 * es, 2.5 * es, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  // Blush (all expressions except sleeping)
  if (expression !== 'sleeping') {
    ctx.fillStyle = C.blush;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(cx - 32 * es, ey + 8 * es, 8 * es, 4 * es, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 32 * es, ey + 8 * es, 8 * es, 4 * es, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Mouth
  drawMouth(cx, cy, s, expression);
}

function drawMouth(cx, cy, s, expression) {
  const my = cy - 40 * s;
  ctx.strokeStyle = C.mouth;
  ctx.lineWidth = 2 * s;
  ctx.lineCap = 'round';

  switch (expression) {
    case 'working':
      // Focused small mouth
      ctx.beginPath();
      ctx.moveTo(cx - 4 * s, my + 4 * s);
      ctx.lineTo(cx + 4 * s, my + 4 * s);
      ctx.stroke();
      break;
    case 'sleeping':
      // Open snoring mouth
      ctx.fillStyle = '#888';
      ctx.beginPath();
      ctx.ellipse(cx, my + 6 * s, 6 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'happy':
      // Big smile
      ctx.beginPath();
      ctx.arc(cx, my, 8 * s, 0.2, Math.PI - 0.2);
      ctx.stroke();
      break;
    case 'worried':
      // Wavy worried mouth
      ctx.beginPath();
      ctx.moveTo(cx - 6 * s, my + 8 * s);
      ctx.quadraticCurveTo(cx - 3 * s, my + 4 * s, cx, my + 8 * s);
      ctx.quadraticCurveTo(cx + 3 * s, my + 12 * s, cx + 6 * s, my + 8 * s);
      ctx.stroke();
      break;
    default:
      // Small gentle smile
      ctx.beginPath();
      ctx.arc(cx, my, 5 * s, 0.3, Math.PI - 0.3);
      ctx.stroke();
      break;
  }
  ctx.lineCap = 'butt';
}

// ─── Draw Arms ───
function drawArm(cx, cy, s, side, angle) {
  const dir = side === 'left' ? -1 : 1;
  const shoulderX = cx + dir * 30 * s;
  const shoulderY = cy + 18 * s;

  ctx.save();
  ctx.translate(shoulderX, shoulderY);
  // Angle: 0=resting down, higher values = raised
  const rot = dir * angle * 0.6 - 0.3 * dir;
  ctx.rotate(rot);

  // Arm - soft rounded
  ctx.fillStyle = C.body;
  roundRect(-6 * s, 0, 12 * s, 22 * s, 6 * s);
  ctx.fill();

  // Arm shadow
  ctx.fillStyle = C.bodyDark;
  roundRect(-6 * s, 18 * s, 12 * s, 6 * s, 3 * s);
  ctx.fill();

  // Hand - small round paw
  ctx.fillStyle = C.body;
  ctx.beginPath();
  ctx.arc(0, 25 * s, 7 * s, 0, Math.PI * 2);
  ctx.fill();

  // Finger lines
  ctx.strokeStyle = C.bodyDark;
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.moveTo(-3 * s, 29 * s);
  ctx.lineTo(-3 * s, 32 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(3 * s, 29 * s);
  ctx.lineTo(3 * s, 32 * s);
  ctx.stroke();

  ctx.restore();
}

// ─── Draw Desk (only in work state) ───
function drawDesk(cx, cy, s) {
  const dy = cy + 78 * s;
  // Desk top
  ctx.fillStyle = C.desk;
  roundRect(cx - 55 * s, dy, 110 * s, 8 * s, 3 * s);
  ctx.fill();
  // Desk highlight
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  roundRect(cx - 50 * s, dy + 1 * s, 100 * s, 2 * s, 1 * s);
  ctx.fill();
  // Legs
  ctx.fillStyle = C.deskLeg;
  ctx.fillRect(cx - 45 * s, dy + 8 * s, 5 * s, 25 * s);
  ctx.fillRect(cx + 40 * s, dy + 8 * s, 5 * s, 25 * s);
}

function drawKeyboard(cx, cy, s) {
  const ky = cy + 78 * s;
  // Keyboard body
  ctx.fillStyle = C.keyboard;
  roundRect(cx - 32 * s, ky - 5 * s, 64 * s, 10 * s, 3 * s);
  ctx.fill();
  // Key rows
  ctx.fillStyle = C.keyDark;
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 9; i++) {
      ctx.fillRect(cx - 28 * s + i * 6.5 * s, ky - 3 * s - row * 2.5 * s, 5 * s, -1.5 * s);
    }
  }
  // Spacebar
  ctx.fillStyle = '#999';
  ctx.fillRect(cx - 14 * s, ky + 1 * s, 28 * s, -1.5 * s);
}

// ─── Main Draw ───

let drawCount = 0;
function drawRobot(data) {
  ctx.clearRect(0, 0, W, H);
  const { cx, cy, scale: s } = getLayout();

  if (drawCount < 2) {
    console.log(`[drawRobot] frame=${drawCount} size=${W}x${H} scale=${s.toFixed(2)} expr=${data.expression}`);
    drawCount++;
  }

  const jumpY = (data.jumpOffset || 0);
  const breathY = (data.breath || 0);

  ctx.save();
  ctx.translate(0, jumpY + breathY);

  // Layer order: back to front
  // Desk (only during work or if there's a keyboard context)
  if (data.expression === 'working' || data.showDesk) {
    drawDesk(cx, cy, s);
    drawKeyboard(cx, cy, s);
  }

  drawFeet(cx, cy, s);
  drawBody(cx, cy, s);
  drawArm(cx, cy, s, 'left', data.armLeft || 0);
  drawArm(cx, cy, s, 'right', data.armRight || 0);
  drawHead(cx, cy, s);
  drawEyes(cx, cy, s, data.expression || 'normal');

  ctx.restore();
}
