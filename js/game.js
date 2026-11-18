/**
 * BONCUK & MÜEZZA – save.meow
 * Master Game Engine: Parallax Scenery, Camera Tracking,
 * Beautiful 2D Platformer Gameplay & State Management.
 */

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    // UI Screen Modals
    this.screenStart = document.getElementById('screen-start');
    this.screenCharacter = document.getElementById('screen-character');
    this.screenHowto = document.getElementById('screen-howto');
    this.screenPause = document.getElementById('screen-pause');
    this.screenVictory = document.getElementById('screen-victory');
    this.screenGameover = document.getElementById('screen-gameover');
    this.screenFell = document.getElementById('screen-fell');
    this.hud = document.getElementById('game-hud');

    // HUD Elements
    this.hudScore = document.getElementById('hud-score');
    this.hudLevelNum = document.getElementById('hud-level-num');
    this.hudLevelName = document.getElementById('hud-level-name');
    this.hudTreats = document.getElementById('hud-treats');
    this.hudToyIcon = document.getElementById('hud-toy-icon');
    this.trackerText = document.getElementById('tracker-text');
    this.trackerArrow = document.getElementById('tracker-arrow');
    this.btnSoundToggle = document.getElementById('btn-sound-toggle');
    this.btnPause = document.getElementById('btn-pause');

    // Hearts
    this.hearts = [
      document.getElementById('heart-1'),
      document.getElementById('heart-2'),
      document.getElementById('heart-3')
    ];

    // Character Selection (Default: Müezza on left)
    this.selectedCat = 'muezza'; // 'muezza' or 'boncuk'
    this.currentLevelNum = 1;
    this.score = 0;
    this.totalTreatsInLevel = 0;
    this.collectedTreatsInLevel = 0;

    // Level checkpoint – saved at start of each level
    this.levelStartScore = 0;
    this.levelStartLives = 3;

    // Game Objects
    this.level = null;
    this.player = null;
    this.destination = null;
    this.particles = new ParticleSystem();

    // Camera
    this.cameraX = 0;
    this.cameraY = 0;

    // Game Loop State
    this.gameState = 'start'; // 'start', 'select', 'howto', 'playing', 'paused', 'victory', 'gameover'
    this.lastTime = 0;
    this.animTimer = 0;

    // Input States (Left, Right, Jump)
    this.input = {
      left: false,
      right: false,
      jumpPressed: false,
      jumpHeld: false
    };

    this.victoryCanvas = document.getElementById('victory-canvas');

    this.initEvents();
    this.startLoop();
  }

  initEvents() {
    const on = (id, event, handler) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener(event, (e) => {
          e.stopPropagation();
          handler(e);
        });
      }
    };

    // Keyboard Listeners (Left, Right, Jump, Sound, Pause)
    window.addEventListener('keydown', (e) => {
      try {
        if (window.soundEngine) window.soundEngine.ensureContext();
      } catch (err) {}

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.input.left = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.input.right = true;
      }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (!this.input.jumpHeld) {
          this.input.jumpPressed = true;
        }
        this.input.jumpHeld = true;
        e.preventDefault();
      }
      if (e.code === 'KeyM') {
        this.toggleSound();
      }
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (this.gameState === 'playing') this.pauseGame();
        else if (this.gameState === 'paused') this.resumeGame();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.input.left = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.input.right = false;
      }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        this.input.jumpHeld = false;
      }
    });

    // Touch Controls
    const bindTouch = (btnId, onDown, onUp) => {
      const el = document.getElementById(btnId);
      if (!el) return;
      el.addEventListener('touchstart', (e) => { e.preventDefault(); onDown(); });
      el.addEventListener('touchend', (e) => { e.preventDefault(); onUp(); });
      el.addEventListener('mousedown', (e) => { e.preventDefault(); onDown(); });
      el.addEventListener('mouseup', (e) => { e.preventDefault(); onUp(); });
    };

    bindTouch('touch-left', () => { this.input.left = true; }, () => { this.input.left = false; });
    bindTouch('touch-right', () => { this.input.right = true; }, () => { this.input.right = false; });
    bindTouch('touch-jump', () => {
      this.input.jumpPressed = true;
      this.input.jumpHeld = true;
    }, () => {
      this.input.jumpHeld = false;
    });

    // Start Screen -> Character Selection
    on('btn-go-character-select', 'click', () => {
      this.showScreen('select');
      try {
        if (window.soundEngine) {
          window.soundEngine.startBGM();
          window.soundEngine.playMeow('muezza');
        }
      } catch (err) {}
    });

    on('btn-how-to-play', 'click', () => {
      this.showScreen('howto');
    });

    on('btn-close-howto', 'click', () => {
      this.showScreen('start');
    });

    // Character Selection Cards
    on('card-muezza', 'click', () => {
      this.selectCat('muezza');
    });

    on('card-boncuk', 'click', () => {
      this.selectCat('boncuk');
    });

    on('btn-back-to-start', 'click', () => {
      this.showScreen('start');
    });

    // Start Level Button
    on('btn-start-game', 'click', () => {
      this.startLevel(1);
    });

    // HUD buttons
    on('btn-sound-toggle', 'click', () => this.toggleSound());
    on('btn-pause', 'click', () => this.pauseGame());

    // Pause Screen Buttons
    on('btn-resume', 'click', () => this.resumeGame());
    on('btn-restart-level', 'click', () => {
      this.startLevel(this.currentLevelNum);
    });
    on('btn-quit-to-menu', 'click', () => {
      this.showScreen('start');
    });

    // Victory Screen Buttons
    on('btn-next-level', 'click', () => {
      this.startLevel(this.currentLevelNum + 1);
    });

    // Game Over Buttons
    on('btn-retry-level', 'click', () => {
      if (this.player) this.player.lives = 3;
      this.score = this.levelStartScore;
      this.startLevel(this.currentLevelNum);
    });
    on('btn-gameover-home', 'click', () => {
      this.showScreen('start');
    });

    // Fell / Respawn Button
    on('btn-try-again', 'click', () => {
      this.restartCurrentLevel();
    });
  }

  selectCat(catName) {
    this.selectedCat = catName;
    const cardMuezza = document.getElementById('card-muezza');
    const cardBoncuk = document.getElementById('card-boncuk');
    const selectedNameSpan = document.getElementById('selected-cat-name');

    if (catName === 'muezza') {
      if (cardMuezza) cardMuezza.classList.add('selected');
      if (cardBoncuk) cardBoncuk.classList.remove('selected');
      if (selectedNameSpan) selectedNameSpan.textContent = 'Müezza';
    } else {
      if (cardBoncuk) cardBoncuk.classList.add('selected');
      if (cardMuezza) cardMuezza.classList.remove('selected');
      if (selectedNameSpan) selectedNameSpan.textContent = 'Boncuk';
    }

    try {
      if (window.soundEngine) window.soundEngine.playMeow(catName);
    } catch (err) {}
  }

  showScreen(screenName) {
    this.gameState = screenName;

    const screens = [
      this.screenStart,
      this.screenCharacter,
      this.screenHowto,
      this.screenPause,
      this.screenVictory,
      this.screenGameover,
      this.screenFell
    ];

    screens.forEach(s => {
      if (s) {
        s.classList.add('hidden');
        s.classList.remove('active');
        s.style.display = 'none';
      }
    });

    if (this.hud) {
      if (screenName === 'playing') {
        this.hud.classList.remove('hidden');
        this.hud.style.display = 'flex';
      } else {
        this.hud.classList.add('hidden');
        this.hud.style.display = 'none';
      }
    }

    let target = null;
    if (screenName === 'start') target = this.screenStart;
    else if (screenName === 'select') target = this.screenCharacter;
    else if (screenName === 'howto') target = this.screenHowto;
    else if (screenName === 'paused') target = this.screenPause;
    else if (screenName === 'victory') target = this.screenVictory;
    else if (screenName === 'gameover') target = this.screenGameover;
    else if (screenName === 'fell') target = this.screenFell;

    if (target) {
      target.classList.remove('hidden');
      target.classList.add('active');
      target.style.display = 'flex';
    }
  }

  toggleSound() {
    try {
      if (!window.soundEngine) return;
      const isMuted = window.soundEngine.toggleMute();
      if (this.btnSoundToggle) {
        this.btnSoundToggle.textContent = isMuted ? '🔇' : '🔊';
      }
    } catch (err) {}
  }

  pauseGame() {
    if (this.gameState === 'playing') {
      this.showScreen('paused');
    }
  }

  resumeGame() {
    if (this.gameState === 'paused') {
      this.showScreen('playing');
    }
  }

  startLevel(levelNum) {
    this.currentLevelNum = levelNum;
    this.level = LevelGenerator.generate(levelNum, this.selectedCat);

    // Selected cat is controlled; unselected cat waits in the Destination Gazebo
    const partnerCat = this.selectedCat === 'boncuk' ? 'muezza' : 'boncuk';
    this.player = new Player(this.level.playerSpawn.x, this.level.playerSpawn.y, this.selectedCat);
    this.destination = new Destination(this.level.partnerSpawn.x, this.level.partnerSpawn.y, partnerCat);

    this.totalTreatsInLevel = this.level.collectibles.length;
    this.collectedTreatsInLevel = 0;
    this.particles.clear();
    this.cameraX = 0;
    this.cameraY = 0;

    // Save level checkpoint (fresh start: 3 lives, current score)
    this.levelStartScore = this.score;
    this.levelStartLives = 3;
    this.player.lives = 3;

    // Update HUD
    if (this.hudLevelNum) this.hudLevelNum.textContent = `Bölüm ${levelNum}`;
    if (this.hudLevelName) this.hudLevelName.textContent = this.level.theme.name;
    if (this.hudToyIcon) this.hudToyIcon.textContent = this.selectedCat === 'boncuk' ? '🧻' : '🧦';
    if (this.trackerText) this.trackerText.textContent = `${partnerCat === 'boncuk' ? 'Boncuk' : 'Müezza'}'a Koş!`;
    this.updateHUD();

    this.showScreen('playing');

    try {
      if (window.soundEngine) {
        window.soundEngine.ensureContext();
        window.soundEngine.startBGM();
        window.soundEngine.playMeow(this.selectedCat);
      }
    } catch (err) {}
  }

  // Restart current level preserving current lives (called on "Try Again" after fall)
  restartCurrentLevel() {
    const livesLeft = this.player ? this.player.lives : 3;
    this.score = this.levelStartScore;
    this.level = LevelGenerator.generate(this.currentLevelNum, this.selectedCat);

    const partnerCat = this.selectedCat === 'boncuk' ? 'muezza' : 'boncuk';
    this.player = new Player(this.level.playerSpawn.x, this.level.playerSpawn.y, this.selectedCat);
    this.destination = new Destination(this.level.partnerSpawn.x, this.level.partnerSpawn.y, partnerCat);

    this.player.lives = livesLeft; // Restore remaining lives (1 was already deducted in triggerFell)
    this.totalTreatsInLevel = this.level.collectibles.length;
    this.collectedTreatsInLevel = 0;
    this.particles.clear();
    this.cameraX = 0;
    this.cameraY = 0;

    this.updateHUD();
    this.showScreen('playing');

    try {
      if (window.soundEngine) {
        window.soundEngine.ensureContext();
        window.soundEngine.startBGM();
      }
    } catch (err) {}
  }

  updateHUD() {
    if (this.hudScore) this.hudScore.textContent = this.score;
    if (this.hudTreats) this.hudTreats.textContent = `${this.collectedTreatsInLevel} / ${this.totalTreatsInLevel}`;

    // Hearts display
    for (let i = 0; i < 3; i++) {
      if (this.hearts[i]) {
        if (this.player && i < this.player.lives) {
          this.hearts[i].classList.remove('lost');
          this.hearts[i].classList.add('active');
        } else {
          this.hearts[i].classList.add('lost');
          this.hearts[i].classList.remove('active');
        }
      }
    }

    // Partner tracker arrow
    if (this.player && this.destination && this.trackerArrow) {
      const dx = this.destination.x - this.player.x;
      const dy = this.destination.y - this.player.y;
      const angle = Math.atan2(dy, dx);
      this.trackerArrow.style.transform = `rotate(${angle}rad)`;
    }
  }

  triggerVictory() {
    this.score += 500;
    try {
      if (window.soundEngine) window.soundEngine.playVictory();
    } catch (err) {}

    const vLvl = document.getElementById('vic-level-num');
    const vTrt = document.getElementById('vic-treats');
    const vScr = document.getElementById('vic-score');
    const vStr = document.getElementById('vic-stars');

    if (vLvl) vLvl.textContent = `Bölüm ${this.currentLevelNum}`;
    if (vTrt) vTrt.textContent = `${this.collectedTreatsInLevel} / ${this.totalTreatsInLevel}`;
    if (vScr) vScr.textContent = this.score;

    const percent = this.totalTreatsInLevel > 0 ? (this.collectedTreatsInLevel / this.totalTreatsInLevel) : 1;
    const stars = percent > 0.8 ? '⭐⭐⭐' : (percent > 0.4 ? '⭐⭐' : '⭐');
    if (vStr) vStr.textContent = stars;

    this.showScreen('victory');
  }

  triggerGameOver() {
    const gLvl = document.getElementById('go-level');
    const gScr = document.getElementById('go-score');
    if (gLvl) gLvl.textContent = `Bölüm ${this.currentLevelNum}`;
    if (gScr) gScr.textContent = this.score;
    this.showScreen('gameover');
  }

  triggerFell() {
    // Deduct one life
    this.player.lives -= 1;
    this.player.isInvulnerable = false; // reset so game over check works
    this.updateHUD();

    // Sync the fell screen's heart display
    for (let i = 0; i < 3; i++) {
      const fh = document.getElementById(`fell-heart-${i + 1}`);
      if (fh) {
        if (i < this.player.lives) {
          fh.classList.remove('lost');
          fh.classList.add('active');
        } else {
          fh.classList.add('lost');
          fh.classList.remove('active');
        }
      }
    }

    if (this.player.lives <= 0) {
      this.triggerGameOver();
      return;
    }

    const catName = this.selectedCat === 'muezza' ? 'Müezza' : 'Boncuk';
    const fellMsg = document.getElementById('fell-message');
    if (fellMsg) fellMsg.textContent = `Hay aksi! ${catName} düştü! 😿`;

    this.showScreen('fell');
  }

  update(delta) {
    this.animTimer += 0.016;

    if (this.gameState === 'playing' && this.player && this.level) {
      // Update Player
      this.player.update(this.input, this.level, this.particles);
      this.input.jumpPressed = false;

      // Update Destination Gazebo
      this.destination.update();

      // Update Moving Platforms
      for (const mp of this.level.movingPlatforms) {
        mp.update();
      }

      // Update Hazards
      for (const h of this.level.hazards) {
        h.update();

        if (h.checkCollision(this.player)) {
          if (h.type === 'water') {
            try {
              if (window.soundEngine) window.soundEngine.playSplash();
            } catch (err) {}
            this.particles.emit(this.player.x, this.player.y, 8, 'star', '#38bdf8');
            this.player.takeDamage(0, 1);
            this.player.x = this.player.lastSafeX;
            this.player.y = this.player.lastSafeY;
            this.player.vx = 0;
            this.player.vy = 0;
          } else {
            const dir = this.player.x < h.x ? -1 : 1;
            this.player.takeDamage(dir, 1);
          }
          this.updateHUD();
        }
      }

      // Check Collectibles
      for (const c of this.level.collectibles) {
        if (!c.collected && Physics.aabb(this.player, c)) {
          c.collected = true;
          this.collectedTreatsInLevel++;

          if (c.isSpecial) {
            this.score += 150;
            try {
              if (window.soundEngine) window.soundEngine.playToyCollect();
            } catch (err) {}
            this.particles.emit(c.x, c.y, 10, 'heart', '#f472b6');
            this.particles.addFloatingText(c.x + 14, c.y, '+150 💖', '#ec4899');
          } else {
            this.score += 50;
            try {
              if (window.soundEngine) window.soundEngine.playEat();
            } catch (err) {}
            this.particles.emit(c.x, c.y, 6, 'star', '#f59e0b');
            this.particles.addFloatingText(c.x + 14, c.y, '+50 ⭐', '#d97706');
          }
          this.updateHUD();
        }
      }

      // Check Partner Reunion Reach (Touching destination gazebo)
      const destHitbox = {
        x: this.destination.x + 10,
        y: this.destination.y - 45,
        width: 60,
        height: 55
      };
      if (Physics.aabb(this.player, destHitbox)) {
        this.triggerVictory();
      }

      // Check Out of Lives
      if (this.player.isDead || this.player.lives <= 0) {
        this.triggerGameOver();
      }

      // Fall detection: cat fell below the stage floor
      if (this.player.y > (this.level.height || 540) + 80 && !this.player.isDead) {
        this.triggerFell();
      }

      // Update Particles
      this.particles.update();

      // Smooth Side-Scrolling Camera Tracking
      if (this.canvas) {
        const targetCamX = this.player.x - this.canvas.width * 0.35;
        this.cameraX += (targetCamX - this.cameraX) * 0.12;

        const maxCamX = Math.max(0, this.level.width - this.canvas.width);
        this.cameraX = Math.max(0, Math.min(maxCamX, this.cameraX));
        this.cameraY = 0; // Fixed vertical height (540px matches stage perfectly!)
      }
    }

    this.renderPreviews();
  }

  draw() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.gameState === 'playing' || this.gameState === 'paused') {
      if (!this.level) return;

      const theme = this.level.theme;
      const camX = Math.floor(this.cameraX);

      // 1. SKY BACKGROUND (Fixed)
      const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      skyGrad.addColorStop(0, theme.skyTop);
      skyGrad.addColorStop(1, theme.skyBottom);
      this.ctx.fillStyle = skyGrad;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // 2. PARALLAX ROLLING PASTEL HILLS (Moves slowly: 0.25x camera speed)
      this.ctx.save();
      const hillShift = -(camX * 0.25) % 800;
      this.ctx.translate(hillShift, 0);

      this.ctx.fillStyle = theme.hillColor;
      for (let hx = -800; hx < this.canvas.width + 1600; hx += 400) {
        this.ctx.beginPath();
        this.ctx.arc(hx + 200, 480, 260, Math.PI, 0);
        this.ctx.fill();
      }
      this.ctx.restore();

      // 3. GAMEPLAY WORLD (Full camera translation)
      this.ctx.save();
      this.ctx.translate(-camX, 0);

      // A. Floating Scenery Clouds
      ctxDrawClouds(this.ctx, this.level.scenery.clouds, this.animTimer);

      // B. Decorative Scenery Trees along platforms
      ctxDrawTrees(this.ctx, this.level.scenery.trees, theme.treeType);

      // C. Start Signpost
      SpriteRenderer.drawStartSign(this.ctx, this.level.scenery.startSign.x, this.level.scenery.startSign.y);

      // D. Paw Prints Guide Trail
      for (const pw of this.level.pawPrints) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(217, 119, 6, 0.28)';
        this.ctx.font = '14px serif';
        this.ctx.fillText('🐾', pw.x, pw.y);
        this.ctx.restore();
      }

      // E. Lush Platforms with 3D Grass
      for (const p of this.level.platforms) {
        SpriteRenderer.drawPlatform(this.ctx, p.x, p.y, p.width, p.height, theme);
      }

      // F. Moving Platforms
      for (const mp of this.level.movingPlatforms) {
        mp.draw(this.ctx);
      }

      // G. Interactive Hazards
      for (const h of this.level.hazards) {
        h.draw(this.ctx);
      }

      // H. Collectibles
      for (const c of this.level.collectibles) {
        c.draw(this.ctx);
      }

      // I. Destination Cat Gazebo & Waiting Partner
      this.destination.draw(this.ctx);

      // J. The Playable Cat!
      this.player.draw(this.ctx);

      // K. Particles & Floating Scores
      this.particles.draw(this.ctx);

      this.ctx.restore();
    }
  }

  renderPreviews() {
    if (this.victoryCanvas && this.gameState === 'victory') {
      const vctx = this.victoryCanvas.getContext('2d');
      if (vctx) {
        SpriteRenderer.drawReunionScene(vctx, 280, 140, this.animTimer);
      }
    }
  }

  startLoop() {
    const loop = (time) => {
      const delta = (time - this.lastTime) / 1000;
      this.lastTime = time;

      this.update(delta);
      this.draw();

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

// Helpers for decorative scenery
function ctxDrawClouds(ctx, clouds, timer) {
  ctx.save();
  for (const c of clouds) {
    const drift = Math.sin(timer * 0.5 + c.x * 0.01) * 15;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(c.x + drift, c.y, 22 * c.scale, 0, Math.PI * 2);
    ctx.arc(c.x + 24 * c.scale + drift, c.y - 8 * c.scale, 28 * c.scale, 0, Math.PI * 2);
    ctx.arc(c.x + 52 * c.scale + drift, c.y, 20 * c.scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function ctxDrawTrees(ctx, trees, treeType) {
  ctx.save();
  for (const t of trees) {
    // Trunk
    ctx.fillStyle = '#7c5339';
    ctx.fillRect(t.x + 10, t.y - 36, 12, 36);

    // Foliage
    if (treeType === 'cherry' || treeType === 'candy') {
      ctx.fillStyle = '#f472b6';
    } else if (treeType === 'cloud') {
      ctx.fillStyle = '#bae6fd';
    } else if (treeType === 'crystal') {
      ctx.fillStyle = '#a855f7';
    } else {
      ctx.fillStyle = '#22c55e';
    }

    ctx.beginPath();
    ctx.arc(t.x + 16, t.y - 50, 26, 0, Math.PI * 2);
    ctx.fill();

    // Little flowers/fruits on tree
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(t.x + 10, t.y - 54, 3.5, 0, Math.PI * 2);
    ctx.arc(t.x + 22, t.y - 44, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Global initialization
function initSaveMeowGame() {
  if (!window.game) {
    try {
      window.game = new Game();
      console.log('save.meow game initialized successfully!');
    } catch (e) {
      console.error('save.meow initialization error:', e);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSaveMeowGame);
} else {
  initSaveMeowGame();
}
window.addEventListener('load', initSaveMeowGame);
