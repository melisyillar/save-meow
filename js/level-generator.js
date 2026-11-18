/**
 * BONCUK & MÜEZZA – save.meow
 * Master Level Designer & Environment Themes
 * Creates connected, beautiful, fairy-tale 2D platforming stages with
 * parallax scenery, lush platforms, clear start & destination points, and strategic obstacles.
 */

class LevelGenerator {
  static THEMES = [
    {
      id: 'garden',
      name: 'Sıcak Pastel Bahçe',
      skyTop: '#fef3c7',
      skyBottom: '#fed7aa',
      hillColor: '#bbf7d0',
      platTop: '#a16207',
      platBottom: '#713f12',
      grassColor: '#4ade80',
      grassBlade: '#22c55e',
      vineColor: '#16a34a',
      accent: '#f472b6',
      treeType: 'cherry'
    },
    {
      id: 'forest',
      name: 'Büyülü Orman',
      skyTop: '#e0e7ff',
      skyBottom: '#c7d2fe',
      hillColor: '#a7f3d0',
      platTop: '#6b4f3d',
      platBottom: '#4a3325',
      grassColor: '#34d399',
      grassBlade: '#059669',
      vineColor: '#047857',
      accent: '#fbbf24',
      treeType: 'oak'
    },
    {
      id: 'candy',
      name: 'Şeker Dünyası & Fırın',
      skyTop: '#fce7f3',
      skyBottom: '#fbcfe8',
      hillColor: '#fed7aa',
      platTop: '#b45309',
      platBottom: '#78350f',
      grassColor: '#f472b6',
      grassBlade: '#db2777',
      vineColor: '#be185d',
      accent: '#38bdf8',
      treeType: 'candy'
    },
    {
      id: 'cloud',
      name: 'Bulut Krallığı',
      skyTop: '#e0f2fe',
      skyBottom: '#bae6fd',
      hillColor: '#fbcfe8',
      platTop: '#0284c7',
      platBottom: '#0369a1',
      grassColor: '#ffffff',
      grassBlade: '#7dd3fc',
      vineColor: '#38bdf8',
      accent: '#fde047',
      treeType: 'cloud'
    },
    {
      id: 'castle',
      name: 'Büyülü Şato & Kristal Gece',
      skyTop: '#1e1b4b',
      skyBottom: '#312e81',
      hillColor: '#4338ca',
      platTop: '#334155',
      platBottom: '#1e293b',
      grassColor: '#a855f7',
      grassBlade: '#9333ea',
      vineColor: '#7e22ce',
      accent: '#f43f5e',
      treeType: 'crystal'
    }
  ];

