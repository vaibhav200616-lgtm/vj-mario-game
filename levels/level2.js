/* =====================================================================
   THE LEGEND OF VJ — levels/level2.js
   Level 2: SUNDERBANS NIGHT
   ===================================================================== */

window.LEVEL_DATA = window.LEVEL_DATA || {};

window.LEVEL_DATA[2] = {
  name: 'SUNDERBANS NIGHT',
  bgColor: '#071118',
  bgKey: 'level2-bg',
  levelWidth: 5800,
  timeLimit: 140,
  spawnX: 120,
  spawnY: null, // uses SURFACE_Y

  groundRuns: [[0, 864], [980, 648], [1750, 648], [2520, 648], [3280, 540], [3900, 1900]],

  // Level 2 has arrow_powerup Q-block + gem Q-blocks
  arrowPowerup: { x: 514, y: 330 }, // arrow powerup Q-block
  floorBlocks: [
    { f1: 460, f2: 568, y: 330 }, // flanking the arrow_powerup
    { f1: 820,  q: 874,  f2: 928,  gemType: 0, y: 330 },
    { f1: 1200, q: 1254, f2: 1308, gemType: 1, y: 330 },
    { f1: 1900, q: 1954, f2: 2008, gemType: 2, y: 330 },
    { f1: 2650, q: 2704, f2: 2758, gemType: 3, y: 330 },
    { f1: 3400, q: 3454, f2: 3508, gemType: 4, y: 330 }
  ],

  movingPlatforms: [[700, 360], [1550, 360], [3100, 360]],

  checkpoints: [500, 1050, 1800, 2600, 3350],

  obstacles: [[660, 115], [1600, 145], [2950, 130]],

  // Stars x positions (25 collectible stars evenly distributed in open air)
  stars: [220, 360, 500, 620, 740, 960, 1060, 1200, 1340, 1500, 1680, 1800, 1920, 2100, 2250, 2400, 2550, 2720, 2850, 3050, 3250, 3450, 3650, 3850, 3980],

  heartX: 2400,

  enemies: [
    [400, 80, 'm'], [600, 90, 'turtle'], [1160, 100, 'm'], [1480, 90, 'turtle'],
    [1980, 100, 'm'], [2260, 90, 'turtle'], [2620, 100, 'm'], [2900, 90, 'turtle'],
    [3350, 100, 'm'], [3600, 100, 'turtle'], [3800, 90, 'm']
  ],

  stairX: 4050,
  enemySpeed: 85
};
