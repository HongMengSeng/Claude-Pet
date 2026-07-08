// pet-core.js — Robot character drawing on Canvas

const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Colors — Claude brand palette
const COLORS = {
  body: '#2d2d44',
  bodyLight: '#3a3a5c',
  screen: '#1a1a2e',
  screenBorder: '#444',
  accent: '#ff8c42',
  arm: '#3a3a5c',
  hand: '#4a4a6a',
  eye: '#ff8c42',
  highlight: '#d4a574'
};

// Get layout center and scale
function getLayout() {
  const cx = W / 2;
  const cy = H * 0.35;
  const scale = Math.min(W / 300, H / 400);
  return { cx, cy, scale };
}

// ─── Drawing Functions (called in order, bottom to top) ───

function drawDesk(cx, cy, s) {
  // Desk surface
  ctx.fillStyle = '#5c4a3a';
  ctx.beginPath();
  ctx.roundRect(cx - 60 * s, cy + 98 * s, 120 * s, 8 * s, 3 * s);
  ctx.fill();

  // Desk legs
  ctx.fillRect(cx - 50 * s, cy + 106 * s, 4 * s, 30 * s);
  ctx.fillRect(cx + 46 * s, cy + 106 * s, 4 * s, 30 * s);
}

function drawKeyboard(cx, cy, s) {
  // Keyboard base
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.roundRect(cx - 35 * s, cy + 98 * s, 70 * s, -6 * s, 2 * s);
  ctx.fill();

  // Key rows
  ctx.fillStyle = '#555';
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 10; i++) {
      ctx.fillRect(
        cx - 32 * s + i * 6.8 * s,
        cy + 92 * s - row * 5 * s,
        5 * s,
        -3 * s
      );
    }
  }

  // Spacebar
  ctx.fillStyle = '#666';
  ctx.fillRect(cx - 16 * s, cy + 95 * s, 32 * s, -3 * s);
}

