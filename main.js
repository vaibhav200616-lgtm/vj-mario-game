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

new Phaser.Game({
  type: Phaser.AUTO, width: 960, height: 540, parent: 'game-container', backgroundColor: '#5c94fc', pixelArt: !1,
  physics: { default: 'arcade', arcade: { gravity: { y: 1000 }, debug: !1 } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [PreBootScene, BootScene, IntroVideoScene, StoryVideoScene, TitleScene, LevelSelectScene, PlayScene]
});
