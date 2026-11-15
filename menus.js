/* =====================================================================
   THE LEGEND OF VJ — menus.js
   PreBootScene, BootScene, StoryVideoScene, TitleScene, LevelSelectScene
   ===================================================================== */

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
    this.add.text(W / 2, H / 2 - 40, 'LOADING VJ REALM...', { fontFamily: 'Arial Black', fontSize: '24px', color: '#ffcc00', stroke: '#7a2fbf', strokeThickness: 6 }).setOrigin(0.5);
    const pct = this.add.text(W / 2, H / 2 + 10, '0%', { fontFamily: 'Arial Black', fontSize: '18px', color: '#00ffff' }).setOrigin(0.5);
    this.load.on('progress', v => { pct.setText(Math.floor(v * 100) + '%'); });

    [
      ['tiles-raw', 'tiles.png'], ['ground-deco', 'ground.png'], ['bg-sky', 'bg-sky.jpg'], ['level2-bg', 'level2 bg.png'], ['castle-raw', 'castle.png'],
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
    document.body.style.backgroundColor = '#5c94fc'; this.htpOpen = !1; this.creditsOpen = !1;
    const W = this.scale.width, H = this.scale.height;
    this.add.image(W / 2, H / 2, 'bg-sky').setDisplaySize(W, H);
    this.add.image(W / 2, H - 45, 'ground-deco').setDisplaySize(W, 160).setOrigin(0.5);

    this.add.text(W / 2, 60, 'THE LEGEND OF VJ', { fontFamily: 'Arial Black', fontSize: '46px', color: '#ffcc00', stroke: '#7a2fbf', strokeThickness: 8 }).setOrigin(0.5);
    this.add.text(W / 2, 108, '★ POWERED BY VJ WORLD ★', { fontFamily: 'Arial Black', fontSize: '17px', color: '#ffffff', stroke: '#7a2fbf', strokeThickness: 4 }).setOrigin(0.5);

    const pShow = this.add.sprite(W / 2, H / 2 + 10, 'player', 6).setScale(0.95);
    this.tweens.add({ targets: pShow, y: pShow.y - 10, duration: 500, yoyo: !0, repeat: -1 });
    const dG = this.add.sprite(150, H - 55, 'mushroom', 0).setScale(0.52).play('mushroom-walk');
    const dT = this.add.sprite(W - 150, H - 55, 'turtle', 0).setScale(0.48).setFlipX(!0).play('turtle-walk');
    this.tweens.add({ targets: dG, x: 260, duration: 2000, yoyo: !0, repeat: -1, onYoyo: () => dG.toggleFlipX() });
    this.tweens.add({ targets: dT, x: W - 260, duration: 2200, yoyo: !0, repeat: -1, onYoyo: () => dT.toggleFlipX() });

    const pTxt = this.add.text(W / 2, H / 2 + 100, 'PRESS ENTER / TAP TO PLAY', { fontFamily: 'Arial Black', fontSize: '19px', color: '#ffffff', backgroundColor: '#7a2fbf', padding: { x: 16, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: !0 });
    this.tweens.add({ targets: pTxt, alpha: 0.4, duration: 600, yoyo: !0, repeat: -1 });

    const htp = this.add.text(W / 2 - 120, H / 2 + 155, '📖 HOW TO PLAY', { fontFamily: 'Arial Black', fontSize: '14px', color: '#fff', backgroundColor: '#334155', padding: { x: 12, y: 7 } }).setOrigin(0.5).setInteractive({ useHandCursor: !0 });
    htp.on('pointerdown', () => this.showHTP());

    const credits = this.add.text(W / 2 + 120, H / 2 + 155, '📜 STORY & CREDITS', { fontFamily: 'Arial Black', fontSize: '14px', color: '#fff', backgroundColor: '#334155', padding: { x: 12, y: 7 } }).setOrigin(0.5).setInteractive({ useHandCursor: !0 });
    credits.on('pointerdown', () => this.showCredits());

    const go = () => { if (!this.htpOpen && !this.creditsOpen) { synth.getCtx(); this.scene.start('LevelSelectScene'); } };
    pTxt.on('pointerdown', go); ['keydown-ENTER', 'keydown-SPACE'].forEach(e => this.input.keyboard.on(e, go));
  }

  showHTP() {
    if (this.htpOpen || this.creditsOpen) return; this.htpOpen = !0;
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

  showCredits() {
    if (this.creditsOpen || this.htpOpen) return; this.creditsOpen = !0;
    const W = this.scale.width, H = this.scale.height, g = this.add.group();
    const bg = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setInteractive();
    const card = this.add.rectangle(W / 2, H / 2, 680, 420, 0x0d1117, 0.98).setStrokeStyle(3, 0xffcc00);
    const title = this.add.text(W / 2, H / 2 - 170, 'THE LEGEND OF VJ — CHRONICLES', { fontFamily: 'Arial Black', fontSize: '20px', color: '#ffcc00', stroke: '#7a2fbf', strokeThickness: 5 }).setOrigin(0.5);

    const lore = `When the ancient elemental harmony was disrupted, 5 Sacred Gems were scattered across 7 dangerous Indian territories — Shivalik Hills, the mystical Sunderbans, scorching Thar Desert, Kalinga Midnight, the frozen Himalayan storms, the submerged Jal Mahal Palace, and the storm heights of Meghalaya.\n\nTaking up the warrior mantle, VJ ventures through each territory to vanquish mystical beasts, collect all 5 gems, and hoist the royal purple VJ crest atop the castles.`;
    const loreTxt = this.add.text(W / 2, H / 2 - 50, lore, { fontFamily: 'Arial', fontSize: '13px', color: '#e2e8f0', align: 'center', wordWrap: { width: 610 }, lineSpacing: 4 }).setOrigin(0.5);

    const credCard = this.add.rectangle(W / 2, H / 2 + 88, 620, 75, 0x161b22).setStrokeStyle(1.5, 0x7a2fbf);
    const devTxt = this.add.text(W / 2, H / 2 + 76, 'LEAD CREATOR & DEVELOPER: VAIBHAV JAIN', { fontFamily: 'Arial Black', fontSize: '15px', color: '#ffd700' }).setOrigin(0.5);
    const subCred = this.add.text(W / 2, H / 2 + 102, 'VJ World Studios • 2026 Live Edition • Phaser 3 Engine', { fontFamily: 'Arial', fontSize: '12px', color: '#38bdf8' }).setOrigin(0.5);

    const cTxt = this.add.text(W / 2, H / 2 + 165, '✖ TAP ANYWHERE TO CLOSE', { fontFamily: 'Arial Black', fontSize: '14px', color: '#ff5555' }).setOrigin(0.5);
    this.tweens.add({ targets: cTxt, alpha: 0.4, duration: 600, yoyo: !0, repeat: -1 });

    g.addMultiple([bg, card, title, loreTxt, credCard, devTxt, subCred, cTxt]);
    this.time.delayedCall(150, () => {
      const close = () => { this.input.keyboard.off('keydown', close); bg.off('pointerdown', close); g.destroy(!0); this.creditsOpen = !1; };
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
