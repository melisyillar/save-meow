/**
 * BONCUK & MÜEZZA – save.meow
 * High-Craft Layered 2D Storybook Child Character Renderer
 *
 * - Master design space: 200 x 280 units (origin at upper-waist (0,0), feet at y=+122)
 * - Soft pastel fairy-tale storybook illustration style with warm colored outlines,
 *   multi-stop gradients, organic cubic Bezier hair locks, clear neck & child proportions.
 * - Zero cross-origin / getImageData calls (100% file:/// safe).
 * - Identical data model drives live preview, character card, in-game platforming,
 *   and victory hugging scenes.
 */

(function () {
  function rr(ctx, x, y, w, h, r) {
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      return;
    }
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }

  // =========================================================================
  // 1. ARTICULATED POSE & ANIMATION ENGINE (All 8 Required States + Land)
  // =========================================================================
  function computePose(state, animTimer, isHurt) {
    const t = animTimer || 0;
    const pose = {
      bodyBob: 0,
      torsoTilt: 0,
      headTilt: 0,
      squashX: 1,
      squashY: 1,
      // Joint angles in radians (down=(0,+1); +angle swings LEFT/-X, -angle swings RIGHT/+X)
      backHip: -0.05,
      backKnee: 0.04,
      frontHip: 0.06,
      frontKnee: 0.03,
      backShoulder: -0.16,
      backElbow: -0.14,
      frontShoulder: 0.16,
      frontElbow: -0.18,
      hairSway: Math.sin(t * 2.2) * 0.06,
      skirtSway: Math.sin(t * 2.2) * 2,
      eyeMode: 'normal',   // 'normal', 'blink', 'happy', 'hurt', 'wide'
      mouthMode: 'smile',  // 'smile', 'happy_open', 'surprised', 'hurt', 'soft'
      showSparkles: false,
      showHearts: false,
      hugPose: false
    };

    // Natural periodic blink (~every 3.5s)
    const blinkCycle = t % 3.6;
    if (blinkCycle > 3.45) {
      pose.eyeMode = 'blink';
    }

    if (state === 'walk') {
      const w = t * 7.8;
      const s = Math.sin(w);
      const c = Math.cos(w);
      pose.bodyBob = -Math.abs(s) * 4.5 + 1.5;
      pose.torsoTilt = 0.05;
      pose.headTilt = 0.02 + s * 0.02;
      pose.frontHip = s * 0.45;
      pose.frontKnee = Math.max(0, -c * 0.50) + 0.08;
      pose.backHip = -s * 0.45;
      pose.backKnee = Math.max(0, c * 0.50) + 0.08;
      pose.frontShoulder = -s * 0.40 + 0.08;
      pose.frontElbow = -0.26 - Math.max(0, s * 0.22);
      pose.backShoulder = s * 0.40 - 0.08;
      pose.backElbow = -0.26 - Math.max(0, -s * 0.22);
      pose.hairSway = 0.14 + Math.sin(w - 0.8) * 0.10;
      pose.skirtSway = -3 - s * 4;
    } else if (state === 'run') {
      const r = t * 13.5;
      const s = Math.sin(r);
      const c = Math.cos(r);
      pose.bodyBob = -Math.abs(s) * 7.5 + 2.5;
      pose.torsoTilt = 0.14;
      pose.headTilt = -0.04 + s * 0.03;
      pose.frontHip = s * 0.78;
      pose.frontKnee = Math.max(0.05, -c * 0.90) + 0.14;
      pose.backHip = -s * 0.78;
      pose.backKnee = Math.max(0.05, c * 0.90) + 0.14;
      pose.frontShoulder = -s * 0.75 + 0.1;
      pose.frontElbow = -0.65 - Math.max(0, s * 0.30);
      pose.backShoulder = s * 0.75 - 0.1;
      pose.backElbow = -0.65 - Math.max(0, -s * 0.30);
      pose.hairSway = 0.34 + Math.sin(r - 0.9) * 0.16;
      pose.skirtSway = -7 - s * 6;
      pose.mouthMode = 'happy_open';
    } else if (state === 'jump') {
      pose.squashX = 0.95;
      pose.squashY = 1.06;
      pose.bodyBob = -4;
      pose.torsoTilt = 0.05;
      pose.headTilt = -0.05;
      pose.frontHip = -0.52;
      pose.frontKnee = 0.78;
      pose.backHip = 0.34;
      pose.backKnee = 0.50;
      // Arms raised outward & upward cleanly (never crossing face!)
      pose.frontShoulder = 1.85;
      pose.frontElbow = 0.35;
      pose.backShoulder = -2.15;
      pose.backElbow = -0.30;
      pose.hairSway = 0.28 + Math.sin(t * 8) * 0.05;
      pose.skirtSway = -5;
      pose.eyeMode = 'wide';
      pose.mouthMode = 'happy_open';
    } else if (state === 'fall') {
      pose.squashX = 1.03;
      pose.squashY = 0.97;
      pose.bodyBob = 0;
      pose.torsoTilt = -0.04;
      pose.headTilt = 0.06;
      pose.frontHip = -0.22;
      pose.frontKnee = 0.42;
      pose.backHip = 0.22;
      pose.backKnee = 0.36;
      // Both arms out wide for balance
      pose.frontShoulder = 1.38 + Math.sin(t * 10) * 0.14;
      pose.frontElbow = 0.18;
      pose.backShoulder = -1.32 - Math.sin(t * 10) * 0.14;
      pose.backElbow = -0.18;
      pose.hairSway = -0.30 + Math.sin(t * 9) * 0.10;
      pose.skirtSway = 5;
      pose.eyeMode = 'wide';
      pose.mouthMode = 'surprised';
    } else if (state === 'land') {
      pose.squashX = 1.12;
      pose.squashY = 0.89;
      pose.bodyBob = 8;
      pose.torsoTilt = 0.08;
      pose.frontHip = -0.25;
      pose.frontKnee = 0.48;
      pose.backHip = 0.14;
      pose.backKnee = 0.40;
      pose.frontShoulder = 0.55;
      pose.backShoulder = -0.52;
      pose.hairSway = 0.12;
    } else if (state === 'hurt') {
      const shake = Math.sin(t * 28) * 0.08;
      pose.torsoTilt = -0.16 + shake;
      pose.headTilt = -0.12;
      pose.bodyBob = -2;
      pose.frontHip = -0.20;
      pose.frontKnee = 0.35;
      pose.backHip = 0.24;
      pose.backKnee = 0.35;
      pose.frontShoulder = 0.95;
      pose.frontElbow = 0.45;
      pose.backShoulder = -0.85;
      pose.backElbow = -0.4;
      pose.hairSway = -0.24;
      pose.eyeMode = 'hurt';
      pose.mouthMode = 'hurt';
    } else if (state === 'celebrate') {
      const hop = Math.abs(Math.sin(t * 7.2));
      pose.bodyBob = -hop * 12;
      pose.torsoTilt = Math.sin(t * 7.2) * 0.05;
      pose.headTilt = -0.04 + Math.sin(t * 7.2) * 0.06;
      pose.frontHip = -hop * 0.22 + 0.06;
      pose.frontKnee = hop * 0.42;
      pose.backHip = hop * 0.20 - 0.06;
      pose.backKnee = hop * 0.36;
      // Joyful V-arms raised high & wide outward (completely clear of face!)
      pose.frontShoulder = 2.45 - Math.sin(t * 14) * 0.14;
      pose.frontElbow = 0.22;
      pose.backShoulder = -2.42 + Math.sin(t * 14) * 0.14;
      pose.backElbow = -0.22;
      pose.hairSway = Math.sin(t * 7.2) * 0.20;
      pose.eyeMode = 'happy';
      pose.mouthMode = 'happy_open';
      pose.showSparkles = true;
    } else if (state === 'hug') {
      const sway = Math.sin(t * 3.5);
      pose.hugPose = true;
      pose.bodyBob = 11 + sway * 2.0;
      pose.torsoTilt = 0.07 + sway * 0.03;
      pose.headTilt = 0.08 + sway * 0.04;
      // Sweet warm half-crouch welcoming both Boncuk & Müezza!
      pose.frontHip = -0.34;
      pose.frontKnee = 0.66;
      pose.backHip = -0.18;
      pose.backKnee = 0.54;
      // Both arms embracing downward & outward toward both cats!
      pose.frontShoulder = 0.55 + sway * 0.08;
      pose.frontElbow = -0.35;
      pose.backShoulder = -0.68 - sway * 0.08;
      pose.backElbow = -0.32;
      pose.hairSway = 0.10 + sway * 0.05;
      pose.eyeMode = 'happy';
      pose.mouthMode = 'smile';
      pose.showHearts = true;
    } else {
      // Idle: gentle natural stance & living breathing
      const breath = Math.sin(t * 2.4);
      pose.bodyBob = breath * 1.8;
      pose.torsoTilt = Math.sin(t * 1.2) * 0.014;
      pose.headTilt = Math.sin(t * 1.4 + 0.5) * 0.025;
      pose.frontShoulder = 0.16 + breath * 0.03;
      pose.frontElbow = -0.14 + breath * 0.02;
      pose.backShoulder = -0.14 - breath * 0.03;
      pose.backElbow = -0.14;
      pose.hairSway = Math.sin(t * 2.0) * 0.07;
    }

    if (isHurt && state !== 'hurt') {
      pose.eyeMode = 'hurt';
      pose.mouthMode = 'hurt';
    }

    return pose;
  }

  // =========================================================================
  // 2. HELPER: RESOLVE PALETTES FROM WARDROBE SYSTEM
  // =========================================================================
  function resolveConfig(heroConfig) {
    const WS = window.WardrobeSystem;
    const base = WS ? WS.getDefaultHeroConfig() : {
      name: 'Maya', gender: 'girl', skinTone: 'peach', hairStyle: 'long_wavy',
      hairColor: 'brown', eyeColor: 'brown', eyeShape: 'classic', eyebrowShape: 'soft',
      top: 'blouse_blossom', bottom: 'skirt_pleated', outfit: 'none',
      shoes: 'mary_janes', hairAcc: 'flower_clip', hat: 'none', glasses: 'none', neckAcc: 'none'
    };
    const merged = { ...base, ...(heroConfig || {}) };
    const g = merged.gender === 'boy' ? 'boy' : 'girl';
    const gDef = WS ? WS.getGenderDefaults(g) : base;

    // Defense-in-depth: strictly prevent incompatible gender items from ever drawing!
    if (WS) {
      if (!WS.isSlotValueAllowedForGender('hairStyle', merged.hairStyle, g)) merged.hairStyle = gDef.hairStyle;
      if (!WS.isSlotValueAllowedForGender('top', merged.top, g)) merged.top = gDef.top;
      if (!WS.isSlotValueAllowedForGender('bottom', merged.bottom, g)) merged.bottom = gDef.bottom;
      if (!WS.isSlotValueAllowedForGender('outfit', merged.outfit, g)) merged.outfit = 'none';
      if (!WS.isSlotValueAllowedForGender('shoes', merged.shoes, g)) merged.shoes = gDef.shoes;
      if (!WS.isSlotValueAllowedForGender('hairAcc', merged.hairAcc, g)) merged.hairAcc = 'none';
      if (!WS.isSlotValueAllowedForGender('hat', merged.hat, g)) merged.hat = 'none';
      if (!WS.isSlotValueAllowedForGender('glasses', merged.glasses, g)) merged.glasses = 'none';
      if (!WS.isSlotValueAllowedForGender('neckAcc', merged.neckAcc, g)) merged.neckAcc = 'none';
    }
    if (g === 'boy') merged.hairAcc = 'none';

    const skin = WS ? WS.getPalette(WS.SKIN_TONES, merged.skinTone) : { base: '#fad2b6', shadow: '#dfa27f', blush: '#f28ca6', outline: '#6e4532' };
    const hair = WS ? WS.getPalette(WS.HAIR_COLORS, merged.hairColor) : { base: '#7c4f33', light: '#a6714d', dark: '#54331f', outline: '#3b2214' };
    const eye = WS ? WS.getPalette(WS.EYE_COLORS, merged.eyeColor) : { deep: '#3f210e', mid: '#784624', glow: '#b87a46' };
    return { cfg: merged, skin, hair, eye };
  }

  // =========================================================================
  // 3. BACK CAPE / WINGS / HOOD (Layer behind hair & body)
  // =========================================================================
  function drawBackGarmentExtras(ctx, cfg, pose, animTimer) {
    const sway = pose.hairSway * 26;

    // Level 10 Special Outfit Back: Fairy Wings (Girl) vs Woodland Ranger Cape (Boy)!
    if (cfg.outfit === 'outfit_fairy_garden' && cfg.gender === 'boy') {
      // Flowing woodland leaf-green ranger cloak behind boy!
      ctx.save();
      const rg = ctx.createLinearGradient(-15, -14, -36 - sway, 68);
      rg.addColorStop(0, '#5a946c');
      rg.addColorStop(1, '#84bf95');
      ctx.fillStyle = rg;
      ctx.strokeStyle = '#335c40';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-14, -15);
      ctx.lineTo(14, -15);
      ctx.bezierCurveTo(22, 10, 18 - sway * 0.4, 52, 12 - sway * 0.6, 68);
      ctx.quadraticCurveTo(-8 - sway * 0.8, 76, -36 - sway, 64);
      ctx.bezierCurveTo(-32 - sway * 0.5, 34, -24, 6, -14, -15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (cfg.outfit === 'outfit_fairy_garden') {
      const flutter = Math.sin(animTimer * 8) * 0.12;
      ctx.save();
      ctx.translate(-12, -2);
      ctx.rotate(-0.15 + flutter);
      // Upper gossamer wing
      const wg1 = ctx.createLinearGradient(-48, -32, 0, 8);
      wg1.addColorStop(0, 'rgba(251, 207, 232, 0.72)');
      wg1.addColorStop(0.55, 'rgba(196, 241, 224, 0.65)');
      wg1.addColorStop(1, 'rgba(255, 255, 255, 0.85)');
      ctx.fillStyle = wg1;
      ctx.strokeStyle = 'rgba(219, 134, 174, 0.65)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-18, -36, -54, -34, -46, -6);
      ctx.bezierCurveTo(-40, 10, -14, 10, 0, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Lower wing
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.bezierCurveTo(-24, 6, -42, 26, -26, 36);
      ctx.bezierCurveTo(-12, 42, -2, 22, 0, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Delicate wing veins
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-4, -2); ctx.quadraticCurveTo(-24, -18, -36, -12);
      ctx.moveTo(-4, 6); ctx.quadraticCurveTo(-20, 18, -24, 26);
      ctx.stroke();
      ctx.restore();
    }

    // Starlight Wizard Cape (Level 20) OR Royal Cape (Level 15) OR Starlight Cape Top (Level 18)
    if (cfg.outfit === 'outfit_star_wizard' || cfg.outfit === 'outfit_royal_storybook' || (cfg.outfit === 'none' && cfg.top === 'starlight_cape_top')) {
      ctx.save();
      const isWizard = cfg.outfit === 'outfit_star_wizard';
      const isRoyal = cfg.outfit === 'outfit_royal_storybook';
      const len = isWizard ? 86 : (isRoyal ? 78 : 48);
      const grad = ctx.createLinearGradient(-20, -14, -36 - sway, len);
      if (isWizard) {
        grad.addColorStop(0, '#4f4082');
        grad.addColorStop(1, '#7c65b8');
      } else if (isRoyal) {
        if (cfg.gender === 'boy') {
          grad.addColorStop(0, '#475eb5');
          grad.addColorStop(1, '#768ee0');
        } else {
          grad.addColorStop(0, '#c25d7d');
          grad.addColorStop(1, '#e88ca7');
        }
      } else {
        grad.addColorStop(0, '#8570bd');
        grad.addColorStop(1, '#b6a0ea');
      }
      ctx.fillStyle = grad;
      ctx.strokeStyle = isWizard ? '#2f2354' : (isRoyal ? (cfg.gender === 'boy' ? '#2a3875' : '#7d344c') : '#524080');
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(-14, -15);
      ctx.lineTo(14, -15);
      ctx.bezierCurveTo(22, 10, 20 - sway * 0.4, len * 0.7, 14 - sway * 0.6, len);
      ctx.quadraticCurveTo(-12 - sway * 0.9, len + 8, -38 - sway, len - 4);
      ctx.bezierCurveTo(-34 - sway * 0.5, len * 0.45, -24, 6, -14, -15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Golden trim along cape hem
      ctx.strokeStyle = '#f6cf65';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-36 - sway, len - 6);
      ctx.quadraticCurveTo(-12 - sway * 0.9, len + 5, 13 - sway * 0.6, len - 2);
      ctx.stroke();

      // Tiny sparkling stars on wizard/starlight cape
      if (isWizard || !isRoyal) {
        ctx.fillStyle = '#fde68a';
        const stars = [[-22 - sway * 0.5, 22], [-10 - sway * 0.6, 48], [-28 - sway * 0.8, 56]];
        stars.forEach(([sx, sy]) => {
          if (sy < len - 6) {
            ctx.beginPath();
            ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }
      ctx.restore();
    }

    // Cat Onesie Raincoat Back Cat-Hood (Level 5 Special Outfit)
    if (cfg.outfit === 'outfit_cat_onesie') {
      ctx.save();
      ctx.fillStyle = '#f7ba92';
      ctx.strokeStyle = '#8c5334';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-24, -14);
      ctx.bezierCurveTo(-38, -26, -34, -46, -18, -42);
      ctx.quadraticCurveTo(-2, -32, 8, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Cute dangling cat ear on rested hood
      ctx.beginPath();
      ctx.moveTo(-30, -34);
      ctx.lineTo(-37, -48);
      ctx.lineTo(-22, -41);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Mint Hoodie back rested hood
    if (cfg.outfit === 'none' && cfg.top === 'hoodie_mint') {
      ctx.save();
      ctx.fillStyle = '#9fd8bd';
      ctx.strokeStyle = '#437860';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-18, -14);
      ctx.bezierCurveTo(-30, -22, -28, -36, -12, -30);
      ctx.quadraticCurveTo(0, -22, 12, -16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  // =========================================================================
  // 4. BACK HAIR LAYER (Uniquely sculpted for all 17 hairstyles!)
  // =========================================================================
  function drawHairBack(ctx, cfg, hair, pose) {
    const style = cfg.hairStyle;
    const sway = pose.hairSway * 24;

    if (style === 'bald' || style === 'buzz') return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = hair.outline;
    ctx.lineWidth = 2.2;

    const grad = ctx.createLinearGradient(0, -100, 0, 48);
    grad.addColorStop(0, hair.base);
    grad.addColorStop(0.65, hair.base);
    grad.addColorStop(1, hair.dark);

    // Helper: draw woven braid chain along a slight curve
    const drawBraid = (startX, startY, segments, segW, segH, swayMul, bowColor) => {
      ctx.save();
      ctx.translate(startX, startY);
      ctx.rotate(pose.hairSway * swayMul);
      for (let i = 0; i < segments; i++) {
        const y = i * (segH * 0.78);
        const w = segW * (1 - i * 0.06);
        // Left weave lobe
        ctx.fillStyle = i % 2 === 0 ? hair.base : hair.dark;
        ctx.beginPath();
        ctx.ellipse(-w * 0.28, y + segH * 0.35, w * 0.56, segH * 0.58, -0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Right weave lobe
        ctx.fillStyle = i % 2 === 0 ? hair.light : hair.base;
        ctx.beginPath();
        ctx.ellipse(w * 0.28, y + segH * 0.62, w * 0.54, segH * 0.56, 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      const endY = segments * (segH * 0.78) + 2;
      // Feathered hair tassel tip
      ctx.fillStyle = hair.base;
      ctx.beginPath();
      ctx.moveTo(-4, endY);
      ctx.quadraticCurveTo(-8, endY + 12, 0, endY + 18);
      ctx.quadraticCurveTo(8, endY + 11, 4, endY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Cute pastel ribbon tie
      ctx.fillStyle = bowColor || '#f79bb6';
      ctx.strokeStyle = '#9e4765';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(-6, endY + 2, 6, 3.5, -0.3, 0, Math.PI * 2);
      ctx.ellipse(6, endY + 2, 6, 3.5, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, endY + 2, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    if (style === 'long_wavy') {
      // Rich cascading layered S-waves past the waist with billowing volume
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-26, -78);
      ctx.bezierCurveTo(-48, -50, -34 - sway * 0.4, -18, -46 - sway * 0.65, 10);
      ctx.bezierCurveTo(-50 - sway * 0.9, 34, -36 - sway, 52, -22 - sway * 0.9, 46);
      ctx.quadraticCurveTo(-12 - sway * 0.8, 58, 0 - sway * 0.7, 48);
      ctx.quadraticCurveTo(14 - sway * 0.6, 56, 26 - sway * 0.5, 44);
      ctx.bezierCurveTo(42 - sway * 0.35, 28, 32 - sway * 0.2, 0, 38 - sway * 0.1, -24);
      ctx.bezierCurveTo(40, -48, 34, -68, 26, -76);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner wavy shadow folds for lush organic depth
      ctx.strokeStyle = hair.dark;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-28, -32);
      ctx.bezierCurveTo(-36 - sway * 0.3, -6, -20 - sway * 0.5, 16, -28 - sway * 0.8, 40);
      ctx.moveTo(-8, -22);
      ctx.bezierCurveTo(-14 - sway * 0.3, 4, -2 - sway * 0.5, 22, -6 - sway * 0.7, 42);
      ctx.moveTo(18, -30);
      ctx.bezierCurveTo(28 - sway * 0.2, -2, 16 - sway * 0.4, 18, 22 - sway * 0.5, 38);
      ctx.stroke();
    } else if (style === 'long_straight') {
      // Sleek silky straight curtain with delicately feathered tips
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-26, -78);
      ctx.bezierCurveTo(-35, -35, -35 - sway * 0.5, 12, -32 - sway * 0.85, 46);
      ctx.lineTo(-20 - sway * 0.8, 38);
      ctx.lineTo(-12 - sway * 0.75, 48);
      ctx.lineTo(0 - sway * 0.7, 40);
      ctx.lineTo(10 - sway * 0.6, 47);
      ctx.lineTo(20 - sway * 0.5, 38);
      ctx.lineTo(28 - sway * 0.4, 44);
      ctx.bezierCurveTo(32 - sway * 0.2, 8, 32, -38, 26, -74);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Silky vertical sheen lines
      ctx.strokeStyle = hair.light;
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-22, -25); ctx.lineTo(-24 - sway * 0.6, 26);
      ctx.moveTo(18, -25); ctx.lineTo(18 - sway * 0.4, 24);
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (style === 'bob') {
      // Classic rounded French bob curving softly under jaw
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-26, -76);
      ctx.bezierCurveTo(-37, -50, -37 - sway * 0.25, -24, -22 - sway * 0.3, -18);
      ctx.quadraticCurveTo(0 - sway * 0.2, -14, 22 - sway * 0.15, -20);
      ctx.bezierCurveTo(34, -28, 32, -55, 25, -74);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (style === 'short_girl') {
      // Airy feathered pixie nape
      ctx.fillStyle = hair.dark;
      ctx.beginPath();
      ctx.moveTo(-24, -72);
      ctx.bezierCurveTo(-33, -52, -30, -34, -20, -28);
      ctx.lineTo(-14, -32);
      ctx.lineTo(-6, -27);
      ctx.quadraticCurveTo(8, -28, 20, -36);
      ctx.bezierCurveTo(28, -50, 26, -68, 22, -74);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (style === 'ponytail') {
      // High sweeping dynamic ponytail curving gracefully behind shoulder!
      ctx.save();
      ctx.translate(-21, -83);
      ctx.rotate(pose.hairSway * 0.85);
      const pg = ctx.createLinearGradient(0, 0, -24, 86);
      pg.addColorStop(0, hair.light);
      pg.addColorStop(0.35, hair.base);
      pg.addColorStop(1, hair.dark);
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.moveTo(4, -2);
      ctx.bezierCurveTo(-14, -12, -36, 6, -34, 42);
      ctx.bezierCurveTo(-32, 66, -16, 82, -8, 92);
      ctx.bezierCurveTo(-16, 72, -10, 56, -4, 62);
      ctx.bezierCurveTo(-8, 42, -2, 20, 6, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner flowing pony strand lines
      ctx.strokeStyle = hair.light;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-4, 4);
      ctx.bezierCurveTo(-20, 14, -24, 40, -14, 72);
      ctx.stroke();

      // Cute pastel scrunchie tie
      ctx.fillStyle = '#f8a5c2';
      ctx.strokeStyle = '#9e4765';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(2, 2, 6.5, 8.5, -0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (style === 'twin_braids') {
      // Subtle nape hair + Far braid (Near braid is drawn in front layer so it drapes over shoulder!)
      ctx.fillStyle = hair.dark;
      ctx.beginPath();
      ctx.arc(0, -64, 28, Math.PI * 0.7, Math.PI * 2.3);
      ctx.fill();
      drawBraid(23, -44, 5, 11, 13, 0.55, '#f79bb6');
    } else if (style === 'single_braid') {
      // Thick lush storybook braid sweeping behind back shoulder
      ctx.fillStyle = hair.dark;
      ctx.beginPath();
      ctx.moveTo(-26, -72);
      ctx.bezierCurveTo(-34, -48, -24, -32, -8, -32);
      ctx.quadraticCurveTo(16, -32, 24, -52);
      ctx.closePath();
      ctx.fill();
      drawBraid(-22, -40, 6, 14, 14, 0.75, '#a78bfa');
    } else if (style === 'bun') {
      // Charming high fairy-tale wrapped top bun + soft nape wisps
      ctx.save();
      ctx.translate(-14, -104);
      ctx.rotate(-0.22 + pose.hairSway * 0.25);
      const bg = ctx.createRadialGradient(-4, -6, 3, 0, 0, 22);
      bg.addColorStop(0, hair.light);
      bg.addColorStop(0.55, hair.base);
      bg.addColorStop(1, hair.dark);
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.ellipse(0, 0, 19, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Twisted bun strand curves
      ctx.strokeStyle = hair.dark;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-2, 2, 11, Math.PI * 1.1, Math.PI * 1.9);
      ctx.arc(3, -1, 8, 0.2, Math.PI * 0.9);
      ctx.stroke();
      // Ribbon band around bun base
      ctx.fillStyle = '#f8a5c2';
      ctx.strokeStyle = '#9e4765';
      ctx.lineWidth = 1.6;
      rr(ctx, -13, 10, 26, 6, 3);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (style === 'bangs') {
      // Medium-long flowing hair behind shoulders (matches signature bangs!)
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-26, -76);
      ctx.bezierCurveTo(-37, -42, -36 - sway * 0.4, -4, -30 - sway * 0.6, 26);
      ctx.quadraticCurveTo(-14 - sway * 0.5, 32, 0 - sway * 0.4, 26);
      ctx.quadraticCurveTo(16 - sway * 0.3, 30, 26 - sway * 0.2, 20);
      ctx.bezierCurveTo(32, -8, 32, -46, 26, -74);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (style === 'long_boy') {
      // Feathered collar-length adventure-boy hair with lively flicked nape layers
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-25, -76);
      ctx.bezierCurveTo(-36, -54, -36 - sway * 0.3, -28, -32 - sway * 0.4, -14);
      ctx.lineTo(-22 - sway * 0.3, -22);
      ctx.lineTo(-14 - sway * 0.25, -12);
      ctx.lineTo(-4 - sway * 0.2, -20);
      ctx.lineTo(10 - sway * 0.15, -14);
      ctx.lineTo(20 - sway * 0.1, -22);
      ctx.bezierCurveTo(28, -36, 29, -58, 24, -74);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (style === 'wavy_boy') {
      ctx.fillStyle = hair.dark;
      ctx.beginPath();
      ctx.moveTo(-25, -74);
      ctx.bezierCurveTo(-36, -54, -34, -34, -22, -26);
      ctx.quadraticCurveTo(-6, -24, 16, -32);
      ctx.bezierCurveTo(28, -44, 28, -62, 24, -74);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (style === 'curly_boy') {
      // Fluffy sculpted curls framing the back of head
      ctx.fillStyle = hair.dark;
      const backCurls = [
        [-27, -68, 12], [-30, -52, 11], [-24, -38, 10],
        [-14, -32, 9], [23, -64, 11], [24, -48, 10]
      ];
      backCurls.forEach(([cx, cy, r]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    } else if (style === 'messy_short') {
      // Lively back tufts sticking out subtly behind crown & nape
      ctx.fillStyle = hair.dark;
      ctx.beginPath();
      ctx.moveTo(-24, -78);
      ctx.quadraticCurveTo(-38, -72, -32, -60);
      ctx.quadraticCurveTo(-37, -50, -28, -42);
      ctx.quadraticCurveTo(-30, -32, -18, -32);
      ctx.lineTo(18, -36);
      ctx.lineTo(24, -70);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // short_classic / side_part subtle nape fill
      ctx.fillStyle = hair.dark;
      ctx.beginPath();
      ctx.moveTo(-24, -74);
      ctx.bezierCurveTo(-32, -56, -29, -40, -18, -34);
      ctx.lineTo(16, -38);
      ctx.bezierCurveTo(26, -48, 26, -64, 22, -74);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  // =========================================================================
  // 5. ARTICULATED LIMBS (Legs + Shoes, Arms + Sleeves + Hands)
  // =========================================================================
  function getSleeveStyle(cfg) {
    const isBoy = cfg.gender === 'boy';
    if (cfg.outfit === 'outfit_cat_onesie') return { color: '#ffcca8', cuff: '#fff6ea', outline: '#8c5334', length: 'long' };
    if (cfg.outfit === 'outfit_fairy_garden') {
      return isBoy
        ? { color: '#8ac99d', cuff: '#5a946c', outline: '#335c40', length: 'long' }
        : { color: '#a8deb8', cuff: '#fbc8d9', outline: '#487a58', length: 'puff' };
    }
    if (cfg.outfit === 'outfit_royal_storybook') {
      return isBoy
        ? { color: '#7f8fd4', cuff: '#f6cf65', outline: '#3b4680', length: 'long' }
        : { color: '#8796d8', cuff: '#f6cf65', outline: '#414c82', length: 'puff_long' };
    }
    if (cfg.outfit === 'outfit_star_wizard') return { color: '#615099', cuff: '#f6cf65', outline: '#32255c', length: isBoy ? 'long' : 'wide_long' };

    switch (cfg.top) {
      case 'tee_pastel': return { color: '#c8e6fa', cuff: '#ffffff', outline: '#4a7391', length: 'short' };
      case 'hoodie_mint': return { color: '#b7e6cf', cuff: '#96cfb4', outline: '#437860', length: 'long' };
      case 'blouse_blossom': return { color: '#fbd1df', cuff: '#ffffff', outline: '#99546c', length: 'puff' };
      case 'shirt_plaid': return { color: '#b4d8f2', cuff: '#e8f4fc', outline: '#426b8c', length: 'mid' };
      case 'jacket_denim': return { color: '#7ca0cc', cuff: '#a6c2e3', outline: '#3c587a', length: 'long' };
      case 'jacket_bomber': return { color: '#fff3e0', cuff: '#77b397', outline: '#467560', length: 'long' };
      case 'cardigan_berry': return { color: '#de8ca4', cuff: '#c7708b', outline: '#7d3a50', length: 'long' };
      case 'vest_explorer': return { color: '#fff5e6', cuff: '#ead4b8', outline: '#7a593c', length: 'mid' };
      case 'sailor_top': return { color: '#ffffff', cuff: '#8eb6e8', outline: '#4b6891', length: 'short' };
      case 'starlight_cape_top': return { color: '#9580c9', cuff: '#f6cf65', outline: '#4f3e7a', length: 'long' };
      default: return { color: '#fff2e0', cuff: '#edd5ba', outline: '#825d42', length: 'long' }; // sweater_cream
    }
  }

  function drawArm(ctx, pivotX, pivotY, shoulderAngle, elbowAngle, cfg, skin, isFront) {
    const sleeve = getSleeveStyle(cfg);
    const upperLen = 25;
    const foreLen = 22;

    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(shoulderAngle);

    // Upper Arm
    const isLong = sleeve.length === 'long' || sleeve.length === 'puff_long' || sleeve.length === 'wide_long';
    const isPuff = sleeve.length === 'puff' || sleeve.length === 'puff_long';

    if (isPuff) {
      ctx.fillStyle = sleeve.color;
      ctx.strokeStyle = sleeve.outline;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 10, 9.5, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Little sleeve cuff band
      ctx.fillStyle = sleeve.cuff;
      rr(ctx, -7, 19, 14, 4, 2);
      ctx.fill();
      ctx.stroke();
    } else if (sleeve.length === 'short') {
      // Bare lower upper-arm
      ctx.fillStyle = isFront ? skin.base : skin.shadow;
      ctx.strokeStyle = skin.outline;
      ctx.lineWidth = 1.9;
      rr(ctx, -4.8, 8, 9.6, upperLen - 4, 4.5);
      ctx.fill();
      ctx.stroke();
      // Short sleeve
      ctx.fillStyle = sleeve.color;
      ctx.strokeStyle = sleeve.outline;
      ctx.lineWidth = 2;
      rr(ctx, -7, -3, 14, 16, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = sleeve.cuff;
      ctx.fillRect(-6.5, 10, 13, 3);
    } else {
      ctx.fillStyle = sleeve.color;
      ctx.strokeStyle = sleeve.outline;
      ctx.lineWidth = 2;
      rr(ctx, -6.5, -3, 13, upperLen + 4, 6);
      ctx.fill();
      ctx.stroke();
    }

    // Forearm & Hand
    ctx.translate(0, upperLen);
    ctx.rotate(elbowAngle);

    if (isLong) {
      ctx.fillStyle = sleeve.color;
      ctx.strokeStyle = sleeve.outline;
      ctx.lineWidth = 2;
      if (sleeve.length === 'wide_long') {
        ctx.beginPath();
        ctx.moveTo(-5.5, -2);
        ctx.lineTo(5.5, -2);
        ctx.lineTo(9, foreLen - 1);
        ctx.lineTo(-9, foreLen - 1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        rr(ctx, -5.8, -2, 11.6, foreLen, 5.2);
        ctx.fill();
        ctx.stroke();
      }
      // Cuff trim
      ctx.fillStyle = sleeve.cuff;
      rr(ctx, -6.4, foreLen - 5, 12.8, 5, 2.5);
      ctx.fill();
      ctx.stroke();
    } else if (sleeve.length === 'mid') {
      ctx.fillStyle = isFront ? skin.base : skin.shadow;
      ctx.strokeStyle = skin.outline;
      ctx.lineWidth = 1.9;
      rr(ctx, -4.5, 4, 9, foreLen - 3, 4.5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = sleeve.color;
      ctx.strokeStyle = sleeve.outline;
      ctx.lineWidth = 2;
      rr(ctx, -6, -2, 12, 12, 4);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = isFront ? skin.base : skin.shadow;
      ctx.strokeStyle = skin.outline;
      ctx.lineWidth = 1.9;
      rr(ctx, -4.5, -2, 9, foreLen + 2, 4.5);
      ctx.fill();
      ctx.stroke();
    }

    // Soft sculpted storybook child hand with thumb
    ctx.fillStyle = isFront ? skin.base : skin.shadow;
    ctx.strokeStyle = skin.outline;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(0.5, foreLen + 4, 5.4, 6.2, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Little thumb
    ctx.beginPath();
    ctx.ellipse(4.8, foreLen + 2.5, 2.5, 3.6, 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  function getLegClothing(cfg) {
    const isBoy = cfg.gender === 'boy';
    if (cfg.outfit === 'outfit_cat_onesie') return { type: 'pants', color: '#f2e0d0', outline: '#8c5334', cuff: '#fff5eb' };
    if (cfg.outfit === 'outfit_fairy_garden') {
      return isBoy
        ? { type: 'pants', color: '#5b8266', outline: '#2e4d37', cuff: '#81ab8d' }
        : { type: 'tights', color: '#fdf5ec', outline: '#7a6354' };
    }
    if (cfg.outfit === 'outfit_royal_storybook') {
      return isBoy
        ? { type: 'pants', color: '#5f6da8', outline: '#323c6e', cuff: '#f6cf65' }
        : { type: 'tights', color: '#fff8f0', outline: '#6d648a' };
    }
    if (cfg.outfit === 'outfit_star_wizard') return { type: 'pants', color: '#463a75', outline: '#281f4d' };

    switch (cfg.bottom) {
      case 'jeans_soft': return { type: 'pants', color: '#87a6cc', outline: '#425d80', cuff: '#bdd3eb' };
      case 'chinos_warm': return { type: 'pants', color: '#d9b88f', outline: '#7a5a35', cuff: '#ecd4b5' };
      case 'cargo_pants': return { type: 'pants', color: '#94ad86', outline: '#4b613f', cuff: '#b5cca8', cargo: true };
      case 'overalls_garden': return { type: 'pants', color: '#94c2b6', outline: '#436e63', cuff: '#bfe0d7' };
      case 'adventurer_pants': return { type: 'pants', color: '#8b79ab', outline: '#4c3e69', cuff: '#c4b4e0' };
      case 'shorts_cozy': return { type: 'shorts', color: '#dec29c', outline: '#7c5d3b', sock: '#fff8ef' };
      case 'tulip_skirt': return { type: 'skirt_leg', sock: '#fff5f8' };
      default: return isBoy ? { type: 'pants', color: '#87a6cc', outline: '#425d80', cuff: '#bdd3eb' } : { type: 'skirt_leg', sock: '#fffaf4' };
    }
  }

  function drawShoe(ctx, shoeId, isFront, isBoy = false) {
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const dim = isFront ? 1 : 0.92;
    ctx.scale(dim, 1);

    if (shoeId === 'mary_janes') {
      // Classic rounded storybook Mary Janes
      ctx.fillStyle = '#c45b74';
      ctx.strokeStyle = '#6e283b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-7, -2);
      ctx.lineTo(5, -2);
      ctx.bezierCurveTo(15, -1, 18, 5, 16, 10);
      ctx.lineTo(-8, 10);
      ctx.quadraticCurveTo(-10, 4, -7, -2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Cute instep opening & strap
      ctx.fillStyle = '#fffaf4';
      ctx.beginPath();
      ctx.ellipse(2, 0, 5.5, 3, 0, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#6e283b';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-2, -1); ctx.lineTo(5, 2);
      ctx.stroke();
      // Tiny gold buckle
      ctx.fillStyle = '#f6cf65';
      ctx.beginPath();
      ctx.arc(4, 1.5, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (shoeId === 'loafers_classic') {
      // Classic smart chestnut-brown boy slip-on loafers
      ctx.fillStyle = '#8c5a3c';
      ctx.strokeStyle = '#4d2e1b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-7, -3);
      ctx.lineTo(6, -3);
      ctx.bezierCurveTo(16, -2, 19, 4, 17, 10);
      ctx.lineTo(-8, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Cream trim sole
      ctx.fillStyle = '#f5e6d3';
      rr(ctx, -9, 7.5, 26.5, 3.8, 1.8);
      ctx.fill();
      ctx.stroke();
      // Loafer stitched tongue band
      ctx.fillStyle = '#a8704e';
      rr(ctx, 1, -1, 7, 4, 2);
      ctx.fill();
      ctx.stroke();
    } else if (shoeId === 'boots_cozy') {
      // Warm suede cuffed ankle boots with fluffy trim
      ctx.fillStyle = '#b9825c';
      ctx.strokeStyle = '#664028';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, -11);
      ctx.lineTo(7, -11);
      ctx.lineTo(8, -1);
      ctx.bezierCurveTo(16, 0, 19, 6, 16, 11);
      ctx.lineTo(-9, 11);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Sole
      ctx.fillStyle = '#734a31';
      rr(ctx, -9, 8, 25, 4, 2);
      ctx.fill();
      // Fluffy cream shearling cuff
      ctx.fillStyle = '#fff5e6';
      ctx.strokeStyle = '#9c785c';
      ctx.lineWidth = 1.6;
      rr(ctx, -9.5, -14, 18, 7, 3.5);
      ctx.fill();
      ctx.stroke();
    } else if (shoeId === 'rain_boots') {
      // Sunny yellow glossy rain boots
      ctx.fillStyle = '#f9cf57';
      ctx.strokeStyle = '#9e7216';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, -16);
      ctx.lineTo(7, -16);
      ctx.lineTo(8, -1);
      ctx.bezierCurveTo(17, 0, 20, 6, 17, 11);
      ctx.lineTo(-9, 11);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // White sole & cuff stripe
      ctx.fillStyle = '#ffffff';
      rr(ctx, -9, 8, 26, 4, 2);
      ctx.fill();
      ctx.fillStyle = isBoy ? '#5ba4db' : '#f472b6';
      ctx.fillRect(-7.5, -13, 14, 3.5);
      // Gloss shine
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      rr(ctx, -4, -10, 3, 9, 1.5);
      ctx.fill();
    } else if (shoeId === 'star_boots') {
      // Magical starry winged boots (Level 15 reward!)
      ctx.fillStyle = '#8b73c9';
      ctx.strokeStyle = '#473678';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, -17);
      ctx.lineTo(7, -17);
      ctx.lineTo(8, -1);
      ctx.bezierCurveTo(17, 0, 20, 6, 17, 11);
      ctx.lineTo(-9, 11);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Golden top cuff & sole
      ctx.fillStyle = '#f6cf65';
      rr(ctx, -9, -18, 17, 5, 2.5);
      ctx.fill();
      ctx.stroke();
      rr(ctx, -9, 8, 26, 3.8, 2);
      ctx.fill();
      // Tiny golden wing accent on side
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(-6, -9);
      ctx.lineTo(-16, -15);
      ctx.lineTo(-13, -7);
      ctx.lineTo(-7, -5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Pastel sneakers (default)
      ctx.fillStyle = '#8ac4e8';
      ctx.strokeStyle = '#3d6b8a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-7, -4);
      ctx.lineTo(6, -4);
      ctx.bezierCurveTo(15, -2, 19, 4, 17, 10);
      ctx.lineTo(-8, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // White rubber sole & toe cap
      ctx.fillStyle = '#ffffff';
      rr(ctx, -9, 7, 26.5, 4.5, 2.2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(13, 6.5, 4.2, Math.PI * 1.1, Math.PI * 2);
      ctx.fill();
      // Little white laces
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(4, -1); ctx.lineTo(8, 1);
      ctx.moveTo(6, 2); ctx.lineTo(10, 4);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawLeg(ctx, pivotX, pivotY, hipAngle, kneeAngle, cfg, skin, isFront) {
    const legWear = getLegClothing(cfg);
    const thighLen = 35;
    const calfLen = 36;

    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(hipAngle);

    // Thigh
    if (legWear.type === 'pants') {
      ctx.fillStyle = legWear.color;
      ctx.strokeStyle = legWear.outline;
      ctx.lineWidth = 2;
      rr(ctx, -8, -4, 16, thighLen + 6, 7);
      ctx.fill();
      ctx.stroke();
    } else if (legWear.type === 'shorts') {
      ctx.fillStyle = isFront ? skin.base : skin.shadow;
      ctx.strokeStyle = skin.outline;
      ctx.lineWidth = 1.9;
      rr(ctx, -6, 12, 12, thighLen - 8, 5.5);
      ctx.fill();
      ctx.stroke();
      // Short pant leg
      ctx.fillStyle = legWear.color;
      ctx.strokeStyle = legWear.outline;
      ctx.lineWidth = 2;
      rr(ctx, -8.5, -4, 17, 24, 6);
      ctx.fill();
      ctx.stroke();
    } else if (legWear.type === 'tights') {
      ctx.fillStyle = legWear.color;
      ctx.strokeStyle = legWear.outline;
      ctx.lineWidth = 1.8;
      rr(ctx, -6.5, -2, 13, thighLen + 5, 6);
      ctx.fill();
      ctx.stroke();
    } else {
      // Bare knee / skirt leg
      ctx.fillStyle = isFront ? skin.base : skin.shadow;
      ctx.strokeStyle = skin.outline;
      ctx.lineWidth = 1.9;
      rr(ctx, -6.2, -2, 12.4, thighLen + 5, 6);
      ctx.fill();
      ctx.stroke();
    }

    // Calf / Shin
    ctx.translate(0, thighLen);
    ctx.rotate(kneeAngle);

    if (legWear.type === 'pants') {
      ctx.fillStyle = legWear.color;
      ctx.strokeStyle = legWear.outline;
      ctx.lineWidth = 2;
      rr(ctx, -7, -3, 14, calfLen + 2, 6);
      ctx.fill();
      ctx.stroke();
      if (legWear.cuff) {
        ctx.fillStyle = legWear.cuff;
        rr(ctx, -7.8, calfLen - 8, 15.6, 7, 3);
        ctx.fill();
        ctx.stroke();
      }
    } else if (legWear.type === 'tights') {
      ctx.fillStyle = legWear.color;
      ctx.strokeStyle = legWear.outline;
      ctx.lineWidth = 1.8;
      rr(ctx, -5.8, -3, 11.6, calfLen + 2, 5.5);
      ctx.fill();
      ctx.stroke();
    } else {
      // Upper calf skin + cozy knee/ankle sock
      ctx.fillStyle = isFront ? skin.base : skin.shadow;
      ctx.strokeStyle = skin.outline;
      ctx.lineWidth = 1.9;
      rr(ctx, -5.5, -3, 11, calfLen, 5);
      ctx.fill();
      ctx.stroke();

      const sockH = legWear.type === 'skirt_leg' ? 23 : 16;
      ctx.fillStyle = legWear.sock || '#fffaf4';
      ctx.strokeStyle = '#9e8475';
      ctx.lineWidth = 1.6;
      rr(ctx, -6, calfLen - sockH, 12, sockH + 1, 4);
      ctx.fill();
      ctx.stroke();
      // Cute pastel sock top stripe (sky blue for boy, rose for girl)
      ctx.fillStyle = cfg.gender === 'boy' ? '#7bb8e8' : '#f8a5c2';
      ctx.fillRect(-5.5, calfLen - sockH + 3, 11, 2.5);
    }

    // Foot / Shoe
    ctx.translate(0, calfLen);
    ctx.rotate(-(hipAngle + kneeAngle) * 0.45);
    drawShoe(ctx, cfg.shoes, isFront, cfg.gender === 'boy');

    ctx.restore();
  }

  // =========================================================================
  // 6. TORSO, TOPS, BOTTOMS & SPECIAL MILESTONE OUTFITS
  // =========================================================================
  function drawBottomGarment(ctx, cfg, pose) {
    if (cfg.outfit !== 'none') return; // Special outfit draws full ensemble

    const sway = pose.skirtSway || 0;
    ctx.save();
    ctx.lineJoin = 'round';

    if (cfg.bottom === 'skirt_pleated') {
      const grad = ctx.createLinearGradient(0, 22, 0, 62);
      grad.addColorStop(0, '#d8c5f7');
      grad.addColorStop(1, '#b99ce8');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#6c5199';
      ctx.lineWidth = 2.1;

      ctx.beginPath();
      ctx.moveTo(-16, 22);
      ctx.lineTo(16, 22);
      ctx.bezierCurveTo(22, 36, 28 + sway * 0.3, 52, 26 + sway * 0.4, 59);
      ctx.quadraticCurveTo(0 + sway * 0.3, 65, -27 + sway * 0.5, 58);
      ctx.bezierCurveTo(-28 + sway * 0.3, 48, -22, 34, -16, 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crisp storybook pleats
      ctx.strokeStyle = '#8b6ec2';
      ctx.lineWidth = 1.6;
      [-12, -3, 7, 15].forEach(px => {
        ctx.beginPath();
        ctx.moveTo(px * 0.78, 26);
        ctx.quadraticCurveTo(px * 1.15 + sway * 0.2, 42, px * 1.35 + sway * 0.35, 59);
        ctx.stroke();
      });

      // Waistband
      ctx.fillStyle = '#9d7ed4';
      rr(ctx, -16.5, 20, 33, 6, 3);
      ctx.fill();
      ctx.stroke();
    } else if (cfg.bottom === 'tulip_skirt') {
      // Level 6 Unlock: Tiered Double-Ruffle Fairy Tulip Skirt!
      // White lace under-ruffle
      ctx.fillStyle = '#fff5f8';
      ctx.strokeStyle = '#c47492';
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.moveTo(-26 + sway * 0.4, 54);
      ctx.quadraticCurveTo(-16 + sway * 0.4, 67, -6 + sway * 0.35, 62);
      ctx.quadraticCurveTo(4 + sway * 0.3, 68, 14 + sway * 0.3, 61);
      ctx.quadraticCurveTo(24 + sway * 0.25, 65, 28 + sway * 0.2, 54);
      ctx.lineTo(18, 36);
      ctx.lineTo(-18, 36);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Upper rose-petal scalloped tier
      const grad = ctx.createLinearGradient(0, 22, 0, 56);
      grad.addColorStop(0, '#fbc6d9');
      grad.addColorStop(1, '#f094b4');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#9e4765';
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(-16, 22);
      ctx.lineTo(16, 22);
      ctx.bezierCurveTo(24, 34, 29 + sway * 0.3, 46, 27 + sway * 0.35, 53);
      ctx.quadraticCurveTo(16 + sway * 0.3, 59, 6 + sway * 0.3, 52);
      ctx.quadraticCurveTo(-4 + sway * 0.35, 59, -14 + sway * 0.4, 52);
      ctx.quadraticCurveTo(-24 + sway * 0.45, 58, -28 + sway * 0.5, 51);
      ctx.bezierCurveTo(-26 + sway * 0.2, 40, -21, 32, -16, 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Satin waist bow
      ctx.fillStyle = '#e86894';
      rr(ctx, -16.5, 20, 33, 6.5, 3);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(-6, 25, 6, 3.5, -0.25, 0, Math.PI * 2);
      ctx.ellipse(6, 25, 6, 3.5, 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (cfg.bottom === 'jeans_soft') {
      ctx.fillStyle = '#87a6cc';
      ctx.strokeStyle = '#425d80';
      ctx.lineWidth = 2;
      rr(ctx, -17, 22, 34, 22, 8);
      ctx.fill();
      ctx.stroke();
      // Waistband & gold button
      ctx.fillStyle = '#7090b8';
      rr(ctx, -17.5, 21, 35, 6.5, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f6cf65';
      ctx.beginPath();
      ctx.arc(3, 24.2, 2.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (cfg.bottom === 'chinos_warm') {
      // Tailored warm sand-caramel chinos with leather belt
      ctx.fillStyle = '#d9b88f';
      ctx.strokeStyle = '#7a5a35';
      ctx.lineWidth = 2;
      rr(ctx, -17.5, 22, 35, 22, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#8f5b3a';
      ctx.strokeStyle = '#4f2f1b';
      rr(ctx, -17.5, 20.5, 35, 6, 2.5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f6cf65';
      rr(ctx, 0, 20, 7, 7, 1.5);
      ctx.fill();
      ctx.stroke();
    } else if (cfg.bottom === 'cargo_pants') {
      // Level 6 Boy Reward: Woodland Olive Cargo Pants with side flap pockets!
      ctx.fillStyle = '#94ad86';
      ctx.strokeStyle = '#4b613f';
      ctx.lineWidth = 2;
      rr(ctx, -18, 22, 36, 24, 8);
      ctx.fill();
      ctx.stroke();
      // Adventure belt
      ctx.fillStyle = '#6e4c30';
      ctx.strokeStyle = '#3d2817';
      rr(ctx, -18, 20.5, 36, 6.2, 2.5);
      ctx.fill();
      ctx.stroke();
      // Dual cargo pocket flaps
      ctx.fillStyle = '#819c73';
      ctx.strokeStyle = '#4b613f';
      ctx.lineWidth = 1.6;
      rr(ctx, -16, 30, 10, 9, 2.5); ctx.fill(); ctx.stroke();
      rr(ctx, 6, 30, 10, 9, 2.5); ctx.fill(); ctx.stroke();
    } else if (cfg.bottom === 'shorts_cozy') {
      ctx.fillStyle = '#dec29c';
      ctx.strokeStyle = '#7c5d3b';
      ctx.lineWidth = 2;
      rr(ctx, -17.5, 22, 35, 22, 8);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#b39268';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-14, 28); ctx.quadraticCurveTo(-8, 34, -14, 38);
      ctx.moveTo(14, 28); ctx.quadraticCurveTo(8, 34, 14, 38);
      ctx.stroke();
    } else if (cfg.bottom === 'adventurer_pants') {
      // Level 15 Belted Adventure Breeches
      ctx.fillStyle = '#8b79ab';
      ctx.strokeStyle = '#4c3e69';
      ctx.lineWidth = 2;
      rr(ctx, -18, 22, 36, 24, 9);
      ctx.fill();
      ctx.stroke();
      // Warm leather belt & golden buckle
      ctx.fillStyle = '#8f5b3a';
      ctx.strokeStyle = '#4f2f1b';
      rr(ctx, -18, 20, 36, 7.5, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f6cf65';
      rr(ctx, -1, 19.5, 9, 8.5, 2);
      ctx.fill();
      ctx.stroke();
    } else if (cfg.bottom === 'overalls_garden') {
      // Pelvic portion of overalls (bib & straps are drawn OVER top!)
      ctx.fillStyle = '#94c2b6';
      ctx.strokeStyle = '#436e63';
      ctx.lineWidth = 2;
      rr(ctx, -17.5, 21, 35, 23, 8);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawTorsoAndTop(ctx, cfg, pose) {
    const isGirl = cfg.gender === 'girl';
    const shW = isGirl ? 16.5 : 18.5;
    const wW = isGirl ? 14.5 : 16;
    const sway = pose.skirtSway || 0;

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // === SPECIAL MILESTONE FULL OUTFITS (Levels 5, 10, 15, 20) ===
    if (cfg.outfit === 'outfit_cat_onesie') {
      // Level 5: Adorable Pastel Peach Cat Raincoat / Cape Coat!
      const g = ctx.createLinearGradient(0, -16, 0, 56);
      g.addColorStop(0, '#ffd7ba');
      g.addColorStop(1, '#f7b288');
      ctx.fillStyle = g;
      ctx.strokeStyle = '#8c5334';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-shW, -14);
      ctx.quadraticCurveTo(0, -18, shW, -14);
      ctx.bezierCurveTo(22, 6, 26 + sway * 0.25, 34, 24 + sway * 0.35, 54);
      ctx.quadraticCurveTo(0 + sway * 0.25, 60, -25 + sway * 0.4, 54);
      ctx.bezierCurveTo(-26 + sway * 0.2, 34, -22, 6, -shW, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cream sherpa bottom trim & collar
      ctx.fillStyle = '#fff6ea';
      rr(ctx, -23 + sway * 0.35, 48, 46, 8, 4);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, -14, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cute wooden toggle buttons down center
      ctx.fillStyle = '#8c5334';
      [0, 14, 28].forEach(by => {
        ctx.strokeStyle = '#d98a5b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-4, by); ctx.lineTo(6, by);
        ctx.stroke();
        rr(ctx, -1, by - 2.5, 6, 5, 2.5);
        ctx.fill();
      });

      // Paw pocket on front!
      ctx.fillStyle = '#fff3e6';
      ctx.strokeStyle = '#b5714c';
      ctx.lineWidth = 1.6;
      rr(ctx, -16, 28, 12, 11, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f29bb8';
      ctx.beginPath();
      ctx.arc(-10, 34.5, 2.4, 0, Math.PI * 2);
      ctx.arc(-12.5, 31.5, 1.2, 0, Math.PI * 2);
      ctx.arc(-10, 30.8, 1.2, 0, Math.PI * 2);
      ctx.arc(-7.5, 31.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    if (cfg.outfit === 'outfit_fairy_garden') {
      if (!isGirl) {
        // Level 10 BOY: "Orman Muhafızı Seti" — Woodland Ranger Tunic (NO fairy dress!)
        const g = ctx.createLinearGradient(0, -16, 0, 48);
        g.addColorStop(0, '#9bd6ac');
        g.addColorStop(1, '#68a87c');
        ctx.fillStyle = g;
        ctx.strokeStyle = '#335c40';
        ctx.lineWidth = 2.1;

        ctx.beginPath();
        ctx.moveTo(-shW, -13);
        ctx.quadraticCurveTo(0, -17, shW, -13);
        ctx.lineTo(20, 43);
        ctx.quadraticCurveTo(0, 48, -20, 43);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Warm woodland leather belt & golden acorn buckle
        ctx.fillStyle = '#8c5a3c';
        ctx.strokeStyle = '#4d2e1b';
        ctx.lineWidth = 1.8;
        rr(ctx, -18.5, 19, 37, 7, 3);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f6cf65';
        ctx.beginPath();
        ctx.arc(2, 22.5, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Leaf collar & ranger lapel clasp
        ctx.fillStyle = '#d9f2e1';
        ctx.strokeStyle = '#335c40';
        ctx.beginPath();
        ctx.moveTo(-12, -14); ctx.lineTo(-4, -2); ctx.lineTo(0, -9);
        ctx.lineTo(4, -2); ctx.lineTo(12, -14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        return;
      }

      // Level 10 GIRL: Enchanted Woodland Fairy Costume (petal-layered dress!)
      const g = ctx.createLinearGradient(0, -16, 0, 58);
      g.addColorStop(0, '#c8f0d4');
      g.addColorStop(0.55, '#9cd9b1');
      g.addColorStop(1, '#79bf94');
      ctx.fillStyle = g;
      ctx.strokeStyle = '#3d6e50';
      ctx.lineWidth = 2.1;

      // Pink flower-petal underlayer
      ctx.fillStyle = '#fbd0e0';
      ctx.beginPath();
      ctx.moveTo(-22, 34);
      ctx.quadraticCurveTo(-24 + sway * 0.4, 58, -10 + sway * 0.35, 64);
      ctx.quadraticCurveTo(2 + sway * 0.3, 54, 12 + sway * 0.3, 64);
      ctx.quadraticCurveTo(24 + sway * 0.25, 56, 24 + sway * 0.2, 34);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Leaf-shaped sage fairy bodice & jagged leaf-petal overskirt
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-shW, -13);
      ctx.quadraticCurveTo(0, -17, shW, -13);
      ctx.lineTo(17, 22);
      ctx.bezierCurveTo(25, 34, 29 + sway * 0.25, 48, 24 + sway * 0.3, 56);
      ctx.quadraticCurveTo(14 + sway * 0.25, 46, 6 + sway * 0.3, 57);
      ctx.quadraticCurveTo(-2 + sway * 0.3, 45, -12 + sway * 0.35, 58);
      ctx.quadraticCurveTo(-20 + sway * 0.4, 48, -26 + sway * 0.45, 54);
      ctx.bezierCurveTo(-24, 40, -19, 30, -16, 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Golden vine waist belt & flower brooch
      ctx.fillStyle = '#f6cf65';
      ctx.strokeStyle = '#9c731c';
      ctx.lineWidth = 1.6;
      rr(ctx, -16.5, 19, 33, 6, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(2, 22, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(2, 22, 2, 0, Math.PI * 2);
      ctx.fill();

      // Leaf collar
      ctx.fillStyle = '#e0f7e6';
      ctx.strokeStyle = '#3d6e50';
      ctx.beginPath();
      ctx.moveTo(-10, -14); ctx.quadraticCurveTo(-6, -3, 0, -9);
      ctx.quadraticCurveTo(6, -3, 10, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (cfg.outfit === 'outfit_royal_storybook') {
      // Level 15: Royal Storybook Prince / Princess Ensemble!
      const g = ctx.createLinearGradient(0, -16, 0, 58);
      g.addColorStop(0, '#9ba9e6');
      g.addColorStop(1, '#6f7ec7');
      ctx.fillStyle = g;
      ctx.strokeStyle = '#3b4680';
      ctx.lineWidth = 2.2;

      if (isGirl) {
        // Royal storybook flared gown
        ctx.beginPath();
        ctx.moveTo(-shW, -14);
        ctx.quadraticCurveTo(0, -18, shW, -14);
        ctx.lineTo(15, 20);
        ctx.bezierCurveTo(26, 36, 32 + sway * 0.3, 56, 30 + sway * 0.4, 68);
        ctx.quadraticCurveTo(0 + sway * 0.3, 75, -31 + sway * 0.5, 68);
        ctx.bezierCurveTo(-31 + sway * 0.3, 54, -24, 34, -15, 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Cream silk center panel
        ctx.fillStyle = '#fff8ec';
        ctx.beginPath();
        ctx.moveTo(-6, 22); ctx.lineTo(8, 22);
        ctx.lineTo(15 + sway * 0.3, 70); ctx.lineTo(-11 + sway * 0.35, 70);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#f6cf65';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Royal princely braided velvet tunic
        ctx.beginPath();
        ctx.moveTo(-shW, -14);
        ctx.quadraticCurveTo(0, -18, shW, -14);
        ctx.lineTo(19, 44);
        ctx.quadraticCurveTo(0, 49, -19, 44);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Diagonal golden royal sash
      ctx.strokeStyle = '#f6cf65';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-13, -12);
      ctx.lineTo(13, 22);
      ctx.stroke();
      ctx.strokeStyle = '#b58724';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Golden collar & tiny crown crest
      ctx.fillStyle = '#fff7e8';
      ctx.strokeStyle = '#b58724';
      ctx.lineWidth = 1.8;
      rr(ctx, -10, -16, 20, 6.5, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f6cf65';
      ctx.beginPath();
      ctx.arc(3, 0, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (cfg.outfit === 'outfit_star_wizard') {
      // Level 20: Celestial Starlight Wizard (Tailored Tunic for Boy / Flowing Robe for Girl!)
      const g = ctx.createLinearGradient(0, -16, 0, 68);
      g.addColorStop(0, '#5a4991');
      g.addColorStop(0.6, '#6d58ad');
      g.addColorStop(1, '#8c74cf');
      ctx.fillStyle = g;
      ctx.strokeStyle = '#2d2057';
      ctx.lineWidth = 2.2;

      if (isGirl) {
        ctx.beginPath();
        ctx.moveTo(-shW, -14);
        ctx.quadraticCurveTo(0, -18, shW, -14);
        ctx.lineTo(18, 22);
        ctx.bezierCurveTo(24, 42, 27 + sway * 0.3, 58, 25 + sway * 0.4, 67);
        ctx.quadraticCurveTo(0 + sway * 0.3, 73, -26 + sway * 0.5, 66);
        ctx.bezierCurveTo(-26 + sway * 0.3, 54, -22, 36, -17, 22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(-shW, -14);
        ctx.quadraticCurveTo(0, -18, shW, -14);
        ctx.lineTo(20, 44);
        ctx.quadraticCurveTo(0, 49, -20, 44);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Golden crescent & constellation waist sash
      ctx.fillStyle = '#f6cf65';
      ctx.strokeStyle = '#9c731c';
      ctx.lineWidth = 1.6;
      rr(ctx, -18, 19, 36, 6.5, 3);
      ctx.fill();
      ctx.stroke();

      // Glowing golden hem border
      ctx.strokeStyle = '#f6cf65';
      ctx.lineWidth = 2.5;
      if (isGirl) {
        ctx.beginPath();
        ctx.moveTo(-24 + sway * 0.45, 61);
        ctx.quadraticCurveTo(0 + sway * 0.3, 67, 23 + sway * 0.35, 61);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(-19, 41);
        ctx.quadraticCurveTo(0, 45, 19, 41);
        ctx.stroke();
      }

      // Crescent moon brooch at collar
      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.arc(2, -6, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5a4991';
      ctx.beginPath();
      ctx.arc(4.5, -7.5, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // === REGULAR MIX-AND-MATCH TOPS ===
    const drawBaseBody = (fill, stroke, bottomY = 26) => {
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(-shW, -13);
      ctx.quadraticCurveTo(0, -17, shW, -13);
      ctx.bezierCurveTo(shW + 2, 0, wW + 3, 14, wW + 2, bottomY);
      ctx.quadraticCurveTo(0, bottomY + 4, -(wW + 2), bottomY);
      ctx.bezierCurveTo(-(wW + 3), 14, -(shW + 2), 0, -shW, -13);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    if (cfg.top === 'tee_pastel') {
      drawBaseBody('#c8e6fa', '#4a7391', 27);
      // Soft cream stripe across chest
      ctx.fillStyle = '#fff9ee';
      ctx.fillRect(-15, 2, 30, 7);
      // Crisp collar ring
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(0, -15, 9.5, 0.15, Math.PI - 0.15);
      ctx.stroke();
    } else if (cfg.top === 'hoodie_mint') {
      drawBaseBody('#b7e6cf', '#437860', 29);
      // Kangaroo pocket
      ctx.fillStyle = '#9dd4b9';
      ctx.strokeStyle = '#437860';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-11, 13); ctx.lineTo(11, 13);
      ctx.lineTo(13, 25); ctx.lineTo(-13, 25);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Cream drawstrings
      ctx.strokeStyle = '#fff8ee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, -10); ctx.quadraticCurveTo(-5, -1, -4, 6);
      ctx.moveTo(5, -10); ctx.quadraticCurveTo(6, -1, 5, 5);
      ctx.stroke();
    } else if (cfg.top === 'shirt_plaid') {
      // Boy Starter: Crisp Pastel Sky Checkered Collared Shirt!
      drawBaseBody('#cde4f7', '#426b8c', 27);
      // Soft checkered plaid stripes
      ctx.strokeStyle = 'rgba(110, 158, 199, 0.42)';
      ctx.lineWidth = 2.2;
      [-9, 1, 10].forEach(px => {
        ctx.beginPath(); ctx.moveTo(px, -12); ctx.lineTo(px, 26); ctx.stroke();
      });
      [-2, 9, 19].forEach(py => {
        ctx.beginPath(); ctx.moveTo(-16, py); ctx.lineTo(16, py); ctx.stroke();
      });
      // Classic folded shirt collar
      ctx.fillStyle = '#edf6fc';
      ctx.strokeStyle = '#426b8c';
      ctx.lineWidth = 1.7;
      ctx.beginPath(); ctx.moveTo(-11, -14); ctx.lineTo(-2, -6); ctx.lineTo(-9, -4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(11, -14); ctx.lineTo(2, -6); ctx.lineTo(9, -4); ctx.closePath(); ctx.fill(); ctx.stroke();
      // Chest pocket & tiny buttons
      ctx.fillStyle = '#b4d8f2';
      rr(ctx, 5, 2, 8.5, 9, 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffffff';
      [1, 10, 19].forEach(by => {
        ctx.beginPath(); ctx.arc(0.5, by, 1.7, 0, Math.PI * 2); ctx.fill();
      });
    } else if (cfg.top === 'jacket_denim') {
      // Boy Starter: Cool Pastel Denim Jacket over Cream Tee!
      drawBaseBody('#fff6ea', '#8a6c52', 27);
      // Open left & right denim panels
      ctx.fillStyle = '#7ca0cc';
      ctx.strokeStyle = '#3c587a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-shW, -13); ctx.lineTo(-5, -14); ctx.lineTo(-4, 28); ctx.lineTo(-(wW + 3), 28); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(shW, -13); ctx.lineTo(7, -14); ctx.lineTo(7, 28); ctx.lineTo(wW + 3, 28); ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Folded denim collar lapels & flap pockets
      ctx.fillStyle = '#97b8e0';
      ctx.beginPath(); ctx.moveTo(-12, -14); ctx.lineTo(-5, -13); ctx.lineTo(-9, -4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(13, -14); ctx.lineTo(7, -13); ctx.lineTo(11, -4); ctx.closePath(); ctx.fill(); ctx.stroke();
      rr(ctx, -14, 7, 8, 7, 1.5); ctx.fill(); ctx.stroke();
      rr(ctx, 8, 7, 8, 7, 1.5); ctx.fill(); ctx.stroke();
      // Brass snap buttons
      ctx.fillStyle = '#f6cf65';
      [-2, 9, 20].forEach(by => {
        ctx.beginPath(); ctx.arc(-6.5, by, 1.8, 0, Math.PI * 2); ctx.fill();
      });
    } else if (cfg.top === 'jacket_bomber') {
      // Level 3 Boy Reward: Pastel Sage & Cream Varsity Bomber Jacket!
      drawBaseBody('#8ec9ad', '#3e6e58', 27);
      // Striped ribbed collar & waist hem
      ctx.fillStyle = '#fff5e6';
      ctx.strokeStyle = '#3e6e58';
      ctx.lineWidth = 1.7;
      rr(ctx, -(wW + 2), 22, (wW + 2) * 2, 6, 3); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#63a386';
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(-wW, 25); ctx.lineTo(wW, 25); ctx.stroke();
      // Center snap placket
      ctx.strokeStyle = '#3e6e58';
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(1, -13); ctx.lineTo(1, 22); ctx.stroke();
      ctx.fillStyle = '#fff5e6';
      [-5, 4, 13].forEach(by => {
        ctx.beginPath(); ctx.arc(1, by, 1.8, 0, Math.PI * 2); ctx.fill();
      });
      // Golden varsity star emblem on chest!
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#9c731c';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 === 0 ? 5.2 : 2.3;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        if (i === 0) ctx.moveTo(9 + Math.cos(a) * rad, 3 + Math.sin(a) * rad);
        else ctx.lineTo(9 + Math.cos(a) * rad, 3 + Math.sin(a) * rad);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (cfg.top === 'blouse_blossom') {
      drawBaseBody('#fbd1df', '#99546c', 26);
      // Delicate white scalloped Peter Pan collar
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#c47492';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.bezierCurveTo(-6, -2, -16, -4, -13, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.bezierCurveTo(6, -2, 16, -4, 13, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Tiny pearl buttons
      ctx.fillStyle = '#fff9f2';
      [0, 9, 18].forEach(by => {
        ctx.beginPath();
        ctx.arc(2, by, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    } else if (cfg.top === 'cardigan_berry') {
      // Level 3 Reward: Open Berry Cardigan over cream inner shirt!
      drawBaseBody('#fff7eb', '#96765d', 27);
      // Left & right berry knit panels
      ctx.fillStyle = '#de8ca4';
      ctx.strokeStyle = '#7d3a50';
      ctx.lineWidth = 2;
      // Left cardigan side
      ctx.beginPath();
      ctx.moveTo(-shW, -13); ctx.lineTo(-5, -14);
      ctx.lineTo(-2, 28); ctx.lineTo(-(wW + 3), 28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Right cardigan side
      ctx.beginPath();
      ctx.moveTo(shW, -13); ctx.lineTo(7, -14);
      ctx.lineTo(6, 28); ctx.lineTo(wW + 3, 28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Wooden buttons
      ctx.fillStyle = '#7d3a50';
      [-2, 8, 18].forEach(by => {
        ctx.beginPath();
        ctx.arc(-6, by, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (cfg.top === 'vest_explorer') {
      // Level 9 Reward: Woodland Explorer Vest + Coral Neckerchief!
      drawBaseBody('#fff5e6', '#7a593c', 27);
      ctx.fillStyle = '#c8a97e';
      ctx.strokeStyle = '#694e2c';
      ctx.lineWidth = 2;
      rr(ctx, -(wW + 1), -12, (wW + 1) * 2, 38, 6);
      ctx.fill();
      ctx.stroke();
      // Center seam + dual flap pockets
      ctx.beginPath();
      ctx.moveTo(1, -8); ctx.lineTo(1, 26);
      ctx.stroke();
      ctx.fillStyle = '#b59467';
      rr(ctx, -13, 8, 10, 9, 2); ctx.fill(); ctx.stroke();
      rr(ctx, 4, 8, 10, 9, 2); ctx.fill(); ctx.stroke();
      // Cute pastel coral adventure scarf
      ctx.fillStyle = '#f5897d';
      ctx.strokeStyle = '#993d33';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(-12, -13);
      ctx.quadraticCurveTo(1, -6, 12, -13);
      ctx.lineTo(5, 1);
      ctx.lineTo(-4, -1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (cfg.top === 'sailor_top') {
      // Level 12 Reward: Classic Storybook Sailor Blouse!
      drawBaseBody('#ffffff', '#4b6891', 27);
      // Wide periwinkle V sailor collar
      ctx.fillStyle = '#8eb6e8';
      ctx.strokeStyle = '#4b6891';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-shW + 1, -13);
      ctx.lineTo(-15, 2);
      ctx.lineTo(1, 7);
      ctx.lineTo(15, 2);
      ctx.lineTo(shW - 1, -13);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Crisp white sailor stripe
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-13, -1); ctx.lineTo(1, 4); ctx.lineTo(13, -1);
      ctx.stroke();
      // Silk tie (soft navy for boy, rose for girl!)
      ctx.fillStyle = isGirl ? '#f2799b' : '#4a75a8';
      ctx.strokeStyle = isGirl ? '#8f324d' : '#264369';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(1, 5); ctx.lineTo(-7, 17); ctx.lineTo(-1, 14);
      ctx.lineTo(1, 5); ctx.lineTo(9, 17); ctx.lineTo(3, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(1, 6, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (cfg.top === 'starlight_cape_top') {
      // Level 18 Reward: Starlight Velvet Tunic + Golden Clasp
      drawBaseBody('#9580c9', '#4f3e7a', 29);
      // Draped front shoulder capelet
      ctx.fillStyle = '#b49ee8';
      ctx.strokeStyle = '#4f3e7a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-shW - 1, -13);
      ctx.quadraticCurveTo(0, -17, shW + 1, -13);
      ctx.lineTo(shW + 3, 2);
      ctx.quadraticCurveTo(0, 10, -(shW + 3), 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Golden star clasp
      ctx.fillStyle = '#f6cf65';
      ctx.strokeStyle = '#9c731c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(1, -4, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Default: Cozy Cream Knitted Sweater with paw emblem
      drawBaseBody('#fff2e0', '#825d42', 28);
      // Soft knitted ribbing lines
      ctx.strokeStyle = 'rgba(181, 139, 102, 0.35)';
      ctx.lineWidth = 1.5;
      [-9, -3, 3, 9].forEach(kx => {
        ctx.beginPath();
        ctx.moveTo(kx, -8); ctx.lineTo(kx, 22);
        ctx.stroke();
      });
      // Ribbed neckline & hem
      ctx.fillStyle = '#f2dec4';
      ctx.strokeStyle = '#825d42';
      ctx.lineWidth = 1.7;
      rr(ctx, -16, 22, 32, 6, 3);
      ctx.fill();
      ctx.stroke();
      // Cute tiny pink paw badge on chest
      ctx.fillStyle = '#f29bb8';
      ctx.beginPath();
      ctx.arc(6, 4, 2.8, 0, Math.PI * 2);
      ctx.arc(3.5, 0.5, 1.3, 0, Math.PI * 2);
      ctx.arc(6.2, -0.3, 1.3, 0, Math.PI * 2);
      ctx.arc(8.8, 0.7, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // OVERLAY: Garden Overalls Bib & Straps (drawn OVER any selected top!)
    if (cfg.bottom === 'overalls_garden') {
      ctx.fillStyle = '#94c2b6';
      ctx.strokeStyle = '#436e63';
      ctx.lineWidth = 2;
      // Front bib
      rr(ctx, -12, -2, 24, 26, 4);
      ctx.fill();
      ctx.stroke();
      // Left & right straps
      rr(ctx, -12, -15, 5.5, 16, 2.5); ctx.fill(); ctx.stroke();
      rr(ctx, 6.5, -15, 5.5, 16, 2.5); ctx.fill(); ctx.stroke();
      // Brass buttons
      ctx.fillStyle = '#f6cf65';
      ctx.beginPath();
      ctx.arc(-9.2, 0, 2.3, 0, Math.PI * 2);
      ctx.arc(9.2, 0, 2.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Cute center pocket
      ctx.fillStyle = '#81b3a6';
      rr(ctx, -7, 7, 14, 10, 3);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  // =========================================================================
  // 7. NECK, HEAD, EARS & EXPRESSIVE STORYBOOK FACE
  // =========================================================================
  function drawNeckAndHead(ctx, cfg, skin, hair, eye, pose) {
    const isGirl = cfg.gender === 'girl';

    // 1. CLEAR GRACEFUL CHILD NECK + CHIN CAST SHADOW
    ctx.save();
    ctx.fillStyle = skin.base;
    ctx.strokeStyle = skin.outline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6.2, -33);
    ctx.lineTo(6.2, -33);
    ctx.lineTo(7, -14);
    ctx.quadraticCurveTo(0, -10, -7, -14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Soft cast shadow under chin onto neck (huge depth cue!)
    ctx.fillStyle = skin.shadow;
    ctx.beginPath();
    ctx.ellipse(0, -30, 6.5, 4.8, 0, 0, Math.PI);
    ctx.fill();
    ctx.restore();

    // 2. HEAD TRANSFORM (gently tilted by pose)
    ctx.save();
    ctx.translate(0, -34);
    ctx.rotate(pose.headTilt);
    ctx.translate(0, 34);

    // 2a. EARS (Near ear prominent on left, far ear peeking softly on right)
    ctx.fillStyle = skin.base;
    ctx.strokeStyle = skin.outline;
    ctx.lineWidth = 2;
    // Far ear
    ctx.beginPath();
    ctx.ellipse(25.5, -58, 5, 8.5, 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Near ear
    ctx.beginPath();
    ctx.ellipse(-26.5, -57, 6.2, 9.5, -0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Delicate inner ear shadow curve
    ctx.strokeStyle = skin.shadow;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(-26, -57, 3.8, Math.PI * 0.6, Math.PI * 1.65);
    ctx.stroke();

    // 2b. SCULPTED ORGANIC CHILD HEAD (Smooth Bezier oval-cheek jawline, NOT a raw circle!)
    const headGrad = ctx.createRadialGradient(4, -68, 6, 0, -64, 38);
    headGrad.addColorStop(0, skin.base);
    headGrad.addColorStop(0.78, skin.base);
    headGrad.addColorStop(1, skin.shadow);

    ctx.fillStyle = headGrad;
    ctx.strokeStyle = skin.outline;
    ctx.lineWidth = 2.1;

    const chinY = isGirl ? -30 : -29.5;
    const jawW = isGirl ? 24.5 : 26;

    ctx.beginPath();
    ctx.moveTo(0, -99); // Crown top
    // Right/front profile (slightly fuller cheek curve facing +X)
    ctx.bezierCurveTo(20, -99, 27.5, -82, 26.5, -62);
    ctx.bezierCurveTo(26, -46, jawW * 0.72, -34, 2.5, chinY);
    // Soft child chin
    ctx.quadraticCurveTo(-2, chinY + 0.8, -5, chinY - 0.5);
    // Left/near jawline & cheek
    ctx.bezierCurveTo(-jawW * 0.82, -34, -27.5, -47, -27, -64);
    ctx.bezierCurveTo(-27, -84, -19, -99, 0, -99);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Subtle soft warm crown sheen if bald
    if (cfg.hairStyle === 'bald') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
      ctx.beginPath();
      ctx.ellipse(-5, -88, 10, 4.5, -0.25, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2c. SOFT WATERCOLOR CHEEK BLUSH GRADIENTS
    const drawBlush = (bx, by, rx, ry) => {
      const bg = ctx.createRadialGradient(bx, by, 0.5, bx, by, rx);
      bg.addColorStop(0, skin.blush);
      bg.addColorStop(1, 'rgba(242, 140, 166, 0)');
      ctx.save();
      ctx.globalAlpha = pose.hugPose || pose.showSparkles ? 0.62 : 0.44;
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.ellipse(bx, by, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    drawBlush(-12.5, -48, 8.5, 4.8);
    drawBlush(17, -48.5, 7.2, 4.4);

    // 2d. EYES (4 Shapes x 6 Luminous Multi-Layered Colors!)
    const drawEye = (ex, ey, scaleX) => {
      ctx.save();
      ctx.translate(ex, ey);
      ctx.scale(scaleX, 1);

      if (pose.eyeMode === 'blink') {
        ctx.strokeStyle = '#3d251a';
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-6.5, 0.5);
        ctx.quadraticCurveTo(0, 4.2, 6.5, 0.5);
        ctx.stroke();
        ctx.restore();
        return;
      }

      if (pose.eyeMode === 'happy') {
        // Joyful smiling curved eyes ^ ^
        ctx.strokeStyle = '#3d251a';
        ctx.lineWidth = 2.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-6.8, 2.2);
        ctx.quadraticCurveTo(0, -5.2, 6.8, 2.2);
        ctx.stroke();
        if (isGirl) {
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(-6.2, 1.5); ctx.lineTo(-8.2, 0.2);
          ctx.stroke();
        }
        ctx.restore();
        return;
      }

      if (pose.eyeMode === 'hurt') {
        // Squeezed > < wince eyes
        ctx.strokeStyle = '#3d251a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        const dir = ex < 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(-5 * dir, -4);
        ctx.lineTo(4 * dir, 0);
        ctx.lineTo(-5 * dir, 4);
        ctx.stroke();
        ctx.restore();
        return;
      }

      // Eye shape adjustments
      const shape = cfg.eyeShape || 'classic';
      const w = shape === 'sparkly' ? 7.6 : (shape === 'gentle' ? 7.2 : 7.0);
      const h = shape === 'sparkly' ? 8.4 : (shape === 'gentle' ? 7.0 : (shape === 'cheerful' ? 6.8 : 7.5));
      const tilt = shape === 'gentle' ? 0.08 : (shape === 'cheerful' ? -0.10 : 0);
      if (pose.eyeMode === 'wide') ctx.scale(1.04, 1.08);
      ctx.rotate(tilt);

      // Soft sclera (warm off-white)
      ctx.fillStyle = '#fffdfb';
      ctx.beginPath();
      ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
      ctx.fill();

      // Clip inside eye opening for clean iris & lid shadow!
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
      ctx.clip();

      // Luminous multi-layered iris
      const irisX = 0.8;
      const irisY = 0.4;
      const irisR = shape === 'sparkly' ? 5.9 : 5.3;
      const irisGrad = ctx.createLinearGradient(irisX, irisY - irisR, irisX, irisY + irisR);
      irisGrad.addColorStop(0, eye.deep);
      irisGrad.addColorStop(0.45, eye.mid);
      irisGrad.addColorStop(1, eye.glow);

      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.ellipse(irisX, irisY, irisR * 0.92, irisR, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer limbal ring
      ctx.strokeStyle = eye.deep;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Crisp dark pupil
      ctx.fillStyle = '#1c120d';
      ctx.beginPath();
      ctx.ellipse(irisX, irisY + 0.3, irisR * 0.46, irisR * 0.52, 0, 0, Math.PI * 2);
      ctx.fill();

      // Soft lower crescent glow
      ctx.fillStyle = eye.glow;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(irisX, irisY + 2.2, irisR * 0.45, 0.2, Math.PI - 0.2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Delicate upper eyelid shadow across top of sclera/iris
      ctx.fillStyle = 'rgba(65, 38, 28, 0.16)';
      ctx.fillRect(-w - 2, -h - 1, (w + 2) * 2, 4.2);

      // Dual specular highlights (story-book life!)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(irisX - 2.2, irisY - 2.3, 2.1, 1.8, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(irisX + 2.0, irisY + 2.1, shape === 'sparkly' ? 1.35 : 1.0, 0, Math.PI * 2);
      ctx.fill();
      if (shape === 'sparkly') {
        ctx.beginPath();
        ctx.arc(irisX + 2.4, irisY - 1.5, 0.85, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore(); // End eye clip

      // Expressive upper eyelash line
      ctx.strokeStyle = '#331e16';
      ctx.lineWidth = isGirl ? 2.6 : 2.3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0.6, w + 0.4, Math.PI * 1.08, Math.PI * 1.92);
      ctx.stroke();

      // Subtle outer lash flick ONLY for girl (distinctive gentle elegance!)
      if (isGirl) {
        const flickSide = ex < 0 ? -1 : 1;
        ctx.lineWidth = 1.9;
        ctx.beginPath();
        ctx.moveTo(flickSide * (w - 0.2), -2.2);
        ctx.lineTo(flickSide * (w + 2.6), -4.2);
        ctx.stroke();
      }

      // Soft upper double-eyelid crease
      ctx.strokeStyle = skin.shadow;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, -1.6, w * 0.85, Math.PI * 1.18, Math.PI * 1.82);
      ctx.stroke();

      ctx.restore();
    };

    drawEye(-8.5, -58, 1.0);   // Near eye
    drawEye(13.2, -58, 0.88);  // Far 3/4 eye

    // 2e. EYEBROWS (4 Distinct Shapes — warm natural tone independent of hair color!)
    const browColor = skin.outline;
    const drawBrow = (bx, by, scaleX, side) => {
      ctx.save();
      ctx.translate(bx, by);
      ctx.scale(scaleX, 1);
      ctx.strokeStyle = browColor;
      ctx.lineCap = 'round';
      const bShape = cfg.eyebrowShape || 'soft';
      ctx.lineWidth = bShape === 'bushy' ? 3.4 : (isGirl ? 1.9 : 2.3);

      ctx.beginPath();
      if (bShape === 'natural') {
        ctx.moveTo(-6, 0.5);
        ctx.quadraticCurveTo(0, -0.8, 6, 0.2);
      } else if (bShape === 'expressive') {
        ctx.moveTo(-6.2, 1.5);
        ctx.quadraticCurveTo(-0.5 * side, -3.5, 6.2, 0.5);
      } else if (bShape === 'bushy') {
        ctx.moveTo(-6.5, 0.8);
        ctx.quadraticCurveTo(0, -2.0, 6.5, 0.5);
      } else {
        // soft
        ctx.moveTo(-6, 1.2);
        ctx.quadraticCurveTo(0, -2.2, 6, 1.0);
      }
      ctx.stroke();
      ctx.restore();
    };
    const browRaise = pose.eyeMode === 'wide' ? -2.2 : (pose.eyeMode === 'hurt' ? 2 : 0);
    drawBrow(-8.5, -70.5 + browRaise, 1.0, -1);
    drawBrow(13.0, -70.5 + browRaise, 0.88, 1);

    // 2f. DELICATE STORYBOOK NOSE (Subtle curved shadow, never a clown dot!)
    ctx.strokeStyle = skin.shadow;
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(4.2, -53.5);
    ctx.quadraticCurveTo(6.2, -50.8, 3.8, -49.5);
    ctx.stroke();

    // 2g. EXPRESSIVE NATURAL MOUTH
    ctx.save();
    ctx.translate(3.0, -41.5);
    ctx.strokeStyle = '#994c4c';
    ctx.lineCap = 'round';
    if (pose.mouthMode === 'happy_open') {
      ctx.fillStyle = '#e07582';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-5.5, -1);
      ctx.quadraticCurveTo(0, -2.2, 5.5, -1);
      ctx.quadraticCurveTo(4.5, 6.2, 0, 6.2);
      ctx.quadraticCurveTo(-4.5, 6.2, -5.5, -1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Soft tiny tongue tint
      ctx.fillStyle = '#f5a3ae';
      ctx.beginPath();
      ctx.ellipse(0, 3.8, 3.0, 1.7, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (pose.mouthMode === 'surprised') {
      ctx.fillStyle = '#e07582';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, 1, 3.2, 4.0, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (pose.mouthMode === 'hurt') {
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-4.8, 2.5);
      ctx.quadraticCurveTo(0, -1.8, 4.8, 2.5);
      ctx.stroke();
    } else {
      // Gentle warm storybook smile
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-5.2, -0.5);
      ctx.quadraticCurveTo(0, 4.2, 5.4, -0.8);
      ctx.stroke();
    }
    ctx.restore();

    // 3. GLASSES LAYER (Right over nose bridge, under front bangs!)
    drawGlasses(ctx, cfg.glasses);

    // 4. FRONT & MID HAIR LAYER (All 17 hairstyles!)
    drawHairFront(ctx, cfg, hair, pose);

    // 5. HAIR ACCESSORIES (Clips, Bows, Butterflies, Wings!)
    drawHairAccessory(ctx, cfg.hairAcc, pose);

    // 6. HATS / HEADWEAR (Beret, Sun Hat, Cat Ears, Flower Crown, Wizard Hat!)
    drawHat(ctx, cfg.hat, pose);

    ctx.restore(); // End head transform
  }

  // =========================================================================
  // 8. FRONT HAIR LAYER (Multi-strand Bezier locks + glossy halo highlight!)
  // =========================================================================
  function drawHairFront(ctx, cfg, hair, pose) {
    const style = cfg.hairStyle;
    if (style === 'bald') return;

    const sway = pose.hairSway * 16;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = hair.outline;
    ctx.lineWidth = 2.1;

    // Special: Close-cropped Buzz Cut (natural soft feathered hairline!)
    if (style === 'buzz') {
      ctx.save();
      const bg = ctx.createLinearGradient(0, -101, 0, -64);
      bg.addColorStop(0, hair.base);
      bg.addColorStop(0.65, hair.base);
      bg.addColorStop(1, hair.light);
      ctx.fillStyle = bg;
      ctx.globalAlpha = 0.80;
      ctx.beginPath();
      ctx.moveTo(-26.5, -62);
      ctx.bezierCurveTo(-27.8, -86, -18, -100.5, 0, -100.5);
      ctx.bezierCurveTo(18, -100.5, 26.8, -86, 25.8, -69);
      ctx.quadraticCurveTo(18, -79, 4, -80);
      ctx.quadraticCurveTo(-11, -80, -18, -71);
      ctx.lineTo(-22, -59);
      ctx.lineTo(-26.5, -62);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = hair.dark;
      ctx.lineWidth = 1.1;
      ctx.globalAlpha = 0.45;
      ctx.stroke();

      // Tiny textured short-buzz strokes along crown & hairline
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = hair.dark;
      ctx.lineWidth = 1.2;
      for (let bx = -18; bx <= 18; bx += 6) {
        const by = -91 + Math.abs(bx) * 0.45;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + 1.5, by + 3.5);
        ctx.stroke();
      }
      // Soft sheen
      ctx.globalAlpha = 0.30;
      ctx.fillStyle = hair.light;
      ctx.beginPath();
      ctx.ellipse(-2, -93, 12, 4, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Soft hair shadow cast onto forehead (gives genuine 2D illustration depth!)
    ctx.save();
    ctx.fillStyle = 'rgba(74, 46, 32, 0.13)';
    ctx.beginPath();
    ctx.ellipse(2, -73, 21, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const crownGrad = ctx.createLinearGradient(0, -106, 0, -45);
    crownGrad.addColorStop(0, hair.light);
    crownGrad.addColorStop(0.35, hair.base);
    crownGrad.addColorStop(1, hair.dark);

    const drawGlossHalo = (cx, cy, rx, ry, rot = -0.06) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.strokeStyle = hair.light;
      ctx.globalAlpha = 0.65;
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.arc(0, 4, rx, Math.PI * 1.18, Math.PI * 1.48);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 4, rx, Math.PI * 1.56, Math.PI * 1.82);
      ctx.stroke();
      ctx.restore();
    };

    if (style === 'long_wavy' || style === 'long_straight' || style === 'bob') {
      // Graceful parted crown + face-framing sculpted side locks
      ctx.fillStyle = crownGrad;
      ctx.beginPath();
      ctx.moveTo(0, -103);
      // Right sweeping side
      ctx.bezierCurveTo(22, -103, 31, -86, 29, -62);
      ctx.bezierCurveTo(30, -46, 26, -34, 21, style === 'bob' ? -24 : -14);
      ctx.bezierCurveTo(24, -36, 24, -56, 21, -68);
      // Parted swooping forehead fringe
      ctx.quadraticCurveTo(13, -72, 6, -82);
      ctx.quadraticCurveTo(-2, -68, -14, -64);
      // Flowing near cheek-framing lock (past ear)
      const nearEnd = style === 'bob' ? -20 : (style === 'long_wavy' ? 12 : 4);
      ctx.bezierCurveTo(-18, -46, -15 - sway * 0.25, -24, -22 - sway * 0.35, nearEnd);
      ctx.bezierCurveTo(-30 - sway * 0.2, -14, -33, -44, -31, -66);
      ctx.bezierCurveTo(-31, -88, -21, -103, 0, -103);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Delicate internal hair strand curves
      ctx.strokeStyle = hair.dark;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(6, -82); ctx.quadraticCurveTo(-4, -76, -16, -72);
      ctx.moveTo(-24, -74); ctx.quadraticCurveTo(-28, -48, -24 - sway * 0.2, -24);
      ctx.stroke();
      drawGlossHalo(0, -86, 22, 12);
    } else if (style === 'bangs') {
      // Signature airy wispy storybook straight bangs (kakül) + sweet cheek locks!
      ctx.fillStyle = crownGrad;
      ctx.beginPath();
      ctx.moveTo(0, -103);
      ctx.bezierCurveTo(22, -103, 31, -85, 29, -58);
      ctx.bezierCurveTo(28, -40, 26, -24, 21, -16);
      ctx.bezierCurveTo(23, -34, 24, -54, 22, -66);
      // Wispy parted straight bangs across forehead (with delicate V-splits!)
      ctx.lineTo(15, -63);
      ctx.lineTo(12, -71);
      ctx.lineTo(9, -62);
      ctx.lineTo(2, -62);
      ctx.lineTo(0, -70);
      ctx.lineTo(-3, -62);
      ctx.lineTo(-10, -63);
      ctx.lineTo(-13, -70);
      ctx.lineTo(-16, -63);
      // Cute cheek-hugging hime lock on near side
      ctx.bezierCurveTo(-19, -46, -18, -30, -24 - sway * 0.2, -14);
      ctx.bezierCurveTo(-32, -28, -32, -52, -31, -68);
      ctx.bezierCurveTo(-31, -88, -21, -103, 0, -103);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      drawGlossHalo(0, -86, 22, 12);
    } else if (style === 'short_girl') {
      // Feathered pixie cut tucked softly behind near ear!
      ctx.fillStyle = crownGrad;
      ctx.beginPath();
      ctx.moveTo(0, -103);
      ctx.bezierCurveTo(22, -103, 30, -86, 28, -66);
      ctx.quadraticCurveTo(21, -66, 17, -74);
      // Sweeping airy side fringe
      ctx.quadraticCurveTo(6, -64, -10, -65);
      ctx.quadraticCurveTo(-16, -64, -20, -54);
      // Tucked neatly above & behind near ear
      ctx.quadraticCurveTo(-24, -64, -29, -62);
      ctx.bezierCurveTo(-32, -82, -21, -103, 0, -103);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Tiny wispy strand in front of ear
      ctx.fillStyle = hair.base;
      ctx.beginPath();
      ctx.moveTo(-20, -66);
      ctx.quadraticCurveTo(-17, -54, -22, -46);
      ctx.quadraticCurveTo(-24, -55, -23, -65);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      drawGlossHalo(0, -86, 20, 11);
    } else if (style === 'ponytail' || style === 'bun' || style === 'single_braid') {
      // Pulled back gracefully with airy forehead sweeps & face-framing tendrils
      ctx.fillStyle = crownGrad;
      ctx.beginPath();
      ctx.moveTo(0, -103);
      ctx.bezierCurveTo(21, -102, 29, -86, 27, -66);
      ctx.quadraticCurveTo(21, -74, 10, -76);
      // Soft wispy forehead locks
      ctx.quadraticCurveTo(4, -66, -2, -68);
      ctx.quadraticCurveTo(-8, -76, -15, -72);
      ctx.quadraticCurveTo(-20, -62, -26, -60);
      ctx.bezierCurveTo(-31, -80, -21, -103, 0, -103);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cute soft tendrils curving beside cheek & ear
      ctx.fillStyle = hair.base;
      ctx.beginPath();
      ctx.moveTo(-21, -67);
      ctx.bezierCurveTo(-18, -54, -24 - sway * 0.2, -42, -20 - sway * 0.3, -34);
      ctx.bezierCurveTo(-26 - sway * 0.2, -44, -25, -56, -24, -66);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(22, -68);
      ctx.bezierCurveTo(27, -56, 26, -46, 23, -38);
      ctx.bezierCurveTo(23, -48, 22, -58, 20, -67);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      drawGlossHalo(0, -87, 20, 11);
    } else if (style === 'twin_braids') {
      // Soft parted crown + NEAR WOVEN BRAID draping over front-left shoulder!
      ctx.fillStyle = crownGrad;
      ctx.beginPath();
      ctx.moveTo(0, -103);
      ctx.bezierCurveTo(22, -103, 30, -86, 28, -62);
      ctx.quadraticCurveTo(21, -72, 8, -78);
      ctx.quadraticCurveTo(2, -66, -6, -72);
      ctx.quadraticCurveTo(-16, -74, -22, -62);
      ctx.quadraticCurveTo(-27, -48, -28, -42);
      ctx.bezierCurveTo(-32, -66, -27, -103, 0, -103);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      drawGlossHalo(0, -86, 20, 11);

      // Detailed Near Woven Braid over shoulder!
      ctx.save();
      ctx.translate(-24, -44);
      ctx.rotate(pose.hairSway * 0.7);
      for (let i = 0; i < 5; i++) {
        const y = i * 10.5;
        const w = 11.5 * (1 - i * 0.06);
        ctx.fillStyle = i % 2 === 0 ? hair.base : hair.dark;
        ctx.beginPath();
        ctx.ellipse(-w * 0.28, y + 4.5, w * 0.56, 7.2, -0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = i % 2 === 0 ? hair.light : hair.base;
        ctx.beginPath();
        ctx.ellipse(w * 0.28, y + 8.0, w * 0.54, 7.0, 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      const endY = 55;
      ctx.fillStyle = hair.base;
      ctx.beginPath();
      ctx.moveTo(-4, endY);
      ctx.quadraticCurveTo(-8, endY + 12, 0, endY + 18);
      ctx.quadraticCurveTo(8, endY + 11, 4, endY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Pastel bow at braid tip
      ctx.fillStyle = '#f79bb6';
      ctx.strokeStyle = '#9e4765';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(-6, endY + 2, 6, 3.5, -0.3, 0, Math.PI * 2);
      ctx.ellipse(6, endY + 2, 6, 3.5, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, endY + 2, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (style === 'short_classic') {
      // Neat classic storybook boy haircut
      ctx.fillStyle = crownGrad;
      ctx.beginPath();
      ctx.moveTo(0, -103);
      ctx.bezierCurveTo(22, -103, 30, -87, 27, -66);
      ctx.quadraticCurveTo(21, -72, 16, -70);
      ctx.quadraticCurveTo(8, -64, 2, -71);
      ctx.quadraticCurveTo(-7, -64, -15, -70);
      ctx.lineTo(-21, -56);
      ctx.quadraticCurveTo(-26, -60, -29, -64);
      ctx.bezierCurveTo(-32, -84, -21, -103, 0, -103);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      drawGlossHalo(0, -86, 19, 10);
    } else if (style === 'messy_short') {
      // Energetic Ghibli adventure-kid tousled tufts!
      ctx.fillStyle = crownGrad;
      ctx.beginPath();
      ctx.moveTo(-2, -104);
      // Cute top cowlick curl
      ctx.quadraticCurveTo(6, -114, 13, -104);
      ctx.bezierCurveTo(25, -102, 33, -86, 29, -68);
      // Dynamic feathered forehead tufts
      ctx.lineTo(24, -64);
      ctx.lineTo(19, -72);
      ctx.lineTo(13, -61);
      ctx.lineTo(6, -71);
      ctx.lineTo(-2, -60);
      ctx.lineTo(-9, -70);
      ctx.lineTo(-17, -62);
      ctx.lineTo(-21, -54);
      ctx.lineTo(-27, -62);
      // Side tousled spike
      ctx.quadraticCurveTo(-36, -72, -31, -80);
      ctx.bezierCurveTo(-32, -94, -19, -106, -2, -104);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      drawGlossHalo(-1, -87, 20, 10);
    } else if (style === 'side_part') {
      // Charming polished side-part with sweeping forehead comma-wave
      ctx.fillStyle = crownGrad;
      ctx.beginPath();
      ctx.moveTo(-10, -101);
      // High sweeping volume on right side of part
      ctx.bezierCurveTo(6, -108, 28, -98, 30, -76);
      ctx.quadraticCurveTo(28, -64, 21, -64);
      // Graceful curved sweep back to part
      ctx.bezierCurveTo(14, -72, 2, -66, -10, -78);
      // Neat shorter left side
      ctx.quadraticCurveTo(-17, -72, -21, -57);
      ctx.lineTo(-28, -63);
      ctx.bezierCurveTo(-32, -82, -24, -99, -10, -101);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Crisp side-part line
      ctx.strokeStyle = hair.dark;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-10, -96); ctx.quadraticCurveTo(-11, -86, -10, -78);
      ctx.stroke();
      drawGlossHalo(6, -88, 18, 10, 0.12);
    } else if (style === 'wavy_boy') {
      // Dynamic handsome boyish S-waves sweeping across forehead & temples
      ctx.fillStyle = crownGrad;
      ctx.beginPath();
      ctx.moveTo(-2, -105);
      ctx.bezierCurveTo(14, -108, 30, -96, 31, -76);
      ctx.quadraticCurveTo(32, -64, 24, -63);
      // Layered cascading wave tufts over forehead
      ctx.bezierCurveTo(18, -72, 16, -60, 8, -62);
      ctx.bezierCurveTo(6, -73, -2, -62, -10, -64);
      ctx.bezierCurveTo(-15, -72, -18, -58, -22, -52);
      ctx.quadraticCurveTo(-29, -56, -32, -68);
      ctx.bezierCurveTo(-36, -82, -22, -104, -2, -105);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Expressive S-wave strand lines
      ctx.strokeStyle = hair.dark;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(4, -95); ctx.bezierCurveTo(14, -85, 6, -74, 16, -66);
      ctx.moveTo(-10, -94); ctx.bezierCurveTo(-2, -82, -14, -72, -18, -62);
      ctx.stroke();
      drawGlossHalo(2, -89, 20, 10, 0.05);
    } else if (style === 'curly_boy') {
      // Voluminous joyful interlocking curls & ringlets!
      ctx.fillStyle = crownGrad;
      const curls = [
        [-22, -82, 12], [-10, -96, 13], [6, -98, 13], [20, -88, 12],
        [24, -74, 10], [14, -76, 10], [0, -78, 11], [-14, -76, 11],
        [-26, -68, 10], [-20, -62, 8.5], [22, -64, 8]
      ];
      // First pass: unified outline silhouettes
      curls.forEach(([cx, cy, r]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      // Second pass: soft interior merges + spiral curl accents!
      curls.forEach(([cx, cy, r], idx) => {
        ctx.fillStyle = idx % 3 === 0 ? hair.light : hair.base;
        ctx.beginPath();
        ctx.arc(cx, cy, r - 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = hair.dark;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(cx + 1, cy + 1, r * 0.52, 0.4, Math.PI * 1.45);
        ctx.stroke();
      });
    } else if (style === 'long_boy') {
      // Layered skater/adventure-boy medium-long cut with shaggy bangs & ear-framing wisps!
      ctx.fillStyle = crownGrad;
      ctx.beginPath();
      ctx.moveTo(-2, -104);
      ctx.bezierCurveTo(18, -105, 31, -90, 30, -68);
      ctx.lineTo(27, -46);
      ctx.lineTo(21, -56);
      ctx.lineTo(18, -68);
      // Shaggy dynamic forehead locks
      ctx.lineTo(12, -58);
      ctx.lineTo(5, -70);
      ctx.lineTo(-3, -57);
      ctx.lineTo(-11, -68);
      ctx.lineTo(-18, -58);
      // Layered side lock sweeping neatly past ear to jaw
      ctx.bezierCurveTo(-21, -46, -24, -36, -30 - sway * 0.2, -26);
      ctx.bezierCurveTo(-36, -42, -34, -66, -31, -78);
      ctx.bezierCurveTo(-28, -94, -18, -104, -2, -104);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      drawGlossHalo(0, -87, 20, 10);
    }

    ctx.restore();
  }

  // =========================================================================
  // 9. ACCESSORIES (Glasses, Hair Accessories, Hats)
  // =========================================================================
  function drawGlasses(ctx, glassesId) {
    if (!glassesId || glassesId === 'none') return;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (glassesId === 'round_glasses') {
      // Thin golden storybook round spectacles
      ctx.fillStyle = 'rgba(220, 244, 255, 0.25)';
      ctx.strokeStyle = '#c49133';
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.ellipse(-8.5, -58, 10, 9.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(13.2, -58, 9, 9.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // Nose bridge & temple arm
      ctx.beginPath();
      ctx.moveTo(1.5, -58); ctx.quadraticCurveTo(3, -60, 4.4, -58);
      ctx.moveTo(-18.5, -59); ctx.lineTo(-26, -61);
      ctx.stroke();
      // Lens glare
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-13, -62); ctx.lineTo(-10, -64);
      ctx.moveTo(9, -62); ctx.lineTo(12, -64);
      ctx.stroke();
    } else if (glassesId === 'cat_eye_glasses') {
      // Level 9: Pastel Rose Cat-Eye Glasses
      ctx.fillStyle = 'rgba(251, 207, 232, 0.22)';
      ctx.strokeStyle = '#c74c7d';
      ctx.lineWidth = 2.5;
      const drawLens = (lx, rx) => {
        ctx.beginPath();
        ctx.moveTo(lx - rx, -62);
        ctx.quadraticCurveTo(lx, -65, lx + rx, -61);
        ctx.bezierCurveTo(lx + rx, -51, lx - rx, -50, lx - rx, -62);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      };
      drawLens(-9, 10.5);
      drawLens(13.2, 9.5);
      ctx.beginPath();
      ctx.moveTo(1.5, -60); ctx.lineTo(4, -60);
      ctx.moveTo(-19.5, -62); ctx.lineTo(-26, -61);
      ctx.stroke();
    } else if (glassesId === 'sport_shades') {
      // Level 9 Boy Reward: Cool Pastel-Navy Rounded Sunglasses!
      ctx.fillStyle = 'rgba(56, 132, 189, 0.72)';
      ctx.strokeStyle = '#2c4a6b';
      ctx.lineWidth = 2.5;
      rr(ctx, -19, -64, 20, 12.5, 5); ctx.fill(); ctx.stroke();
      rr(ctx, 4.5, -64, 18, 12.5, 5); ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(1, -60); ctx.lineTo(4.5, -60);
      ctx.moveTo(-19, -61); ctx.lineTo(-26, -61);
      ctx.stroke();
      // Diagonal white gloss
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-14, -55); ctx.lineTo(-9, -62);
      ctx.moveTo(9, -55); ctx.lineTo(14, -62);
      ctx.stroke();
    } else if (glassesId === 'goggles_pilot') {
      // Level 15 Boy Reward: Storybook Brass Adventurer Pilot Goggles!
      // Strap
      ctx.strokeStyle = '#6e472b';
      ctx.lineWidth = 4.2;
      ctx.beginPath(); ctx.moveTo(-26, -60); ctx.lineTo(-18, -59); ctx.stroke();
      // Brass rims + glowing sky glass
      ctx.fillStyle = 'rgba(125, 211, 252, 0.58)';
      ctx.strokeStyle = '#b8832c';
      ctx.lineWidth = 3.2;
      ctx.beginPath(); ctx.ellipse(-8.5, -58, 10.5, 9.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(13.2, -58, 9.5, 9.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#6e472b';
      ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(1.8, -58); ctx.lineTo(4.2, -58); ctx.stroke();
      // Bright lens shine
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath();
      ctx.ellipse(-12, -62, 3, 1.5, -0.4, 0, Math.PI * 2);
      ctx.ellipse(10, -62, 2.8, 1.4, -0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (glassesId === 'star_shades') {
      // Level 15: Playful Pink Star Fairy Shades!
      const drawStar = (cx, cy, rOuter, rInner) => {
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? rOuter : rInner;
          const a = (i * Math.PI) / 5 - Math.PI / 2;
          const px = cx + Math.cos(a) * r;
          const py = cy + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      };
      ctx.fillStyle = 'rgba(244, 114, 182, 0.55)';
      ctx.strokeStyle = '#f6cf65';
      ctx.lineWidth = 2.2;
      drawStar(-8.5, -58, 12.5, 6);
      drawStar(13.2, -58, 11.5, 5.5);
      ctx.beginPath();
      ctx.moveTo(0, -58); ctx.lineTo(5, -58);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawHairAccessory(ctx, accId, pose) {
    if (!accId || accId === 'none') return;
    ctx.save();
    ctx.translate(-19, -82);
    ctx.rotate(-0.28 + pose.hairSway * 0.15);

    if (accId === 'flower_clip') {
      // 5-petal pastel daisy clip
      ctx.fillStyle = '#fff9f5';
      ctx.strokeStyle = '#d98aa3';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * 5.2, Math.sin(a) * 5.2, 4.2, 3.0, a, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (accId === 'star_clips') {
      const miniStar = (sx, sy, r, fill) => {
        ctx.fillStyle = fill;
        ctx.strokeStyle = '#a3711c';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const rad = i % 2 === 0 ? r : r * 0.45;
          const a = (i * Math.PI) / 5 - Math.PI / 2;
          if (i === 0) ctx.moveTo(sx + Math.cos(a) * rad, sy + Math.sin(a) * rad);
          else ctx.lineTo(sx + Math.cos(a) * rad, sy + Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      };
      miniStar(0, 0, 6.5, '#fde047');
      miniStar(7, 8, 5.2, '#f9a8d4');
    } else if (accId === 'ribbon_bow') {
      // Level 3: Lush Pastel Rose Silk Bow
      ctx.fillStyle = '#f584aa';
      ctx.strokeStyle = '#993458';
      ctx.lineWidth = 1.8;
      // Fluttering tails
      ctx.beginPath();
      ctx.moveTo(-2, 2); ctx.lineTo(-9, 17); ctx.lineTo(-3, 14); ctx.closePath();
      ctx.moveTo(2, 2); ctx.lineTo(9, 17); ctx.lineTo(3, 14); ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Bow loops
      ctx.beginPath();
      ctx.ellipse(-8, 0, 9, 5.5, -0.25, 0, Math.PI * 2);
      ctx.ellipse(8, 0, 9, 5.5, 0.25, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath(); ctx.arc(0, 0, 3.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (accId === 'butterfly_clip') {
      // Level 9: Pastel Lavender Butterfly Clip
      ctx.fillStyle = '#c4b5fd';
      ctx.strokeStyle = '#6d28d9';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(-6, -3, 7, 5, -0.4, 0, Math.PI * 2);
      ctx.ellipse(6, -3, 7, 5, 0.4, 0, Math.PI * 2);
      ctx.ellipse(-5, 4, 5, 3.5, 0.3, 0, Math.PI * 2);
      ctx.ellipse(5, 4, 5, 3.5, -0.3, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#4c1d95';
      rr(ctx, -1.5, -6, 3, 12, 1.5);
      ctx.fill();
    } else if (accId === 'wing_clips') {
      // Level 21: Pearl Fairy Wing Hairpin
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(4, 3);
      ctx.bezierCurveTo(-12, -10, -22, -2, -12, 4);
      ctx.bezierCurveTo(-18, 9, -8, 14, 4, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawHat(ctx, hatId, pose) {
    if (!hatId || hatId === 'none') return;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (hatId === 'beret') {
      // Cozy tilted French pastel beret
      ctx.translate(-3, -96);
      ctx.rotate(-0.16);
      const g = ctx.createLinearGradient(0, -16, 0, 10);
      g.addColorStop(0, '#f29bb8');
      g.addColorStop(1, '#d66d91');
      ctx.fillStyle = g;
      ctx.strokeStyle = '#873654';
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.ellipse(0, 0, 29, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Little beret stem
      ctx.beginPath();
      ctx.moveTo(0, -13); ctx.quadraticCurveTo(2, -19, 5, -18);
      ctx.stroke();
    } else if (hatId === 'sun_hat') {
      // Woven storybook straw sun hat with mint ribbon
      ctx.translate(0, -94);
      ctx.rotate(-0.04);
      ctx.fillStyle = '#f5dc9f';
      ctx.strokeStyle = '#9c783b';
      ctx.lineWidth = 2.1;
      // Wide curved brim
      ctx.beginPath();
      ctx.ellipse(0, 4, 40, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Crown dome
      ctx.beginPath();
      ctx.arc(0, 2, 22, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Mint silk ribbon band
      ctx.fillStyle = '#8fd4b6';
      ctx.strokeStyle = '#3f7a62';
      ctx.lineWidth = 1.6;
      rr(ctx, -22, -4, 44, 6.5, 3);
      ctx.fill();
      ctx.stroke();
    } else if (hatId === 'cap_baseball') {
      // Boy Starter: Pastel Sky & Cream Baseball Cap with curved forward visor!
      ctx.translate(0, -92);
      ctx.rotate(-0.05);
      // Curved visor pointing forward (+X)
      ctx.fillStyle = '#6ca9d9';
      ctx.strokeStyle = '#335d80';
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(4, 2);
      ctx.quadraticCurveTo(28, -2, 39, 6);
      ctx.quadraticCurveTo(26, 12, 2, 7);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Cap dome
      const cg = ctx.createLinearGradient(0, -18, 0, 6);
      cg.addColorStop(0, '#a3d2f5');
      cg.addColorStop(1, '#79b5e3');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(-2, 4, 25, Math.PI, 0);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Cream front panel & top button
      ctx.fillStyle = '#fff9ee';
      ctx.beginPath();
      ctx.arc(8, 3, 12, Math.PI * 1.15, Math.PI * 1.92);
      ctx.lineTo(8, 3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f6cf65';
      ctx.beginPath(); ctx.arc(-2, -21, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (hatId === 'beanie_cozy') {
      // Boy Starter: Cozy Pastel Teal Ribbed Knit Beanie with Pom-Pom!
      ctx.translate(-1, -93);
      ctx.rotate(-0.08);
      // Pom-pom on top
      ctx.fillStyle = '#fff5e6';
      ctx.strokeStyle = '#43736b';
      ctx.lineWidth = 1.9;
      ctx.beginPath(); ctx.arc(-2, -24, 7.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // Knit dome
      ctx.fillStyle = '#7bb8b0';
      ctx.strokeStyle = '#3a6660';
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.arc(0, 4, 26, Math.PI * 0.98, Math.PI * 2.02);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Ribbed fold cuff
      ctx.fillStyle = '#99cfc8';
      rr(ctx, -27, -2, 54, 10, 5);
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#4e857d';
      ctx.lineWidth = 1.4;
      [-18, -9, 0, 9, 18].forEach(rx => {
        ctx.beginPath(); ctx.moveTo(rx, -1); ctx.lineTo(rx, 7); ctx.stroke();
      });
    } else if (hatId === 'cap_explorer') {
      // Level 12 Boy Reward: Biscuit-Brown Storybook Newsboy / Explorer Flat Cap!
      ctx.translate(0, -93);
      ctx.rotate(-0.04);
      // Visor
      ctx.fillStyle = '#8f633e';
      ctx.strokeStyle = '#4f331c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(6, 3);
      ctx.quadraticCurveTo(26, 0, 35, 7);
      ctx.quadraticCurveTo(22, 11, 4, 7);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Rounded flat cap crown
      ctx.fillStyle = '#c79b6d';
      ctx.beginPath();
      ctx.ellipse(-2, -3, 28, 12.5, -0.06, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // Brass top button
      ctx.fillStyle = '#f6cf65';
      ctx.beginPath(); ctx.arc(-2, -15, 2.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (hatId === 'cat_ears') {
      // Level 6 Easter Egg: Headband with ONE Müezza grey ear + ONE Boncuk cream/mocha ear!
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.arc(0, -76, 27, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();

      // Left ear (Müezza smoky grey!)
      ctx.fillStyle = '#7c8594';
      ctx.strokeStyle = '#3f4654';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-22, -92); ctx.lineTo(-28, -114); ctx.lineTo(-8, -100);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.moveTo(-20, -95); ctx.lineTo(-24, -108); ctx.lineTo(-12, -100);
      ctx.closePath(); ctx.fill();

      // Right ear (Boncuk mocha/cream!)
      ctx.fillStyle = '#825d42';
      ctx.strokeStyle = '#4a311f';
      ctx.beginPath();
      ctx.moveTo(8, -100); ctx.lineTo(26, -114); ctx.lineTo(22, -92);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.moveTo(12, -99); ctx.lineTo(22, -108); ctx.lineTo(20, -95);
      ctx.closePath(); ctx.fill();
    } else if (hatId === 'cap_cat_beanie') {
      // Level 6 Boy Reward: Cozy Pastel Slate Knit Beanie with Müezza & Boncuk Cat Ears!
      ctx.translate(-1, -93);
      ctx.rotate(-0.05);
      // Left cat ear (Müezza grey)
      ctx.fillStyle = '#7c8594';
      ctx.strokeStyle = '#3f4654';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-22, -10); ctx.lineTo(-27, -30); ctx.lineTo(-8, -19);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#d6dde8';
      ctx.beginPath();
      ctx.moveTo(-20, -13); ctx.lineTo(-23, -24); ctx.lineTo(-12, -18);
      ctx.closePath(); ctx.fill();
      // Right cat ear (Boncuk warm mocha)
      ctx.fillStyle = '#825d42';
      ctx.strokeStyle = '#4a311f';
      ctx.beginPath();
      ctx.moveTo(8, -19); ctx.lineTo(26, -30); ctx.lineTo(22, -10);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f5e1cc';
      ctx.beginPath();
      ctx.moveTo(12, -18); ctx.lineTo(22, -24); ctx.lineTo(20, -13);
      ctx.closePath(); ctx.fill();
      // Cozy knit beanie dome
      ctx.fillStyle = '#6f87ad';
      ctx.strokeStyle = '#364866';
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.arc(0, 4, 26, Math.PI * 0.98, Math.PI * 2.02);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Cream ribbed fold cuff with paw patch
      ctx.fillStyle = '#f5ebd8';
      rr(ctx, -27, -2, 54, 10, 5);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#6f87ad';
      ctx.beginPath(); ctx.arc(0, 3, 2.6, 0, Math.PI * 2); ctx.fill();
    } else if (hatId === 'flower_crown') {
      // Level 12: Enchanted Meadow Flower Crown
      ctx.strokeStyle = '#5da373';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, -72, 27, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      const blooms = [
        [-22, -92, '#f9a8d4'], [-11, -98, '#fde047'], [0, -100, '#ffffff'],
        [11, -98, '#c4b5fd'], [22, -92, '#fda4af']
      ];
      blooms.forEach(([fx, fy, col]) => {
        ctx.fillStyle = col;
        ctx.strokeStyle = '#8c5368';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(fx, fy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(fx, fy, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (hatId === 'wizard_hat') {
      // Level 18: Curled-Tip Starlight Wizard Hat!
      ctx.translate(0, -96);
      ctx.rotate(-0.08 + pose.hairSway * 0.12);
      const wg = ctx.createLinearGradient(0, -48, 0, 8);
      wg.addColorStop(0, '#4f3f85');
      wg.addColorStop(1, '#7964b8');
      ctx.fillStyle = wg;
      ctx.strokeStyle = '#2a1d54';
      ctx.lineWidth = 2.2;
      // Wide brim
      ctx.beginPath();
      ctx.ellipse(0, 4, 38, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Whimsical curled cone
      ctx.beginPath();
      ctx.moveTo(-22, 3);
      ctx.bezierCurveTo(-18, -24, -4, -46, -24, -46);
      ctx.bezierCurveTo(-4, -56, 18, -32, 22, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Golden ribbon band & dangling star
      ctx.fillStyle = '#f6cf65';
      ctx.strokeStyle = '#9c731c';
      ctx.lineWidth = 1.5;
      rr(ctx, -21, -4, 42, 6.5, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.arc(-24, -42, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawNeckAccessory(ctx, neckAccId, pose) {
    if (!neckAccId || neckAccId === 'none') return;
    const sway = (pose.hairSway || 0) * 14;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (neckAccId === 'scarf_knit') {
      // Cozy pastel coral & cream striped knitted scarf!
      // Fluttering scarf tail
      ctx.fillStyle = '#f28c8c';
      ctx.strokeStyle = '#993d45';
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.moveTo(4, -10);
      ctx.quadraticCurveTo(12 - sway * 0.4, 2, 8 - sway * 0.6, 16);
      ctx.lineTo(-1 - sway * 0.5, 14);
      ctx.quadraticCurveTo(1, 0, -2, -10);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Cream stripe on tail
      ctx.fillStyle = '#fff5e6';
      ctx.fillRect(1 - sway * 0.3, 4, 8, 3.5);

      // Soft wrap around lower neck
      ctx.fillStyle = '#f7a1a1';
      rr(ctx, -12, -19, 24, 10, 5);
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#fff5e6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, -18); ctx.lineTo(-6, -10);
      ctx.moveTo(5, -18); ctx.lineTo(5, -10);
      ctx.stroke();
    } else if (neckAccId === 'bandana_star') {
      // Boy Starter: Pastel Sky Adventure Neckerchief Bandana with Star!
      ctx.fillStyle = '#73b3e3';
      ctx.strokeStyle = '#335d80';
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.moveTo(-13, -17);
      ctx.quadraticCurveTo(0, -12, 13, -17);
      ctx.lineTo(2, 3);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Tiny golden star emblem
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(1.5, -7, 2.5, 0, Math.PI * 2); ctx.fill();
    } else if (neckAccId === 'bowtie_cute') {
      // Level 3 Boy Reward: Smart Pastel Navy & Gold Bow Tie!
      ctx.fillStyle = '#4e74a6';
      ctx.strokeStyle = '#253c5e';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(1, -13); ctx.lineTo(-9, -18); ctx.lineTo(-9, -8); ctx.closePath();
      ctx.moveTo(1, -13); ctx.lineTo(11, -18); ctx.lineTo(11, -8); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f6cf65';
      ctx.beginPath(); ctx.arc(1, -13, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (neckAccId === 'medal_hero') {
      // Level 9 Boy Reward: Golden Paw-Hero Medallion on Sky Ribbon!
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(-9, -16); ctx.lineTo(1, -2); ctx.lineTo(10, -16);
      ctx.stroke();
      ctx.fillStyle = '#f6cf65';
      ctx.strokeStyle = '#9c731c';
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(1, 3, 6.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff9e6';
      ctx.beginPath(); ctx.arc(1, 3, 2.4, 0, Math.PI * 2); ctx.fill();
    } else if (neckAccId === 'badge_knight') {
      // Level 21 Boy Reward: Golden Royal Cat-Shield Clasp Brooch!
      ctx.fillStyle = '#f6cf65';
      ctx.strokeStyle = '#9c731c';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-6, -15); ctx.lineTo(8, -15); ctx.lineTo(8, -7);
      ctx.quadraticCurveTo(1, -1, -6, -7); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath(); ctx.arc(1, -10, 2.6, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore();
  }

  // =========================================================================
  // 10. CELEBRATION / HUG OVERLAY FX
  // =========================================================================
  function drawStateFX(ctx, pose, animTimer) {
    if (pose.showSparkles) {
      ctx.save();
      for (let i = 0; i < 4; i++) {
        const ang = animTimer * 3 + (i * Math.PI) / 2;
        const sx = Math.cos(ang) * 46;
        const sy = -62 + Math.sin(ang * 1.3) * 26;
        ctx.fillStyle = i % 2 === 0 ? '#fde047' : '#f472b6';
        ctx.font = '18px serif';
        ctx.textAlign = 'center';
        ctx.fillText(i % 2 === 0 ? '✨' : '⭐', sx, sy);
      }
      ctx.restore();
    }
    if (pose.showHearts) {
      ctx.save();
      const pulse = 1 + Math.sin(animTimer * 5) * 0.16;
      ctx.translate(0, -118);
      ctx.scale(pulse, pulse);
      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      ctx.fillText('💖', 0, 0);
      ctx.restore();
    }
  }

  // =========================================================================
  // 11. MASTER ENTRY POINT: HumanRenderer.draw(...)
  // =========================================================================
  /**
   * Draws the full layered storybook child character inside box (x, y, width, height)
   * with feet cleanly planted at y + height!
   */
  function draw(ctx, x, y, width, height, state = 'idle', facingRight = true, animTimer = 0, isHurt = false, heroConfig = null) {
    const { cfg, skin, hair, eye } = resolveConfig(heroConfig);
    const pose = computePose(state, animTimer, isHurt);

    ctx.save();

    // Scale master 200x280 space (feet at y=+122, head+hat top at y=-132 => ~254 height)
    const scale = height / 245;
    const centerX = x + width / 2;
    const feetY = y + height;

    ctx.translate(centerX, feetY - 122 * scale);
    ctx.scale(scale * (facingRight ? 1 : -1), scale);

    if (isHurt && Math.floor(animTimer * 16) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    // 1. Soft Ground Contact Shadow
    ctx.save();
    const shadowScale = state === 'jump' || state === 'fall' ? 0.65 : 1.0;
    ctx.fillStyle = 'rgba(72, 46, 32, 0.14)';
    ctx.beginPath();
    ctx.ellipse(0, 121, 28 * shadowScale, 6.5 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Apply body bob & squash/stretch pivoted at feet
    ctx.translate(0, 122);
    ctx.scale(pose.squashX, pose.squashY);
    ctx.translate(0, -122 + pose.bodyBob);

    // 2. Back Cape / Fairy Wings / Rested Hood
    ctx.save();
    ctx.rotate(pose.torsoTilt);
    drawBackGarmentExtras(ctx, cfg, pose, animTimer);

    // 3. Back Hair Layer (behind shoulders & neck)
    ctx.save();
    ctx.translate(0, -34);
    ctx.rotate(pose.headTilt);
    ctx.translate(0, 34);
    drawHairBack(ctx, cfg, hair, pose);
    ctx.restore();

    // 4. Far Arm (behind torso)
    drawArm(ctx, 15, -10, pose.backShoulder, pose.backElbow, cfg, skin, false);
    ctx.restore();

    // 5. Legs (Far leg then Near leg — naturally planted below torso)
    drawLeg(ctx, 8, 38, pose.backHip, pose.backKnee, cfg, skin, false);
    drawLeg(ctx, -7, 38, pose.frontHip, pose.frontKnee, cfg, skin, true);

    // 6. Upper Body & Head Group (with torso tilt)
    ctx.save();
    ctx.rotate(pose.torsoTilt);

    // 6a. Bottom Garment (Skirts / Waistband / Pants pelvis)
    drawBottomGarment(ctx, cfg, pose);

    // 6b. Torso & Top Garment (or Special Milestone Outfit)
    drawTorsoAndTop(ctx, cfg, pose);

    // 6c. Neck + Head + Face + Glasses + Front Hair + Accessories + Hat
    drawNeckAndHead(ctx, cfg, skin, hair, eye, pose);

    // 6c2. Neck & Style Accessory (Scarf, Bandana, Bow Tie, Hero Medal!)
    drawNeckAccessory(ctx, cfg.neckAcc, pose);

    // 6d. Near Arm (in front of torso!)
    drawArm(ctx, -15, -10, pose.frontShoulder, pose.frontElbow, cfg, skin, true);

    // 6e. Joy / Hug FX
    drawStateFX(ctx, pose, animTimer);

    ctx.restore();
    ctx.restore();
  }

  /**
   * Renders a lush sunlit pastel studio pedestal & live character preview
   */
  function drawStudioPreview(ctx, cssWidth, cssHeight, heroConfig, state = 'idle', facingRight = true, animTimer = 0) {
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    // Soft pastel fairy-tale meadow/atelier backdrop
    const bg = ctx.createLinearGradient(0, 0, 0, cssHeight);
    bg.addColorStop(0, '#fff9f2');
    bg.addColorStop(0.65, '#fceef5');
    bg.addColorStop(1, '#f3e8fa');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    // Soft glowing sun halo behind character
    const halo = ctx.createRadialGradient(cssWidth * 0.5, cssHeight * 0.42, 10, cssWidth * 0.5, cssHeight * 0.42, cssWidth * 0.48);
    halo.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
    halo.addColorStop(0.6, 'rgba(253, 230, 138, 0.22)');
    halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    // Gentle pastel floating petals & sparkles
    for (let i = 0; i < 6; i++) {
      const px = ((i * 47 + animTimer * 10) % (cssWidth + 20)) - 10;
      const py = 26 + ((i * 53 + Math.sin(animTimer * 1.5 + i) * 14) % (cssHeight - 70));
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.font = '13px serif';
      ctx.fillText(i % 2 === 0 ? '🌸' : '✨', px, py);
      ctx.restore();
    }

    // Cozy grassy pastel pedestal
    ctx.fillStyle = '#d9f2e1';
    ctx.strokeStyle = '#a7dfc0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cssWidth / 2, cssHeight - 24, cssWidth * 0.36, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw the actual character (large & crisp!)
    const charH = cssHeight * 0.78;
    const charW = charH * 0.72;
    const charX = (cssWidth - charW) / 2;
    const charY = cssHeight - 22 - charH;

    draw(ctx, charX, charY, charW, charH, state, facingRight, animTimer, false, heroConfig);

    // If previewing 'hug', also show mini Boncuk & Müezza snuggling up!
    if (state === 'hug' && window.SpriteRenderer) {
      window.SpriteRenderer.drawMuezza(ctx, charX - 24, cssHeight - 64, 52, 44, 'idle', true, animTimer, false);
      window.SpriteRenderer.drawBoncuk(ctx, charX + charW - 26, cssHeight - 62, 50, 42, 'idle', false, animTimer, false);
    }
  }

  window.HumanRenderer = {
    draw,
    drawStudioPreview,
    computePose
  };
})();
