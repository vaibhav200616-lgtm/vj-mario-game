/* =====================================================================
   THE LEGEND OF VJ — levels/level4.js
   Level 4: KALINGA MIDNIGHT (Dark Desert)
   ===================================================================== */

window.LEVEL_DATA = window.LEVEL_DATA || {};

window.LEVEL_DATA[4] = {
  name: 'KALINGA MIDNIGHT',
  bgColor: '#0a1020',
  bgKey: 'desert-bg',
  levelWidth: 7500,
  timeLimit: 130,
  spawnX: 120,
  spawnY: null,

  groundRuns: [[0, 1000], [1250, 850], [2350, 1500], [4200, 850], [5600, 1900]],

  arrowPowerup: { x: 604, y: 310 },
  floorBlocks: [
    { f1: 550, f2: 658, y: 310 },
    { f1: 850,  q: 904,  f2: 958,  gemType: 0, y: 260 },
    { f1: 1500, q: 1554, f2: 1608, gemType: 1, y: 280 },
    { f1: 4050, q: 4104, f2: 4158, gemType: 2, y: 270 },
    { f1: 4450, q: 4504, f2: 4558, gemType: 3, y: 270 },
    { f1: 4850, q: 4904, f2: 4958, gemType: 4, y: 280 }
  ],

  movingPlatforms: [[1120, 360], [2220, 360], [4320, 360], [5480, 360]],

  // Roof tunnel: solid floor + ceiling from x=2400 to x=3700
  roofTunnel: { startX: 2400, endX: 3700 },

  checkpoints: [800, 1350, 2380, 4250, 5650],

  obstacles: [[750, 135], [1950, 135], [4300, 135], [5100, 135]],

  stars: [250, 400, 850, 1450, 1950, 4050, 4600, 5300],

  heartX: 2000,

  enemies: [
    [350, 100, 'camel'], [650, 100, 'm'], [1450, 110, 'camel'], [1750, 100, 'm'],
    [4450, 100, 'm'], [4750, 110, 'camel'], [4980, 60, 'm'], [5800, 100, 'camel']
  ],

  stairX: 5850,
  enemySpeed: 120
};
