/* =====================================================================
   MY MARIO (VJ WORLD) — game.js (Native Multi-Pointer Engine & Indian Levels)
   ===================================================================== */
window.touchInput = { left: !1, right: !1, up: !1, down: !1, jump: !1, shoot: !1 };
window.gameSettings = { playerSpeed: 240, bgmEnabled: !0, sfxEnabled: !0 };

document.addEventListener('pointerdown', () => {
  if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}, { once: !0 });

class RetroSynth {
  constructor() { this.ctx = null; this.bgmTimer = null; this.bgmOn = !1; this.activeScene = null; this.customMusicInstance = null; }
  getCtx() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }
  beep(f, d, t = 'square', v = 0.15, dl = 0) {
    if (!window.gameSettings.sfxEnabled) return;
    try {
      const c = this.getCtx(), o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + dl;
      o.type = t; o.frequency.value = f; g.gain.value = v; o.connect(g); g.connect(c.destination);
      g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + d); o.start(t0); o.stop(t0 + d + 0.02);
    } catch (e) {}
  }
  jump() { this.beep(520, 0.12, 'square', 0.14); this.beep(760, 0.1, 'square', 0.1, 0.06); }
  superJump() { [440, 660, 880, 1100].forEach((f, i) => this.beep(f, 0.14, 'triangle', 0.18, i * 0.04)); }
  stomp() { this.beep(150, 0.1, 'square', 0.2); }
  coin() { this.beep(988, 0.08, 'square', 0.14); this.beep(1318, 0.14, 'square', 0.14, 0.07); }
  gemSound() { [784, 988, 1175, 1568].forEach((f, i) => this.beep(f, 0.1, 'triangle', 0.16, i * 0.05)); }
  checkpointSound() { [587, 740, 880, 1175].forEach((f, i) => this.beep(f, 0.12, 'sine', 0.2, i * 0.06)); }
  hurt() { this.beep(180, 0.2, 'sawtooth', 0.18); }
  qblock() { this.beep(660, 0.08, 'square', 0.15); this.beep(880, 0.1, 'square', 0.15, 0.05); }
  doorOpen() { this.beep(220, 0.15, 'sawtooth', 0.15); this.beep(180, 0.25, 'triangle', 0.18, 0.1); }
  doorClose() { this.beep(180, 0.18, 'sawtooth', 0.2); this.beep(120, 0.22, 'square', 0.22, 0.08); }
  powerup() { [330, 392, 659, 523, 587, 784].forEach((f, i) => this.beep(f, 0.12, 'square', 0.15, i * 0.08)); }
  shurikenThrow() {
    if (!window.gameSettings.sfxEnabled) return;
    try {
      const c = this.getCtx(), o = c.createOscillator(), g = c.createGain();
      o.type = 'triangle'; o.frequency.setValueAtTime(1200, c.currentTime); o.frequency.exponentialRampToValueAtTime(300, c.currentTime + 0.12);
      g.gain.setValueAtTime(0.18, c.currentTime); g.gain.linearRampToValueAtTime(0.01, c.currentTime + 0.12);
      o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.13);
    } catch (e) {}
  }
  waterSplash() {
    if (!window.gameSettings.sfxEnabled) return;
    try {
      const c = this.getCtx(), o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(450, c.currentTime); o.frequency.exponentialRampToValueAtTime(120, c.currentTime + 0.2);
      g.gain.setValueAtTime(0.25, c.currentTime); g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.2);
      o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.22);
    } catch (e) {}
  }
  win() { [523, 659, 784, 1047].forEach((f, i) => this.beep(f, 0.2, 'square', 0.16, i * 0.14)); }
  gameOver() { [400, 320, 240, 160].forEach((f, i) => this.beep(f, 0.22, 'sawtooth', 0.15, i * 0.15)); }
  startBGM(scene, lvl = 1) {
    this.stopBGM(); if (!window.gameSettings.bgmEnabled) return;
    this.bgmOn = !0; this.activeScene = scene;
    if (this.activeScene?.cache.audio.exists('custom-bgm')) {
      this.customMusicInstance = this.activeScene.sound.add('custom-bgm', { loop: true, volume: 0.5 });
      this.customMusicInstance.play();
    } else {
      const nm = {
        1: [523, 587, 659, 523, 659, 784, 659, 587],
        2: [440, 493, 523, 587, 523, 493, 440, 392],
        3: [392, 440, 493, 587, 523, 440, 392, 330],
        4: [330, 349, 392, 440, 392, 349, 330, 294],
        5: [294, 330, 370, 440, 370, 330, 294, 261],
        6: [440, 523, 659, 587, 659, 784, 880, 784],
        7: [587, 659, 784, 880, 784, 659, 784, 880]
      };
      const notes = nm[lvl] || nm[1];
      let i = 0; const isFast = (lvl === 2 || lvl >= 4);
      const step = () => {
        if (!this.bgmOn || !window.gameSettings.bgmEnabled) return;
        try {
          const c = this.getCtx(), o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime;
          o.type = (lvl === 6 || lvl === 7) ? 'sine' : (isFast ? 'sawtooth' : 'triangle'); o.frequency.value = notes[i % notes.length];
          g.gain.value = 0.04; o.connect(g); g.connect(c.destination);
          g.gain.setValueAtTime(0.04, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.14); o.start(t0); o.stop(t0 + 0.16);
        } catch (e) {}
        i++; this.bgmTimer = setTimeout(step, isFast ? 200 : 250);
      };
      step();
    }
  }
  stopBGM() { this.bgmOn = !1; if (this.bgmTimer) clearTimeout(this.bgmTimer); if (this.customMusicInstance) { this.customMusicInstance.stop(); this.customMusicInstance = null; } }
}
const synth = new RetroSynth();

