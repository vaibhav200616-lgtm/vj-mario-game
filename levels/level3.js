/* =====================================================================
   THE LEGEND OF VJ — levels/level3.js
   Level 3: THAR EXPEDITION (Desert)
   ===================================================================== */

window.LEVEL_DATA = window.LEVEL_DATA || {};

window.LEVEL_DATA[3] = {
  name: 'THAR EXPEDITION',
  bgColor: '#88ccff',
  bgKey: 'desert-bg',
  levelWidth: 7100,
  timeLimit: 140,
  spawnX: 120,
  spawnY: null,

  groundRuns: [[0, 1100], [1350, 950], [2500, 950], [3650, 950], [4800, 2300]],

  arrowPowerup: { x: 604, y: 310 },
  floorBlocks: [
    { f1: 550, f2: 658, y: 310 },
    { f1: 900,  q: 954,  f2: 1008, gemType: 0, y: 260 },
    { f1: 1700, q: 1754, f2: 1808, gemType: 1, y: 280 },
    { f1: 2800, q: 2854, f2: 2908, gemType: 2, y: 250 },
    { f1: 3900, q: 3954, f2: 4008, gemType: 3, y: 270 },
    { f1: 5000, q: 5054, f2: 5108, gemType: 4, y: 260 }
  ],

  movingPlatforms: [[1220, 360], [2380, 360], [3520, 360], [4680, 360]],

  checkpoints: [500, 1400, 2550, 3700, 4850],

  obstacles: [[800, 135], [1950, 135], [3100, 135], [4250, 135]],

  // Stars x positions (25 collectible stars evenly distributed in open air)
  stars: [240, 420, 600, 750, 1050, 1200, 1400, 1600, 1820, 2020, 2250, 2500, 2750, 3020, 3250, 3500, 3750, 4040, 4200, 4500, 4750, 4950, 5150, 5300, 5400],

  heartX: 3200,

  enemies: [
    [380, 100, 'camel'], [680, 100, 'm'], [1500, 110, 'camel'], [1800, 100, 'm'],
    [2650, 110, 'camel'], [2950, 100, 'm'], [3800, 110, 'camel'], [4100, 100, 'm'],
    [4950, 110, 'camel'], [5250, 100, 'm']
  ],

  stairX: 5450,
  enemySpeed: 95
};
