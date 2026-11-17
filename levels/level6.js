/* =====================================================================
   THE LEGEND OF VJ — levels/level6.js
   Level 6: Jal Mahal
   ===================================================================== */

window.LEVEL_DATA = window.LEVEL_DATA || {};

window.LEVEL_DATA[6] = {
  name: 'Jal Mahal',
  bgColor: '#10162a',
  bgKey: 'water-bg',
  levelWidth: 9200,
  timeLimit: 160,
  spawnX: 120,
  spawnY: null,

  groundRuns: [[0, 1150], [8450, 950]],

  arrowPowerup: { x: 550, y: null }, // y = SURFACE_Y - 45

  // Lilypads: regular x positions
  lilypads: [1450, 1850, 3100, 3500, 3900, 5100, 6100, 7900],

  // Checkpoint lilypads
  checkpointLilypads: [2400, 4700, 6500],

  // Lotus jumpers: [x]
  lotuses: [2750, 5650, 7500],

  // Fish fountains: x
  fishFountains: [4350, 7200],

  // Crocodiles: x
  crocodiles: [2120, 5380, 6850],

  // Water enemies: x
  waterEnemies: [4100, 8200],

  // Open-air gems: [x, y, gemType]
  openAirGems: [
    [1050, 290, 0], [2750, 130, 1], [4350, 180, 2],
    [5650, 130, 3], [7500, 130, 4]
  ],

  checkpoints: [500, 8550], // only 2 real checkpoints on ground

  // Stars x positions (25 collectible stars evenly distributed)
  stars: [300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2750, 3100, 3450, 3800, 4200, 4600, 5000, 5400, 5800, 6200, 6600, 7000, 7400, 7750, 8050, 8250, 8400],

  heartX: 4700,

  enemies: [
    [280, 75, 'turtle', null, 1, 160],
    [460, 75, 'turtle', null, -1, 160],
    [640, 75, 'turtle', null, 1, 160],
    [820, 75, 'turtle', null, -1, 160],
    [1000, 75, 'turtle', null, 1, 160]
    // stairX + 4 * TILE enemy added in PlayScene.create
  ],

  stairX: 8450,
  enemySpeed: 85
};