class PreBootScene extends Phaser.Scene {
  constructor() { super('PreBootScene'); }
  preload() {
    [['p-stand-vic', 'player stand victory.png'], ['p-run', 'player run.png'], ['p-jump-fall', 'player jump fall.png'], ['p-crawl-dead', 'player crawl dead.png'], ['p-shoot', 'player shoot.png']].forEach(([k, f]) => this.load.image(k, `assets/${f}`));
  }
  create() {
    const outW = 140, outH = 140;
    if (this.textures.exists('player')) this.textures.remove('player');
    const normCan = this.textures.createCanvas('player', outW * 8, outH), pCtx = normCan.getContext();
    pCtx.imageSmoothingEnabled = !0; pCtx.imageSmoothingQuality = 'high';
    const drawPFrame = (k, sf, si, di) => {
      if (!this.textures.exists(k)) return;
      const raw = this.textures.get(k).getSourceImage(); if (!raw?.width) return;
      const fW = Math.floor(raw.width / sf), cH = raw.height, tCan = document.createElement('canvas');
      tCan.width = fW; tCan.height = cH; const tctx = tCan.getContext('2d');
      tctx.drawImage(raw, si * fW, 0, fW, cH, 0, 0, fW, cH);
      try {
        const d = tctx.getImageData(0, 0, fW, cH).data; let minX = fW, maxX = 0, minY = cH, maxY = 0;
        for (let y = 0; y < cH; y += 3) for (let x = 0; x < fW; x += 3) {
          if (d[(y * fW + x) * 4 + 3] > 20) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
        }
        if (minX > maxX) { minX = 0; maxX = fW - 1; minY = 0; maxY = cH - 1; }
        const cropW = maxX - minX + 1, cropH = maxY - minY + 1, sc = Math.min((outH - 4) / cropH, (outW - 4) / cropW);
        const tw = Math.round(cropW * sc), th = Math.round(cropH * sc);
        pCtx.drawImage(tCan, minX, minY, cropW, cropH, di * outW + Math.round((outW - tw) / 2), outH - th, tw, th);
      } catch (e) {}
    };
    [['p-stand-vic', 2, 0, 0], ['p-run', 2, 0, 1], ['p-run', 2, 1, 2], ['p-jump-fall', 2, 0, 3], ['p-jump-fall', 2, 1, 4], ['p-crawl-dead', 2, 1, 5], ['p-stand-vic', 2, 1, 6], ['p-shoot', 1, 0, 7]].forEach(([k, sf, si, di]) => drawPFrame(k, sf, si, di));
    normCan.refresh(); const pTex = this.textures.get('player');
    for (let i = 0; i < 8; i++) pTex.add(i, 0, i * outW, 0, outW, outH);
    this.anims.create({ key: 'load-run', frames: [{ key: 'player', frame: 1 }, { key: 'player', frame: 2 }], frameRate: 12, repeat: -1 });
    this.scene.start('BootScene');
  }
}

class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  preload() {
    const W = this.scale.width, H = this.scale.height;
    this.add.rectangle(0, 0, W, H, 0x0f172a).setOrigin(0);
    this.add.text(W / 2, H / 2 - 40, 'LOADING WORLD...', { fontFamily: 'Arial Black', fontSize: '24px', color: '#ffcc00', stroke: '#7a2fbf', strokeThickness: 6 }).setOrigin(0.5);
    const pct = this.add.text(W / 2, H / 2 + 10, '0%', { fontFamily: 'Arial Black', fontSize: '18px', color: '#00ffff' }).setOrigin(0.5);
    this.load.on('progress', v => { pct.setText(Math.floor(v * 100) + '%'); });
    
    [
      ['tiles-raw', 'tiles.png'], ['ground-deco', 'ground.png'], ['bg-sky', 'bg-sky.jpg'], ['castle-raw', 'castle.png'],
      ['diamonds-raw', 'diamonds.png'], ['desert-bg', 'desert.png'], ['desert-tiles-raw', 'desert tiles.png'],
      ['camel-raw', 'camel.png'], ['bear-raw', 'bear.png'], ['snow-elements-raw', 'snow element.png'],
      ['snow-tiles-raw', 'snow tiles.png'], ['snow-bg', 'snow.png'],
      ['water-bg', 'water bg.png'], ['water-tiles-raw', 'water tiles.png'], ['water-hurdles-raw', 'water hurdles trunk.png'],
      ['crocodile-raw', 'crocodile.png'], ['water-enemy-raw', 'water enemy.png'],
      ['air-bg', 'air bg.png'], ['air-cloud-tiles-raw', 'air cloud tiles.png'], ['air-eagle-raw', 'air eagle.png'], ['air-thunder-raw', 'air thunder.png']
    ].forEach(([k, p]) => this.load.image(k, `assets/${p}`));