  static generate(levelNum = 1, playerCat = 'muezza') {
    const themeIdx = Math.min(
      LevelGenerator.THEMES.length - 1,
      Math.floor((levelNum - 1) / 4)
    );
    const theme = LevelGenerator.THEMES[themeIdx];

    const stageWidth = 2000; // Side-scrolling adventure width
    const stageHeight = 540;

    // Platform definitions (connected, hand-curated layouts)
    // Every platform has { x, y, width, height, isSolid }
    const platforms = [];

    // 1. Starting Terrace (Safe, welcoming beginning)
    platforms.push({ x: 30, y: 440, width: 260, height: 100, isSolid: true });

    // 2. The Meadow Stepping Stones
    platforms.push({ x: 350, y: 400, width: 140, height: 140, isSolid: true });
    platforms.push({ x: 550, y: 350, width: 150, height: 190, isSolid: true });

    // 3. The Scenic Bridge Terrace
    platforms.push({ x: 760, y: 410, width: 240, height: 130, isSolid: true });

    // 4. Midpoint High Ledge (with moving platform support)
    platforms.push({ x: 1070, y: 330, width: 160, height: 210, isSolid: true });

    // 5. The Sky Walk Terraces
    platforms.push({ x: 1310, y: 380, width: 170, height: 160, isSolid: true });
    platforms.push({ x: 1540, y: 320, width: 150, height: 220, isSolid: true });

    // 6. The Destination Summit (Where partner cat waits in the gazebo!)
    const exitPlatformX = 1750;
    const exitPlatformY = 360;
    platforms.push({ x: exitPlatformX, y: exitPlatformY, width: 220, height: 180, isSolid: true });

    // Background Scenic Scenery (trees, hills, clouds)
    const scenery = {
      clouds: [
        { x: 100, y: 60, scale: 1.2 },
        { x: 480, y: 90, scale: 0.9 },
        { x: 920, y: 50, scale: 1.4 },
        { x: 1350, y: 80, scale: 1.1 },
        { x: 1780, y: 65, scale: 1.3 }
      ],
      trees: [
        { x: 70, y: 440 },
        { x: 420, y: 400 },
        { x: 800, y: 410 },
        { x: 1180, y: 330 },
        { x: 1620, y: 320 }
      ],
      startSign: { x: 90, y: 440 }
    };

    // Paw prints guide trail leading to the exit
    const pawPrints = [];
    const pwPts = [
      { x: 150, y: 432 },
      { x: 310, y: 410 },
      { x: 420, y: 392 },
      { x: 510, y: 370 },
      { x: 620, y: 342 },
      { x: 730, y: 370 },
      { x: 880, y: 402 },
      { x: 1030, y: 360 },
      { x: 1150, y: 322 },
      { x: 1270, y: 350 },
      { x: 1400, y: 372 },
      { x: 1500, y: 340 },
      { x: 1620, y: 312 },
      { x: 1720, y: 330 },
      { x: 1840, y: 352 }
    ];
    for (const p of pwPts) {
      pawPrints.push(p);
    }

    // Moving Platforms
    const movingPlatforms = [];
    if (levelNum >= 3) {
      // Floating moving platform between platforms 3 & 4
      movingPlatforms.push(
        new MovingPlatform(1010, 370, 75, 18, 50, 0, 1.2 + levelNum * 0.05, theme.id === 'cloud' ? 'cloud' : 'wood')
      );
    }
    if (levelNum >= 6) {
      // Vertical moving platform between 4 & 5
      movingPlatforms.push(
        new MovingPlatform(1240, 350, 70, 18, 0, 45, 1.4, theme.id === 'cloud' ? 'cloud' : 'wood')
      );
    }

    // Interactive Hazards
    const hazards = [];

    // Water area with floating pond at x = 705..760
    if (levelNum >= 2) {
      hazards.push(new Hazard('water', 700, 470, 60, 70));
    }

    // Spikes (Level 2+) placed on terrace 3
    if (levelNum >= 2) {
      hazards.push(new Hazard('spikes', 880, 410 - 16, 42, 16));
    }
    if (levelNum >= 5) {
      hazards.push(new Hazard('spikes', 1390, 380 - 16, 38, 16));
    }

    // Rolling Yarn Ball (Level 4+) rolling across platform 3
    if (levelNum >= 4) {
      hazards.push(
        new Hazard('ball', 840, 410 - 14, 28, 28, {
          radius: 14,
          speed: 1.8 + levelNum * 0.05,
          minX: 770,
          maxX: 960
        })
      );
    }

    // Fire Trap (Level 7+)
    if (levelNum >= 7) {
      hazards.push(new Hazard('fire', 1130, 330 - 24, 32, 24, { cycleTime: 2.8, onTime: 1.2 }));
    }

    // Magic Laser Crystal (Level 10+)
    if (levelNum >= 10) {
      hazards.push(new Hazard('laser', 1470, 240, 14, 140, { cycleTime: 3.2, onTime: 1.3 }));
    }

    // Collectibles: Cat Food (placed along jumping arcs)
    const collectibles = [];
    const foodCoords = [
      { x: 230, y: 390, type: 'tuna' },
      { x: 320, y: 340, type: 'fish' },
      { x: 420, y: 350, type: 'tuna' },
      { x: 520, y: 300, type: 'fish' },
      { x: 620, y: 300, type: 'tuna' },
      { x: 740, y: 350, type: 'fish' },
      { x: 840, y: 360, type: 'tuna' },
      { x: 970, y: 330, type: 'fish' },
      { x: 1140, y: 280, type: 'tuna' },
      { x: 1280, y: 320, type: 'fish' },
      { x: 1400, y: 330, type: 'tuna' },
      { x: 1520, y: 270, type: 'fish' },
      { x: 1640, y: 270, type: 'tuna' }
    ];

    for (const fc of foodCoords) {
      collectibles.push(new Collectible(fc.x, fc.y, fc.type, false));
    }

    // Character Special Collectible (Toilet Paper for Boncuk, Socks for Müezza)
    const specialType = playerCat === 'boncuk' ? 'toilet_paper' : 'sock';
    const specialCoords = [
      { x: 620, y: 250 },
      { x: 1140, y: 230 },
      { x: 1640, y: 220 }
    ];

    for (const sc of specialCoords) {
      collectibles.push(new Collectible(sc.x, sc.y, specialType, true));
    }

    // Starting player position (Safely standing on platform 1)
    const playerSpawn = { x: 70, y: 394 };

    // Partner Cat Destination (Standing inside the Destination Gazebo on platform 6)
    const partnerSpawn = { x: exitPlatformX + 60, y: exitPlatformY };

    return {
      levelNum: levelNum,
      theme: theme,
      width: stageWidth,
      height: stageHeight,
      platforms: platforms,
      solidTiles: platforms, // used for collision
      movingPlatforms: movingPlatforms,
      hazards: hazards,
      collectibles: collectibles,
      pawPrints: pawPrints,
      scenery: scenery,
      playerSpawn: playerSpawn,
      partnerSpawn: partnerSpawn,

      getSolidTilesInBox(x, y, w, h) {
        const result = [];
        const box = { x: x, y: y, width: w, height: h };
        for (const p of platforms) {
          if (Physics.aabb(box, p)) {
            result.push(p);
          }
        }
        return result;
      }
    };
  }
}

window.LevelGenerator = LevelGenerator;
