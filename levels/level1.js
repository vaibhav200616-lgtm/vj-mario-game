/* =====================================================================
   THE LEGEND OF VJ — levels/level1.js
   Level 1: The Western Ghats
   ===================================================================== */

window.LEVEL_DATA = window.LEVEL_DATA || {};

window.LEVEL_DATA[1] = {
  name: 'The Western Ghats',
  bgColor: '#5c94fc',
  bgKey: 'bg-sky',
  levelWidth: 4700,
  timeLimit: 120,
  spawnX: 120,
  spawnY: null, // uses SURFACE_Y

  // Ground runs: [startX, lengthPx]
  groundRuns: [[0, 972], [1080, 756], [1950, 756], [2800, 1900]],

  // Floating floors + Q-blocks
  // Level 1 has no arrow_powerup Q-block at top; gems only via Q-blocks
  floorBlocks: [
    // [f1, q, f2, gemType, y]
    { f1: 480, q: 534, f2: 588, gemType: 0, y: 330 },
    { f1: 820, q: 874, f2: 928, gemType: 1, y: 330 },
    { f1: 1250, q: 1304, f2: 1358, gemType: 2, y: 330 },
    { f1: 2100, q: 2154, f2: 2208, gemType: 3, y: 330 },
    { f1: 2450, q: 2504, f2: 2558, gemType: 4, y: 330 }
  ],

  // Moving platforms: [x, y]
  movingPlatforms: [],

  // Checkpoints x positions
  checkpoints: [500, 1150, 2050, 2900],

  // Obstacles (tree trunks etc): [x, height, texKey?]
  obstacles: [[660, 115], [1600, 145]],

  // Stars x positions (25 collectible stars evenly distributed in open air)
  stars: [220, 320, 440, 560, 720, 800, 960, 1050, 1180, 1380, 1460, 1550, 1680, 1800, 1920, 2050, 2180, 2300, 2420, 2580, 2680, 2800, 2880, 2940, 2990],

  // Heart pickup x (y auto-computed)
  heartX: 1800,

  // Enemy spawn list: [x, range, kind]
  enemies: [
    [400, 80, 'm'], [600, 90, 'm'], [1160, 100, 'm'], [1480, 100, 'm'],
    [1980, 100, 'm'], [2260, 100, 'm'], [2620, 100, 'm'], [2900, 100, 'm']
  ],

  // Stair base X
  stairX: 3020,

  // Enemy speed base
  enemySpeed: 50
};
