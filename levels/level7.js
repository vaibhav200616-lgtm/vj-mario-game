/* =====================================================================
   THE LEGEND OF VJ — levels/level7.js
   Level 7: MEGHALAYA HEAVENS (Sky/Air)
   ===================================================================== */

window.LEVEL_DATA = window.LEVEL_DATA || {};

window.LEVEL_DATA[7] = {
  name: 'MEGHALAYA HEAVENS',
  bgColor: '#2a1a3a',
  bgKey: 'air-bg',
  levelWidth: 9600,
  timeLimit: 170,
  spawnX: 150,
  spawnY: 300,

  groundRuns: [[8650, 1050]],

  arrowPowerup: { x: 550, y: 310 },

  // White clouds: [x, y]
  whiteClouds: [
    [750, 370], [1300, 320], [1750, 270], [2250, 330], [2650, 280], [3050, 340],
    [3550, 380], [3950, 300], [4450, 270], [4850, 330], [5250, 370], [5650, 290],
    [6350, 320], [6750, 260], [7450, 330], [7950, 310], [8350, 280]
  ],

  // Grey clouds (some have checkpoints): [x, y, isCP]
  greyClouds: [
    [150, 370, !1],
    [2000, 360, !0],
    [3300, 370, !1],
    [4200, 350, !0],
    [5950, 360, !0],
    [7100, 340, !1],
    [8150, 350, !0]
  ],

  // Thunder clouds: [x, y]
  thunderClouds: [
    [1500, 180], [2450, 420], [3700, 190], [4650, 420],
    [5450, 200], [6550, 430], [7650, 200], [8250, 190]
  ],

  // Eagles: [x, y, range, speed]
  eagles: [
    [650, 190, 180, 220], [1500, 210, 200, 220], [2400, 180, 220, 230],
    [3250, 220, 240, 220], [4100, 180, 210, 230], [5050, 220, 230, 240],
    [5850, 180, 200, 220], [6800, 220, 240, 250], [7550, 180, 220, 230],
    [8000, 210, 210, 220], [8450, 190, 200, 240]
  ],

  // Open-air gems: [x, y, gemType]
  openAirGems: [
    [950, 240, 0], [2800, 180, 1], [4150, 150, 2],
    [5900, 160, 3], [8500, 140, 4]
  ],

  // Ground-sky transition: player x range for bg fade
  groundTransition: { startX: 5900, endX: 8650 },

  // Stars x positions (26 collectible stars evenly distributed)
  stars: [350, 650, 950, 1300, 1650, 2000, 2350, 2700, 3050, 3400, 3750, 4100, 4450, 4800, 5150, 5500, 5850, 6200, 6550, 6900, 7250, 7600, 7950, 8250, 8550, 8750],

  heartX: 5950,

  enemies: [], // Eagles only — handled separately

  stairX: 8850,
  enemySpeed: 95
};
