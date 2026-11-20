/**
 * BONCUK & MÜEZZA – save.meow
 * Master Sprite Renderer: High-Detail 2D Illustrated Cat Characters,
 * Platforms, Scenic Backgrounds, Gazebos, Hazards & Collectibles.
 */

const SpriteRenderer = {
  roundRect(ctx, x, y, width, height, radius = 4) {
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
      return;
    }
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  },

  /**
   * =========================================================================
   * BONCUK (Sağdaki Kedi)
   * Size: ~56x48px (large, crisp, fully visible!)
   * Features:
   * - Slim, elegant ivory/cream coat (#fdfbf7)
   * - Striking warm mocha/caramel Siamese face mask (#6c4f3d)
   * - Brilliant, glowing crystal sapphire blue eyes (#0284c7 & #38bdf8)
   * - Dark upright ears with soft pink inner fluff
   * - Mocha forelegs with pure white mitten paws
   * - Slender caramel tail with dark chocolate tip
   * =========================================================================
   */
  drawBoncuk(ctx, x, y, width = 56, height = 48, state = 'idle', facingRight = true, animTimer = 0, isHurt = false) {
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);

    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    if (isHurt && Math.floor(animTimer * 18) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }

    const t = animTimer;
    let bodyBob = 0;
    let legAngle1 = 0;
    let legAngle2 = 0;
    let tailAngle = Math.sin(t * 3) * 0.25;
    let eyeBlink = (Math.sin(t * 0.8) > 0.94);
    let scaleX = 1;
    let scaleY = 1;

    if (state === 'run') {
      bodyBob = Math.sin(t * 14) * 3;
      legAngle1 = Math.sin(t * 14) * 0.6;
      legAngle2 = -Math.sin(t * 14) * 0.6;
      tailAngle = Math.sin(t * 14) * 0.5;
    } else if (state === 'jump') {
      scaleX = 1.15;
      scaleY = 0.88;
      legAngle1 = -0.65; // paws reach forward
      legAngle2 = 0.65;  // hind legs stretch back
      tailAngle = -0.55;
    } else if (state === 'fall') {
      scaleX = 0.92;
      scaleY = 1.08;
      legAngle1 = 0.35;
      legAngle2 = -0.35;
      tailAngle = 0.45;
    } else if (state === 'land') {
      scaleX = 1.25;
      scaleY = 0.78;
      bodyBob = 5;
    }

    ctx.scale(scaleX, scaleY);
    ctx.translate(0, bodyBob);

    // Ground Shadow
    ctx.fillStyle = 'rgba(60, 35, 20, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 22, 22 * scaleX, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. SLENDER TAIL (Caramel with chocolate tip)
    ctx.save();
    ctx.translate(-16, 5);
    ctx.rotate(-0.35 + tailAngle);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#856450';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-18, -14, -10, -28);
    ctx.stroke();
    // Chocolate tip
    ctx.strokeStyle = '#4a3325';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-13, -22);
    ctx.lineTo(-10, -28);
    ctx.stroke();
    ctx.restore();

    // 2. BACK LEGS
    ctx.save();
    ctx.translate(-10, 12);
    ctx.rotate(legAngle2);
    ctx.fillStyle = '#f0e5d8';
    SpriteRenderer.roundRect(ctx, -4, 0, 8, 14, 4);
    ctx.fill();
    // White paw tip
    ctx.fillStyle = '#ffffff';
    SpriteRenderer.roundRect(ctx, -4, 10, 8, 5, 2.5);
    ctx.fill();
    ctx.restore();

    // 3. ELEGANT SILKY CREAM BODY
    ctx.fillStyle = '#fdfbf7';
    ctx.beginPath();
    ctx.ellipse(0, 4, 20, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    // Soft cream body shading
    ctx.fillStyle = '#f4eae0';
    ctx.beginPath();
    ctx.ellipse(0, 8, 18, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pure White Chest
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(6, 4, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. FRONT LEGS (Caramel arms with crisp white mitten paws)
    ctx.save();
    ctx.translate(10, 12);
    ctx.rotate(legAngle1);
    ctx.fillStyle = '#a68772'; // Caramel arm
    SpriteRenderer.roundRect(ctx, -4, 0, 8, 14, 4);
    ctx.fill();
    // White mitten paw
    ctx.fillStyle = '#ffffff';
    SpriteRenderer.roundRect(ctx, -4, 10, 8, 5, 2.5);
    ctx.fill();
    ctx.restore();

    // 5. HEAD & EARS
    ctx.save();
    ctx.translate(11, -10);

    // EARS: Upright, pointed dark chocolate ears (#4a3325)
    // Back Ear
    ctx.save();
    ctx.translate(-8, -14);
    ctx.rotate(-0.18);
    ctx.fillStyle = '#4a3325';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-8, -17); ctx.lineTo(6, -7); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.moveTo(-1, -1); ctx.lineTo(-5, -13); ctx.lineTo(3, -6); ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Front Ear
    ctx.save();
    ctx.translate(6, -15);
    ctx.rotate(0.14);
    ctx.fillStyle = '#4a3325';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(5, -18); ctx.lineTo(13, -3); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.moveTo(2, -1); ctx.lineTo(6, -13); ctx.lineTo(10, -4); ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Cream Head Base
    ctx.fillStyle = '#fdfbf7';
    ctx.beginPath();
    ctx.ellipse(0, 0, 17, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Classic Siamese Face Mask (#6c4f3d)
    ctx.fillStyle = '#6c4f3d';
    ctx.beginPath();
    ctx.ellipse(6, 2, 11, 8.5, 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Dark Chocolate Nose (#2e1c12)
    ctx.fillStyle = '#2e1c12';
    ctx.beginPath();
    ctx.moveTo(11, 1.5); ctx.lineTo(14, 4.5); ctx.lineTo(8, 4.5); ctx.closePath();
    ctx.fill();

    // Cute mouth
    ctx.strokeStyle = '#23150d';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(8, 6.5, 3, 0, Math.PI); ctx.stroke();
    ctx.beginPath();
    ctx.arc(12, 6.5, 3, 0, Math.PI); ctx.stroke();

    // White Whiskers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(12, 3); ctx.lineTo(24, 1);
    ctx.moveTo(12, 6); ctx.lineTo(23, 7.5);
    ctx.stroke();

    // EYES: Radiant Sapphire Blue with Sparkling Highlights
    if (eyeBlink) {
      ctx.strokeStyle = '#23150d';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(4, -1, 4.5, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else {
      // Dark rim
      ctx.fillStyle = '#082f49';
      ctx.beginPath();
      ctx.ellipse(4, -1, 6.5, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Deep blue iris
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.ellipse(4, -1, 5.8, 6.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sky blue inner
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.ellipse(4, -1, 4.8, 5.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Slit pupil
      ctx.fillStyle = '#0c1a24';
      ctx.beginPath();
      ctx.ellipse(4.4, -1, 2.5, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Specular shine sparkles
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(2.5, -3, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.arc(5.5, 1.2, 1.2, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore(); // Head
    ctx.restore(); // Boncuk
  },

  /**
   * =========================================================================
   * MÜEZZA (Soldaki Kedi)
   * Size: ~58x50px (large, chubby, majestic fluff!)
   * Features:
   * - Chubby, fluffy smoky-ash grey fur (#657280)
   * - Giant lion-like chest mane with fluffy layered tufts
   * - Round chubby cheeks
   * - Intense, luminous golden-amber/yellow eyes (#eab308 & #fde047)
   * - Dark slate nose, cute pink mouth
   * - Huge plush bottle-brush grey tail
   * =========================================================================
   */
  drawMuezza(ctx, x, y, width = 58, height = 50, state = 'idle', facingRight = true, animTimer = 0, isHurt = false) {
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);

    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    if (isHurt && Math.floor(animTimer * 18) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }

    const t = animTimer;
    let bodyBob = 0;
    let legAngle1 = 0;
    let legAngle2 = 0;
    let tailAngle = Math.sin(t * 2.8) * 0.35;
    let eyeBlink = (Math.sin(t * 0.75 + 1.2) > 0.94);
    let scaleX = 1;
    let scaleY = 1;

    if (state === 'run') {
      bodyBob = Math.sin(t * 13) * 3.5;
      legAngle1 = Math.sin(t * 13) * 0.55;
      legAngle2 = -Math.sin(t * 13) * 0.55;
      tailAngle = Math.sin(t * 13) * 0.55;
    } else if (state === 'jump') {
      scaleX = 1.18;
      scaleY = 0.86;
      legAngle1 = -0.6;
      legAngle2 = 0.6;
      tailAngle = -0.65;
    } else if (state === 'fall') {
      scaleX = 0.94;
      scaleY = 1.1;
      legAngle1 = 0.3;
      legAngle2 = -0.3;
      tailAngle = 0.45;
    } else if (state === 'land') {
      scaleX = 1.32;
      scaleY = 0.74;
      bodyBob = 6;
    }

    ctx.scale(scaleX, scaleY);
    ctx.translate(0, bodyBob);

    // Floor shadow (wide fluffy cat shadow)
    ctx.fillStyle = 'rgba(30, 35, 45, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 23, 25 * scaleX, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. HUGE BOTTLE-BRUSH FLUFFY GREY TAIL
    ctx.save();
    ctx.translate(-18, 4);
    ctx.rotate(-0.35 + tailAngle);
    ctx.fillStyle = '#566270';
    ctx.beginPath();
    ctx.ellipse(-14, -14, 15, 20, -0.35, 0, Math.PI * 2);
    ctx.fill();
    // Tail fluff layers
    ctx.fillStyle = '#758290';
    ctx.beginPath();
    ctx.ellipse(-15, -18, 10, 14, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. HIND LEGS (Chubby grey paws)
    ctx.save();
    ctx.translate(-11, 12);
    ctx.rotate(legAngle2);
    ctx.fillStyle = '#4c5763';
    SpriteRenderer.roundRect(ctx, -6, 0, 11, 14, 5);
    ctx.fill();
    ctx.restore();

    // 3. CHUBBY ASH-GREY BODY & LION-LIKE MANE
    ctx.fillStyle = '#657280';
    ctx.beginPath();
    ctx.ellipse(0, 5, 24, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lighter smoke grey belly fluff
    ctx.fillStyle = '#7f8c9b';
    ctx.beginPath();
    ctx.ellipse(3, 7, 18, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fluffy chest mane bib tufts
    ctx.fillStyle = '#94a2b0';
    ctx.beginPath();
    ctx.arc(8, 2, 9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 8, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.arc(-7, 4, 8, 0, Math.PI * 2); ctx.fill();

    // 4. FRONT LEGS (Chubby grey paws)
    ctx.save();
    ctx.translate(11, 12);
    ctx.rotate(legAngle1);
    ctx.fillStyle = '#4c5763';
    SpriteRenderer.roundRect(ctx, -5.5, 0, 11, 15, 5);
    ctx.fill();
    ctx.restore();

    // 5. ROUND CHUBBY HEAD & CHEEKS
    ctx.save();
    ctx.translate(12, -8);

    // EARS: Soft tufted ears
    // Back Ear
    ctx.save();
    ctx.translate(-7, -13);
    ctx.rotate(-0.16);
    ctx.fillStyle = '#47515c';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-8, -14); ctx.lineTo(5, -6); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.moveTo(-1, -1); ctx.lineTo(-5, -10); ctx.lineTo(2, -5); ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Front Ear
    ctx.save();
    ctx.translate(6, -13);
    ctx.rotate(0.18);
    ctx.fillStyle = '#47515c';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(4, -15); ctx.lineTo(12, -4); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.moveTo(2, -1); ctx.lineTo(5, -11); ctx.lineTo(9, -4); ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Round Head
    ctx.fillStyle = '#657280';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    // Chubby Cheek Tufts (British/Scottish Longhair signature roundness!)
    ctx.fillStyle = '#7a8795';
    ctx.beginPath();
    ctx.arc(10, 5, 8.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.arc(-6, 6, 8, 0, Math.PI * 2); ctx.fill();

    // Dark Slate Grey Nose (#262e36)
    ctx.fillStyle = '#262e36';
    ctx.beginPath();
    ctx.moveTo(11, 3); ctx.lineTo(14.5, 6); ctx.lineTo(9.5, 6); ctx.closePath();
    ctx.fill();

    // Smiling Muzzle
    ctx.strokeStyle = '#1b2228';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(9.5, 8.5, 3.5, 0, Math.PI); ctx.stroke();
    ctx.beginPath();
    ctx.arc(14.5, 8.5, 3.5, 0, Math.PI); ctx.stroke();

    // Whiskers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(14, 5); ctx.lineTo(26, 2.5);
    ctx.moveTo(14, 8); ctx.lineTo(25, 9.5);
    ctx.stroke();

    // EYES: Luminous Glowing Amber-Yellow Eyes!
    if (eyeBlink) {
      ctx.strokeStyle = '#1b2228';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(5, 0, 5, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else {
      // Dark socket
      ctx.fillStyle = '#1b2228';
      ctx.beginPath();
      ctx.ellipse(5, 0, 7, 7.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Deep amber ring
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(5, 0, 6.2, 6.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bright golden yellow
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.ellipse(5, 0, 5.2, 5.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(5.5, 0, 2.8, 5.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Double sparkles
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(3.5, -2.8, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.arc(7, 1.4, 1.2, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore(); // Head
    ctx.restore(); // Müezza
  },

  /**
   * =========================================================================
   * HUMAN HERO – Delegates to High-Craft Layered Storybook HumanRenderer
   * Supports full customization object (or legacy 'girl'/'boy' gender string)
   * =========================================================================
   */
  drawHuman(ctx, x, y, width = 52, height = 74, state = 'idle', facingRight = true, animTimer = 0, isHurt = false, heroConfigOrGender = null) {
    let config = heroConfigOrGender;
    if (typeof heroConfigOrGender === 'string') {
      config = {
        gender: heroConfigOrGender,
        hairStyle: heroConfigOrGender === 'boy' ? 'messy_short' : 'long_wavy',
        top: heroConfigOrGender === 'boy' ? 'hoodie_mint' : 'blouse_blossom',
        bottom: heroConfigOrGender === 'boy' ? 'shorts_cozy' : 'skirt_pleated',
        shoes: heroConfigOrGender === 'boy' ? 'sneakers' : 'mary_janes',
        hairAcc: heroConfigOrGender === 'boy' ? 'none' : 'flower_clip'
      };
    }
    if (window.HumanRenderer) {
      window.HumanRenderer.draw(ctx, x, y, width, height, state, facingRight, animTimer, isHurt, config);
    }
  },

  /**
   * =========================================================================
   * DESTINATION CAT GAZEBO / TOWER (Clear, Beautiful Destination!)
   * Shows the waiting partner cat welcoming the player with flowers & signpost
   * =========================================================================
   */
  drawDestination(ctx, x, y, partnerCat = 'boncuk', animTimer = 0) {
    ctx.save();
    ctx.translate(x, y);

    // 1. Sky Light Beacon (Magical vertical beam showing destination from afar)
    const beamGrad = ctx.createLinearGradient(40, -140, 40, 0);
    beamGrad.addColorStop(0, 'rgba(253, 224, 71, 0)');
    beamGrad.addColorStop(0.5, 'rgba(253, 224, 71, 0.15)');
    beamGrad.addColorStop(1, 'rgba(253, 224, 71, 0.35)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(15, -140, 50, 140);

    // 2. Wooden Pergola / Gazebo Structure
    // Pillars
    ctx.fillStyle = '#85583b';
    ctx.fillRect(10, -50, 8, 50);
    ctx.fillRect(62, -50, 8, 50);

    // Wooden Balcony Floor
    ctx.fillStyle = '#a6724d';
    SpriteRenderer.roundRect(ctx, 4, -4, 72, 8, 3);
    ctx.fill();

    // Pastel Shingled Roof
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.moveTo(40, -78);
    ctx.lineTo(82, -50);
    ctx.lineTo(-2, -50);
    ctx.closePath();
    ctx.fill();
    // Roof trim
    ctx.strokeStyle = '#fbcfe8';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Golden Heart Weathervane at top
    ctx.fillStyle = '#facc15';
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('💖', 40, -82);

    // Hanging Fairy Lanterns
    const sway = Math.sin(animTimer * 3) * 3;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(8, -42 + sway, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.arc(72, -42 - sway, 4, 0, Math.PI * 2); ctx.fill();

    // 3. The Waiting Partner Cat Standing Proudly!
    const partnerX = 12;
    const partnerY = -42;
    if (partnerCat === 'both') {
      // Hem Müezza hem Boncuk yan yana kurtarılmayı bekler!
      this.drawMuezza(ctx, partnerX - 6, partnerY + 4, 44, 38, 'idle', true, animTimer, false);
      this.drawBoncuk(ctx, partnerX + 22, partnerY + 4, 42, 36, 'idle', false, animTimer, false);
    } else if (partnerCat === 'boncuk') {
      this.drawBoncuk(ctx, partnerX, partnerY, 52, 44, 'idle', false, animTimer, false);
    } else {
      this.drawMuezza(ctx, partnerX, partnerY, 54, 46, 'idle', false, animTimer, false);
    }

    // 4. Floating Animated Calling Bubble
    const bubbleBob = Math.sin(animTimer * 4) * 4;
    const bubbleY = -62 + bubbleBob;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 2;
    SpriteRenderer.roundRect(ctx, 4, bubbleY - 14, 72, 22, 11);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#be185d';
    ctx.font = 'bold 11px Quicksand, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(partnerCat === 'both' ? 'BİZİ KURTAR! 🐾' : 'BURADAYIM! 💕', 40, bubbleY + 2);
    ctx.font = 'bold 11px Quicksand, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BURADAYIM! 💕', 40, bubbleY + 2);

    // Floating little love hearts
    for (let i = 0; i < 3; i++) {
      const hOffset = (animTimer * 20 + i * 25) % 40;
      const hAlpha = 1 - (hOffset / 40);
      ctx.fillStyle = `rgba(244, 114, 182, ${hAlpha})`;
      ctx.font = '10px serif';
      ctx.fillText('💖', 30 + i * 12, bubbleY - 18 - hOffset);
    }

    ctx.restore();
  },

  /**
   * =========================================================================
   * START SIGNPOST ("BAŞLANGIÇ" / "START")
   * =========================================================================
   */
  drawStartSign(ctx, x, y) {
    ctx.save();
    // Post
    ctx.fillStyle = '#7c5339';
    ctx.fillRect(x + 12, y - 28, 6, 28);
    // Board
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    SpriteRenderer.roundRect(ctx, x - 10, y - 48, 50, 22, 6);
    ctx.fill();
    ctx.stroke();
    // Text
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 10px Quicksand, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BAŞLA 🐾', x + 15, y - 33);
    ctx.restore();
  },

  /**
   * =========================================================================
   * LUSH PLATFORMS WITH 3D PASTEL GRASS & FLOWERS
   * =========================================================================
   */
  drawPlatform(ctx, x, y, width, height, theme) {
    ctx.save();

    // 1. Platform Body (Carved warm stone or earth)
    const bodyGrad = ctx.createLinearGradient(x, y, x, y + height);
    bodyGrad.addColorStop(0, theme.platTop);
    bodyGrad.addColorStop(1, theme.platBottom);
    ctx.fillStyle = bodyGrad;
    SpriteRenderer.roundRect(ctx, x, y, width, height, 6);
    ctx.fill();

    // Subtle stone/wood inner brick joints
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1.5;
    for (let px = x + 32; px < x + width - 10; px += 36) {
      ctx.beginPath();
      ctx.moveTo(px, y + 8);
      ctx.lineTo(px, y + height - 2);
      ctx.stroke();
    }

    // 2. Lush Top Grass Layer
    ctx.fillStyle = theme.grassColor;
    SpriteRenderer.roundRect(ctx, x - 2, y - 2, width + 4, 8, 4);
    ctx.fill();

    // Grass blades & decorative flowers
    for (let gx = x + 4; gx < x + width - 6; gx += 14) {
      // Grass tufts
      ctx.strokeStyle = theme.grassBlade;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gx, y);
      ctx.lineTo(gx - 2, y - 4);
      ctx.moveTo(gx + 3, y);
      ctx.lineTo(gx + 4, y - 5);
      ctx.stroke();

      // Cute little flower blossoms
      if ((gx % 28) < 14) {
        ctx.fillStyle = (gx % 56 === 0) ? '#f472b6' : '#fde047';
        ctx.beginPath();
        ctx.arc(gx + 2, y - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Hanging Ivy Vines from platform bottom
    if (width > 50) {
      ctx.strokeStyle = theme.vineColor;
      ctx.lineWidth = 2;
      for (let vx = x + 16; vx < x + width - 16; vx += 40) {
        ctx.beginPath();
        ctx.moveTo(vx, y + height);
        ctx.quadraticCurveTo(vx + 4, y + height + 8, vx, y + height + 14);
        ctx.stroke();
        // Tiny ivy leaf
        ctx.fillStyle = theme.grassBlade;
        ctx.beginPath();
        ctx.ellipse(vx + 2, y + height + 10, 2.5, 4, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  },

  /**
   * =========================================================================
   * RECOGNIZABLE OBSTACLES: Spikes, Rolling Balls, Fire, Water, Lasers
   * =========================================================================
   */

  // 1. Floor Spikes (Crystal / Wooden thorns)
  drawSpikes(ctx, x, y, width, height) {
    ctx.save();
    const count = Math.max(2, Math.floor(width / 16));
    const step = width / count;

    for (let i = 0; i < count; i++) {
      const sx = x + i * step;
      // Spike gradient
      const spkGrad = ctx.createLinearGradient(sx, y + height, sx + step / 2, y);
      spkGrad.addColorStop(0, '#e11d48');
      spkGrad.addColorStop(1, '#f43f5e');
      ctx.fillStyle = spkGrad;

      ctx.beginPath();
      ctx.moveTo(sx, y + height);
      ctx.lineTo(sx + step / 2, y + 2);
      ctx.lineTo(sx + step, y + height);
      ctx.closePath();
      ctx.fill();

      // Sharp white specular gleam
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx + step / 2, y + 4);
      ctx.lineTo(sx + step * 0.35, y + height * 0.7);
      ctx.stroke();
    }
    ctx.restore();
  },

  // 2. Rolling Yarn Ball
  drawRollingBall(ctx, x, y, radius, angle = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Wool ball body
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();

    // Wool yarn wrapped strands
    ctx.strokeStyle = '#d8b4fe';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.72, 0.4, Math.PI * 1.6); ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.42, 1.8, Math.PI * 2.3); ctx.stroke();

    // Cute ribbon bow
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(radius * 0.75, 0, 3.5, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  },

  // 3. Fire Trap (Stone Hearth vent with leaping pastel flames)
  drawFireTrap(ctx, x, y, width, height, isActive = true, animTimer = 0) {
    ctx.save();
    // Metal/Stone floor hearth vent
    ctx.fillStyle = '#44403c';
    SpriteRenderer.roundRect(ctx, x, y + height - 8, width, 8, 3);
    ctx.fill();

    if (isActive) {
      const flicker = Math.sin(animTimer * 22) * 4;
      const flameH = height * 0.95 + flicker;

      // Outer pastel orange flame
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(x + 3, y + height - 5);
      ctx.quadraticCurveTo(x + width * 0.2, y + height - flameH * 0.7, x + width * 0.5, y + height - flameH);
      ctx.quadraticCurveTo(x + width * 0.8, y + height - flameH * 0.7, x + width - 3, y + height - 5);
      ctx.closePath();
      ctx.fill();

      // Inner hot yellow core
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(x + 7, y + height - 5);
      ctx.quadraticCurveTo(x + width * 0.35, y + height - flameH * 0.6, x + width * 0.5, y + height - flameH * 0.82);
      ctx.quadraticCurveTo(x + width * 0.65, y + height - flameH * 0.6, x + width - 7, y + height - 5);
      ctx.closePath();
      ctx.fill();
    } else {
      // Warning embers
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(x + width * 0.5, y + height - 4, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  // 4. Sparkling Water Pond & Stepping Stones
  drawWater(ctx, x, y, width, height, animTimer = 0) {
    ctx.save();
    // Water pond gradient
    const grad = ctx.createLinearGradient(0, y + 6, 0, y + height);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(1, '#0284c7');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y + 6, width, height - 6);

    // Animated surface waves
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.moveTo(x, y + 6);
    for (let px = 0; px <= width; px += 10) {
      const wave = Math.sin(animTimer * 4 + (x + px) * 0.12) * 3;
      ctx.lineTo(x + px, y + 6 + wave);
    }
    ctx.lineTo(x + width, y + 12);
    ctx.lineTo(x, y + 12);
    ctx.closePath();
    ctx.fill();

    // Floating water lily pads
    for (let lx = x + 24; lx < x + width - 20; lx += 45) {
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.ellipse(lx, y + 9, 8, 4, 0, 0, Math.PI * 1.8);
      ctx.lineTo(lx, y + 9);
      ctx.closePath();
      ctx.fill();
      // Lotus pink petal
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(lx, y + 7, 2.5, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore();
  },

  // 5. Floating Cloud / Wooden Moving Platforms
  drawMovingPlatform(ctx, x, y, width, height, theme = 'wood') {
    ctx.save();
    if (theme === 'cloud') {
      ctx.fillStyle = '#ffffff';
      SpriteRenderer.roundRect(ctx, x, y, width, height, height / 2); ctx.fill();
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.arc(x + width * 0.25, y + 2, 7, 0, Math.PI * 2);
      ctx.arc(x + width * 0.75, y + 2, 8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#92400e';
      SpriteRenderer.roundRect(ctx, x, y, width, height, 4); ctx.fill();
      ctx.fillStyle = '#b45309';
      SpriteRenderer.roundRect(ctx, x, y, width, height * 0.45, 3); ctx.fill();
      // Golden corner brackets
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x + 2, y + 2, 5, 5);
      ctx.fillRect(x + width - 7, y + 2, 5, 5);
    }
    ctx.restore();
  },

  // 6. Magic Laser Crystal
  drawLaser(ctx, x, y, width, height, isActive = true, isWarning = false) {
    ctx.save();
    ctx.fillStyle = '#334155';
    SpriteRenderer.roundRect(ctx, x - 4, y - 6, width + 8, 8, 3); ctx.fill();
    SpriteRenderer.roundRect(ctx, x - 4, y + height - 2, width + 8, 8, 3); ctx.fill();

    if (isActive) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fillRect(x - 5, y + 2, width + 10, height - 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x, y + 2, width, height - 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + width * 0.3, y + 2, width * 0.4, height - 4);
    } else if (isWarning) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x + width / 2, y + 2);
      ctx.lineTo(x + width / 2, y + height - 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  },

  // 7. Swinging Bell / Ball Pendulum
  drawSwingingPendulum(ctx, pivotX, pivotY, angle, length, radius) {
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(angle);

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(0, length); ctx.stroke();

    ctx.translate(0, length);
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(-radius * 0.3, -radius * 0.3, radius * 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  },

  /**
   * =========================================================================
   * COLLECTIBLES (Food, Toilet Paper Rolls, Colorful Socks)
   * =========================================================================
   */
  drawFood(ctx, x, y, width = 28, height = 28, type = 'tuna', animTimer = 0) {
    ctx.save();
    const bob = Math.sin(animTimer * 4 + x) * 3;
    ctx.translate(x + width / 2, y + height / 2 + bob);

    // Glowing halo
    ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();

    if (type === 'fish') {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-10, 0); ctx.lineTo(-17, -7); ctx.lineTo(-17, 7); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(7, -2, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(7.5, -2, 1.1, 0, Math.PI * 2); ctx.fill();
    } else {
      // Tuna can
      ctx.fillStyle = '#94a3b8';
      SpriteRenderer.roundRect(ctx, -13, -9, 26, 18, 4); ctx.fill();
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(-13, -4, 26, 9);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0.5, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-13, -9, 26, 2.5);
    }
    ctx.restore();
  },

  drawToiletPaper(ctx, x, y, width = 28, height = 28, animTimer = 0) {
    ctx.save();
    const bob = Math.sin(animTimer * 3.5) * 3;
    ctx.translate(x + width / 2, y + height / 2 + bob);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    SpriteRenderer.roundRect(ctx, -11, -11, 22, 22, 5); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.5, 4.5, 0, 0, Math.PI * 2); ctx.fill();

    // Trailing playful ribbon sheet
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(9, 7);
    ctx.quadraticCurveTo(16, 13, 21, 10);
    ctx.lineTo(19, 16);
    ctx.quadraticCurveTo(14, 17, 9, 11);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  },

  drawSock(ctx, x, y, width = 28, height = 28, animTimer = 0) {
    ctx.save();
    const bob = Math.sin(animTimer * 3.5) * 3;
    ctx.translate(x + width / 2, y + height / 2 + bob);

    ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();

    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.strokeStyle = '#f472b6';
    ctx.beginPath();
    ctx.moveTo(4, -12); ctx.lineTo(4, 2); ctx.lineTo(-8, 8); ctx.stroke();

    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(4, -6); ctx.lineTo(4, -3);
    ctx.moveTo(1, 4); ctx.lineTo(-4, 6.5);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    SpriteRenderer.roundRect(ctx, 0, -14, 8, 4, 2); ctx.fill();

    ctx.restore();
  },

  /**
   * =========================================================================
   * REUNION ANIMATION SCENE (Victory Screen)
   * =========================================================================
   */
  drawReunionScene(ctx, width, height, animTimer = 0) {
    ctx.clearRect(0, 0, width, height);
    const centerX = width / 2;
    const groundY = height * 0.72;

    ctx.fillStyle = 'rgba(100, 60, 40, 0.12)';
    ctx.beginPath();
    ctx.ellipse(centerX, groundY + 12, 95, 12, 0, 0, Math.PI * 2); ctx.fill();

    // Müezza on left
    this.drawMuezza(ctx, centerX - 54, groundY - 28, 54, 46, 'idle', true, animTimer, false);

    // Boncuk on right
    this.drawBoncuk(ctx, centerX + 10, groundY - 28, 52, 44, 'idle', false, animTimer, false);

    // Heart erupting between them
    const heartScale = 1 + Math.sin(animTimer * 6) * 0.25;
    ctx.save();
    ctx.translate(centerX, groundY - 36);
    ctx.scale(heartScale, heartScale);
    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    ctx.fillText('💖', 0, 0);
    ctx.restore();

    // Floating sparkles
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2 + animTimer * 2;
      const dist = 48 + Math.sin(animTimer * 4 + i) * 10;
      const sx = centerX + Math.cos(angle) * dist;
      const sy = groundY - 30 + Math.sin(angle) * (dist * 0.55);
      ctx.fillStyle = i % 2 === 0 ? '#facc15' : '#f472b6';
      ctx.font = '14px serif';
      ctx.fillText(i % 2 === 0 ? '✨' : '🌸', sx, sy);
    }
  },

  drawReunionBothScene(ctx, width, height, animTimer = 0, heroConfigOrGender = null, heroName = 'Kahraman', reunionElapsed = 2.0) {
    ctx.clearRect(0, 0, width, height);
    const centerX = width / 2;
    const groundY = height * 0.84;

    // Warm sunlit fairy-tale meadow glow backdrop
    const bgGrad = ctx.createRadialGradient(centerX, height * 0.45, 12, centerX, height * 0.55, width * 0.55);
    bgGrad.addColorStop(0, 'rgba(255, 250, 240, 0.95)');
    bgGrad.addColorStop(0.6, 'rgba(252, 231, 243, 0.55)');
    bgGrad.addColorStop(1, 'rgba(254, 243, 199, 0.25)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Soft pastel grass mound shadow
    ctx.fillStyle = 'rgba(134, 239, 172, 0.35)';
    ctx.beginPath();
    ctx.ellipse(centerX, groundY + 4, width * 0.43, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Story animation progression: 0..1.1s cats eagerly run in -> >=1.1s warm embrace!
    const progress = Math.min(1, Math.max(0, reunionElapsed / 1.1));
    const ease = 1 - Math.pow(1 - progress, 3);
    const isHugging = progress >= 0.98;
    const catState = isHugging ? 'idle' : 'run';
    const heroState = isHugging ? 'hug' : 'celebrate';

    // Cats converge smoothly from left & right toward the hero!
    const muezzaStartX = centerX - 135;
    const muezzaEndX = centerX - 66;
    const boncukStartX = centerX + 86;
    const boncukEndX = centerX + 18;

    const muezzaX = muezzaStartX + (muezzaEndX - muezzaStartX) * ease;
    const boncukX = boncukStartX + (boncukEndX - boncukStartX) * ease;
    const cuddleBob = isHugging ? Math.sin(animTimer * 4.5) * 2.2 : 0;

    // 1. Center: The Custom Human Child Hero (Celebrating -> Hugging!)
    this.drawHuman(ctx, centerX - 34, groundY - 94, 68, 94, heroState, true, animTimer, false, heroConfigOrGender);

    // 2. Left: Müezza snuggling up lovingly
    this.drawMuezza(ctx, muezzaX, groundY - 46 + cuddleBob, 52, 44, catState, true, animTimer, false);

    // 3. Right: Boncuk nuzzling warmly
    this.drawBoncuk(ctx, boncukX, groundY - 44 - cuddleBob, 50, 42, catState, false, animTimer, false);

    // 4. Rising love hearts & fairy sparkles during embrace
    const heartScale = 1 + Math.sin(animTimer * 5.5) * 0.2;
    ctx.save();
    ctx.translate(centerX, groundY - 98);
    ctx.scale(heartScale, heartScale);
    ctx.font = '22px serif';
    ctx.textAlign = 'center';
    ctx.fillText('💖', 0, 0);
    ctx.restore();

    // Little purring hearts beside both cats
    if (isHugging) {
      const bob1 = Math.sin(animTimer * 4) * 4;
      const bob2 = Math.cos(animTimer * 4) * 4;
      ctx.font = '14px serif';
      ctx.textAlign = 'center';
      ctx.fillText('💕', muezzaX + 26, groundY - 52 + bob1);
      ctx.fillText('💕', boncukX + 24, groundY - 52 + bob2);
    }

    // Fairy-tale floating petals & stars framing the trio cleanly
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + animTimer * 1.5;
      const rx = 104 + Math.sin(animTimer * 3 + i) * 8;
      const ry = 46 + Math.cos(animTimer * 2.5 + i) * 6;
      const sx = centerX + Math.cos(angle) * rx;
      const sy = groundY - 56 + Math.sin(angle) * ry;
      ctx.fillStyle = i % 2 === 0 ? '#facc15' : '#ec4899';
      ctx.font = '12px serif';
      ctx.textAlign = 'center';
      ctx.fillText(i % 3 === 0 ? '✨' : (i % 3 === 1 ? '🌸' : '🐾'), sx, sy);
    }
  }
};

window.SpriteRenderer = SpriteRenderer;
