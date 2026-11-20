/**
 * BONCUK & MÜEZZA – save.meow
 * Redesigned Entities: Sized & Animated Player Cat, Destination Gazebo,
 * Traps, Moving Platforms & Particle FX.
 */

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
  }

  emit(x, y, count = 5, type = 'heart', color = '#f472b6') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === 'heart' ? 1.5 : 0.6),
        life: 1.0,
        decay: Math.random() * 0.03 + 0.02,
        size: Math.random() * 6 + 4,
        type: type,
        color: color,
        text: type === 'heart' ? '💖' : (type === 'star' ? '✨' : (type === 'paw' ? '🐾' : ''))
      });
    }
  }

  addFloatingText(x, y, text, color = '#f59e0b') {
    this.floatingTexts.push({
      x: x,
      y: y,
      text: text,
      color: color,
      life: 1.0,
      vy: -1.4
    });
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.type === 'dust') {
        p.vy += 0.08;
      } else if (p.type === 'heart' || p.type === 'star') {
        p.vy -= 0.04;
      }
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life -= 0.022;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      if (p.text) {
        ctx.font = `${Math.floor(p.size * 2)}px serif`;
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life);
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 16px "Fredoka One", "Quicksand", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  clear() {
    this.particles = [];
    this.floatingTexts = [];
  }
}

/**
 * PLAYER CAT (Boncuk or Müezza)
 * Clearly visible, animated and responsive!
 */
class Player {
  constructor(x, y, catType = 'muezza', opts = {}) {
    this.x = x;
    this.y = y;
    this.catType = catType; // 'boncuk', 'muezza' or 'human'
    this.heroConfig = opts.heroConfig || (catType === 'human' ? {
      gender: opts.gender || 'girl',
      name: opts.name || 'Kahraman'
    } : null);
    this.gender = (this.heroConfig && this.heroConfig.gender) || opts.gender || 'girl';
    this.customName = (this.heroConfig && this.heroConfig.name) || opts.name || 'Kahraman';
    this.width = catType === 'human' ? 34 : 44;   // Proportional child vs cat hitbox
    this.height = catType === 'human' ? 58 : 42;

    this.vx = 0;
    this.vy = 0;
    this.facingRight = true;
    this.state = 'idle';
    this.animTimer = 0;
    this.celebrateTimer = 0;

    // Movement & Jump physics states
    this.onGround = false;
    this.isSlippery = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.jumpHeld = false;
    this.ridingPlatform = null;

    // Combat & Lives
    this.lives = 3;
    this.maxLives = 3;
    this.isInvulnerable = false;
    this.invulnTimer = 0;
    this.isHurt = false;
    this.isDead = false;
    this.landSquashTimer = 0;

    this.lastSafeX = x;
    this.lastSafeY = y;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.lastSafeX = x;
    this.lastSafeY = y;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.state = 'idle';
    this.animTimer = 0;
    this.isHurt = false;
    this.isDead = false;
    this.isInvulnerable = false;
    this.invulnTimer = 0;
  }

  takeDamage(knockbackDir = 0, damage = 1) {
    if (this.isInvulnerable || this.isDead) return;

    this.lives -= damage;
    this.isInvulnerable = true;
    this.invulnTimer = 90; // ~1.5s
    this.isHurt = true;

    // Knockback
    this.vy = -6.5;
    this.vx = knockbackDir !== 0 ? knockbackDir * 5 : (this.facingRight ? -4.5 : 4.5);

    try {
      if (window.soundEngine) window.soundEngine.playHurt();
    } catch (e) {}

    if (this.lives <= 0) {
      this.isDead = true;
    }
  }

  update(input, level, particles) {
    this.animTimer += 0.016;

    if (this.invulnTimer > 0) {
      this.invulnTimer--;
      if (this.invulnTimer <= 0) {
        this.isInvulnerable = false;
        this.isHurt = false;
      }
    }

    if (this.landSquashTimer > 0) {
      this.landSquashTimer--;
    }

    if (this.celebrateTimer > 0) {
      this.celebrateTimer--;
    }

    // Horizontal Input & Acceleration
    const friction = this.isSlippery ? Physics.SLIPPERY_FRICTION : Physics.FRICTION;
    const accel = this.isSlippery ? 0.3 : Physics.ACCEL;

    if (input.left) {
      this.vx -= accel;
      this.facingRight = false;
    } else if (input.right) {
      this.vx += accel;
      this.facingRight = true;
    } else {
      this.vx *= friction;
      if (Math.abs(this.vx) < 0.1) this.vx = 0;
    }

    if (this.vx > Physics.RUN_SPEED) this.vx = Physics.RUN_SPEED;
    if (this.vx < -Physics.RUN_SPEED) this.vx = -Physics.RUN_SPEED;

    // Coyote Time & Jump Buffering
    if (this.onGround) {
      this.coyoteTimer = Physics.COYOTE_TIME_MAX;
      this.lastSafeX = this.x;
      this.lastSafeY = this.y;
    } else {
      if (this.coyoteTimer > 0) this.coyoteTimer--;
    }

    if (input.jumpPressed) {
      this.jumpBufferTimer = Physics.JUMP_BUFFER_MAX;
    } else if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer--;
    }

