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
    this.physics.resume();
    this.input.addPointer(4);
    this.SURFACE_Y = 473;
    const L = this.currentLevel, isL2 = L === 2, isL3 = L === 3, isL4 = L === 4, isL5 = L === 5, isL6 = L === 6, isL7 = L === 7, isDesert = isL3 || isL4;
    document.body.style.backgroundColor = isL7 ? '#2a1a3a' : (isL6 ? '#10162a' : (isL5 ? '#111122' : (isL4 ? '#000000' : (isL2 ? '#071118' : (isDesert ? '#88ccff' : '#5c94fc')))));
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
      if (this.groundTransitionBg && this.textures.exists('bg-sky')) {
        const sc = 540 / this.textures.get('bg-sky').getSourceImage().height;
        this.groundTransitionBg.tileScaleY = sc; this.groundTransitionBg.tileScaleX = sc;
        this.groundTransitionBg.setTint(0x707080);
      }
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
      // Aesthetic Thunderstorm Slanted High-Pressure Rainfall in Background (Depth 1, between skyBg and world)
      this.rainGfx = this.add.graphics().setScrollFactor(0).setDepth(1);
      this.rainDrops = Array.from({ length: 240 }, () => ({
        x: Phaser.Math.Between(-100, 1060),
        y: Phaser.Math.Between(-100, 560),
        len: Phaser.Math.Between(26, 44),
        spd: Phaser.Math.Between(950, 1400),
        alpha: Phaser.Math.FloatBetween(0.35, 0.75),
        thick: Phaser.Math.FloatBetween(1.2, 1.9)
      }));
      // Lightning flash backdrop overlay (depth 2) and realistic lightning bolt graphics (depth 200)
      this.lightningOverlay = this.add.rectangle(0, 0, this.scale.width, 540, 0xd8eeff, 0).setOrigin(0).setScrollFactor(0).setDepth(2);
      this.fullWhiteThunderOverlay = this.add.rectangle(0, 0, this.scale.width, 540, 0xffffff, 0).setOrigin(0).setScrollFactor(0).setDepth(250);
      this.lightningBoltGfx = this.add.graphics().setScrollFactor(0).setDepth(200);
      this.nextLightningTime = this.time.now + Phaser.Math.Between(4000, 7500);
      this.megaThunderTimes = [this.time.now + 12000, this.time.now + 38000];
      this.megaThunderIndex = 0;
    } else if (isL4) {
      this.skyBg = this.textures.exists('desert-night-bg') ? this.add.tileSprite(0, 0, this.scale.width, 540, 'desert-night-bg').setOrigin(0).setScrollFactor(0) : (this.textures.exists('desert-bg') ? this.add.tileSprite(0, 0, this.scale.width, 540, 'desert-bg').setOrigin(0).setScrollFactor(0) : this.add.rectangle(0, 0, this.scale.width, 540, 0x070c18).setOrigin(0).setScrollFactor(0));
      if (this.skyBg.tileScaleY && this.textures.exists('desert-night-bg')) {
        const sc = 540 / this.textures.get('desert-night-bg').getSourceImage().height;
        this.skyBg.tileScaleY = sc; this.skyBg.tileScaleX = sc;
      }
    } else if (isDesert) {
      this.skyBg = this.textures.exists('desert-bg') ? this.add.tileSprite(0, 0, this.scale.width, 540, 'desert-bg').setOrigin(0).setScrollFactor(0) : this.add.rectangle(0, 0, this.scale.width, 540, 0x88ccff).setOrigin(0).setScrollFactor(0);
      if (this.skyBg.tileScaleY && this.textures.exists('desert-bg')) { const sc = 540 / this.textures.get('desert-bg').getSourceImage().height; this.skyBg.tileScaleY = sc; this.skyBg.tileScaleX = sc; }
    } else {
      this.skyBg = this.textures.exists('bg-sky') ? this.add.tileSprite(0, 0, this.scale.width, 540, 'bg-sky').setOrigin(0).setScrollFactor(0) : this.add.rectangle(0, 0, this.scale.width, 540, 0x5c94fc).setOrigin(0).setScrollFactor(0);
      if (this.skyBg.tileScaleY && this.textures.exists('bg-sky')) {
        const sc = 540 / this.textures.get('bg-sky').getSourceImage().height;
        this.skyBg.tileScaleY = sc; this.skyBg.tileScaleX = sc;
      }
    }

    if (isL4) {
      // Natural dark night contrast overlay across entire level viewport (depth 90)
      this.nightOverlay = this.add.rectangle(0, 0, this.scale.width, 540, 0x000000, 0.25).setOrigin(0).setScrollFactor(0).setDepth(90);
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
      const slabW = (isDesert || isL5) ? 108 : 54, step = slabW - 2, count = Math.ceil(lengthPx / step), texKey = isL5 ? 'tile-ice-cuboid' : (isL4 ? 'tile-night-sand-cuboid' : (isDesert ? 'tile-sand-cuboid' : (isL2 && this.textures.exists('tile-stone') ? 'tile-stone' : 'tile-grass')));
      for (let i = 0; i < count; i++) {
        const x = Math.round(startX + i * step) + slabW / 2, topSlab = this.groundGroup.create(x, this.SURFACE_Y + 27, texKey);
        topSlab.setDisplaySize(slabW + 1, 55);
        if (isL2) topSlab.setDepth(10);
        if (isDesert || isL5) { topSlab.body.setSize(108, 44); topSlab.body.setOffset(0, 10); }
        topSlab.refreshBody();
        const botSlab = this.groundGroup.create(x, this.SURFACE_Y + 81, texKey);
        botSlab.setDisplaySize(slabW + 1, 55);
        if (isL2) botSlab.setDepth(10);
        botSlab.refreshBody();
      }
    };

    (isL7 ? [[8650, 1050]] : (isL6 ? [[0, 1150], [8450, 950]] : (isL5 ? [[0, 1500], [1800, 1000], [3200, 1600], [5200, 3650]] : (isL4 ? [[0, 1000], [1250, 850], [2350, 1500], [4200, 850], [5600, 1900]] : (isL3 ? [[0, 1100], [1350, 950], [2500, 950], [3650, 950], [4800, 2300]] : (isL2 ? [[0, 864], [980, 648], [1750, 648], [2520, 648], [3280, 540], [3900, 1900]] : [[0, 972], [1080, 756], [1950, 756], [2800, 1900]])))))).forEach(([x, l]) => addGRun(x, l));

    const addQ = (x, y, cType = 'gem', gType = 0) => {
      const blockTex = (cType === 'gem' && this.textures.exists('tile-mystery')) ? 'tile-mystery' : 'tile-qblock';
      const q = this.qblockGroup.create(x, y, blockTex).setDisplaySize(54, 54);
      if (blockTex === 'tile-qblock') {
        if (isL4) q.setTint(0x22242c); else if (isL5) q.setTint(0x556688);
      }
      q.refreshBody(); q.used = !1; q.contentType = cType; q.gemType = gType;
      const s = this.qSensors.create(x, y + 24, null); s.setSize(50, 24).setVisible(!1); s.refreshBody(); s.parentBlock = q;
    };
    const addF = (x, y, customTex = null) => {
      const defaultTex = isL5 ? 'tile-ice-cube' : (isL4 ? 'tile-night-sand-cube' : (isDesert ? 'tile-sand-cube' : 'tile-grass'));
      const tex = customTex || defaultTex;
      const b = this.floorGroup.create(x, y, tex).setDisplaySize(55, 55);
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
        eg.homeX = x; eg.range = range; eg.baseY = y; eg.speed = spd || 230; eg.dir = 1;
        eg.phase = Math.random() * Math.PI * 2;
        eg.targetVx = eg.speed;
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
        const cr = this.crocodileGroup.create(x, this.SURFACE_Y + 12, 'croc-spritesheet', 0).setOrigin(0.5, 1).setScale(1.175);
        cr.setFlipX(!0);
        cr.body.setSize(180, 80).setOffset(40, 110);
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
        const we = this.waterEnemyGroup.create(x, 540, 'water-enemy-spritesheet', 0).setOrigin(0.5, 1).setScale(1.15);
        we.setFlipX(!0);
        we.body.setSize(170, 300).setOffset(70, 20);
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
        const mp = this.movingFloorGroup.create(x, y, 'tile-night-sand-cuboid').setDisplaySize(108, TILE); mp.body.setSize(108, 44); mp.body.setOffset(0, 10);
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
      const T1 = 330; addF(460, T1, 'tile-stone'); addQ(514, T1, 'arrow_powerup', 0); addF(568, T1, 'tile-stone');
      [[820, 874, 928, 0], [1200, 1254, 1308, 1], [1900, 1954, 2008, 2], [2650, 2704, 2758, 3], [3400, 3454, 3508, 4]].forEach(([f1, q, f2, t], idx) => {
        const tex = (idx === 1 || idx === 3) ? 'tile-stone' : null;
        addF(f1, T1, tex); addQ(q, T1, 'gem', t); addF(f2, T1, tex);
      });
      [[700, 360], [1550, 360], [3100, 360]].forEach(([x, y], idx) => {
        const tex = (idx === 1) ? 'tile-stone' : 'tile-grass';
        const mp = this.movingFloorGroup.create(x, y, tex).setDisplaySize(TILE * 2, TILE); mp.body.setSize(TILE * 2, TILE);
        this.tweens.add({ targets: mp, y: y - 130, duration: 1800, yoyo: !0, repeat: -1, ease: 'Sine.easeInOut' });
      });
    } else {
      const T1 = 330;
      [[480, 534, 588, 0], [820, 874, 928, 1], [1250, 1304, 1358, 2], [2100, 2154, 2208, 3], [2450, 2504, 2558, 4]].forEach(([f1, q, f2, t], idx) => {
        const tex = (idx === 1 || idx === 3) ? 'tile-stone' : null;
        addF(f1, T1, tex); addQ(q, T1, 'gem', t); addF(f2, T1, tex);
      });
    }

    const objGroundY = (isDesert || isL5) ? (this.SURFACE_Y + 11) : this.SURFACE_Y;

    const cpLocs = isL7 ? [2000, 4200, 5950, 8150] : (isL6 ? [500, 2400, 4700, 6500, 8550] : (isL5 ? [500, 2000, 3400, 5300, 6800] : (isL4 ? [800, 1350, 2380, 4250, 5650] : (isL3 ? [500, 1400, 2550, 3700, 4850] : (isL2 ? [500, 1050, 1800, 2600, 3350] : [500, 1150, 2050, 2900])))));
    if (!isL7 && !isL6) {
      cpLocs.forEach(x => {
        const cp = this.checkpointGroup.create(x, objGroundY, 'checkpoint-inactive').setOrigin(0.5, 1).setDepth(20);
        cp.setSize(44, 88);
        if (isL4) cp.setTint(0x22242c);
        cp.refreshBody();
        cp.activated = !1;
      });
    } else if (isL6) {
      [500, 8550].forEach(x => { const cp = this.checkpointGroup.create(x, objGroundY, 'checkpoint-inactive').setOrigin(0.5, 1).setDepth(20); cp.setSize(44, 88).refreshBody(); cp.activated = !1; });
    }

    if (!isL6 && !isL7) {
      const obstacleTex = isL5 ? 'snowman' : (isL4 ? 'tile-night-cactus-trunk' : (isDesert ? 'tile-cactus-trunk' : 'tile-trunk'));
      const obs = isL5 ? [[900, 110, 'snowman'], [2400, 150, 'tree-snow'], [3800, 110, 'snowman'], [5700, 150, 'tree-snow']] : (isL4 ? [[750, 138], [1950, 138], [4300, 138], [5100, 138]] : (isL3 ? [[800, 138], [1950, 138], [3100, 138], [4250, 138]] : (isL2 ? [[660, 115], [1600, 145], [2950, 130]] : [[660, 115], [1600, 145]])));
      obs.forEach(o => {
        const x = o[0], h = o[1] || 138, tex = o[2] || obstacleTex;
        if (tex === 'tree-snow') {
          const obj = this.add.image(x, objGroundY, tex).setOrigin(0.5, 1).setDisplaySize(95, h).setDepth(35);
          this.visualTreeGroup.add(obj);
        } else {
          const isCactus = (tex === 'tile-cactus-trunk' || tex === 'tile-night-cactus-trunk');
          const trunkW = isCactus ? 100 : 85;
          const obj = this.treeObstacleGroup.create(x, objGroundY, tex).setOrigin(0.5, 1).setDisplaySize(trunkW, h);
          if (isCactus) {
            // Tighten bounding box so player feet align seamlessly with the visual rim of the cactus top
            obj.body.setSize(80, h - 14).setOffset((trunkW - 80) / 2, 14);
          }
          if (isL4 && tex === 'tile-night-cactus-trunk') {
            obj.setTint(0x181a20);
          }
          obj.refreshBody();
        }
      });
    }

    const starFallback = isL7 ? [350, 650, 950, 1300, 1650, 2000, 2350, 2700, 3050, 3400, 3750, 4100, 4450, 4800, 5150, 5500, 5850, 6200, 6550, 6900, 7250, 7600, 7950, 8250, 8550, 8750]
      : (isL6 ? [300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2750, 3100, 3450, 3800, 4200, 4600, 5000, 5400, 5800, 6200, 6600, 7000, 7400, 7750, 8050, 8250, 8400]
      : (isL5 ? [250, 500, 750, 840, 1020, 1250, 1500, 1800, 2100, 2340, 2500, 2700, 3000, 3300, 3600, 3720, 3920, 4200, 4500, 4800, 5100, 5400, 5620, 6000, 6600, 7150]
      : (isL4 ? [250, 450, 680, 820, 1050, 1250, 1450, 1650, 1850, 2020, 2250, 2480, 2680, 2880, 3080, 3280, 3480, 3680, 3880, 4180, 4360, 4600, 4820, 5040, 5200, 5600, 5780]
      : (isL3 ? [240, 420, 600, 750, 1050, 1200, 1400, 1600, 1820, 2020, 2250, 2500, 2750, 3020, 3250, 3500, 3750, 4040, 4200, 4500, 4750, 4950, 5150, 5300, 5400]
      : (isL2 ? [220, 360, 500, 620, 740, 960, 1060, 1200, 1340, 1500, 1680, 1800, 1920, 2100, 2250, 2400, 2550, 2720, 2850, 3050, 3250, 3450, 3650, 3850, 3980]
      : [220, 320, 440, 560, 720, 800, 960, 1050, 1180, 1380, 1460, 1550, 1680, 1800, 1920, 2050, 2180, 2300, 2420, 2580, 2680, 2800, 2880, 2940, 2990])))));
    const starList = (window.LEVEL_DATA && window.LEVEL_DATA[L] && window.LEVEL_DATA[L].stars) ? window.LEVEL_DATA[L].stars : starFallback;
    starList.forEach((pos, i) => {
      let x = typeof pos === 'object' && pos !== null ? pos.x : pos;
      let starY;
      if (typeof pos === 'object' && pos !== null && pos.y !== undefined) {
        starY = pos.y;
      } else if (isL7) {
        starY = (i % 2 === 0) ? 210 : 250;
      } else if (isL6) {
        starY = (i % 2 === 0) ? 310 : 350;
      } else if (isL4 && x >= 2350 && x <= 3750) {
        starY = 430;
      } else {
        starY = (i % 2 === 0) ? 320 : 355;
      }
      const s = this.starGroup.create(x, starY, 'tile-star').setScale(0.65).setDepth(25);
      if (s.body) {
        s.body.setSize(38, 38);
      }
      this.tweens.add({ targets: s, y: starY - 8, duration: 650, yoyo: !0, repeat: -1, ease: 'Sine.easeInOut' });
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
        e.body.setSize(80, 85).setOffset(40, 35); e.play('camel-walk'); e.enemyKind = 'camel'; e.hp = 2; e.jumpHp = 2; e.isInvul = !1;
      } else if (type === 'turtle') {
        e = this.turtleGroup.create(x, spawnY, 'turtle', 0).setOrigin(0.5, 1).setScale(0.48);
        e.body.setSize(54, 110).setOffset(28, 28); e.play('turtle-walk'); e.enemyKind = 'turtle';
      } else {
        e = this.mushroomGroup.create(x, spawnY, 'mushroom', 0).setOrigin(0.5, 1).setScale(0.52);
        e.body.setSize(60, 95).setOffset(25, 15); e.play('mushroom-walk'); e.enemyKind = 'mushroom';
      }
      e.setBounce(0); e.homeX = x; e.range = r;
      e.speed = customSpd || (eSpd * (type === 'bear' ? 1.05 : (type === 'camel' ? 2.0 : (type === 'turtle' ? 1 : 0.9))));
      const initialDir = customDir !== undefined ? customDir : -1;
      e.dir = initialDir;
      e.setVelocityX(initialDir * e.speed);
      e.setFlipX(initialDir === -1);
      e.isDead = !1; e.isShell = !1; e.setDepth(20);
      if (isL4) e.setTint(0x181a20);
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
      const enList = (isL5 ? [[700, 90, 'm'], [1220, 140, 'bear'], [2150, 90, 'm'], [2500, 160, 'bear'], [3500, 140, 'bear'], [4250, 150, 'bear'], [4600, 110, 'bear'], [5300, 70, 'm'], [5550, 140, 'bear'], [6000, 150, 'bear'], [6450, 150, 'bear'], [6850, 130, 'bear']]
        : (isL4 ? [[880, 80, 'm'], [1600, 110, 'camel'], [1950, 90, 'm'], [2700, 120, 'camel'], [3500, 120, 'camel'], [4450, 90, 'm'], [4700, 110, 'camel'], [5000, 50, 'm'], [5750, 70, 'camel']]
        : (isL3 ? [[540, 100, 'camel'], [840, 100, 'm'], [1500, 110, 'camel'], [1800, 100, 'm'], [2650, 110, 'camel'], [2950, 100, 'm'], [3800, 110, 'camel'], [4100, 100, 'm'], [4950, 110, 'camel'], [5250, 100, 'm']]
        : (isL2 ? [[400, 80, 'm'], [600, 90, 'turtle'], [1160, 100, 'm'], [1480, 90, 'turtle'], [1980, 100, 'm'], [2260, 90, 'turtle'], [2620, 100, 'm'], [2900, 90, 'turtle'], [3350, 100, 'm'], [3600, 100, 'turtle'], [3800, 90, 'm']]
        : [[400, 80, 'm'], [600, 90, 'm'], [1160, 100, 'm'], [1480, 100, 'm'], [1980, 100, 'm'], [2260, 100, 'm'], [2620, 100, 'm'], [2900, 100, 'm']]))));
      enList.forEach(([x, r, k]) => spawnE(k, x, r));
    }

    for (let s = 0; s < 5; s++) for (let h = 1; h <= s + 1; h++) {
      const stairTex = isL5 ? 'tile-ice-cube' : (isL4 ? 'tile-night-sand-cube' : (isDesert ? 'tile-sand-cube' : (isL2 && this.textures.exists('tile-stone') ? 'tile-stone' : 'tile-grass')));
      let f = this.floorGroup.create(stairX + s * TILE, this.SURFACE_Y - (h - 1) * TILE - TILE / 2, stairTex).setDisplaySize(55, 55);
      if (isDesert || isL5) { f.body.setSize(54, 44); f.body.setOffset(0, 10); }
      f.refreshBody();
    }

    const flagX = stairX + 5 * TILE + 70;
    this.flagSprite = this.add.image(flagX, objGroundY, 'flagpole-bare').setOrigin(0.5, 1).setDepth(21);
    if (isL4) this.flagSprite.setTint(0x1c1e24);

    // Flagpole finial light (starts solid pure white, turns bright red-yellow combination when player reaches flag)
    this.finialLight = this.add.circle(flagX, objGroundY - 258, 10, 0xffffff, 1.0).setDepth(22);
    this.finialGlint = this.add.circle(flagX - 3, objGroundY - 261, 3.5, 0xffffff, 0.95).setDepth(23);

    // Mario Red Flag (width 64, height 38)
    this.flagRedM = this.add.image(flagX + 32, objGroundY - 225, 'flag-red-m').setOrigin(0.5).setDisplaySize(64, 38).setDepth(20);
    // Royal VJ Flag from flag.png (exact matching rectangle: width 64, height 38)
    this.flagPurpleVJ = this.add.image(flagX + 32, objGroundY - 35, 'flag-purple-vj-hd').setOrigin(0.5).setDisplaySize(64, 38).setAlpha(0).setDepth(20);
    if (isL5) {
      const fs = this.add.graphics({ x: flagX, y: objGroundY - 258 });
      fs.fillStyle(0xffffff, 0.95); fs.fillCircle(0, -6, 12); fs.fillCircle(-8, 0, 8); fs.fillCircle(8, 0, 8); fs.setDepth(24);
    }
    this.flagZone = this.flagGroup.create(flagX, objGroundY - 240, null);
    this.flagZone.setSize(40, 60).setVisible(!1).refreshBody();

    this.castleDoorX = flagX + 330;
    const castleY = (isDesert || isL5) ? objGroundY : (objGroundY + 11);
    this.castleClosedImg = this.add.image(this.castleDoorX, castleY, 'castle-closed').setOrigin(0.5, 1).setDisplaySize(480, 365).setDepth(19);
    this.castleOpenImg = this.add.image(this.castleDoorX, castleY, 'castle-open').setOrigin(0.5, 1).setDisplaySize(480, 365).setDepth(20).setAlpha(0);
    if (isL4) { this.castleClosedImg.setTint(0x161820); this.castleOpenImg.setTint(0x161820); }
    this.castleRoofGroup.create(this.castleDoorX, castleY - 206, null).setSize(340, 20).setVisible(!1).refreshBody();

    const pSpawnX = isL7 ? 150 : 120;
    const pSpawnY = isL7 ? 300 : this.SURFACE_Y;

    // Beginning Cave Structure (levels 1-6; excluded in Level 7 Sky Fortress)
    if (!isL7 && this.textures.exists('cave-raw')) {
      const caveX = 0;
      const caveGroundY = objGroundY;
      this.caveSprite = this.add.image(caveX, caveGroundY, 'cave-raw').setOrigin(0, 1).setDisplaySize(170, 240).setDepth(35);
      if (isL4) this.caveSprite.setTint(0x1a1c24);
      else if (isL5) this.caveSprite.setTint(0xcce6ff);
    }

    // Player spawn: In Level 7, player starts directly on the floating cloud at pSpawnX. In other levels, emerges from cave.
    const pStartX = isL7 ? pSpawnX : 45;
    this.player = this.physics.add.sprite(pStartX, pSpawnY, 'player', 0).setOrigin(0.5, 1).setDepth(isL7 ? 30 : 25).setScale(0.80);
    this.player.setSize(36, 90).setOffset(52, 50).setMaxVelocity(380, 900).setDragX(950);
    this.player.facing = 1;
    if (isL4) this.player.setTint(0x181a20);

    if (isL7) {
      this.isEmergingFromCave = !1;
      this.player.play('idle');
      this.time.delayedCall(250, () => {
        if (this.player?.active) this.showRealmStartBanner();
      });
    } else {
      // Initial cinematic entrance: player emerges from behind cave, walks forward, stands & level begins
      this.isEmergingFromCave = !0;
      this.player.play('walk', !0);
      this.tweens.add({
        targets: this.player,
        x: pSpawnX,
        duration: 1100,
        ease: 'Linear',
        onComplete: () => {
          if (!this.player?.active) return;
          this.player.setDepth(30);
          this.player.play('idle');
          this.player.setVelocityX(0);
          this.time.delayedCall(250, () => {
            this.isEmergingFromCave = !1;
            this.showRealmStartBanner();
          });
        }
      });
    }

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
    this.keys = this.input.keyboard.addKeys('W,A,S,D,ENTER,P,R,X,SPACE,ESC,F,F10,G');

    // Global 'F' key toggle fullscreen in PlayScene
    this.input.keyboard.on('keydown-F', () => {
      const isFS = () => !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
      if (!isFS()) {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    });

    const W = this.scale.width;

    // 1. Aesthetic 3D Ruby Hearts
    this.heartGfxArr = [];
    for (let i = 0; i < 5; i++) {
      const hg = this.add.graphics().setScrollFactor(0).setDepth(101);
      this.heartGfxArr.push(hg);
    }
    this.updateHearts();

    // 2. Top 5 Collected Gems (pehle jaisa - clean 24x24, alpha 0.28, no glow, no bounce)
    this.gemHUDIcons = Array.from({ length: 5 }, (_, i) => this.add.image((W / 2 - 80) + i * 36, 26, `diamond-${i}`).setDisplaySize(24, 24).setAlpha(0.28).setScrollFactor(0).setDepth(100));

    // 2b. Royal Level Badge (top-left aligned with hearts)
    const lvlBadge = this.add.graphics().setScrollFactor(0).setDepth(100);
    lvlBadge.fillStyle(0x090c18, 0.75);
    lvlBadge.fillRoundedRect(144, 6, 96, 24, 12);
    lvlBadge.lineStyle(1.5, 0xffd700, 0.85);
    lvlBadge.strokeRoundedRect(144, 6, 96, 24, 12);
    this.add.text(192, 18, `👑 LVL ${this.currentLevel}`, { fontFamily: 'Cinzel, Arial Black', fontSize: '11px', color: '#ffd700' }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    // 3. Score Glassmorphic Badge (sleek royal number formatting without padding zeros)
    const scoreBadge = this.add.graphics().setScrollFactor(0).setDepth(100);
    scoreBadge.fillStyle(0x090c18, 0.75);
    scoreBadge.fillRoundedRect(16, 38, 136, 24, 12);
    scoreBadge.lineStyle(1.5, 0xffd700, 0.85);
    scoreBadge.strokeRoundedRect(16, 38, 136, 24, 12);
    this.scoreText = this.add.text(26, 43, `✦ ${this.score.toLocaleString()}`, { fontFamily: 'Cinzel, Arial Black', fontSize: '13px', color: '#ffea77' }).setScrollFactor(0).setDepth(101);

    // 4. Sleek Ammunition Display (Bow + dynamic number only)
    this.ninjaText = this.add.text(26, 68, '', { fontFamily: "'Arial Black', 'Segoe UI Emoji', sans-serif", fontSize: '13px', color: '#ffd700', stroke: '#000', strokeThickness: 3 }).setScrollFactor(0).setDepth(101);

    // 5. Time Display Glassmorphic Badge
    const timeBadge = this.add.graphics().setScrollFactor(0).setDepth(100);
    timeBadge.fillStyle(0x090c18, 0.75);
    timeBadge.fillRoundedRect(W - 95, 6, 80, 24, 12);
    timeBadge.lineStyle(1.5, 0xffd700, 0.85);
    timeBadge.strokeRoundedRect(W - 95, 6, 80, 24, 12);
    this.timeText = this.add.text(W - 55, 18, `⏳ ${this.timeLeft}`, { fontFamily: 'Cinzel, Arial Black', fontSize: '12px', color: '#ffea77' }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    // 6. Settings Gear Icon Button (Only icon, no outer ring)
    const gearIco = this.add.text(W - 35, 52, '⚙️', { fontSize: '22px' }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
    const gearZone = this.add.zone(W - 35, 52, 36, 36).setScrollFactor(0).setDepth(103).setInteractive({ useHandCursor: !0 });
    gearZone.on('pointerover', () => { gearIco.setScale(1.18); });
    gearZone.on('pointerout', () => { gearIco.setScale(1.0); });
    gearZone.on('pointerdown', () => this.togglePauseMenu());

    // 7. Royal Journey Bar (Ornate gold-embossed track + glowing cyan/gold energy fill + micro-runner icon)
    const barW = 300, barH = 12, barX = W / 2 - barW / 2, barY = 56;
    this.journeyBarX = barX; this.journeyBarW = barW; this.journeyBarY = barY;
    this.journeyTrackGfx = this.add.graphics().setScrollFactor(0).setDepth(100);
    // Draw ornate track background & gold emboss
    this.journeyTrackGfx.fillStyle(0x060810, 0.85);
    this.journeyTrackGfx.fillRoundedRect(barX, barY - barH / 2, barW, barH, 6);
    this.journeyTrackGfx.lineStyle(2, 0xd4af37, 0.9);
    this.journeyTrackGfx.strokeRoundedRect(barX, barY - barH / 2, barW, barH, 6);
    // Decorative end caps (gold diamonds)
    this.journeyTrackGfx.fillStyle(0xffea00, 1);
    this.journeyTrackGfx.fillTriangle(barX - 4, barY, barX, barY - 5, barX, barY + 5);
    this.journeyTrackGfx.fillTriangle(barX + barW + 4, barY, barX + barW, barY - 5, barX + barW, barY + 5);

    this.journeyFillGfx = this.add.graphics().setScrollFactor(0).setDepth(101);

    // Tiny animated micro-player running icon
    this.journeyRunner = this.add.sprite(barX, barY - 4, 'player').setScale(0.18).setOrigin(0.5, 0.6).setScrollFactor(0).setDepth(103);
    this.journeyRunner.play('walk', !0);
    this.journeyRunnerGlow = this.add.circle(barX, barY, 8, 0x00f0ff, 0.55).setScrollFactor(0).setDepth(102);

    this.drawJourneyBar(0);

    this.setupErgonomicTouchControls();

    this.timerEvent = this.time.addEvent({
      delay: 1000, loop: !0, callback: () => {
        if (this.gameOverFlag || this.isPaused || this.isAutoWalking) return;
        this.timeLeft--; this.timeText.setText(String(this.timeLeft));
        if (this.timeLeft <= 0) this.triggerGameOver();
      }
    });

    synth.stopMenuBGM();
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
      if (!this.isPauseToggling && (Phaser.Input.Keyboard.JustDown(this.keys.R) || Phaser.Input.Keyboard.JustDown(this.keys.ESC) || Phaser.Input.Keyboard.JustDown(this.keys.P)) && this.isPaused) {
        this.togglePauseMenu();
      }
      return;
    }
    if (!this.player || !this.player.body) return;

    if (Phaser.Input.Keyboard.JustDown(this.keys.F10) || Phaser.Input.Keyboard.JustDown(this.keys.G)) {
      this.gemsCollected = 5; this.collectedTypes = new Set([0, 1, 2, 3, 4]);
      if (this.gemHUDIcons) this.gemHUDIcons.forEach(ic => { if (ic?.active) ic.setAlpha(1.0); });
      const targetStairX = this.currentLevel === 7 ? 8850 : (this.currentLevel === 6 ? 8450 : (this.currentLevel === 5 ? 7350 : (this.currentLevel === 4 ? 5850 : (this.currentLevel === 3 ? 5450 : (this.currentLevel === 2 ? 4050 : 3020)))));
      this.player.setPosition(targetStairX + 108, this.SURFACE_Y - 200).setVelocity(0, 0); synth.powerup();
    }
    this.skyBg.tilePositionX = Math.floor(this.cameras.main.scrollX * 0.15);
    if (this.groundTransitionBg) this.groundTransitionBg.tilePositionX = Math.floor(this.cameras.main.scrollX * 0.15);
    this.gemGroup.children.iterate(d => { if (d?.active && d.glowAura && d.glowAura.active) d.glowAura.setPosition(d.x, d.y); });
    const pPct = Math.max(0, Math.min(1, (this.player.x - 120) / (this.castleDoorX - 120)));
    this.drawJourneyBar(pPct);

    if (this.currentLevel === 7) {
      this.whiteCloudGroup.children.iterate(wc => {
        if (!wc?.active || wc.isFading) return;
        const touching = this.player.body.touching.down && (Math.abs(this.player.x - wc.x) < 105) && (this.player.body.bottom <= wc.y + 15);
        if (touching) {
          wc.standingTime += 16.6;
          if (wc.standingTime >= 100) {
            wc.isFading = !0;
            this.tweens.add({
              targets: wc, alpha: 0, duration: 150,
              onComplete: () => {
                wc.body.enable = !1;
                this.time.delayedCall(600, () => {
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
        // Smooth sine wave gliding in vertical axis
        if (eg.baseY !== undefined) {
          eg.phase = (eg.phase || 0) + 0.04;
          eg.y = eg.baseY + Math.sin(eg.phase) * 14;
        }
        // Smooth horizontal turning transition with easing deceleration/acceleration
        if (eg.x >= eg.homeX + eg.range) {
          eg.targetVx = -eg.speed;
        } else if (eg.x <= eg.homeX - eg.range) {
          eg.targetVx = eg.speed;
        }
        const curVx = eg.body.velocity.x;
        const newVx = Phaser.Math.Linear(curVx, eg.targetVx, 0.08);
        eg.setVelocityX(newVx);
        if (newVx > 25) eg.setFlipX(!1);
        else if (newVx < -25) eg.setFlipX(!0);
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
            const pBall = this.waterBulletGroup.create(we.x - 65, we.y - 180, 'water-projectile').setScale(1.1);
            pBall.body.setSize(22, 22);
            pBall.setDepth(21);
            const ang = Phaser.Math.Angle.Between(pBall.x, pBall.y, this.player.x, this.player.y - 25);
            pBall.setVelocity(Math.cos(ang) * 210, Math.sin(ang) * 210);
            pBall.setRotation(ang);
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

    if (this.currentLevel === 2 && this.rainGfx && this.rainDrops) {
      this.rainGfx.clear();
      const slantX = 14; // high-pressure slanted angle
      this.rainDrops.forEach(d => {
        d.y += d.spd * (1 / 60);
        d.x -= slantX * 1.5;
        if (d.y > (this.SURFACE_Y - 5)) {
          d.y = Phaser.Math.Between(-80, -10);
          d.x = Phaser.Math.Between(0, 1060);
        }
        if (d.x < -80) d.x = 1040;
        this.rainGfx.lineStyle(d.thick, 0x90caf9, d.alpha);
        const endY = Math.min(this.SURFACE_Y, d.y + d.len);
        if (endY > d.y) {
          this.rainGfx.lineBetween(d.x, d.y, d.x - (slantX * ((endY - d.y) / d.len)), endY);
        }
      });

      // 2 times Jordar Full-Screen Pure White Thunder Flash & Flicker
      const now = this.time.now;
      if (this.fullWhiteThunderOverlay && this.megaThunderIndex < this.megaThunderTimes.length && now >= this.megaThunderTimes[this.megaThunderIndex]) {
        this.megaThunderIndex++;
        if (typeof synth !== 'undefined' && synth.thunder) synth.thunder();

        // Hyper-realistic blinding double/triple white flash flicker (safe sequential tweens)
        this.tweens.add({
          targets: this.fullWhiteThunderOverlay,
          alpha: 0.95,
          duration: 45,
          onComplete: () => {
            this.tweens.add({
              targets: this.fullWhiteThunderOverlay,
              alpha: 0.15,
              duration: 35,
              onComplete: () => {
                this.tweens.add({
                  targets: this.fullWhiteThunderOverlay,
                  alpha: 0.98,
                  duration: 55,
                  onComplete: () => {
                    this.tweens.add({
                      targets: this.fullWhiteThunderOverlay,
                      alpha: 0.35,
                      duration: 40,
                      onComplete: () => {
                        this.tweens.add({
                          targets: this.fullWhiteThunderOverlay,
                          alpha: 0.85,
                          duration: 50,
                          onComplete: () => {
                            this.tweens.add({
                              targets: this.fullWhiteThunderOverlay,
                              alpha: 0.0,
                              duration: 450,
                              ease: 'Quad.easeOut'
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }

      // Realistic Thunderstorm Lightning Flash & Fat Jagged Bolt
      if (this.lightningOverlay && now >= this.nextLightningTime) {
        this.nextLightningTime = now + Phaser.Math.Between(7000, 13000);
        // Play realistic thunder rumble sound
        if (typeof synth !== 'undefined' && synth.thunder) synth.thunder();

        // Screen ambient illumination
        this.tweens.add({
          targets: this.lightningOverlay,
          alpha: 0.65,
          duration: 60,
          yoyo: true,
          repeat: 2,
          ease: 'Sine.easeOut'
        });

        // Generate procedural fat realistic lightning bolts across the screen
        const renderLightningBolt = () => {
          if (!this.lightningBoltGfx) return;
          this.lightningBoltGfx.clear();
          const startX = Phaser.Math.Between(150, 800);
          const segments = [];
          let curX = startX, curY = 0;
          const targetY = 540;
          const steps = Phaser.Math.Between(9, 13);
          const dy = targetY / steps;

          // Main trunk
          for (let s = 0; s < steps; s++) {
            const nextY = (s === steps - 1) ? targetY : curY + dy;
            const nextX = curX + Phaser.Math.Between(-55, 55);
            segments.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });
            // 35% chance to spawn side branch
            if (s > 1 && s < steps - 2 && Math.random() < 0.5) {
              let bX = curX, bY = curY;
              const bSteps = Phaser.Math.Between(3, 5);
              const branchDir = Math.random() < 0.5 ? -1 : 1;
              for (let b = 0; b < bSteps; b++) {
                const bNextX = bX + Phaser.Math.Between(20, 50) * branchDir;
                const bNextY = bY + Phaser.Math.Between(15, 35);
                segments.push({ x1: bX, y1: bY, x2: bNextX, y2: bNextY, branch: true });
                bX = bNextX; bY = bNextY;
              }
            }
            curX = nextX; curY = nextY;
          }

          // Layer 1: Outer cyan-blue glow (fat)
          segments.forEach(seg => {
            this.lightningBoltGfx.lineStyle(seg.branch ? 8 : 14, 0x4fc3f7, 0.45);
            this.lightningBoltGfx.lineBetween(seg.x1, seg.y1, seg.x2, seg.y2);
          });
          // Layer 2: Mid bright cyan-white
          segments.forEach(seg => {
            this.lightningBoltGfx.lineStyle(seg.branch ? 4 : 8, 0xb3e5fc, 0.85);
            this.lightningBoltGfx.lineBetween(seg.x1, seg.y1, seg.x2, seg.y2);
          });
          // Layer 3: Intense pure white core
          segments.forEach(seg => {
            this.lightningBoltGfx.lineStyle(seg.branch ? 2 : 4, 0xffffff, 1.0);
            this.lightningBoltGfx.lineBetween(seg.x1, seg.y1, seg.x2, seg.y2);
          });
        };

        // Render strike 1
        renderLightningBolt();
        this.time.delayedCall(70, () => {
          if (this.lightningBoltGfx) this.lightningBoltGfx.clear();
        });
        // Secondary flicker strike
        this.time.delayedCall(120, () => {
          renderLightningBolt();
        });
        this.time.delayedCall(220, () => {
          if (this.lightningBoltGfx) this.lightningBoltGfx.clear();
        });
      }
    }

    if (this.isAutoWalking || this.isEmergingFromCave) {
      if (this.walkingInsideCastle) { this.player.play('walk', !0); return; }
      if (this.player.body.blocked.down || this.player.body.touching.down) {
        this.cameras.main.setBounds(0, 0, this.LEVEL_WIDTH + 1000, 540);
        if (this.player.x < this.castleDoorX) {
          this.player.setVelocityX(120); this.player.facing = 1; this.player.setFlipX(!1).play('walk', !0);
        } else if (!this.standingAtGate) {
          this.standingAtGate = !0; this.player.setVelocityX(0).play('win-pose').setFlipX(!0);
          this.startFlagSwapCeremony(() => {
            synth.doorOpen();
            // Smoothly open castle gate: zero jitter, rock-solid dimensions, zero background bleed
            this.tweens.add({
              targets: this.castleOpenImg,
              alpha: 1,
              duration: 400,
              ease: 'Sine.easeInOut',
              onComplete: () => {
                this.walkingInsideCastle = !0; this.player.body.setAllowGravity(!1); this.player.body.setVelocity(0, 0);
                this.player.setFlipX(!1).setDepth(21).play('walk', !0);
                this.tweens.add({
                  targets: this.player, x: this.castleDoorX + 15, scaleX: 0.25, scaleY: 0.25, alpha: 0, duration: 1500, ease: 'Linear',
                  onComplete: () => {
                    this.player.setVelocityX(0); synth.doorClose();
                    // Smoothly close castle gate over 100% opaque closed base
                    this.tweens.add({
                      targets: this.castleOpenImg,
                      alpha: 0,
                      duration: 400,
                      ease: 'Sine.easeInOut',
                      onComplete: () => {
                        this.isAutoWalking = !1; this.gameOverFlag = !0; this.physics.pause();
                        this.time.delayedCall(700, () => { if (this.currentLevel < 7) this.showLevelClearOverlay(); else this.showGameCompletedOverlay(); });
                      }
                    });
                  }
                });
              }
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
        window.touchInput.shoot = !1; this.shootArrow(isDuckActive); this.isShooting = !0;
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
    if (!this.isPauseToggling && (Phaser.Input.Keyboard.JustDown(this.keys.P) || Phaser.Input.Keyboard.JustDown(this.keys.ESC))) {
      this.togglePauseMenu();
    }
  }

  handleLotusBounce(p, lotus) {
    if (p.body.velocity.y >= -100) {
      p.setVelocityY(-1080); synth.superJump();
      this.tweens.add({ targets: lotus, scaleY: 0.5, duration: 100, yoyo: !0, repeat: 1 });
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

  showRealmStartBanner() {
    const W = this.scale.width, H = this.scale.height;
    const bannerContainer = this.add.container(W / 2, H / 2 - 50).setScrollFactor(0).setDepth(200).setAlpha(0).setScale(0.8);

    const bW = 340, bH = 52;
    const bgGfx = this.add.graphics();

    // Drop Shadow
    bgGfx.fillStyle(0x000000, 0.7);
    bgGfx.fillRoundedRect(-bW / 2, -bH / 2 + 3, bW, bH, 16);

    // Obsidian/Royal Velvet fill
    bgGfx.fillStyle(0x0a0515, 0.94);
    bgGfx.fillRoundedRect(-bW / 2, -bH / 2, bW, bH, 16);

    // Double Gold Filigree Borders
    bgGfx.lineStyle(2.5, 0xffd700, 0.95);
    bgGfx.strokeRoundedRect(-bW / 2, -bH / 2, bW, bH, 16);
    bgGfx.lineStyle(1.2, 0xffea70, 0.45);
    bgGfx.strokeRoundedRect(-bW / 2 + 4, -bH / 2 + 4, bW - 8, bH - 8, 12);

    // Corner Ornate Fleur Diamonds
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => {
      bgGfx.fillStyle(0xffd700, 1);
      bgGfx.fillCircle(dx * (bW / 2 - 10), dy * (bH / 2 - 10), 3);
    });

    // Main Royal Text: Only REALM X START
    const realmText = this.add.text(0, 0, `✦ REALM ${this.currentLevel} START ✦`, {
      fontFamily: "Cinzel, 'Arial Black', serif",
      fontSize: '22px',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    bannerContainer.add([bgGfx, realmText]);

    // Play subtle checkpoint chime sound
    try { synth.checkpointSound(); } catch (e) {}

    // Smooth Entrance: Pop in with slight scale bounce
    this.tweens.add({
      targets: bannerContainer,
      alpha: 1,
      scale: 1.0,
      duration: 350,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1200, () => {
          this.tweens.add({
            targets: bannerContainer,
            alpha: 0,
            y: bannerContainer.y - 30,
            scale: 0.95,
            duration: 500,
            ease: 'Sine.easeIn',
            onComplete: () => {
              bannerContainer.destroy();
            }
          });
        });
      }
    });
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
    const now = this.time.now;
    g.children.iterate(e => {
      if (!e?.active || e.isShell || e.isDead) return;
      const canTurn = !e.nextTurn || now >= e.nextTurn;
      if (canTurn) {
        if (e.body.blocked.right || e.x >= e.homeX + e.range) {
          e.dir = -1; e.setFlipX(!0); e.nextTurn = now + 350;
        } else if (e.body.blocked.left || e.x <= e.homeX - e.range) {
          e.dir = 1; e.setFlipX(!1); e.nextTurn = now + 350;
        }
      }
      e.setVelocityX(e.dir * e.speed);
      if (e.enemyKind === 'bear' && e.anims && !e.anims.isPlaying && this.anims.exists('bear-walk')) {
        e.play('bear-walk', !0);
      }
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
    this.tweens.killTweensOf(gem);
    if (gem.glowAura) { this.tweens.killTweensOf(gem.glowAura); gem.glowAura.destroy(); gem.glowAura = null; }
    gem.destroy(); synth.gemSound(); this.addScore(300);
    if (!this.collectedTypes.has(gt)) {
      this.collectedTypes.add(gt); this.gemsCollected++;
      if (this.gemHUDIcons?.[gt] && this.gemHUDIcons[gt].active) this.gemHUDIcons[gt].setAlpha(1.0);
    }
    const fl = this.add.circle(p.x, p.y - 30, 42, 0x00ffff, 0.85);
    this.tweens.add({ targets: fl, scale: 1.8, alpha: 0, duration: 320, onComplete: () => fl.destroy() });
  }

  collectPowerup(p, item) {
    item.destroy(); synth.powerup(); this.addScore(500);
    if (this.currentLevel >= 2) { this.hasArrows = !0; this.starAmmo = 10; this.ninjaText.setText('🏹 ×10'); }
    const a = this.add.circle(p.x, p.y - 45, 55, 0x00ffff, 0.75);
    this.tweens.add({ targets: a, scale: 2.2, alpha: 0, duration: 450, onComplete: () => a.destroy() });
  }

  collectHeart(p, heart) {
    heart.destroy();
    synth.powerup();
    this.addScore(1000);
    if (this.lives < 5) { this.lives++; this.updateHearts(); }
    // Clean subtle +1 LIFE indicator floating upward, ZERO glow
    const lifeTxt = this.add.text(p.x, p.y - 45, '+1 LIFE', {
      fontFamily: "'Arial Black', sans-serif",
      fontSize: '13px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(200);
    this.tweens.add({
      targets: lifeTxt,
      y: lifeTxt.y - 28,
      alpha: 0,
      duration: 600,
      ease: 'Power1',
      onComplete: () => lifeTxt.destroy()
    });
  }

  shootArrow(isDucking = !1) {
    this.starAmmo--; synth.shurikenThrow();
    if (this.starAmmo > 0) this.ninjaText.setText(`🏹 ×${this.starAmmo}`);
    else { this.hasArrows = !1; this.ninjaText.setText('🏹 ×0'); this.time.delayedCall(1500, () => this.ninjaText.setText('')); }
    const dir = this.player.facing;
    const arrowY = isDucking ? (this.player.y - 28) : (this.player.y - 50);
    const arrow = this.arrowGroup.create(this.player.x + (dir === 1 ? 30 : -30), arrowY, 'item-arrow');
    arrow.setSize(60, 20).setVelocityX(dir * 450).setFlipX(dir === -1);
    this.time.delayedCall(1200, () => { if (arrow?.active) arrow.destroy(); });
  }

  arrowHitEnemy(arrow, enemy) {
    if (!arrow.active || !enemy?.active || enemy.isDead) return;
    arrow.destroy(); synth.stomp();
    if (enemy.enemyKind === 'bear' || enemy.enemyKind === 'camel') {
      enemy.hp -= 1;
      if (enemy.hp > 0) {
        enemy.setTint(0xff5555); this.addScore(enemy.enemyKind === 'bear' ? 150 : 100);
        this.time.delayedCall(200, () => {
          if (enemy?.active) {
            if (this.currentLevel === 4) enemy.setTint(0x181a20);
            else enemy.clearTint();
          }
        }); return;
      }
    }
    this.addScore(enemy.enemyKind === 'camel' ? 400 : 200); enemy.isDead = !0; enemy.setVelocity(0, 0);
    const sp = this.add.circle(enemy.x, enemy.y - 20, 28, 0x00ffff, 0.9);
    this.tweens.add({ targets: sp, scale: 1.8, alpha: 0, duration: 220, onComplete: () => sp.destroy() });
    if (enemy.enemyKind === 'bear') {
      this.tweens.add({ targets: enemy, scaleY: 0.1, y: enemy.y + 35, alpha: 0, duration: 300, onComplete: () => enemy.destroy() });
    } else if (enemy.enemyKind === 'camel') {
      if (enemy.anims) { try { enemy.play('camel-dizzy'); } catch(e) {} }
      this.time.delayedCall(500, () => {
        if (!enemy?.active) return;
        this.tweens.add({
          targets: enemy, alpha: 0, scaleY: 0.15, y: enemy.y + 20, duration: 250, ease: 'Power2',
          onComplete: () => { if (enemy?.active) enemy.destroy(); }
        });
      });
    } else if (enemy.enemyKind === 'turtle') {
      if (enemy.anims) { try { enemy.play('turtle-shell'); } catch(e) {} }
      this.time.delayedCall(500, () => {
        if (!enemy?.active) return;
        this.tweens.add({
          targets: enemy, alpha: 0, scaleY: 0.15, y: enemy.y + 15, duration: 250, ease: 'Power2',
          onComplete: () => { if (enemy?.active) enemy.destroy(); }
        });
      });
    } else if (enemy.enemyKind === 'mushroom') {
      if (enemy.anims) { try { enemy.play('mushroom-dead'); } catch(e) {} }
      this.time.delayedCall(500, () => {
        if (!enemy?.active) return;
        this.tweens.add({
          targets: enemy, alpha: 0, scaleY: 0.15, y: enemy.y + 15, duration: 250, ease: 'Power2',
          onComplete: () => { if (enemy?.active) enemy.destroy(); }
        });
      });
    } else {
      enemy.destroy();
    }
  }

  collectStar(p, star) { star.destroy(); synth.coin(); this.addScore(50); }

  handleEnemyCollision(player, enemy) {
    if (this.invulnerable || !enemy.active || enemy.isDead || this.isAutoWalking) return;
    const isFalling = player.body.velocity.y >= -50 || (player.body.newVelocity && player.body.newVelocity.y >= -50);
    const isAbove = (player.body.bottom <= enemy.body.top + 34) || (player.body.bottom - player.body.velocity.y * 0.04 <= enemy.body.top + 34);
    if (isFalling && isAbove) {
      if (enemy.enemyKind === 'bear') {
        this.invulnerable = !0; this.time.delayedCall(100, () => { if (!this.isHurt) this.invulnerable = !1; });
        player.body.setVelocityY(-450); this.damagePlayer(); return;
      }
      this.invulnerable = !0; this.time.delayedCall(100, () => { if (!this.isHurt) this.invulnerable = !1; });
      player.body.setVelocityY(-460);
      synth.stomp();

      if (enemy.enemyKind === 'camel') {
        if (this.currentLevel === 4) {
          enemy.jumpHp = (enemy.jumpHp !== undefined ? enemy.jumpHp : 2) - 1;
          if (enemy.jumpHp > 0) {
            enemy.setTint(0xff5555); this.addScore(150);
            this.time.delayedCall(250, () => {
              if (enemy?.active) {
                if (this.currentLevel === 4) enemy.setTint(0x181a20);
                else enemy.clearTint();
              }
            });
            return;
          }
        }
        enemy.isDead = !0; enemy.setVelocity(0, 0);
        if (enemy.anims) { try { enemy.play('camel-dizzy'); } catch(e) {} }
        this.addScore(400);
        this.time.delayedCall(500, () => {
          if (!enemy?.active) return;
          this.tweens.add({
            targets: enemy, alpha: 0, scaleY: 0.15, y: enemy.y + 20, duration: 250, ease: 'Power2',
            onComplete: () => { if (enemy?.active) enemy.destroy(); }
          });
        });
        return;
      } else if (enemy.enemyKind === 'turtle') {
        enemy.isDead = !0; enemy.setVelocity(0, 0);
        if (enemy.anims) { try { enemy.play('turtle-shell'); } catch(e) {} }
        this.addScore(200);
        this.time.delayedCall(500, () => {
          if (!enemy?.active) return;
          this.tweens.add({
            targets: enemy, alpha: 0, scaleY: 0.15, y: enemy.y + 15, duration: 250, ease: 'Power2',
            onComplete: () => { if (enemy?.active) enemy.destroy(); }
          });
        });
        return;
      } else {
        enemy.isDead = !0; enemy.setVelocity(0, 0);
        if (enemy.enemyKind === 'mushroom' && enemy.anims) {
          try { enemy.play('mushroom-dead'); } catch(e) {}
        }
        this.addScore(100);
        this.time.delayedCall(500, () => {
          if (!enemy?.active) return;
          this.tweens.add({
            targets: enemy, alpha: 0, scaleY: 0.15, y: enemy.y + 15, duration: 250, ease: 'Power2',
            onComplete: () => { if (enemy?.active) enemy.destroy(); }
          });
        });
        return;
      }
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

  updateHearts() {
    if (!this.heartGfxArr) return;
    for (let i = 0; i < 5; i++) {
      const hg = this.heartGfxArr[i];
      if (!hg) continue;
      hg.clear();
      const hx = 24 + i * 25, hy = 18;
      const active = i < this.lives;
      if (active) {
        // Crisp 3D royal ruby heart body (NO outer background glow)
        hg.fillStyle(0x88001b, 1);
        hg.fillCircle(hx - 4.5, hy - 1, 5.5);
        hg.fillCircle(hx + 4.5, hy - 1, 5.5);
        hg.fillTriangle(hx - 9.5, hy, hx + 9.5, hy, hx, hy + 10.5);
        // Rich ruby inner fill
        hg.fillStyle(0xd60036, 1);
        hg.fillCircle(hx - 4.5, hy - 1, 4.5);
        hg.fillCircle(hx + 4.5, hy - 1, 4.5);
        hg.fillTriangle(hx - 8.5, hy, hx + 8.5, hy, hx, hy + 9.5);
        // Clean gloss highlights
        hg.fillStyle(0xff7799, 0.85);
        hg.fillCircle(hx - 4.5, hy - 2.5, 2.2);
        hg.fillStyle(0xffffff, 0.95);
        hg.fillCircle(hx - 4.2, hy - 2.8, 1.2);
      } else {
        // Dark metallic hollow heart
        hg.fillStyle(0x180b18, 0.6);
        hg.fillCircle(hx - 4.5, hy - 1, 5);
        hg.fillCircle(hx + 4.5, hy - 1, 5);
        hg.fillTriangle(hx - 9, hy, hx + 9, hy, hx, hy + 9.5);
        hg.lineStyle(1.5, 0x442233, 0.6);
        hg.strokeCircle(hx - 4.5, hy - 1, 5);
        hg.strokeCircle(hx + 4.5, hy - 1, 5);
      }
    }
  }

  addScore(v) {
    this.score += v;
    if (this.scoreText) this.scoreText.setText(`✦ ${this.score.toLocaleString()}`);
  }

  drawJourneyBar(pct) {
    if (!this.journeyFillGfx) return;
    if (isNaN(pct) || pct === null || pct === undefined) pct = 0;
    const clamped = Math.max(0, Math.min(1, pct));
    const fillW = clamped * this.journeyBarW;
    this.journeyFillGfx.clear();
    if (fillW > 3) {
      this.journeyFillGfx.fillStyle(0x00f0ff, 0.95);
      this.journeyFillGfx.fillRoundedRect(this.journeyBarX, this.journeyBarY - 5, fillW, 10, 5);
      // Glowing gold-white top energy highlight
      this.journeyFillGfx.fillStyle(0xffffff, 0.7);
      this.journeyFillGfx.fillRect(this.journeyBarX + 2, this.journeyBarY - 4, Math.max(0, fillW - 4), 2);
    }
    const rx = Math.min(this.journeyBarX + this.journeyBarW, this.journeyBarX + fillW + 8);
    if (this.journeyRunner && this.journeyRunner.active) this.journeyRunner.x = rx;
    if (this.journeyRunnerGlow && this.journeyRunnerGlow.active) this.journeyRunnerGlow.x = rx;
  }

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
    const flagBaseY = this.flagSprite ? this.flagSprite.y : this.SURFACE_Y;
    const ballY = flagBaseY - 258;

    // Light turns into a bright, vivid Red-Yellow combination glow effect when burning/igniting
    if (this.finialLight && this.finialLight.active) {
      this.finialLight.setFillStyle(0xff2200, 1.0); // Bright red base
      // Animate alternating / pulsing red-yellow combination
      this.tweens.add({
        targets: this.finialLight,
        alpha: { from: 1.0, to: 0.85 },
        duration: 250,
        yoyo: true,
        repeat: -1,
        onYoyo: () => {
          if (this.finialLight && this.finialLight.active) {
            this.finialLight.setFillStyle(this.finialLight.fillColor === 0xff2200 ? 0xffea00 : 0xff2200, 1.0);
          }
        }
      });
    }
    if (this.finialGlint && this.finialGlint.active) {
      this.finialGlint.setFillStyle(0xfffa88, 1.0);
    }

    // In Level 4: When the bulb lights up, brightly illuminate the Castle, Flag, and Player with celebratory light
    if (this.currentLevel === 4) {
      if (this.castleClosedImg) this.castleClosedImg.clearTint();
      if (this.castleOpenImg) this.castleOpenImg.clearTint();
      if (this.flagSprite) this.flagSprite.clearTint();
      if (this.flagRedM) this.flagRedM.clearTint();
      if (this.flagPurpleVJ) this.flagPurpleVJ.clearTint();
      if (this.player) this.player.clearTint();

      // Radiant warm golden illumination shining from the burning finial light across castle plaza
      const plazaX = (this.flagSprite ? this.flagSprite.x : this.player.x) + 160;
      const radiantLight = this.add.graphics().setDepth(18);
      radiantLight.fillStyle(0xffea70, 0.28);
      radiantLight.fillCircle(plazaX, ballY + 120, 420);
      radiantLight.fillStyle(0xffffff, 0.18);
      radiantLight.fillCircle(plazaX, ballY + 100, 260);

      this.tweens.add({
        targets: radiantLight,
        alpha: { from: 0, to: 1 },
        duration: 600,
        ease: 'Cubic.easeOut'
      });

      if (this.nightOverlay) {
        this.tweens.add({
          targets: this.nightOverlay,
          alpha: 0,
          duration: 700,
          ease: 'Cubic.easeOut'
        });
      }
    }

    this.isAutoWalking = !0; this.standingAtGate = !1; this.timerEvent.remove(); synth.win(); this.flagZone.destroy();
  }

  startFlagSwapCeremony(done) {
    const flagBaseY = this.flagSprite ? this.flagSprite.y : this.SURFACE_Y;
    // Mario flag descends smoothly with zero wave/flutter
    this.tweens.add({
      targets: this.flagRedM,
      y: flagBaseY - 25,
      duration: 1400,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.flagRedM.setAlpha(0);
        this.flagPurpleVJ.setAlpha(1);

        // VJ flag ascends smoothly straight up to the top with ZERO wave animation
        this.tweens.add({
          targets: this.flagPurpleVJ,
          y: flagBaseY - 225,
          duration: 1600,
          ease: 'Sine.easeOut',
          onComplete: () => {
            // Once reached the top, stays steady without any wave animation
            if (done) done();
          }
        });
      }
    });
  }

  togglePauseMenu() {
    if (this.gameOverFlag || this.isAutoWalking || this.isPauseToggling) return;
    this.isPauseToggling = !0;
    setTimeout(() => { this.isPauseToggling = !1; }, 220);

    // Reset touch controls immediately so character doesn't slide
    if (window.touchInput) {
      window.touchInput.left = !1; window.touchInput.right = !1;
      window.touchInput.jump = !1; window.touchInput.shoot = !1;
    }

    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.physics.pause();
      if (this.player && this.player.body) this.player.body.setVelocity(0, 0);
      synth.stopBGM();
      this.openPauseModal();
    } else {
      this.physics.resume();
      synth.stopMenuBGM();
    synth.startBGM(this, this.currentLevel);
      this.closePauseModal();
    }
  }

  openPauseModal() {
    if (this.pauseModalElements && this.pauseModalElements.length > 0) return;
    const W = this.scale.width, H = this.scale.height; this.pauseModalElements = [];
    const levelName = (window.LEVEL_DATA && window.LEVEL_DATA[this.currentLevel]?.name) ? window.LEVEL_DATA[this.currentLevel].name : `LEVEL ${this.currentLevel}`;

    // Dark cinematic backdrop
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.82).setScrollFactor(0).setDepth(600);

    // Glassmorphic AAA Modal Panel
    const cardW = 500, cardH = 430, cardX = W / 2, cardY = H / 2;
    const cardGfx = this.add.graphics().setScrollFactor(0).setDepth(601);
    cardGfx.fillStyle(0x0c0818, 0.95);
    cardGfx.fillRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 16);
    cardGfx.lineStyle(2, 0xffd700, 0.9);
    cardGfx.strokeRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 16);
    cardGfx.lineStyle(1, 0x5d3a9b, 0.5);
    cardGfx.strokeRoundedRect(cardX - cardW / 2 + 6, cardY - cardH / 2 + 6, cardW - 12, cardH - 12, 12);

    // Header & Level Name
    const title = this.add.text(cardX, cardY - 165, '✦ GAME PAUSED ✦', { fontFamily: 'Arial Black', fontSize: '20px', color: '#ffd700', stroke: '#3a1e00', strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0).setDepth(602);
    const subTitle = this.add.text(cardX, cardY - 140, `LEVEL ${this.currentLevel}: ${levelName.toUpperCase()}`, { fontFamily: 'Arial Black', fontSize: '12px', color: '#c4a6ff', letterSpacing: 1 }).setOrigin(0.5).setScrollFactor(0).setDepth(602);

    // Divider line
    const divGfx = this.add.graphics().setScrollFactor(0).setDepth(602);
    divGfx.lineStyle(1, 0xffd700, 0.4);
    divGfx.lineBetween(cardX - 180, cardY - 122, cardX + 180, cardY - 122);
    divGfx.fillStyle(0xffea00, 1);
    divGfx.fillCircle(cardX, cardY - 122, 3);

    // Section 1: Player Speed Control
    const spdTitle = this.add.text(cardX - 210, cardY - 95, 'PLAYER SPEED:', { fontFamily: 'Arial Black', fontSize: '12px', color: '#ffd700' }).setScrollFactor(0).setDepth(602);
    const speeds = [
      { name: 'NORMAL', val: 240, x: cardX - 30 },
      { name: 'FAST', val: 300, x: cardX + 65 },
      { name: 'TURBO', val: 360, x: cardX + 160 }
    ];

    const speedUIItems = [];
    const updateSpeedUI = () => {
      speedUIItems.forEach(item => {
        const isSel = window.gameSettings.playerSpeed === item.speed.val;
        item.btnGfx.clear();
        item.btnGfx.fillStyle(isSel ? 0xd4af37 : 0x1f192e, isSel ? 0.95 : 0.7);
        item.btnGfx.fillRoundedRect(item.speed.x - 42, cardY - 105, 84, 26, 6);
        item.btnGfx.lineStyle(1.5, isSel ? 0xffea00 : 0x5d3a9b, 0.8);
        item.btnGfx.strokeRoundedRect(item.speed.x - 42, cardY - 105, 84, 26, 6);
        item.txt.setColor(isSel ? '#000000' : '#ffffff');
      });
    };

    speeds.forEach(s => {
      const segBtn = this.add.graphics().setScrollFactor(0).setDepth(602);
      const segTxt = this.add.text(s.x, cardY - 92, s.name, {
        fontFamily: 'Arial Black', fontSize: '11px', color: '#ffffff'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(603);

      const segZone = this.add.zone(s.x, cardY - 92, 84, 26).setScrollFactor(0).setDepth(604).setInteractive({ useHandCursor: !0 });
      segZone.on('pointerdown', () => {
        window.gameSettings.playerSpeed = s.val;
        synth.beep(520, 0.05, 'triangle', 0.1);
        updateSpeedUI();
      });
      speedUIItems.push({ speed: s, btnGfx: segBtn, txt: segTxt });
      this.pauseModalElements.push(segBtn, segTxt, segZone);
    });
    updateSpeedUI();

    // Section 2: Audio Toggles (In-place visual update)
    const audTitle = this.add.text(cardX - 210, cardY - 45, 'AUDIO TOGGLE:', { fontFamily: 'Arial Black', fontSize: '12px', color: '#ffd700' }).setScrollFactor(0).setDepth(602);

    const makeToggleSwitch = (x, y, label, getVal, onToggle) => {
      const tgGfx = this.add.graphics().setScrollFactor(0).setDepth(602);
      const txt = this.add.text(x, y, '', {
        fontFamily: 'Arial Black', fontSize: '11px', color: '#ffffff'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(603);

      const drawToggle = () => {
        const isEnabled = getVal();
        tgGfx.clear();
        tgGfx.fillStyle(isEnabled ? 0x1b5e20 : 0x3e1515, 0.9);
        tgGfx.fillRoundedRect(x - 55, y - 14, 110, 28, 14);
        tgGfx.lineStyle(1.5, isEnabled ? 0x4caf50 : 0xd32f2f, 0.85);
        tgGfx.strokeRoundedRect(x - 55, y - 14, 110, 28, 14);
        const knobX = isEnabled ? x + 38 : x - 38;
        tgGfx.fillStyle(0xffffff, 1);
        tgGfx.fillCircle(knobX, y, 10);
        tgGfx.lineStyle(1.5, 0x000000, 0.3);
        tgGfx.strokeCircle(knobX, y, 10);
        txt.setPosition(isEnabled ? x - 10 : x + 10, y);
        txt.setText(`${label}: ${isEnabled ? 'ON' : 'OFF'}`);
      };
      drawToggle();

      const z = this.add.zone(x, y, 115, 30).setScrollFactor(0).setDepth(604).setInteractive({ useHandCursor: !0 });
      z.on('pointerdown', () => {
        onToggle();
        synth.beep(getVal() ? 580 : 350, 0.05, 'sine', 0.1);
        drawToggle();
      });
      this.pauseModalElements.push(tgGfx, txt, z);
    };

    makeToggleSwitch(cardX + 25, cardY - 45, 'BGM', () => window.gameSettings.bgmEnabled, () => {
      window.gameSettings.bgmEnabled = !window.gameSettings.bgmEnabled;
    });
    makeToggleSwitch(cardX + 155, cardY - 45, 'SFX', () => window.gameSettings.sfxEnabled, () => {
      window.gameSettings.sfxEnabled = !window.gameSettings.sfxEnabled;
    });

    // Section 3: Action Buttons (Resume, Fullscreen, Restart, Main Menu)
    const isFS = () => !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    const actions = [
      { text: '▶ RESUME', color: 0x7a2fbf, hoverCol: 0x9c44ea, y: cardY + 15, cb: () => this.togglePauseMenu() },
      { text: isFS() ? '🗗 EXIT FULLSCREEN' : '⛶ FULLSCREEN', color: 0x1565c0, hoverCol: 0x1976d2, y: cardY + 58, isFsBtn: true, cb: (bTxt) => {
        if (!isFS()) {
          const el = document.documentElement;
          if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
          else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
          if (bTxt) bTxt.setText('🗗 EXIT FULLSCREEN');
        } else {
          if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
          if (bTxt) bTxt.setText('⛶ FULLSCREEN');
        }
      } },
      { text: '🔄 RESTART LEVEL', color: 0xd84315, hoverCol: 0xf4511e, y: cardY + 101, cb: () => { this.closePauseModal(); this.scene.restart({ currentLevel: this.currentLevel, currentScore: this.score, currentLives: 5 }); } },
      { text: '🏰 MAIN MENU', color: 0x263238, hoverCol: 0x37474f, y: cardY + 144, cb: () => { this.closePauseModal(); this.scene.start('TitleScene'); } }
    ];

    actions.forEach(act => {
      const btnW = 320, btnH = 38;
      const bGfx = this.add.graphics().setScrollFactor(0).setDepth(602);
      const drawBtn = (bgCol, scale = 1) => {
        bGfx.clear();
        bGfx.fillStyle(bgCol, 0.9);
        bGfx.fillRoundedRect(cardX - (btnW * scale) / 2, act.y - (btnH * scale) / 2, btnW * scale, btnH * scale, 8);
        bGfx.lineStyle(1.5, 0xffd700, 0.85);
        bGfx.strokeRoundedRect(cardX - (btnW * scale) / 2, act.y - (btnH * scale) / 2, btnW * scale, btnH * scale, 8);
      };
      drawBtn(act.color);

      const bTxt = this.add.text(cardX, act.y, act.text, { fontFamily: 'Arial Black', fontSize: '14px', color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(603);
      const bZone = this.add.zone(cardX, act.y, btnW, btnH).setScrollFactor(0).setDepth(604).setInteractive({ useHandCursor: !0 });
      bZone.on('pointerover', () => { drawBtn(act.hoverCol, 1.02); bTxt.setScale(1.02); });
      bZone.on('pointerout', () => { drawBtn(act.color, 1.0); bTxt.setScale(1.0); });
      bZone.on('pointerdown', () => act.cb(bTxt));
      this.pauseModalElements.push(bGfx, bTxt, bZone);
    });

    this.pauseModalElements.push(overlay, cardGfx, title, subTitle, divGfx, spdTitle, audTitle);
  }

  closePauseModal() {
    this.isPaused = !1;
    this.physics.resume();
    if (window.touchInput) {
      window.touchInput.left = !1; window.touchInput.right = !1;
      window.touchInput.jump = !1; window.touchInput.shoot = !1;
    }
    if (this.pauseModalElements) {
      this.pauseModalElements.forEach(el => { if (el?.destroy) el.destroy(); });
      this.pauseModalElements = null;
    }
  }

  showLevelClearOverlay() {
    this.canProceedLevel = !0; const W = this.scale.width, H = this.scale.height, bx = W * 0.28;
    const cardW = 430, cardH = 320;
    const cardGfx = this.add.graphics().setScrollFactor(0).setDepth(600);
    cardGfx.fillStyle(0x0a0515, 0.96);
    cardGfx.fillRoundedRect(bx - cardW / 2, H / 2 - cardH / 2, cardW, cardH, 16);
    cardGfx.lineStyle(2.8, 0xffd700, 0.98);
    cardGfx.strokeRoundedRect(bx - cardW / 2, H / 2 - cardH / 2, cardW, cardH, 16);
    cardGfx.lineStyle(1.2, 0xffea70, 0.45);
    cardGfx.strokeRoundedRect(bx - cardW / 2 + 5, H / 2 - cardH / 2 + 5, cardW - 10, cardH - 10, 12);

    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => {
      cardGfx.fillStyle(0xffd700, 1);
      cardGfx.fillCircle(bx + dx * (cardW / 2 - 12), H / 2 + dy * (cardH / 2 - 12), 3.5);
    });

    this.add.text(bx, H / 2 - 95, '✦ CONGRATULATIONS! ✦', {
      fontFamily: "Cinzel, 'Arial Black', serif", fontSize: '20px', color: '#ffd700', fontStyle: 'bold', stroke: '#000', strokeThickness: 5
    }).setOrigin(0.5).setScrollFactor(0).setDepth(601);

    this.add.text(bx, H / 2 - 65, `👑 REALM ${this.currentLevel} CONQUERED 👑`, {
      fontFamily: "'Arial Black', sans-serif", fontSize: '13px', color: '#ffea70', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(601);

    this.add.text(bx, H / 2 - 20, `✦ SCORE: ${this.score.toLocaleString()} ✦\n💎 5 SACRED GEMS HARNESSED`, {
      fontFamily: "Cinzel, 'Arial Black', serif", fontSize: '14px', color: '#ffffff', align: 'center', stroke: '#000', strokeThickness: 3, lineSpacing: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(601);

    const btnW = 300, btnH = 46, btnY = H / 2 + 70;
    const nGfx = this.add.graphics().setScrollFactor(0).setDepth(601);
    const drawN = (col, s = 1) => {
      nGfx.clear();
      nGfx.fillStyle(0x000000, 0.6);
      nGfx.fillRoundedRect(bx - (btnW * s) / 2, btnY - (btnH * s) / 2 + 3, btnW * s, btnH * s, 10);
      nGfx.fillStyle(col, 1);
      nGfx.fillRoundedRect(bx - (btnW * s) / 2, btnY - (btnH * s) / 2, btnW * s, btnH * s, 10);
      nGfx.fillStyle(0xffffff, 0.2);
      nGfx.fillRoundedRect(bx - (btnW * s) / 2 + 2, btnY - (btnH * s) / 2 + 2, btnW * s - 4, Math.floor((btnH * s) / 2) - 2, 8);
      nGfx.lineStyle(1.8, 0xffd700, 1);
      nGfx.strokeRoundedRect(bx - (btnW * s) / 2, btnY - (btnH * s) / 2, btnW * s, btnH * s, 10);
    };
    drawN(0x8a6208);
    const nTxt = this.add.text(bx, btnY, `START REALM ${this.currentLevel + 1} ⏩\n(TAP OR ENTER)`, { fontFamily: 'Arial Black', fontSize: '13px', color: '#ffffff', align: 'center', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0).setDepth(602);
    const nZone = this.add.zone(bx, btnY, btnW, btnH).setScrollFactor(0).setDepth(603).setInteractive({ useHandCursor: !0 });
    nZone.on('pointerover', () => { drawN(0xb38600, 1.03); nTxt.setScale(1.03); });
    nZone.on('pointerout', () => { drawN(0x8a6208, 1.0); nTxt.setScale(1.0); });
    nZone.on('pointerdown', () => { synth.getCtx(); this.physics.resume(); this.scene.restart({ currentLevel: this.currentLevel + 1, currentScore: this.score, currentLives: this.lives }); });
  }

  showGameCompletedOverlay() {
    this.canProceedLevel = !1; const W = this.scale.width, H = this.scale.height, bx = W * 0.28;
    const cardW = 440, cardH = 350;
    const cardGfx = this.add.graphics().setScrollFactor(0).setDepth(600);
    cardGfx.fillStyle(0x0a0515, 0.96);
    cardGfx.fillRoundedRect(bx - cardW / 2, H / 2 - cardH / 2, cardW, cardH, 16);
    cardGfx.lineStyle(2.8, 0xffd700, 0.98);
    cardGfx.strokeRoundedRect(bx - cardW / 2, H / 2 - cardH / 2, cardW, cardH, 16);
    cardGfx.lineStyle(1.2, 0xffea70, 0.5);
    cardGfx.strokeRoundedRect(bx - cardW / 2 + 5, H / 2 - cardH / 2 + 5, cardW - 10, cardH - 10, 12);

    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => {
      cardGfx.fillStyle(0xffd700, 1);
      cardGfx.fillCircle(bx + dx * (cardW / 2 - 12), H / 2 + dy * (cardH / 2 - 12), 3.5);
    });

    this.add.text(bx, H / 2 - 110, '✦ CONGRATULATIONS! ✦', { fontFamily: "Cinzel, 'Arial Black', serif", fontSize: '20px', color: '#ffd700', fontStyle: 'bold', stroke: '#000', strokeThickness: 5, align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(601);
    this.add.text(bx, H / 2 - 80, '👑 ALL 7 REALMS CONQUERED 👑', { fontFamily: "'Arial Black', sans-serif", fontSize: '13px', color: '#ffea70', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0).setDepth(601);
    this.add.text(bx, H / 2 - 25, `FINAL SCORE: ${this.score.toLocaleString()}\nCREATED BY VAIBHAV JAIN`, { fontFamily: 'Georgia, serif', fontSize: '15px', color: '#ffffff', align: 'center', stroke: '#000', strokeThickness: 3, lineSpacing: 4 }).setOrigin(0.5).setScrollFactor(0).setDepth(601);

    const btnW = 300, btnH = 46, btnY = H / 2 + 80;
    const pGfx = this.add.graphics().setScrollFactor(0).setDepth(601);
    const drawP = (col, s = 1) => {
      pGfx.clear();
      pGfx.fillStyle(0x000000, 0.6);
      pGfx.fillRoundedRect(bx - (btnW * s) / 2, btnY - (btnH * s) / 2 + 3, btnW * s, btnH * s, 10);
      pGfx.fillStyle(col, 1);
      pGfx.fillRoundedRect(bx - (btnW * s) / 2, btnY - (btnH * s) / 2, btnW * s, btnH * s, 10);
      pGfx.fillStyle(0xffffff, 0.2);
      pGfx.fillRoundedRect(bx - (btnW * s) / 2 + 2, btnY - (btnH * s) / 2 + 2, btnW * s - 4, Math.floor((btnH * s) / 2) - 2, 8);
      pGfx.lineStyle(1.8, 0xffd700, 1);
      pGfx.strokeRoundedRect(bx - (btnW * s) / 2, btnY - (btnH * s) / 2, btnW * s, btnH * s, 10);
    };
    drawP(0x8a6208);
    const pTxt = this.add.text(bx, btnY, 'MAIN MENU\n(TAP OR ENTER)', { fontFamily: 'Arial Black', fontSize: '13px', color: '#ffffff', align: 'center', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0).setDepth(602);
    const pZone = this.add.zone(bx, btnY, btnW, btnH).setScrollFactor(0).setDepth(603).setInteractive({ useHandCursor: !0 });
    pZone.on('pointerover', () => { drawP(0xb38600, 1.03); pTxt.setScale(1.03); });
    pZone.on('pointerout', () => { drawP(0x8a6208, 1.0); pTxt.setScale(1.0); });
    pZone.on('pointerdown', () => { this.physics.resume(); synth.stopBGM(); this.scene.start('TitleScene'); });
  }

  triggerGameOver() {
    if (this.gameOverFlag) return;
    this.gameOverFlag = !0; this.physics.pause(); this.timerEvent.remove(); synth.stopBGM(); synth.gameOver();
    const W = this.scale.width, H = this.scale.height;

    // Cinematic vignette backdrop
    const vignette = this.add.graphics().setScrollFactor(0).setDepth(600);
    vignette.fillStyle(0x000000, 0.88);
    vignette.fillRect(0, 0, W, H);
    // Dark crimson vignette shadow
    vignette.fillStyle(0x3a0008, 0.4);
    vignette.fillCircle(W / 2, H / 2, 380);

    // Glassmorphic Modal Panel
    const cardW = 460, cardH = 340, cardX = W / 2, cardY = H / 2;
    const cardGfx = this.add.graphics().setScrollFactor(0).setDepth(601);
    cardGfx.fillStyle(0x0d0714, 0.96);
    cardGfx.fillRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 16);
    cardGfx.lineStyle(2.5, 0xff3b30, 0.9);
    cardGfx.strokeRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 16);
    cardGfx.lineStyle(1, 0xffd700, 0.4);
    cardGfx.strokeRoundedRect(cardX - cardW / 2 + 5, cardY - cardH / 2 + 5, cardW - 10, cardH - 10, 12);

    // Regal Header
    this.add.text(cardX, cardY - 115, '✦ DEFEAT ✦', { fontFamily: 'Arial Black', fontSize: '28px', color: '#ff3b30', stroke: '#000', strokeThickness: 5 }).setOrigin(0.5).setScrollFactor(0).setDepth(602);
    this.add.text(cardX, cardY - 75, `SCORE EARNED: ${this.score.toLocaleString()}`, { fontFamily: 'Cinzel, Arial Black', fontSize: '15px', color: '#ffd700' }).setOrigin(0.5).setScrollFactor(0).setDepth(602);
    this.add.text(cardX, cardY - 45, 'The kingdom still awaits your courage.', { fontFamily: 'Georgia, serif', fontSize: '13px', color: '#cccccc', fontStyle: 'italic' }).setOrigin(0.5).setScrollFactor(0).setDepth(602);

    // Interactive Buttons
    const buttons = [
      { text: '🔄 RETRY (CHECKPOINT)', col: 0x7a2fbf, hCol: 0x9c44ea, y: cardY + 20, cb: () => { this.physics.resume(); this.scene.restart({ currentLevel: this.currentLevel, currentScore: this.score, currentLives: 5 }); } },
      { text: '🏰 MAIN MENU', col: 0x263238, hCol: 0x37474f, y: cardY + 75, cb: () => { this.physics.resume(); synth.stopBGM(); this.scene.start('TitleScene'); } }
    ];

    buttons.forEach(btn => {
      const bW = 300, bH = 40;
      const bg = this.add.graphics().setScrollFactor(0).setDepth(602);
      const draw = (c, s = 1) => {
        bg.clear();
        bg.fillStyle(c, 0.95);
        bg.fillRoundedRect(cardX - (bW * s) / 2, btn.y - (bH * s) / 2, bW * s, bH * s, 8);
        bg.lineStyle(1.5, 0xffd700, 0.85);
        bg.strokeRoundedRect(cardX - (bW * s) / 2, btn.y - (bH * s) / 2, bW * s, btnH * s, 8);
      };
      draw(btn.col);
      const txt = this.add.text(cardX, btn.y, btn.text, { fontFamily: 'Arial Black', fontSize: '14px', color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(603);
      const zone = this.add.zone(cardX, btn.y, bW, bH).setScrollFactor(0).setDepth(604).setInteractive({ useHandCursor: !0 });
      zone.on('pointerover', () => { draw(btn.hCol, 1.03); txt.setScale(1.03); });
      zone.on('pointerout', () => { draw(btn.col, 1.0); txt.setScale(1.0); });
      zone.on('pointerdown', () => btn.cb());
    });
  }
}
