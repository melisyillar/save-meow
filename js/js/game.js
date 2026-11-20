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
    this.screenCustomHero = document.getElementById('screen-custom-hero');
    this.screenCatStudio = document.getElementById('screen-cat-studio');
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
    this.selectedCat = 'muezza'; // 'muezza', 'boncuk' or 'human'

    // Persistent Custom Hero & Wardrobe Progression
    this.wardrobeProgress = window.WardrobeSystem ? window.WardrobeSystem.loadProgress() : { highestLevelCompleted: 0, unlockedIds: [] };
    this.heroConfig = window.WardrobeSystem ? window.WardrobeSystem.loadHeroConfig() : {
      name: 'Maya', gender: 'girl', skinTone: 'peach', hairStyle: 'long_wavy',
      hairStyleGirl: 'long_wavy', hairStyleBoy: 'messy_short', hairColor: 'brown',
      eyeColor: 'brown', eyeShape: 'classic', eyebrowShape: 'soft',
      top: 'blouse_blossom', bottom: 'skirt_pleated', outfit: 'none',
      shoes: 'mary_janes', hairAcc: 'flower_clip', hat: 'none', glasses: 'none', neckAcc: 'none'
    };
    this.heroGender = this.heroConfig.gender || 'girl';
    this.heroName = this.heroConfig.name || 'Maya';

    // Persistent Cat Wardrobe & Rewards Progression
    this.catProgress = window.CatWardrobeSystem ? window.CatWardrobeSystem.loadProgress() : { highestLevelCompleted: 0, unlockedIds: [] };
    this.catConfigs = window.CatWardrobeSystem ? window.CatWardrobeSystem.loadAllConfigs() : { boncuk: {}, muezza: {} };

    // Studio UI State
    this.studioTab = 'hair';
    this.previewPose = 'idle';
    this.previewFacingRight = true;
    this.studioReturnScreen = 'select';
    this.studioToastTimer = null;
    this.victoryElapsed = 0;

    // Cat Studio UI State
    this.catStudioTarget = 'muezza'; // 'muezza' | 'boncuk' | 'duo'
    this.catStudioTab = 'collar';
    this.catPreviewPose = 'idle';
    this.catPreviewFacingRight = true;
    this.catStudioReturnScreen = 'select';
    this.catStudioToastTimer = null;

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
    this.heroLivePreviewCanvas = document.getElementById('hero-live-preview');
    this.cardCanvasHuman = document.getElementById('card-canvas-human');
    this.cardCanvasMuezza = document.getElementById('card-canvas-muezza');
    this.cardCanvasBoncuk = document.getElementById('card-canvas-boncuk');
    this.catLivePreviewCanvas = document.getElementById('cat-live-preview');
    this.catStudioTabContent = document.getElementById('cat-studio-tab-content');
    this.catStudioToast = document.getElementById('cat-studio-toast');
    this.catStudioProgressPill = document.getElementById('cat-studio-progress-pill');
    this.catStudioNextRewardHint = document.getElementById('cat-studio-next-reward-hint');
    this.catIdentityNote = document.getElementById('cat-identity-note');
    this.inputHeroName = document.getElementById('input-hero-name');
    this.studioTabContent = document.getElementById('studio-tab-content');
    this.studioToast = document.getElementById('studio-toast');
    this.studioProgressPill = document.getElementById('studio-progress-pill');
    this.studioNextRewardHint = document.getElementById('studio-next-reward-hint');
    this.victoryRewardBanner = document.getElementById('victory-reward-banner');
    this.victoryRewardItems = document.getElementById('victory-reward-items');
    this.btnVictoryWardrobe = document.getElementById('btn-victory-wardrobe');
    this.btnPauseWardrobe = document.getElementById('btn-pause-wardrobe');

    // Brand Header, Volume Controls & Intro Canvas
    this.siteBrandLogo = document.getElementById('site-brand-logo');
    this.btnHeaderSound = document.getElementById('btn-header-sound');
    this.siteVolumeSlider = document.getElementById('site-volume-slider');
    this.musicMoodPill = document.getElementById('music-mood-pill');
    this.musicMoodLabel = document.getElementById('music-mood-label');
    this.introBgCanvas = document.getElementById('intro-bg-canvas');
    this.introBrandCenter = document.getElementById('intro-brand-center');

    // Intro animation runs once on initial load, never replays on regular screen switches
    this.hasPlayedIntro = false;
    this.introParticles = this._createIntroParticles();
    this.introBurstParticles = [];

    setTimeout(() => {
      this.settleIntroAnimation();
    }, 1150);

    if (this.inputHeroName) {
      this.inputHeroName.value = this.heroConfig.name || 'Maya';
    }

    this.initEvents();
    this.renderStudioControls();
    this.renderCatStudioControls();
    this.syncAudioUI();
    this.startLoop();
  }

  _createIntroParticles() {
    const glyphs = ['🐾', '✨', '⭐', '💖', '✦', '🐾', '✨', '🌸'];
    const bokehColors = [
      'rgba(251, 198, 214, 0.35)',
      'rgba(202, 181, 248, 0.32)',
      'rgba(154, 208, 245, 0.32)',
      'rgba(254, 240, 138, 0.28)'
    ];
    const items = [];
    for (let i = 0; i < 26; i++) {
      const isBokeh = i % 3 === 0;
      items.push({
        x: ((i * 73) % 920) + 20,
        y: ((i * 59) % 500) + 20,
        vy: 0.22 + (i % 5) * 0.08,
        swayAmp: 10 + (i % 4) * 6,
        swayFreq: 0.7 + (i % 5) * 0.22,
        phase: i * 0.85,
        size: isBokeh ? 10 + (i % 4) * 7 : 13 + (i % 4) * 3,
        alpha: isBokeh ? 0.5 : 0.42 + (i % 4) * 0.12,
        glyph: isBokeh ? null : glyphs[i % glyphs.length],
        color: bokehColors[i % bokehColors.length]
      });
    }
    return items;
  }

  settleIntroAnimation() {
    if (this.hasPlayedIntro) return;
    this.hasPlayedIntro = true;
    if (this.screenStart) {
      this.screenStart.classList.remove('intro-animate');
      this.screenStart.classList.add('intro-settled');
    }
  }

  returnToIntro() {
    // Release any active movement keys when leaving gameplay
    this.input.left = false;
    this.input.right = false;
    this.input.jumpPressed = false;
    this.input.jumpHeld = false;

    this.settleIntroAnimation();
    this.showScreen('start');

    // Give crisp gentle visual & musical acknowledgement on logo click
    if (this.introBrandCenter) {
      this.introBrandCenter.classList.remove('logo-pop-feedback');
      void this.introBrandCenter.offsetWidth;
      this.introBrandCenter.classList.add('logo-pop-feedback');
    }
    try {
      if (window.soundEngine) {
        window.soundEngine.setMusicMode('menu');
        window.soundEngine.playIntroChime();
      }
    } catch (err) {}
    this.syncAudioUI();
  }

  burstIntroHearts(side) {
    const cx = side === 'left' ? 165 : 795;
    const cy = 225;
    const icons = ['💖', '✨', '🐾', '⭐'];
    for (let i = 0; i < 8; i++) {
      const ang = -Math.PI * 0.85 + Math.random() * Math.PI * 0.7;
      const spd = 1.4 + Math.random() * 2.2;
      this.introBurstParticles.push({
        x: cx + (Math.random() - 0.5) * 36,
        y: cy + (Math.random() - 0.5) * 24,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 0.6,
        life: 1.0,
        glyph: icons[i % icons.length],
        size: 14 + Math.random() * 6
      });
    }
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
      // Never hijack typing inside character name input!
      const tag = document.activeElement ? document.activeElement.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

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

    // Persistent Top Brand Logo -> Always returns cleanly to Intro screen!
    on('site-brand-logo', 'click', () => {
      this.returnToIntro();
    });

    // Persistent Top Header Audio Controls (Synced with HUD & M key)
    on('btn-header-sound', 'click', () => {
      this.toggleSound();
    });

    if (this.siteVolumeSlider) {
      this.siteVolumeSlider.addEventListener('input', (e) => {
        e.stopPropagation();
        this.setVolume(Number(e.target.value) / 100);
      });
    }

    // Interactive Intro Cat Medallions (Click Müezza or Boncuk for a cute meow!)
    on('intro-cat-muezza', 'click', () => {
      this.burstIntroHearts('left');
      try {
        if (window.soundEngine) {
          window.soundEngine.setMusicMode('menu');
          window.soundEngine.playMeow('muezza');
        }
      } catch (err) {}
      this.syncAudioUI();
    });

    on('intro-cat-boncuk', 'click', () => {
      this.burstIntroHearts('right');
      try {
        if (window.soundEngine) {
          window.soundEngine.setMusicMode('menu');
          window.soundEngine.playMeow('boncuk');
        }
      } catch (err) {}
      this.syncAudioUI();
    });

    // Intro / Start Screen -> Character Selection
    on('btn-go-character-select', 'click', () => {
      this.showScreen('select');
      try {
        if (window.soundEngine) {
          window.soundEngine.setMusicMode('menu');
          window.soundEngine.playMeow('muezza');
        }
      } catch (err) {}
      this.syncAudioUI();
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

    on('card-human', 'click', () => {
      this.selectCat('human');
    });

    on('btn-back-to-start', 'click', () => {
      this.showScreen('start');
    });

    // Open Cat Wardrobe & Costume Studio from Character Select
    on('btn-open-cat-studio', 'click', () => {
      const targetCat = this.selectedCat === 'boncuk' ? 'boncuk' : 'muezza';
      this.openCatStudio('select', targetCat);
    });

    // Start Level Button in Character Select
    on('btn-start-game', 'click', () => {
      this.handleMainStartClick();
    });

    // Cat Studio Controls
    on('opt-cat-muezza', 'click', () => this.selectStudioCat('muezza'));
    on('opt-cat-boncuk', 'click', () => this.selectStudioCat('boncuk'));
    on('opt-cat-duo', 'click', () => this.selectStudioCat('duo'));
    on('btn-cat-preview-flip', 'click', () => {
      this.catPreviewFacingRight = !this.catPreviewFacingRight;
    });
    on('btn-cat-reset', 'click', () => this.resetStudioCat());
    on('btn-cat-randomize', 'click', () => this.randomizeStudioCat());
    on('btn-cat-studio-back', 'click', () => this.handleBackFromCatStudio());
    on('btn-cat-studio-play', 'click', () => this.startCatGameFromStudio());

    const catTabsEl = document.getElementById('cat-studio-tabs');
    if (catTabsEl) {
      catTabsEl.querySelectorAll('.studio-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.setCatStudioTab(btn.dataset.tab);
        });
      });
    }

    const catPoseBar = document.getElementById('cat-preview-pose-bar');
    if (catPoseBar) {
      catPoseBar.querySelectorAll('.pose-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.setCatPreviewPose(btn.dataset.pose);
        });
      });
    }

    // Custom Hero Studio Controls
    on('opt-hero-girl', 'click', () => {
      this.selectHeroGender('girl');
    });

    on('opt-hero-boy', 'click', () => {
      this.selectHeroGender('boy');
    });

    on('btn-back-to-char-select', 'click', () => {
      this.handleBackFromStudio();
    });

    on('btn-start-hero-game', 'click', () => {
      this.startHeroGame();
    });

    on('btn-preview-flip', 'click', () => {
      this.previewFacingRight = !this.previewFacingRight;
    });

    on('btn-hero-randomize', 'click', () => {
      this.randomizeHero();
    });

    if (this.inputHeroName) {
      this.inputHeroName.addEventListener('input', () => {
        const val = this.inputHeroName.value.trim();
        this.heroConfig.name = val || (this.heroConfig.gender === 'girl' ? 'Maya' : 'Can');
        this.heroName = this.heroConfig.name;
        if (window.WardrobeSystem) window.WardrobeSystem.saveHeroConfig(this.heroConfig);
        if (this.player && this.player.catType === 'human') {
          this.player.customName = this.heroName;
          if (this.player.heroConfig) this.player.heroConfig.name = this.heroName;
        }
      });
    }

    // Studio Category Tabs
    const tabsEl = document.getElementById('studio-tabs');
    if (tabsEl) {
      tabsEl.querySelectorAll('.studio-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.setStudioTab(btn.dataset.tab);
        });
      });
    }

    // Studio Pose Preview Bar
    const poseBar = document.getElementById('preview-pose-bar');
    if (poseBar) {
      poseBar.querySelectorAll('.pose-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.setPreviewPose(btn.dataset.pose);
        });
      });
    }

    // HUD buttons
    on('btn-sound-toggle', 'click', () => this.toggleSound());
    on('btn-pause', 'click', () => this.pauseGame());

    // Pause Screen Buttons
    on('btn-resume', 'click', () => this.resumeGame());
    on('btn-pause-wardrobe', 'click', () => {
      if (this.selectedCat === 'human') this.openStudio('paused');
      else this.openCatStudio('paused', this.selectedCat);
    });
    on('btn-restart-level', 'click', () => {
      this.startLevel(this.currentLevelNum);
    });
    on('btn-quit-to-menu', 'click', () => {
      this.showScreen('start');
    });

    // Victory Screen Buttons
    on('btn-victory-wardrobe', 'click', () => {
      if (this.selectedCat === 'human') this.openStudio('victory');
      else this.openCatStudio('victory', this.selectedCat);
    });
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
    const cardHuman = document.getElementById('card-human');
    const selectedNameSpan = document.getElementById('selected-cat-name');
    const btnStartGame = document.getElementById('btn-start-game');

    if (cardMuezza) cardMuezza.classList.remove('selected');
    if (cardBoncuk) cardBoncuk.classList.remove('selected');
    if (cardHuman) cardHuman.classList.remove('selected');

    if (catName === 'muezza') {
      if (cardMuezza) cardMuezza.classList.add('selected');
      if (selectedNameSpan) selectedNameSpan.textContent = 'Müezza';
      if (btnStartGame) btnStartGame.innerHTML = '<span id="selected-cat-name">Müezza</span> ile Maceraya Atıl! 🚀';
      try {
        if (window.soundEngine) window.soundEngine.playMeow('muezza');
      } catch (err) {}
    } else if (catName === 'boncuk') {
      if (cardBoncuk) cardBoncuk.classList.add('selected');
      if (selectedNameSpan) selectedNameSpan.textContent = 'Boncuk';
      if (btnStartGame) btnStartGame.innerHTML = '<span id="selected-cat-name">Boncuk</span> ile Maceraya Atıl! 🚀';
      try {
        if (window.soundEngine) window.soundEngine.playMeow('boncuk');
      } catch (err) {}
    } else if (catName === 'human') {
      if (cardHuman) cardHuman.classList.add('selected');
      if (btnStartGame) btnStartGame.innerHTML = 'Kahramanını Oluştur! 🎨 ➔';
      try {
        if (window.soundEngine) {
          window.soundEngine.playMeow('boncuk');
          setTimeout(() => { if (window.soundEngine) window.soundEngine.playMeow('muezza'); }, 180);
        }
      } catch (err) {}
    }
  }

  handleMainStartClick() {
    if (this.selectedCat === 'human') {
      this.openStudio('select');
    } else {
      this.startLevel(1);
    }
  }

  openStudio(returnScreen = 'select') {
    this.studioReturnScreen = returnScreen;
    if (window.WardrobeSystem) {
      this.wardrobeProgress = window.WardrobeSystem.loadProgress();
      this.heroConfig = window.WardrobeSystem.sanitizeConfig(this.heroConfig, this.wardrobeProgress);
    }
    this.heroGender = this.heroConfig.gender;
    this.heroName = this.heroConfig.name;

    // Sync gender pill UI
    const optGirl = document.getElementById('opt-hero-girl');
    const optBoy = document.getElementById('opt-hero-boy');
    if (optGirl) optGirl.classList.toggle('selected', this.heroConfig.gender === 'girl');
    if (optBoy) optBoy.classList.toggle('selected', this.heroConfig.gender === 'boy');

    if (this.inputHeroName) {
      this.inputHeroName.value = this.heroConfig.name || (this.heroConfig.gender === 'girl' ? 'Maya' : 'Can');
    }

    const startBtn = document.getElementById('btn-start-hero-game');
    if (startBtn) {
      if (returnScreen === 'paused') startBtn.textContent = 'Kaydet & Devam Et! ▶';
      else if (returnScreen === 'victory') startBtn.textContent = 'Sonraki Bölüme Başla! 🚀🐾';
      else startBtn.textContent = 'Maceraya Başla! 🚀🐾';
    }

    this.renderStudioControls();
    this.showScreen('custom-hero');
  }

  handleBackFromStudio() {
    if (this.studioReturnScreen === 'paused') {
      this.showScreen('paused');
    } else if (this.studioReturnScreen === 'victory') {
      this.showScreen('victory');
    } else {
      this.showScreen('select');
    }
  }

  selectHeroGender(gender) {
    if (gender !== 'girl' && gender !== 'boy') return;

    // Switch gender cleanly: saves outgoing look, restores target gender look & strictly removes incompatible items!
    if (window.WardrobeSystem) {
      this.heroConfig = window.WardrobeSystem.switchGender(this.heroConfig, gender, this.wardrobeProgress);
    } else {
      this.heroConfig.gender = gender;
      if (gender === 'boy') this.heroConfig.hairAcc = 'none';
    }
    this.heroGender = this.heroConfig.gender;

    const optGirl = document.getElementById('opt-hero-girl');
    const optBoy = document.getElementById('opt-hero-boy');
    if (optGirl) optGirl.classList.toggle('selected', gender === 'girl');
    if (optBoy) optBoy.classList.toggle('selected', gender === 'boy');

    if (this.inputHeroName) {
      const cur = this.inputHeroName.value.trim();
      if (gender === 'girl' && (!cur || cur === 'Can' || cur === 'Kahraman')) {
        this.inputHeroName.value = 'Maya';
        this.heroConfig.name = 'Maya';
      } else if (gender === 'boy' && (!cur || cur === 'Maya' || cur === 'Kahraman')) {
        this.inputHeroName.value = 'Can';
        this.heroConfig.name = 'Can';
      }
    }
    this.heroName = this.heroConfig.name;

    if (window.WardrobeSystem) window.WardrobeSystem.saveHeroConfig(this.heroConfig);
    this.syncLivePlayerHeroConfig();
    this.renderStudioControls();

    try {
      if (window.soundEngine) window.soundEngine.playEat();
    } catch (err) {}
  }

  setStudioTab(tabName) {
    this.studioTab = tabName || 'hair';
    const tabsEl = document.getElementById('studio-tabs');
    if (tabsEl) {
      tabsEl.querySelectorAll('.studio-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === this.studioTab);
      });
    }
    this.renderStudioControls();
  }

  setPreviewPose(poseName) {
    this.previewPose = poseName || 'idle';
    const poseBar = document.getElementById('preview-pose-bar');
    if (poseBar) {
      poseBar.querySelectorAll('.pose-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.pose === this.previewPose);
      });
    }
  }

  showStudioToast(message) {
    if (!this.studioToast) return;
    this.studioToast.textContent = message;
    this.studioToast.classList.remove('hidden');
    if (this.studioToastTimer) clearTimeout(this.studioToastTimer);
    this.studioToastTimer = setTimeout(() => {
      if (this.studioToast) this.studioToast.classList.add('hidden');
    }, 2400);
  }

  updateHeroProp(key, value) {
    const WS = window.WardrobeSystem;
    const gender = this.heroConfig.gender === 'boy' ? 'boy' : 'girl';
    const genderCheckedKeys = ['hairStyle', 'top', 'bottom', 'outfit', 'shoes', 'hairAcc', 'hat', 'glasses', 'neckAcc'];
    const unlockableKeys = ['top', 'bottom', 'outfit', 'shoes', 'hairAcc', 'hat', 'glasses', 'neckAcc'];

    // Strictly prevent applying gender-incompatible hair, clothes, or accessories!
    if (WS && genderCheckedKeys.includes(key)) {
      if (!WS.isSlotValueAllowedForGender(key, value, gender)) {
        this.showStudioToast('⚠️ Bu parça seçili karakter için uygun değil.');
        return;
      }
    }

    if (WS && unlockableKeys.includes(key)) {
      if (!WS.isItemUnlocked(value, this.wardrobeProgress)) {
        const item = WS.ALL_WARDROBE_ITEMS.find(i => i.id === value);
        const lvl = item ? item.unlockLevel : '?';
        const dispName = item ? WS.getItemDisplayName(item, gender) : '';
        this.showStudioToast(`🔒 "${dispName}" Bölüm ${lvl} tamamlandığında açılır!`);
        return;
      }
    }

    this.heroConfig[key] = value;

    // Remember hairstyle per gender
    if (key === 'hairStyle') {
      if (gender === 'girl') this.heroConfig.hairStyleGirl = value;
      else this.heroConfig.hairStyleBoy = value;
    }

    // If choosing a separate top or bottom while wearing a full special outfit, switch to mix-and-match automatically!
    if ((key === 'top' || key === 'bottom') && this.heroConfig.outfit !== 'none') {
      this.heroConfig.outfit = 'none';
    }

    // Sanitize & keep per-gender saved preset synchronized
    if (WS) {
      this.heroConfig = WS.sanitizeConfig(this.heroConfig, this.wardrobeProgress);
      const snapshot = {};
      genderCheckedKeys.forEach(k => { snapshot[k] = this.heroConfig[k]; });
      if (gender === 'girl') this.heroConfig.savedGirl = snapshot;
      else this.heroConfig.savedBoy = snapshot;
      WS.saveHeroConfig(this.heroConfig);
    }

    this.syncLivePlayerHeroConfig();
    this.renderStudioControls();

    try {
      if (window.soundEngine) window.soundEngine.playEat();
    } catch (err) {}
  }

  syncLivePlayerHeroConfig() {
    if (this.player && this.player.catType === 'human') {
      this.player.heroConfig = { ...this.heroConfig };
      this.player.gender = this.heroConfig.gender;
      this.player.customName = this.heroConfig.name;
    }
  }

  randomizeHero() {
    if (!window.WardrobeSystem) return;
    this.heroConfig = window.WardrobeSystem.randomizeConfig(this.heroConfig, this.wardrobeProgress);
    const genderKeys = ['hairStyle', 'top', 'bottom', 'outfit', 'shoes', 'hairAcc', 'hat', 'glasses', 'neckAcc'];
    const snapshot = {};
    genderKeys.forEach(k => { snapshot[k] = this.heroConfig[k]; });
    if (this.heroConfig.gender === 'girl') this.heroConfig.savedGirl = snapshot;
    else this.heroConfig.savedBoy = snapshot;
    this.heroGender = this.heroConfig.gender;
    this.heroName = this.heroConfig.name;
    window.WardrobeSystem.saveHeroConfig(this.heroConfig);
    this.syncLivePlayerHeroConfig();
    this.renderStudioControls();
    try {
      if (window.soundEngine) window.soundEngine.playToyCollect();
    } catch (err) {}
  }

  renderStudioControls() {
    const WS = window.WardrobeSystem;
    if (!WS || !this.studioTabContent) return;

    const gender = this.heroConfig.gender === 'boy' ? 'boy' : 'girl';

    // Update tab icons cleanly to match selected gender (no dress/ribbon icons for boy!)
    const tabsEl = document.getElementById('studio-tabs');
    if (tabsEl) {
      const clothesTab = tabsEl.querySelector('[data-tab="clothes"]');
      const accTab = tabsEl.querySelector('[data-tab="accessories"]');
      if (clothesTab) clothesTab.textContent = gender === 'boy' ? '👕 Kıyafet' : '👗 Kıyafet';
      if (accTab) accTab.textContent = gender === 'boy' ? '🧢 Aksesuar' : '🎀 Aksesuar';
    }

    // Update reward progress pill & footer hint (filtered for active character gender!)
    const stats = WS.getUnlockStats(this.wardrobeProgress, gender);
    if (this.studioProgressPill) {
      this.studioProgressPill.textContent = `🎁 Ödüller: ${stats.unlockedRewards} / ${stats.totalRewards}`;
    }
    if (this.studioNextRewardHint) {
      if (stats.nextMilestoneLevel && stats.nextRewardItem) {
        const nextName = WS.getItemDisplayName(stats.nextRewardItem, gender);
        this.studioNextRewardHint.textContent = `🎁 Sonraki ödül: Bölüm ${stats.nextMilestoneLevel} (${nextName})`;
      } else {
        this.studioNextRewardHint.textContent = '🏆 Tüm dolap ödülleri açıldı!';
      }
    }

    const container = this.studioTabContent;
    container.innerHTML = '';

    const addSwatchSection = (title, items, propKey) => {
      const sec = document.createElement('div');
      const curItem = items.find(i => i.id === this.heroConfig[propKey]);
      sec.innerHTML = `<div class="opt-section-label"><span>${title}</span><span class="opt-section-sub">${curItem ? curItem.name : ''}</span></div>`;
      const grid = document.createElement('div');
      grid.className = 'swatch-grid';

      items.forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'color-swatch-btn' + (this.heroConfig[propKey] === item.id ? ' selected' : '');
        btn.style.background = item.swatch;
        btn.title = item.name;
        btn.dataset.prop = propKey;
        btn.dataset.value = item.id;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.updateHeroProp(propKey, item.id);
        });
        grid.appendChild(btn);
      });
      sec.appendChild(grid);
      container.appendChild(sec);
    };

    const addItemGridSection = (title, items, propKey, compact = false, showMilestone = false) => {
      const filteredItems = WS.filterForGender(items, gender);
      if (!filteredItems.length) return;

      const sec = document.createElement('div');
      const subText = (propKey === 'top' || propKey === 'bottom') && this.heroConfig.outfit !== 'none'
        ? 'Özel kostüm aktif (seçince serbest kombine geçer)'
        : '';
      sec.innerHTML = `<div class="opt-section-label"><span>${title}</span><span class="opt-section-sub">${subText}</span></div>`;
      const grid = document.createElement('div');
      grid.className = 'item-options-grid' + (compact ? ' compact' : '');

      filteredItems.forEach(item => {
        const unlocked = WS.isItemUnlocked(item.id, this.wardrobeProgress);
        const isSelected = this.heroConfig[propKey] === item.id && unlocked;
        const dispName = WS.getItemDisplayName(item, gender);
        const dispIcon = WS.getItemDisplayIcon(item, gender);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'item-opt-btn' + (isSelected ? ' selected' : '') + (!unlocked ? ' locked' : '');
        btn.dataset.prop = propKey;
        btn.dataset.value = item.id;
        btn.title = item.desc || dispName;

        let badgeHtml = '';
        if (!unlocked) {
          badgeHtml = `<span class="item-lock-tag">🔒 Bölüm ${item.unlockLevel}</span>`;
        } else if (showMilestone && item.unlockLevel > 0) {
          badgeHtml = `<span class="item-milestone-tag">✨ Bölüm ${item.unlockLevel}</span>`;
        }

        btn.innerHTML = `<span class="item-opt-icon">${unlocked ? dispIcon : '🔒'}</span><span class="item-opt-name">${dispName}</span>${badgeHtml}`;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.updateHeroProp(propKey, item.id);
        });
        grid.appendChild(btn);
      });
      sec.appendChild(grid);
      container.appendChild(sec);
    };

    if (this.studioTab === 'hair') {
      const hairList = gender === 'girl' ? WS.GIRL_HAIRSTYLES : WS.BOY_HAIRSTYLES;
      addItemGridSection(
        gender === 'girl' ? 'Kız Saç Modelleri (9 Model)' : 'Erkek Saç Modelleri (8 Model)',
        hairList,
        'hairStyle',
        true
      );
      addSwatchSection('Saç Rengi (11 Renk)', WS.HAIR_COLORS, 'hairColor');
    } else if (this.studioTab === 'face') {
      addSwatchSection('Ten Tonu', WS.SKIN_TONES, 'skinTone');
      addSwatchSection('Göz Rengi (6 Renk)', WS.EYE_COLORS, 'eyeColor');
      addItemGridSection('Göz Biçimi', WS.EYE_SHAPES, 'eyeShape', true);
      addItemGridSection('Kaş Biçimi', WS.EYEBROW_SHAPES, 'eyebrowShape', true);
    } else if (this.studioTab === 'clothes') {
      addItemGridSection('Üst Kıyafetler', WS.TOPS, 'top', false, true);
      addItemGridSection('Alt Kıyafetler', WS.BOTTOMS, 'bottom', false, true);
      addItemGridSection('Ayakkabılar', WS.SHOES, 'shoes', true, true);
    } else if (this.studioTab === 'accessories') {
      // Hair clips & bows are strictly shown ONLY for girl characters!
      if (gender === 'girl') {
        addItemGridSection('Saç Aksesuarları', WS.HAIR_ACCESSORIES, 'hairAcc', true, true);
      }
      addItemGridSection(gender === 'boy' ? 'Şapka & Bere' : 'Şapka & Taç', WS.HATS, 'hat', true, true);
      addItemGridSection('Gözlükler', WS.GLASSES, 'glasses', true, true);
      addItemGridSection(gender === 'boy' ? 'Boyun & Stil Aksesuarı' : 'Atkı & Aksesuar', WS.NECK_ACCESSORIES, 'neckAcc', true, true);
    } else if (this.studioTab === 'wardrobe') {
      // Progress Roadmap Card
      const pct = stats.totalRewards > 0 ? Math.round((stats.unlockedRewards / stats.totalRewards) * 100) : 100;
      const road = document.createElement('div');
      road.className = 'wardrobe-roadmap-box';
      road.innerHTML = `
        <div><strong>🏆 Tamamlanan En Yüksek Bölüm: ${stats.highestLevel}</strong> &nbsp;•&nbsp; Açılan Ödüller: <strong>${stats.unlockedRewards}/${stats.totalRewards}</strong></div>
        <div style="font-size:10.5px;margin-top:3px;color:#8c634d;">Her 3 bölümde yeni kıyafet/aksesuar, 5., 10., 15. ve 20. bölümlerde özel masal kostümleri açılır!</div>
        <div class="wardrobe-progress-bar"><div class="wardrobe-progress-fill" style="width:${pct}%"></div></div>
      `;
      container.appendChild(road);

      // Special Milestone Outfits (5, 10, 15, 20)
      addItemGridSection('👑 Özel Bölüm Kostümleri (5, 10, 15, 20. Bölüm)', WS.SPECIAL_OUTFITS, 'outfit', false, true);

      // All Rewardable Items Roadmap (strictly filtered for active gender & sorted by unlock level)
      const rewardSec = document.createElement('div');
      rewardSec.innerHTML = `<div class="opt-section-label"><span>🎁 Tüm Bölüm Ödülleri</span><span class="opt-section-sub">Açılanlara tıklayıp giyebilirsin</span></div>`;
      const rewardGrid = document.createElement('div');
      rewardGrid.className = 'item-options-grid';

      const rewards = WS.ALL_WARDROBE_ITEMS
        .filter(i => i.unlockLevel > 0 && WS.isItemAllowedForGender(i, gender))
        .sort((a, b) => a.unlockLevel - b.unlockLevel);

      rewards.forEach(item => {
        const unlocked = WS.isItemUnlocked(item.id, this.wardrobeProgress);
        const isEquipped = unlocked && this.heroConfig[item.category] === item.id;
        const dispName = WS.getItemDisplayName(item, gender);
        const dispIcon = WS.getItemDisplayIcon(item, gender);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'item-opt-btn' + (isEquipped ? ' selected' : '') + (!unlocked ? ' locked' : '');
        btn.dataset.prop = item.category;
        btn.dataset.value = item.id;
        btn.title = item.desc || dispName;
        btn.innerHTML = `
          <span class="item-opt-icon">${unlocked ? dispIcon : '🔒'}</span>
          <span class="item-opt-name">${dispName}</span>
          <span class="${unlocked ? 'item-milestone-tag' : 'item-lock-tag'}">${unlocked ? '✓ Açık' : '🔒 Bölüm ' + item.unlockLevel}</span>
        `;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.updateHeroProp(item.category, item.id);
        });
        rewardGrid.appendChild(btn);
      });
      rewardSec.appendChild(rewardGrid);
      container.appendChild(rewardSec);
    }
  }

  startHeroGame() {
    const val = this.inputHeroName ? this.inputHeroName.value.trim() : '';
    if (window.WardrobeSystem) {
      this.heroConfig = window.WardrobeSystem.sanitizeConfig(this.heroConfig, this.wardrobeProgress);
    }
    this.heroConfig.name = val || (this.heroConfig.gender === 'girl' ? 'Maya' : 'Can');
    this.heroName = this.heroConfig.name;
    this.heroGender = this.heroConfig.gender;
    if (window.WardrobeSystem) window.WardrobeSystem.saveHeroConfig(this.heroConfig);
    this.syncLivePlayerHeroConfig();

    this.selectedCat = 'human';
    if (this.studioReturnScreen === 'paused') {
      this.showScreen('playing');
    } else if (this.studioReturnScreen === 'victory') {
      this.startLevel(this.currentLevelNum + 1);
    } else {
      this.startLevel(1);
    }
  }

  // =========================================================================
  // BONCUK & MÜEZZA CAT CUSTOMIZATION STUDIO & REWARD WARDROBE
  // =========================================================================
  openCatStudio(returnScreen = 'select', targetCat = null) {
    this.catStudioReturnScreen = returnScreen;
    if (window.CatWardrobeSystem) {
      this.catProgress = window.CatWardrobeSystem.loadProgress();
      this.catConfigs = window.CatWardrobeSystem.loadAllConfigs();
    }
    if (targetCat === 'boncuk' || targetCat === 'muezza' || targetCat === 'duo') {
      this.catStudioTarget = targetCat;
    }

    const playBtn = document.getElementById('btn-cat-studio-play');
    if (playBtn) {
      if (returnScreen === 'paused') playBtn.textContent = 'Kaydet & Devam Et! ▶';
      else if (returnScreen === 'victory') playBtn.textContent = 'Sonraki Bölüme Başla! 🚀🐾';
      else playBtn.textContent = 'Maceraya Başla! 🚀🐾';
    }

    this._syncCatStudioHeaderPills();
    this.renderCatStudioControls();
    this.showScreen('cat-studio');
  }

  handleBackFromCatStudio() {
    if (this.catStudioReturnScreen === 'paused') this.showScreen('paused');
    else if (this.catStudioReturnScreen === 'victory') this.showScreen('victory');
    else this.showScreen('select');
  }

  startCatGameFromStudio() {
    if (this.catStudioTarget === 'boncuk' || this.catStudioTarget === 'muezza') {
      this.selectCat(this.catStudioTarget);
    } else if (this.selectedCat === 'human') {
      this.selectCat('muezza');
    }

    if (this.catStudioReturnScreen === 'paused') {
      this.showScreen('playing');
    } else if (this.catStudioReturnScreen === 'victory') {
      this.startLevel(this.currentLevelNum + 1);
    } else {
      this.startLevel(1);
    }
  }

  _syncCatStudioHeaderPills() {
    const btnM = document.getElementById('opt-cat-muezza');
    const btnB = document.getElementById('opt-cat-boncuk');
    const btnD = document.getElementById('opt-cat-duo');
    if (btnM) btnM.classList.toggle('selected', this.catStudioTarget === 'muezza');
    if (btnB) btnB.classList.toggle('selected', this.catStudioTarget === 'boncuk');
    if (btnD) btnD.classList.toggle('selected', this.catStudioTarget === 'duo');

    if (this.catIdentityNote) {
      if (this.catStudioTarget === 'boncuk') {
        this.catIdentityNote.innerHTML = '✨ <strong>Boncuk</strong> • Krem-moka tüyler, beyaz patiler &amp; mavi gözler';
      } else if (this.catStudioTarget === 'duo') {
        this.catIdentityNote.innerHTML = '💕 <strong>İkili Önizleme</strong> • Boncuk &amp; Müezza birlikte aksesuarlarıyla oynuyor!';
      } else {
        this.catIdentityNote.innerHTML = '✨ <strong>Müezza</strong> • Duman grisi kabarık tüyler &amp; kehribar gözler';
      }
    }
  }

  selectStudioCat(target) {
    if (target !== 'muezza' && target !== 'boncuk' && target !== 'duo') return;
    this.catStudioTarget = target;
    this._syncCatStudioHeaderPills();
    if (target === 'duo' && this.catStudioTab !== 'duo') {
      this.setCatStudioTab('duo');
    } else {
      this.renderCatStudioControls();
    }
    try {
      if (window.soundEngine) {
        window.soundEngine.playMeow(target === 'boncuk' ? 'boncuk' : 'muezza');
      }
    } catch (err) {}
  }

  setCatStudioTab(tabName) {
    this.catStudioTab = tabName || 'collar';
    const tabsEl = document.getElementById('cat-studio-tabs');
    if (tabsEl) {
      tabsEl.querySelectorAll('.studio-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === this.catStudioTab);
      });
    }
    this.renderCatStudioControls();
  }

  setCatPreviewPose(poseName) {
    this.catPreviewPose = poseName || 'idle';
    const bar = document.getElementById('cat-preview-pose-bar');
    if (bar) {
      bar.querySelectorAll('.pose-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.pose === this.catPreviewPose);
      });
    }
  }

  showCatStudioToast(message) {
    if (!this.catStudioToast) return;
    this.catStudioToast.textContent = message;
    this.catStudioToast.classList.remove('hidden');
    if (this.catStudioToastTimer) clearTimeout(this.catStudioToastTimer);
    this.catStudioToastTimer = setTimeout(() => {
      if (this.catStudioToast) this.catStudioToast.classList.add('hidden');
    }, 2600);
  }

  _activeEditableCat() {
    return this.catStudioTarget === 'boncuk' ? 'boncuk' : 'muezza';
  }

  equipCatItem(slot, itemId) {
    const CWS = window.CatWardrobeSystem;
    if (!CWS) return;
    const catId = this._activeEditableCat();
    const res = CWS.equipItem(catId, slot, itemId, this.catProgress);
    if (!res.ok) {
      const item = CWS.ALL_CAT_ITEMS.find(i => i.id === itemId);
      const lvl = item ? item.unlockLevel : '?';
      this.showCatStudioToast(`🔒 "${item ? item.name : ''}" Bölüm ${lvl} tamamlandığında açılır!`);
      return;
    }
    this.catConfigs = CWS.loadAllConfigs();
    this.renderCatStudioControls();
    try { if (window.soundEngine) window.soundEngine.playEat(); } catch (err) {}
  }

  applyCatCostumeSet(setId) {
    const CWS = window.CatWardrobeSystem;
    if (!CWS) return;
    const catId = this._activeEditableCat();
    const res = CWS.applyCostumeSet(catId, setId, this.catProgress);
    const set = CWS.COSTUME_SETS.find(s => s.id === setId);
    if (!res.ok) {
      this.showCatStudioToast(`🔒 "${set ? set.name : ''}" Bölüm ${set ? set.unlockLevel : '?'} tamamlandığında açılır!`);
      return;
    }
    this.catConfigs = CWS.loadAllConfigs();
    this.renderCatStudioControls();
    this.showCatStudioToast(`✨ ${catId === 'boncuk' ? 'Boncuk' : 'Müezza'} için "${set.name}" giydirildi! Parçaları ayrı ayrı değiştirebilirsin.`);
    try { if (window.soundEngine) window.soundEngine.playToyCollect(); } catch (err) {}
  }

  applyCatDuoSet(duoId) {
    const CWS = window.CatWardrobeSystem;
    if (!CWS) return;
    const res = CWS.applyDuoSet(duoId, this.catProgress);
    const duo = CWS.DUO_SETS.find(d => d.id === duoId);
    if (!res.ok) {
      this.showCatStudioToast(`🔒 "${duo ? duo.name : ''}" Bölüm ${duo ? duo.unlockLevel : '?'} tamamlandığında açılır!`);
      return;
    }
    this.catConfigs = CWS.loadAllConfigs();
    this.catStudioTarget = 'duo';
    this._syncCatStudioHeaderPills();
    this.renderCatStudioControls();
    this.showCatStudioToast(`💕 "${duo.name}" hem Boncuk hem Müezza'ya uygulandı!`);
    try { if (window.soundEngine) window.soundEngine.playToyCollect(); } catch (err) {}
  }

  resetStudioCat() {
    const CWS = window.CatWardrobeSystem;
    if (!CWS) return;
    if (this.catStudioTarget === 'duo') {
      CWS.resetCatConfig('muezza');
      CWS.resetCatConfig('boncuk');
    } else {
      CWS.resetCatConfig(this._activeEditableCat());
    }
    this.catConfigs = CWS.loadAllConfigs();
    this.renderCatStudioControls();
    try { if (window.soundEngine) window.soundEngine.playEat(); } catch (err) {}
  }

  randomizeStudioCat() {
    const CWS = window.CatWardrobeSystem;
    if (!CWS) return;
    if (this.catStudioTarget === 'duo') {
      CWS.randomizeCat('muezza', this.catProgress);
      CWS.randomizeCat('boncuk', this.catProgress);
    } else {
      CWS.randomizeCat(this._activeEditableCat(), this.catProgress);
    }
    this.catConfigs = CWS.loadAllConfigs();
    this.renderCatStudioControls();
    try { if (window.soundEngine) window.soundEngine.playToyCollect(); } catch (err) {}
  }

  renderCatStudioControls() {
    const CWS = window.CatWardrobeSystem;
    if (!CWS || !this.catStudioTabContent) return;

    this.catProgress = CWS.loadProgress();
    const catId = this._activeEditableCat();
    const activeCfg = CWS.getCatConfig(catId);
    const stats = CWS.getUnlockStats(this.catProgress);

    if (this.catStudioProgressPill) {
      this.catStudioProgressPill.textContent = `🎁 Kedi Ödülleri: ${stats.unlockedRewards} / ${stats.totalRewards}`;
    }
    if (this.catStudioNextRewardHint) {
      if (stats.nextMilestoneLevel && stats.nextRewardItem) {
        this.catStudioNextRewardHint.textContent = `🎁 Sonraki ödül: Bölüm ${stats.nextMilestoneLevel} (${stats.nextRewardItem.name})`;
      } else {
        this.catStudioNextRewardHint.textContent = '🏆 Tüm kedi aksesuar ve kostümleri açıldı!';
      }
    }

    const container = this.catStudioTabContent;
    container.innerHTML = '';

    const forTagHtml = (forCat) => {
      if (forCat === 'boncuk') return '<span class="cat-for-tag for-boncuk">Boncuk</span>';
      if (forCat === 'muezza') return '<span class="cat-for-tag for-muezza">Müezza</span>';
      return '<span class="cat-for-tag for-both">İkisi</span>';
    };

    const addSlotGrid = (title, items, slot, compact = false) => {
      const sec = document.createElement('div');
      const targetName = catId === 'boncuk' ? 'Boncuk' : 'Müezza';
      sec.innerHTML = `<div class="opt-section-label"><span>${title}</span><span class="opt-section-sub">Düzenlenen: ${targetName} (her parça iki kediye de takılabilir)</span></div>`;
      const grid = document.createElement('div');
      grid.className = 'item-options-grid' + (compact ? ' compact' : '');

      items.forEach(item => {
        const unlocked = CWS.isItemUnlocked(item.id, this.catProgress);
        const isSelected = activeCfg[slot] === item.id && unlocked;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'item-opt-btn' + (isSelected ? ' selected' : '') + (!unlocked ? ' locked' : '');
        btn.dataset.slot = slot;
        btn.dataset.value = item.id;
        btn.title = item.desc || item.name;

        const badge = !unlocked
          ? `<span class="item-lock-tag">🔒 Bölüm ${item.unlockLevel}</span>`
          : (item.unlockLevel > 0 ? `<span class="item-milestone-tag">✨ Bölüm ${item.unlockLevel}</span>` : '');

        btn.innerHTML = `
          <span class="item-opt-icon">${unlocked ? item.icon : '🔒'}</span>
          <span class="item-opt-name">${item.name}</span>
          ${item.id !== 'none' ? forTagHtml(item.forCat) : ''}
          ${badge}
        `;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.equipCatItem(slot, item.id);
        });
        grid.appendChild(btn);
      });
      sec.appendChild(grid);
      container.appendChild(sec);
    };

    if (this.catStudioTab === 'collar') {
      addSlotGrid('📿 Renkli & Özel Tasmalar', CWS.COLLARS, 'collar', false);
      addSlotGrid('🏷️ Sallanan İsimlikler', CWS.TAGS, 'tag', true);
    } else if (this.catStudioTab === 'neck') {
      addSlotGrid('🧣 Fularlar, Papyonlar & Çelenkler', CWS.NECKWEAR, 'neckwear', false);
      addSlotGrid('👓 Gözlük & Yüz Detayları', CWS.EYE_ACCESSORIES, 'eyeAcc', true);
    } else if (this.catStudioTab === 'head') {
      addSlotGrid('🎩 Şapka, Fiyonk, Çiçek & Kostüm Başlıkları', CWS.HEADWEAR, 'headwear', true);
    } else if (this.catStudioTab === 'costume') {
      // 1. One-Click Complete Costume Sets
      const setSec = document.createElement('div');
      setSec.innerHTML = `<div class="opt-section-label"><span>✨ Tek Tık Tam Kostüm Setleri</span><span class="opt-section-sub">Parçaları sonra ayrı ayrı değiştirebilirsin</span></div>`;
      const setGrid = document.createElement('div');
      setGrid.className = 'item-options-grid';
      CWS.COSTUME_SETS.forEach(set => {
        const unlocked = CWS.isItemUnlocked(set.id, this.catProgress);
        const isActive = unlocked && activeCfg.outfit === set.pieces.outfit;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'item-opt-btn' + (isActive ? ' selected' : '') + (!unlocked ? ' locked' : '');
        btn.dataset.set = set.id;
        btn.title = set.desc;
        btn.innerHTML = `
          <span class="item-opt-icon">${unlocked ? set.icon : '🔒'}</span>
          <span class="item-opt-name">${set.name}</span>
          ${forTagHtml(set.forCat)}
          <span class="${unlocked ? 'item-milestone-tag' : 'item-lock-tag'}">${unlocked ? '✨ Tam Set' : '🔒 Bölüm ' + set.unlockLevel}</span>
        `;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.applyCatCostumeSet(set.id);
        });
        setGrid.appendChild(btn);
      });
      setSec.appendChild(setGrid);
      container.appendChild(setSec);

      // 2. Individual Mix-and-Match Outfit Bodies
      addSlotGrid('👗 Parça Kostüm Kıyafetleri (Serbest Kombin)', CWS.OUTFITS, 'outfit', true);
    } else if (this.catStudioTab === 'duo') {
      const duoSec = document.createElement('div');
      duoSec.innerHTML = `<div class="opt-section-label"><span>💕 İkili Özel Kostüm Setleri (8 Tema)</span><span class="opt-section-sub">Boncuk &amp; Müezza birlikte uyumlu giyinir!</span></div>`;
      const duoGrid = document.createElement('div');
      duoGrid.className = 'duo-sets-grid';
      CWS.DUO_SETS.forEach(duo => {
        const unlocked = CWS.isItemUnlocked(duo.id, this.catProgress);
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'duo-set-card' + (!unlocked ? ' locked' : '');
        card.dataset.duo = duo.id;
        card.innerHTML = `
          <div class="duo-set-top">
            <span class="duo-set-title">${unlocked ? duo.icon : '🔒'} ${duo.name}</span>
            <span class="${unlocked ? 'item-milestone-tag' : 'item-lock-tag'}">${unlocked ? '✓ Açık' : '🔒 B.' + duo.unlockLevel}</span>
          </div>
          <div class="duo-set-desc">${duo.desc}</div>
        `;
        card.addEventListener('click', (e) => {
          e.stopPropagation();
          this.applyCatDuoSet(duo.id);
        });
        duoGrid.appendChild(card);
      });
      duoSec.appendChild(duoGrid);
      container.appendChild(duoSec);
    } else if (this.catStudioTab === 'rewards') {
      const pct = stats.totalRewards > 0 ? Math.round((stats.unlockedRewards / stats.totalRewards) * 100) : 100;
      const road = document.createElement('div');
      road.className = 'wardrobe-roadmap-box';
      road.innerHTML = `
        <div><strong>🏆 Tamamlanan En Yüksek Bölüm: ${stats.highestLevel}</strong> &nbsp;•&nbsp; Açılan Kedi Ödülleri: <strong>${stats.unlockedRewards}/${stats.totalRewards}</strong></div>
        <div style="font-size:10.5px;margin-top:3px;color:#8c634d;">Bölüm geçtikçe tasma, fular, Arı (B.5), Balerin &amp; Şık Takım (B.8), Polis (B.10), Deniz Kızı (B.15), Asker/Dedektif (B.20), Astronot (B.25) ve Safari İkilisi (B.30) açılır!</div>
        <div class="wardrobe-progress-bar"><div class="wardrobe-progress-fill" style="width:${pct}%"></div></div>
      `;
      container.appendChild(road);

      const rwSec = document.createElement('div');
      rwSec.innerHTML = `<div class="opt-section-label"><span>🎁 Tüm Kedi Seviye Ödülleri</span><span class="opt-section-sub">Açılanlara tıklayıp hemen tak!</span></div>`;
      const rwGrid = document.createElement('div');
      rwGrid.className = 'item-options-grid';

      const rewards = CWS.ALL_CAT_ITEMS
        .filter(i => i.unlockLevel > 0)
        .sort((a, b) => a.unlockLevel - b.unlockLevel);

      rewards.forEach(item => {
        const unlocked = CWS.isItemUnlocked(item.id, this.catProgress);
        const equipped = unlocked && activeCfg[item.slot] === item.id;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'item-opt-btn' + (equipped ? ' selected' : '') + (!unlocked ? ' locked' : '');
        btn.dataset.slot = item.slot;
        btn.dataset.value = item.id;
        btn.title = item.desc || item.name;
        btn.innerHTML = `
          <span class="item-opt-icon">${unlocked ? item.icon : '🔒'}</span>
          <span class="item-opt-name">${item.name}</span>
          ${forTagHtml(item.forCat)}
          <span class="${unlocked ? 'item-milestone-tag' : 'item-lock-tag'}">${unlocked ? '✓ Açık' : '🔒 Bölüm ' + item.unlockLevel}</span>
        `;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.equipCatItem(item.slot, item.id);
        });
        rwGrid.appendChild(btn);
      });
      rwSec.appendChild(rwGrid);
      container.appendChild(rwSec);
    }
  }

  showScreen(screenName) {
    // Once the user navigates away from Intro, never replay the first-load entrance animation
    if (screenName !== 'start' && !this.hasPlayedIntro) {
      this.settleIntroAnimation();
    }

    this.gameState = screenName;

    const screens = [
      this.screenStart,
      this.screenCharacter,
      this.screenCustomHero,
      this.screenCatStudio,
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
    else if (screenName === 'custom-hero') target = this.screenCustomHero;
    else if (screenName === 'cat-studio') target = this.screenCatStudio;
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

    // Screen-aware smooth background music transitions
    try {
      if (window.soundEngine) {
        if (screenName === 'playing') {
          window.soundEngine.setMusicMode('adventure');
        } else if (screenName === 'victory') {
          window.soundEngine.desiredTrack = 'victory';
        } else {
          // Peaceful, calm menu music across Intro, Character Select, Studio, How-To, Pause, Game Over
          window.soundEngine.desiredTrack = 'menu';
          if (window.soundEngine.bgmPlaying) {
            window.soundEngine.setMusicMode('menu');
          }
        }
      }
    } catch (err) {}

    this.syncAudioUI();
  }

  syncAudioUI() {
    const se = window.soundEngine;
    const isMuted = se ? !!se.isMuted : false;
    const vol = se && typeof se.getVolume === 'function' ? se.getVolume() : 0.8;
    const icon = isMuted || vol === 0 ? '🔇' : (vol < 0.4 ? '🔉' : '🔊');

    if (this.btnSoundToggle) this.btnSoundToggle.textContent = icon;
    if (this.btnHeaderSound) this.btnHeaderSound.textContent = icon;
    if (this.siteVolumeSlider) {
      this.siteVolumeSlider.value = String(Math.round((isMuted ? 0 : vol) * 100));
    }

    if (this.musicMoodPill && this.musicMoodLabel) {
      this.musicMoodPill.classList.remove('is-muted', 'is-adventure', 'is-victory');
      if (isMuted || vol === 0) {
        this.musicMoodPill.classList.add('is-muted');
        this.musicMoodLabel.textContent = '🔇 Sessiz';
      } else if (this.gameState === 'playing') {
        this.musicMoodPill.classList.add('is-adventure');
        this.musicMoodLabel.textContent = '🎵 Macera';
      } else if (this.gameState === 'victory') {
        this.musicMoodPill.classList.add('is-victory');
        this.musicMoodLabel.textContent = '🎵 Zafer';
      } else {
        this.musicMoodLabel.textContent = '🎵 Menü';
      }
    }
  }

  setVolume(val) {
    try {
      if (!window.soundEngine) return;
      window.soundEngine.ensureContext();
      window.soundEngine.setVolume(val);
      if (!window.soundEngine.bgmPlaying && val > 0) {
        const mode = this.gameState === 'playing' ? 'adventure' : (this.gameState === 'victory' ? 'victory' : 'menu');
        window.soundEngine.setMusicMode(mode);
      }
      this.syncAudioUI();
    } catch (err) {}
  }

  toggleSound() {
    try {
      if (!window.soundEngine) return;
      const isMuted = window.soundEngine.toggleMute();
      if (!isMuted && !window.soundEngine.bgmPlaying) {
        const mode = this.gameState === 'playing' ? 'adventure' : (this.gameState === 'victory' ? 'victory' : 'menu');
        window.soundEngine.setMusicMode(mode);
      }
      this.syncAudioUI();
    } catch (err) {}
  }

  pauseGame() {
    if (this.gameState === 'playing') {
      if (this.btnPauseWardrobe) {
        this.btnPauseWardrobe.classList.remove('hidden');
        this.btnPauseWardrobe.textContent = this.selectedCat === 'human'
          ? '👗 Kıyafet Dolabı'
          : '🎀 Kedi Dolabı & Kostümler';
      }
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

    // Selected cat or human hero is controlled
    if (this.selectedCat === 'human') {
      if (window.WardrobeSystem) {
        this.heroConfig = window.WardrobeSystem.sanitizeConfig(this.heroConfig, this.wardrobeProgress);
      }
      const spawnY = this.level.playerSpawn.y - 16; // Human hitbox height 58 rests cleanly on platform
      this.player = new Player(this.level.playerSpawn.x, spawnY, 'human', {
        heroConfig: { ...this.heroConfig },
        gender: this.heroConfig.gender,
        name: this.heroConfig.name
      });
      // Both Boncuk & Müezza wait together in the Destination Gazebo!
      this.destination = new Destination(this.level.partnerSpawn.x, this.level.partnerSpawn.y, 'both');
    } else {
      const partnerCat = this.selectedCat === 'boncuk' ? 'muezza' : 'boncuk';
      this.player = new Player(this.level.playerSpawn.x, this.level.playerSpawn.y, this.selectedCat);
      this.destination = new Destination(this.level.partnerSpawn.x, this.level.partnerSpawn.y, partnerCat);
    }

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
    if (this.hudToyIcon) {
      if (this.selectedCat === 'human') this.hudToyIcon.textContent = '🐾';
      else this.hudToyIcon.textContent = this.selectedCat === 'boncuk' ? '🧻' : '🧦';
    }
    if (this.trackerText) {
      if (this.selectedCat === 'human') this.trackerText.textContent = `${this.heroConfig.name}: Kedileri Kurtar!`;
      else this.trackerText.textContent = `${this.selectedCat === 'boncuk' ? 'Müezza' : 'Boncuk'}'a Koş!`;
    }
    this.updateHUD();

    this.showScreen('playing');

    try {
      if (window.soundEngine) {
        window.soundEngine.ensureContext();
        window.soundEngine.setMusicMode('adventure');
        if (this.selectedCat === 'human') {
          window.soundEngine.playMeow('boncuk');
        } else {
          window.soundEngine.playMeow(this.selectedCat);
        }
      }
    } catch (err) {}
    this.syncAudioUI();
  }

  // Restart current level preserving current lives (called on "Try Again" after fall)
  restartCurrentLevel() {
    const livesLeft = this.player ? this.player.lives : 3;
    this.score = this.levelStartScore;
    this.level = LevelGenerator.generate(this.currentLevelNum, this.selectedCat);

    if (this.selectedCat === 'human') {
      if (window.WardrobeSystem) {
        this.heroConfig = window.WardrobeSystem.sanitizeConfig(this.heroConfig, this.wardrobeProgress);
      }
      const spawnY = this.level.playerSpawn.y - 16;
      this.player = new Player(this.level.playerSpawn.x, spawnY, 'human', {
        heroConfig: { ...this.heroConfig },
        gender: this.heroConfig.gender,
        name: this.heroConfig.name
      });
      this.destination = new Destination(this.level.partnerSpawn.x, this.level.partnerSpawn.y, 'both');
    } else {
      const partnerCat = this.selectedCat === 'boncuk' ? 'muezza' : 'boncuk';
      this.player = new Player(this.level.playerSpawn.x, this.level.playerSpawn.y, this.selectedCat);
      this.destination = new Destination(this.level.partnerSpawn.x, this.level.partnerSpawn.y, partnerCat);
    }

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
        window.soundEngine.setMusicMode('adventure');
      }
    } catch (err) {}
    this.syncAudioUI();
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
    this.victoryElapsed = 0;

    if (this.player && this.player.catType === 'human') {
      this.player.state = 'hug';
    }

    // Check & permanently unlock BOTH Human & Cat level wardrobe rewards!
    let newlyUnlockedHero = [];
    if (window.WardrobeSystem) {
      const res = window.WardrobeSystem.checkAndUnlockForLevel(this.currentLevelNum);
      this.wardrobeProgress = res.progress;
      newlyUnlockedHero = res.newlyUnlocked || [];
    }

    let newlyUnlockedCats = [];
    if (window.CatWardrobeSystem) {
      const cres = window.CatWardrobeSystem.checkAndUnlockForLevel(this.currentLevelNum);
      this.catProgress = cres.progress;
      newlyUnlockedCats = cres.newlyUnlocked || [];
    }

    const totalNewRewards = newlyUnlockedHero.length + newlyUnlockedCats.length;

    try {
      if (window.soundEngine) {
        window.soundEngine.playVictory();
        if (totalNewRewards > 0) {
          setTimeout(() => {
            try { if (window.soundEngine) window.soundEngine.playToyCollect(); } catch (e) {}
          }, 380);
        }
      }
    } catch (err) {}

    const vLvl = document.getElementById('vic-level-num');
    const vTrt = document.getElementById('vic-treats');
    const vScr = document.getElementById('vic-score');
    const vStr = document.getElementById('vic-stars');
    const vMsg = document.getElementById('victory-message');

    if (vLvl) vLvl.textContent = `Bölüm ${this.currentLevelNum}`;
    if (vTrt) vTrt.textContent = `${this.collectedTreatsInLevel} / ${this.totalTreatsInLevel}`;
    if (vScr) vScr.textContent = this.score;

    if (vMsg) {
      if (this.selectedCat === 'human') {
        vMsg.textContent = `${this.heroConfig.name}, Boncuk ve Müezza'yı başarıyla kurtardı! İki sevimli dost koşa koşa gelip sıcacık sarıldı! 💖🐾`;
      } else {
        vMsg.textContent = "Boncuk ve Müezza burun buruna değdi, aksesuarlarıyla oynayıp sıcacık kucaklaştı! 💖🐾";
      }
    }

    // Show celebratory reward banner with newly unlocked Cat & Hero rewards + cat badges!
    const WS = window.WardrobeSystem;
    const rewardGender = this.heroConfig.gender === 'boy' ? 'boy' : 'girl';
    const visibleHeroUnlocked = WS
      ? newlyUnlockedHero.filter(item => WS.isItemAllowedForGender(item, rewardGender))
      : newlyUnlockedHero;

    const allChips = [];
    if (this.selectedCat === 'human') {
      visibleHeroUnlocked.forEach((item) => {
        const icon = WS ? WS.getItemDisplayIcon(item, rewardGender) : item.icon;
        const name = WS ? WS.getItemDisplayName(item, rewardGender) : item.name;
        allChips.push({ html: `${icon} ${name}` });
      });
      newlyUnlockedCats.forEach((item) => {
        const who = item.forCat === 'boncuk' ? 'Boncuk' : (item.forCat === 'muezza' ? 'Müezza' : 'Kediler');
        allChips.push({ html: `${item.icon} ${item.name} <em>(${who})</em>` });
      });
    } else {
      // Prioritize items unlocked at this exact milestone level first so featured costumes shine!
      const sortedCats = [...newlyUnlockedCats].sort((a, b) => (b.unlockLevel || 0) - (a.unlockLevel || 0));
      sortedCats.forEach((item) => {
        const who = item.forCat === 'boncuk' ? 'Boncuk' : (item.forCat === 'muezza' ? 'Müezza' : (item.forCat === 'duo' ? 'İkili' : 'İkisi'));
        allChips.push({ html: `${item.icon} ${item.name} <em>(${who})</em>` });
      });
    }

    const maxVisible = 4;
    const rewardChips = allChips.slice(0, maxVisible).map((c, idx) =>
      `<span class="reward-chip" style="animation-delay:${idx * 0.03}s">${c.html}</span>`
    );
    if (allChips.length > maxVisible) {
      rewardChips.push(`<span class="reward-chip">+${allChips.length - maxVisible} ödül daha! 🎁</span>`);
    }

    if (this.victoryRewardBanner && this.victoryRewardItems) {
      if (rewardChips.length > 0) {
        this.victoryRewardItems.innerHTML = rewardChips.join('');
        this.victoryRewardBanner.classList.remove('hidden');
      } else {
        this.victoryRewardBanner.classList.add('hidden');
      }
    }

    if (this.btnVictoryWardrobe) {
      this.btnVictoryWardrobe.classList.remove('hidden');
      this.btnVictoryWardrobe.textContent = this.selectedCat === 'human'
        ? '👗 Dolapta Dene'
        : '🎀 Kedi Dolabında Dene';
    }

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

    const charName = this.selectedCat === 'human' ? this.heroName : (this.selectedCat === 'muezza' ? 'Müezza' : 'Boncuk');
    const fellMsg = document.getElementById('fell-message');
    if (fellMsg) fellMsg.textContent = `Hay aksi! ${charName} düştü! 😿`;

    this.showScreen('fell');
  }

  update(delta) {
    this.animTimer += 0.016;
    if (this.gameState === 'victory') {
      this.victoryElapsed += 0.016;
    }

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
            if (typeof this.player.triggerCelebrate === 'function') {
              this.player.triggerCelebrate(32);
            }
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

  renderIntroBackdrop() {
    if (!this.introBgCanvas || this.gameState !== 'start') return;
    const ctx = this.introBgCanvas.getContext('2d');
    if (!ctx) return;

    const w = this.introBgCanvas.width || 960;
    const h = this.introBgCanvas.height || 540;
    const t = this.animTimer;

    // 1. Dreamy Pastel Fairy-Tale Sky Gradient (Cream -> Blush Pink -> Lavender -> Sky Blue)
    const sky = ctx.createLinearGradient(0, 0, w * 0.4, h);
    sky.addColorStop(0, '#fff9f2');
    sky.addColorStop(0.38, '#fdebf3');
    sky.addColorStop(0.72, '#efe8fc');
    sky.addColorStop(1, '#e1f2fd');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // 2. Soft Glowing Sun / Halo Behind Center Logo
    const halo = ctx.createRadialGradient(w * 0.5, h * 0.42, 18, w * 0.5, h * 0.42, 340);
    halo.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
    halo.addColorStop(0.5, 'rgba(253, 230, 188, 0.22)');
    halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);

    // 3. Soft Drifting Fluffy Clouds
    const drawCloud = (cx, cy, sc) => {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.beginPath();
      ctx.arc(cx, cy, 24 * sc, 0, Math.PI * 2);
      ctx.arc(cx + 26 * sc, cy - 10 * sc, 30 * sc, 0, Math.PI * 2);
      ctx.arc(cx + 56 * sc, cy - 2 * sc, 22 * sc, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    drawCloud(((t * 10 + 60) % (w + 180)) - 90, 82, 1.05);
    drawCloud(((t * 7 + 440) % (w + 180)) - 90, 56, 0.85);
    drawCloud(((t * 12 + 760) % (w + 180)) - 90, 114, 0.95);

    // 4. Rolling Pastel Hills at Bottom
    ctx.save();
    ctx.fillStyle = 'rgba(232, 218, 250, 0.52)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.quadraticCurveTo(w * 0.25, h - 115, w * 0.55, h - 68);
    ctx.quadraticCurveTo(w * 0.82, h - 30, w, h - 98);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(208, 240, 224, 0.48)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.quadraticCurveTo(w * 0.22, h - 55, w * 0.48, h - 82);
    ctx.quadraticCurveTo(w * 0.78, h - 110, w, h - 48);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 5. Gently Floating Paws, Stars, Hearts & Pastel Bokeh Sparkles!
    for (const p of this.introParticles) {
      p.y -= p.vy;
      if (p.y < -28) {
        p.y = h + 24;
      }
      const px = p.x + Math.sin(t * p.swayFreq + p.phase) * p.swayAmp;
      const pulse = 0.85 + Math.sin(t * 2.2 + p.phase) * 0.15;

      ctx.save();
      ctx.globalAlpha = p.alpha * pulse;
      if (p.glyph) {
        ctx.translate(px, p.y);
        ctx.rotate(Math.sin(t * 1.1 + p.phase) * 0.18);
        ctx.font = `${Math.round(p.size)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.glyph, 0, 0);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, p.y, p.size * pulse, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 6. Interactive Cat-Click Heart Bursts
    for (let i = this.introBurstParticles.length - 1; i >= 0; i--) {
      const bp = this.introBurstParticles[i];
      bp.x += bp.vx;
      bp.y += bp.vy;
      bp.vy -= 0.025;
      bp.life -= 0.022;
      if (bp.life <= 0) {
        this.introBurstParticles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, bp.life);
      ctx.font = `${Math.round(bp.size)}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText(bp.glyph, bp.x, bp.y);
      ctx.restore();
    }
  }

  renderPreviews() {
    // 0. Açılış / Intro Ekranı Pastel Masalsı Arka Plan Animasyonu
    if (this.gameState === 'start') {
      this.renderIntroBackdrop();
    }

    // 1. Zafer Ekranı Kucaklaşma Sahnesi (Canlı animasyonlu final!)
    if (this.victoryCanvas && this.gameState === 'victory') {
      const vctx = this.victoryCanvas.getContext('2d');
      if (vctx) {
        const vw = this.victoryCanvas.width || 320;
        const vh = this.victoryCanvas.height || 145;
        if (this.selectedCat === 'human') {
          SpriteRenderer.drawReunionBothScene(vctx, vw, vh, this.animTimer, this.heroConfig, this.heroConfig.name, this.victoryElapsed);
        } else {
          SpriteRenderer.drawReunionScene(vctx, vw, vh, this.animTimer);
        }
      }
    }

    // 2a. Karakter Seçim Ekranındaki Canlı Müezza & Boncuk Kart Önizlemeleri (Kıyafet & Aksesuarlarıyla!)
    if ((this.gameState === 'select' || this.gameState === 'start') && window.CatRenderer) {
      const drawCardCat = (canvas, catId, bg1, bg2) => {
        if (!canvas) return;
        const cctx = canvas.getContext('2d');
        if (!cctx) return;
        cctx.save();
        cctx.setTransform(2, 0, 0, 2, 0, 0);
        cctx.clearRect(0, 0, 140, 124);
        const g = cctx.createLinearGradient(0, 0, 0, 124);
        g.addColorStop(0, bg1);
        g.addColorStop(1, bg2);
        cctx.fillStyle = g;
        cctx.fillRect(0, 0, 140, 124);

        cctx.fillStyle = 'rgba(134, 239, 172, 0.34)';
        cctx.beginPath();
        cctx.ellipse(70, 111, 52, 8.5, 0, 0, Math.PI * 2);
        cctx.fill();

        window.CatRenderer.draw(cctx, catId, 16, 20, 108, 90, 'idle', catId === 'muezza', this.animTimer, false);
        cctx.restore();
      };
      drawCardCat(this.cardCanvasMuezza, 'muezza', '#f5f8fc', '#e7effa');
      drawCardCat(this.cardCanvasBoncuk, 'boncuk', '#fff9f2', '#fceef6');
    }

    // 2. Karakter Seçim Ekranındaki 3. Kart Önizlemesi ("Sen Kurtar!" Kartı)
    if (this.cardCanvasHuman && (this.gameState === 'select' || this.gameState === 'start')) {
      const hctx = this.cardCanvasHuman.getContext('2d');
      if (hctx) {
        hctx.clearRect(0, 0, 140, 124);
        const bgGrad = hctx.createLinearGradient(0, 0, 0, 124);
        bgGrad.addColorStop(0, '#fff9f2');
        bgGrad.addColorStop(0.65, '#fceef5');
        bgGrad.addColorStop(1, '#f3e8fa');
        hctx.fillStyle = bgGrad;
        hctx.fillRect(0, 0, 140, 124);

        // Yumuşak çayır gölgesi
        hctx.fillStyle = 'rgba(134, 239, 172, 0.35)';
        hctx.beginPath();
        hctx.ellipse(70, 112, 58, 9, 0, 0, Math.PI * 2);
        hctx.fill();

        // Kız ve Erkek çocuk yeni masalsı çizimle yan yana!
        SpriteRenderer.drawHuman(hctx, 10, 26, 56, 86, 'idle', true, this.animTimer, false, 'girl');
        SpriteRenderer.drawHuman(hctx, 74, 26, 56, 86, 'idle', false, this.animTimer, false, 'boy');

        // Aralarında parlayan kalp
        const pulse = 1 + Math.sin(this.animTimer * 4) * 0.16;
        hctx.save();
        hctx.translate(70, 22);
        hctx.scale(pulse, pulse);
        hctx.font = '15px serif';
        hctx.textAlign = 'center';
        hctx.fillText('💖', 0, 0);
        hctx.restore();
      }
    }

    // 3. Gelişmiş Kahraman Stüdyosu Büyük Canlı Önizleme (2x HiDPI crisp!)
    if (this.gameState === 'custom-hero' && this.heroLivePreviewCanvas && window.HumanRenderer) {
      const pctx = this.heroLivePreviewCanvas.getContext('2d');
      if (pctx) {
        pctx.save();
        pctx.setTransform(2, 0, 0, 2, 0, 0);
        window.HumanRenderer.drawStudioPreview(
          pctx,
          230,
          260,
          this.heroConfig,
          this.previewPose,
          this.previewFacingRight,
          this.animTimer
        );
        pctx.restore();
      }
    }

    // 4. Kedi Dolabı & Kostüm Stüdyosu Büyük Canlı Önizleme (2x HiDPI crisp — Tekli veya İkili!)
    if (this.gameState === 'cat-studio' && this.catLivePreviewCanvas && window.CatRenderer) {
      const cctx = this.catLivePreviewCanvas.getContext('2d');
      if (cctx) {
        cctx.save();
        cctx.setTransform(2, 0, 0, 2, 0, 0);
        window.CatRenderer.drawStudioPreview(
          cctx,
          230,
          220,
          this.catStudioTarget,
          this.catPreviewPose,
          this.catPreviewFacingRight,
          this.animTimer
        );
        cctx.restore();
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
