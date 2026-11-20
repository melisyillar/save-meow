/**
 * save.meow — Play with Mel
 * Cat Wardrobe, Accessories, Costumes, Duo Theme Sets & Level Reward Progression
 *
 * - Strictly preserves Boncuk's & Müezza's authentic fur & eye identities
 * - Every accessory & costume piece can be worn by EITHER Boncuk or Müezza
 * - Supports full mix-and-match, one-click costume sets, and 8 coordinated Duo Sets
 * - Smart compatibility rules prevent clipping/floating accessories
 * - Persistent via localStorage, synced smoothly with level completion progress
 */

(function () {
  const CAT_CONFIG_KEY = 'save_meow_cat_wardrobe_v1';
  const CAT_PROGRESS_KEY = 'save_meow_cat_rewards_v1';

  // =========================================================================
  // 1. COLLARS (Tasmalar)
  // =========================================================================
  const COLLARS = [
    { id: 'none',                name: 'Tasma Yok',          icon: '✖️', unlockLevel: 0,  forCat: 'both', desc: 'Doğal görünüm' },
    { id: 'collar_pink',         name: 'Pastel Pembe Tasma', icon: '🩷', unlockLevel: 0,  forCat: 'boncuk', color: '#f7a8c4', trim: '#c76187', desc: 'Yumuşak pastel pembe tasma' },
    { id: 'collar_sky',          name: 'Gök Mavisi Tasma',   icon: '🩵', unlockLevel: 0,  forCat: 'boncuk', color: '#93c5fd', trim: '#3b82f6', desc: 'Boncuk gözlerine uyumlu mavi tasma' },
    { id: 'collar_lavender',     name: 'Lavanta Tasma',      icon: '💜', unlockLevel: 0,  forCat: 'muezza', color: '#c4b5fd', trim: '#7c5cc4', desc: 'Masalsı yumuşak lavanta tasma' },
    { id: 'collar_mint',         name: 'Nane Yeşili Tasma',  icon: '💚', unlockLevel: 2,  forCat: 'muezza', color: '#99e2c4', trim: '#3c9674', desc: 'Bölüm 2 Ödülü • Ferah pastel tasma' },
    { id: 'collar_velvet_gold',  name: 'Altın Kadife Tasma', icon: '✨', unlockLevel: 3,  forCat: 'both',   color: '#e57c9e', trim: '#f5b942', desc: 'Bölüm 3 Ödülü • Altın dikişli özel tasma' },
    { id: 'collar_pearl_lace',   name: 'İnci Dantel Tasma',  icon: '🤍', unlockLevel: 12, forCat: 'boncuk', color: '#fbcfe8', trim: '#ffffff', desc: 'Bölüm 12 Ödülü • Zarif inci boncuklu tasma' },
    { id: 'collar_rainbow_star', name: 'Yıldızlı Gökkuşağı', icon: '🌈', unlockLevel: 25, forCat: 'both',   color: '#a78bfa', trim: '#fde047', desc: 'Bölüm 25 Ödülü • Parıltılı özel tasarım tasma' }
  ];

  // =========================================================================
  // 2. COLLAR TAGS (İsimlikler — hareketle doğal sallanır!)
  // =========================================================================
  const TAGS = [
    { id: 'none',      name: 'İsimlik Yok',      icon: '✖️', unlockLevel: 0,  forCat: 'both',   desc: 'Sade tasma' },
    { id: 'tag_heart', name: 'Kalp İsimlik',     icon: '💖', unlockLevel: 0,  forCat: 'boncuk', desc: 'Pastel pembe kalp isimlik' },
    { id: 'tag_star',  name: 'Yıldız İsimlik',   icon: '⭐', unlockLevel: 0,  forCat: 'both',   desc: 'Parlayan altın yıldız isimlik' },
    { id: 'tag_bell',  name: 'Minik Çıngırak',   icon: '🔔', unlockLevel: 2,  forCat: 'both',   desc: 'Bölüm 2 Ödülü • Şıkırdayan altın zil' },
    { id: 'tag_fish',  name: 'Balık Madalyonu',  icon: '🐟', unlockLevel: 3,  forCat: 'muezza', desc: 'Bölüm 3 Ödülü • Sevimli mavi balık isimlik' },
    { id: 'tag_crown', name: 'Kraliyet Arması',  icon: '👑', unlockLevel: 18, forCat: 'both',   desc: 'Bölüm 18 Ödülü • Altın taçlı isimlik' },
    { id: 'tag_moon',  name: 'Hilal İsimlik',    icon: '🌙', unlockLevel: 22, forCat: 'both',   desc: 'Bölüm 22 Ödülü • Büyülü gümüş hilal' }
  ];

  // =========================================================================
  // 3. NECKWEAR (Fularlar & Papyonlar — koşarken dalgalanır!)
  // =========================================================================
  const NECKWEAR = [
    { id: 'none',              name: 'Yok',               icon: '✖️', unlockLevel: 0,  forCat: 'both',   desc: 'Boyun aksesuarı yok' },
    { id: 'scarf_blue_knit',   name: 'Mavi Çizgili Atkı', icon: '🧣', unlockLevel: 0,  forCat: 'muezza', desc: 'Müezza’nın meşhur mavi örgü fuları' },
    { id: 'scarf_pink_pastel', name: 'Pembe Pastel Fular',icon: '🎀', unlockLevel: 0,  forCat: 'boncuk', desc: 'Koşarken dalgalanan pastel fular' },
    { id: 'scarf_lavender',    name: 'Lavanta Fular',     icon: '💜', unlockLevel: 2,  forCat: 'both',   desc: 'Bölüm 2 Ödülü • Yumuşak lila şal' },
    { id: 'bowtie_classic',    name: 'Şık Mavi Papyon',   icon: '🤵', unlockLevel: 2,  forCat: 'muezza', desc: 'Bölüm 2 Ödülü • Beyefendi papyonu' },
    { id: 'bowtie_silk_pink',  name: 'İpek Pembe Papyon', icon: '🎀', unlockLevel: 3,  forCat: 'boncuk', desc: 'Bölüm 3 Ödülü • Zarif ipek fiyonk papyon' },
    { id: 'bandana_adventure', name: 'Kaşif Fuları',      icon: '⭐', unlockLevel: 3,  forCat: 'both',   desc: 'Bölüm 3 Ödülü • Yıldızlı macera bandanası' },
    { id: 'necklace_flower',   name: 'Papatya Çelengi',   icon: '🌼', unlockLevel: 7,  forCat: 'boncuk', desc: 'Bölüm 7 Ödülü • Bahar çiçekli boyun çelengi' }
  ];

  // =========================================================================
  // 4. HEADWEAR (Şapka, Fiyonk, Çiçek & Kostüm Başlıkları — ayrı kullanılabilir!)
  // =========================================================================
  const HEADWEAR = [
    { id: 'none',                  name: 'Yok',                 icon: '✖️', unlockLevel: 0,  forCat: 'both' },
    { id: 'bow_pastel',            name: 'Pastel Fiyonk',       icon: '🎀', unlockLevel: 0,  forCat: 'boncuk', desc: 'Kulak yanı zarif pembe fiyonk' },
    { id: 'flower_daisy',          name: 'Papatya Çiçeği',      icon: '🌼', unlockLevel: 0,  forCat: 'boncuk', desc: 'Hareket ettikçe sallanan papatya' },
    { id: 'beret_pastel',          name: 'Pastel Ressam Bere',  icon: '🎨', unlockLevel: 0,  forCat: 'muezza', desc: 'Sevimli minik pastel bere' },
    { id: 'sunhat_mini',           name: 'Minik Hasır Şapka',   icon: '👒', unlockLevel: 3,  forCat: 'both',   desc: 'Bölüm 3 Ödülü • Kurdeleli yaz şapkası' },
    { id: 'head_bee_antennae',     name: 'Arı Antenli Şapka',   icon: '🐝', unlockLevel: 5,  forCat: 'both',   desc: 'Bölüm 5 Ödülü • Yaylanan minik arı antenleri' },
    { id: 'flower_crown_cat',      name: 'Çiçekli Peri Tacı',   icon: '🌸', unlockLevel: 7,  forCat: 'boncuk', desc: 'Bölüm 7 Ödülü • Pastel bahar çiçek tacı' },
    { id: 'head_ballet_tiara',     name: 'Balerin Kurdele Taç', icon: '🩰', unlockLevel: 8,  forCat: 'boncuk', desc: 'Bölüm 8 Ödülü • İncili bale tacı' },
    { id: 'head_police_cap',       name: 'Polis Şapkası',       icon: '👮', unlockLevel: 10, forCat: 'both',   desc: 'Bölüm 10 Ödülü • Altın rozetli polis şapkası' },
    { id: 'head_pirate_hat',       name: 'Korsan Şapkası',      icon: '🏴‍☠️', unlockLevel: 12, forCat: 'muezza', desc: 'Bölüm 12 Ödülü • Pati amblemli korsan şapkası' },
    { id: 'head_mermaid_star',     name: 'Deniz Yıldızı Toka',  icon: '🐚', unlockLevel: 15, forCat: 'boncuk', desc: 'Bölüm 15 Ödülü • İnci & deniz yıldızı süsü' },
    { id: 'head_princess_crown',   name: 'Prenses Tacı',        icon: '👸', unlockLevel: 18, forCat: 'boncuk', desc: 'Bölüm 18 Ödülü • Pembe taşlı altın taç' },
    { id: 'head_prince_crown',     name: 'Prens Tacı',          icon: '🤴', unlockLevel: 18, forCat: 'muezza', desc: 'Bölüm 18 Ödülü • Safir taşlı kraliyet tacı' },
    { id: 'head_soldier_beret',    name: 'Asker Şapkası',       icon: '🎖️', unlockLevel: 20, forCat: 'muezza', desc: 'Bölüm 20 Ödülü • Yıldızlı sevimli asker beresi' },
    { id: 'head_detective_hat',    name: 'Dedektif Şapkası',    icon: '🕵️', unlockLevel: 20, forCat: 'muezza', desc: 'Bölüm 20 Ödülü • Kareli şık dedektif şapkası' },
    { id: 'head_halloween_witch',  name: 'Cadı Büyücü Şapkası', icon: '🎃', unlockLevel: 22, forCat: 'both',   desc: 'Bölüm 22 Ödülü • Yıldızlı cadı şapkası' },
    { id: 'head_astronaut_helmet', name: 'Astronot Kaskı',      icon: '🧑‍🚀', unlockLevel: 25, forCat: 'both',   desc: 'Bölüm 25 Ödülü • Şeffaf camlı uzay kaskı' },
    { id: 'head_christmas_santa',  name: 'Noel Şapkası',        icon: '🎅', unlockLevel: 28, forCat: 'both',   desc: 'Bölüm 28 Ödülü • Ponponlu sıcacık noel şapkası' },
    { id: 'head_safari_pith',      name: 'Safari Şapkası',      icon: '🧭', unlockLevel: 30, forCat: 'both',   desc: 'Bölüm 30 Ödülü • Macera kaşifi şapkası' }
  ];

  // =========================================================================
  // 5. EYE / FACE DETAILS (Gözlük & Korsan Bandı)
  // =========================================================================
  const EYE_ACCESSORIES = [
    { id: 'none',              name: 'Yok',               icon: '✖️', unlockLevel: 0,  forCat: 'both' },
    { id: 'round_cat_glasses', name: 'Yuvarlak Gözlük',   icon: '👓', unlockLevel: 0,  forCat: 'both',   desc: 'Sevimli altın çerçeveli gözlük' },
    { id: 'pirate_eyepatch',   name: 'Korsan Göz Bandı',  icon: '🏴‍☠️', unlockLevel: 12, forCat: 'muezza', desc: 'Bölüm 12 Ödülü • Sevimli yumuşak göz bandı' },
    { id: 'heart_shades',      name: 'Kalpli Gözlük',     icon: '😎', unlockLevel: 30, forCat: 'boncuk', desc: 'Bölüm 30 Ödülü • Pastel kalp güneş gözlüğü' }
  ];

  // =========================================================================
  // 6. OUTFIT BODIES (Kostüm Kıyafetleri — orijinal tüy & gözleri korur!)
  // =========================================================================
  const OUTFITS = [
    { id: 'none',             name: 'Kostüm Yok',         icon: '🐱', unlockLevel: 0,  forCat: 'both',   desc: 'Doğal yumuşak tüyler' },
    { id: 'outfit_bee',       name: 'Arı Kostümü',        icon: '🐝', unlockLevel: 5,  forCat: 'both',   desc: 'Bölüm 5 Ödülü • Sarı-siyah çizgili tulum & hareketli kanatlar' },
    { id: 'outfit_fairy',     name: 'Çiçek Perisi',       icon: '🧚', unlockLevel: 7,  forCat: 'boncuk', desc: 'Bölüm 7 Ödülü • Pastel yaprak etek & parıltılı peri kanatları' },
    { id: 'outfit_ballerina', name: 'Balerin Tütü',       icon: '🩰', unlockLevel: 8,  forCat: 'boncuk', desc: 'Bölüm 8 Ödülü • Zıplarken sallanan pembe tütü etek' },
    { id: 'outfit_tuxedo',    name: 'Şık Takım',          icon: '🤵', unlockLevel: 8,  forCat: 'muezza', desc: 'Bölüm 8 Ödülü • Yelekli, gömlekli şık ceket takımı' },
    { id: 'outfit_police',    name: 'Polis Üniforması',   icon: '👮', unlockLevel: 10, forCat: 'both',   desc: 'Bölüm 10 Ödülü • Altın rozetli minik polis üniforması' },
    { id: 'outfit_pirate',    name: 'Korsan Kıyafeti',    icon: '🏴‍☠️', unlockLevel: 12, forCat: 'muezza', desc: 'Bölüm 12 Ödülü • Çizgili korsan yeleği & kemer' },
    { id: 'outfit_mermaid',   name: 'Deniz Kızı Kostümü', icon: '🧜', unlockLevel: 15, forCat: 'boncuk', desc: 'Bölüm 15 Ödülü • Deniz kabuğu & dalgalanan pastel kuyruk' },
    { id: 'outfit_beach',     name: 'Sahil Gömleği',      icon: '🌴', unlockLevel: 15, forCat: 'muezza', desc: 'Bölüm 15 Ödülü • Çiçekli ferah yazlık sahil kıyafeti' },
    { id: 'outfit_princess',  name: 'Prenses Elbisesi',   icon: '👸', unlockLevel: 18, forCat: 'boncuk', desc: 'Bölüm 18 Ödülü • Parıltılı pembe kraliyet elbisesi' },
    { id: 'outfit_prince',    name: 'Prens Ceketi',       icon: '🤴', unlockLevel: 18, forCat: 'muezza', desc: 'Bölüm 18 Ödülü • Altın şeritli asil prens pelerini' },
    { id: 'outfit_soldier',   name: 'Asker Üniforması',   icon: '🎖️', unlockLevel: 20, forCat: 'muezza', desc: 'Bölüm 20 Ödülü • Sevimli pastel kamuflaj ceket' },
    { id: 'outfit_detective', name: 'Dedektif Paltosu',   icon: '🕵️', unlockLevel: 20, forCat: 'muezza', desc: 'Bölüm 20 Ödülü • Ekoseli pelerinli dedektif paltosu' },
    { id: 'outfit_halloween', name: 'Cadılar Bayramı',    icon: '🎃', unlockLevel: 22, forCat: 'both',   desc: 'Bölüm 22 Ödülü • Yıldızlı mor-turuncu balkabağı pelerini' },
    { id: 'outfit_astronaut', name: 'Astronot Kıyafeti',  icon: '🚀', unlockLevel: 25, forCat: 'both',   desc: 'Bölüm 25 Ödülü • Yıldız armalı uzay tulumu' },
    { id: 'outfit_christmas', name: 'Noel Kostümü',       icon: '🎄', unlockLevel: 28, forCat: 'both',   desc: 'Bölüm 28 Ödülü • Beyaz kürklü sıcacık noel pelerini' },
    { id: 'outfit_safari',    name: 'Safari Yeleği',      icon: '🦁', unlockLevel: 30, forCat: 'both',   desc: 'Bölüm 30 Ödülü • Cepli ve pusulalı safari kaşifi kıyafeti' }
  ];

  // =========================================================================
  // 7. ONE-CLICK FULL COSTUME SETS (Tek tıkla tam kostüm giydir!)
  // =========================================================================
  const COSTUME_SETS = [
    {
      id: 'set_bee', name: 'Arı Kostümü', icon: '🐝', unlockLevel: 5, forCat: 'both',
      desc: 'Sarı-siyah çizgili kıyafet, hareketli kanatlar & antenli şapka',
      pieces: { outfit: 'outfit_bee', headwear: 'head_bee_antennae', eyeAcc: 'none' }
    },
    {
      id: 'set_fairy', name: 'Çiçek Perisi', icon: '🧚', unlockLevel: 7, forCat: 'boncuk',
      desc: 'Çiçekli taç, minik peri kanatları & papatya çelengi',
      pieces: { outfit: 'outfit_fairy', headwear: 'flower_crown_cat', neckwear: 'necklace_flower', eyeAcc: 'none' }
    },
    {
      id: 'set_ballerina', name: 'Balerin Seti', icon: '🩰', unlockLevel: 8, forCat: 'boncuk',
      desc: 'Zıplarken sallanan pembe tütü, bale tacı & ipek fiyonk',
      pieces: { outfit: 'outfit_ballerina', headwear: 'head_ballet_tiara', neckwear: 'bowtie_silk_pink', eyeAcc: 'none' }
    },
    {
      id: 'set_tuxedo', name: 'Şık Takım Seti', icon: '🤵', unlockLevel: 8, forCat: 'muezza',
      desc: 'Papyon, gömlek detaylı yelek & şık ceket',
      pieces: { outfit: 'outfit_tuxedo', neckwear: 'bowtie_classic', headwear: 'none', eyeAcc: 'none' }
    },
    {
      id: 'set_police', name: 'Polis Seti', icon: '👮', unlockLevel: 10, forCat: 'both',
      desc: 'Polis şapkası, minik üniforma & parlayan altın rozet',
      pieces: { outfit: 'outfit_police', headwear: 'head_police_cap', neckwear: 'none', eyeAcc: 'none' }
    },
    {
      id: 'set_pirate', name: 'Korsan Seti', icon: '🏴‍☠️', unlockLevel: 12, forCat: 'muezza',
      desc: 'Korsan şapkası, göz bandı & çizgili korsan yeleği',
      pieces: { outfit: 'outfit_pirate', headwear: 'head_pirate_hat', eyeAcc: 'pirate_eyepatch', neckwear: 'none' }
    },
    {
      id: 'set_mermaid', name: 'Deniz Kızı Seti', icon: '🧜', unlockLevel: 15, forCat: 'boncuk',
      desc: 'Deniz kabuğu, dalgalanan pastel kuyruk & deniz yıldızı',
      pieces: { outfit: 'outfit_mermaid', headwear: 'head_mermaid_star', neckwear: 'none', eyeAcc: 'none' }
    },
    {
      id: 'set_princess', name: 'Prenses Seti', icon: '👸', unlockLevel: 18, forCat: 'boncuk',
      desc: 'Altın taç, zarif pastel elbise & kraliyet arması',
      pieces: { outfit: 'outfit_princess', headwear: 'head_princess_crown', collar: 'collar_pearl_lace', tag: 'tag_crown', eyeAcc: 'none' }
    },
    {
      id: 'set_soldier', name: 'Asker Seti', icon: '🎖️', unlockLevel: 20, forCat: 'muezza',
      desc: 'Sevimli kamuflaj ceket & yıldızlı asker şapkası',
      pieces: { outfit: 'outfit_soldier', headwear: 'head_soldier_beret', neckwear: 'none', eyeAcc: 'none' }
    },
    {
      id: 'set_detective', name: 'Dedektif Seti', icon: '🕵️', unlockLevel: 20, forCat: 'muezza',
      desc: 'Ekoseli dedektif şapkası, paltosu & yuvarlak gözlük',
      pieces: { outfit: 'outfit_detective', headwear: 'head_detective_hat', eyeAcc: 'round_cat_glasses', neckwear: 'none' }
    },
    {
      id: 'set_astronaut', name: 'Astronot Seti', icon: '🚀', unlockLevel: 25, forCat: 'both',
      desc: 'Uzay kıyafeti, şeffaf kask & yıldız detayları',
      pieces: { outfit: 'outfit_astronaut', headwear: 'head_astronaut_helmet', neckwear: 'none', eyeAcc: 'none' }
    }
  ];

  // =========================================================================
  // 8. COORDINATED DUO SETS (İkili Özel Kostüm Setleri — Boncuk & Müezza uyumlu!)
  // =========================================================================
  const DUO_SETS = [
    {
      id: 'duo_bee', name: 'Arı İkilisi', icon: '🐝', unlockLevel: 5,
      desc: 'İkisi de kanatlı sevimli arı — Boncuk papatya fiyonklu, Müezza şık papyonlu!',
      boncuk: { outfit: 'outfit_bee', headwear: 'head_bee_antennae', neckwear: 'bowtie_silk_pink', collar: 'collar_velvet_gold', tag: 'tag_star', eyeAcc: 'none' },
      muezza: { outfit: 'outfit_bee', headwear: 'head_bee_antennae', neckwear: 'bowtie_classic', collar: 'collar_velvet_gold', tag: 'tag_bell', eyeAcc: 'none' }
    },
    {
      id: 'duo_police', name: 'Polis İkilisi', icon: '👮', unlockLevel: 10,
      desc: 'Boncuk & Müezza birlikte minik rozetli kahraman polis ekibi!',
      boncuk: { outfit: 'outfit_police', headwear: 'head_police_cap', collar: 'collar_pink', tag: 'tag_heart', neckwear: 'none', eyeAcc: 'none' },
      muezza: { outfit: 'outfit_police', headwear: 'head_police_cap', collar: 'collar_sky', tag: 'tag_star', neckwear: 'none', eyeAcc: 'none' }
    },
    {
      id: 'duo_beach', name: 'Deniz & Sahil Teması', icon: '🏖️', unlockLevel: 15,
      desc: 'Boncuk pastel deniz kızı, Müezza hasır şapkalı tropikal sahil kaşifi!',
      boncuk: { outfit: 'outfit_mermaid', headwear: 'head_mermaid_star', collar: 'collar_pearl_lace', tag: 'tag_star', neckwear: 'none', eyeAcc: 'none' },
      muezza: { outfit: 'outfit_beach', headwear: 'sunhat_mini', collar: 'collar_sky', tag: 'tag_fish', neckwear: 'none', eyeAcc: 'none' }
    },
    {
      id: 'duo_royal', name: 'Prenses & Prens', icon: '👑', unlockLevel: 18,
      desc: 'Boncuk zarif masal prensesi, Müezza asil kraliyet prensi!',
      boncuk: { outfit: 'outfit_princess', headwear: 'head_princess_crown', collar: 'collar_pearl_lace', tag: 'tag_crown', neckwear: 'none', eyeAcc: 'none' },
      muezza: { outfit: 'outfit_prince', headwear: 'head_prince_crown', collar: 'collar_velvet_gold', tag: 'tag_crown', neckwear: 'bowtie_classic', eyeAcc: 'none' }
    },
    {
      id: 'duo_halloween', name: 'Cadılar Bayramı Teması', icon: '🎃', unlockLevel: 22,
      desc: 'Büyülü yıldızlı pelerinler, cadı şapkası & gümüş hilal isimlikler!',
      boncuk: { outfit: 'outfit_halloween', headwear: 'head_halloween_witch', collar: 'collar_lavender', tag: 'tag_moon', neckwear: 'scarf_lavender', eyeAcc: 'none' },
      muezza: { outfit: 'outfit_halloween', headwear: 'head_halloween_witch', collar: 'collar_velvet_gold', tag: 'tag_moon', neckwear: 'bowtie_classic', eyeAcc: 'none' }
    },
    {
      id: 'duo_space', name: 'Uzay Kaşifleri', icon: '🚀', unlockLevel: 25,
      desc: 'İkisi de şeffaf kasklı, gökkuşağı tasmalı minik astronotlar!',
      boncuk: { outfit: 'outfit_astronaut', headwear: 'head_astronaut_helmet', collar: 'collar_rainbow_star', tag: 'tag_star', neckwear: 'none', eyeAcc: 'none' },
      muezza: { outfit: 'outfit_astronaut', headwear: 'head_astronaut_helmet', collar: 'collar_rainbow_star', tag: 'tag_moon', neckwear: 'none', eyeAcc: 'none' }
    },
    {
      id: 'duo_christmas', name: 'Noel Teması', icon: '🎄', unlockLevel: 28,
      desc: 'Ponponlu noel şapkaları, sıcacık kürk pelerinler & şıkırdayan çıngıraklar!',
      boncuk: { outfit: 'outfit_christmas', headwear: 'head_christmas_santa', collar: 'collar_pink', tag: 'tag_bell', neckwear: 'scarf_pink_pastel', eyeAcc: 'none' },
      muezza: { outfit: 'outfit_christmas', headwear: 'head_christmas_santa', collar: 'collar_mint', tag: 'tag_bell', neckwear: 'scarf_blue_knit', eyeAcc: 'none' }
    },
    {
      id: 'duo_safari', name: 'Safari Kaşifleri', icon: '🦁', unlockLevel: 30,
      desc: 'Bölüm 30 Özel İkili Seti • Boncuk & Müezza büyük doğa keşfinde!',
      boncuk: { outfit: 'outfit_safari', headwear: 'head_safari_pith', collar: 'collar_velvet_gold', tag: 'tag_heart', neckwear: 'bandana_adventure', eyeAcc: 'heart_shades' },
      muezza: { outfit: 'outfit_safari', headwear: 'head_safari_pith', collar: 'collar_velvet_gold', tag: 'tag_star', neckwear: 'bandana_adventure', eyeAcc: 'round_cat_glasses' }
    }
  ];

  // Unified rewardable registry
  const ALL_CAT_ITEMS = [
    ...COLLARS.map(i => ({ ...i, slot: 'collar', categoryLabel: 'Tasma' })),
    ...TAGS.map(i => ({ ...i, slot: 'tag', categoryLabel: 'İsimlik' })),
    ...NECKWEAR.map(i => ({ ...i, slot: 'neckwear', categoryLabel: 'Fular / Papyon' })),
    ...HEADWEAR.map(i => ({ ...i, slot: 'headwear', categoryLabel: 'Şapka / Baş' })),
    ...EYE_ACCESSORIES.map(i => ({ ...i, slot: 'eyeAcc', categoryLabel: 'Gözlük / Detay' })),
    ...OUTFITS.map(i => ({ ...i, slot: 'outfit', categoryLabel: 'Kostüm' }))
  ];

  // =========================================================================
  // DEFAULT CONFIGS (Authentic Iconic Looks Matching boncuk.png & muezza.png!)
  // =========================================================================
  function getDefaultCatConfig(catId) {
    if (catId === 'boncuk') {
      return {
        collar: 'collar_sky',
        tag: 'tag_star',
        neckwear: 'none',
        headwear: 'none',
        outfit: 'none',
        eyeAcc: 'none'
      };
    }
    return {
      collar: 'none',
      tag: 'none',
      neckwear: 'scarf_blue_knit',
      headwear: 'none',
      outfit: 'none',
      eyeAcc: 'none'
    };
  }

  function getDefaultAllConfigs() {
    return {
      boncuk: getDefaultCatConfig('boncuk'),
      muezza: getDefaultCatConfig('muezza')
    };
  }

  // =========================================================================
  // PROGRESS & PERSISTENCE (Synced seamlessly with existing WardrobeSystem!)
  // =========================================================================
  function getDefaultProgress() {
    return {
      highestLevelCompleted: 0,
      unlockedIds: ALL_CAT_ITEMS.filter(i => i.unlockLevel === 0).map(i => i.id)
    };
  }

  function loadProgress(syncWithHuman = true) {
    const def = getDefaultProgress();
    let highest = 0;
    const unlockedSet = new Set(def.unlockedIds);

    try {
      const raw = localStorage.getItem(CAT_PROGRESS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Number(parsed.highestLevelCompleted) > highest) {
          highest = Number(parsed.highestLevelCompleted);
        }
        if (Array.isArray(parsed.unlockedIds)) {
          parsed.unlockedIds.forEach(id => unlockedSet.add(id));
        }
      } else if (syncWithHuman && window.WardrobeSystem && typeof window.WardrobeSystem.loadProgress === 'function') {
        // First-time migration for players who already completed levels previously
        const hp = window.WardrobeSystem.loadProgress();
        if (hp && Number(hp.highestLevelCompleted) > highest) {
          highest = Number(hp.highestLevelCompleted);
        }
      }
    } catch (e) {}

    ALL_CAT_ITEMS.forEach(item => {
      if (item.unlockLevel <= highest) unlockedSet.add(item.id);
    });
    DUO_SETS.forEach(d => {
      if (d.unlockLevel <= highest) unlockedSet.add(d.id);
    });

    return {
      highestLevelCompleted: highest,
      unlockedIds: Array.from(unlockedSet)
    };
  }

  function saveProgress(progress) {
    try {
      localStorage.setItem(CAT_PROGRESS_KEY, JSON.stringify(progress));
    } catch (e) {}
  }

  function isItemUnlocked(itemId, progress) {
    if (!itemId || itemId === 'none') return true;
    const p = progress || loadProgress();
    const item = ALL_CAT_ITEMS.find(i => i.id === itemId)
      || COSTUME_SETS.find(s => s.id === itemId)
      || DUO_SETS.find(d => d.id === itemId);
    if (!item || item.unlockLevel === 0) return true;
    return p.highestLevelCompleted >= item.unlockLevel || p.unlockedIds.includes(itemId);
  }

  function checkAndUnlockForLevel(levelNum) {
    const progress = loadProgress(false);
    const newlyUnlocked = [];

    if (levelNum > progress.highestLevelCompleted) {
      progress.highestLevelCompleted = levelNum;
    }

    ALL_CAT_ITEMS.forEach(item => {
      if (item.unlockLevel > 0 && item.unlockLevel <= levelNum) {
        if (!progress.unlockedIds.includes(item.id)) {
          progress.unlockedIds.push(item.id);
          newlyUnlocked.push(item);
        }
      }
    });

    DUO_SETS.forEach(duo => {
      if (duo.unlockLevel > 0 && duo.unlockLevel <= levelNum) {
        if (!progress.unlockedIds.includes(duo.id)) {
          progress.unlockedIds.push(duo.id);
          newlyUnlocked.push({
            id: duo.id,
            name: duo.name + ' (İkili Set)',
            icon: duo.icon,
            unlockLevel: duo.unlockLevel,
            forCat: 'duo',
            categoryLabel: 'İkili Kostüm Seti'
          });
        }
      }
    });

    saveProgress(progress);
    return { progress, newlyUnlocked };
  }

  function getForCatLabel(forCat) {
    if (forCat === 'boncuk') return 'Boncuk önerisi';
    if (forCat === 'muezza') return 'Müezza önerisi';
    if (forCat === 'duo') return 'Boncuk & Müezza İkilisi';
    return 'İki Kediye de Uygun';
  }

  // =========================================================================
  // COMPATIBILITY RULES & SANITIZATION
  // =========================================================================
  function sanitizeCatConfig(catId, rawCfg, progress) {
    const def = getDefaultCatConfig(catId);
    const p = progress || loadProgress();
    const cfg = { ...def, ...(rawCfg || {}) };

    const validate = (slot, list, fallback) => {
      const found = list.find(i => i.id === cfg[slot]);
      if (!found || !isItemUnlocked(found.id, p)) {
        cfg[slot] = fallback;
      }
    };

    validate('collar', COLLARS, 'none');
    validate('tag', TAGS, 'none');
    validate('neckwear', NECKWEAR, 'none');
    validate('headwear', HEADWEAR, 'none');
    validate('outfit', OUTFITS, 'none');
    validate('eyeAcc', EYE_ACCESSORIES, 'none');

    // Compatibility rule 1: No floating tag without a collar
    if (cfg.collar === 'none' && cfg.tag !== 'none') {
      cfg.tag = 'none';
    }

    // Compatibility rule 2: Astronaut helmet encloses head cleanly (clear eye accessories so nothing clips visor)
    if (cfg.headwear === 'head_astronaut_helmet' && cfg.eyeAcc !== 'none') {
      cfg.eyeAcc = 'none';
    }

    return cfg;
  }

  let _cachedConfigs = null;

  function loadAllConfigs() {
    const p = loadProgress();
    try {
      const raw = localStorage.getItem(CAT_CONFIG_KEY);
      if (!raw) {
        _cachedConfigs = {
          boncuk: sanitizeCatConfig('boncuk', getDefaultCatConfig('boncuk'), p),
          muezza: sanitizeCatConfig('muezza', getDefaultCatConfig('muezza'), p)
        };
        return _cachedConfigs;
      }
      const parsed = JSON.parse(raw);
      _cachedConfigs = {
        boncuk: sanitizeCatConfig('boncuk', parsed.boncuk, p),
        muezza: sanitizeCatConfig('muezza', parsed.muezza, p)
      };
      return _cachedConfigs;
    } catch (e) {
      _cachedConfigs = getDefaultAllConfigs();
      return _cachedConfigs;
    }
  }

  function saveAllConfigs(allConfigs) {
    _cachedConfigs = allConfigs;
    try {
      localStorage.setItem(CAT_CONFIG_KEY, JSON.stringify(allConfigs));
    } catch (e) {}
  }

  function getCatConfig(catId) {
    if (!_cachedConfigs) loadAllConfigs();
    const id = catId === 'boncuk' ? 'boncuk' : 'muezza';
    return { ..._cachedConfigs[id] };
  }

  /**
   * Equips an individual item onto a cat with smart compatibility handling!
   */
  function equipItem(catId, slot, itemId, progress) {
    const id = catId === 'boncuk' ? 'boncuk' : 'muezza';
    const p = progress || loadProgress();
    if (!isItemUnlocked(itemId, p)) {
      return { ok: false, reason: 'locked', config: getCatConfig(id) };
    }

    const all = loadAllConfigs();
    const cur = { ...all[id] };
    cur[slot] = itemId;

    // Smart Rule A: Picking a name tag when no collar is equipped -> auto-equip matching starter collar!
    if (slot === 'tag' && itemId !== 'none' && cur.collar === 'none') {
      cur.collar = id === 'boncuk' ? 'collar_pink' : 'collar_lavender';
    }
    // Smart Rule B: Removing collar also clears floating tag
    if (slot === 'collar' && itemId === 'none') {
      cur.tag = 'none';
    }
    // Smart Rule C: Astronaut helmet clears eye accessories so visor stays crisp
    if (slot === 'headwear' && itemId === 'head_astronaut_helmet') {
      cur.eyeAcc = 'none';
    }
    // Smart Rule D: Equipping glasses/eyepatch while wearing astronaut helmet removes helmet cleanly
    if (slot === 'eyeAcc' && itemId !== 'none' && cur.headwear === 'head_astronaut_helmet') {
      cur.headwear = 'none';
    }

    all[id] = sanitizeCatConfig(id, cur, p);
    saveAllConfigs(all);
    return { ok: true, config: { ...all[id] } };
  }

  function applyCostumeSet(catId, setId, progress) {
    const id = catId === 'boncuk' ? 'boncuk' : 'muezza';
    const p = progress || loadProgress();
    const set = COSTUME_SETS.find(s => s.id === setId);
    if (!set || !isItemUnlocked(set.id, p)) {
      return { ok: false, reason: 'locked', config: getCatConfig(id) };
    }
    const all = loadAllConfigs();
    const next = { ...all[id], ...set.pieces };
    all[id] = sanitizeCatConfig(id, next, p);
    saveAllConfigs(all);
    return { ok: true, config: { ...all[id] } };
  }

  function applyDuoSet(duoId, progress) {
    const p = progress || loadProgress();
    const duo = DUO_SETS.find(d => d.id === duoId);
    if (!duo || !isItemUnlocked(duo.id, p)) {
      return { ok: false, reason: 'locked', configs: loadAllConfigs() };
    }
    const all = loadAllConfigs();
    all.boncuk = sanitizeCatConfig('boncuk', { ...all.boncuk, ...duo.boncuk }, p);
    all.muezza = sanitizeCatConfig('muezza', { ...all.muezza, ...duo.muezza }, p);
    saveAllConfigs(all);
    return { ok: true, configs: { boncuk: { ...all.boncuk }, muezza: { ...all.muezza } } };
  }

  function resetCatConfig(catId) {
    const id = catId === 'boncuk' ? 'boncuk' : 'muezza';
    const all = loadAllConfigs();
    all[id] = getDefaultCatConfig(id);
    saveAllConfigs(all);
    return { ...all[id] };
  }

  function randomizeCat(catId, progress) {
    const id = catId === 'boncuk' ? 'boncuk' : 'muezza';
    const p = progress || loadProgress();
    const pickUnlocked = (list) => {
      const avail = list.filter(i => isItemUnlocked(i.id, p));
      return avail[Math.floor(Math.random() * avail.length)].id;
    };
    const collar = pickUnlocked(COLLARS);
    const cfg = {
      collar,
      tag: collar !== 'none' ? pickUnlocked(TAGS) : 'none',
      neckwear: Math.random() < 0.7 ? pickUnlocked(NECKWEAR) : 'none',
      headwear: Math.random() < 0.75 ? pickUnlocked(HEADWEAR) : 'none',
      outfit: Math.random() < 0.75 ? pickUnlocked(OUTFITS) : 'none',
      eyeAcc: Math.random() < 0.3 ? pickUnlocked(EYE_ACCESSORIES) : 'none'
    };
    const all = loadAllConfigs();
    all[id] = sanitizeCatConfig(id, cfg, p);
    saveAllConfigs(all);
    return { ...all[id] };
  }

  function getUnlockStats(progress) {
    const p = progress || loadProgress();
    const rewardItems = ALL_CAT_ITEMS.filter(i => i.unlockLevel > 0);
    const unlockedCount = rewardItems.filter(i => isItemUnlocked(i.id, p)).length;
    const nextLocked = rewardItems
      .filter(i => !isItemUnlocked(i.id, p))
      .sort((a, b) => a.unlockLevel - b.unlockLevel)[0] || null;
    return {
      unlockedRewards: unlockedCount,
      totalRewards: rewardItems.length,
      highestLevel: p.highestLevelCompleted,
      nextMilestoneLevel: nextLocked ? nextLocked.unlockLevel : null,
      nextRewardItem: nextLocked
    };
  }

  window.CatWardrobeSystem = {
    CAT_CONFIG_KEY,
    CAT_PROGRESS_KEY,
    COLLARS,
    TAGS,
    NECKWEAR,
    HEADWEAR,
    EYE_ACCESSORIES,
    OUTFITS,
    COSTUME_SETS,
    DUO_SETS,
    ALL_CAT_ITEMS,
    getDefaultCatConfig,
    loadProgress,
    saveProgress,
    loadAllConfigs,
    saveAllConfigs,
    getCatConfig,
    sanitizeCatConfig,
    isItemUnlocked,
    checkAndUnlockForLevel,
    getForCatLabel,
    equipItem,
    applyCostumeSet,
    applyDuoSet,
    resetCatConfig,
    randomizeCat,
    getUnlockStats
  };
})();
