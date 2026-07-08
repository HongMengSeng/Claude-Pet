// animations.js — Animation loop, particles, bubbles, and state animations

// ─── Shared animation data ───

let currentAnimData = {
  expression: 'normal',
  armLeft: 0,
  armRight: 0,
  bubbles: [],
  particles: [],
  sign: null,
  breath: 0,
  fishX: 0,
  holdingFish: false,
  sway: 0,
  jumpOffset: 0
};

// ─── Helper: easing ───

function lerp(a, b, t) { return a + (b - a) * t; }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

// ─── Bubble class (Zzz / thought bubbles) ───

class Bubble {
  constructor(x, y, text, size) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.size = size || 16;
    this.opacity = 1;
    this.vy = -0.4 - Math.random() * 0.3;
    this.life = 1;
  }
  update() {
    this.y += this.vy;
    this.life -= 0.004;
    this.opacity = Math.max(0, this.life);
  }
  draw(ctx, cx, cy) {
    if (this.opacity <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${this.size}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(this.text, cx + this.x, cy + this.y);
    ctx.restore();
  }
}

// ─── Code particle (floating code characters) ───

class CodeParticle {
  constructor(cx, cy) {
    this.cx = cx;
    this.cy = cy;
    this.reset();
  }
  reset() {
    this.x = this.cx + (Math.random() - 0.5) * 180;
    this.y = this.cy - 60 + Math.random() * 140;
    this.chars = '01/*=-+<>{}[]|&!@#';
    this.text = this.chars[Math.floor(Math.random() * this.chars.length)];
    this.opacity = Math.random() * 0.5 + 0.15;
    this.vy = -0.2 - Math.random() * 0.5;
    this.life = 1;
  }
  update() {
    this.y += this.vy;
    this.life -= 0.002;
    if (this.life <= 0) {
      this.y = this.cy + 60 + Math.random() * 20;
      this.life = 1;
      this.text = this.chars[Math.floor(Math.random() * this.chars.length)];
    }
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity * this.life;
    ctx.fillStyle = '#4ade80';
    ctx.font = '10px monospace';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

// ─── Animation state definitions ───

const ANIM_STATES = {

  // ═══ Working: typing at keyboard ═══
  working: {
    expression: 'working',
    armLeft: 0, armRight: 0,
    init(data) {
      const { cx, cy } = getLayout();
      data.particles = Array.from({ length: 12 }, () => new CodeParticle(cx, cy));
      data.bubbles = [];
      data.sign = null;
      data.holdingFish = false;
    },
    update(data, frame) {
      const speed = 0.12;
      // Arms alternate typing
      data.armLeft = Math.sin(frame * speed) * 0.5 + 0.1;
      data.armRight = Math.sin(frame * speed + Math.PI) * 0.5 + 0.1;
      data.expression = 'working';
      data.particles.forEach(p => p.update());
    }
  },

  // ═══ Idle: Snoring ═══
  idle_snoring: {
    expression: 'sleeping',
    armLeft: 0, armRight: 0,
    init(data) {
      data.bubbles = [];
      data.particles = [];
      data.sign = null;
      data.holdingFish = false;
    },
    update(data, frame) {
      data.expression = 'sleeping';
      // Zzz bubbles every ~2 seconds
      if (frame % 120 === 0 && data.bubbles.length < 6) {
        data.bubbles.push(new Bubble(
          40 + Math.random() * 20,
          -20 - Math.random() * 30,
          'Z',
          10 + Math.random() * 10
        ));
      }
      data.bubbles = data.bubbles.filter(b => {
        b.update();
        return b.life > 0;
      });
      // Gentle breathing
      data.breath = Math.sin(frame * 0.025) * 2;
    }
  },

  // ═══ Idle: Touching Fish (摸鱼) ═══
  idle_fish: {
    expression: 'happy',
    armLeft: 0, armRight: 0,
    init(data) {
      data.bubbles = [];
      data.particles = [];
      data.sign = null;
      data.fishX = 0;
    },
    update(data, frame) {
      data.expression = 'happy';
      // Right arm stroking
      data.armRight = Math.sin(frame * 0.06) * 0.35 + 0.25;
      data.fishX = Math.sin(frame * 0.04) * 15;
      data.holdingFish = true;
      // Occasional heart bubble
      if (frame % 180 === 0 && data.bubbles.length < 3) {
        data.bubbles.push(new Bubble(35, -10, '♥', 12));
      }
      data.bubbles = data.bubbles.filter(b => {
        b.update();
        return b.life > 0;
      });
    }
  },

  // ═══ Idle: Coffee break ═══
  idle_coffee: {
    expression: 'happy',
    armLeft: 0, armRight: 0,
    init(data) {
      data.bubbles = [];
      data.particles = [];
      data.sign = null;
      data.holdingFish = false;
      data.holdingCoffee = true;
    },
    update(data, frame) {
      data.expression = 'happy';
      // Right arm holding coffee, bringing to "mouth" periodically
      const cycle = Math.sin(frame * 0.03);
      data.armRight = 0.3 + cycle * 0.15;
      // Steam bubbles
      if (frame % 60 === 0 && data.bubbles.length < 4) {
        data.bubbles.push(new Bubble(25, 15, '~', 8));
      }
      data.bubbles = data.bubbles.filter(b => {
        b.update();
        return b.life > 0;
      });
    }
  },

  // ═══ Idle: Self-check ═══
  idle_selfcheck: {
    expression: 'normal',
    armLeft: 0, armRight: 0,
    init(data) {
      data.bubbles = [];
      data.particles = [];
      data.sign = null;
      data.holdingFish = false;
    },
    update(data, frame) {
      // Rotate arms in a diagnostic pattern
      data.armLeft = Math.sin(frame * 0.04) * 0.7;
      data.armRight = Math.cos(frame * 0.04) * 0.7;
      // Screen flickers through expressions
      const phase = Math.floor(frame / 45) % 3;
      if (phase === 0) data.expression = 'normal';
      else if (phase === 1) data.expression = 'working';
      else data.expression = 'happy';
      // Brief screen flash
      if (frame % 90 < 5) {
        data.screenFlash = true;
      } else {
        data.screenFlash = false;
      }
    }
  },

  // ═══ Review Pending: holding sign ═══
  review_pending: {
    expression: 'worried',
    armLeft: 0, armRight: 0,
    init(data) {
      data.sign = { text: '⏳ Review\nPending...', color: '#fbbf24' };
      data.bubbles = [];
      data.particles = [];
      data.holdingFish = false;
    },
    update(data, frame) {
      data.expression = 'worried';
      // Left arm raised holding sign
      data.armLeft = 0.85 + Math.sin(frame * 0.04) * 0.08;
      // Body gently sways
      data.sway = Math.sin(frame * 0.035) * 3;
    }
  },

  // ═══ Review Approved: celebration ═══
  review_approved: {
    expression: 'happy',
    armLeft: 0, armRight: 0,
    init(data) {
      data.sign = { text: '✅ Approved!', color: '#4ade80' };
      data.bubbles = [];
      data.particles = [];
      data.holdingFish = false;
      data.celebrationParticles = [];
    },
    update(data, frame) {
      data.expression = 'happy';
      // Both arms up in celebration
      data.armLeft = 0.9;
      data.armRight = 0.9;
      // Jump animation — first 60 frames
      if (frame < 60) {
        data.jumpOffset = Math.abs(Math.sin(frame * 0.12)) * -20;
      } else {
        data.jumpOffset = 0;
      }
      // Confetti-like celebration particles
      if (frame < 90 && frame % 5 === 0) {
        data.bubbles.push(new Bubble(
          (Math.random() - 0.5) * 120,
          -30,
          ['🎉', '✨', '🎊', '💚'][Math.floor(Math.random() * 4)],
          14
        ));
      }
      data.bubbles = data.bubbles.filter(b => {
        b.update();
        return b.life > 0;
      });
    }
  }
};

// ─── Animation loop ───

let animFrame = null;
let activeAnim = null;
let animationFrame = 0;

function startAnimation(animName) {
  activeAnim = ANIM_STATES[animName];
  animationFrame = 0;
  if (activeAnim && activeAnim.init) {
    activeAnim.init(currentAnimData);
  }
  if (activeAnim) {
    currentAnimData.expression = activeAnim.expression;
    currentAnimData.armLeft = activeAnim.armLeft;
    currentAnimData.armRight = activeAnim.armRight;
  }
}

function animationLoop() {
  animationFrame++;
  if (activeAnim && activeAnim.update) {
    activeAnim.update(currentAnimData, animationFrame);
  }

  // Draw everything
  drawRobot(currentAnimData);
  drawSign(currentAnimData);
  drawBubbles(currentAnimData);
  drawParticles(currentAnimData);
  drawAccessories(currentAnimData);

  animFrame = requestAnimationFrame(animationLoop);
}

// ─── Draw overlays (sign, bubbles, particles) ───

function drawSign(data) {
  if (!data.sign) return;
  const { cx, cy, scale: s } = getLayout();
  const signX = cx - 50 * s;
  const baseY = cy - 85 * s + (data.jumpOffset || 0) + (data.sway || 0);

  // Sign stick
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.moveTo(signX + 25 * s, baseY + 55 * s);
  ctx.lineTo(signX + 25 * s, baseY);
  ctx.stroke();

  // Sign board
  ctx.fillStyle = data.sign.color;
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.roundRect(signX, baseY, 50 * s, 55 * s, 6 * s);
  ctx.fill();
  ctx.stroke();

  // Sign text
  ctx.fillStyle = '#1a1a2e';
  ctx.font = `bold ${10 * s}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = data.sign.text.split('\n');
  lines.forEach((line, i) => {
    ctx.fillText(line, signX + 25 * s, baseY + 20 * s + i * 16 * s);
  });
}

function drawBubbles(data) {
  const { cx, cy, scale: s } = getLayout();
  data.bubbles.forEach(b => b.draw(ctx, cx, cy - 30 * s));
}

function drawParticles(data) {
  if (data.particles) {
    data.particles.forEach(p => p.draw(ctx));
  }
}

// ─── Start the loop ───

animationLoop();