function drawBody(cx, cy, s) {
  // Neck
  ctx.fillStyle = COLORS.bodyLight;
  ctx.fillRect(cx - 8 * s, cy + 38 * s, 16 * s, 10 * s);

  // Torso
  ctx.fillStyle = COLORS.body;
  ctx.strokeStyle = COLORS.highlight;
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.roundRect(cx - 22 * s, cy + 48 * s, 44 * s, 50 * s, 6 * s);
  ctx.fill();
  ctx.stroke();

  // Chest accent line (Claude warm orange)
  ctx.fillStyle = COLORS.accent;
  ctx.fillRect(cx - 10 * s, cy + 60 * s, 20 * s, 2 * s);

  // Small logo dot on chest
  ctx.beginPath();
  ctx.arc(cx, cy + 70 * s, 3 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawArm(cx, cy, s, side, angle) {
  const dir = side === 'left' ? -1 : 1;
  const shoulderX = cx + dir * 24 * s;
  const shoulderY = cy + 55 * s;

  ctx.save();
  ctx.translate(shoulderX, shoulderY);
  ctx.rotate(dir * angle * 0.5);

  // Upper arm
  ctx.fillStyle = COLORS.arm;
  ctx.beginPath();
  ctx.roundRect(-5 * s, 0, 10 * s, 16 * s, 4 * s);
  ctx.fill();

  // Lower arm
  ctx.beginPath();
  ctx.roundRect(-4 * s, 16 * s, 8 * s, 14 * s, 3 * s);
  ctx.fill();

  // Hand (circle)
  ctx.fillStyle = COLORS.hand;
  ctx.beginPath();
  ctx.arc(0, 33 * s, 6 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawHead(cx, cy, s) {
  // Monitor stand / neck joint
  ctx.fillStyle = COLORS.bodyLight;
  ctx.fillRect(cx - 5 * s, cy + 35 * s, 10 * s, 5 * s);

  // Monitor head outer case
  const hw = 55 * s, hh = 40 * s;
  ctx.fillStyle = COLORS.body;
  ctx.strokeStyle = COLORS.screenBorder;
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.roundRect(cx - hw - 2 * s, cy - hh - 2 * s, (hw + 2) * 2 * s, (hh + 2) * 2 * s, 10 * s);
  ctx.fill();
  ctx.stroke();

  // Screen bezel
  ctx.fillStyle = COLORS.screen;
  ctx.beginPath();
  ctx.roundRect(cx - hw + 4 * s, cy - hh + 4 * s, (hw - 4) * 2 * s, (hh - 4) * 2 * s, 6 * s);
  ctx.fill();

  // Screen glare line
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.moveTo(cx - 40 * s, cy - 30 * s);
  ctx.lineTo(cx - 10 * s, cy - 30 * s);
  ctx.stroke();
}

function drawEyes(cx, cy, s, expression) {
  const eyeY = cy - 4 * s;
  ctx.fillStyle = COLORS.eye;

  switch (expression) {
    case 'working':
      // >_<
      ctx.font = `bold ${18 * s}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('>_<', cx, eyeY + 2 * s);
      break;

    case 'sleeping':
      // - -
      ctx.fillRect(cx - 14 * s, eyeY, 6 * s, 2 * s);
      ctx.fillRect(cx + 8 * s, eyeY, 6 * s, 2 * s);
      break;

    case 'happy':
      // ^_^
      ctx.font = `bold ${16 * s}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('^_^', cx, eyeY + 2 * s);
      break;

    case 'worried':
      // o_o;
      ctx.font = `bold ${14 * s}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('o_o;', cx, eyeY + 2 * s);
      // Sweat drop
      ctx.fillStyle = '#6cb4ee';
      ctx.beginPath();
      ctx.arc(cx + 28 * s, eyeY - 2 * s, 3 * s, 0, Math.PI * 2);
      ctx.fill();
      break;

    default:
      // Normal: two rectangle eyes
      ctx.fillRect(cx - 12 * s, eyeY, 6 * s, 10 * s);
      ctx.fillRect(cx + 6 * s, eyeY, 6 * s, 10 * s);
      // Small smile
      ctx.fillStyle = COLORS.eye;
      ctx.fillRect(cx - 5 * s, eyeY + 16 * s, 10 * s, 2 * s);
      break;
  }
}

// ─── Main draw function ───

let drawCount = 0;
function drawRobot(data) {
  ctx.clearRect(0, 0, W, H);
  const { cx, cy, scale: s } = getLayout();

  // Diagnostic: log first few frames
  if (drawCount < 3) {
    console.log(`[drawRobot] frame=${drawCount} W=${W} H=${H} cx=${cx.toFixed(0)} cy=${cy.toFixed(0)} s=${s.toFixed(3)} expr=${data.expression}`);
    drawCount++;
  }

  // Apply sway offset
  const sx = cx + (data.sway || 0);
  const sy = cy + (data.jumpOffset || 0) + (data.breath || 0);

  // Layer 1: Desk
  drawDesk(sx, cy + 98 * s >= sy ? cy + 98 * s : sy, s);
  // Actually keep desk fixed, just adjust with s
  drawDesk(cx, cy, s);

  // Layer 2: Body
  ctx.save();
  ctx.translate(0, (data.breath || 0) + (data.jumpOffset || 0));
  drawBody(cx, cy, s);

  // Layer 3: Arms
  drawArm(cx, cy, s, 'left', data.armLeft || 0);
  drawArm(cx, cy, s, 'right', data.armRight || 0);

  // Layer 4: Head
  drawHead(cx, cy, s);

  // Layer 5: Eyes (on screen)
  drawEyes(cx, cy, s, data.expression || 'normal');
  ctx.restore();

  // Layer 6: Keyboard (on desk, no jump)
  drawKeyboard(cx, cy, s);
}
