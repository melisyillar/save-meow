/**
 * BONCUK & MÜEZZA – save.meow
 * Wardrobe, Gender-Aware Character Customization Catalog & Persistent Reward Progression
 * Zero external dependencies; persists cleanly via localStorage.
 */

(function () {
  const CONFIG_STORAGE_KEY = 'save_meow_hero_config_v2';
  const PROGRESS_STORAGE_KEY = 'save_meow_wardrobe_progress_v2';

  // =========================================================================
  // 1. HAIR STYLES (9 Girl + 8 Boy = 17 distinct illustrated silhouettes)
  // =========================================================================
  const GIRL_HAIRSTYLES = [
    { id: 'long_wavy',     name: 'Uzun Dalgalı',  icon: '🌊', gender: 'girl', unlockLevel: 0 },
    { id: 'long_straight', name: 'Uzun Düz',      icon: '✨', gender: 'girl', unlockLevel: 0 },
    { id: 'bob',           name: 'Küt Kesim',     icon: '💇‍♀️', gender: 'girl', unlockLevel: 0 },
    { id: 'short_girl',    name: 'Kısa Saç',      icon: '🌸', gender: 'girl', unlockLevel: 0 },
    { id: 'ponytail',      name: 'At Kuyruğu',    icon: '🎀', gender: 'girl', unlockLevel: 0 },
    { id: 'twin_braids',   name: 'İki Örgü',      icon: '🪢', gender: 'girl', unlockLevel: 0 },
    { id: 'single_braid',  name: 'Tek Örgü',      icon: '🌿', gender: 'girl', unlockLevel: 0 },
    { id: 'bun',           name: 'Topuz',         icon: '🩰', gender: 'girl', unlockLevel: 0 },
    { id: 'bangs',         name: 'Kaküllü Saç',   icon: '🌷', gender: 'girl', unlockLevel: 0 }
  ];

  const BOY_HAIRSTYLES = [
    { id: 'short_classic', name: 'Kısa Klasik',        icon: '👦', gender: 'boy', unlockLevel: 0 },
    { id: 'messy_short',   name: 'Dağınık Kısa Saç',   icon: '🍃', gender: 'boy', unlockLevel: 0 },
    { id: 'side_part',     name: 'Yan Ayrılmış Saç',   icon: '✨', gender: 'boy', unlockLevel: 0 },
    { id: 'wavy_boy',      name: 'Dalgalı Saç',        icon: '🌊', gender: 'boy', unlockLevel: 0 },
    { id: 'curly_boy',     name: 'Kıvırcık Saç',       icon: '☁️', gender: 'boy', unlockLevel: 0 },
    { id: 'long_boy',      name: 'Uzun Saç',           icon: '🧣', gender: 'boy', unlockLevel: 0 },
    { id: 'buzz',          name: 'Sıfıra Yakın Tıraş', icon: '⚡', gender: 'boy', unlockLevel: 0 },
    { id: 'bald',          name: 'Kel',                icon: '☀️', gender: 'boy', unlockLevel: 0 }
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
  // 6. TOPS (Gender-tagged: 'both', 'girl', 'boy')
  // =========================================================================
  const TOPS = [
    { id: 'sweater_cream',      name: 'Krem Örgü Kazak',      icon: '🧶', gender: 'both', unlockLevel: 0,  desc: 'Pati yamalı yumuşak örgü kazak' },
    { id: 'tee_pastel',         name: 'Pastel Yaka Tişört',   icon: '👕', gender: 'both', unlockLevel: 0,  desc: 'Kıvrık kollu rahat pastel tişört' },
    { id: 'hoodie_mint',        name: 'Nane Kapüşonlu',       icon: '🧥', gender: 'both', unlockLevel: 0,  desc: 'Kanguru cepli kapüşonlu sweatshirt' },
    { id: 'blouse_blossom',     name: 'Çiçekli Fırfır Bluz',  icon: '👚', gender: 'girl', unlockLevel: 0,  desc: 'Kabarık kollu fırfırlı masal bluzu' },
    { id: 'shirt_plaid',        name: 'Kareli Çocuk Gömleği', icon: '👔', gender: 'boy',  unlockLevel: 0,  desc: 'Kıvrık kollu yakalı pastel gömlek' },
    { id: 'jacket_denim',       name: 'Pastel Kot Ceket',     icon: '🧥', gender: 'boy',  unlockLevel: 0,  desc: 'Krem tişört üstü cepli kot ceket' },
    { id: 'cardigan_berry',     name: 'Böğürtlen Hırka',      icon: '🍓', gender: 'girl', unlockLevel: 3,  desc: 'Bölüm 3 Ödülü • Düğmeli yumuşak hırka' },
    { id: 'jacket_bomber',      name: 'Pastel Kolej Ceketi',  icon: '⭐', gender: 'boy',  unlockLevel: 3,  desc: 'Bölüm 3 Ödülü • Çizgili manşetli ceket' },
    { id: 'vest_explorer',      name: 'Kaşif Yeleği',         icon: '🧭', gender: 'both', unlockLevel: 9,  desc: 'Bölüm 9 Ödülü • Fularlı macera yeleği' },
    { id: 'sailor_top',         name: 'Denizci Bluzu', nameBoy: 'Denizci Gömleği', icon: '⚓', gender: 'both', unlockLevel: 12, desc: 'Bölüm 12 Ödülü • Denizci yakalı üst' },
    { id: 'starlight_cape_top', name: 'Yıldız Pelerin Tunik', icon: '🌟', gender: 'both', unlockLevel: 18, desc: 'Bölüm 18 Ödülü • Altın tokalı pelerinli üst' }
  ];

  // =========================================================================
  // 7. BOTTOMS (Gender-tagged: NO skirts/dresses for boy!)
  // =========================================================================
  const BOTTOMS = [
    { id: 'jeans_soft',       name: 'Pastel Kot Pantolon',   icon: '👖', gender: 'both', unlockLevel: 0,  desc: 'Kıvrık paçalı yumuşak kot' },
    { id: 'shorts_cozy',      name: 'Bahçe Şortu',           icon: '🩳', gender: 'both', unlockLevel: 0,  desc: 'Cepli rahat doğa şortu' },
    { id: 'overalls_garden',  name: 'Bahçe Tulumu',          icon: '🌻', gender: 'both', unlockLevel: 0,  desc: 'Askılı cepli sevimli tulum' },
    { id: 'skirt_pleated',    name: 'Pileli Pastel Etek',    icon: '👗', gender: 'girl', unlockLevel: 0,  desc: 'Uçuşan pileli lavanta etek' },
    { id: 'chinos_warm',      name: 'Kumaş Pantolon',        icon: '👖', gender: 'boy',  unlockLevel: 0,  desc: 'Kemerli kum rengi rahat pantolon' },
    { id: 'tulip_skirt',      name: 'Lale Fırfır Etek',      icon: '🌷', gender: 'girl', unlockLevel: 6,  desc: 'Bölüm 6 Ödülü • Kat kat fırfırlı etek' },
    { id: 'cargo_pants',      name: 'Kaşif Kargo Pantolonu', icon: '🏕️', gender: 'boy',  unlockLevel: 6,  desc: 'Bölüm 6 Ödülü • Yan cepli macera pantolonu' },
    { id: 'adventurer_pants', name: 'Şövalye Pantolonu',     icon: '🛡️', gender: 'both', unlockLevel: 15, desc: 'Bölüm 15 Ödülü • Kemerli masal pantolonu' }
  ];

  // =========================================================================
  // 8. SPECIAL MILESTONE OUTFITS (Levels 5, 10, 15, 20 — gender-adapted!)
  // =========================================================================
  const SPECIAL_OUTFITS = [
    { id: 'none',                  name: 'Serbest Kombin', icon: '🎨', gender: 'both', unlockLevel: 0, desc: 'Üst ve alt kıyafetleri kendin kombinle' },
    { id: 'outfit_cat_onesie',     name: 'Mırnav Yağmurluk Seti', icon: '🐱', gender: 'both', unlockLevel: 5, desc: 'Bölüm 5 Özel Kostümü • Kedi kulaklı şeftali parka & pati cepleri' },
    { id: 'outfit_fairy_garden',   name: 'Büyülü Bahçe Perisi', nameBoy: 'Orman Muhafızı Seti', icon: '🧚', iconBoy: '🌿', gender: 'both', unlockLevel: 10, desc: 'Bölüm 10 Özel Kostümü • Büyülü doğa masalı kostümü' },
    { id: 'outfit_royal_storybook',name: 'Kraliyet Masalı Seti', nameBoy: 'Masal Prensi Seti', icon: '👑', gender: 'both', unlockLevel: 15, desc: 'Bölüm 15 Özel Kostümü • Altın sırmalı kadife kraliyet kostümü' },
    { id: 'outfit_star_wizard',    name: 'Gökyüzü Yıldız Büyücüsü', icon: '🌙', gender: 'both', unlockLevel: 20, desc: 'Bölüm 20 Özel Kostümü • Takımyıldızlı büyülü pelerin & cübbe' }
  ];

  // =========================================================================
  // 9. SHOES (Gender-tagged)
  // =========================================================================
  const SHOES = [
    { id: 'sneakers',        name: 'Pastel Spor',        icon: '👟', gender: 'both', unlockLevel: 0,  desc: 'Bağcıklı yumuşak spor ayakkabı' },
    { id: 'boots_cozy',      name: 'Pofuduk Bot',        icon: '🥾', gender: 'both', unlockLevel: 0,  desc: 'Kürk bilekli sıcak süet bot' },
    { id: 'mary_janes',      name: 'Kurdeleli Babet',    icon: '🩰', gender: 'girl', unlockLevel: 0,  desc: 'Bantlı sevimli masal ayakkabısı' },
    { id: 'loafers_classic', name: 'Klasik Ayakkabı',    icon: '👞', gender: 'boy',  unlockLevel: 0,  desc: 'Kestane rengi şık çocuk ayakkabısı' },
    { id: 'rain_boots',      name: 'Sarı Yağmur Çizme',  icon: '🌧️', gender: 'both', unlockLevel: 6,  desc: 'Bölüm 6 Ödülü • Parlak neşeli çizme' },
    { id: 'star_boots',      name: 'Yıldızlı Çizme',     icon: '⭐', gender: 'both', unlockLevel: 15, desc: 'Bölüm 15 Ödülü • Altın kanatlı çizme' }
  ];

  // =========================================================================
  // 10. HAIR ACCESSORIES (Strictly Girl Only!)
  // =========================================================================
  const HAIR_ACCESSORIES = [
    { id: 'none',           name: 'Yok',            icon: '✖️', gender: 'both', unlockLevel: 0 },
    { id: 'flower_clip',    name: 'Papatya Toka',   icon: '🌼', gender: 'girl', unlockLevel: 0 },
    { id: 'star_clips',     name: 'Yıldız Tokalar', icon: '⭐', gender: 'girl', unlockLevel: 0 },
    { id: 'ribbon_bow',     name: 'İpek Kurdele',   icon: '🎀', gender: 'girl', unlockLevel: 3 },
    { id: 'butterfly_clip', name: 'Kelebek Toka',   icon: '🦋', gender: 'girl', unlockLevel: 9 },
    { id: 'wing_clips',     name: 'Masal Kanat',    icon: '🪽', gender: 'girl', unlockLevel: 21 }
  ];

  // =========================================================================
  // 11. HATS / HEADWEAR (Gender-tagged!)
  // =========================================================================
  const HATS = [
    { id: 'none',         name: 'Yok',            icon: '✖️', gender: 'both', unlockLevel: 0 },
    { id: 'beret',        name: 'Pastel Bere',    icon: '🎨', gender: 'girl', unlockLevel: 0 },
    { id: 'sun_hat',      name: 'Hasır Şapka',    icon: '👒', gender: 'girl', unlockLevel: 0 },
    { id: 'cap_baseball', name: 'Pastel Şapka',   icon: '🧢', gender: 'boy',  unlockLevel: 0 },
    { id: 'beanie_cozy',  name: 'Örgü Bere',      icon: '🧶', gender: 'boy',  unlockLevel: 0 },
    { id: 'cat_ears',       name: 'Kedi Kulak Taç',  icon: '🐱', gender: 'girl', unlockLevel: 6 },
    { id: 'cap_cat_beanie', name: 'Kedi Kulak Bere', icon: '🐱', gender: 'boy',  unlockLevel: 6 },
    { id: 'flower_crown', name: 'Çiçek Tacı',     icon: '💐', gender: 'girl', unlockLevel: 12 },
    { id: 'cap_explorer', name: 'Kaşif Kasketi',  icon: '🧭', gender: 'boy',  unlockLevel: 12 },
    { id: 'wizard_hat',   name: 'Büyücü Şapkası', icon: '🧙', gender: 'both', unlockLevel: 18 }
  ];

  // =========================================================================
  // 12. GLASSES (Gender-tagged!)
  // =========================================================================
  const GLASSES = [
    { id: 'none',            name: 'Yok',             icon: '✖️', gender: 'both', unlockLevel: 0 },
    { id: 'round_glasses',   name: 'Yuvarlak Gözlük', icon: '👓', gender: 'both', unlockLevel: 0 },
    { id: 'cat_eye_glasses', name: 'Kedi Gözlüğü',    icon: '🕶️', gender: 'girl', unlockLevel: 9 },
    { id: 'sport_shades',    name: 'Güneş Gözlüğü',   icon: '😎', gender: 'boy',  unlockLevel: 9 },
    { id: 'star_shades',     name: 'Yıldız Gözlük',   icon: '🌟', gender: 'girl', unlockLevel: 15 },
    { id: 'goggles_pilot',   name: 'Pilot Gözlüğü',   icon: '🥽', gender: 'boy',  unlockLevel: 15 }
  ];

  // =========================================================================
  // 13. NECK & STYLE ACCESSORIES (Great boy & unisex accessories!)
  // =========================================================================
  const NECK_ACCESSORIES = [
    { id: 'none',         name: 'Yok',               icon: '✖️', gender: 'both', unlockLevel: 0 },
    { id: 'scarf_knit',   name: 'Pastel Örgü Atkı',  icon: '🧣', gender: 'both', unlockLevel: 0 },
    { id: 'bandana_star', name: 'Macera Fuları',     icon: '⭐', gender: 'boy',  unlockLevel: 0 },
    { id: 'bowtie_cute',  name: 'Şık Papyon',        icon: '🎩', gender: 'boy',  unlockLevel: 3 },
    { id: 'medal_hero',   name: 'Kahraman Madalyonu',icon: '🏅', gender: 'boy',  unlockLevel: 9 },
    { id: 'badge_knight', name: 'Şövalye Broşu',     icon: '🛡️', gender: 'boy',  unlockLevel: 21 }
  ];

  // Combined rewardable items registry for milestone unlocking
  const ALL_WARDROBE_ITEMS = [
    ...TOPS.map(i => ({ ...i, category: 'top', categoryLabel: 'Üst Kıyafet' })),
    ...BOTTOMS.map(i => ({ ...i, category: 'bottom', categoryLabel: 'Alt Kıyafet' })),
    ...SPECIAL_OUTFITS.map(i => ({ ...i, category: 'outfit', categoryLabel: 'Özel Kostüm' })),
    ...SHOES.map(i => ({ ...i, category: 'shoes', categoryLabel: 'Ayakkabı' })),
    ...HAIR_ACCESSORIES.map(i => ({ ...i, category: 'hairAcc', categoryLabel: 'Saç Aksesuarı' })),
    ...HATS.map(i => ({ ...i, category: 'hat', categoryLabel: 'Şapka / Taç' })),
    ...GLASSES.map(i => ({ ...i, category: 'glasses', categoryLabel: 'Gözlük' })),
    ...NECK_ACCESSORIES.map(i => ({ ...i, category: 'neckAcc', categoryLabel: 'Stil Aksesuarı' }))
  ];

  // =========================================================================
  // GENDER FILTERING & DISPLAY HELPERS
  // =========================================================================
  function isItemAllowedForGender(item, gender) {
    if (!item) return false;
    const g = gender === 'boy' ? 'boy' : 'girl';
    if (!item.gender || item.gender === 'both') return true;
    return item.gender === g;
  }

  function filterForGender(list, gender) {
    return list.filter(item => isItemAllowedForGender(item, gender));
  }

  function isSlotValueAllowedForGender(key, value, gender) {
    const g = gender === 'boy' ? 'boy' : 'girl';
    if (key === 'hairStyle') {
      const list = g === 'boy' ? BOY_HAIRSTYLES : GIRL_HAIRSTYLES;
      return list.some(h => h.id === value);
    }
    if (key === 'hairAcc' && g === 'boy') {
      return value === 'none';
    }
    const map = {
      top: TOPS,
      bottom: BOTTOMS,
      outfit: SPECIAL_OUTFITS,
      shoes: SHOES,
      hairAcc: HAIR_ACCESSORIES,
      hat: HATS,
      glasses: GLASSES,
      neckAcc: NECK_ACCESSORIES
    };
    const list = map[key];
    if (!list) return true;
    const item = list.find(i => i.id === value);
    return isItemAllowedForGender(item, g);
  }

  function getItemDisplayName(item, gender) {
    if (!item) return '';
    if (gender === 'boy' && item.nameBoy) return item.nameBoy;
    if (gender === 'girl' && item.nameGirl) return item.nameGirl;
    return item.name;
  }

  function getItemDisplayIcon(item, gender) {
    if (!item) return '';
    if (gender === 'boy' && item.iconBoy) return item.iconBoy;
    if (gender === 'girl' && item.iconGirl) return item.iconGirl;
    return item.icon;
  }

  function getGenderDefaults(gender) {
    if (gender === 'boy') {
      return {
        hairStyle: 'messy_short',
        top: 'shirt_plaid',
        bottom: 'jeans_soft',
        outfit: 'none',
        shoes: 'sneakers',
        hairAcc: 'none',
        hat: 'none',
        glasses: 'none',
        neckAcc: 'none'
      };
    }
    return {
      hairStyle: 'long_wavy',
      top: 'blouse_blossom',
      bottom: 'skirt_pleated',
      outfit: 'none',
      shoes: 'mary_janes',
      hairAcc: 'flower_clip',
      hat: 'none',
      glasses: 'none',
      neckAcc: 'none'
    };
  }

  // =========================================================================
  // DEFAULT CONFIG & PERSISTENCE
  // =========================================================================
  function getDefaultHeroConfig() {
    return {
      name: 'Maya',
      gender: 'girl',
      skinTone: 'peach',
      hairColor: 'brown',
      eyeColor: 'brown',
      eyeShape: 'classic',
      eyebrowShape: 'soft',
      ...getGenderDefaults('girl'),
      hairStyleGirl: 'long_wavy',
      hairStyleBoy: 'messy_short',
      savedGirl: getGenderDefaults('girl'),
      savedBoy: getGenderDefaults('boy')
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

  function getRewardsForLevel(levelNum, gender = null) {
    return ALL_WARDROBE_ITEMS.filter(i => i.unlockLevel === levelNum && (!gender || isItemAllowedForGender(i, gender)));
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
    const g = merged.gender;
    const gDef = getGenderDefaults(g);

    // Strictly validate hairStyle against gender
    const validHairs = g === 'girl' ? GIRL_HAIRSTYLES : BOY_HAIRSTYLES;
    if (!validHairs.some(h => h.id === merged.hairStyle)) {
      const remembered = g === 'girl' ? merged.hairStyleGirl : merged.hairStyleBoy;
      merged.hairStyle = validHairs.some(h => h.id === remembered) ? remembered : gDef.hairStyle;
    }

    if (!HAIR_COLORS.some(c => c.id === merged.hairColor)) merged.hairColor = def.hairColor;
    if (!EYE_COLORS.some(c => c.id === merged.eyeColor)) merged.eyeColor = def.eyeColor;
    if (!SKIN_TONES.some(s => s.id === merged.skinTone)) merged.skinTone = def.skinTone;
    if (!EYE_SHAPES.some(e => e.id === merged.eyeShape)) merged.eyeShape = def.eyeShape;
    if (!EYEBROW_SHAPES.some(e => e.id === merged.eyebrowShape)) merged.eyebrowShape = def.eyebrowShape;

    // Strictly enforce BOTH gender compatibility AND unlock state on every slot!
    const ensureValid = (key, list, fallback) => {
      const item = list.find(i => i.id === merged[key]);
      if (!item || !isItemAllowedForGender(item, g) || !isItemUnlocked(item.id, p)) {
        merged[key] = fallback;
      }
    };

    ensureValid('top', TOPS, gDef.top);
    ensureValid('bottom', BOTTOMS, gDef.bottom);
    ensureValid('outfit', SPECIAL_OUTFITS, 'none');
    ensureValid('shoes', SHOES, gDef.shoes);
    ensureValid('hairAcc', HAIR_ACCESSORIES, g === 'boy' ? 'none' : 'none');
    ensureValid('hat', HATS, 'none');
    ensureValid('glasses', GLASSES, 'none');
    ensureValid('neckAcc', NECK_ACCESSORIES, 'none');

    // Absolute safeguard: boys NEVER wear hair clips/bows!
    if (g === 'boy') {
      merged.hairAcc = 'none';
    }

    return merged;
  }

  /**
   * Switches character gender cleanly:
   * - Saves the outgoing gender's look into savedGirl / savedBoy
   * - Loads the target gender's saved look (or authentic gender defaults)
   * - Preserves shared face traits (skinTone, hairColor, eyeColor, eyeShape, eyebrowShape)
   * - Runs sanitizeConfig to guarantee zero incompatible clothes or accessories!
   */
  function switchGender(currentConfig, newGender, progress) {
    const g = newGender === 'boy' ? 'boy' : 'girl';
    const cur = currentConfig || getDefaultHeroConfig();
    const prevGender = cur.gender === 'boy' ? 'boy' : 'girl';
    if (prevGender === g) {
      return sanitizeConfig(cur, progress);
    }

    const genderKeys = ['hairStyle', 'top', 'bottom', 'outfit', 'shoes', 'hairAcc', 'hat', 'glasses', 'neckAcc'];
    const snapshot = {};
    genderKeys.forEach(k => { snapshot[k] = cur[k]; });

    const savedGirl = prevGender === 'girl' ? snapshot : (cur.savedGirl || getGenderDefaults('girl'));
    const savedBoy = prevGender === 'boy' ? snapshot : (cur.savedBoy || getGenderDefaults('boy'));
    const targetPreset = g === 'boy' ? { ...getGenderDefaults('boy'), ...savedBoy } : { ...getGenderDefaults('girl'), ...savedGirl };

    const next = {
      ...cur,
      ...targetPreset,
      gender: g,
      savedGirl,
      savedBoy,
      hairStyleGirl: savedGirl.hairStyle || cur.hairStyleGirl || 'long_wavy',
      hairStyleBoy: savedBoy.hairStyle || cur.hairStyleBoy || 'messy_short'
    };

    return sanitizeConfig(next, progress);
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
    const gender = currentConfig.gender === 'boy' ? 'boy' : 'girl';
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)].id;
    const pickValid = (arr) => {
      const valid = arr.filter(i => isItemAllowedForGender(i, gender) && isItemUnlocked(i.id, p));
      return valid.length ? pick(valid) : arr[0].id;
    };

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
      top: pickValid(TOPS),
      bottom: pickValid(BOTTOMS),
      outfit: Math.random() < 0.25 ? pickValid(SPECIAL_OUTFITS) : 'none',
      shoes: pickValid(SHOES),
      hairAcc: gender === 'girl' && Math.random() < 0.6 ? pickValid(HAIR_ACCESSORIES) : 'none',
      hat: Math.random() < 0.35 ? pickValid(HATS) : 'none',
      glasses: Math.random() < 0.3 ? pickValid(GLASSES) : 'none',
      neckAcc: Math.random() < 0.45 ? pickValid(NECK_ACCESSORIES) : 'none'
    };
    return sanitizeConfig(cfg, p);
  }

  function getUnlockStats(progress, gender = null) {
    const p = progress || loadProgress();
    const rewardables = ALL_WARDROBE_ITEMS.filter(i => i.unlockLevel > 0 && (!gender || isItemAllowedForGender(i, gender)));
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
    NECK_ACCESSORIES,
    ALL_WARDROBE_ITEMS,
    isItemAllowedForGender,
    filterForGender,
    isSlotValueAllowedForGender,
    getItemDisplayName,
    getItemDisplayIcon,
    getGenderDefaults,
    getDefaultHeroConfig,
    getDefaultProgress,
    loadProgress,
    saveProgress,
    loadHeroConfig,
    saveHeroConfig,
    sanitizeConfig,
    switchGender,
    isItemUnlocked,
    getRewardsForLevel,
    checkAndUnlockForLevel,
    getPalette,
    randomizeConfig,
    getUnlockStats
  };
})();