    // Jump Execution
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.vy = Physics.JUMP_FORCE;
      this.onGround = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.ridingPlatform = null;

      try {
        if (window.soundEngine) window.soundEngine.playJump();
      } catch (e) {}

      particles.emit(this.x + this.width / 2, this.y + this.height, 4, 'dust', '#fef08a');
    }

    // Variable jump height
    if (!input.jumpHeld && this.vy < Physics.MIN_JUMP_FORCE) {
      this.vy = Physics.MIN_JUMP_FORCE;
    }

    // Gravity
    this.vy += Physics.GRAVITY;
    if (this.vy > Physics.TERMINAL_VELOCITY) {
      this.vy = Physics.TERMINAL_VELOCITY;
    }

    // Riding moving platform
    if (this.ridingPlatform) {
      this.x += this.ridingPlatform.vx;
      this.y += this.ridingPlatform.vy;
    }

    // Horizontal Collision Resolution
    this.x += this.vx;
    this.resolveHorizontalCollisions(level);

    // Vertical Collision Resolution
    const wasOnGround = this.onGround;
    this.onGround = false;
    this.isSlippery = false;
    this.ridingPlatform = null;
    this.y += this.vy;
    this.resolveVerticalCollisions(level, particles, wasOnGround);

    // Animation State
    if (this.catType === 'human') {
      if (this.state === 'hug') {
        // Maintain hug pose during finale
      } else if (this.isHurt && this.invulnTimer > 60) {
        this.state = 'hurt';
      } else if (this.celebrateTimer > 0 && this.onGround) {
        this.state = 'celebrate';
      } else if (!this.onGround) {
        this.state = this.vy < 0 ? 'jump' : 'fall';
      } else if (this.landSquashTimer > 0) {
        this.state = 'land';
      } else if (Math.abs(this.vx) > 2.6) {
        this.state = 'run';
      } else if (Math.abs(this.vx) > 0.25) {
        this.state = 'walk';
      } else {
        this.state = 'idle';
      }
    } else {
      if (this.isHurt && this.invulnTimer > 60) {
        this.state = 'hurt';
      } else if (this.celebrateTimer > 0 && this.onGround) {
        this.state = 'celebrate';
      } else if (!this.onGround) {
        this.state = this.vy < 0 ? 'jump' : 'fall';
      } else if (this.landSquashTimer > 0) {
        this.state = 'land';
      } else if (Math.abs(this.vx) > 2.6) {
        this.state = 'run';
      } else if (Math.abs(this.vx) > 0.25) {
        this.state = 'walk';
      } else {
        this.state = 'idle';
      }
    }
  }

  triggerCelebrate(frames = 38) {
    this.celebrateTimer = frames;
  }

  resolveHorizontalCollisions(level) {
    const tiles = level.getSolidTilesInBox(this.x, this.y, this.width, this.height);
    for (const t of tiles) {
      if (!t.isSolid) continue;
      if (this.vx > 0) {
        this.x = t.x - this.width;
        this.vx = 0;
      } else if (this.vx < 0) {
        this.x = t.x + t.width;
        this.vx = 0;
      }
    }
  }

  resolveVerticalCollisions(level, particles, wasOnGround) {
    const tiles = level.getSolidTilesInBox(this.x, this.y, this.width, this.height);
    for (const t of tiles) {
      if (t.isSolid) {
        if (this.vy > 0) { // Landing on platform
          this.y = t.y - this.height;
          this.vy = 0;
          this.onGround = true;
          if (t.isSlippery) this.isSlippery = true;

          if (!wasOnGround) {
            this.landSquashTimer = 6;
            try {
              if (window.soundEngine) window.soundEngine.playLand();
            } catch (e) {}
            particles.emit(this.x + this.width / 2, this.y + this.height, 4, 'dust', '#fde047');
          }
        } else if (this.vy < 0) { // Hitting ceiling
          this.y = t.y + t.height;
          this.vy = 0;
        }
      }
    }

    // Moving platforms
    for (const mp of level.movingPlatforms) {
      const pRect = { x: this.x, y: this.y, width: this.width, height: this.height };
      const mpRect = { x: mp.x, y: mp.y, width: mp.width, height: mp.height };

      if (this.vy >= 0 && (this.y + this.height - this.vy) <= mp.y + 8) {
        if (Physics.aabb(pRect, mpRect)) {
          this.y = mp.y - this.height;
          this.vy = 0;
          this.onGround = true;
          this.ridingPlatform = mp;
        }
      }
    }
  }

  draw(ctx) {
    if (this.catType === 'human') {
      const drawW = 58;
      const drawH = 78;
      const drawX = this.x + (this.width - drawW) / 2;
      const drawY = this.y + this.height - drawH;
      SpriteRenderer.drawHuman(
        ctx,
        drawX,
        drawY,
        drawW,
        drawH,
        this.state,
        this.facingRight,
        this.animTimer,
        this.isHurt,
        this.heroConfig
      );
    } else if (this.catType === 'boncuk') {
      const drawW = 62;
      const drawH = 52;
      const drawX = this.x + (this.width - drawW) / 2;
      const drawY = this.y + this.height - drawH;
      SpriteRenderer.drawBoncuk(
        ctx,
        drawX,
        drawY,
        drawW,
        drawH,
        this.state,
        this.facingRight,
        this.animTimer,
        this.isHurt
      );
    } else {
      const drawW = 64;
      const drawH = 54;
      const drawX = this.x + (this.width - drawW) / 2;
      const drawY = this.y + this.height - drawH;
      SpriteRenderer.drawMuezza(
        ctx,
        drawX,
        drawY,
        drawW,
        drawH,
        this.state,
        this.facingRight,
        this.animTimer,
        this.isHurt
      );
    }
  }
}

