/* =====================================================================
   THE LEGEND OF VJ — main.js
   Global setup + Phaser Game initialization
   ===================================================================== */

window.touchInput = { left: !1, right: !1, jump: !1, shoot: !1 };
window.gameSettings = { playerSpeed: 240, bgmEnabled: !0, sfxEnabled: !0, bgmVolume: 0.7 };

document.addEventListener('pointerdown', () => {
  if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}, { once: !0 });

window.phaserGame = new Phaser.Game({
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  parent: 'game-container',
  backgroundColor: '#000000',
  pixelArt: false,
  roundPixels: true,
  render: {
    powerPreference: 'high-performance',
    batchSize: 4096,
    desynchronized: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false,
      fps: 60,
      fixedStep: true,
      tileBias: 32
    }
  },
  fps: {
    target: 60,
    min: 30,
    forceSetTimeOut: false
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, TapToStartScene, StoryVideoScene, TitleScene, LevelSelectScene, PlayScene]
});
