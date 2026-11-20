/**
 * BONCUK & MÜEZZA – save.meow
 * Wardrobe, Character Customization Catalog & Persistent Reward Progression
 * Zero external dependencies; persists cleanly via localStorage.
 */

(function () {
  const CONFIG_STORAGE_KEY = 'save_meow_hero_config_v2';
  const PROGRESS_STORAGE_KEY = 'save_meow_wardrobe_progress_v2';

  // =========================================================================
  // 1. HAIR STYLES (9 Girl + 8 Boy = 17 distinct illustrated silhouettes)
  // =========================================================================
  const GIRL_HAIRSTYLES = [
    { id: 'long_wavy',     name: 'Uzun Dalgalı',  icon: '🌊', unlockLevel: 0 },
    { id: 'long_straight', name: 'Uzun Düz',      icon: '✨', unlockLevel: 0 },
    { id: 'bob',           name: 'Küt Kesim',     icon: '💇‍♀️', unlockLevel: 0 },
    { id: 'short_girl',    name: 'Kısa Saç',      icon: '🌸', unlockLevel: 0 },
    { id: 'ponytail',      name: 'At Kuyruğu',    icon: '🎀', unlockLevel: 0 },
    { id: 'twin_braids',   name: 'İki Örgü',      icon: '🪢', unlockLevel: 0 },
    { id: 'single_braid',  name: 'Tek Örgü',      icon: '🌿', unlockLevel: 0 },
    { id: 'bun',           name: 'Topuz',         icon: '🩰', unlockLevel: 0 },
    { id: 'bangs',         name: 'Kaküllü Saç',   icon: '🌷', unlockLevel: 0 }
  ];

  const BOY_HAIRSTYLES = [
    { id: 'short_classic', name: 'Kısa Klasik',       icon: '👦', unlockLevel: 0 },
    { id: 'messy_short',   name: 'Dağınık Kısa Saç',  icon: '🍃', unlockLevel: 0 },
    { id: 'side_part',     name: 'Yan Ayrılmış Saç',  icon: '✨', unlockLevel: 0 },
    { id: 'wavy_boy',      name: 'Dalgalı Saç',       icon: '🌊', unlockLevel: 0 },
    { id: 'curly_boy',     name: 'Kıvırcık Saç',      icon: '☁️', unlockLevel: 0 },
    { id: 'long_boy',      name: 'Uzun Saç',          icon: '🧣', unlockLevel: 0 },
    { id: 'buzz',          name: 'Sıfıra Yakın Tıraş',icon: '⚡', unlockLevel: 0 },
    { id: 'bald',          name: 'Kel',               icon: '☀️', unlockLevel: 0 }
  ];

  // =========================================================================
  // 2. HAIR COLORS (11 rich multi-tone storybook palettes)
  // =========================================================================
  const HAIR_COLORS = [
    { id: 'brown',       name: 'Kahverengi',       swatch: '#7c4f33', base: '#7c4f33', light: '#a6714d', dark: '#54331f', outline: '#3b2214' },
    { id: 'dark_brown',  name: 'Koyu Kahverengi',  swatch: '#462c1e', base: '#462c1e', light: '#6a4733', dark: '#2d1a10', outline: '#20110a' },
    { id: 'black',       name: 'Siyah',            swatch: '#272630', base: '#2b2a35', light: '#4e4d60', dark: '#181720', outline: '#111018' },
    { id: 'blonde',      name: 'Sarı',             swatch: '#e8c166', base: '#e8c166', light: '#fae09a', dark: '#be913c', outline: '#7c591d' },
    { id: 'ash_blonde',  name: 'Küllü Sarı',       swatch: '#cabaa0', base: '#cabaa0', light: '#e5dac7', dark: '#9c8b72', outline: '#665845' },
    { id: 'red',         name: 'Kızıl',            swatch: '#b8422e', base: '#b8422e', light: '#dc6953', dark: '#802819', outline: '#57190f' },
    { id: 'copper',      name: 'Bakır',            swatch: '#d16b35', base: '#d16b35', light: '#ef945f', dark: '#9a441a', outline: '#682b0e' },
    { id: 'light_brown', name: 'Açık Kahverengi',  swatch: '#a87852', base: '#a87852', light: '#cca079', dark: '#7c5233', outline: '#53351f' },
    { id: 'pink',        name: 'Pembe',            swatch: '#f29bb8', base: '#f29bb8', light: '#ffc8da', dark: '#ca6889', outline: '#8b3e58' },
    { id: 'lilac',       name: 'Lila',             swatch: '#b99ce8', base: '#b99ce8', light: '#dbc7fa', dark: '#8a6bbf', outline: '#5b4287' },
    { id: 'pastel_blue', name: 'Pastel Mavi',      swatch: '#89c2e8', base: '#89c2e8', light: '#bce1fa', dark: '#5690ba', outline: '#346082' }
  ];

  // =========================================================================
  // 3. EYE COLORS (6 luminous multi-layered iris palettes)
  // =========================================================================
  const EYE_COLORS = [
    { id: 'brown', name: 'Kahverengi', swatch: '#6b3e21', deep: '#3f210e', mid: '#784624', glow: '#b87a46' },
    { id: 'blue',  name: 'Mavi',       swatch: '#3b8ec4', deep: '#1e5078', mid: '#3f96cf', glow: '#9cd8fa' },
    { id: 'green', name: 'Yeşil',      swatch: '#469c6d', deep: '#22593b', mid: '#48a472', glow: '#a1e3b8' },
    { id: 'hazel', name: 'Ela',        swatch: '#8c7a38', deep: '#4c421a', mid: '#8e7c39', glow: '#d4be68' },
    { id: 'grey',  name: 'Gri',        swatch: '#7d8a99', deep: '#434d59', mid: '#7e8c9c', glow: '#c6d2de' },
    { id: 'honey', name: 'Bal Rengi',  swatch: '#c98c2e', deep: '#754c0e', mid: '#cf912e', glow: '#f7d274' }
  ];

  // =========================================================================
  // 4. SKIN TONES (5 warm natural storybook tones)
  // =========================================================================
  const SKIN_TONES = [
    { id: 'porcelain',  name: 'Açık Porselen', swatch: '#ffe6d5', base: '#ffe7d7', shadow: '#ebbca3', blush: '#f79ab0', outline: '#784e3d' },
    { id: 'peach',      name: 'Şeftali',       swatch: '#f9d0b3', base: '#fad2b6', shadow: '#dfa27f', blush: '#f28ca6', outline: '#6e4532' },
    { id: 'warm_beige', name: 'Buğday',        swatch: '#e8b690', base: '#e8b792', shadow: '#c58860', blush: '#e47c8e', outline: '#613c29' },
    { id: 'caramel',    name: 'Karamel',       swatch: '#c68a62', base: '#c78c64', shadow: '#9e623d', blush: '#d46a7a', outline: '#4f2f1e' },
    { id: 'cocoa',      name: 'Sıcak Kahve',   swatch: '#966042', base: '#976143', shadow: '#704128', blush: '#bf5c6b', outline: '#3b2114' }
  ];

  // =========================================================================
  // 5. EYE SHAPES & EYEBROW SHAPES
  // =========================================================================
  const EYE_SHAPES = [
    { id: 'classic',  name: 'Masalsı',   icon: '👁️' },
    { id: 'sparkly',  name: 'Işıltılı',  icon: '✨' },
    { id: 'gentle',   name: 'Yumuşak',   icon: '🌸' },
    { id: 'cheerful', name: 'Neşeli',    icon: '😊' }
  ];

  const EYEBROW_SHAPES = [
    { id: 'soft',       name: 'Yumuşak',   icon: '⌒' },
    { id: 'natural',    name: 'Doğal Düz', icon: '─' },
    { id: 'expressive', name: 'Kavisli',   icon: '⌃' },
    { id: 'bushy',      name: 'Dolgun',    icon: '〰' }
  ];

  // =========================================================================
  // 6. TOPS (4 Starter + 4 Unlockable every 3 levels)
  // =========================================================================
  const TOPS = [
    { id: 'sweater_cream',     name: 'Krem Örgü Kazak',     icon: '🧶', unlockLevel: 0,  desc: 'Pati yamalı yumuşak örgü kazak' },
    { id: 'tee_pastel',        name: 'Pastel Yaka Tişört',  icon: '👕', unlockLevel: 0,  desc: 'Kıvrık kollu rahat pastel tişört' },
    { id: 'hoodie_mint',       name: 'Nane Kapüşonlu',      icon: '🧥', unlockLevel: 0,  desc: 'Kanguru cepli kapüşonlu sweatshirt' },
    { id: 'blouse_blossom',    name: 'Çiçekli Fırfır Bluz', icon: '👚', unlockLevel: 0,  desc: 'Kabarık kollu fırfırlı masal bluzu' },
    { id: 'cardigan_berry',    name: 'Böğürtlen Hırka',     icon: '🍓', unlockLevel: 3,  desc: 'Bölüm 3 Ödülü • Düğmeli yumuşak hırka' },
    { id: 'vest_explorer',     name: 'Kaşif Yeleği',        icon: '🧭', unlockLevel: 9,  desc: 'Bölüm 9 Ödülü • Fularlı macera yeleği' },
    { id: 'sailor_top',        name: 'Denizci Bluzu',       icon: '⚓', unlockLevel: 12, desc: 'Bölüm 12 Ödülü • Kurdeleli denizci yakası' },
    { id: 'starlight_cape_top',name: 'Yıldız Pelerin Tunik',icon: '🌟', unlockLevel: 18, desc: 'Bölüm 18 Ödülü • Altın tokalı pelerinli üst' }
  ];

  // =========================================================================
  // 7. BOTTOMS (4 Starter + 2 Unlockable)
  // =========================================================================
  const BOTTOMS = [
    { id: 'jeans_soft',       name: 'Pastel Kot Pantolon', icon: '👖', unlockLevel: 0,  desc: 'Kıvrık paçalı yumuşak kot' },
    { id: 'skirt_pleated',    name: 'Pileli Pastel Etek',  icon: '👗', unlockLevel: 0,  desc: 'Uçuşan pileli lavanta etek' },
    { id: 'shorts_cozy',      name: 'Bahçe Şortu',         icon: '🩳', unlockLevel: 0,  desc: 'Cepli rahat doğa şortu' },
    { id: 'overalls_garden',  name: 'Bahçe Tulumu',        icon: '🌻', unlockLevel: 0,  desc: 'Askılı cepli sevimli tulum' },
    { id: 'tulip_skirt',      name: 'Lale Fırfır Etek',    icon: '🌷', unlockLevel: 6,  desc: 'Bölüm 6 Ödülü • Kat kat fırfırlı etek' },
    { id: 'adventurer_pants', name: 'Şövalye Pantolonu',   icon: '🛡️', unlockLevel: 15, desc: 'Bölüm 15 Ödülü • Kemerli masal pantolonu' }
  ];

  // =========================================================================
  // 8. SPECIAL MILESTONE OUTFITS (Levels 5, 10, 15, 20 — totally distinct!)
  // =========================================================================
  const SPECIAL_OUTFITS = [
    { id: 'none',                  name: 'Serbest Kombin',       icon: '🎨', unlockLevel: 0,  desc: 'Üst ve alt kıyafetleri kendin kombinle' },
    { id: 'outfit_cat_onesie',     name: 'Mırnav Yağmurluk Seti',icon: '🐱', unlockLevel: 5,  desc: 'Bölüm 5 Özel Kostümü • Kedi kulaklı şeftali pelerin & botlar' },
    { id: 'outfit_fairy_garden',   name: 'Büyülü Bahçe Perisi',  icon: '🧚', unlockLevel: 10, desc: 'Bölüm 10 Özel Kostümü • Yaprak yaprak orman masalı kostümü' },
    { id: 'outfit_royal_storybook',name: 'Kraliyet Masalı Seti', icon: '👑', unlockLevel: 15, desc: 'Bölüm 15 Özel Kostümü • Altın sırmalı kadife kraliyet kostümü' },
    { id: 'outfit_star_wizard',    name: 'Gökyüzü Yıldız Büyücüsü', icon: '🌙', unlockLevel: 20, desc: 'Bölüm 20 Özel Kostümü • Takımyıldızlı büyülü pelerin & cübbe' }
  ];

  // =========================================================================
  // 9. SHOES (3 Starter + 2 Unlockable)
  // =========================================================================
  const SHOES = [
    { id: 'sneakers',    name: 'Pastel Spor',      icon: '👟', unlockLevel: 0,  desc: 'Bağcıklı yumuşak spor ayakkabı' },
    { id: 'mary_janes',  name: 'Kurdeleli Babet',  icon: '🩰', unlockLevel: 0,  desc: 'Bantlı sevimli masal ayakkabısı' },
    { id: 'boots_cozy',  name: 'Pofuduk Bot',      icon: '🥾', unlockLevel: 0,  desc: 'Kürk bilekli sıcak süet bot' },
    { id: 'rain_boots',  name: 'Sarı Yağmur Çizme',icon: '🌧️', unlockLevel: 6,  desc: 'Bölüm 6 Ödülü • Parlak neşeli çizme' },
    { id: 'star_boots',  name: 'Yıldızlı Çizme',   icon: '⭐', unlockLevel: 15, desc: 'Bölüm 15 Ödülü • Altın kanatlı çizme' }
  ];

  // =========================================================================
  // 10. HAIR ACCESSORIES (Starter + Unlockables)
  // =========================================================================
  const HAIR_ACCESSORIES = [
    { id: 'none',           name: 'Yok',            icon: '✖️', unlockLevel: 0 },
    { id: 'flower_clip',    name: 'Papatya Toka',   icon: '🌼', unlockLevel: 0 },
    { id: 'star_clips',     name: 'Yıldız Tokalar', icon: '⭐', unlockLevel: 0 },
    { id: 'ribbon_bow',     name: 'İpek Kurdele',   icon: '🎀', unlockLevel: 3 },
    { id: 'butterfly_clip', name: 'Kelebek Toka',   icon: '🦋', unlockLevel: 9 },
    { id: 'wing_clips',     name: 'Masal Kanat',    icon: '🪽', unlockLevel: 21 }
  ];

  // =========================================================================
  // 11. HATS / HEADWEAR (Starter + Unlockables)
  // =========================================================================
  const HATS = [
    { id: 'none',         name: 'Yok',             icon: '✖️', unlockLevel: 0 },
    { id: 'beret',        name: 'Pastel Bere',     icon: '🎨', unlockLevel: 0 },
    { id: 'sun_hat',      name: 'Hasır Şapka',     icon: '👒', unlockLevel: 0 },
    { id: 'cat_ears',     name: 'Kedi Kulak Taç',  icon: '🐱', unlockLevel: 6 },
    { id: 'flower_crown', name: 'Çiçek Tacı',      icon: '💐', unlockLevel: 12 },
    { id: 'wizard_hat',   name: 'Büyücü Şapkası',  icon: '🧙', unlockLevel: 18 }
  ];

  // =========================================================================
  // 12. GLASSES (Starter + Unlockables)
  // =========================================================================
  const GLASSES = [
    { id: 'none',            name: 'Yok',             icon: '✖️', unlockLevel: 0 },
    { id: 'round_glasses',   name: 'Yuvarlak Gözlük', icon: '👓', unlockLevel: 0 },
    { id: 'cat_eye_glasses', name: 'Kedi Gözlüğü',    icon: '🕶️', unlockLevel: 9 },
    { id: 'star_shades',     name: 'Yıldız Gözlük',   icon: '🌟', unlockLevel: 15 }
  ];

  // Combined rewardable items registry for milestone unlocking
  const ALL_WARDROBE_ITEMS = [
    ...TOPS.map(i => ({ ...i, category: 'top', categoryLabel: 'Üst Kıyafet' })),
    ...BOTTOMS.map(i => ({ ...i, category: 'bottom', categoryLabel: 'Alt Kıyafet' })),
    ...SPECIAL_OUTFITS.map(i => ({ ...i, category: 'outfit', categoryLabel: 'Özel Kostüm' })),
    ...SHOES.map(i => ({ ...i, category: 'shoes', categoryLabel: 'Ayakkabı' })),
    ...HAIR_ACCESSORIES.map(i => ({ ...i, category: 'hairAcc', categoryLabel: 'Saç Aksesuarı' })),
    ...HATS.map(i => ({ ...i, category: 'hat', categoryLabel: 'Şapka / Taç' })),
    ...GLASSES.map(i => ({ ...i, category: 'glasses', categoryLabel: 'Gözlük' }))
  ];

  // =========================================================================
  // DEFAULT CONFIG & PERSISTENCE
  // =========================================================================
  function getDefaultHeroConfig() {
    return {
      name: 'Maya',
      gender: 'girl',
      skinTone: 'peach',
      hairStyle: 'long_wavy',
      hairStyleGirl: 'long_wavy',
      hairStyleBoy: 'messy_short',
      hairColor: 'brown',
      eyeColor: 'brown',
      eyeShape: 'classic',
      eyebrowShape: 'soft',
      top: 'blouse_blossom',
      bottom: 'skirt_pleated',
      outfit: 'none',
      shoes: 'mary_janes',
      hairAcc: 'flower_clip',
      hat: 'none',
      glasses: 'none'
    };
  }

  function getDefaultProgress() {
    return {
      highestLevelCompleted: 0,
      unlockedIds: ALL_WARDROBE_ITEMS.filter(i => i.unlockLevel === 0).map(i => i.id),
      notifiedLevels: []
    };
  }

  function loadProgress() {
    const def = getDefaultProgress();
    try {
      const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (!raw) return def;
      const parsed = JSON.parse(raw);
      const highest = Math.max(0, Number(parsed.highestLevelCompleted) || 0);
      const unlockedSet = new Set(def.unlockedIds);
      if (Array.isArray(parsed.unlockedIds)) {
        parsed.unlockedIds.forEach(id => unlockedSet.add(id));
      }
      // Guarantee every item with unlockLevel <= highest is unlocked
      ALL_WARDROBE_ITEMS.forEach(item => {
        if (item.unlockLevel <= highest) unlockedSet.add(item.id);
      });
      return {
        highestLevelCompleted: highest,
        unlockedIds: Array.from(unlockedSet),
        notifiedLevels: Array.isArray(parsed.notifiedLevels) ? parsed.notifiedLevels : []
      };
    } catch (e) {
      return def;
    }
  }

  function saveProgress(progress) {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {}
  }

  function isItemUnlocked(itemId, progress) {
    const item = ALL_WARDROBE_ITEMS.find(i => i.id === itemId);
    if (!item || item.unlockLevel === 0) return true;
    const p = progress || loadProgress();
    return p.highestLevelCompleted >= item.unlockLevel || p.unlockedIds.includes(itemId);
  }

  function getRewardsForLevel(levelNum) {
    return ALL_WARDROBE_ITEMS.filter(i => i.unlockLevel === levelNum);
  }

  function checkAndUnlockForLevel(levelNum) {
    const progress = loadProgress();
    const newlyUnlocked = [];

    if (levelNum > progress.highestLevelCompleted) {
      progress.highestLevelCompleted = levelNum;
    }

    ALL_WARDROBE_ITEMS.forEach(item => {
      if (item.unlockLevel > 0 && item.unlockLevel <= levelNum) {
        if (!progress.unlockedIds.includes(item.id)) {
          progress.unlockedIds.push(item.id);
          newlyUnlocked.push(item);
        }
      }
    });

    if (newlyUnlocked.length > 0 && !progress.notifiedLevels.includes(levelNum)) {
      progress.notifiedLevels.push(levelNum);
    }

    saveProgress(progress);
    return { progress, newlyUnlocked };
  }

  function sanitizeConfig(cfg, progress) {
    const def = getDefaultHeroConfig();
    const p = progress || loadProgress();
    const merged = { ...def, ...(cfg || {}) };

    if (merged.gender !== 'girl' && merged.gender !== 'boy') merged.gender = 'girl';

    // Validate hairStyle against gender
    const validHairs = merged.gender === 'girl' ? GIRL_HAIRSTYLES : BOY_HAIRSTYLES;
    if (!validHairs.some(h => h.id === merged.hairStyle)) {
      merged.hairStyle = merged.gender === 'girl' ? (merged.hairStyleGirl || 'long_wavy') : (merged.hairStyleBoy || 'messy_short');
      if (!validHairs.some(h => h.id === merged.hairStyle)) {
        merged.hairStyle = validHairs[0].id;
      }
    }

    if (!HAIR_COLORS.some(c => c.id === merged.hairColor)) merged.hairColor = def.hairColor;
    if (!EYE_COLORS.some(c => c.id === merged.eyeColor)) merged.eyeColor = def.eyeColor;
    if (!SKIN_TONES.some(s => s.id === merged.skinTone)) merged.skinTone = def.skinTone;
    if (!EYE_SHAPES.some(e => e.id === merged.eyeShape)) merged.eyeShape = def.eyeShape;
    if (!EYEBROW_SHAPES.some(e => e.id === merged.eyebrowShape)) merged.eyebrowShape = def.eyebrowShape;

    // Validate unlockable slots (never equip a locked item)
    const ensureUnlocked = (key, list, fallback) => {
      if (!list.some(i => i.id === merged[key]) || !isItemUnlocked(merged[key], p)) {
        merged[key] = fallback;
      }
    };
    ensureUnlocked('top', TOPS, 'sweater_cream');
    ensureUnlocked('bottom', BOTTOMS, 'jeans_soft');
    ensureUnlocked('outfit', SPECIAL_OUTFITS, 'none');
    ensureUnlocked('shoes', SHOES, 'sneakers');
    ensureUnlocked('hairAcc', HAIR_ACCESSORIES, 'none');
    ensureUnlocked('hat', HATS, 'none');
    ensureUnlocked('glasses', GLASSES, 'none');

    return merged;
  }

  function loadHeroConfig() {
    const progress = loadProgress();
    try {
      const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (!raw) return sanitizeConfig(getDefaultHeroConfig(), progress);
      return sanitizeConfig(JSON.parse(raw), progress);
    } catch (e) {
      return sanitizeConfig(getDefaultHeroConfig(), progress);
    }
  }

  function saveHeroConfig(config) {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {}
  }

  function getPalette(list, id) {
    return list.find(item => item.id === id) || list[0];
  }

  function randomizeConfig(currentConfig, progress) {
    const p = progress || loadProgress();
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)].id;
    const pickUnlocked = (arr) => {
      const open = arr.filter(i => isItemUnlocked(i.id, p));
      return pick(open.length ? open : arr);
    };

    const gender = currentConfig.gender || 'girl';
    const hairList = gender === 'girl' ? GIRL_HAIRSTYLES : BOY_HAIRSTYLES;
    const newHair = pick(hairList);

    const cfg = {
      ...currentConfig,
      skinTone: pick(SKIN_TONES),
      hairStyle: newHair,
      hairStyleGirl: gender === 'girl' ? newHair : currentConfig.hairStyleGirl,
      hairStyleBoy: gender === 'boy' ? newHair : currentConfig.hairStyleBoy,
      hairColor: pick(HAIR_COLORS),
      eyeColor: pick(EYE_COLORS),
      eyeShape: pick(EYE_SHAPES),
      eyebrowShape: pick(EYEBROW_SHAPES),
      top: pickUnlocked(TOPS),
      bottom: pickUnlocked(BOTTOMS),
      outfit: Math.random() < 0.25 ? pickUnlocked(SPECIAL_OUTFITS) : 'none',
      shoes: pickUnlocked(SHOES),
      hairAcc: Math.random() < 0.6 ? pickUnlocked(HAIR_ACCESSORIES) : 'none',
      hat: Math.random() < 0.35 ? pickUnlocked(HATS) : 'none',
      glasses: Math.random() < 0.3 ? pickUnlocked(GLASSES) : 'none'
    };
    return sanitizeConfig(cfg, p);
  }

  function getUnlockStats(progress) {
    const p = progress || loadProgress();
    const rewardables = ALL_WARDROBE_ITEMS.filter(i => i.unlockLevel > 0);
    const unlockedCount = rewardables.filter(i => isItemUnlocked(i.id, p)).length;
    const nextLocked = rewardables
      .filter(i => !isItemUnlocked(i.id, p))
      .sort((a, b) => a.unlockLevel - b.unlockLevel)[0] || null;
    return {
      unlockedRewards: unlockedCount,
      totalRewards: rewardables.length,
      highestLevel: p.highestLevelCompleted,
      nextMilestoneLevel: nextLocked ? nextLocked.unlockLevel : null,
      nextRewardItem: nextLocked
    };
  }

  window.WardrobeSystem = {
    CONFIG_STORAGE_KEY,
    PROGRESS_STORAGE_KEY,
    GIRL_HAIRSTYLES,
    BOY_HAIRSTYLES,
    HAIR_COLORS,
    EYE_COLORS,
    SKIN_TONES,
    EYE_SHAPES,
    EYEBROW_SHAPES,
    TOPS,
    BOTTOMS,
    SPECIAL_OUTFITS,
    SHOES,
    HAIR_ACCESSORIES,
    HATS,
    GLASSES,
    ALL_WARDROBE_ITEMS,
    getDefaultHeroConfig,
    getDefaultProgress,
    loadProgress,
    saveProgress,
    loadHeroConfig,
    saveHeroConfig,
    sanitizeConfig,
    isItemUnlocked,
    getRewardsForLevel,
    checkAndUnlockForLevel,
    getPalette,
    randomizeConfig,
    getUnlockStats
  };
})();