/**
 * WAITING PARTNER CAT & DESTINATION GAZEBO
 */
class Destination {
  constructor(x, y, partnerType = 'boncuk') {
    this.x = x;
    this.y = y;
    this.partnerType = partnerType;
    this.width = 80;
    this.height = 70;
    this.animTimer = 0;
  }

  update() {
    this.animTimer += 0.016;
  }

  draw(ctx) {
    SpriteRenderer.drawDestination(ctx, this.x, this.y, this.partnerType, this.animTimer);
  }
}

/**
 * COLLECTIBLES: Cat Food & Special Toys
 */
class Collectible {
  constructor(x, y, type = 'tuna', isSpecial = false) {
    this.x = x;
    this.y = y;
    this.width = 28;
    this.height = 28;
    this.type = type; // 'tuna', 'fish', 'toilet_paper', 'sock'
    this.isSpecial = isSpecial;
    this.collected = false;
    this.animTimer = Math.random() * 10;
  }

  update() {
    this.animTimer += 0.016;
  }

  draw(ctx) {
    if (this.collected) return;

    if (this.type === 'toilet_paper') {
      SpriteRenderer.drawToiletPaper(ctx, this.x, this.y, this.width, this.height, this.animTimer);
    } else if (this.type === 'sock') {
      SpriteRenderer.drawSock(ctx, this.x, this.y, this.width, this.height, this.animTimer);
    } else {
      SpriteRenderer.drawFood(ctx, this.x, this.y, this.width, this.height, this.type, this.animTimer);
    }
  }
}

/**
 * MOVING PLATFORMS
 */
class MovingPlatform {
  constructor(x, y, width, height, dx = 0, dy = 0, speed = 1.2, theme = 'wood') {
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.dx = dx;
    this.dy = dy;
    this.speed = speed;
    this.theme = theme;
    this.time = Math.random() * 10;
    this.vx = 0;
    this.vy = 0;
  }

  update() {
    this.time += 0.02 * this.speed;
    const prevX = this.x;
    const prevY = this.y;

    const offset = Math.sin(this.time);
    this.x = this.startX + this.dx * offset;
    this.y = this.startY + this.dy * offset;

    this.vx = this.x - prevX;
    this.vy = this.y - prevY;
  }

  draw(ctx) {
    SpriteRenderer.drawMovingPlatform(ctx, this.x, this.y, this.width, this.height, this.theme);
  }
}