    this.load.spritesheet('turtle', 'assets/turtle.png', { frameWidth: 112, frameHeight: 140 });
    this.load.spritesheet('mushroom', 'assets/mushroom.png', { frameWidth: 110, frameHeight: 110 });
    this.load.video('story-video', 'assets/story.mp4', 'loadeddata', !1, !1);
    this.load.audio('custom-bgm', 'assets/bgm.mp3');
  }
  create() {
    ['turtle', 'mushroom', 'ground-deco'].forEach(k => { if (this.textures.exists(k)) this.textures.get(k).setFilter(Phaser.Textures.FilterMode.NEAREST); });
    
    if (this.textures.exists('castle-raw') && this.textures.get('castle-raw').getSourceImage().width) {
      const rawC = this.textures.get('castle-raw').getSourceImage(), cW = rawC.width, cH = rawC.height, tempCCan = document.createElement('canvas');
      tempCCan.width = cW; tempCCan.height = cH; const tempCCtx = tempCCan.getContext('2d'); tempCCtx.drawImage(rawC, 0, 0);
      const cImgData = tempCCtx.getImageData(0, 0, cW, cH), cData = cImgData.data; let cMinY = cH, cMaxY = 0;
      for (let y = 0; y < cH; y++) for (let x = 0; x < cW; x++) {
        const idx = (y * cW + x) * 4;
        if (cData[idx] > 240 && cData[idx + 1] > 240 && cData[idx + 2] > 240) cData[idx + 3] = 0;
        else if (cData[idx + 3] > 15) { if (y < cMinY) cMinY = y; if (y > cMaxY) cMaxY = y; }
      }
      if (cMinY > cMaxY) { cMinY = 0; cMaxY = Math.max(0, cH - 1); }
      const cropCH = cMaxY - cMinY + 1, halfW = Math.floor(cW / 2); tempCCtx.putImageData(cImgData, 0, 0);
      [['castle-closed', 0], ['castle-open', halfW]].forEach(([k, sx]) => {
        if (this.textures.exists(k)) this.textures.remove(k);
        const can = this.textures.createCanvas(k, halfW, cropCH);
        if (can) { const ctx = can.getContext(); ctx.imageSmoothingEnabled = !0; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(tempCCan, sx, cMinY, halfW, cropCH, 0, 0, halfW, cropCH); can.refresh(); }
      });
    }

    if (this.textures.exists('diamonds-raw') && this.textures.get('diamonds-raw').getSourceImage().width) {
      const rawD = this.textures.get('diamonds-raw').getSourceImage(), dW = rawD.width, dH = rawD.height, pPieceW = Math.floor(dW / 5), dCan = document.createElement('canvas');
      dCan.width = dW; dCan.height = dH; const dCtx = dCan.getContext('2d'); dCtx.drawImage(rawD, 0, 0);
      for (let i = 0; i < 5; i++) {
        const startX = i * pPieceW, pData = dCtx.getImageData(startX, 0, pPieceW, dH).data; let dMinX = pPieceW, dMaxX = 0, dMinY = dH, dMaxY = 0;
        for (let y = 0; y < dH; y++) for (let x = 0; x < pPieceW; x++) if (pData[(y * pPieceW + x) * 4 + 3] > 12) { if (x < dMinX) dMinX = x; if (x > dMaxX) dMaxX = x; if (y < dMinY) dMinY = y; if (y > dMaxY) dMaxY = y; }
        if (dMinX > dMaxX) { dMinX = 0; dMaxX = pPieceW; dMinY = 0; dMaxY = dH; }
        const cropW = Math.max(dMaxX - dMinX, 10), cropH = Math.max(dMaxY - dMinY, 10);
        if (this.textures.exists(`diamond-${i}`)) this.textures.remove(`diamond-${i}`);
        const can = this.textures.createCanvas(`diamond-${i}`, cropW, cropH);
        if (can) { const ctx = can.getContext(); ctx.imageSmoothingEnabled = !0; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(rawD, startX + dMinX, dMinY, cropW, cropH, 0, 0, cropW, cropH); can.refresh(); }
      }
    }

    if (this.textures.exists('tiles-raw') && this.textures.get('tiles-raw').getSourceImage().width) {
      const raw = this.textures.get('tiles-raw').getSourceImage(), W = raw.width, H = raw.height;
      [{ key: 'tile-grass', sx: 0.01 * W, sw: 0.22 * W }, { key: 'tile-trunk', sx: 0.26 * W, sw: 0.22 * W }, { key: 'tile-qblock', sx: 0.50 * W, sw: 0.23 * W }, { key: 'tile-star', sx: 0.76 * W, sw: 0.22 * W }].forEach(({ key, sx, sw }) => {
        if (this.textures.exists(key)) this.textures.remove(key);
        const can = this.textures.createCanvas(key, 54, 54);
        if (can) { const ctx = can.getContext(); ctx.imageSmoothingEnabled = !1; ctx.drawImage(raw, sx, 2, sw, H - 4, 0, 0, 54, 54); can.refresh(); this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST); }
      });
    }

    const procCrop = (src, map) => {
      if (!this.textures.exists(src)) return;
      const raw = this.textures.get(src).getSourceImage(); if (!raw?.width) return;
      const can = document.createElement('canvas'); can.width = raw.width; can.height = raw.height;
      const ctx = can.getContext('2d'); ctx.drawImage(raw, 0, 0);
      map.forEach(({ key, rx, ry, rw, rh, ow, oh, bottomAlign }) => {
        const fx = Math.floor(rx), fy = Math.floor(ry), fw = Math.floor(rw), fh = Math.floor(rh); if (fw <= 0 || fh <= 0) return;
        try {
          const d = ctx.getImageData(fx, fy, fw, fh).data; let minX = fw, maxX = 0, minY = fh, maxY = 0;
          for (let y = 0; y < fh; y += 2) for (let x = 0; x < fw; x += 2) {
            let i = (y * fw + x) * 4;
            if (d[i] > 248 && d[i + 1] > 248 && d[i + 2] > 248) d[i + 3] = 0;
            else if (d[i + 3] > 20) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
          }
          if (minX > maxX) { minX = 0; maxX = fw - 1; minY = 0; maxY = fh - 1; }
          const cw = maxX - minX + 1, ch = maxY - minY + 1;
          const tmp = document.createElement('canvas'); tmp.width = fw; tmp.height = fh;
          tmp.getContext('2d').putImageData(ctx.getImageData(fx, fy, fw, fh), 0, 0);
          if (this.textures.exists(key)) this.textures.remove(key);
          const out = this.textures.createCanvas(key, ow, oh); if (!out) return;
          const octx = out.getContext('2d');
          octx.imageSmoothingEnabled = !0; if (bottomAlign) octx.imageSmoothingQuality = 'high';
          if (bottomAlign) {
            const sc = Math.min(ow / cw, oh / ch), tw_s = Math.round(cw * sc), th_s = Math.round(ch * sc);
            octx.drawImage(tmp, minX, minY, cw, ch, (ow - tw_s) / 2, oh - th_s, tw_s, th_s);
          } else {
            octx.drawImage(tmp, minX, minY, cw, ch, 0, 0, ow, oh);
            this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
          }
          out.refresh();
        } catch (e) {}
      });
    };

    if (this.textures.exists('desert-tiles-raw')) {
      const tw = this.textures.get('desert-tiles-raw').getSourceImage().width, th = this.textures.get('desert-tiles-raw').getSourceImage().height;
      procCrop('desert-tiles-raw', [{ key: 'tile-sand-cube', rx: 0.02 * tw, ry: 0.04 * th, rw: 0.25 * tw, rh: 0.45 * th, ow: 54, oh: 54, bottomAlign: !1 }, { key: 'tile-sand-cuboid', rx: 0.26 * tw, ry: 0.04 * th, rw: 0.38 * tw, rh: 0.45 * th, ow: 108, oh: 54, bottomAlign: !1 }, { key: 'tile-cactus-trunk', rx: 0.65 * tw, ry: 0.06 * th, rw: 0.32 * tw, rh: 0.88 * th, ow: 85, oh: 140, bottomAlign: !1 }]);
    }
    if (this.textures.exists('snow-tiles-raw')) {
      const tw = this.textures.get('snow-tiles-raw').getSourceImage().width, th = this.textures.get('snow-tiles-raw').getSourceImage().height;
      procCrop('snow-tiles-raw', [{ key: 'tile-ice-cube', rx: 0, ry: 0, rw: 0.4 * tw, rh: th, ow: 54, oh: 54, bottomAlign: !1 }, { key: 'tile-ice-cuboid', rx: 0.4 * tw, ry: 0, rw: 0.6 * tw, rh: th, ow: 108, oh: 54, bottomAlign: !1 }]);
    }
    if (this.textures.exists('snow-elements-raw')) {
      const tw = this.textures.get('snow-elements-raw').getSourceImage().width, th = this.textures.get('snow-elements-raw').getSourceImage().height;
      procCrop('snow-elements-raw', [{ key: 'tree-snow', rx: 0, ry: 0, rw: 0.5 * tw, rh: th, ow: 95, oh: 150, bottomAlign: !0 }, { key: 'snowman', rx: 0.5 * tw, ry: 0, rw: 0.5 * tw, rh: th, ow: 70, oh: 110, bottomAlign: !0 }]);
    }

    if (this.textures.exists('water-tiles-raw')) {
      const tw = this.textures.get('water-tiles-raw').getSourceImage().width, th = this.textures.get('water-tiles-raw').getSourceImage().height;
      procCrop('water-tiles-raw', [
        { key: 'tile-lilypad', rx: 0, ry: 0, rw: 0.5 * tw, rh: th, ow: 280, oh: 85, bottomAlign: !0 },
        { key: 'item-lotus', rx: 0.5 * tw, ry: 0, rw: 0.48 * tw, rh: th, ow: 140, oh: 140, bottomAlign: !0 }
      ]);
    }

    if (this.textures.exists('water-hurdles-raw')) {
      const tw = this.textures.get('water-hurdles-raw').getSourceImage().width, th = this.textures.get('water-hurdles-raw').getSourceImage().height;
      procCrop('water-hurdles-raw', [
        { key: 'obstacle-chhatri', rx: 0, ry: 0, rw: 0.48 * tw, rh: th, ow: 110, oh: 250, bottomAlign: !0 },
        { key: 'fish-fountain', rx: 0.48 * tw, ry: 0, rw: 0.52 * tw, rh: th, ow: 140, oh: 280, bottomAlign: !0 }
      ]);
    }

    if (this.textures.exists('air-cloud-tiles-raw')) {
      const tw = this.textures.get('air-cloud-tiles-raw').getSourceImage().width, th = this.textures.get('air-cloud-tiles-raw').getSourceImage().height;
      procCrop('air-cloud-tiles-raw', [
        { key: 'tile-cloud-white', rx: 0, ry: 0, rw: 0.5 * tw, rh: th, ow: 340, oh: 90, bottomAlign: !0 },
        { key: 'tile-cloud-grey', rx: 0.5 * tw, ry: 0, rw: 0.5 * tw, rh: th, ow: 350, oh: 95, bottomAlign: !0 }
      ]);
    }

    const procSheet = (src, outKey, fc, ow, oh) => {
      if (!this.textures.exists(src)) return;
      const raw = this.textures.get(src).getSourceImage(); if (!raw?.width) return;
      const cW = raw.width, cH = raw.height, fw = Math.floor(cW / fc), tc = document.createElement('canvas');
      tc.width = cW; tc.height = cH; const tctx = tc.getContext('2d'); tctx.drawImage(raw, 0, 0);
      if (this.textures.exists(outKey)) this.textures.remove(outKey);
      const outCan = this.textures.createCanvas(outKey, ow * fc, oh); if (!outCan) return;
      const cs = outCan.getContext(); cs.imageSmoothingEnabled = !0; cs.imageSmoothingQuality = 'high';
      for (let i = 0; i < fc; i++) {
        try {
          const d = tctx.getImageData(i * fw, 0, fw, cH).data; let minX = fw, maxX = 0, minY = cH, maxY = 0;
          for (let y = 0; y < cH; y += 2) for (let x = 0; x < fw; x += 2) {
            const idx = (y * fw + x) * 4;
            if (d[idx] > 248 && d[idx + 1] > 248 && d[idx + 2] > 248) d[idx + 3] = 0;
            else if (d[idx + 3] > 20) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
          }
          if (minX > maxX) { minX = 0; maxX = fw - 1; minY = 0; maxY = cH - 1; }
          const cropW = maxX - minX + 1, cropH = maxY - minY + 1, fcan = document.createElement('canvas'); fcan.width = fw; fcan.height = cH; fcan.getContext('2d').putImageData(tctx.getImageData(i * fw, 0, fw, cH), 0, 0);
          const sc = Math.min((oh - 4) / cropH, (ow - 4) / cropW), tw_s = Math.round(cropW * sc), th_s = Math.round(cropH * sc);
          cs.drawImage(fcan, minX, minY, cropW, cropH, i * ow + Math.round((ow - tw_s) / 2), oh - th_s, tw_s, th_s);
        } catch (e) {}
      }
      outCan.refresh(); const tex = this.textures.get(outKey);
      for (let i = 0; i < fc; i++) tex.add(i, 0, i * ow, 0, ow, oh);
    };

    procSheet('camel-raw', 'camel-spritesheet', 3, 180, 120);
    procSheet('bear-raw', 'bear-spritesheet', 2, 160, 120);
    procSheet('crocodile-raw', 'croc-spritesheet', 2, 220, 110);
    procSheet('water-enemy-raw', 'water-enemy-spritesheet', 2, 160, 160);
    procSheet('air-eagle-raw', 'eagle-spritesheet', 3, 95, 70);

    if (this.textures.exists('air-thunder-raw')) {
      const raw = this.textures.get('air-thunder-raw').getSourceImage();
      if (raw?.width) {
        const W = raw.width, H = raw.height, halfH = Math.floor(H / 2);
        if (this.textures.exists('thunder-spritesheet')) this.textures.remove('thunder-spritesheet');
        const outCan = this.textures.createCanvas('thunder-spritesheet', 480, 120);
        if (outCan) {
          const octx = outCan.getContext(); octx.imageSmoothingEnabled = !0; octx.imageSmoothingQuality = 'high';
          octx.drawImage(raw, 0, 0, W, halfH, 0, 0, 240, 120);
          octx.drawImage(raw, 0, halfH, W, halfH, 240, 0, 240, 120);
          outCan.refresh();
          const tex = this.textures.get('thunder-spritesheet');
          tex.add(0, 0, 0, 0, 240, 120);
          tex.add(1, 0, 240, 0, 240, 120);
          this.anims.create({ key: 'thunder-flash', frames: [{ key: 'thunder-spritesheet', frame: 0 }, { key: 'thunder-spritesheet', frame: 1 }], frameRate: 4, repeat: -1 });
        }
      }
    }

    const genG = (k, w, h, fn) => { if (this.textures.exists(k)) return; const g = this.make.graphics({ x: 0, y: 0, add: !1 }); fn(g); g.generateTexture(k, w, h); g.destroy(); };
    genG('checkpoint-inactive', 52, 88, g => { g.fillStyle(0x374151, 1); g.fillRect(4, 76, 24, 6); g.fillStyle(0x1f2937, 1); g.fillRect(0, 82, 32, 6); g.fillStyle(0x9ca3af, 1); g.fillRect(14, 10, 4, 72); g.fillStyle(0xd1d5db, 1); g.fillCircle(16, 8, 7); g.fillStyle(0x6b7280, 1); g.fillRect(18, 14, 32, 22); g.fillStyle(0x4b5563, 1); g.fillTriangle(50, 14, 38, 25, 50, 36); });
    genG('checkpoint-active', 52, 88, g => { g.fillStyle(0x047857, 1); g.fillRect(4, 76, 24, 6); g.fillStyle(0x064e3b, 1); g.fillRect(0, 82, 32, 6); g.fillStyle(0xffd700, 1); g.fillRect(14, 10, 4, 72); g.fillStyle(0xfff3a0, 1); g.fillCircle(16, 8, 7); g.fillStyle(0x10b981, 1); g.fillRect(18, 14, 32, 22); g.fillStyle(0x059669, 1); g.fillTriangle(50, 14, 38, 25, 50, 36); });
    genG('subtle-gem-glow', 80, 80, g => { g.fillStyle(0xffffff, 0.16); g.fillCircle(40, 40, 34); g.fillStyle(0xffffff, 0.30); g.fillCircle(40, 40, 20); g.fillStyle(0xffffff, 0.70); g.fillCircle(40, 40, 6); });
    genG('flagpole-bare', 36, 272, g => { g.fillStyle(0xeeeeee, 1); g.fillCircle(18, 14, 11); g.fillStyle(0xffffff, 1); g.fillCircle(15, 11, 4); g.fillStyle(0xc8960c, 1); g.fillRect(12, 24, 12, 5); g.fillStyle(0xdcdcdc, 1); g.fillRect(15, 29, 6, 230); g.fillStyle(0xffffff, 1); g.fillRect(16, 29, 2, 230); g.fillStyle(0x777777, 1); g.fillRect(19, 29, 2, 230); g.fillStyle(0x616161, 1); g.fillRect(6, 256, 24, 8); g.fillStyle(0x333333, 1); g.fillRect(2, 264, 32, 8); });
    genG('flag-purple-vj-hd', 76, 48, g => { g.fillStyle(0x581380, 1); g.fillRect(0, 0, 72, 46); g.fillStyle(0x6e1b9e, 0.65); g.fillRect(0, 0, 18, 46); g.fillRect(36, 0, 18, 46); g.fillStyle(0x420d61, 0.45); g.fillRect(18, 0, 18, 46); g.fillRect(54, 0, 18, 46); g.lineStyle(2, 0xffd700, 1); g.strokeRect(2, 2, 68, 42); g.fillStyle(0xffd700, 1); for (let y = 3; y < 43; y += 6) g.fillTriangle(70, y, 75, y + 3, 70, y + 6); g.fillStyle(0x380b52, 1); g.fillRect(0, 0, 4, 46); g.fillStyle(0xffd700, 1); g.fillCircle(2, 6, 1.5); g.fillCircle(2, 40, 1.5); g.fillRect(18, 12, 5, 14); g.fillRect(28, 12, 5, 14); g.fillTriangle(18, 24, 33, 24, 25.5, 34); g.fillRect(37, 12, 15, 4); g.fillRect(44, 12, 5, 18); g.fillRect(37, 26, 8, 4); g.fillCircle(38, 28, 3); });
    genG('item-arrow', 60, 20, g => { g.fillStyle(0x777777, 1); g.fillRect(10, 9, 40, 2); g.fillStyle(0xaaaaaa, 1); g.fillTriangle(50, 5, 60, 10, 50, 15); g.fillStyle(0x555555, 1); g.fillTriangle(50, 7, 58, 10, 50, 13); g.fillStyle(0x666666, 1); g.fillTriangle(10, 9, 2, 4, 2, 9); g.fillTriangle(10, 11, 2, 16, 2, 11); });
    genG('item-powerup-arrow', 60, 24, g => { g.fillStyle(0xdcdcdc, 1); g.fillRect(10, 10, 40, 4); g.fillStyle(0xffffff, 1); g.fillRect(10, 11, 40, 2); g.fillStyle(0xffd700, 1); g.fillTriangle(50, 2, 60, 12, 50, 22); g.fillStyle(0xffaa00, 1); g.fillTriangle(50, 6, 58, 12, 50, 18); g.fillStyle(0xffd700, 1); g.fillTriangle(12, 10, 0, 0, 0, 10); g.fillTriangle(12, 14, 0, 24, 0, 14); g.fillStyle(0xffffff, 1); g.fillTriangle(10, 10, 2, 4, 2, 10); g.fillTriangle(10, 14, 2, 20, 2, 14); });
    genG('flag-red-m', 58, 40, g => { g.fillStyle(0xd32f2f, 1); g.fillRect(0, 0, 56, 38); g.fillStyle(0xb71c1c, 1); g.fillRect(0, 34, 56, 4); g.fillStyle(0xffffff, 1); g.fillCircle(28, 19, 13); g.fillStyle(0xd32f2f, 1); g.fillRect(20, 11, 4, 16); g.fillRect(32, 11, 4, 16); g.fillTriangle(20, 11, 28, 19, 28, 23); g.fillTriangle(36, 11, 28, 19, 28, 23); });
    genG('item-heart', 30, 30, g => { g.fillStyle(0xff1111, 1); g.fillCircle(9, 10, 8); g.fillCircle(21, 10, 8); g.fillTriangle(1, 12, 29, 12, 15, 28); });
    genG('water-projectile', 24, 24, g => { g.fillStyle(0x00e5ff, 0.4); g.fillCircle(12, 12, 11); g.fillStyle(0x00b0ff, 0.85); g.fillCircle(12, 12, 8); g.fillStyle(0xffffff, 1); g.fillCircle(10, 10, 4); });

    this.anims.create({ key: 'idle', frames: [{ key: 'player', frame: 0 }], frameRate: 1 });
    this.anims.create({ key: 'walk', frames: [{ key: 'player', frame: 1 }, { key: 'player', frame: 2 }], frameRate: 10, repeat: -1 });
    ['jump', 'fall', 'hurt', 'win-pose', 'shoot'].forEach((k, i) => this.anims.create({ key: k, frames: [{ key: 'player', frame: i + 3 }], frameRate: 1 }));
    this.anims.create({ key: 'turtle-walk', frames: this.anims.generateFrameNumbers('turtle', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'turtle-shell', frames: [{ key: 'turtle', frame: 4 }], frameRate: 1 });
    this.anims.create({ key: 'mushroom-walk', frames: this.anims.generateFrameNumbers('mushroom', { start: 0, end: 2 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'mushroom-dead', frames: [{ key: 'mushroom', frame: 3 }], frameRate: 1 });
    
    if (this.textures.exists('camel-spritesheet')) {
      this.anims.create({ key: 'camel-walk', frames: [{ key: 'camel-spritesheet', frame: 0 }, { key: 'camel-spritesheet', frame: 1 }], frameRate: 4, repeat: -1 });
      this.anims.create({ key: 'camel-dizzy', frames: [{ key: 'camel-spritesheet', frame: 2 }], frameRate: 1 });
    }
    if (this.textures.exists('bear-spritesheet')) this.anims.create({ key: 'bear-walk', frames: [{ key: 'bear-spritesheet', frame: 0 }, { key: 'bear-spritesheet', frame: 1 }], frameRate: 6, repeat: -1 });
    if (this.textures.exists('croc-spritesheet')) {
      this.anims.create({ key: 'croc-closed', frames: [{ key: 'croc-spritesheet', frame: 0 }], frameRate: 1 });
      this.anims.create({ key: 'croc-open', frames: [{ key: 'croc-spritesheet', frame: 1 }], frameRate: 1 });
    }
    if (this.textures.exists('water-enemy-spritesheet')) {
      this.anims.create({ key: 'water-enemy-idle', frames: [{ key: 'water-enemy-spritesheet', frame: 0 }], frameRate: 1 });
      this.anims.create({ key: 'water-enemy-attack', frames: [{ key: 'water-enemy-spritesheet', frame: 1 }], frameRate: 1 });
    }
    if (this.textures.exists('eagle-spritesheet')) {
      this.anims.create({ key: 'eagle-fly', frames: [{ key: 'eagle-spritesheet', frame: 0 }, { key: 'eagle-spritesheet', frame: 1 }, { key: 'eagle-spritesheet', frame: 2 }], frameRate: 7, repeat: -1 });
    }

    synth.getCtx();
    this.scene.start('StoryVideoScene');
  }
}

class StoryVideoScene extends Phaser.Scene {
  constructor() { super('StoryVideoScene'); }
  create() {
    const W = this.scale.width, H = this.scale.height;
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000);
    this.skipPressCount = 0; this.isTransitioning = !1;
    
    if (this.cache.video.exists('story-video')) {
      try {
        this.videoObj = this.add.video(W / 2, H / 2, 'story-video').setOrigin(0.5).setMute(!1).setVolume(1.0);
        this.videoObj.play();
        const fit = () => { if (this.videoObj?.video?.videoWidth > 0) this.videoObj.setScale(Math.min(W / this.videoObj.video.videoWidth, H / this.videoObj.video.videoHeight)); };
        this.videoObj.on('play', fit); this.videoObj.on('unlocked', fit);
        this.time.addEvent({ delay: 100, repeat: 10, callback: fit });
        this.videoObj.on('complete', () => this.goToTitle());
        if (this.videoObj.video) {
          this.videoObj.video.addEventListener('ended', () => this.goToTitle());
        }
      } catch (e) { this.goToTitle(); }
    } else this.time.delayedCall(300, () => this.goToTitle());
    
    this.skipPrompt = this.add.text(W / 2, H - 35, '', { fontFamily: 'Arial Black', fontSize: '14px', color: '#ffcc00', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setAlpha(0).setDepth(100);
    const onSkip = () => {
      this.skipPressCount++;
      if (this.skipPressCount === 1) {
        this.skipPrompt.setText('TAP OR PRESS ENTER AGAIN TO SKIP ⏩');
        this.tweens.add({ targets: this.skipPrompt, alpha: 1, duration: 150 });
        if (this.skipResetTimer) this.skipResetTimer.remove();
        this.skipResetTimer = this.time.delayedCall(2200, () => { this.skipPressCount = 0; this.tweens.add({ targets: this.skipPrompt, alpha: 0, duration: 250 }); });
      } else if (this.skipPressCount >= 2) {
        this.goToTitle();
      }
    };
    ['keydown-SPACE', 'keydown-ENTER'].forEach(e => this.input.keyboard.on(e, onSkip));
    this.input.on('pointerdown', onSkip);
  }
  update() {
    if (this.videoObj?.video?.videoWidth > 0) {
      const sc = Math.min(this.scale.width / this.videoObj.video.videoWidth, this.scale.height / this.videoObj.video.videoHeight);
      if (Math.abs(this.videoObj.scaleX - sc) > 0.001) this.videoObj.setScale(sc);
    }
  }
  goToTitle() {
    if (this.isTransitioning) return; this.isTransitioning = !0;
    if (this.videoObj) { try { this.videoObj.stop(); this.videoObj.destroy(); } catch (e) {} }
    this.cameras.main.fade(250, 0, 0, 0, !1, (c, p) => { if (p === 1) this.scene.start('TitleScene'); });
  }
}

class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }
  create() {
    document.body.style.backgroundColor = '#5c94fc'; this.htpOpen = !1;
    const W = this.scale.width, H = this.scale.height;
    this.add.image(W / 2, H / 2, 'bg-sky').setDisplaySize(W, H);
    this.add.image(W / 2, H - 45, 'ground-deco').setDisplaySize(W, 160).setOrigin(0.5);
    this.add.text(W / 2, 70, 'MY MARIO', { fontFamily: 'Arial Black', fontSize: '54px', color: '#ffcc00', stroke: '#7a2fbf', strokeThickness: 8 }).setOrigin(0.5);
    this.add.text(W / 2, 125, '★ POWERED BY VJ WORLD ★', { fontFamily: 'Arial Black', fontSize: '18px', color: '#ffffff', stroke: '#7a2fbf', strokeThickness: 4 }).setOrigin(0.5);
    const pShow = this.add.sprite(W / 2, H / 2 + 30, 'player', 6).setScale(0.95);
    this.tweens.add({ targets: pShow, y: pShow.y - 10, duration: 500, yoyo: !0, repeat: -1 });
    const dG = this.add.sprite(150, H - 55, 'mushroom', 0).setScale(0.52).play('mushroom-walk');
    const dT = this.add.sprite(W - 150, H - 55, 'turtle', 0).setScale(0.48).setFlipX(!0).play('turtle-walk');
    this.tweens.add({ targets: dG, x: 260, duration: 2000, yoyo: !0, repeat: -1, onYoyo: () => dG.toggleFlipX() });
    this.tweens.add({ targets: dT, x: W - 260, duration: 2200, yoyo: !0, repeat: -1, onYoyo: () => dT.toggleFlipX() });
    const pTxt = this.add.text(W / 2, H / 2 + 130, 'PRESS ENTER / TAP TO PLAY', { fontFamily: 'Arial Black', fontSize: '20px', color: '#ffffff', backgroundColor: '#7a2fbf', padding: { x: 16, y: 10 } }).setOrigin(0.5).setInteractive({ useHandCursor: !0 });
    this.tweens.add({ targets: pTxt, alpha: 0.4, duration: 600, yoyo: !0, repeat: -1 });
    const htp = this.add.text(W / 2, H / 2 + 180, '📖 HOW TO PLAY', { fontFamily: 'Arial Black', fontSize: '16px', color: '#fff', backgroundColor: '#444', padding: { x: 12, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: !0 });
    htp.on('pointerdown', () => this.showHTP());
    const go = () => { if (!this.htpOpen) { synth.getCtx(); this.scene.start('LevelSelectScene'); } };
    pTxt.on('pointerdown', go); ['keydown-ENTER', 'keydown-SPACE'].forEach(e => this.input.keyboard.on(e, go));
  }
  showHTP() {
    if (this.htpOpen) return; this.htpOpen = !0;
    const W = this.scale.width, H = this.scale.height, g = this.add.group();
    const bg = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setInteractive();
    g.addMultiple([bg, this.add.rectangle(W / 2, H / 2, 600, 360, 0x1e1e24).setStrokeStyle(4, 0xffcc00), this.add.text(W / 2, H / 2 - 140, 'HOW TO PLAY', { fontFamily: 'Arial Black', fontSize: '28px', color: '#ffcc00' }).setOrigin(0.5)]);
    const dk = (x, y, w, h, l, d, arr = !1) => {
      g.addMultiple([this.add.rectangle(x, y + 4, w, h, 0xaaaaaa).setOrigin(0.5), this.add.rectangle(x, y, w, h, 0xffffff).setOrigin(0.5), this.add.text(x, y, l, { fontFamily: 'Arial Black', fontSize: arr ? '24px' : '18px', color: '#333' }).setOrigin(0.5), this.add.text(x, y + h / 2 + 16, d, { fontFamily: 'Arial Black', fontSize: '11px', color: '#ffea00', align: 'center' }).setOrigin(0.5)]);
    };
    const bx = W / 2 - 120, by = H / 2 + 15;
    dk(bx, by - 50, 45, 45, '↑', 'JUMP', !0); dk(bx - 50, by, 45, 45, '←', 'RUN LEFT', !0); dk(bx, by, 45, 45, '↓', 'DUCK / CRAWL', !0); dk(bx + 50, by, 45, 45, '→', 'RUN RIGHT', !0);
    dk(W / 2 + 140, by - 50, 160, 45, 'SPACE / TAP', 'JUMP'); dk(W / 2 + 140, by, 60, 45, 'X / 🏹', 'SHOOT');
    const cTxt = this.add.text(W / 2, H / 2 + 140, '✖ TAP ANYWHERE TO CLOSE', { fontFamily: 'Arial Black', fontSize: '14px', color: '#ff5555' }).setOrigin(0.5);
    this.tweens.add({ targets: cTxt, alpha: 0.4, duration: 600, yoyo: !0, repeat: -1 }); g.add(cTxt);
    this.time.delayedCall(150, () => {
      const close = () => { this.input.keyboard.off('keydown', close); bg.off('pointerdown', close); g.destroy(!0); this.htpOpen = !1; };
      this.input.keyboard.once('keydown', close); bg.once('pointerdown', close);
    });
  }
}

class LevelSelectScene extends Phaser.Scene {
  constructor() { super('LevelSelectScene'); }
  create() {
    const W = this.scale.width, H = this.scale.height;
    this.add.image(W / 2, H / 2, 'bg-sky').setDisplaySize(W, H);
    this.add.image(W / 2, H - 45, 'ground-deco').setDisplaySize(W, 160).setOrigin(0.5);
    this.add.text(W / 2, 45, 'CHOOSE LEVEL', { fontFamily: 'Arial Black', fontSize: '38px', color: '#ffcc00', stroke: '#7a2fbf', strokeThickness: 7 }).setOrigin(0.5);
    const startX = W / 2 - 280, startY = 160;
    
    // Indian-English Authentic Themed Names
    const badges = [
      { name: 'LEVEL 1', sub: 'SHIVALIK HILLS' },
      { name: 'LEVEL 2', sub: 'SUNDERBANS NIGHT' },
      { name: 'LEVEL 3', sub: 'THAR EXPEDITION' },
      { name: 'LEVEL 4', sub: 'KALINGA MIDNIGHT' },
      { name: 'LEVEL 5', sub: 'HIMALAYAN STORM' },
      { name: 'LEVEL 6', sub: 'JAL MAHAL PALACE' },
      { name: 'LEVEL 7', sub: 'MEGHALAYA HEAVENS' }
    ];
    this.selectedIndex = 0; this.cards = [];
    for (let i = 1; i <= 10; i++) {
      const bx = startX + ((i - 1) % 5) * 140, by = startY + Math.floor((i - 1) / 5) * 110, isP = (i <= 7);
      const card = this.add.rectangle(bx, by, 115, 88, isP ? 0x7a2fbf : 0x2a2a2a, 0.92);
      this.cards.push(card);
      if (isP) {
        card.setInteractive({ useHandCursor: !0 });
        this.add.text(bx, by - 14, badges[i - 1].name, { fontFamily: 'Arial Black', fontSize: '15px', color: '#ffffff' }).setOrigin(0.5);
        this.add.text(bx, by + 16, badges[i - 1].sub, { fontFamily: 'Arial Black', fontSize: '9px', color: '#ffea00', align: 'center' }).setOrigin(0.5);
        card.on('pointerdown', () => { synth.getCtx(); this.scene.start('PlayScene', { currentLevel: i, currentScore: 0, currentLives: 5 }); });
      } else {
        this.add.text(bx, by - 10, `LVL ${i}`, { fontFamily: 'Arial', fontSize: '14px', color: '#777' }).setOrigin(0.5);
        this.add.text(bx, by + 14, '🔒 LOCKED', { fontFamily: 'Arial', fontSize: '11px', color: '#555' }).setOrigin(0.5);
      }
    }
    const backBtn = this.add.text(W / 2, H - 35, '⬅ BACK TO TITLE', { fontFamily: 'Arial Black', fontSize: '14px', color: '#00ffff', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5).setInteractive({ useHandCursor: !0 });
    backBtn.on('pointerdown', () => this.scene.start('TitleScene'));
    const upd = () => this.cards.forEach((c, i) => i < 7 ? c.setStrokeStyle(3, i === this.selectedIndex ? 0xffffff : 0xffcc00).setScale(i === this.selectedIndex ? 1.12 : 1.0).setFillStyle(i === this.selectedIndex ? 0x9a4fdf : 0x7a2fbf) : c.setStrokeStyle(3, 0x444444));
    upd();
    this.input.keyboard.on('keydown-LEFT', () => { synth.getCtx(); this.selectedIndex = Math.max(0, this.selectedIndex - 1); upd(); });
    this.input.keyboard.on('keydown-RIGHT', () => { synth.getCtx(); this.selectedIndex = Math.min(6, this.selectedIndex + 1); upd(); });
    const enterFn = () => { synth.getCtx(); if (this.selectedIndex < 7) this.scene.start('PlayScene', { currentLevel: this.selectedIndex + 1, currentScore: 0, currentLives: 5 }); };
    ['keydown-ENTER', 'keydown-SPACE'].forEach(e => this.input.keyboard.on(e, enterFn));
  }
}

class PlayScene extends Phaser.Scene {
  constructor() { super('PlayScene'); }
  init(d) {
    this.currentLevel = d.currentLevel || 1; this.score = d.currentScore || 0; this.lives = d.currentLives !== undefined ? d.currentLives : 5;
    this.hasArrows = !1; this.starAmmo = 0; this.gemsCollected = 0; this.totalGems = 5; this.collectedTypes = new Set(); this.jumpCount = 0; this.isShooting = !1;
    this.touchJumpBuffered = !1;
  }
  create() {
    this.input.addPointer(3); // 4 Multi-Touch Fingers Active
    this.SURFACE_Y = 473;
    const L = this.currentLevel, isL2 = L === 2, isL3 = L === 3, isL4 = L === 4, isL5 = L === 5, isL6 = L === 6, isL7 = L === 7, isDesert = isL3 || isL4;
    document.body.style.backgroundColor = isL7 ? '#2a1a3a' : (isL6 ? '#10162a' : (isL5 ? '#111122' : (isL4 ? '#0a1020' : (isL2 ? '#162244' : (isDesert ? '#88ccff' : '#5c94fc')))));
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
    } else if (isDesert) {
      this.skyBg = this.textures.exists('desert-bg') ? this.add.tileSprite(0, 0, this.scale.width, 540, 'desert-bg').setOrigin(0).setScrollFactor(0) : this.add.rectangle(0, 0, this.scale.width, 540, 0x88ccff).setOrigin(0).setScrollFactor(0);
      if (this.skyBg.tileScaleY && this.textures.exists('desert-bg')) { const sc = 540 / this.textures.get('desert-bg').getSourceImage().height; this.skyBg.tileScaleY = sc; this.skyBg.tileScaleX = sc; }
    } else {
      this.skyBg = this.textures.exists('bg-sky') ? this.add.tileSprite(0, 0, this.scale.width, 540, 'bg-sky').setOrigin(0).setScrollFactor(0) : this.add.rectangle(0, 0, this.scale.width, 540, 0x5c94fc).setOrigin(0).setScrollFactor(0);
      if (this.skyBg.tileScaleY) { this.skyBg.tileScaleY = 540 / 434; this.skyBg.tileScaleX = 540 / 434; }
    }

    if (isL2) this.skyBg.setTint(0x162244);
    else if (isL4) {
      this.skyBg.setTint(0x0a1020);
      this.add.circle(this.scale.width * 0.58, 115, 60, 0x0a1020, 1).setScrollFactor(0).setDepth(1);
      this.add.circle(this.scale.width * 0.58 - 15, 105, 35, 0xffeecc, 1).setScrollFactor(0).setDepth(2);
      this.add.circle(this.scale.width * 0.58, 95, 30, 0x0a1020, 1).setScrollFactor(0).setDepth(3);
      for (let s = 0; s < 70; s++) {
        const dot = this.add.circle(Phaser.Math.Between(0, this.scale.width), Phaser.Math.Between(0, 320), Phaser.Math.Between(1, 2), 0xffffff, 0.9).setScrollFactor(0).setDepth(1);
        this.tweens.add({ targets: dot, alpha: 0.1, duration: Phaser.Math.Between(500, 1500), yoyo: !0, repeat: -1 });
      }
    }
    if (!isDesert && !isL5 && !isL6 && !isL7 && this.textures.exists('ground-deco')) {
      this.decoBg = this.add.tileSprite(0, this.SURFACE_Y - 18, this.scale.width, 180, 'ground-deco').setOrigin(0, 1).setScrollFactor(0.35, 0).setScale(0.95);
      if (isL2) this.decoBg.setTint(0x557799);
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
        : [[400, 80, 'm'], [600, 90, 'turtle'], [1160, 100, 'm'], [1480, 90, 'turtle'], [1980, 100, 'm'], [2260, 90, 'turtle'], [2620, 100, 'm'], [2900, 90, 'turtle']]))));
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

    this.setupTouchControls();

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

  setupTouchControls() {
    this.touchBtns = [];
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!isTouch) return;

    const createBtn = (x, y, w, h, icon, col, onDown, onUp) => {
      const g = this.add.graphics().setScrollFactor(0).setDepth(500);
      const draw = (press) => {
        g.clear();
        g.fillStyle(press ? 0xffcc00 : col, press ? 0.75 : 0.35);
        g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 14);
        g.lineStyle(2, press ? 0xffea00 : 0xffffff, 0.6);
        g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 14);
      };
      draw(!1);
      const txt = this.add.text(x, y, icon, { fontFamily: 'Arial Black', fontSize: '22px', color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(501);
      const hit = this.add.zone(x, y, w + 16, h + 16).setScrollFactor(0).setDepth(502).setInteractive({ useHandCursor: !0 });
      hit.on('pointerdown', () => { draw(!0); onDown(); });
      hit.on('pointerup', () => { draw(!1); onUp(); });
      hit.on('pointerout', () => { draw(!1); onUp(); });
      this.touchBtns.push({ g, txt, hit });
    };

    // Left D-Pad Controls
    createBtn(65, 480, 68, 54, '◀', 0x222222, () => { window.touchInput.left = !0; }, () => { window.touchInput.left = !1; });
    createBtn(145, 480, 68, 54, '▼', 0x333333, () => { window.touchInput.down = !0; }, () => { window.touchInput.down = !1; });
    createBtn(225, 480, 68, 54, '▶', 0x222222, () => { window.touchInput.right = !0; }, () => { window.touchInput.right = !1; });

    // Right Action Buttons (Shoot & Large Jump Pad)
    createBtn(this.scale.width - 165, 480, 68, 58, '🏹', 0xdd2222, () => { window.touchInput.shoot = !0; }, () => { window.touchInput.shoot = !1; });
    createBtn(this.scale.width - 75, 475, 80, 68, '▲', 0x00aa44, () => {
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
      // Immediate Water Drop Check
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
    const down = this.cursors.down.isDown || this.keys.S.isDown || window.touchInput.down;
    const shoot = Phaser.Input.Keyboard.JustDown(this.keys.X) || window.touchInput.shoot;
    const onGround = this.player.body.blocked.down || this.player.body.touching.down, spd = window.gameSettings.playerSpeed;

    if (onGround) this.jumpCount = 0;
    const jumpK = Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
    const jumpHit = jumpK || this.touchJumpBuffered;
    this.touchJumpBuffered = !1; // Reset instant jump trigger

    if (!this.isHurt) {
      if (down) { this.player.setScale(0.68, 0.44); this.player.body.setSize(36, 50).setOffset(52, 90); }
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
    this.add.text(bx, H / 2 - 95, '🏆 GAME BEATEN! 🏆', { fontFamily: 'Arial Black', fontSize: '26px', color: '#ffcc00', stroke: '#7a2fbf', strokeThickness: 6, align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(601);
    this.add.text(bx, H / 2 - 10, `CONGRATULATIONS!\nFINAL SCORE: ${this.score}`, { fontFamily: 'Arial', fontSize: '19px', color: '#fff', align: 'center', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0).setDepth(601);
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

new Phaser.Game({
  type: Phaser.AUTO, width: 960, height: 540, parent: 'game-container', backgroundColor: '#5c94fc', pixelArt: !1,
  physics: { default: 'arcade', arcade: { gravity: { y: 1000 }, debug: !1 } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [PreBootScene, BootScene, StoryVideoScene, TitleScene, LevelSelectScene, PlayScene]
});