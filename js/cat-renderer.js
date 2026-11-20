/**
 * save.meow — Play with Mel
 * High-Craft 2D Storybook Cat Character, Costume & Interactive Animation Renderer
 *
 * - Matches HumanRenderer's pastel storybook illustration quality & soft warm outlines
 * - Preserves Boncuk's (cream/mocha + sky-blue eyes) & Müezza's (fluffy grey + amber eyes)
 *   authentic identities across every single accessory, costume, and animation state!
 * - Master design space: 220 x 180 units (origin at torso center (0,0), ground at y=+66)
 * - Live interactive animations: blink, content squint, yawn, ear twitch, collar paw-touch,
 *   dangling tag swing, billowing scarf, fluttering wings, bouncing tutu, waving mermaid tail,
 *   and two-cat reunion interactions (Boncuk batting tag, Müezza sniffing scarf)!
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

  function drawStarShape(ctx, cx, cy, outerR, innerR, points = 5) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i * Math.PI) / points - Math.PI / 2;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function drawHeartShape(ctx, cx, cy, size) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + size * 0.45);
    ctx.bezierCurveTo(cx - size * 1.15, cy - size * 0.25, cx - size * 0.65, cy - size * 1.15, cx, cy - size * 0.35);
    ctx.bezierCurveTo(cx + size * 0.65, cy - size * 1.15, cx + size * 1.15, cy - size * 0.25, cx, cy + size * 0.45);
    ctx.closePath();
  }

  // =========================================================================
  // 1. LIVING CAT POSE & ACCESSORY INTERACTION ENGINE
  // =========================================================================
  function computeCatPose(catId, state, animTimer, cfg, options = {}) {
    const t = animTimer || 0;
    const phaseOff = catId === 'boncuk' ? 1.9 : 0.0;
    const tl = t + phaseOff;

    const hasCollarOrTag = (cfg.collar && cfg.collar !== 'none') || (cfg.tag && cfg.tag !== 'none');

    const pose = {
      bodyBob: 0,
      torsoTilt: 0,
      squashX: 1,
      squashY: 1,
      headTilt: 0,
      headOffsetX: 0,
      headOffsetY: 0,
      backLegFar: 0,
      backLegNear: 0,
      frontLegFar: 0,
      frontLegNear: 0,
      frontNearLift: 0,    // 0..1: lifts near paw toward collar or playfully forward!
      frontNearReach: 0,   // 0..1: reaches forward to bat companion's tag!
      tailSway: Math.sin(tl * 2.4) * 0.22,
      earTwitch: 0,
      eyeMode: 'normal',   // 'normal', 'blink', 'squint', 'hurt', 'wide'
      mouthMode: 'smile',  // 'smile', 'yawn', 'happy', 'hurt'
      yawnAmount: 0,
      // Dynamic accessory physics
      tagSwing: Math.sin(tl * 2.8) * 0.14,
      scarfWave: Math.sin(tl * 2.5) * 0.14,
      flowerWiggle: Math.sin(tl * 3.0) * 0.10,
      hatBob: 0,
      hatTilt: 0,
      wingFlutter: Math.sin(t * 24) * 0.32,
      tutuBounce: Math.sin(tl * 2.4) * 1.2,
      mermaidWave: Math.sin(t * 4.5),
      showHearts: false,
      showSparkles: false
    };

    // Natural gentle blink (~every 3.5s)
    const blinkCycle = tl % 3.5;
    if (blinkCycle > 3.36) {
      pose.eyeMode = 'blink';
    }

    if (state === 'walk') {
      const w = t * 8.2;
      const s = Math.sin(w);
      pose.bodyBob = -Math.abs(s) * 4.0 + 1.2;
      pose.torsoTilt = 0.04;
      pose.headTilt = 0.02 + s * 0.03;
      pose.frontLegNear = s * 0.45;
      pose.frontLegFar = -s * 0.45;
      pose.backLegNear = -s * 0.42;
      pose.backLegFar = s * 0.42;
      pose.tailSway = 0.18 + Math.sin(w - 0.6) * 0.28;
      pose.tagSwing = -0.18 + Math.sin(w) * 0.28;
      pose.scarfWave = 0.55 + Math.sin(w - 0.5) * 0.25;
      pose.flowerWiggle = Math.sin(w) * 0.24;
      pose.hatBob = -Math.abs(s) * 1.8;
      pose.hatTilt = -0.05 + s * 0.06;
      pose.tutuBounce = Math.sin(w * 2) * 2.6;
      pose.wingFlutter = Math.sin(t * 28) * 0.44;
    } else if (state === 'run') {
      const r = t * 14.5;
      const s = Math.sin(r);
      pose.bodyBob = -Math.abs(s) * 7.5 + 2.0;
      pose.torsoTilt = 0.11 + s * 0.04;
      pose.squashX = 1.05;
      pose.squashY = 0.96;
      pose.headTilt = -0.05 + s * 0.04;
      pose.frontLegNear = s * 0.78;
      pose.frontLegFar = -s * 0.68;
      pose.backLegNear = -s * 0.75;
      pose.backLegFar = s * 0.65;
      pose.tailSway = 0.36 + Math.sin(r - 0.8) * 0.38;
      pose.tagSwing = -0.42 + Math.sin(r) * 0.36;
      pose.scarfWave = 1.15 + Math.sin(r - 0.6) * 0.34;
      pose.flowerWiggle = -0.18 + Math.sin(r) * 0.36;
      pose.hatBob = -Math.abs(s) * 3.5;
      pose.hatTilt = -0.11 + s * 0.09;
      pose.tutuBounce = -3.5 + Math.sin(r * 2) * 4.0;
      pose.wingFlutter = Math.sin(t * 36) * 0.56;
      pose.mermaidWave = Math.sin(t * 10);
      pose.mouthMode = 'happy';
    } else if (state === 'jump') {
      pose.squashX = 1.10;
      pose.squashY = 0.91;
      pose.bodyBob = -5;
      pose.torsoTilt = -0.14;
      pose.headTilt = -0.08;
      pose.frontLegNear = -0.78;
      pose.frontLegFar = -0.52;
      pose.backLegNear = 0.72;
      pose.backLegFar = 0.56;
      pose.tailSway = -0.45;
      pose.tagSwing = -0.35 + Math.sin(t * 10) * 0.12;
      pose.scarfWave = 1.05 + Math.sin(t * 10) * 0.22;
      pose.flowerWiggle = -0.26;
      pose.hatBob = -5.5;
      pose.hatTilt = -0.15;
      pose.tutuBounce = -6.5 + Math.sin(t * 14) * 2.2;
      pose.wingFlutter = Math.sin(t * 44) * 0.68;
      pose.mermaidWave = Math.sin(t * 12) * 1.25;
      pose.eyeMode = 'wide';
      pose.mouthMode = 'happy';
    } else if (state === 'fall') {
      pose.squashX = 0.93;
      pose.squashY = 1.07;
      pose.torsoTilt = 0.12;
      pose.headTilt = 0.08;
      pose.frontLegNear = 0.32;
      pose.frontLegFar = 0.18;
      pose.backLegNear = -0.28;
      pose.backLegFar = -0.16;
      pose.tailSway = 0.52 + Math.sin(t * 9) * 0.14;
      pose.tagSwing = 0.25 + Math.sin(t * 9) * 0.15;
      pose.scarfWave = 0.95 + Math.sin(t * 12) * 0.28;
      pose.flowerWiggle = 0.24;
      pose.hatBob = -7.2;
      pose.hatTilt = 0.13;
      pose.tutuBounce = -8.0;
      pose.wingFlutter = Math.sin(t * 42) * 0.64;
    } else if (state === 'land') {
      pose.squashX = 1.18;
      pose.squashY = 0.84;
      pose.bodyBob = 8;
      pose.hatBob = 3.2;
      pose.hatTilt = 0.07;
      pose.tutuBounce = 5.5;
      pose.tagSwing = 0.28;
      pose.scarfWave = 0.45;
    } else if (state === 'hurt') {
      pose.squashX = 0.94;
      pose.squashY = 1.04;
      pose.torsoTilt = -0.10;
      pose.headTilt = -0.12;
      pose.eyeMode = 'hurt';
      pose.mouthMode = 'hurt';
      pose.tailSway = -0.4;
      pose.hatTilt = -0.18;
    } else if (state === 'celebrate') {
      const hop = Math.abs(Math.sin(t * 7.2));
      pose.bodyBob = -hop * 14;
      pose.squashX = 1 - hop * 0.05;
      pose.squashY = 1 + hop * 0.06;
      pose.torsoTilt = Math.sin(t * 7.2) * 0.06;
      pose.headTilt = Math.sin(t * 7.2) * 0.10;
      pose.frontNearLift = 0.72 + hop * 0.22;
      pose.tailSway = Math.sin(t * 10) * 0.48;
      pose.tagSwing = Math.sin(t * 10) * 0.42;
      pose.scarfWave = 0.7 + hop * 0.55;
      pose.flowerWiggle = Math.sin(t * 11) * 0.35;
      pose.hatBob = -hop * 5.2;
      pose.tutuBounce = -hop * 6.0;
      pose.wingFlutter = Math.sin(t * 42) * 0.65;
      pose.eyeMode = 'squint';
      pose.mouthMode = 'happy';
      pose.showSparkles = true;
      pose.showHearts = true;
    } else if (state === 'interact') {
      const role = options.interactRole || 'solo';
      if (role === 'bat_tag') {
        // Boncuk playfully batting Müezza's dangling tag/collar!
        const bat = Math.max(0, Math.sin(t * 5.2));
        pose.bodyBob = Math.sin(t * 3.0) * 1.8;
        pose.torsoTilt = 0.05;
        pose.headTilt = 0.10 + bat * 0.06;
        pose.frontNearReach = 0.45 + bat * 0.55;
        pose.tailSway = Math.sin(t * 5.5) * 0.36;
        pose.tagSwing = Math.sin(t * 6) * 0.25;
        pose.flowerWiggle = Math.sin(t * 5.2) * 0.26;
        pose.eyeMode = bat > 0.75 ? 'squint' : 'normal';
        pose.mouthMode = 'happy';
        pose.showHearts = true;
      } else if (role === 'sniff_scarf') {
        // Müezza gently leaning in & sniffing Boncuk's scarf/flower with happy eyes!
        const sniff = Math.sin(t * 5.8);
        pose.bodyBob = Math.sin(t * 2.8) * 1.8;
        pose.headOffsetX = 4.5 + sniff * 1.6;
        pose.headOffsetY = 2.0 + Math.abs(sniff) * 1.4;
        pose.headTilt = 0.14 + sniff * 0.05;
        pose.tailSway = Math.sin(t * 4.6) * 0.34;
        pose.tagSwing = Math.sin(t * 5.8) * 0.38; // Tag jiggles when Boncuk bats it!
        pose.scarfWave = 0.25 + sniff * 0.15;
        pose.eyeMode = 'squint';
        pose.mouthMode = 'happy';
        pose.showHearts = true;
      } else {
        // Solo Studio "Etkileşim" Demo: Look at collar/tag & paw touch + happy purr wiggle!
        const cyc = t % 4.0;
        if (cyc < 2.2) {
          const p = Math.sin((cyc / 2.2) * Math.PI);
          pose.headTilt = 0.26 * p;
          pose.headOffsetY = 3.5 * p;
          pose.frontNearLift = 0.85 * p;
          pose.tagSwing = Math.sin(t * 14) * 0.52 * p;
          pose.scarfWave = 0.35 * p + Math.sin(t * 6) * 0.2;
          pose.flowerWiggle = Math.sin(t * 9) * 0.28 * p;
          pose.hatTilt = 0.12 * p;
          pose.tailSway = Math.sin(t * 6) * 0.36;
          pose.mouthMode = 'happy';
          pose.showSparkles = p > 0.4;
        } else {
          const p = Math.sin(((cyc - 2.2) / 1.8) * Math.PI);
          pose.eyeMode = 'squint';
          pose.mouthMode = 'happy';
          pose.bodyBob = -2.5 * p;
          pose.wingFlutter = Math.sin(t * 34) * 0.55;
          pose.tutuBounce = -4.0 * p;
          pose.showHearts = p > 0.35;
        }
      }
    } else {
      // Living IDLE state: breathing, tail sway, happy squint, collar check & paw touch, and cute cat yawn!
      const breath = Math.sin(tl * 2.2);
      pose.bodyBob = breath * 1.7;
      pose.headTilt = Math.sin(tl * 1.1) * 0.035;

      const idleCycle = tl % 14.0;

      // 2.4s .. 3.8s: Soft happy content squint
      if (idleCycle >= 2.4 && idleCycle < 3.8) {
        pose.eyeMode = 'squint';
        pose.headTilt = Math.sin((idleCycle - 2.4) * 2.2) * 0.08;
      }
      // 5.2s .. 7.1s: Interactive Collar / Tag Check & Cute Paw Touch!
      else if (idleCycle >= 5.2 && idleCycle < 7.1) {
        const p = Math.sin(((idleCycle - 5.2) / 1.9) * Math.PI);
        if (hasCollarOrTag) {
          pose.headTilt = 0.24 * p;
          pose.headOffsetY = 3.0 * p;
          pose.frontNearLift = 0.82 * p;
          pose.tagSwing = Math.sin(tl * 13) * 0.48 * p;
          pose.tailSway = Math.sin(tl * 5.0) * 0.32;
        } else {
          pose.headTilt = -0.14 * p;
          pose.earTwitch = Math.sin(tl * 16) * 0.18 * p;
        }
      }
      // 9.4s .. 11.1s: Adorable Cat Yawn!
      else if (idleCycle >= 9.4 && idleCycle < 11.1) {
        const y = Math.sin(((idleCycle - 9.4) / 1.7) * Math.PI);
        pose.yawnAmount = y;
        pose.mouthMode = y > 0.2 ? 'yawn' : 'smile';
        pose.eyeMode = y > 0.22 ? 'squint' : pose.eyeMode;
        pose.headTilt = -0.13 * y;
        pose.earTwitch = -0.16 * y;
      }
      // 12.1s .. 13.0s: Playful ear twitch
      else if (idleCycle >= 12.1 && idleCycle < 13.0) {
        pose.earTwitch = Math.sin((idleCycle - 12.1) * 18) * 0.22;
      }
    }

    if (isHurtFlag(options)) {
      pose.eyeMode = 'hurt';
      pose.mouthMode = 'hurt';
    }

    return pose;
  }

  function isHurtFlag(options) {
    return !!(options && options.isHurt);
  }

  // =========================================================================
  // 2. RESOLVE CONFIG & AUTHENTIC CAT IDENTITY PALETTES (NEVER ALTERED!)
  // =========================================================================
  function getCatIdentity(catId) {
    if (catId === 'boncuk') {
      return {
        id: 'boncuk',
        isFluffy: false,
        furLight: '#fffdf8',
        furBase: '#faf2e6',
        furShadow: '#ead9c5',
        belly: '#ffffff',
        outline: '#634636',
        maskBase: '#8a6852',
        maskDeep: '#694a38',
        earOuter: '#5b3f30',
        earInner: '#f9c6cc',
        pawColor: '#ab8971',
        mittenWhite: true,
        nose: '#593c2e',
        eyeOuter: '#1b4f85',
        eyeMid: '#3a9ee8',
        eyeGlow: '#b8e8ff',
        blush: 'rgba(244, 152, 178, 0.38)',
        bodyRx: 42,
        bodyRy: 27,
        headRx: 34,
        headRy: 29
      };
    }
    return {
      id: 'muezza',
      isFluffy: true,
      furLight: '#a9b3be',
      furBase: '#85909e',
      furShadow: '#646f7d',
      belly: '#b6bfc9',
      outline: '#3e4754',
      maskBase: null,
      maskDeep: null,
      earOuter: '#616c7a',
      earInner: '#eabec7',
      pawColor: '#75808e',
      mittenWhite: false,
      nose: '#5e3c3c',
      eyeOuter: '#6e3408',
      eyeMid: '#df8c12',
      eyeGlow: '#fff085',
      blush: 'rgba(244, 152, 178, 0.30)',
      bodyRx: 47,
      bodyRy: 31,
      headRx: 38,
      headRy: 32
    };
  }

  function resolveCatConfig(catId, configOverride) {
    const CWS = window.CatWardrobeSystem;
    if (CWS) {
      const raw = configOverride || CWS.getCatConfig(catId);
      return CWS.sanitizeCatConfig(catId, raw);
    }
    return configOverride || { collar: 'none', tag: 'none', neckwear: 'none', headwear: 'none', outfit: 'none', eyeAcc: 'none' };
  }

  // =========================================================================
  // 3. LAYER RENDERERS: BACK EXTRAS (WINGS / CAPES)
  // =========================================================================
  function drawBackWingsAndCape(ctx, cfg, pose, isBackWing = true) {
    const o = cfg.outfit;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (o === 'outfit_bee') {
      // Translucent iridescent fluttering bee wings!
      ctx.save();
      ctx.translate(-6, -18);
      ctx.rotate((isBackWing ? -0.52 : -0.18) + pose.wingFlutter * (isBackWing ? 0.9 : -1.0));
      ctx.fillStyle = isBackWing ? 'rgba(224, 245, 255, 0.78)' : 'rgba(255, 255, 255, 0.85)';
      ctx.strokeStyle = '#7bb8d9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(-16, -12, 22, 12, -0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Wing vein
      ctx.strokeStyle = 'rgba(123, 184, 217, 0.55)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-4, -8); ctx.quadraticCurveTo(-18, -14, -30, -14);
      ctx.stroke();
      ctx.restore();
    } else if (o === 'outfit_fairy') {
      // Pastel gossamer flower-fairy butterfly wings!
      ctx.save();
      ctx.translate(-8, -16);
      ctx.rotate((isBackWing ? -0.42 : -0.10) + pose.wingFlutter * (isBackWing ? 0.75 : -0.9));
      const g = ctx.createLinearGradient(-38, -28, 0, 8);
      g.addColorStop(0, 'rgba(249, 184, 220, 0.85)');
      g.addColorStop(0.55, 'rgba(218, 198, 252, 0.82)');
      g.addColorStop(1, 'rgba(186, 232, 255, 0.82)');
      ctx.fillStyle = g;
      ctx.strokeStyle = '#b482c9';
      ctx.lineWidth = 2;
      // Upper wing petal
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-16, -34, -46, -30, -38, -6);
      ctx.bezierCurveTo(-30, 6, -10, 6, 0, 0);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Lower wing petal
      ctx.beginPath();
      ctx.moveTo(-2, 2);
      ctx.bezierCurveTo(-24, 4, -34, 22, -18, 26);
      ctx.bezierCurveTo(-6, 28, 0, 14, -2, 2);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    // Flowing Royal / Holiday / Halloween / Detective Capes (drawn behind body on back pass only!)
    if (isBackWing && (o === 'outfit_princess' || o === 'outfit_prince' || o === 'outfit_halloween' || o === 'outfit_christmas')) {
      const wave = pose.scarfWave * 10;
      let c1 = '#f7a8c4', c2 = '#e678a3', stroke = '#9c3d65', trim = '#f6cf65';
      if (o === 'outfit_prince') { c1 = '#6784d4'; c2 = '#445da8'; stroke = '#283873'; trim = '#f6cf65'; }
      if (o === 'outfit_halloween') { c1 = '#7c5cbf'; c2 = '#533794'; stroke = '#2e1c5e'; trim = '#fb923c'; }
      if (o === 'outfit_christmas') { c1 = '#e85d75'; c2 = '#c93852'; stroke = '#7d1e31'; trim = '#ffffff'; }

      const cg = ctx.createLinearGradient(8, -12, -52 - wave, 22);
      cg.addColorStop(0, c1);
      cg.addColorStop(1, c2);
      ctx.fillStyle = cg;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(12, -16);
      ctx.quadraticCurveTo(-18, -22, -48 - wave, -4);
      ctx.quadraticCurveTo(-56 - wave * 1.2, 12, -40 - wave, 24);
      ctx.quadraticCurveTo(-14, 18, 12, 8);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Trim border
      ctx.strokeStyle = trim;
      ctx.lineWidth = o === 'outfit_christmas' ? 4.5 : 2.6;
      ctx.beginPath();
      ctx.moveTo(-47 - wave, -2);
      ctx.quadraticCurveTo(-54 - wave * 1.2, 12, -39 - wave, 23);
      ctx.stroke();
    }

    ctx.restore();
  }

  // =========================================================================
  // 4. TAIL LAYER (Boncuk Slender Tail / Müezza Plumed Tail / Mermaid Tail!)
  // =========================================================================
  function drawTail(ctx, id, cfg, pose) {
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (cfg.outfit === 'outfit_mermaid') {
      // Shimmering Pastel Mermaid Tail with natural wave animation!
      const wave = pose.mermaidWave * 10;
      ctx.translate(-34, 8);
      ctx.rotate(pose.tailSway * 0.45);

      const mg = ctx.createLinearGradient(0, -10, -56, 18);
      mg.addColorStop(0, '#88e0d8');
      mg.addColorStop(0.55, '#8ec8f6');
      mg.addColorStop(1, '#c9b6f7');
      ctx.fillStyle = mg;
      ctx.strokeStyle = '#3f7c8a';
      ctx.lineWidth = 2.4;

      // Tapered tail body
      ctx.beginPath();
      ctx.moveTo(8, -14);
      ctx.bezierCurveTo(-14, -14, -34, -4 + wave * 0.4, -48, 4 + wave * 0.8);
      ctx.bezierCurveTo(-34, 22 + wave * 0.5, -10, 22, 8, 14);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Shimmering translucent fin fan!
      const fg = ctx.createLinearGradient(-44, 0, -74, 10 + wave);
      fg.addColorStop(0, '#c4b5fd');
      fg.addColorStop(1, '#fbcfe8');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(-45, 4 + wave * 0.8);
      ctx.bezierCurveTo(-58, -18 + wave, -76, -12 + wave * 1.1, -64, 4 + wave);
      ctx.bezierCurveTo(-76, 20 + wave * 1.1, -56, 26 + wave, -45, 6 + wave * 0.8);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Delicate scale arcs
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 1.6;
      [[-8, -2], [-18, 2], [-28, 3]].forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.arc(sx, sy + wave * 0.25, 5, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();
      });
      ctx.restore();
      return;
    }

    ctx.translate(-36, 4);
    ctx.rotate(-0.18 + pose.tailSway);

    if (id.isFluffy) {
      // MÜEZZA: Huge Plush Plumed Bottle-Brush Grey Tail!
      const tg = ctx.createLinearGradient(0, 6, -38, -46);
      tg.addColorStop(0, id.furShadow);
      tg.addColorStop(0.45, id.furBase);
      tg.addColorStop(1, id.furLight);
      ctx.fillStyle = tg;
      ctx.strokeStyle = id.outline;
      ctx.lineWidth = 2.6;

      ctx.beginPath();
      ctx.moveTo(4, 8);
      ctx.bezierCurveTo(-24, 10, -48, -10, -40, -34);
      ctx.bezierCurveTo(-36, -50, -14, -56, -8, -42);
      ctx.bezierCurveTo(-2, -32, -16, -24, -14, -14);
      ctx.bezierCurveTo(-10, -4, 4, -6, 6, 2);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Fluffy interior plume highlight
      ctx.fillStyle = 'rgba(220, 228, 236, 0.42)';
      ctx.beginPath();
      ctx.ellipse(-25, -28, 9, 15, -0.35, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // BONCUK: Graceful Slender S-Curved Caramel-to-Chocolate Tail!
      const tg = ctx.createLinearGradient(0, 4, -30, -52);
      tg.addColorStop(0, id.furBase);
      tg.addColorStop(0.55, '#9d7c66');
      tg.addColorStop(1, '#593d2e');
      ctx.fillStyle = tg;
      ctx.strokeStyle = id.outline;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(4, 6);
      ctx.bezierCurveTo(-18, 6, -34, -14, -28, -36);
      ctx.bezierCurveTo(-24, -48, -14, -52, -11, -44);
      ctx.bezierCurveTo(-8, -36, -20, -28, -18, -14);
      ctx.bezierCurveTo(-16, -4, -4, -4, 4, -4);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    }

    ctx.restore();
  }

  // =========================================================================
  // 5. ARTICULATED LEGS & SOFT PAWS
  // =========================================================================
  function drawLeg(ctx, id, cfg, x, y, angle, isFront, isNear, lift = 0, reach = 0) {
    ctx.save();
    ctx.translate(x, y);

    // Interactive paw animations (touching collar OR batting companion's tag!)
    if (isFront && isNear && (lift > 0.02 || reach > 0.02)) {
      if (reach > 0.02) {
        ctx.translate(reach * 14, -reach * 16);
        ctx.rotate(-reach * 1.15);
      } else {
        ctx.translate(lift * 4, -lift * 16);
        ctx.rotate(-lift * 1.42);
      }
    } else {
      ctx.rotate(angle);
    }

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const w = id.isFluffy ? 18 : 15;
    const h = 34;
    const legCol = isFront
      ? (isNear ? id.pawColor : id.furShadow)
      : (isNear ? id.furBase : id.furShadow);

    // Jumpsuit sleeve/boot leg for astronaut / bee / police / soldier
    let wearBoot = null;
    if (cfg.outfit === 'outfit_astronaut') wearBoot = { leg: '#f8fafc', boot: '#93c5fd', stroke: '#475569' };
    else if (cfg.outfit === 'outfit_bee') wearBoot = { leg: '#fde047', boot: '#3f3528', stroke: '#422006' };
    else if (cfg.outfit === 'outfit_police') wearBoot = { leg: '#5b7eb5', boot: '#2b3d5c', stroke: '#1e2c45' };

    ctx.fillStyle = wearBoot ? wearBoot.leg : legCol;
    ctx.strokeStyle = wearBoot ? wearBoot.stroke : id.outline;
    ctx.lineWidth = 2.4;

    // Sculpted soft leg silhouette (seamless fur join at top — no harsh horizontal cut across belly!)
    const hw = w / 2;
    ctx.beginPath();
    ctx.moveTo(-hw, -2);
    ctx.quadraticCurveTo(-hw - 1, h * 0.45, -hw + 1, h - 6);
    ctx.lineTo(hw - 1, h - 6);
    ctx.quadraticCurveTo(hw + 1, h * 0.45, hw, -2);
    ctx.closePath();
    ctx.fill();

    // Stroke only the outer left & right leg edges (keeps shoulder/hip join organic!)
    ctx.beginPath();
    ctx.moveTo(-hw, 3);
    ctx.quadraticCurveTo(-hw - 1, h * 0.48, -hw + 1, h - 6);
    ctx.moveTo(hw, 3);
    ctx.quadraticCurveTo(hw + 1, h * 0.48, hw - 1, h - 6);
    ctx.stroke();

    // Cute rounded paw at bottom
    const pawFill = wearBoot
      ? wearBoot.boot
      : (id.mittenWhite ? '#ffffff' : (isNear ? id.furLight : id.furBase));
    ctx.fillStyle = pawFill;
    ctx.beginPath();
    ctx.ellipse(2.5, h - 4, w * 0.62, 7.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Gentle toe creases (adorable storybook touch!)
    ctx.strokeStyle = wearBoot ? wearBoot.stroke : id.outline;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(4, h - 6); ctx.lineTo(4, h + 1);
    ctx.moveTo(8, h - 5); ctx.lineTo(8, h + 1);
    ctx.stroke();

    ctx.restore();
  }

  // =========================================================================
  // 6. PLUSH BODY & CHEST FLUFF
  // =========================================================================
  function drawBody(ctx, id) {
    ctx.save();
    ctx.lineJoin = 'round';

    const bg = ctx.createRadialGradient(8, -10, 6, 0, 4, id.bodyRx + 14);
    bg.addColorStop(0, id.furLight);
    bg.addColorStop(0.58, id.furBase);
    bg.addColorStop(1, id.furShadow);

    ctx.fillStyle = bg;
    ctx.strokeStyle = id.outline;
    ctx.lineWidth = 2.7;

    ctx.beginPath();
    ctx.ellipse(-2, 4, id.bodyRx, id.bodyRy, -0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Soft bright chest & belly highlight
    ctx.fillStyle = id.belly;
    ctx.beginPath();
    ctx.ellipse(16, 6, id.bodyRx * 0.46, id.bodyRy * 0.68, 0.12, 0, Math.PI * 2);
    ctx.fill();

    // MÜEZZA'S SIGNATURE FLUFFY LION-MANE CHEST RUFF!
    if (id.isFluffy) {
      const mg = ctx.createRadialGradient(22, -4, 4, 18, 2, 26);
      mg.addColorStop(0, '#c2cad4');
      mg.addColorStop(1, '#8c97a6');
      ctx.fillStyle = mg;
      ctx.strokeStyle = id.outline;
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(6, -12);
      ctx.quadraticCurveTo(22, -16, 36, -6);
      ctx.quadraticCurveTo(42, 4, 34, 14);
      ctx.quadraticCurveTo(28, 22, 22, 16);
      ctx.quadraticCurveTo(14, 24, 8, 15);
      ctx.quadraticCurveTo(0, 18, 2, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Subtle delicate cream chest fur wisps for Boncuk
      ctx.strokeStyle = 'rgba(138, 104, 82, 0.25)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(24, -4); ctx.quadraticCurveTo(28, 2, 25, 8);
      ctx.moveTo(16, 2); ctx.quadraticCurveTo(20, 8, 17, 14);
      ctx.stroke();
    }

    ctx.restore();
  }

  // =========================================================================
  // 7. COSTUME OUTFITS (All 16 Hand-Crafted Outfits Over Cat Body!)
  // =========================================================================
  function drawOutfitBody(ctx, id, cfg, pose) {
    const o = cfg.outfit;
    if (!o || o === 'none') return;

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const rx = id.bodyRx + 1;
    const ry = id.bodyRy + 1;

    if (o === 'outfit_bee') {
      // Cheerful Sunny Yellow & Soft Charcoal Striped Bee Suit!
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(-2, 4, rx, ry, -0.04, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = '#fde047';
      ctx.fillRect(-54, -32, 108, 72);

      // Soft chocolate-charcoal bee stripes
      ctx.fillStyle = '#3f3528';
      [-26, -6, 14].forEach(sx => {
        ctx.beginPath();
        ctx.ellipse(sx, 4, 6.5, 36, 0.08, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Warm outline + fluffy cream neck collar
      ctx.strokeStyle = '#422006';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(-2, 4, rx, ry, -0.04, 0, Math.PI * 2);
      ctx.stroke();
    } else if (o === 'outfit_tutu_pastel') {
      // Boncuk Starter: Fluffy Layered Pastel Pink & Lavender Tutu Skirt (keeps cream chest & collar clear!)
      const bounce = pose.tutuBounce || 0;
      const drawLayer = (yOff, fill, stroke, rScale) => {
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.moveTo(-47, 2 + yOff + bounce * 0.5);
        ctx.quadraticCurveTo(-36, -15 + yOff + bounce * 0.4, -18, -10 + yOff);
        ctx.quadraticCurveTo(-6, -18 + yOff + bounce * 0.3, 6, -8 + yOff);
        ctx.quadraticCurveTo(14, -2 + yOff, 12, 14 + yOff + bounce * 0.3);
        ctx.quadraticCurveTo(-6, 23 * rScale + yOff + bounce * 0.6, -24, 21 * rScale + yOff + bounce * 0.7);
        ctx.quadraticCurveTo(-42, 19 * rScale + yOff + bounce * 0.8, -47, 2 + yOff + bounce * 0.5);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
      };
      drawLayer(4, '#e9d8fd', '#8b6bc2', 1.04);
      drawLayer(-1, '#fbc6da', '#b85078', 0.94);
      // Satin waist ribbon & mini bow
      ctx.fillStyle = '#ec6a9b';
      ctx.strokeStyle = '#993458';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(-16, -6 + bounce * 0.2, 7.5, 4.5, -0.3, 0, Math.PI * 2);
      ctx.ellipse(-7, -9 + bounce * 0.2, 7.5, 4.5, 0.3, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    } else if (o === 'outfit_vest_gentleman') {
      // Müezza Starter: Smart Warm Pastel Gentleman Knit Vest with Cream Shirt Trim & Gold Buttons!
      ctx.fillStyle = '#5e7da8';
      ctx.strokeStyle = '#293e5c';
      ctx.lineWidth = 2.3;
      ctx.beginPath();
      ctx.ellipse(-2, 4, rx * 0.92, ry * 0.90, -0.04, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // Subtle diamond argyle knit pattern
      ctx.strokeStyle = 'rgba(219, 234, 254, 0.45)';
      ctx.lineWidth = 1.5;
      [-24, -8, 8].forEach(ax => {
        ctx.beginPath();
        ctx.moveTo(ax, -8); ctx.lineTo(ax + 7, 4); ctx.lineTo(ax, 16); ctx.lineTo(ax - 7, 4);
        ctx.closePath(); ctx.stroke();
      });
      // Crisp cream shirt chest V & gold buttons
      ctx.fillStyle = '#fffaf2';
      ctx.strokeStyle = '#293e5c';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(16, -10); ctx.lineTo(34, -2); ctx.lineTo(24, 18); ctx.lineTo(14, 14);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f6cf65';
      [4, 12].forEach(by => {
        ctx.beginPath(); ctx.arc(16, by, 2.5, 0, Math.PI * 2); ctx.fill();
      });
    } else if (o === 'outfit_ballerina') {
      // Pastel Pink Layered Ballerina Bodice & Bouncing Tutu Skirt!
      const bounce = pose.tutuBounce || 0;
      // Satin bodice wrap
      ctx.fillStyle = '#fbc6da';
      ctx.strokeStyle = '#a84a6e';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(2, 4, rx * 0.82, ry * 0.85, -0.04, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // Layered fluffy tulle tutu around waist/back!
      const drawTutuLayer = (yOff, fill, rScale) => {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.moveTo(-46, 2 + yOff + bounce * 0.5);
        ctx.quadraticCurveTo(-36, -16 + yOff + bounce * 0.4, -20, -10 + yOff);
        ctx.quadraticCurveTo(-8, -20 + yOff + bounce * 0.3, 4, -8 + yOff);
        ctx.quadraticCurveTo(16, -2 + yOff, 14, 14 + yOff + bounce * 0.3);
        ctx.quadraticCurveTo(-4, 24 * rScale + yOff + bounce * 0.6, -24, 22 * rScale + yOff + bounce * 0.7);
        ctx.quadraticCurveTo(-42, 20 * rScale + yOff + bounce * 0.8, -46, 2 + yOff + bounce * 0.5);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
      };
      drawTutuLayer(4, '#ffe4ee', 1.05);
      drawTutuLayer(-1, '#f9a8c9', 0.94);

      // Cute satin bow at back waist
      ctx.fillStyle = '#ec6a9b';
      ctx.beginPath();
      ctx.ellipse(-18, -6 + bounce * 0.2, 8, 4.8, -0.3, 0, Math.PI * 2);
      ctx.ellipse(-8, -10 + bounce * 0.2, 8, 4.8, 0.3, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    } else if (o === 'outfit_tuxedo') {
      // Smart Little Gentleman Tuxedo: White Shirt, Pastel Vest & Tailored Jacket!
      ctx.fillStyle = '#3b4a66';
      ctx.strokeStyle = '#1e283b';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(-2, 4, rx * 0.96, ry * 0.94, -0.04, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // Crisp white shirt V-front & pastel slate vest
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(22, -14); ctx.lineTo(38, -2); ctx.lineTo(26, 22); ctx.lineTo(14, 16);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Pastel sky waistcoat lapels & gold buttons
      ctx.fillStyle = '#a3c6e8';
      ctx.beginPath();
      ctx.moveTo(16, -12); ctx.lineTo(26, 22); ctx.lineTo(10, 22); ctx.lineTo(6, -8);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#f6cf65';
      [2, 10].forEach(by => {
        ctx.beginPath(); ctx.arc(20, by, 2.3, 0, Math.PI * 2); ctx.fill();
      });
    } else if (o === 'outfit_police') {
      // Adorable Pastel Navy Police Uniform with Golden Paw Badge!
      ctx.fillStyle = '#5b7eb5';
      ctx.strokeStyle = '#243757';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(-2, 4, rx * 0.96, ry * 0.92, -0.04, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // Smart belt & pocket
      ctx.fillStyle = '#2d3f5e';
      rr(ctx, -38, 10, 74, 8, 4);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f6cf65';
      rr(ctx, 4, 9, 10, 10, 2);
      ctx.fill(); ctx.stroke();

      // Golden Star Police Badge on side!
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 1.6;
      drawStarShape(ctx, 14, -2, 8.5, 4.2, 5);
      ctx.fill(); ctx.stroke();
    } else if (o === 'outfit_mermaid') {
      // Pastel Aqua Sea-Shell Top & Pearlescent Sash (matches shimmering mermaid tail!)
      ctx.fillStyle = '#c4b5fd';
      ctx.strokeStyle = '#6d4fa8';
      ctx.lineWidth = 2.1;
      // Scalloped sea-shell chest emblem
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.ellipse(22 + i * 6, 4 + Math.abs(i) * 2, 7, 10, i * 0.25, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }
      // Pearlescent waist wrap connecting smoothly to tail
      const wg = ctx.createLinearGradient(-44, 0, 10, 14);
      wg.addColorStop(0, '#88e0d8');
      wg.addColorStop(1, '#93c5fd');
      ctx.fillStyle = wg;
      ctx.strokeStyle = '#3f7c8a';
      ctx.beginPath();
      ctx.ellipse(-18, 6, 26, 22, -0.06, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    } else if (o === 'outfit_princess' || o === 'outfit_prince') {
      const isPrincess = o === 'outfit_princess';
      const g = ctx.createLinearGradient(0, -20, 0, 32);
      if (isPrincess) {
        g.addColorStop(0, '#fbc6db');
        g.addColorStop(1, '#f28bb2');
      } else {
        g.addColorStop(0, '#88a7eb');
        g.addColorStop(1, '#5a76c9');
      }
      ctx.fillStyle = g;
      ctx.strokeStyle = isPrincess ? '#9e3e66' : '#2a3c78';
      ctx.lineWidth = 2.3;
      ctx.beginPath();
      ctx.ellipse(-2, 5, rx * 0.96, ry * 0.92, -0.04, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // Golden royal sash & jewel clasp
      ctx.strokeStyle = '#f6cf65';
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(22, -16); ctx.lineTo(-14, 24);
      ctx.stroke();
      ctx.fillStyle = isPrincess ? '#f472b6' : '#60a5fa';
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(10, -2, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (o === 'outfit_fairy') {
      // Leaf-Petal Pastel Fairy Dress with Flower Clasp
      ctx.fillStyle = '#b4ebc7';
      ctx.strokeStyle = '#3d7a55';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(-2, 4, rx * 0.90, ry * 0.88, -0.04, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // Pink petal scallops along lower hem
      ctx.fillStyle = '#fbcfe8';
      [-28, -14, 0, 14].forEach(px => {
        ctx.beginPath();
        ctx.arc(px, 22, 8.5, 0, Math.PI);
        ctx.fill(); ctx.stroke();
      });
    } else if (o === 'outfit_soldier') {
      // Cute Soft Pastel Woodland Camouflage Jacket + Brass Star!
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(-2, 4, rx * 0.96, ry * 0.92, -0.04, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#97b588';
      ctx.fillRect(-56, -34, 112, 74);
      // Soft rounded pastel camo patches
      ctx.fillStyle = '#749468';
      ctx.beginPath(); ctx.ellipse(-24, -4, 16, 10, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(12, 14, 18, 10, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c9b796';
      ctx.beginPath(); ctx.ellipse(-4, 12, 14, 9, 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(16, -8, 13, 8, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      ctx.strokeStyle = '#42593a';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(-2, 4, rx * 0.96, ry * 0.92, -0.04, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#f6cf65';
      ctx.strokeStyle = '#855a16';
      ctx.lineWidth = 1.5;
      drawStarShape(ctx, 14, -1, 7, 3.4, 5);
      ctx.fill(); ctx.stroke();
    } else if (o === 'outfit_pirate') {
      // Charming Red-Cream Striped Pirate Vest + Belt!
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(-2, 4, rx * 0.96, ry * 0.92, -0.04, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#fff6eb';
      ctx.fillRect(-56, -34, 112, 74);
      ctx.fillStyle = '#e56b7b';
      [-16, -2, 12, 26].forEach(sy => ctx.fillRect(-56, sy, 112, 7));
      ctx.restore();

      ctx.strokeStyle = '#6e2835';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(-2, 4, rx * 0.96, ry * 0.92, -0.04, 0, Math.PI * 2);
      ctx.stroke();

      // Leather pirate belt + brass buckle
      ctx.fillStyle = '#6e4630';
      rr(ctx, -38, 8, 76, 9, 4);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f6cf65';
      rr(ctx, 2, 7, 12, 11, 2.5);
      ctx.fill(); ctx.stroke();
    } else if (o === 'outfit_detective') {
      // Warm Biscuit-Plaid Sherlock Detective Cape-Coat!
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(-2, 4, rx * 0.98, ry * 0.95, -0.04, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#d9ba8f';
      ctx.fillRect(-56, -34, 112, 74);
      ctx.strokeStyle = 'rgba(122, 82, 48, 0.35)';
      ctx.lineWidth = 2;
      for (let gx = -44; gx <= 44; gx += 12) { ctx.beginPath(); ctx.moveTo(gx, -34); ctx.lineTo(gx, 40); ctx.stroke(); }
      for (let gy = -24; gy <= 32; gy += 12) { ctx.beginPath(); ctx.moveTo(-56, gy); ctx.lineTo(56, gy); ctx.stroke(); }
      ctx.restore();

      ctx.strokeStyle = '#69472b';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(-2, 4, rx * 0.98, ry * 0.95, -0.04, 0, Math.PI * 2);
      ctx.stroke();

      // Shoulder capelet flap
      ctx.fillStyle = '#c49f6c';
      ctx.beginPath();
      ctx.moveTo(22, -16);
      ctx.quadraticCurveTo(-10, -24, -36, -6);
      ctx.quadraticCurveTo(-12, 6, 22, 2);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else if (o === 'outfit_astronaut') {
      // Crisp White & Pastel Blue/Pink Space Explorer Suit!
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#4b5f7a';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(-2, 4, rx * 1.0, ry * 0.98, -0.04, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // Space suit shoulder stripe & glowing chest control panel
      ctx.fillStyle = id.id === 'boncuk' ? '#f7a8c4' : '#7ec4f4';
      rr(ctx, -30, 8, 56, 8, 4);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      rr(ctx, 6, -10, 18, 15, 4);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(11, -3, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f472b6'; ctx.beginPath(); ctx.arc(19, -3, 2.5, 0, Math.PI * 2); ctx.fill();
    } else if (o === 'outfit_beach') {
      // Sunny Pastel Tropical Flower Beach Shirt!
      ctx.fillStyle = '#8ad3f5';
      ctx.strokeStyle = '#366e94';
      ctx.lineWidth = 2.3;
      ctx.beginPath();
      ctx.ellipse(-2, 4, rx * 0.94, ry * 0.90, -0.04, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // Cute pastel hibiscus blossoms
      [[-18, 0, '#fbcfe8'], [4, 12, '#fef08a'], [14, -4, '#fda4af']].forEach(([fx, fy, col]) => {
        ctx.fillStyle = col;
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          ctx.beginPath(); ctx.arc(fx + Math.cos(a) * 4, fy + Math.sin(a) * 4, 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(fx, fy, 2.2, 0, Math.PI * 2); ctx.fill();
      });
    } else if (o === 'outfit_halloween') {
      // Spooky-Cute Velvet Purple & Pumpkin Orange Starry Vest!
      ctx.fillStyle = '#7c5cbf';
      ctx.strokeStyle = '#352166';
      ctx.lineWidth = 2.3;
      ctx.beginPath();
      ctx.ellipse(-2, 4, rx * 0.95, ry * 0.92, -0.04, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // Cute pumpkin badge & gold stars
      ctx.fillStyle = '#fb923c';
      ctx.strokeStyle = '#9a3412';
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.ellipse(10, 4, 8, 6.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fde047';
      drawStarShape(ctx, -16, 0, 5.5, 2.5, 5); ctx.fill();
    } else if (o === 'outfit_christmas') {
      // Cozy Berry-Red Holiday Coat with Fluffy White Trim & Gold Belt!
      ctx.fillStyle = '#e55c74';
      ctx.strokeStyle = '#852236';
      ctx.lineWidth = 2.3;
      ctx.beginPath();
      ctx.ellipse(-2, 4, rx * 0.96, ry * 0.92, -0.04, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // Fluffy white hem
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#cbd5e1';
      rr(ctx, -38, 16, 70, 9, 4.5);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f6cf65';
      ctx.strokeStyle = '#9c731c';
      ctx.beginPath(); ctx.arc(14, 2, 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (o === 'outfit_safari') {
      // Khaki Adventure Safari Explorer Vest with Pockets & Compass!
      ctx.fillStyle = '#e3cc9d';
      ctx.strokeStyle = '#785e33';
      ctx.lineWidth = 2.3;
      ctx.beginPath();
      ctx.ellipse(-2, 4, rx * 0.95, ry * 0.92, -0.04, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#cfb47e';
      rr(ctx, -20, 4, 16, 13, 3); ctx.fill(); ctx.stroke();
      rr(ctx, 4, 4, 16, 13, 3); ctx.fill(); ctx.stroke();
      // Tiny golden compass pin
      ctx.fillStyle = '#f6cf65';
      ctx.beginPath(); ctx.arc(12, -5, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }

    ctx.restore();
  }

  // =========================================================================
  // 8. COLLAR & SWINGING NAME TAG (Anatomical Neck Curve — ALWAYS Visible!)
  // =========================================================================
  function drawCollarAndTag(ctx, id, cfg, pose) {
    if (!cfg.collar || cfg.collar === 'none') return;

    const CWS = window.CatWardrobeSystem;
    const collarMeta = CWS ? CWS.COLLARS.find(c => c.id === cfg.collar) : null;
    const baseCol = collarMeta ? collarMeta.color : '#f79ec0';
    const trimCol = collarMeta ? collarMeta.trim : '#bd4c7a';

    // Anchor cleanly along the visible front neck right underneath chin contour!
    const nx = 28 + pose.headOffsetX * 0.45;
    const ny = (id.isFluffy ? 6 : 4) + pose.headOffsetY * 0.45;

    ctx.save();
    ctx.translate(nx, ny);
    ctx.rotate(pose.headTilt * 0.25);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Anatomical curved U-band wrapping smoothly around the cat's neck!
    if (cfg.collar === 'collar_rainbow_star') {
      const rg = ctx.createLinearGradient(-26, -8, 24, 6);
      rg.addColorStop(0, '#f9a8d4');
      rg.addColorStop(0.35, '#fde047');
      rg.addColorStop(0.7, '#93c5fd');
      rg.addColorStop(1, '#c4b5fd');
      ctx.fillStyle = rg;
    } else {
      ctx.fillStyle = baseCol;
    }
    ctx.strokeStyle = trimCol;
    ctx.lineWidth = 2.3;

    ctx.beginPath();
    ctx.moveTo(-25, -10);
    ctx.quadraticCurveTo(1, 5, 23, -7);
    ctx.quadraticCurveTo(25, -2, 22, 2);
    ctx.quadraticCurveTo(1, 14, -26, -1);
    ctx.quadraticCurveTo(-28, -6, -25, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Soft glossy highlight along upper edge of collar
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-21, -7);
    ctx.quadraticCurveTo(1, 6, 19, -5);
    ctx.stroke();

    // Special collar decorations (Pearls / Gold Stitch / Brass Buckle)
    if (cfg.collar === 'collar_pearl_lace') {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#e69ab8';
      ctx.lineWidth = 1.0;
      [[-17, -4], [-9, 1], [0, 4], [9, 3], [16, -1]].forEach(([px, py]) => {
        ctx.beginPath(); ctx.arc(px, py, 3.0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
    } else if (cfg.collar === 'collar_velvet_gold') {
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(-22, -5);
      ctx.quadraticCurveTo(1, 9, 19, -2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (cfg.collar === 'collar_navy_leather') {
      // Classic brass buckle accent on side of navy collar!
      ctx.fillStyle = '#f6cf65';
      ctx.strokeStyle = '#8f6012';
      ctx.lineWidth = 1.5;
      rr(ctx, -14, -4, 8, 8, 2);
      ctx.fill(); ctx.stroke();
    }

    // Swinging Name Tag hanging cleanly below the front of the collar!
    // If a bowtie/tie is also worn at center, shift tag slightly forward so BOTH stay 100% visible!
    if (cfg.tag && cfg.tag !== 'none') {
      const hasCenterBowOrTie = cfg.neckwear === 'bowtie_classic' || cfg.neckwear === 'bowtie_silk_pink' || cfg.neckwear === 'tie_classic';
      ctx.save();
      ctx.translate(hasCenterBowOrTie ? 15 : 5, hasCenterBowOrTie ? 3 : 8);
      ctx.rotate(pose.tagSwing);

      // Tiny gold ring clasp
      ctx.strokeStyle = '#d99a26';
      ctx.lineWidth = 2.0;
      ctx.beginPath(); ctx.arc(0, 2, 2.8, 0, Math.PI * 2); ctx.stroke();

      if (cfg.tag === 'tag_heart') {
        ctx.fillStyle = '#f98ab1';
        ctx.strokeStyle = '#9e335a';
        ctx.lineWidth = 1.9;
        drawHeartShape(ctx, 0, 12, 8.2);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.68)';
        ctx.beginPath(); ctx.arc(-2.6, 9.5, 1.9, 0, Math.PI * 2); ctx.fill();
      } else if (cfg.tag === 'tag_star') {
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = '#a86e0c';
        ctx.lineWidth = 1.9;
        drawStarShape(ctx, 0, 12, 9.2, 4.5, 5);
        ctx.fill(); ctx.stroke();
      } else if (cfg.tag === 'tag_bell') {
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.9;
        ctx.beginPath(); ctx.arc(0, 11, 7.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#78350f';
        ctx.beginPath(); ctx.arc(0, 13.5, 2.1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.72)';
        ctx.beginPath(); ctx.arc(-2.6, 8.5, 1.9, 0, Math.PI * 2); ctx.fill();
      } else if (cfg.tag === 'tag_fish') {
        ctx.fillStyle = '#7dd3fc';
        ctx.strokeStyle = '#0369a1';
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.ellipse(1, 12, 7.8, 5.0, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-6.2, 12); ctx.lineTo(-10.5, 8); ctx.lineTo(-10.5, 16); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#0c4a6e'; ctx.beginPath(); ctx.arc(4.8, 11, 1.3, 0, Math.PI * 2); ctx.fill();
      } else if (cfg.tag === 'tag_crown') {
        ctx.fillStyle = '#f6cf65';
        ctx.strokeStyle = '#9c6e14';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-7.5, 16); ctx.lineTo(-8.5, 8); ctx.lineTo(-3, 12);
        ctx.lineTo(0, 5.5); ctx.lineTo(3, 12); ctx.lineTo(8.5, 8); ctx.lineTo(7.5, 16);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
      } else if (cfg.tag === 'tag_moon') {
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 12, 7.8, 0.4, Math.PI * 1.65);
        ctx.quadraticCurveTo(-2, 12, 7.0, 15);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  // =========================================================================
  // 9. NECKWEAR (Scarves, Bowties, Striped Tie, Bandana, Flower Garland — ALWAYS Visible!)
  // =========================================================================
  function drawNeckwear(ctx, id, cfg, pose) {
    const nw = cfg.neckwear;
    if (!nw || nw === 'none') return;

    const wave = pose.scarfWave * 16;
    const nx = 28 + pose.headOffsetX * 0.45;
    const ny = (id.isFluffy ? 6 : 4) + pose.headOffsetY * 0.45;

    ctx.save();
    ctx.translate(nx, ny);
    ctx.rotate(pose.headTilt * 0.22);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (nw === 'scarf_blue_knit' || nw === 'scarf_pink_pastel' || nw === 'scarf_lavender') {
      const palette = nw === 'scarf_blue_knit'
        ? { main: '#8da6c2', stripe: '#dce7f3', stroke: '#4c627a' }
        : nw === 'scarf_pink_pastel'
          ? { main: '#f8a8c6', stripe: '#fff2f7', stroke: '#a84e70' }
          : { main: '#c4b0f2', stripe: '#f3edff', stroke: '#6c53a8' };

      // Billowing trailing scarf tail (waves gracefully behind when running!)
      ctx.fillStyle = palette.main;
      ctx.strokeStyle = palette.stroke;
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(-20, -4);
      ctx.bezierCurveTo(-32 - wave * 0.5, 2 - wave * 0.25, -44 - wave, 12 - wave * 0.5, -52 - wave * 1.1, 6 - wave * 0.7);
      ctx.lineTo(-46 - wave * 1.0, 19 - wave * 0.5);
      ctx.bezierCurveTo(-34 - wave * 0.6, 23 - wave * 0.2, -20, 12, -12, 6);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Cozy front dangling scarf end
      ctx.beginPath();
      ctx.moveTo(8, 5);
      ctx.quadraticCurveTo(14 - wave * 0.2, 18, 9 - wave * 0.3, 30);
      ctx.lineTo(-2 - wave * 0.25, 28);
      ctx.quadraticCurveTo(1, 16, -1, 6);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Knit stripes on front flap
      ctx.fillStyle = palette.stripe;
      ctx.fillRect(0 - wave * 0.18, 17, 9.5, 3.2);
      ctx.fillRect(-1 - wave * 0.22, 22.5, 9.5, 2.5);

      // Soft curved cozy knit wrap hugging the neck!
      ctx.fillStyle = palette.main;
      ctx.beginPath();
      ctx.moveTo(-26, -11);
      ctx.quadraticCurveTo(1, 6, 24, -8);
      ctx.quadraticCurveTo(27, -1, 23, 4);
      ctx.quadraticCurveTo(1, 18, -27, 1);
      ctx.quadraticCurveTo(-29, -5, -26, -11);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else if (nw === 'bowtie_classic' || nw === 'bowtie_silk_pink') {
      // Crisp, always-visible Bowtie perched cleanly right at the front throat!
      const isPink = nw === 'bowtie_silk_pink';
      ctx.save();
      ctx.translate(4, 9);
      ctx.rotate(pose.tagSwing * 0.38);
      ctx.fillStyle = isPink ? '#f78cb3' : '#4a72b0';
      ctx.strokeStyle = isPink ? '#963257' : '#1f365c';
      ctx.lineWidth = 2.2;
      // Plump tailored silk bow wings
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-14, -12, -19, 12, 0, 3);
      ctx.bezierCurveTo(19, 12, 14, -12, 0, 0);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Inner fold highlight
      ctx.strokeStyle = isPink ? '#fbcfe8' : '#93c5fd';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-9, -1); ctx.lineTo(-4, 1);
      ctx.moveTo(9, -1); ctx.lineTo(4, 1);
      ctx.stroke();
      // Center silk knot
      ctx.fillStyle = isPink ? '#fbcfe8' : '#93c5fd';
      ctx.strokeStyle = isPink ? '#963257' : '#1f365c';
      ctx.lineWidth = 2.0;
      ctx.beginPath(); ctx.arc(0, 1.5, 4.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    } else if (nw === 'tie_classic') {
      // Müezza Male Starter: Smart Striped Sky-Navy Gentleman Necktie!
      ctx.save();
      ctx.translate(5, 8);
      ctx.rotate(pose.tagSwing * 0.55);
      // Pointed tie blade
      ctx.fillStyle = '#486ca6';
      ctx.strokeStyle = '#1e3357';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-3.5, 4);
      ctx.lineTo(3.5, 4);
      ctx.lineTo(6.5, 22);
      ctx.lineTo(0, 29);
      ctx.lineTo(-6.5, 22);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Diagonal golden-sky gentleman stripes
      ctx.strokeStyle = '#f6cf65';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-4, 11); ctx.lineTo(4, 8);
      ctx.moveTo(-5, 18); ctx.lineTo(5, 15);
      ctx.moveTo(-3.5, 24); ctx.lineTo(3.5, 21.5);
      ctx.stroke();
      // Crisp Windsor knot at top
      ctx.fillStyle = '#5e85c2';
      ctx.strokeStyle = '#1e3357';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-5.5, -2); ctx.lineTo(5.5, -2);
      ctx.lineTo(3.5, 6); ctx.lineTo(-3.5, 6);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
    } else if (nw === 'bandana_adventure') {
      ctx.fillStyle = '#73b3e3';
      ctx.strokeStyle = '#2d587d';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-20, -4);
      ctx.quadraticCurveTo(2, 6, 20, -2);
      ctx.lineTo(5 - wave * 0.15, 26);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fde047';
      drawStarShape(ctx, 4, 12, 5.4, 2.6, 5);
      ctx.fill();
    } else if (nw === 'necklace_flower') {
      // Pastel spring daisy flower garland hugging front neck curve!
      const spots = [[-16, -3, '#fbcfe8'], [-6, 4, '#fef08a'], [5, 7, '#ffffff'], [15, 2, '#c4b5fd']];
      spots.forEach(([fx, fy, col]) => {
        ctx.fillStyle = col;
        ctx.strokeStyle = '#9c6e82';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(fx, fy, 5.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#facc15';
        ctx.beginPath(); ctx.arc(fx, fy, 2.2, 0, Math.PI * 2); ctx.fill();
      });
    }

    ctx.restore();
  }

  // =========================================================================
  // 10. STORYBOOK HEAD, SOFT EARS, LUMINOUS TWIN EYES, EXPRESSION & HAT!
  // =========================================================================
  function drawHeadGroup(ctx, id, cfg, pose) {
    ctx.save();
    ctx.translate(30 + pose.headOffsetX, -24 + pose.headOffsetY);
    ctx.rotate(pose.headTilt);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const drawEar = (ex, ey, rot, isBack) => {
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(rot + pose.earTwitch * (isBack ? -0.7 : 1.0));
      const h = id.isFluffy ? 26 : 31;
      const w = id.isFluffy ? 14 : 13;

      ctx.fillStyle = id.earOuter;
      ctx.strokeStyle = id.outline;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-w, 4);
      ctx.quadraticCurveTo(-w * 0.5, -h * 0.72, 0, -h);
      ctx.quadraticCurveTo(w * 0.65, -h * 0.65, w, 4);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Soft warm pink inner ear
      ctx.fillStyle = id.earInner;
      ctx.beginPath();
      ctx.moveTo(-w * 0.56, 2);
      ctx.quadraticCurveTo(-w * 0.2, -h * 0.52, 0, -h * 0.74);
      ctx.quadraticCurveTo(w * 0.35, -h * 0.48, w * 0.54, 2);
      ctx.closePath();
      ctx.fill();

      // Delicate inner ear fluff wisps!
      ctx.strokeStyle = id.furLight;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-w * 0.5, -2); ctx.lineTo(-1, -4);
      ctx.moveTo(-w * 0.4, -7); ctx.lineTo(0, -8);
      ctx.stroke();

      ctx.restore();
    };

    // 1. Ears behind head crown
    drawEar(-18, -22, -0.32, true);
    drawEar(18, -22, 0.28, false);

    // 2. Sculpted Plush Cat Head Base
    const hg = ctx.createRadialGradient(4, -10, 6, 0, 2, id.headRx + 12);
    hg.addColorStop(0, id.furLight);
    hg.addColorStop(0.65, id.furBase);
    hg.addColorStop(1, id.furShadow);
    ctx.fillStyle = hg;
    ctx.strokeStyle = id.outline;
    ctx.lineWidth = 2.7;

    if (id.isFluffy) {
      // MÜEZZA: Round fluffy cheeks with soft feathered fur tufts!
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.bezierCurveTo(22, -32, 36, -18, 37, -2);
      ctx.lineTo(42, 4);   // Fluffy right cheek tuft!
      ctx.lineTo(36, 9);
      ctx.lineTo(40, 16);
      ctx.bezierCurveTo(32, 30, 18, 33, 2, 32);
      ctx.bezierCurveTo(-18, 33, -34, 28, -40, 14);
      ctx.lineTo(-36, 8);
      ctx.lineTo(-42, 2);  // Fluffy left cheek tuft!
      ctx.bezierCurveTo(-36, -18, -22, -32, 0, -32);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Subtle soft forehead crown tuft lines
      ctx.strokeStyle = 'rgba(220, 228, 236, 0.55)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-4, -27); ctx.quadraticCurveTo(0, -21, 2, -16);
      ctx.moveTo(6, -26); ctx.quadraticCurveTo(8, -20, 10, -16);
      ctx.stroke();
    } else {
      // BONCUK: Smooth elegant creamy round-heart face silhouette!
      ctx.beginPath();
      ctx.moveTo(0, -29);
      ctx.bezierCurveTo(22, -29, 34, -16, 34, 1);
      ctx.bezierCurveTo(34, 19, 21, 29, 4, 29);
      ctx.bezierCurveTo(-16, 29, -34, 20, -34, 1);
      ctx.bezierCurveTo(-34, -16, -21, -29, 0, -29);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Soft blended Siamese mocha facial mask (warm radial blend — NEVER harsh!)
      ctx.save();
      ctx.clip();
      const mg = ctx.createRadialGradient(11, 2, 3, 10, 2, 24);
      mg.addColorStop(0, 'rgba(105, 74, 56, 0.88)');
      mg.addColorStop(0.55, 'rgba(138, 104, 82, 0.58)');
      mg.addColorStop(0.88, 'rgba(168, 134, 108, 0.16)');
      mg.addColorStop(1, 'rgba(168, 134, 108, 0)');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.ellipse(10, 2, 25, 20, 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Rosy Soft Pastel Cheek Blush (gentle warmth!)
    ctx.fillStyle = id.blush;
    ctx.beginPath();
    ctx.ellipse(-12, 8, 7.2, 4.2, 0, 0, Math.PI * 2);
    ctx.ellipse(27, 7, 6.2, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. TWO LUMINOUS EXPRESSIVE STORYBOOK EYES (Boncuk Sky-Blue / Müezza Golden-Amber!)
    const drawEye = (ex, ey, sx) => {
      ctx.save();
      ctx.translate(ex, ey);
      ctx.scale(sx, 1);

      if (pose.eyeMode === 'blink') {
        ctx.strokeStyle = id.outline;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(0, 1, 7.2, 0.18 * Math.PI, 0.82 * Math.PI);
        ctx.stroke();
      } else if (pose.eyeMode === 'squint') {
        // Adorable happy curved smiling eyes!
        ctx.strokeStyle = id.outline;
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(0, 3, 7.5, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      } else if (pose.eyeMode === 'hurt') {
        ctx.strokeStyle = id.outline;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(-5, -4); ctx.lineTo(5, 4);
        ctx.moveTo(5, -4); ctx.lineTo(-5, 4);
        ctx.stroke();
      } else {
        const rx = 8.4;
        const ry = pose.eyeMode === 'wide' ? 9.6 : 8.8;

        // Soft white sclera base
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, 0, rx + 0.6, ry + 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rich multi-stop luminous iris (Boncuk Sapphire-Sky / Müezza Golden-Amber!)
        const ig = ctx.createLinearGradient(0, -ry, 0, ry);
        ig.addColorStop(0, id.eyeOuter);
        ig.addColorStop(0.48, id.eyeMid);
        ig.addColorStop(1, id.eyeGlow);
        ctx.fillStyle = ig;
        ctx.beginPath();
        ctx.ellipse(0.4, 0.2, rx * 0.88, ry * 0.88, 0, 0, Math.PI * 2);
        ctx.fill();

        // Warm soft round pupil (friendly & cute — NEVER a harsh scary slit!)
        ctx.fillStyle = '#1e1b24';
        ctx.beginPath();
        ctx.ellipse(0.8, 0.2, rx * 0.48, ry * 0.54, 0, 0, Math.PI * 2);
        ctx.fill();

        // Crisp double catchlight sparkles!
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-2.6, -3.2, 2.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(3.0, 2.8, 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Soft upper eyelid rim
        ctx.strokeStyle = id.outline;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, 0.5, rx + 0.3, Math.PI * 1.06, Math.PI * 1.94);
        ctx.stroke();
      }
      ctx.restore();
    };

    drawEye(-4, -3, 1.0);    // Near eye
    drawEye(22, -3, 0.88);   // Far 3/4 eye

    // 5. Cute Soft Button Nose & Expressive "w" Cat Muzzle
    // Soft plush whisker pads
    ctx.fillStyle = id.isFluffy ? 'rgba(205, 214, 224, 0.65)' : 'rgba(255, 248, 240, 0.42)';
    ctx.beginPath();
    ctx.ellipse(6.5, 11, 7.2, 5.4, 0, 0, Math.PI * 2);
    ctx.ellipse(16.5, 11, 6.8, 5.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rounded cute triangle nose
    ctx.fillStyle = id.nose;
    ctx.beginPath();
    ctx.moveTo(8, 5);
    ctx.quadraticCurveTo(11.5, 3.8, 15, 5);
    ctx.quadraticCurveTo(13.5, 9.2, 11.5, 9.4);
    ctx.quadraticCurveTo(9.5, 9.2, 8, 5);
    ctx.closePath();
    ctx.fill();

    // Mouth: Smile / Happy Open / Cute Cat Yawn / Hurt!
    ctx.strokeStyle = id.outline;
    ctx.lineWidth = 2.0;
    if (pose.mouthMode === 'yawn') {
      const yr = 3.5 + pose.yawnAmount * 4.5;
      ctx.fillStyle = '#f28ca6';
      ctx.beginPath();
      ctx.ellipse(11.5, 14.5, 4.5, yr, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.ellipse(11.5, 16.2, 2.8, yr * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (pose.mouthMode === 'happy') {
      ctx.fillStyle = '#f28ca6';
      ctx.beginPath();
      ctx.moveTo(6, 12);
      ctx.quadraticCurveTo(11.5, 13.5, 17, 12);
      ctx.quadraticCurveTo(15, 18.5, 11.5, 18.5);
      ctx.quadraticCurveTo(8, 18.5, 6, 12);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else if (pose.mouthMode === 'hurt') {
      ctx.beginPath();
      ctx.moveTo(7, 16); ctx.quadraticCurveTo(11.5, 12.5, 16, 16);
      ctx.stroke();
    } else {
      // Classic gentle smiling "w" cat mouth!
      ctx.beginPath();
      ctx.moveTo(11.5, 9.5);
      ctx.lineTo(11.5, 12.5);
      ctx.moveTo(5.5, 12.5);
      ctx.quadraticCurveTo(8.5, 16.5, 11.5, 12.5);
      ctx.quadraticCurveTo(14.5, 16.5, 17.5, 12.5);
      ctx.stroke();
    }

    // Delicate Storybook Whiskers
    ctx.strokeStyle = id.isFluffy ? 'rgba(255, 255, 255, 0.88)' : 'rgba(99, 70, 54, 0.55)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-8, 8);  ctx.quadraticCurveTo(-24, 6, -34, 4);
    ctx.moveTo(-8, 12); ctx.quadraticCurveTo(-23, 13, -33, 15);
    ctx.moveTo(26, 8);  ctx.quadraticCurveTo(38, 6, 46, 4);
    ctx.moveTo(26, 12); ctx.quadraticCurveTo(37, 13, 44, 15);
    ctx.stroke();

    // 6. Eye Accessories (Glasses / Pirate Eyepatch / Heart Shades!)
    drawEyeAccessory(ctx, cfg.eyeAcc);

    // 7. Headwear (Bows, Flowers, Hats, Crowns, Space Helmet!)
    drawHeadwear(ctx, cfg.headwear, pose, id);

    ctx.restore();
  }

  function drawEyeAccessory(ctx, eyeAcc) {
    if (!eyeAcc || eyeAcc === 'none') return;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (eyeAcc === 'round_cat_glasses') {
      ctx.fillStyle = 'rgba(224, 244, 255, 0.30)';
      ctx.strokeStyle = '#c48f3b';
      ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(-4, -3, 10.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(22, -3, 9.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6.5, -3); ctx.lineTo(12.5, -3); ctx.stroke();
    } else if (eyeAcc === 'pirate_eyepatch') {
      // Soft cute pirate eyepatch over near eye!
      ctx.strokeStyle = '#332924';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-30, -14); ctx.lineTo(-4, -3); ctx.lineTo(20, -24);
      ctx.stroke();
      ctx.fillStyle = '#332924';
      ctx.beginPath();
      ctx.ellipse(-4, -3, 10, 9.5, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f6cf65';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (eyeAcc === 'heart_shades') {
      ctx.fillStyle = 'rgba(244, 114, 182, 0.62)';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      drawHeartShape(ctx, -4, -1, 10.5); ctx.fill(); ctx.stroke();
      drawHeartShape(ctx, 22, -1, 9.5); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6, -3); ctx.lineTo(12.5, -3); ctx.stroke();
    }

    ctx.restore();
  }

  function drawHeadwear(ctx, hw, pose, id) {
    if (!hw || hw === 'none') return;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (hw === 'head_astronaut_helmet') {
      // Drawn in dedicated final glass overlay pass so collar stays neatly below neck ring!
      ctx.restore();
      return;
    }

    // Apply subtle dynamic hat bounce & tilt!
    ctx.translate(0, pose.hatBob);
    ctx.rotate(pose.hatTilt);

    if (hw === 'head_cap_boy') {
      // Müezza Male Starter: Pastel Sky & Cream Sporty Cap with Forward Visor!
      ctx.save();
      ctx.translate(2, -31);
      ctx.rotate(-0.04);
      // Forward visor
      ctx.fillStyle = '#5c9cd1';
      ctx.strokeStyle = '#2a5278';
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(4, 1);
      ctx.quadraticCurveTo(26, -2, 36, 5);
      ctx.quadraticCurveTo(22, 10, 2, 6);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Cap dome
      ctx.fillStyle = '#96cbf5';
      ctx.beginPath();
      ctx.arc(-1, 3, 21, Math.PI, 0);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Cream front panel & top button
      ctx.fillStyle = '#fff9ee';
      ctx.beginPath();
      ctx.arc(7, 2, 10, Math.PI * 1.15, Math.PI * 1.92);
      ctx.lineTo(7, 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f6cf65';
      ctx.beginPath(); ctx.arc(-1, -18, 3.0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    } else if (hw === 'bow_pastel') {
      ctx.save();
      ctx.translate(-16, -24);
      ctx.rotate(-0.32 + pose.flowerWiggle);
      ctx.fillStyle = '#f8a5c2';
      ctx.strokeStyle = '#a3466a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(-9, 0, 10, 6.5, -0.25, 0, Math.PI * 2);
      ctx.ellipse(9, 0, 10, 6.5, 0.25, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffe4ee';
      ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    } else if (hw === 'flower_daisy') {
      ctx.save();
      ctx.translate(16, -24);
      ctx.rotate(0.24 + pose.flowerWiggle * 1.3);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#d48aa5';
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * 7, Math.sin(a) * 7, 5.2, 3.6, a, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(0, 0, 4.2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (hw === 'flower_crown_cat') {
      ctx.strokeStyle = '#5da373';
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.arc(2, -16, 28, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();
      const blooms = [[-16, -32, '#f9a8d4'], [-5, -36, '#fde047'], [7, -36, '#ffffff'], [18, -31, '#c4b5fd']];
      blooms.forEach(([bx, by, col]) => {
        ctx.fillStyle = col;
        ctx.strokeStyle = '#8c5368';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(bx, by + pose.flowerWiggle * 3, 6.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#facc15';
        ctx.beginPath(); ctx.arc(bx, by + pose.flowerWiggle * 3, 2.2, 0, Math.PI * 2); ctx.fill();
      });
    } else if (hw === 'beret_pastel') {
      ctx.save();
      ctx.translate(-2, -31);
      ctx.rotate(-0.18);
      ctx.fillStyle = id.id === 'boncuk' ? '#f7a8c4' : '#8db8e8';
      ctx.strokeStyle = id.id === 'boncuk' ? '#9e4466' : '#3d638f';
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.ellipse(0, 0, 26, 11.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -11.5); ctx.quadraticCurveTo(2, -17, 6, -16); ctx.stroke();
      ctx.restore();
    } else if (hw === 'sunhat_mini') {
      ctx.save();
      ctx.translate(2, -30);
      ctx.fillStyle = '#f7df9e';
      ctx.strokeStyle = '#9c7838';
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.ellipse(0, 3, 36, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 1, 20, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f7a8c4';
      rr(ctx, -20, -4, 40, 6, 3); ctx.fill(); ctx.stroke();
      ctx.restore();
    } else if (hw === 'head_bee_antennae') {
      // Cute yellow cap + springy bobbing bee antennae!
      const bob = pose.flowerWiggle * 12;
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#422006';
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.arc(2, -26, 17, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      // Left & right antennae stems
      ctx.strokeStyle = '#3f3528';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-6, -39); ctx.quadraticCurveTo(-16, -54, -18 + bob * 0.4, -60);
      ctx.moveTo(10, -39); ctx.quadraticCurveTo(18, -54, 22 + bob * 0.4, -60);
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(-18 + bob * 0.4, -60, 5.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(22 + bob * 0.4, -60, 5.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (hw === 'head_ballet_tiara') {
      ctx.save();
      ctx.translate(2, -30);
      ctx.fillStyle = '#fbcfe8';
      ctx.strokeStyle = '#b54c77';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-16, 2); ctx.lineTo(-10, -10); ctx.lineTo(0, -16);
      ctx.lineTo(10, -10); ctx.lineTo(16, 2); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(0, -9, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (hw === 'head_police_cap') {
      ctx.save();
      ctx.translate(2, -31);
      // Glossy visor
      ctx.fillStyle = '#243554';
      ctx.strokeStyle = '#142036';
      ctx.lineWidth = 2.1;
      ctx.beginPath(); ctx.ellipse(4, 3, 25, 6.5, 0.04, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // Navy peaked cap crown
      ctx.fillStyle = '#5072ab';
      ctx.beginPath();
      ctx.moveTo(-21, 2); ctx.lineTo(-24, -12);
      ctx.quadraticCurveTo(0, -20, 24, -12); ctx.lineTo(21, 2);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Golden police badge star on front
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 1.4;
      drawStarShape(ctx, 2, -7, 6.2, 3, 5);
      ctx.fill(); ctx.stroke();
      ctx.restore();
    } else if (hw === 'head_pirate_hat') {
      ctx.save();
      ctx.translate(2, -32);
      ctx.fillStyle = '#3b3230';
      ctx.strokeStyle = '#1f1816';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-32, 3);
      ctx.quadraticCurveTo(-22, -20, 0, -22);
      ctx.quadraticCurveTo(22, -20, 32, 3);
      ctx.quadraticCurveTo(0, -3, -32, 3);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Cute white paw emblem instead of scary skull!
      ctx.fillStyle = '#fff9f2';
      ctx.beginPath(); ctx.arc(0, -8, 4.2, 0, Math.PI * 2); ctx.fill();
      [-4.5, 0, 4.5].forEach(px => {
        ctx.beginPath(); ctx.arc(px, -14, 1.8, 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();
    } else if (hw === 'head_mermaid_star') {
      ctx.save();
      ctx.translate(16, -24);
      ctx.rotate(0.25 + pose.flowerWiggle);
      ctx.fillStyle = '#fba0b8';
      ctx.strokeStyle = '#a84464';
      ctx.lineWidth = 1.9;
      drawStarShape(ctx, 0, 0, 12, 5.5, 5);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(0, 0, 2.8, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (hw === 'head_princess_crown' || hw === 'head_prince_crown') {
      const isPrincess = hw === 'head_princess_crown';
      ctx.save();
      ctx.translate(2, -30);
      ctx.fillStyle = '#f6cf65';
      ctx.strokeStyle = '#9c6e14';
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(-16, 2); ctx.lineTo(-18, -14); ctx.lineTo(-8, -5);
      ctx.lineTo(0, -19); ctx.lineTo(8, -5); ctx.lineTo(18, -14); ctx.lineTo(16, 2);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = isPrincess ? '#f472b6' : '#60a5fa';
      ctx.beginPath(); ctx.arc(0, -5, 3.6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (hw === 'head_soldier_beret') {
      ctx.save();
      ctx.translate(0, -31);
      ctx.rotate(-0.14);
      ctx.fillStyle = '#79996d';
      ctx.strokeStyle = '#3b5234';
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.ellipse(0, 0, 25, 11.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f6cf65';
      drawStarShape(ctx, 8, -1, 5.2, 2.4, 5);
      ctx.fill();
      ctx.restore();
    } else if (hw === 'head_detective_hat') {
      ctx.save();
      ctx.translate(2, -30);
      ctx.fillStyle = '#b58d5b';
      ctx.strokeStyle = '#5c4123';
      ctx.lineWidth = 2.1;
      // Double Sherlock visors
      ctx.beginPath(); ctx.ellipse(0, 2, 31, 6.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#d4b383';
      ctx.beginPath(); ctx.arc(0, 1, 20, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      // Cute dark ribbon bow at top
      ctx.fillStyle = '#69472b';
      ctx.beginPath(); ctx.arc(0, -19, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (hw === 'head_halloween_witch') {
      ctx.save();
      ctx.translate(2, -30);
      ctx.rotate(-0.08);
      ctx.fillStyle = '#5e4499';
      ctx.strokeStyle = '#2d1c57';
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.ellipse(0, 3, 34, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-18, 2); ctx.bezierCurveTo(-14, -20, -2, -38, -20, -40);
      ctx.bezierCurveTo(-2, -46, 16, -24, 18, 2);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fb923c';
      rr(ctx, -18, -3, 36, 6, 3); ctx.fill(); ctx.stroke();
      ctx.restore();
    } else if (hw === 'head_christmas_santa') {
      ctx.save();
      ctx.translate(2, -30);
      ctx.fillStyle = '#e55c74';
      ctx.strokeStyle = '#852236';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-20, 2); ctx.bezierCurveTo(-14, -28, 12, -32, 26, -12);
      ctx.quadraticCurveTo(16, -8, 18, 2); ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Fluffy white brim & pom-pom!
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#cbd5e1';
      rr(ctx, -23, -3, 46, 9, 4.5); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(28, -11, 7.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    } else if (hw === 'head_safari_pith') {
      ctx.save();
      ctx.translate(2, -30);
      ctx.fillStyle = '#e6d0a3';
      ctx.strokeStyle = '#7c6236';
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.ellipse(0, 3, 32, 7.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 2, 21, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#8c683d';
      rr(ctx, -21, -3, 42, 5.5, 2.5); ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  // =========================================================================
  // 11. FX OVERLAY & MASTER ENTRY POINT: CatRenderer.draw(...)
  // =========================================================================
  function drawCatFX(ctx, pose, animTimer) {
    if (pose.showSparkles) {
      ctx.save();
      for (let i = 0; i < 3; i++) {
        const ang = animTimer * 3.2 + i * 2.1;
        const sx = 12 + Math.cos(ang) * 58;
        const sy = -28 + Math.sin(ang * 1.2) * 28;
        ctx.font = '18px serif';
        ctx.textAlign = 'center';
        ctx.fillText(i % 2 === 0 ? '✨' : '⭐', sx, sy);
      }
      ctx.restore();
    }
    if (pose.showHearts) {
      ctx.save();
      const pulse = 1 + Math.sin(animTimer * 5) * 0.14;
      ctx.translate(34, -76);
      ctx.scale(pulse, pulse);
      ctx.font = '20px serif';
      ctx.textAlign = 'center';
      ctx.fillText('💕', 0, 0);
      ctx.restore();
    }
  }

  /**
   * Master Cat Draw Function
   * Draws Boncuk or Müezza cleanly inside (x, y, width, height) with paws planted at y + height!
   */
  function draw(ctx, catId, x, y, width, height, state = 'idle', facingRight = true, animTimer = 0, isHurt = false, configOverride = null, options = {}) {
    const id = getCatIdentity(catId);
    const cfg = resolveCatConfig(catId, configOverride);
    const pose = computeCatPose(catId, state, animTimer, cfg, { ...options, isHurt });

    ctx.save();

    // Master height ~148 units (head top ~-82 to ground feet +66)
    const scale = height / 138;
    const centerX = x + width / 2;
    const feetY = y + height;

    ctx.translate(centerX, feetY - 66 * scale);
    ctx.scale(scale * (facingRight ? 1 : -1), scale);

    if (isHurt && Math.floor(animTimer * 16) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    // 1. Soft Ground Contact Shadow
    ctx.save();
    const shScale = (state === 'jump' || state === 'fall') ? 0.65 : 1.0;
    ctx.fillStyle = 'rgba(78, 52, 42, 0.16)';
    ctx.beginPath();
    ctx.ellipse(2, 65, 44 * shScale, 9 * shScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Squash/Stretch pivoted at ground feet
    ctx.translate(0, 66);
    ctx.scale(pose.squashX, pose.squashY);
    ctx.translate(0, -66 + pose.bodyBob);

    // Upper body articulated group
    ctx.save();
    ctx.rotate(pose.torsoTilt);

    // 2. Back Wings / Capes
    drawBackWingsAndCape(ctx, cfg, pose, true);

    // 3. Tail (Natural OR Animated Mermaid Tail!)
    drawTail(ctx, id, cfg, pose);

    // 4. Far Legs (behind torso)
    drawLeg(ctx, id, cfg, -20, 26, pose.backLegFar, false, false);
    drawLeg(ctx, id, cfg, 24, 26, pose.frontLegFar, true, false);

    // 5. Plush Body & Chest Fluff
    drawBody(ctx, id);

    // 6. Costume Body Layer
    drawOutfitBody(ctx, id, cfg, pose);

    // 7. Near Hind Leg
    drawLeg(ctx, id, cfg, -28, 28, pose.backLegNear, false, true);

    const isPawLifting = pose.frontNearLift > 0.05 || pose.frontNearReach > 0.05;

    // 8. Near Front Leg (behind collar/neckwear during normal standing/running/jumping so collar stays crisp!)
    if (!isPawLifting) {
      drawLeg(ctx, id, cfg, 16, 28, pose.frontLegNear, true, true, 0, 0);
    }

    // 9. Near Fluttering Wing (Bee / Fairy)
    if (cfg.outfit === 'outfit_bee' || cfg.outfit === 'outfit_fairy') {
      drawBackWingsAndCape(ctx, cfg, pose, false);
    }

    // 10. Storybook Head, Twin Luminous Eyes, Whiskers, Glasses & Hat
    drawHeadGroup(ctx, id, cfg, pose);

    // 11 & 12. Collar + Swinging Name Tag & Neckwear (Scarf / Bowtie / Tie / Bandana)
    // Drawn IN FRONT OF head chin & chest fluff so collars & bowties are ALWAYS clearly visible!
    // Smart layering: scarf/bandana wraps neatly behind collar+tag; bowtie/tie clips cleanly onto collar!
    const isScarfOrBandana = cfg.neckwear === 'scarf_blue_knit' || cfg.neckwear === 'scarf_pink_pastel' || cfg.neckwear === 'scarf_lavender' || cfg.neckwear === 'bandana_adventure';
    if (isScarfOrBandana) {
      drawNeckwear(ctx, id, cfg, pose);
      drawCollarAndTag(ctx, id, cfg, pose);
    } else {
      drawCollarAndTag(ctx, id, cfg, pose);
      drawNeckwear(ctx, id, cfg, pose);
    }

    // 13. Near Front Leg when Lifting to Touch Collar or Bat Companion's Tag!
    if (isPawLifting) {
      drawLeg(ctx, id, cfg, 16, 28, pose.frontLegNear, true, true, pose.frontNearLift, pose.frontNearReach);
    }

    // 14. Translucent Glass Astronaut Helmet Bubble (over head, cleanly above collar!)
    if (cfg.headwear === 'head_astronaut_helmet') {
      ctx.save();
      ctx.translate(30 + pose.headOffsetX, -24 + pose.headOffsetY);
      ctx.rotate(pose.headTilt);
      const bg = ctx.createRadialGradient(-10, -16, 10, 2, -2, 50);
      bg.addColorStop(0, 'rgba(255, 255, 255, 0.34)');
      bg.addColorStop(0.75, 'rgba(186, 230, 253, 0.22)');
      bg.addColorStop(1, 'rgba(147, 197, 253, 0.42)');
      ctx.fillStyle = bg;
      ctx.strokeStyle = '#7ea8cc';
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.arc(2, -4, 46, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.arc(2, -4, 39, Math.PI * 1.12, Math.PI * 1.48);
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.2;
      rr(ctx, -26, 26, 52, 8.5, 4.2);
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    // 15. Celebration / Interaction FX
    drawCatFX(ctx, pose, animTimer);

    ctx.restore();
    ctx.restore();
  }

  /**
   * Renders crisp live preview pedestal inside Cat Customization Studio (Solo OR Duo Interactive!)
   */
  function drawStudioPreview(ctx, cssWidth, cssHeight, mode = 'muezza', pose = 'idle', facingRight = true, animTimer = 0) {
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    // Dreamy pastel atelier backdrop
    const bg = ctx.createLinearGradient(0, 0, 0, cssHeight);
    bg.addColorStop(0, '#fff9f3');
    bg.addColorStop(0.55, '#fceef6');
    bg.addColorStop(1, '#edf2fc');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    const halo = ctx.createRadialGradient(cssWidth * 0.5, cssHeight * 0.46, 12, cssWidth * 0.5, cssHeight * 0.46, cssWidth * 0.48);
    halo.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
    halo.addColorStop(0.6, 'rgba(253, 230, 188, 0.20)');
    halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    // Subtle floating paws & sparkles
    for (let i = 0; i < 6; i++) {
      const px = ((i * 51 + animTimer * 9) % (cssWidth + 24)) - 12;
      const py = 24 + ((i * 43 + Math.sin(animTimer * 1.4 + i) * 12) % (cssHeight - 85));
      ctx.save();
      ctx.globalAlpha = 0.48;
      ctx.font = '13px serif';
      ctx.fillText(i % 2 === 0 ? '✨' : '🐾', px, py);
      ctx.restore();
    }

    // Soft pastel meadow pedestal
    ctx.fillStyle = '#dcf5e4';
    ctx.strokeStyle = '#a7dfc0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cssWidth / 2, cssHeight - 28, cssWidth * 0.42, 16, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    if (mode === 'duo') {
      // DUO INTERACTIVE PREVIEW: Müezza & Boncuk together playing with each other's accessories!
      const catH = cssHeight * 0.47;
      const catW = catH * 1.18;
      const yPos = cssHeight - 28 - catH;
      const isInteract = pose === 'interact' || pose === 'idle';
      draw(ctx, 'muezza', cssWidth * 0.5 - catW + 8, yPos, catW, catH, isInteract ? 'interact' : pose, true, animTimer, false, null, { interactRole: 'sniff_scarf' });
      draw(ctx, 'boncuk', cssWidth * 0.5 - 8, yPos + 2, catW * 0.96, catH * 0.96, isInteract ? 'interact' : pose, false, animTimer, false, null, { interactRole: 'bat_tag' });
    } else {
      const catH = cssHeight * 0.62;
      const catW = catH * 1.22;
      draw(ctx, mode, (cssWidth - catW) / 2, cssHeight - 28 - catH, catW, catH, pose, facingRight, animTimer, false);
    }
  }

  window.CatRenderer = {
    draw,
    drawStudioPreview,
    computeCatPose,
    getCatIdentity
  };
})();