/**
 * HAZARDS: Spikes, RollingBall, Laser, FireTrap, WaterHazard, SwingingPendulum
 */
class Hazard {
  constructor(type, x, y, width, height, opts = {}) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.opts = opts;
    this.timer = Math.random() * 10;
    this.active = true;

    if (type === 'ball') {
      this.radius = opts.radius || 14;
      this.speed = opts.speed || 1.8;
      this.minX = opts.minX || x - 100;
      this.maxX = opts.maxX || x + 100;
      this.dir = 1;
      this.angle = 0;
    }

    if (type === 'laser' || type === 'fire') {
      this.cycleTime = opts.cycleTime || 3.0;
      this.onTime = opts.onTime || 1.3;
      this.warnTime = 0.6;
    }

    if (type === 'pendulum') {
      this.pivotX = x;
      this.pivotY = y;
      this.length = opts.length || 75;
      this.radius = opts.radius || 12;
      this.swingSpeed = opts.speed || 1.6;
      this.maxAngle = opts.maxAngle || 0.85;
      this.angle = 0;
    }
  }

  update() {
    this.timer += 0.016;

    if (this.type === 'ball') {
      this.x += this.speed * this.dir;
      this.angle += (this.speed * this.dir) / this.radius;
      if (this.x > this.maxX) {
        this.x = this.maxX;
        this.dir = -1;
      } else if (this.x < this.minX) {
        this.x = this.minX;
        this.dir = 1;
      }
    } else if (this.type === 'laser' || this.type === 'fire') {
      const phase = this.timer % this.cycleTime;
      this.isWarning = phase >= (this.cycleTime - this.warnTime);
      this.isActive = phase < this.onTime;
    } else if (this.type === 'pendulum') {
      this.angle = Math.sin(this.timer * this.swingSpeed) * this.maxAngle;
      this.bobX = this.pivotX + Math.sin(this.angle) * this.length;
      this.bobY = this.pivotY + Math.cos(this.angle) * this.length;
    }
  }

  checkCollision(player) {
    if (player.isInvulnerable || player.isDead) return false;

    const pRect = { x: player.x, y: player.y, width: player.width, height: player.height };

    if (this.type === 'spikes') {
      const spikeRect = { x: this.x + 2, y: this.y + 4, width: this.width - 4, height: this.height - 4 };
      return Physics.aabb(pRect, spikeRect);
    } else if (this.type === 'ball') {
      return Physics.circleRect(this.x, this.y, this.radius, pRect);
    } else if (this.type === 'laser') {
      if (!this.isActive) return false;
      const laserRect = { x: this.x, y: this.y, width: this.width, height: this.height };
      return Physics.aabb(pRect, laserRect);
    } else if (this.type === 'fire') {
      if (!this.isActive) return false;
      const fireRect = { x: this.x + 2, y: this.y + 4, width: this.width - 4, height: this.height - 4 };
      return Physics.aabb(pRect, fireRect);
    } else if (this.type === 'water') {
      const waterRect = { x: this.x, y: this.y + 10, width: this.width, height: this.height - 10 };
      return Physics.aabb(pRect, waterRect);
    } else if (this.type === 'pendulum') {
      return Physics.circleRect(this.bobX, this.bobY, this.radius, pRect);
    }
    return false;
  }

  draw(ctx) {
    if (this.type === 'spikes') {
      SpriteRenderer.drawSpikes(ctx, this.x, this.y, this.width, this.height);
    } else if (this.type === 'ball') {
      SpriteRenderer.drawRollingBall(ctx, this.x, this.y, this.radius, this.angle);
    } else if (this.type === 'laser') {
      SpriteRenderer.drawLaser(ctx, this.x, this.y, this.width, this.height, this.isActive, this.isWarning);
    } else if (this.type === 'fire') {
      SpriteRenderer.drawFireTrap(ctx, this.x, this.y, this.width, this.height, this.isActive, this.timer);
    } else if (this.type === 'water') {
      SpriteRenderer.drawWater(ctx, this.x, this.y, this.width, this.height, this.timer);
    } else if (this.type === 'pendulum') {
      SpriteRenderer.drawSwingingPendulum(ctx, this.pivotX, this.pivotY, this.angle, this.length, this.radius);
    }
  }
}

window.ParticleSystem = ParticleSystem;
window.Player = Player;
window.Destination = Destination;
window.Collectible = Collectible;
window.MovingPlatform = MovingPlatform;
window.Hazard = Hazard;
