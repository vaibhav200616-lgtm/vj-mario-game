/* =====================================================================
   THE LEGEND OF VJ — PlayScene.js
   Main gameplay scene — reads level config from window.LEVEL_DATA[n]
   ===================================================================== */

class PlayScene extends Phaser.Scene {
  constructor() { super('PlayScene'); }
  init(d) {
    this.currentLevel = d.currentLevel || 1; this.score = d.currentScore || 0; this.lives = d.currentLives !== undefined ? d.currentLives : 5;
    this.hasArrows = !1; this.starAmmo = 0; this.gemsCollected = 0; this.totalGems = 5; this.collectedTypes = new Set(); this.jumpCount = 0; this.isShooting = !1;
    this.isDuckToggled = !1; this.touchJumpBuffered = !1;
  }
  create() {
    this.input.addPointer(4);
    this.SURFACE_Y = 473;
    const L = this.currentLevel, isL2 = L === 2, isL3 = L === 3, isL4 = L === 4, isL5 = L === 5, isL6 = L === 6, isL7 = L === 7, isDesert = isL3 || isL4;
    document.body.style.backgroundColor = isL7 ? '#2a1a3a' : (isL6 ? '#10162a' : (isL5 ? '#111122' : (isL4 ? '#0a1020' : (isL2 ? '#071118' : (isDesert ? '#88ccff' : '#5c94fc')))));
    this.LEVEL_WIDTH = isL7 ? 9600 : (isL6 ? 9200 : (isL5 ? 8900 : (isL4 ? 7500 : (isL3 ? 7100 : (isL2 ? 5800 : 4700)))));
    const TILE = 54;
    this.gameOverFlag = this.isPaused = this.isSettingsOpen = this.isHurt = this.isAutoWalking = this.standingAtGate = this.walkingInsideCastle = this.invulnerable = !1;
    this.canProceedLevel = !1; this.timeLeft = isL7 ? 170 : (isL6 ? 160 : (isL5 ? 180 : (isL4 ? 130 : (isL3 ? 140 : (isL2 ? 140 : 120)))));
    this.lastCheckpointX = 120; this.lastCheckpointY = isL7 ? 290 : this.SURFACE_Y;
    this.physics.world.setBounds(0, -200, this.LEVEL_WIDTH, 900);
    this.cameras.main.setBounds(0, 0, this.LEVEL_WIDTH, 540);

    if (isL7) {
      this.skyBg = this.textures.exists('air-bg') ? this.add.tileSprite(0, 0, this.scale.width, 540, 'air-bg').setOrigin(0).setScrollFactor(0) : this.add.rectangle(0, 0, this.scale.width, 540, 0x2a1a3a).setOrigin(0).setScrollFactor(0);
      if (this.skyBg.tileScaleY && this.textures.exists('air-bg')) {
        const sc = 540 / this.textures.get('air-bg').getSourceImage().height;
        this.skyBg.tileScaleY = sc; this.skyBg.tileScaleX = sc;
      }
      this.groundTransitionBg = this.textures.exists('bg-sky') ? this.add.tileSprite(0, 0, this.scale.width, 540, 'bg-sky').setOrigin(0).setScrollFactor(0).setAlpha(0).setDepth(0) : null;
    } else if (isL6) {
      this.skyBg = this.textures.exists('water-bg') ? this.add.tileSprite(0, 0, this.scale.width, 540, 'water-bg').setOrigin(0).setScrollFactor(0) : this.add.rectangle(0, 0, this.scale.width, 540, 0x10162a).setOrigin(0).setScrollFactor(0);
      if (this.skyBg.tileScaleY && this.textures.exists('water-bg')) {
        const sc = 540 / this.textures.get('water-bg').getSourceImage().height;
        this.skyBg.tileScaleY = sc; this.skyBg.tileScaleX = sc;
      }
    } else if (isL5) {
      this.skyBg = this.textures.exists('snow-bg') ? this.add.tileSprite(0, 0, this.scale.width, 540, 'snow-bg').setOrigin(0).setScrollFactor(0) : this.add.rectangle(0, 0, this.scale.width, 540, 0x111122).setOrigin(0).setScrollFactor(0);
      if (this.skyBg.tileScaleY && this.textures.exists('snow-bg')) { const sc = 540 / this.textures.get('snow-bg').getSourceImage().height; this.skyBg.tileScaleY = sc; this.skyBg.tileScaleX = sc; }
      this.snowParticles = Array.from({ length: 150 }, () => {
        const p = this.add.circle(Phaser.Math.Between(0, 960), Phaser.Math.Between(-540, this.SURFACE_Y), Phaser.Math.FloatBetween(2.5, 4.5), 0xffffff, Phaser.Math.FloatBetween(0.4, 0.8)).setScrollFactor(0).setDepth(34);
        p.vx = Phaser.Math.Between(-30, -5); p.vy = Phaser.Math.Between(30, 80); return p;
      });
    } else if (isL2) {
      this.skyBg = this.textures.exists('level2-bg') ? this.add.tileSprite(0, 0, this.scale.width, 540, 'level2-bg').setOrigin(0).setScrollFactor(0) : this.add.rectangle(0, 0, this.scale.width, 540, 0x071118).setOrigin(0).setScrollFactor(0);
      if (this.skyBg.tileScaleY && this.textures.exists('level2-bg')) {
        const sc = 540 / this.textures.get('level2-bg').getSourceImage().height;
        this.skyBg.tileScaleY = sc; this.skyBg.tileScaleX = sc;
      }
    } else if (isDesert) {
      this.skyBg = this.textures.exists('desert-bg') ? this.add.tileSprite(0, 0, this.scale.width, 540, 'desert-bg').setOrigin(0).setScrollFactor(0) : this.add.rectangle(0, 0, this.scale.width, 540, 0x88ccff).setOrigin(0).setScrollFactor(0);
      if (this.skyBg.tileScaleY && this.textures.exists('desert-bg')) { const sc = 540 / this.textures.get('desert-bg').getSourceImage().height; this.skyBg.tileScaleY = sc; this.skyBg.tileScaleX = sc; }
    } else {
      this.skyBg = this.textures.exists('bg-sky') ? this.add.tileSprite(0, 0, this.scale.width, 540, 'bg-sky').setOrigin(0).setScrollFactor(0) : this.add.rectangle(0, 0, this.scale.width, 540, 0x5c94fc).setOrigin(0).setScrollFactor(0);
      if (this.skyBg.tileScaleY) { this.skyBg.tileScaleY = 540 / 434; this.skyBg.tileScaleX = 540 / 434; }
    }

    if (isL4) {
      this.skyBg.setTint(0x0a1020);
      this.add.circle(this.scale.width * 0.58, 115, 60, 0x0a1020, 1).setScrollFactor(0).setDepth(1);
      this.add.circle(this.scale.width * 0.58 - 15, 105, 35, 0xffeecc, 1).setScrollFactor(0).setDepth(2);
      this.add.circle(this.scale.width * 0.58, 95, 30, 0x0a1020, 1).setScrollFactor(0).setDepth(3);
      for (let s = 0; s < 70; s++) {
        const dot = this.add.circle(Phaser.Math.Between(0, this.scale.width), Phaser.Math.Between(0, 320), Phaser.Math.Between(1, 2), 0xffffff, 0.9).setScrollFactor(0).setDepth(1);
        this.tweens.add({ targets: dot, alpha: 0.1, duration: Phaser.Math.Between(500, 1500), yoyo: !0, repeat: -1 });
      }
    }

    if (!isDesert && !isL5 && !isL6 && !isL7 && !isL2 && this.textures.exists('ground-deco')) {
      this.decoBg = this.add.tileSprite(0, this.SURFACE_Y - 18, this.scale.width, 180, 'ground-deco').setOrigin(0, 1).setScrollFactor(0.35, 0).setScale(0.95);
    }

    ['groundGroup', 'floorGroup', 'qblockGroup', 'qSensors', 'checkpointGroup', 'flagGroup', 'castleRoofGroup'].forEach(g => this[g] = this.physics.add.staticGroup());
    ['powerupGroup', 'arrowGroup', 'starGroup', 'gemGroup', 'heartGroup'].forEach(g => this[g] = this.physics.add.group({ allowGravity: !1 }));
    ['turtleGroup', 'mushroomGroup'].forEach(g => this[g] = this.physics.add.group({ allowGravity: !0 }));
    this.movingFloorGroup = this.physics.add.group({ allowGravity: !1, immovable: !0 });
    this.treeObstacleGroup = this.physics.add.staticGroup();
    this.visualTreeGroup = this.add.group();

    this.lilypadGroup = this.physics.add.group({ allowGravity: !1, immovable: !0 });
    this.lotusJumperGroup = this.physics.add.staticGroup();
    this.crocodileGroup = this.physics.add.group({ allowGravity: !1, immovable: !0 });
    this.waterEnemyGroup = this.physics.add.group({ allowGravity: !1, immovable: !0 });
    this.waterBulletGroup = this.physics.add.group({ allowGravity: !1 });
    this.fishFountainPlatformGroup = this.physics.add.staticGroup();

    this.whiteCloudGroup = this.physics.add.group({ allowGravity: !1, immovable: !0 });
    this.greyCloudGroup = this.physics.add.group({ allowGravity: !1, immovable: !0 });
    this.thunderCloudGroup = this.physics.add.group({ allowGravity: !1, immovable: !0 });
    this.eagleGroup = this.physics.add.group({ allowGravity: !1, immovable: !0 });

    const addGRun = (startX, lengthPx) => {
      const slabW = (isDesert || isL5) ? 108 : 54, step = slabW - 2, count = Math.ceil(lengthPx / step), texKey = isL5 ? 'tile-ice-cuboid' : (isDesert ? 'tile-sand-cuboid' : 'tile-grass');
      for (let i = 0; i < count; i++) {
        const x = Math.round(startX + i * step) + slabW / 2, topSlab = this.groundGroup.create(x, this.SURFACE_Y + 27, texKey);
        topSlab.setDisplaySize(slabW + 1, 55);
        if (isL4) topSlab.setTint(0x1a2533);
        if (isDesert || isL5) { topSlab.body.setSize(108, 44); topSlab.body.setOffset(0, 10); }
        topSlab.refreshBody();
        const botSlab = this.groundGroup.create(x, this.SURFACE_Y + 81, texKey);
        botSlab.setDisplaySize(slabW + 1, 55);
        if (isL4) botSlab.setTint(0x0a101a);
        botSlab.refreshBody();
      }
    };

    (isL7 ? [[8650, 1050]] : (isL6 ? [[0, 1150], [8450, 950]] : (isL5 ? [[0, 1500], [1800, 1000], [3200, 1600], [5200, 3650]] : (isL4 ? [[0, 1000], [1250, 850], [2350, 1500], [4200, 850], [5600, 1900]] : (isL3 ? [[0, 1100], [1350, 950], [2500, 950], [3650, 950], [4800, 2300]] : (isL2 ? [[0, 864], [980, 648], [1750, 648], [2520, 648], [3280, 540], [3900, 1900]] : [[0, 972], [1080, 756], [1950, 756], [2800, 1900]])))))).forEach(([x, l]) => addGRun(x, l));

    const addQ = (x, y, cType = 'gem', gType = 0) => {
      const q = this.qblockGroup.create(x, y, 'tile-qblock');
      if (isL4) q.setTint(0x2a3544); else if (isL5) q.setTint(0x556688);
      q.refreshBody(); q.used = !1; q.contentType = cType; q.gemType = gType;
      const s = this.qSensors.create(x, y + 24, null); s.setSize(50, 24).setVisible(!1); s.refreshBody(); s.parentBlock = q;
    };
    const addF = (x, y) => {
      const b = this.floorGroup.create(x, y, isL5 ? 'tile-ice-cube' : (isDesert ? 'tile-sand-cube' : 'tile-grass')).setDisplaySize(55, 55);
      if (isL4) b.setTint(0x1a2533);
      if (isDesert || isL5) { b.body.setSize(54, 44); b.body.setOffset(0, 10); }
      b.refreshBody();
    };

    if (isL7) {
      const arrowP = this.powerupGroup.create(550, 310, 'item-powerup-arrow').setScale(0.95);
      this.tweens.add({ targets: arrowP, y: 295, duration: 600, yoyo: !0, repeat: -1, ease: 'Sine.easeInOut' });

      const addWCloud = (x, y) => {
        const wc = this.whiteCloudGroup.create(x, y, 'tile-cloud-white').setOrigin(0.5, 0.5).setDisplaySize(340, 90);
        wc.body.setSize(210, 20).setOffset(65, 26);
        wc.standingTime = 0; wc.isFading = !1; wc.baseY = y;
      };
      [
        [750, 370], [1300, 320], [1750, 270], [2250, 330], [2650, 280], [3050, 340],
        [3550, 380], [3950, 300], [4450, 270], [4850, 330], [5250, 370], [5650, 290],
        [6350, 320], [6750, 260], [7450, 330], [7950, 310], [8350, 280]
      ].forEach(([wx, wy]) => addWCloud(wx, wy));

      const addGCloud = (x, y, isCP = !1) => {
        const gc = this.greyCloudGroup.create(x, y, 'tile-cloud-grey').setOrigin(0.5, 0.5).setDisplaySize(350, 95);
        gc.body.setSize(220, 22).setOffset(65, 26);
        gc.baseY = y;
        if (isCP) {
          const cp = this.checkpointGroup.create(x, y - 35, 'checkpoint-inactive').setOrigin(0.5, 1).setDepth(20);
          cp.setSize(44, 88).refreshBody(); cp.activated = !1;
        }
      };
      addGCloud(150, 370, !1);
      addGCloud(2000, 360, !0);
      addGCloud(3300, 370, !1);
      addGCloud(4200, 350, !0);
      addGCloud(5950, 360, !0);
      addGCloud(7100, 340, !1);
      addGCloud(8150, 350, !0);

      const addThunder = (x, y) => {
        const th = this.thunderCloudGroup.create(x, y, 'thunder-spritesheet', 0).setOrigin(0.5, 0.5).setDisplaySize(240, 110);
        th.body.setSize(180, 65).setOffset(30, 20);
        th.play('thunder-flash'); th.setDepth(21); th.baseY = y;
      };
      [
        [1500, 180], [2450, 420], [3700, 190], [4650, 420],
        [5450, 200], [6550, 430], [7650, 200], [8250, 190]
      ].forEach(([tx, ty]) => addThunder(tx, ty));

      const addEagle = (x, y, range, spd) => {
        const eg = this.eagleGroup.create(x, y, 'eagle-spritesheet', 0).setOrigin(0.5, 0.5).setDisplaySize(95, 70);
        eg.body.setSize(60, 45).setOffset(18, 15);
        eg.homeX = x; eg.range = range; eg.speed = spd || 230; eg.dir = 1;
        eg.setVelocityX(eg.speed); eg.setFlipX(!1); eg.play('eagle-fly'); eg.setDepth(22);
      };
      addEagle(650, 190, 180, 220);
      addEagle(1500, 210, 200, 220);
      addEagle(2400, 180, 220, 230);
      addEagle(3250, 220, 240, 220);
      addEagle(4100, 180, 210, 230);
      addEagle(5050, 220, 230, 240);
      addEagle(5850, 180, 200, 220);
      addEagle(6800, 220, 240, 250);
      addEagle(7550, 180, 220, 230);
      addEagle(8000, 210, 210, 220);
      addEagle(8450, 190, 200, 240);

      const spawnOpenAirGem = (x, y, gType) => {
        const col = [0x00ffff, 0xff0077, 0x00ff88, 0xffea00, 0xbf00ff][gType % 5];
        const glow = this.add.image(x, y, 'subtle-gem-glow').setDisplaySize(58, 58).setTint(col).setAlpha(0.55).setDepth(23);
        const dia = this.gemGroup.create(x, y, `diamond-${gType}`).setDepth(25).setDisplaySize(52, 52);
        dia.body.setSize(44, 44); dia.gemType = gType; dia.glowAura = glow;
        this.tweens.add({ targets: [dia, glow], y: y - 10, duration: 650, yoyo: !0, repeat: -1, ease: 'Sine.easeInOut' });
      };
      spawnOpenAirGem(950, 240, 0);
      spawnOpenAirGem(2800, 180, 1);
      spawnOpenAirGem(4150, 150, 2);
      spawnOpenAirGem(5900, 160, 3);
      spawnOpenAirGem(8500, 140, 4);

    } else if (isL6) {
      const arrowP = this.powerupGroup.create(550, this.SURFACE_Y - 45, 'item-powerup-arrow').setScale(0.95);
      this.tweens.add({ targets: arrowP, y: this.SURFACE_Y - 60, duration: 600, yoyo: !0, repeat: -1, ease: 'Sine.easeInOut' });

      const addLily = (x, isCheck = !1) => {
        const lp = this.lilypadGroup.create(x, this.SURFACE_Y - 5, 'tile-lilypad').setOrigin(0.5, 0.5).setDisplaySize(280, 85);
        lp.body.setSize(180, 18).setOffset(50, 24);
        lp.standingTime = 0; lp.isSinking = !1; lp.baseY = this.SURFACE_Y - 5; lp.isCheckpointPad = isCheck;
        if (isCheck) {
          const cp = this.checkpointGroup.create(x, this.SURFACE_Y - 30, 'checkpoint-inactive').setOrigin(0.5, 1).setDepth(20);
          cp.setSize(44, 88).refreshBody(); cp.activated = !1;
        }
        return lp;
      };

      [1450, 1850, 3100, 3500, 3900, 5100, 6100, 7900].forEach(lx => addLily(lx, !1));
      [2400, 4700, 6500].forEach(lx => addLily(lx, !0));

      const addLotus = (x, y) => {
        const lj = this.lotusJumperGroup.create(x, y, 'item-lotus').setOrigin(0.5, 1).setDisplaySize(140, 140);
        lj.setSize(100, 40).setOffset(20, 70).refreshBody();
        this.tweens.add({ targets: lj, scaleY: 0.92, duration: 800, yoyo: !0, repeat: -1, ease: 'Sine.easeInOut' });
      };
      addLotus(2750, this.SURFACE_Y);
      addLotus(5650, this.SURFACE_Y);
      addLotus(7500, this.SURFACE_Y);

      const addFishFountain = (x) => {
        this.add.image(x, 540, 'fish-fountain').setOrigin(0.5, 1).setDisplaySize(140, 280).setDepth(20);
        const topPlat = this.fishFountainPlatformGroup.create(x, 275, null).setSize(120, 20).setVisible(!1);
        topPlat.refreshBody();
        const basePlat = this.fishFountainPlatformGroup.create(x, 475, null).setSize(140, 24).setVisible(!1);
        basePlat.refreshBody();
      };
      [4350, 7200].forEach(fx => addFishFountain(fx));

      const addCroc = (x) => {
        const cr = this.crocodileGroup.create(x, this.SURFACE_Y + 12, 'croc-spritesheet', 0).setOrigin(0.5, 1).setScale(2.35);
        cr.setFlipX(!0);
        cr.body.setSize(90, 40).setOffset(20, 55);
        cr.isMouthOpen = !1; cr.hp = 8; cr.play('croc-closed'); cr.setDepth(20);
        this.time.addEvent({
          delay: 2300, loop: !0,
          callback: () => {
            if (!cr.active) return;
            cr.isMouthOpen = !cr.isMouthOpen;
            cr.play(cr.isMouthOpen ? 'croc-open' : 'croc-closed');
          }
        });
      };
      [2120, 5380, 6850].forEach(cx => addCroc(cx));

      const addWaterEnemy = (x) => {
        const we = this.waterEnemyGroup.create(x, 540, 'water-enemy-spritesheet', 0).setOrigin(0.5, 1).setScale(2.3);
        we.setFlipX(!0);
        we.body.setSize(85, 150).setOffset(35, 10);
        we.hp = 2; we.lastShotTime = 0; we.play('water-enemy-idle'); we.setDepth(22);
      };
      [4100, 8200].forEach(wex => addWaterEnemy(wex));

      const spawnOpenAirGem = (x, y, gType) => {
        const col = [0x00ffff, 0xff0077, 0x00ff88, 0xffea00, 0xbf00ff][gType % 5];
        const glow = this.add.image(x, y, 'subtle-gem-glow').setDisplaySize(58, 58).setTint(col).setAlpha(0.55).setDepth(23);
        const dia = this.gemGroup.create(x, y, `diamond-${gType}`).setDepth(25).setDisplaySize(52, 52);
        dia.body.setSize(44, 44); dia.gemType = gType; dia.glowAura = glow;
        this.tweens.add({ targets: [dia, glow], y: y - 10, duration: 650, yoyo: !0, repeat: -1, ease: 'Sine.easeInOut' });
      };
      spawnOpenAirGem(1050, 290, 0);
      spawnOpenAirGem(2750, 130, 1);
      spawnOpenAirGem(4350, 180, 2);
      spawnOpenAirGem(5650, 130, 3);
      spawnOpenAirGem(7500, 130, 4);

    } else if (isL5) {
      addF(600, 310); addQ(654, 310, 'arrow_powerup', 0); addF(708, 310);
      [[1000, 1054, 1108, 0, 260], [2100, 2154, 2208, 1, 280], [3600, 3654, 3708, 2, 270], [5500, 5554, 5608, 3, 270], [6200, 6254, 6308, 4, 280]].forEach(([f1, q, f2, t, y]) => { addF(f1, y); addQ(q, y, 'gem', t); addF(f2, y); });
      [[1600, 360], [3000, 360], [4900, 360], [6500, 360]].forEach(([x, y]) => {
        const mp = this.movingFloorGroup.create(x, y, 'tile-ice-cuboid').setDisplaySize(108, TILE); mp.body.setSize(108, 44); mp.body.setOffset(0, 10);
        this.tweens.add({ targets: mp, y: y - 130, duration: 1600, yoyo: !0, repeat: -1, ease: 'Sine.easeInOut' });
      });
    } else if (isL4) {
      addF(550, 310); addQ(604, 310, 'arrow_powerup', 0); addF(658, 310);
      [[850, 904, 958, 0, 260], [1500, 1554, 1608, 1, 280], [4050, 4104, 4158, 2, 270], [4450, 4504, 4558, 3, 270], [4850, 4904, 4958, 4, 280]].forEach(([f1, q, f2, t, y]) => { addF(f1, y); addQ(q, y, 'gem', t); addF(f2, y); });
      [[1120, 360], [2220, 360], [4320, 360], [5480, 360]].forEach(([x, y]) => {
        const mp = this.movingFloorGroup.create(x, y, 'tile-sand-cuboid').setDisplaySize(108, TILE); mp.body.setSize(108, 44); mp.body.setOffset(0, 10); mp.setTint(0x1a2533);
        this.tweens.add({ targets: mp, y: y - 130, duration: 1600, yoyo: !0, repeat: -1, ease: 'Sine.easeInOut' });
      });
      const roofY = this.SURFACE_Y - 80;
      for (let tx = 2400; tx <= 3700; tx += 54) { addF(tx, roofY); for (let ty = roofY - 54; ty > 0; ty -= 54) addF(tx, ty); }
    } else if (isL3) {
      addF(550, 310); addQ(604, 310, 'arrow_powerup', 0); addF(658, 310);
      [[900, 954, 1008, 0, 260], [1700, 1754, 1808, 1, 280], [2800, 2854, 2908, 2, 250], [3900, 3954, 4008, 3, 270], [5000, 5054, 5108, 4, 260]].forEach(([f1, q, f2, t, y]) => { addF(f1, y); addQ(q, y, 'gem', t); addF(f2, y); });
      [[1220, 360], [2380, 360], [3520, 360], [4680, 360]].forEach(([x, y]) => {
        const mp = this.movingFloorGroup.create(x, y, 'tile-sand-cuboid').setDisplaySize(108, TILE); mp.body.setSize(108, 44); mp.body.setOffset(0, 10);
        this.tweens.add({ targets: mp, y: y - 130, duration: 1800, yoyo: !0, repeat: -1, ease: 'Sine.easeInOut' });
      });
    } else if (isL2) {
      const T1 = 330; addF(460, T1); addQ(514, T1, 'arrow_powerup', 0); addF(568, T1);
      [[820, 874, 928, 0], [1200, 1254, 1308, 1], [1900, 1954, 2008, 2], [2650, 2704, 2758, 3], [3400, 3454, 3508, 4]].forEach(([f1, q, f2, t]) => { addF(f1, T1); addQ(q, T1, 'gem', t); addF(f2, T1); });
      [[700, 360], [1550, 360], [3100, 360]].forEach(([x, y]) => {
        const mp = this.movingFloorGroup.create(x, y, 'tile-grass').setDisplaySize(TILE * 2, TILE); mp.body.setSize(TILE * 2, TILE);
        this.tweens.add({ targets: mp, y: y - 130, duration: 1800, yoyo: !0, repeat: -1, ease: 'Sine.easeInOut' });
      });
    } else {
      const T1 = 330;
      [[480, 534, 588, 0], [820, 874, 928, 1], [1250, 1304, 1358, 2], [2100, 2154, 2208, 3], [2450, 2504, 2558, 4]].forEach(([f1, q, f2, t]) => { addF(f1, T1); addQ(q, T1, 'gem', t); addF(f2, T1); });
    }

    const cpLocs = isL7 ? [2000, 4200, 5950, 8150] : (isL6 ? [500, 2400, 4700, 6500, 8550] : (isL5 ? [500, 2000, 3400, 5300, 6800] : (isL4 ? [800, 1350, 2380, 4250, 5650] : (isL3 ? [500, 1400, 2550, 3700, 4850] : (isL2 ? [500, 1050, 1800, 2600, 3350] : [500, 1150, 2050, 2900])))));
    if (!isL7 && !isL6) {
      cpLocs.forEach(x => { const cp = this.checkpointGroup.create(x, this.SURFACE_Y - 10, 'checkpoint-inactive').setOrigin(0.5, 1).setDepth(20); cp.setSize(44, 88).refreshBody(); cp.activated = !1; });
    } else if (isL6) {
      [500, 8550].forEach(x => { const cp = this.checkpointGroup.create(x, this.SURFACE_Y - 10, 'checkpoint-inactive').setOrigin(0.5, 1).setDepth(20); cp.setSize(44, 88).refreshBody(); cp.activated = !1; });
    }

    if (!isL6 && !isL7) {
      const obstacleTex = isL5 ? 'snowman' : (isDesert ? 'tile-cactus-trunk' : 'tile-trunk');
      const obs = isL5 ? [[900, 110, 'snowman'], [2400, 150, 'tree-snow'], [3800, 110, 'snowman'], [5700, 150, 'tree-snow']] : (isL4 ? [[750, 135], [1950, 135], [4300, 135], [5100, 135]] : (isL3 ? [[800, 135], [1950, 135], [3100, 135], [4250, 135]] : (isL2 ? [[660, 115], [1600, 145], [2950, 130]] : [[660, 115], [1600, 145]])));
      obs.forEach(o => {
        const x = o[0], h = o[1] || 135, tex = o[2] || obstacleTex;
        if (tex === 'tree-snow') {
          const obj = this.add.image(x, this.SURFACE_Y, tex).setOrigin(0.5, 1).setDisplaySize(95, h).setDepth(35);
          if (isL4) obj.setTint(0x1a2533);
          this.visualTreeGroup.add(obj);
        } else {
          const obj = this.treeObstacleGroup.create(x, this.SURFACE_Y, tex).setOrigin(0.5, 1).setDisplaySize(85, h);
          if (isL4) obj.setTint(0x1a2533);
          obj.refreshBody();
        }
      });
    }

    const starList = isL7 ? [400, 900, 2000, 3300, 4500, 5950, 7100, 8150] : (isL6 ? [300, 700, 1450, 3100, 3500, 5100, 6100, 7900] : (isL5 ? [300, 500, 1100, 2000, 2500, 3500, 4000, 5400, 6000, 6900] : (isL4 ? [250, 400, 850, 1450, 1950, 4050, 4600, 5300] : (isL3 ? [280, 450, 920, 1500, 2050, 2700, 3300, 4100, 4800] : (isL2 ? [300, 420, 980, 1450, 1980, 2100, 2600, 3300, 3450, 3700] : [300, 420, 1100, 1450, 1750, 2100, 2600, 2900])))));
    starList.forEach((x, i) => {
      const s = this.starGroup.create(x, isL7 ? 220 - (i % 3) * 30 : 380 - (i % 3) * 30, 'tile-star').setScale(0.65);
      this.tweens.add({ targets: s, y: s.y - 10, duration: 550, yoyo: !0, repeat: -1 });
    });

    const heart = this.heartGroup.create(isL7 ? 5950 : (isL6 ? 4700 : (isL5 ? 4000 : (isL4 ? 2000 : (isL3 ? 3200 : (isL2 ? 2400 : 1800))))), isL7 ? 230 : this.SURFACE_Y - 140, 'item-heart');
    this.tweens.add({ targets: heart, y: heart.y - 15, duration: 800, yoyo: !0, repeat: -1 });

    const eSpd = isL7 ? 95 : (isL6 ? 85 : (isL5 ? 140 : (isL4 ? 120 : (isL3 ? 95 : (isL2 ? 85 : 50)))));
    const spawnE = (type, x, r, customY, customDir, customSpd) => {
      let e;
      const spawnY = customY !== undefined ? customY : this.SURFACE_Y;
      if (type === 'bear') {
        e = this.turtleGroup.create(x, spawnY, 'bear-spritesheet', 0).setOrigin(0.5, 1).setScale(1.425);
        e.body.setSize(120, 80).setOffset(20, 40); e.play('bear-walk'); e.enemyKind = 'bear'; e.hp = 10; e.isInvul = !1;
      } else if (type === 'camel') {
        e = this.turtleGroup.create(x, spawnY, 'camel-spritesheet', 0).setOrigin(0.5, 1).setScale(0.85);
        e.body.setSize(80, 85).setOffset(40, 35); e.play('camel-walk'); e.enemyKind = 'camel'; e.hp = 6; e.isInvul = !1;
      } else if (type === 'turtle') {
        e = this.turtleGroup.create(x, spawnY, 'turtle', 0).setOrigin(0.5, 1).setScale(0.48);
        e.body.setSize(54, 75).setOffset(28, 65); e.play('turtle-walk'); e.enemyKind = 'turtle';
      } else {
        e = this.mushroomGroup.create(x, spawnY, 'mushroom', 0).setOrigin(0.5, 1).setScale(0.52);
        e.body.setSize(60, 68).setOffset(25, 42); e.play('mushroom-walk'); e.enemyKind = 'mushroom';
      }
      e.setBounce(0); e.homeX = x; e.range = r;
      e.speed = customSpd || (eSpd * (type === 'bear' ? 1.5 : (type === 'camel' ? 2.0 : (type === 'turtle' ? 1 : 0.9))));
      const initialDir = customDir !== undefined ? customDir : -1;
      e.dir = initialDir;
      e.setVelocityX(initialDir * e.speed);
      e.setFlipX(initialDir === -1);
      e.isDead = !1; e.isShell = !1; e.setDepth(20);
      if (isL4) e.setTint(0x556677);
    };

    const stairX = isL7 ? 8850 : (isL6 ? 8450 : (isL5 ? 7350 : (isL4 ? 5850 : (isL3 ? 5450 : (isL2 ? 4050 : 3020)))));

    if (isL7) {
      // Eagles handle patrolling
    } else if (isL6) {
      spawnE('turtle', 280, 75, this.SURFACE_Y, 1, 160);
      spawnE('turtle', 460, 75, this.SURFACE_Y, -1, 160);
      spawnE('turtle', 640, 75, this.SURFACE_Y, 1, 160);
      spawnE('turtle', 820, 75, this.SURFACE_Y, -1, 160);
      spawnE('turtle', 1000, 75, this.SURFACE_Y, 1, 160);
      spawnE('turtle', stairX + 4 * TILE, 300, this.SURFACE_Y - 5 * TILE, -1, 110);
    } else {
      const enList = (isL5 ? [[700, 100, 'm'], [1200, 110, 'bear'], [2200, 100, 'm'], [2800, 110, 'bear'], [3400, 110, 'bear'], [4200, 350, 'bear'], [4400, 350, 'bear'], [5000, 100, 'm'], [6300, 350, 'bear'], [6450, 350, 'bear'], [7200, 110, 'bear']]
        : (isL4 ? [[350, 100, 'camel'], [650, 100, 'm'], [1450, 110, 'camel'], [1750, 100, 'm'], [4450, 100, 'm'], [4750, 110, 'camel'], [4980, 60, 'm'], [5800, 100, 'camel']]
        : (isL3 ? [[380, 100, 'camel'], [680, 100, 'm'], [1500, 110, 'camel'], [1800, 100, 'm'], [2650, 110, 'camel'], [2950, 100, 'm'], [3800, 110, 'camel'], [4100, 100, 'm'], [4950, 110, 'camel'], [5250, 100, 'm']]
        : (isL2 ? [[400, 80, 'm'], [600, 90, 'turtle'], [1160, 100, 'm'], [1480, 90, 'turtle'], [1980, 100, 'm'], [2260, 90, 'turtle'], [2620, 100, 'm'], [2900, 90, 'turtle'], [3350, 100, 'm'], [3600, 100, 'turtle'], [3800, 90, 'm']]
        : [[400, 80, 'm'], [600, 90, 'm'], [1160, 100, 'm'], [1480, 100, 'm'], [1980, 100, 'm'], [2260, 100, 'm'], [2620, 100, 'm'], [2900, 100, 'm']]))));
      enList.forEach(([x, r, k]) => spawnE(k, x, r));
    }

    for (let s = 0; s < 5; s++) for (let h = 1; h <= s + 1; h++) {
      let f = this.floorGroup.create(stairX + s * TILE, this.SURFACE_Y - (h - 1) * TILE - TILE / 2, (isL5 || isL7) ? 'tile-ice-cube' : (isDesert ? 'tile-sand-cube' : 'tile-grass')).setDisplaySize(55, 55);
      if (isL4) f.setTint(0x1a2533);
      if (isDesert || isL5 || isL7) { f.body.setSize(54, 44); f.body.setOffset(0, 10); }
      f.refreshBody();
    }

    const flagX = stairX + 5 * TILE + 70;
    this.flagSprite = this.add.image(flagX, this.SURFACE_Y, 'flagpole-bare').setOrigin(0.5, 1).setDepth(21);
    this.flagRedM = this.add.image(flagX + 30, this.SURFACE_Y - 225, 'flag-red-m').setOrigin(0.5).setDepth(20);
    this.flagPurpleVJ = this.add.image(flagX + 46, this.SURFACE_Y - 35, 'flag-purple-vj-hd').setOrigin(0.5).setAlpha(0).setDepth(20);
    if (isL5) {
      const fs = this.add.graphics({ x: flagX, y: this.SURFACE_Y - 258 });
      fs.fillStyle(0xffffff, 0.95); fs.fillCircle(0, -6, 12); fs.fillCircle(-8, 0, 8); fs.fillCircle(8, 0, 8); fs.setDepth(22);
    }
    this.flagZone = this.flagGroup.create(flagX, this.SURFACE_Y - 240, null);
    this.flagZone.setSize(40, 60).setVisible(!1).refreshBody();

    this.castleDoorX = flagX + 330;
    this.castleImg = this.add.image(this.castleDoorX, this.SURFACE_Y, 'castle-closed').setOrigin(0.5, 1).setDisplaySize(480, 365).setDepth(20);
    this.castleRoofGroup.create(this.castleDoorX, this.SURFACE_Y - 206, null).setSize(340, 20).setVisible(!1).refreshBody();

    const pSpawnX = isL7 ? 150 : 120;
    const pSpawnY = isL7 ? 300 : this.SURFACE_Y;
    this.player = this.physics.add.sprite(pSpawnX, pSpawnY, 'player', 0).setOrigin(0.5, 1).setDepth(30).setScale(0.80);
    this.player.setSize(36, 90).setOffset(52, 50).setMaxVelocity(380, 900).setDragX(950);
    this.player.play('idle'); this.player.facing = 1;
    this.cameras.main.startFollow(this.player, !0, 0.12, 0.12).setDeadzone(120, 100);

    [this.groundGroup, this.floorGroup, this.movingFloorGroup, this.castleRoofGroup, this.qblockGroup, this.treeObstacleGroup, this.lilypadGroup, this.fishFountainPlatformGroup, this.whiteCloudGroup, this.greyCloudGroup].forEach(g => this.physics.add.collider(this.player, g, (p, c) => this.onCloudLand(p, c)));
    [this.groundGroup, this.floorGroup, this.treeObstacleGroup].forEach(g => {
      this.physics.add.collider(this.turtleGroup, g);
      this.physics.add.collider(this.mushroomGroup, g);
      this.physics.add.collider(this.arrowGroup, g, s => s.destroy());
    });

    [['checkpointGroup', this.activateCheckpoint], ['gemGroup', this.collectGem], ['qSensors', this.triggerQSensor], ['powerupGroup', this.collectPowerup], ['starGroup', this.collectStar], ['heartGroup', this.collectHeart], ['turtleGroup', this.handleEnemyCollision], ['mushroomGroup', this.handleEnemyCollision], ['eagleGroup', this.handleEnemyCollision], ['flagZone', this.reachFlag]].forEach(([grp, fn]) => this.physics.add.overlap(this.player, this[grp], fn, null, this));
    [this.turtleGroup, this.mushroomGroup, this.eagleGroup].forEach(grp => this.physics.add.overlap(this.arrowGroup, grp, (s, e) => this.arrowHitEnemy(s, e), null, this));

    this.physics.add.overlap(this.player, this.lotusJumperGroup, this.handleLotusBounce, null, this);
    this.physics.add.overlap(this.player, this.crocodileGroup, this.handleCrocCollision, null, this);
    this.physics.add.overlap(this.player, this.waterBulletGroup, this.handleWaterBulletHit, null, this);
    this.physics.add.overlap(this.player, this.thunderCloudGroup, () => this.damagePlayer(), null, this);
    this.physics.add.overlap(this.arrowGroup, this.waterEnemyGroup, this.arrowHitWaterEnemy, null, this);
    this.physics.add.overlap(this.arrowGroup, this.waterBulletGroup, (a, b) => { a.destroy(); b.destroy(); });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,ENTER,P,R,X,SPACE,ESC,F10');
    this.heartsText = this.add.text(20, 16, '', { fontSize: '24px' }).setScrollFactor(0).setDepth(100);
    this.updateHearts();
    this.gemHUDIcons = Array.from({ length: 5 }, (_, i) => this.add.image((this.scale.width / 2 - 80) + i * 36, 26, `diamond-${i}`).setDisplaySize(24, 24).setAlpha(0.28).setScrollFactor(0).setDepth(100));
    this.scoreText = this.add.text(20, 48, `SCORE: ${String(this.score).padStart(4, '0')}`, { fontFamily: 'Arial Black', fontSize: '16px', color: '#fff', stroke: '#000', strokeThickness: 5 }).setScrollFactor(0).setDepth(100);
    this.ninjaText = this.add.text(20, 74, '', { fontFamily: 'Arial Black', fontSize: '14px', color: '#00ffff', stroke: '#000', strokeThickness: 4 }).setScrollFactor(0).setDepth(100);
    this.timeText = this.add.text(this.scale.width - 40, 16, String(this.timeLeft), { fontFamily: 'Arial Black', fontSize: '22px', color: '#fff', stroke: '#000', strokeThickness: 5 }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    const W = this.scale.width;
    this.add.rectangle(W / 2, 65, 304, 16, 0x000000, 0.4).setScrollFactor(0).setDepth(100);
    this.add.rectangle(W / 2, 65, 300, 12, 0x222222, 0.8).setScrollFactor(0).setDepth(100);
    this.pBarFill = this.add.rectangle(W / 2 - 150, 65, 0, 12, 0x00ffaa, 1).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    this.add.text(W / 2 - 165, 65, 'START', { fontFamily: 'Arial Black', fontSize: '10px', color: '#fff' }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(100);
    this.add.text(W / 2 + 165, 65, 'CASTLE', { fontFamily: 'Arial Black', fontSize: '10px', color: '#fff' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    const pbtn = this.add.text(this.scale.width - 20, 52, '⚙️', { fontFamily: 'Arial', fontSize: '24px' }).setOrigin(1, 0).setScrollFactor(0).setDepth(101).setInteractive({ useHandCursor: !0 });
    pbtn.on('pointerdown', () => this.togglePauseMenu());

    this.setupErgonomicTouchControls();

    this.timerEvent = this.time.addEvent({
      delay: 1000, loop: !0, callback: () => {
        if (this.gameOverFlag || this.isPaused || this.isAutoWalking) return;
        this.timeLeft--; this.timeText.setText(String(this.timeLeft));
        if (this.timeLeft <= 0) this.triggerGameOver();
      }
    });

    synth.startBGM(this, this.currentLevel);
    this.events.once('shutdown', () => synth.stopBGM());
    const proc = () => { if (this.canProceedLevel) { synth.getCtx(); this.scene.restart({ currentLevel: this.currentLevel + 1, currentScore: this.score, currentLives: this.lives }); } };
    ['keydown-SPACE', 'keydown-ENTER'].forEach(e => this.input.keyboard.on(e, proc));
  }

  setupErgonomicTouchControls() {
    this.touchControlGraphics = [];
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!isTouch) return;

    const W = this.scale.width, H = this.scale.height;

    const makeCircularBtn = (x, y, radius, label, subLabel, baseColor, onDown, onUp) => {
      const g = this.add.graphics().setScrollFactor(0).setDepth(500);
      const draw = (pressed) => {
        g.clear();
        g.fillStyle(pressed ? 0xffcc00 : baseColor, pressed ? 0.70 : 0.28);
        g.fillCircle(x, y, radius);
        g.lineStyle(pressed ? 4 : 2, pressed ? 0xffea00 : 0xffffff, pressed ? 0.95 : 0.55);
        g.strokeCircle(x, y, radius);
      };
      draw(!1);
      const txt = this.add.text(x, y - (subLabel ? 5 : 0), label, { fontFamily: 'Arial Black', fontSize: `${Math.round(radius * 0.62)}px`, color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(501);
      let subTxt = null;
      if (subLabel) {
        subTxt = this.add.text(x, y + radius * 0.42, subLabel, { fontFamily: 'Arial Black', fontSize: '9px', color: '#ffea00' }).setOrigin(0.5).setScrollFactor(0).setDepth(501);
      }

      const zone = this.add.zone(x, y, radius * 2.2, radius * 2.2).setScrollFactor(0).setDepth(502).setInteractive({ useHandCursor: !0 });
      zone.on('pointerdown', () => { draw(!0); onDown(); });
      zone.on('pointerup', () => { draw(!1); onUp(); });
      zone.on('pointerout', () => { draw(!1); onUp(); });
      this.touchControlGraphics.push({ g, txt, subTxt, zone });
    };

    makeCircularBtn(72, H - 75, 42, '◀', '', 0x111122, () => { window.touchInput.left = !0; }, () => { window.touchInput.left = !1; });
    makeCircularBtn(178, H - 75, 42, '▶', '', 0x111122, () => { window.touchInput.right = !0; }, () => { window.touchInput.right = !1; });

    const duckG = this.add.graphics().setScrollFactor(0).setDepth(500);
    const duckRadius = 34, duckX = W - 225, duckY = H - 72;
    this.redrawDuckToggleBtn = () => {
      duckG.clear();
      if (this.isDuckToggled) {
        duckG.fillStyle(0xffaa00, 0.75);
        duckG.fillCircle(duckX, duckY, duckRadius);
        duckG.lineStyle(4, 0xffea00, 1.0);
        duckG.strokeCircle(duckX, duckY, duckRadius);
      } else {
        duckG.fillStyle(0x334155, 0.32);
        duckG.fillCircle(duckX, duckY, duckRadius);
        duckG.lineStyle(2, 0xffffff, 0.55);
        duckG.strokeCircle(duckX, duckY, duckRadius);
      }
    };
    this.redrawDuckToggleBtn();
    const duckTxt = this.add.text(duckX, duckY - 4, '▼', { fontFamily: 'Arial Black', fontSize: '20px', color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(501);
    this.duckSubTxt = this.add.text(duckX, duckY + 14, 'CRAWL', { fontFamily: 'Arial Black', fontSize: '8px', color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(501);
    const duckZone = this.add.zone(duckX, duckY, duckRadius * 2.3, duckRadius * 2.3).setScrollFactor(0).setDepth(502).setInteractive({ useHandCursor: !0 });
    duckZone.on('pointerdown', () => {
      this.isDuckToggled = !this.isDuckToggled;
      this.redrawDuckToggleBtn();
      this.duckSubTxt.setColor(this.isDuckToggled ? '#000000' : '#ffffff');
      synth.beep(this.isDuckToggled ? 440 : 330, 0.08, 'triangle', 0.12);
    });

    makeCircularBtn(W - 150, H - 145, 33, '🏹', '', 0xdd2222, () => { window.touchInput.shoot = !0; }, () => { window.touchInput.shoot = !1; });
    makeCircularBtn(W - 75, H - 78, 48, '▲', 'JUMP', 0x059669, () => {
      window.touchInput.jump = !0;
      this.touchJumpBuffered = !0;
    }, () => { window.touchInput.jump = !1; });
  }

  onCloudLand(player, cloud) {
    if (cloud?.baseY && !cloud.isBouncing && player.body.touching.down && (player.body.velocity.y >= 0 || player.body.newVelocity.y >= 0)) {
      cloud.isBouncing = !0;
      this.tweens.add({
        targets: cloud, y: cloud.baseY + 2.5, duration: 80, yoyo: !0,
        onComplete: () => {
          cloud.y = cloud.baseY;
          this.time.delayedCall(400, () => { if (cloud) cloud.isBouncing = !1; });
        }
      });
    }
  }

  update() {
    if (this.gameOverFlag || this.isPaused) {
      if ((Phaser.Input.Keyboard.JustDown(this.keys.R) || Phaser.Input.Keyboard.JustDown(this.keys.ESC) || Phaser.Input.Keyboard.JustDown(this.keys.P)) && this.isPaused) this.togglePauseMenu();
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.F10)) {
      this.gemsCollected = 5; this.collectedTypes = new Set([0, 1, 2, 3, 4]);
      if (this.gemHUDIcons) this.gemHUDIcons.forEach(ic => ic.setAlpha(1.0));
      const targetStairX = this.currentLevel === 7 ? 8850 : (this.currentLevel === 6 ? 8450 : (this.currentLevel === 5 ? 7350 : (this.currentLevel === 4 ? 5850 : (this.currentLevel === 3 ? 5450 : (this.currentLevel === 2 ? 4050 : 3020)))));
      this.player.setPosition(targetStairX + 108, this.SURFACE_Y - 200).setVelocity(0, 0); synth.powerup();
    }
    this.skyBg.tilePositionX = Math.floor(this.cameras.main.scrollX * 0.15);
    if (this.groundTransitionBg) this.groundTransitionBg.tilePositionX = Math.floor(this.cameras.main.scrollX * 0.15);
    this.gemGroup.children.iterate(d => { if (d?.active && d.glowAura) d.glowAura.setPosition(d.x, d.y); });
    this.pBarFill.width = Math.max(0, Math.min(1, (this.player.x - 120) / (this.castleDoorX - 120))) * 300;

    if (this.currentLevel === 7) {
      this.whiteCloudGroup.children.iterate(wc => {
        if (!wc?.active || wc.isFading) return;
        const touching = this.player.body.touching.down && (Math.abs(this.player.x - wc.x) < 105) && (this.player.body.bottom <= wc.y + 15);
        if (touching) {
          wc.standingTime += 16.6;
          if (wc.standingTime >= 1000) {
            wc.isFading = !0;
            this.tweens.add({
              targets: wc, alpha: 0.35, duration: 200,
              onComplete: () => {
                wc.body.enable = !1;
                this.time.delayedCall(1500, () => {
                  wc.body.enable = !0;
                  this.tweens.add({
                    targets: wc, alpha: 1, duration: 250,
                    onComplete: () => { wc.isFading = !1; wc.standingTime = 0; }
                  });
                });
              }
            });
          }
        } else if (wc.standingTime > 0) {
          wc.standingTime = Math.max(0, wc.standingTime - 12);
        }
      });

      this.eagleGroup.children.iterate(eg => {
        if (!eg?.active || eg.isDead) return;
        if (eg.x >= eg.homeX + eg.range) { eg.setVelocityX(-eg.speed); eg.setFlipX(!0); }
        else if (eg.x <= eg.homeX - eg.range) { eg.setVelocityX(eg.speed); eg.setFlipX(!1); }
      });

      if (this.groundTransitionBg) {
        const startX = 5900, endX = 8650;
        if (this.player.x >= startX) {
          const transFactor = Math.min(1, Math.max(0, (this.player.x - startX) / (endX - startX)));
          this.groundTransitionBg.setAlpha(transFactor);
          this.skyBg.setAlpha(1 - transFactor * 0.85);
        } else {
          this.groundTransitionBg.setAlpha(0);
          this.skyBg.setAlpha(1);
        }
      }
    }

    if (this.currentLevel === 6) {
      if (this.player.y > this.SURFACE_Y + 12 && !this.isHurt && !this.isAutoWalking) {
        synth.waterSplash();
        this.damagePlayer();
        return;
      }

      this.lilypadGroup.children.iterate(lp => {
        if (!lp?.active || lp.isSinking || lp.isCheckpointPad) return;
        const touching = this.player.body.touching.down && (Math.abs(this.player.x - lp.x) < 90) && (this.player.body.bottom <= lp.y + 15);
        if (touching) {
          lp.standingTime += 16.6;
          if (lp.standingTime > 3200 && !lp.isWarned) {
            lp.isWarned = !0;
            this.tweens.add({ targets: lp, y: lp.baseY + 6, duration: 150, yoyo: !0, repeat: 5 });
          }
          if (lp.standingTime >= 5000) {
            lp.isSinking = !0; lp.isWarned = !1;
            this.tweens.add({
              targets: lp, y: lp.baseY + 65, duration: 600, ease: 'Sine.easeIn',
              onComplete: () => {
                lp.body.enable = !1;
                this.time.delayedCall(3000, () => {
                  lp.y = lp.baseY + 65; lp.body.enable = !0;
                  this.tweens.add({
                    targets: lp, y: lp.baseY, duration: 800, ease: 'Sine.easeOut',
                    onComplete: () => { lp.isSinking = !1; lp.standingTime = 0; }
                  });
                });
              }
            });
          }
        } else if (lp.standingTime < 5000) {
          lp.standingTime = Math.max(0, lp.standingTime - 10);
          if (lp.standingTime === 0) lp.isWarned = !1;
        }
      });

      const now = this.time.now;
      this.waterEnemyGroup.children.iterate(we => {
        if (!we?.active || we.hp <= 0) return;
        const isLeftOfEnemy = (this.player.x < we.x - 20);
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, we.x, we.y);
        we.setFlipX(!0);
        if (isLeftOfEnemy && dist < 950) {
          if (now - we.lastShotTime > 1400) {
            we.lastShotTime = now;
            we.play('water-enemy-attack');
            this.time.delayedCall(250, () => { if (we.active) we.play('water-enemy-idle'); });
            const pBall = this.waterBulletGroup.create(we.x - 65, we.y - 180, 'water-projectile').setScale(1.2);
            pBall.body.setSize(16, 16);
            const ang = Phaser.Math.Angle.Between(pBall.x, pBall.y, this.player.x, this.player.y - 25);
            pBall.setVelocity(Math.cos(ang) * 185, Math.sin(ang) * 185);
            this.time.delayedCall(5000, () => { if (pBall.active) pBall.destroy(); });
          }
        }
      });
    }

    if (this.currentLevel === 5 && this.snowParticles) {
      this.snowParticles.forEach(p => {
        p.x += p.vx * (1 / 60); p.y += p.vy * (1 / 60);
        if (p.y > this.SURFACE_Y) { p.y = -10; p.x = Phaser.Math.Between(0, 960); }
        if (p.x < 0) p.x = 960;
      });
    }

    if (this.isAutoWalking) {
      if (this.walkingInsideCastle) { this.player.play('walk', !0); return; }
      if (this.player.body.blocked.down || this.player.body.touching.down) {
        this.cameras.main.setBounds(0, 0, this.LEVEL_WIDTH + 1000, 540);
        if (this.player.x < this.castleDoorX) {
          this.player.setVelocityX(120); this.player.facing = 1; this.player.setFlipX(!1).play('walk', !0);
        } else if (!this.standingAtGate) {
          this.standingAtGate = !0; this.player.setVelocityX(0).play('win-pose').setFlipX(!0);
          this.startFlagSwapCeremony(() => {
            synth.doorOpen();
            const castleOpenImg = this.add.image(this.castleDoorX, this.SURFACE_Y, 'castle-open').setOrigin(0.5, 1).setDisplaySize(480, 365).setDepth(19);
            this.tweens.add({ targets: this.castleImg, alpha: 0, duration: 400 });
            this.time.delayedCall(450, () => {
              this.walkingInsideCastle = !0; this.player.body.setAllowGravity(!1); this.player.body.setVelocity(0, 0);
              this.player.setFlipX(!1).setDepth(21).play('walk', !0);
              this.tweens.add({
                targets: this.player, x: this.castleDoorX + 30, scaleX: 0.25, scaleY: 0.25, alpha: 0, duration: 1800, ease: 'Linear',
                onComplete: () => {
                  this.player.setVelocityX(0); synth.doorClose();
                  this.tweens.add({
                    targets: this.castleImg, alpha: 1, duration: 400,
                    onComplete: () => {
                      if (castleOpenImg) castleOpenImg.destroy();
                      this.isAutoWalking = !1; this.gameOverFlag = !0; this.physics.pause();
                      this.time.delayedCall(700, () => { if (this.currentLevel < 7) this.showLevelClearOverlay(); else this.showGameCompletedOverlay(); });
                    }
                  });
                }
              });
            });
          });
        }
      }
      return;
    }

    const left = this.cursors.left.isDown || this.keys.A.isDown || window.touchInput.left;
    const right = this.cursors.right.isDown || this.keys.D.isDown || window.touchInput.right;
    const isDuckActive = this.cursors.down.isDown || this.keys.S.isDown || this.isDuckToggled;
    const shoot = Phaser.Input.Keyboard.JustDown(this.keys.X) || window.touchInput.shoot;
    const onGround = this.player.body.blocked.down || this.player.body.touching.down, spd = window.gameSettings.playerSpeed;

    if (onGround) this.jumpCount = 0;
    const jumpK = Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
    const jumpHit = jumpK || this.touchJumpBuffered;
    this.touchJumpBuffered = !1;

    if (!this.isHurt) {
      if (isDuckActive) { this.player.setScale(0.68, 0.44); this.player.body.setSize(36, 50).setOffset(52, 90); }
      else { this.player.setScale(0.80, 0.80); this.player.body.setSize(36, 90).setOffset(52, 50); }

      if (left && !right) { this.player.setVelocityX(-spd); this.player.facing = -1; this.player.setFlipX(!0); if (onGround && !this.isShooting) this.player.play('walk', !0); }
      else if (right && !left) { this.player.setVelocityX(spd); this.player.facing = 1; this.player.setFlipX(!1); if (onGround && !this.isShooting) this.player.play('walk', !0); }
      else { this.player.setVelocityX(this.player.body.velocity.x * 0.82); if (onGround && !this.isShooting) { this.player.play('idle', !0); this.player.setFlipX(this.player.facing === -1); } }

      if (jumpHit) {
        if (onGround || this.jumpCount === 0) { this.player.setVelocityY(-720); synth.jump(); this.jumpCount = 1; }
        else if (this.jumpCount === 1 || this.jumpCount === 2) { this.player.setVelocityY(-450); synth.jump(); this.jumpCount++; }
      }
      if (shoot && this.hasArrows && this.starAmmo > 0 && (this.currentLevel >= 2)) {
        window.touchInput.shoot = !1; this.shootArrow(); this.isShooting = !0;
        this.time.delayedCall(200, () => this.isShooting = !1);
      }
      if (this.isShooting) { this.player.setTexture('player', 7); this.player.anims.stop(); }
      else if (!onGround) {
        const isFreeFalling = this.currentLevel === 7 && this.player.x >= 8400 && this.player.body.velocity.y > 0;
        this.player.play(isFreeFalling ? 'fall' : (this.player.body.velocity.y < 0 ? 'jump' : 'fall'), !0).setFlipX(this.player.facing === -1);
      }
    }

    if (this.player.y > 640) this.damagePlayer();
    this.updatePatrol(this.turtleGroup); this.updatePatrol(this.mushroomGroup);
    if (Phaser.Input.Keyboard.JustDown(this.keys.P) || Phaser.Input.Keyboard.JustDown(this.keys.ESC)) this.togglePauseMenu();
  }

  handleLotusBounce(p, lotus) {
    if (p.body.velocity.y >= -100) {
      p.setVelocityY(-1080); synth.superJump();
      this.tweens.add({ targets: lotus, scaleY: 0.5, duration: 100, yoyo: !0, repeat: 1 });
      const sp = this.add.circle(lotus.x, lotus.y - 20, 45, 0xff66cc, 0.8);
      this.tweens.add({ targets: sp, scale: 2.2, alpha: 0, duration: 350, onComplete: () => sp.destroy() });
    }
  }

  handleCrocCollision(p, croc) {
    if (this.invulnerable || this.isAutoWalking) return;
    const isFalling = p.body.velocity.y > 0;
    const isAbove = (p.body.bottom - p.body.velocity.y * 0.02) <= (croc.y - 25);
    const isTouchingMouth = p.x < (croc.x - 20);

    if (croc.isMouthOpen && isTouchingMouth) {
      this.damagePlayer();
    } else if (isFalling && isAbove) {
      p.setVelocityY(-450); synth.stomp(); this.addScore(50);
    }
  }

  handleWaterBulletHit(p, b) {
    b.destroy(); synth.waterSplash(); this.damagePlayer();
  }

  arrowHitWaterEnemy(arrow, we) {
    if (!arrow.active || !we?.active || we.hp <= 0) return;
    arrow.destroy(); synth.stomp();
    we.hp -= 1;
    if (we.hp > 0) {
      we.setTint(0xff5555); this.addScore(150);
      this.time.delayedCall(200, () => { if (we.active) we.clearTint(); });
    } else {
      this.addScore(500);
      const sp = this.add.circle(we.x, we.y - 60, 60, 0x00ffff, 0.9);
      this.tweens.add({ targets: sp, scale: 2.2, alpha: 0, duration: 300, onComplete: () => sp.destroy() });
      this.tweens.add({ targets: we, scaleY: 0.1, alpha: 0, duration: 300, onComplete: () => we.destroy() });
    }
  }

  activateCheckpoint(p, cp) {
    if (cp.activated) return; cp.activated = !0; cp.setTexture('checkpoint-active'); synth.checkpointSound();
    this.lastCheckpointX = cp.x; this.lastCheckpointY = this.currentLevel === 7 ? cp.y - 15 : this.SURFACE_Y - 20;
    const ring = this.add.circle(cp.x, cp.y - 40, 20, 0x10b981, 0.8);
    this.tweens.add({ targets: ring, scale: 2.5, alpha: 0, duration: 600, onComplete: () => ring.destroy() });
    const cpT = this.add.text(cp.x, cp.y - 95, '🚩 CHECKPOINT!', { fontFamily: 'Arial Black', fontSize: '15px', color: '#10b981', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5);
    this.tweens.add({ targets: cpT, y: cpT.y - 25, alpha: 0, duration: 1200, onComplete: () => cpT.destroy() });
  }

  updatePatrol(g) {
    g.children.iterate(e => {
      if (!e?.active || e.isShell || e.isDead) return;
      if (e.body.blocked.right || e.body.touching.right || e.x >= e.homeX + e.range) { e.setVelocityX(-e.speed); e.dir = -1; e.setFlipX(!0); }
      else if (e.body.blocked.left || e.body.touching.left || e.x <= e.homeX - e.range) { e.setVelocityX(e.speed); e.dir = 1; e.setFlipX(!1); }
    });
  }

  triggerQSensor(p, s) {
    const b = s.parentBlock; if (!b || b.used) return;
    if (p.body.velocity.y <= 50) {
      b.used = !0; b.setTint(0xaaaaaa); s.destroy(); synth.qblock();
      if (p.body.velocity.y < 0) p.setVelocityY(40);
      if (b.contentType === 'arrow_powerup') {
        synth.powerup();
        const arrowP = this.powerupGroup.create(b.x, b.y - 10, 'item-powerup-arrow').setScale(0.95);
        this.tweens.add({
          targets: arrowP, y: b.y - 48, duration: 400, ease: 'Back.easeOut',
          onComplete: () => {
            this.tweens.add({ targets: arrowP, y: b.y - 56, duration: 600, yoyo: !0, repeat: -1, ease: 'Sine.easeInOut' });
            this.tweens.add({ targets: arrowP, scaleX: -0.95, duration: 1200, yoyo: !0, repeat: -1, ease: 'Sine.easeInOut' });
          }
        });
      } else this.spawnSafeGem(b.x, b.y, b.gemType);
    }
  }

  spawnSafeGem(x, y, gType = 0) {
    const col = [0x00ffff, 0xff0077, 0x00ff88, 0xffea00, 0xbf00ff][gType % 5];
    const glow = this.add.image(x, y - 48, 'subtle-gem-glow').setDisplaySize(58, 58).setTint(col).setAlpha(0.50).setDepth(23);
    const dia = this.gemGroup.create(x, y - 10, `diamond-${gType}`).setDepth(25).setDisplaySize(52, 52);
    dia.body.setSize(44, 44); dia.gemType = gType; dia.glowAura = glow; synth.gemSound();
    this.tweens.add({ targets: [dia, glow], y: y - 48, duration: 380, ease: 'Back.easeOut', onComplete: () => this.tweens.add({ targets: [dia, glow], y: y - 56, duration: 650, yoyo: !0, repeat: -1, ease: 'Sine.easeInOut' }) });
    const flash = this.add.circle(x, y - 48, 28, 0xffffff, 0.75).setDepth(26);
    this.tweens.add({ targets: flash, scale: 1.5, alpha: 0, duration: 350, onComplete: () => flash.destroy() });
  }

  collectGem(p, gem) {
    if (!gem.active) return; const gt = gem.gemType;
    if (gem.glowAura) gem.glowAura.destroy(); gem.destroy(); synth.gemSound(); this.addScore(300);
    if (!this.collectedTypes.has(gt)) {
      this.collectedTypes.add(gt); this.gemsCollected++;
      if (this.gemHUDIcons?.[gt]) this.gemHUDIcons[gt].setAlpha(1.0);
    }
    const fl = this.add.circle(p.x, p.y - 30, 42, 0x00ffff, 0.85);
    this.tweens.add({ targets: fl, scale: 1.8, alpha: 0, duration: 320, onComplete: () => fl.destroy() });
  }

  collectPowerup(p, item) {
    item.destroy(); synth.powerup(); this.addScore(500);
    if (this.currentLevel >= 2) { this.hasArrows = !0; this.starAmmo = 10; this.ninjaText.setText('🏹 ARROWS: 10/10 (PRESS X)'); }
    const a = this.add.circle(p.x, p.y - 45, 55, 0x00ffff, 0.75);
    this.tweens.add({ targets: a, scale: 2.2, alpha: 0, duration: 450, onComplete: () => a.destroy() });
  }

  collectHeart(p, heart) {
    heart.destroy(); synth.powerup(); this.addScore(1000);
    if (this.lives < 5) { this.lives++; this.updateHearts(); }
    const a = this.add.circle(p.x, p.y - 40, 50, 0xff1111, 0.85);
    this.tweens.add({ targets: a, scale: 2.2, alpha: 0, duration: 450, onComplete: () => a.destroy() });
  }

  shootArrow() {
    this.starAmmo--; synth.shurikenThrow();
    if (this.starAmmo > 0) this.ninjaText.setText(`🏹 ARROWS: ${this.starAmmo}/10 (PRESS X)`);
    else { this.hasArrows = !1; this.ninjaText.setText('🏹 OUT OF ARROWS'); this.time.delayedCall(1500, () => this.ninjaText.setText('')); }
    const dir = this.player.facing, arrow = this.arrowGroup.create(this.player.x + (dir === 1 ? 30 : -30), this.player.y - 40, 'item-arrow');
    arrow.setSize(60, 20).setVelocityX(dir * 450).setFlipX(dir === -1);
    this.time.delayedCall(1200, () => { if (arrow?.active) arrow.destroy(); });
  }

  arrowHitEnemy(arrow, enemy) {
    if (!arrow.active || !enemy?.active || enemy.isDead) return;
    arrow.destroy(); synth.stomp();
    if (enemy.enemyKind === 'bear' || enemy.enemyKind === 'camel') {
      enemy.hp -= (enemy.enemyKind === 'bear' ? 2 : 3);
      if (enemy.hp > 0) {
        enemy.setTint(0xff5555); this.addScore(enemy.enemyKind === 'bear' ? 150 : 100);
        this.time.delayedCall(200, () => { if (enemy?.active) enemy.clearTint(); }); return;
      }
    }
    this.addScore(200); enemy.isDead = !0;
    const sp = this.add.circle(enemy.x, enemy.y - 20, 28, 0x00ffff, 0.9);
    this.tweens.add({ targets: sp, scale: 1.8, alpha: 0, duration: 220, onComplete: () => sp.destroy() });
    if (enemy.enemyKind === 'bear') this.tweens.add({ targets: enemy, scaleY: 0.1, y: enemy.y + 35, alpha: 0, duration: 300, onComplete: () => enemy.destroy() });
    else enemy.destroy();
  }

  collectStar(p, star) { star.destroy(); synth.coin(); this.addScore(50); }

  handleEnemyCollision(player, enemy) {
    if (this.invulnerable || !enemy.active || enemy.isDead || this.isAutoWalking) return;
    const isFalling = player.body.velocity.y > 0 || player.body.newVelocity.y > 0;
    const isAbove = (player.body.bottom - player.body.velocity.y * 0.02) <= (enemy.body.top + 25);
    if (isFalling && isAbove) {
      if (enemy.enemyKind === 'bear') {
        this.invulnerable = !0; this.time.delayedCall(100, () => { if (!this.isHurt) this.invulnerable = !1; });
        player.body.setVelocityY(-450); this.damagePlayer(); return;
      }
      if (enemy.enemyKind === 'camel') {
        player.body.setVelocityY(-450); if (enemy.isInvul) return;
        enemy.hp -= 3;
        if (enemy.hp <= 0) {
          enemy.isDead = !0; enemy.play('camel-dizzy'); enemy.setVelocity(0, 0);
          synth.stomp(); this.addScore(400); this.time.delayedCall(600, () => { if (enemy?.active) enemy.destroy(); });
        } else {
          synth.stomp(); this.addScore(100); enemy.setTint(0xff5555); enemy.isInvul = !0;
          this.time.delayedCall(300, () => { if (enemy?.active) { enemy.clearTint(); enemy.isInvul = !1; } });
        }
        return;
      }
      this.invulnerable = !0; this.time.delayedCall(100, () => { if (!this.isHurt) this.invulnerable = !1; });
      player.body.setVelocityY(-450); synth.stomp(); this.addScore(200);
      if (enemy.enemyKind === 'turtle') {
        if (!enemy.isShell) {
          enemy.isShell = !0; enemy.setVelocity(0, 0); enemy.play('turtle-shell');
          this.time.delayedCall(1500, () => { if (enemy?.active) { enemy.isDead = !0; enemy.destroy(); } });
        } else { enemy.isDead = !0; enemy.destroy(); }
      } else {
        enemy.isDead = !0;
        if (enemy.enemyKind === 'mushroom') enemy.play('mushroom-dead');
        enemy.setVelocity(0, 0);
        this.time.delayedCall(300, () => { if (enemy?.active) enemy.destroy(); });
      }
      return;
    }
    this.damagePlayer();
  }

  damagePlayer() {
    if (this.invulnerable) return;
    this.lives--; synth.hurt(); this.updateHearts();
    if (this.lives <= 0) { this.triggerGameOver(); return; }

    this.isDuckToggled = !1;
    if (this.redrawDuckToggleBtn) {
      this.redrawDuckToggleBtn();
      if (this.duckSubTxt) this.duckSubTxt.setColor('#ffffff');
    }

    this.player.body.reset(this.lastCheckpointX, this.lastCheckpointY);
    this.player.setVelocity(0, 0); this.isHurt = !0; this.player.play('hurt', !0);
    this.time.delayedCall(400, () => { this.isHurt = !1; });
    this.invulnerable = !0; this.player.setAlpha(0.4);
    const bl = this.time.addEvent({ delay: 120, repeat: 10, callback: () => { this.player.alpha = this.player.alpha === 1 ? 0.3 : 1; } });
    this.time.delayedCall(1400, () => { this.invulnerable = !1; this.player.setAlpha(1); bl.remove(); });
  }

  updateHearts() { let s = ''; for (let i = 0; i < 5; i++) s += i < this.lives ? '❤️' : '🤍'; this.heartsText.setText(s); }
  addScore(v) { this.score += v; this.scoreText.setText(`SCORE: ${String(this.score).padStart(4, '0')}`); }

  reachFlag() {
    if (this.gameOverFlag || this.isAutoWalking) return;
    if (this.gemsCollected < this.totalGems) {
      if (!this.warnCooldown) {
        this.warnCooldown = !0;
        const warn = this.add.text(this.player.x, this.player.y - 120, '⚠️ COLLECT ALL 5 GEMS FIRST!', { fontFamily: 'Arial Black', fontSize: '16px', color: '#ff3333', stroke: '#000', strokeThickness: 5 }).setOrigin(0.5).setDepth(150);
        this.tweens.add({ targets: warn, y: warn.y - 30, alpha: 0, duration: 1600, onComplete: () => warn.destroy() });
        this.time.delayedCall(2000, () => this.warnCooldown = !1);
      }
      return;
    }
    this.isDuckToggled = !1;
    const ballY = this.SURFACE_Y - 258;
    this.add.circle(this.flagZone.x, ballY, 12, 0xffea00, 1).setDepth(22);
    const glowAura = this.add.circle(this.flagZone.x, ballY, 30, 0xffcc00, 0.6).setDepth(21);
    this.tweens.add({ targets: glowAura, scale: 1.8, alpha: 0, duration: 800, yoyo: !0, repeat: -1 });
    this.isAutoWalking = !0; this.standingAtGate = !1; this.timerEvent.remove(); synth.stopBGM(); synth.win(); this.flagZone.destroy();
  }

  startFlagSwapCeremony(done) {
    this.tweens.add({
      targets: this.flagRedM, y: this.SURFACE_Y - 25, duration: 1600, ease: 'Sine.easeInOut',
      onComplete: () => {
        this.flagRedM.setAlpha(0); this.flagPurpleVJ.setAlpha(1);
        this.tweens.add({
          targets: this.flagPurpleVJ, y: this.SURFACE_Y - 225, duration: 1800, ease: 'Sine.easeOut',
          onComplete: () => { this.tweens.add({ targets: this.flagPurpleVJ, scaleY: 0.95, scaleX: 1.04, duration: 340, yoyo: !0, repeat: -1, ease: 'Sine.easeInOut' }); if (done) done(); }
        });
      }
    });
  }

  togglePauseMenu() {
    if (this.gameOverFlag || this.isAutoWalking) return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) { this.physics.pause(); synth.stopBGM(); this.openPauseModal(); }
    else { this.physics.resume(); synth.startBGM(this, this.currentLevel); this.closePauseModal(); }
  }

  openPauseModal() {
    const W = this.scale.width, H = this.scale.height; this.pauseModalElements = [];
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.78).setScrollFactor(0).setDepth(600);
    const card = this.add.rectangle(W / 2, H / 2, 460, 360, 0x1e1e24, 0.96).setStrokeStyle(3, 0xffcc00).setScrollFactor(0).setDepth(601);
    const title = this.add.text(W / 2, H / 2 - 145, '⚙️ GAME PAUSED & SETTINGS', { fontFamily: 'Arial Black', fontSize: '20px', color: '#ffcc00' }).setOrigin(0.5).setScrollFactor(0).setDepth(602);
    const sLab = this.add.text(W / 2 - 190, H / 2 - 100, 'PLAYER SPEED:', { fontFamily: 'Arial Black', fontSize: '13px', color: '#fff' }).setScrollFactor(0).setDepth(602);
    [{ name: 'NORMAL', val: 240, x: W / 2 - 30 }, { name: 'FAST', val: 300, x: W / 2 + 55 }, { name: 'TURBO', val: 360, x: W / 2 + 140 }].forEach(s => {
      const isSel = window.gameSettings.playerSpeed === s.val;
      const b = this.add.text(s.x, H / 2 - 100, s.name, { fontFamily: 'Arial Black', fontSize: '12px', color: '#fff', backgroundColor: isSel ? '#ffaa00' : '#444', padding: { x: 8, y: 4 } }).setOrigin(0.5).setScrollFactor(0).setDepth(602).setInteractive({ useHandCursor: !0 });
      b.on('pointerdown', () => { window.gameSettings.playerSpeed = s.val; this.closePauseModal(); this.openPauseModal(); });
      this.pauseModalElements.push(b);
    });
    const aLab = this.add.text(W / 2 - 190, H / 2 - 50, 'AUDIO CONTROL:', { fontFamily: 'Arial Black', fontSize: '13px', color: '#fff' }).setScrollFactor(0).setDepth(602);
    const bgmB = this.add.text(W / 2, H / 2 - 50, `BGM: ${window.gameSettings.bgmEnabled ? '🔊 ON' : '🔇 OFF'}`, { fontFamily: 'Arial Black', fontSize: '13px', color: '#fff', backgroundColor: window.gameSettings.bgmEnabled ? '#2e7d32' : '#c62828', padding: { x: 10, y: 5 } }).setOrigin(0.5).setScrollFactor(0).setDepth(602).setInteractive({ useHandCursor: !0 });
    bgmB.on('pointerdown', () => { window.gameSettings.bgmEnabled = !window.gameSettings.bgmEnabled; this.closePauseModal(); this.openPauseModal(); });
    const sfxB = this.add.text(W / 2 + 130, H / 2 - 50, `SFX: ${window.gameSettings.sfxEnabled ? '🔔 ON' : '🔕 OFF'}`, { fontFamily: 'Arial Black', fontSize: '13px', color: '#fff', backgroundColor: window.gameSettings.sfxEnabled ? '#2e7d32' : '#c62828', padding: { x: 10, y: 5 } }).setOrigin(0.5).setScrollFactor(0).setDepth(602).setInteractive({ useHandCursor: !0 });
    sfxB.on('pointerdown', () => { window.gameSettings.sfxEnabled = !window.gameSettings.sfxEnabled; this.closePauseModal(); this.openPauseModal(); });
    const resB = this.add.text(W / 2, H / 2 + 20, '▶️ RESUME', { fontFamily: 'Arial Black', fontSize: '16px', color: '#fff', backgroundColor: '#7a2fbf', padding: { x: 24, y: 8 } }).setOrigin(0.5).setScrollFactor(0).setDepth(602).setInteractive({ useHandCursor: !0 });
    resB.on('pointerdown', () => this.togglePauseMenu());
    const restB = this.add.text(W / 2, H / 2 + 70, '🔄 RESTART LEVEL', { fontFamily: 'Arial Black', fontSize: '15px', color: '#fff', backgroundColor: '#e65100', padding: { x: 20, y: 7 } }).setOrigin(0.5).setScrollFactor(0).setDepth(602).setInteractive({ useHandCursor: !0 });
    restB.on('pointerdown', () => { this.closePauseModal(); this.scene.restart({ currentLevel: this.currentLevel, currentScore: this.score, currentLives: 5 }); });
    const homeB = this.add.text(W / 2, H / 2 + 120, '🏠 MAIN MENU', { fontFamily: 'Arial Black', fontSize: '15px', color: '#fff', backgroundColor: '#37474f', padding: { x: 20, y: 7 } }).setOrigin(0.5).setScrollFactor(0).setDepth(602).setInteractive({ useHandCursor: !0 });
    homeB.on('pointerdown', () => { this.closePauseModal(); this.scene.start('TitleScene'); });
    this.pauseModalElements.push(overlay, card, title, sLab, aLab, bgmB, sfxB, resB, restB, homeB);
  }
  closePauseModal() { if (this.pauseModalElements) { this.pauseModalElements.forEach(el => el.destroy()); this.pauseModalElements = null; } }

  showLevelClearOverlay() {
    this.canProceedLevel = !0; const W = this.scale.width, H = this.scale.height, bx = W * 0.28;
    this.add.rectangle(bx, H / 2, 420, 320, 0x0a0a14, 0.88).setStrokeStyle(3, 0x33ff33).setScrollFactor(0).setDepth(600);
    this.add.text(bx, H / 2 - 80, `LEVEL ${this.currentLevel} COMPLETED!`, { fontFamily: 'Arial Black', fontSize: '24px', color: '#33ff33', stroke: '#000', strokeThickness: 5 }).setOrigin(0.5).setScrollFactor(0).setDepth(601);
    this.add.text(bx, H / 2 - 15, `CURRENT SCORE: ${this.score}\n💎 ALL 5 GEMS COLLECTED!`, { fontFamily: 'Arial', fontSize: '18px', color: '#ffee88', stroke: '#000', strokeThickness: 3, align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(601);
    const nBtn = this.add.text(bx, H / 2 + 65, `START LEVEL ${this.currentLevel + 1}\n(TAP OR PRESS ENTER)`, { fontFamily: 'Arial Black', fontSize: '15px', color: '#fff', backgroundColor: '#ff5500', align: 'center', padding: { x: 16, y: 8 } }).setOrigin(0.5).setScrollFactor(0).setDepth(601).setInteractive({ useHandCursor: !0 });
    nBtn.on('pointerdown', () => { synth.getCtx(); this.scene.restart({ currentLevel: this.currentLevel + 1, currentScore: this.score, currentLives: this.lives }); });
  }

  showGameCompletedOverlay() {
    this.canProceedLevel = !1; const W = this.scale.width, H = this.scale.height, bx = W * 0.28;
    this.add.rectangle(bx, H / 2, 430, 340, 0x0d0718, 0.90).setStrokeStyle(3, 0xffcc00).setScrollFactor(0).setDepth(600);
    this.add.text(bx, H / 2 - 95, '🏆 REALM CONQUERED! 🏆', { fontFamily: 'Arial Black', fontSize: '26px', color: '#ffcc00', stroke: '#7a2fbf', strokeThickness: 6, align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(601);
    this.add.text(bx, H / 2 - 10, `CONGRATULATIONS!\nFINAL SCORE: ${this.score}\nCREATED BY VAIBHAV JAIN`, { fontFamily: 'Arial', fontSize: '18px', color: '#fff', align: 'center', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0).setDepth(601);
    const pBtn = this.add.text(bx, H / 2 + 75, 'MAIN MENU\n(TAP OR ENTER)', { fontFamily: 'Arial Black', fontSize: '15px', color: '#fff', backgroundColor: '#7a2fbf', align: 'center', padding: { x: 16, y: 8 } }).setOrigin(0.5).setScrollFactor(0).setDepth(601).setInteractive({ useHandCursor: !0 });
    pBtn.on('pointerdown', () => this.scene.start('TitleScene'));
  }

  triggerGameOver() {
    if (this.gameOverFlag) return;
    this.gameOverFlag = !0; this.physics.pause(); this.timerEvent.remove(); synth.stopBGM(); synth.gameOver();
    const W = this.scale.width, H = this.scale.height;
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.65).setScrollFactor(0).setDepth(600);
    this.add.text(W / 2, H / 2 - 50, 'GAME OVER', { fontFamily: 'Arial Black', fontSize: '38px', color: '#fff', stroke: '#000', strokeThickness: 6 }).setOrigin(0.5).setScrollFactor(0).setDepth(601);
    this.add.text(W / 2, H / 2 + 10, `SCORE: ${this.score}`, { fontFamily: 'Arial', fontSize: '20px', color: '#ffee88', align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(601);
    const rBtn = this.add.text(W / 2, H / 2 + 75, 'RETRY (LAST CHECKPOINT)', { fontFamily: 'Arial', fontSize: '18px', color: '#fff', backgroundColor: '#7a2fbf', padding: { x: 14, y: 8 } }).setOrigin(0.5).setScrollFactor(0).setDepth(601).setInteractive({ useHandCursor: !0 });
    rBtn.on('pointerdown', () => this.scene.restart({ currentLevel: this.currentLevel, currentScore: this.score, currentLives: 5 }));
  }
}
