/* =====================================================================
   THE LEGEND OF VJ — levels/level5.js
   Level 5: Himalayan Crown
   ===================================================================== */

window.LEVEL_DATA = window.LEVEL_DATA || {};

window.LEVEL_DATA[5] = {
  name: 'Himalayan Crown',
  bgColor: '#111122',
  bgKey: 'snow-bg',
  levelWidth: 8900,
  timeLimit: 180,
  spawnX: 120,
  spawnY: null,

  groundRuns: [[0, 1500], [1800, 1000], [3200, 1600], [5200, 3650]],

  arrowPowerup: { x: 654, y: 310 },
  floorBlocks: [
    { f1: 600, f2: 708, y: 310 },
    { f1: 1000, q: 1054, f2: 1108, gemType: 0, y: 260 },
    { f1: 2100, q: 2154, f2: 2208, gemType: 1, y: 280 },
    { f1: 3600, q: 3654, f2: 3708, gemType: 2, y: 270 },
    { f1: 5500, q: 5554, f2: 5608, gemType: 3, y: 270 },
    { f1: 6200, q: 6254, f2: 6308, gemType: 4, y: 280 }
  ],

  movingPlatforms: [[1600, 360], [3000, 360], [4900, 360], [6500, 360]],

  checkpoints: [500, 2000, 3400, 5300, 6800],

  // Snow-specific obstacles: [x, h, texKey]
  obstacles: [
    [900, 110, 'snowman'], [2400, 150, 'tree-snow'],
    [3800, 110, 'snowman'], [5700, 150, 'tree-snow']
  ],

  // Stars x positions (26 collectible stars evenly distributed in open air)
  stars: [250, 500, 750, 840, 1020, 1250, 1500, 1800, 2100, 2340, 2500, 2700, 3000, 3300, 3600, 3720, 3920, 4200, 4500, 4800, 5100, 5400, 5620, 6000, 6600, 7150],

  heartX: 4000,

  enemies: [
    [700, 90, 'm'], [1220, 140, 'bear'], [2150, 90, 'm'], [2500, 160, 'bear'],
    [3500, 140, 'bear'], [4250, 150, 'bear'], [4600, 110, 'bear'], [5300, 70, 'm'],
    [5550, 140, 'bear'], [6000, 150, 'bear'], [6450, 150, 'bear'], [6850, 130, 'bear']
  ],

  stairX: 7350,
  enemySpeed: 140
};
