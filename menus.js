/* =====================================================================
   THE LEGEND OF VJ — menus.js
   PreBootScene, BootScene, StoryVideoScene, TitleScene, LevelSelectScene
   Upgraded Royal-Modern UI Edition (VJ World Studios)
   ===================================================================== */

class PreBootScene extends Phaser.Scene {
  constructor() { super('PreBootScene'); }
  preload() {
    this.load.on('loaderror', () => {});
    [['p-stand-vic', 'player stand victory.png'], ['p-run', 'player run.png'], ['p-jump-fall', 'player jump fall.png'], ['p-crawl-dead', 'player crawl dead.png'], ['p-shoot', 'player shoot.png']].forEach(([k, f]) => this.load.image(k, `assets/${f}`));
    // Preload Intro Video, Story Video & Title Background Video with error immunity
    try {
      this.load.video('vj-intro', 'assets/vjworld_intro.mp4', 'loadeddata', !1, !1);
      this.load.video('story-video', 'assets/story.mp4', 'loadeddata', !1, !1);
      this.load.video('title-bg-video', 'assets/title_bg.mp4', 'loadeddata', !1, !1);
    } catch (e) {}
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
    this.add.rectangle(0, 0, W, H, 0x000000).setOrigin(0);

    [
      // Full AI Artwork Menu Backgrounds
      ['title_bg', 'title_bg.png'],
      ['level_bg', 'level_bg.png'],
      ['howto_bg', 'howto_bg.png'],
      ['credits_img', 'credits.png'],
      ['player_shoot', 'player shoot.png'],

      // Gameplay & World Textures
      ['tiles-raw', 'tiles.png'], ['grass-tiles-raw', 'grass tiles.png'], ['mystery-tile-raw', 'mystery tile.png'], ['green-gem-raw', 'green gem.png'], ['stone-tiles-raw', 'stone tiles.png'], ['ground-deco', 'ground.png'], ['bg-sky', 'bg-sky.jpg'], ['level2-bg', 'level2 bg.png'], ['castle-raw', 'castle.png'],
      ['diamonds-raw', 'diamonds.png'], ['desert-bg', 'desert.png'], ['desert-tiles-raw', 'desert tiles.png'], ['desert-cactus-raw', 'desert cactus.png'],
      ['desert-night-bg', 'desert night.jpeg'], ['desert-night-tiles-raw', 'desert night tiles.png'],
      ['camel-raw', 'camel.png'], ['bear-raw', 'bear.png'], ['snow-elements-raw', 'snow element.png'],
      ['snow-tiles-raw', 'snow tiles.png'], ['snow-bg', 'seamless_snow.png'],
      ['water-bg', 'seamless_water bg.png'], ['water-tiles-raw', 'water tiles.png'], ['water-hurdles-raw', 'water hurdles trunk.png'],
      ['crocodile-raw', 'crocodile.png'], ['water-enemy-raw', 'water enemy.png'],
      ['air-bg', 'seamless_air bg.png'], ['air-cloud-tiles-raw', 'air cloud tiles.png'], ['air-eagle-raw', 'air eagle.png'], ['air-thunder-raw', 'air thunder.png'],
      ['cave-raw', 'cave.png'], ['flag-raw', 'flag.png'],
      ['turtle-raw', 'turtle.png'], ['mushroom-raw', 'mushroom.png']
    ].forEach(([k, p]) => this.load.image(k, `assets/${p}`));

    this.load.audio('custom-bgm', 'assets/bgm.mp3');
  }
  create() {
    // Dynamic universal sprite slicer (bulletproof against any cropping/trimming of spritesheets)
    const makeDynamicSheet = (rawKey, outKey, cols) => {
      if (!this.textures.exists(rawKey)) return;
      const raw = this.textures.get(rawKey).getSourceImage();
      if (!raw?.width || !raw?.height) return;
      const fw = Math.floor(raw.width / cols), fh = raw.height;
      if (this.textures.exists(outKey)) this.textures.remove(outKey);
      const can = this.textures.createCanvas(outKey, fw * cols, fh);
      if (!can) return;
      const ctx = can.getContext();
      ctx.imageSmoothingEnabled = !1;
      ctx.drawImage(raw, 0, 0);
      can.refresh();
      const tex = this.textures.get(outKey);
      for (let i = 0; i < cols; i++) {
        tex.add(i, 0, i * fw, 0, fw, fh);
      }
      tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
    };

    makeDynamicSheet('turtle-raw', 'turtle', 5);
    makeDynamicSheet('mushroom-raw', 'mushroom', 4);

    if (this.textures.exists('ground-deco')) this.textures.get('ground-deco').setFilter(Phaser.Textures.FilterMode.NEAREST);

    // Process Castle closed & open door textures with 100% pixel-perfect locked alignment
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

      // Exactly measured center offsets so closed and open gates align to the exact same visual center
      // Left center is 567.5, Right center is 539.5 => offset difference of 28px
      const targetCastleW = 850;
      [['castle-closed', 0, 568], ['castle-open', halfW, 540]].forEach(([k, sx, cx]) => {
        if (this.textures.exists(k)) this.textures.remove(k);
        const can = this.textures.createCanvas(k, targetCastleW, cropCH);
        if (can) {
          const ctx = can.getContext();
          ctx.imageSmoothingEnabled = !0;
          ctx.imageSmoothingQuality = 'high';
          const dx = Math.round(targetCastleW / 2 - cx);
          ctx.drawImage(tempCCan, sx, cMinY, halfW, cropCH, dx, 0, halfW, cropCH);
          can.refresh();
        }
      });
    }

    // Process Diamond frames
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

    // Process Tiles
    if (this.textures.exists('tiles-raw') && this.textures.get('tiles-raw').getSourceImage().width) {
      const raw = this.textures.get('tiles-raw').getSourceImage(), W = raw.width, H = raw.height;
      [{ key: 'tile-grass', sx: 0.01 * W, sw: 0.22 * W }, { key: 'tile-trunk', sx: 0.26 * W, sw: 0.22 * W }, { key: 'tile-qblock', sx: 0.50 * W, sw: 0.23 * W }, { key: 'tile-star', sx: 0.76 * W, sw: 0.22 * W }].forEach(({ key, sx, sw }) => {
        if (this.textures.exists(key)) this.textures.remove(key);
        const can = this.textures.createCanvas(key, 54, 54);
        if (can) { const ctx = can.getContext(); ctx.imageSmoothingEnabled = !1; ctx.drawImage(raw, sx, 2, sw, H - 4, 0, 0, 54, 54); can.refresh(); this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST); }
      });
    }

    // Process High-Res Aesthetic Grass Tiles (Level 1, 2, 7)
    if (this.textures.exists('grass-tiles-raw')) {
      const rawG = this.textures.get('grass-tiles-raw').getSourceImage();
      if (rawG?.width) {
        if (this.textures.exists('tile-grass')) this.textures.remove('tile-grass');
        const canG = this.textures.createCanvas('tile-grass', 54, 54);
        if (canG) {
          const ctxG = canG.getContext();
          ctxG.imageSmoothingEnabled = !0;
          ctxG.imageSmoothingQuality = 'high';
          ctxG.drawImage(rawG, 128, 114, 1273, 1293, 0, 0, 54, 54);
          canG.refresh();
        }
      }
    }

    // Process 4K Ultra-Res Luxury Mystery Tile for Gems
    if (this.textures.exists('mystery-tile-raw')) {
      const rawM = this.textures.get('mystery-tile-raw').getSourceImage();
      if (rawM?.width) {
        if (this.textures.exists('tile-mystery')) this.textures.remove('tile-mystery');
        // Render to high-DPI 216x216 texture for 4K crispness on 54x54 world blocks
        const canM = this.textures.createCanvas('tile-mystery', 216, 216);
        if (canM) {
          const ctxM = canM.getContext();
          ctxM.imageSmoothingEnabled = !0;
          ctxM.imageSmoothingQuality = 'high';
          // Exact pixel crop of the luxury jewel box (minX=77, minY=78, w=613, h=609)
          ctxM.drawImage(rawM, 77, 78, 613, 609, 0, 0, 216, 216);
          canM.refresh();
        }
      }
    }

    // Process 4K Ultra-Res Green Emerald Gem for all levels (replaces diamond-1)
    if (this.textures.exists('green-gem-raw')) {
      const rawGG = this.textures.get('green-gem-raw').getSourceImage();
      if (rawGG?.width) {
        if (this.textures.exists('diamond-1')) this.textures.remove('diamond-1');
        const canGG = this.textures.createCanvas('diamond-1', 440, 574);
        if (canGG) {
          const ctxGG = canGG.getContext();
          ctxGG.imageSmoothingEnabled = !0;
          ctxGG.imageSmoothingQuality = 'high';
          ctxGG.drawImage(rawGG, 78, 108, 575, 751, 0, 0, 440, 574);
          canGG.refresh();
        }
      }
    }

    // Process 4K Ultra-Res Aesthetic Ancient Carved Stone Tiles
    if (this.textures.exists('stone-tiles-raw')) {
      const rawST = this.textures.get('stone-tiles-raw').getSourceImage();
      if (rawST?.width) {
        if (this.textures.exists('tile-stone')) this.textures.remove('tile-stone');
        const canST = this.textures.createCanvas('tile-stone', 54, 54);
        if (canST) {
          const ctxST = canST.getContext();
          ctxST.imageSmoothingEnabled = !0;
          ctxST.imageSmoothingQuality = 'high';
          ctxST.drawImage(rawST, 42, 90, 1233, 1243, 0, 0, 54, 54);
          canST.refresh();
        }
      }
    }

    // Process 4K Ultra-Res Regal VJ Royal Banner (assets/flag.png)
    if (this.textures.exists('flag-raw')) {
      const rawFlag = this.textures.get('flag-raw').getSourceImage();
      if (rawFlag?.width) {
        if (this.textures.exists('flag-purple-vj-hd')) this.textures.remove('flag-purple-vj-hd');
        // High-DPI canvas (256x152) downsampled with bicubic smoothing to exactly match 64x38 Mario flag shape
        const canFlag = this.textures.createCanvas('flag-purple-vj-hd', 256, 152);
        if (canFlag) {
          const ctxFlag = canFlag.getContext();
          ctxFlag.imageSmoothingEnabled = !0;
          ctxFlag.imageSmoothingQuality = 'high';
          ctxFlag.drawImage(rawFlag, 0, 0, rawFlag.width, rawFlag.height, 0, 0, 256, 152);
          canFlag.refresh();
        }
      }
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
      procCrop('desert-tiles-raw', [{ key: 'tile-sand-cube', rx: 0.02 * tw, ry: 0.04 * th, rw: 0.25 * tw, rh: 0.45 * th, ow: 54, oh: 54, bottomAlign: !1 }, { key: 'tile-sand-cuboid', rx: 0.26 * tw, ry: 0.04 * th, rw: 0.38 * tw, rh: 0.45 * th, ow: 108, oh: 54, bottomAlign: !1 }, { key: 'tile-cactus-trunk', rx: 0.65 * tw, ry: 0.06 * th, rw: 0.32 * tw, rh: 0.88 * th, ow: 85, oh: 140, bottomAlign: !0 }]);
    }
    if (this.textures.exists('desert-cactus-raw')) {
      const cw = this.textures.get('desert-cactus-raw').getSourceImage().width, ch = this.textures.get('desert-cactus-raw').getSourceImage().height;
      // High-resolution realistic standalone cactus trunk (ratio: 341x466 ~ 0.732)
      procCrop('desert-cactus-raw', [
        { key: 'tile-cactus-trunk', rx: 0, ry: 0, rw: cw, rh: ch, ow: 100, oh: 138, bottomAlign: !0 },
        { key: 'tile-night-cactus-trunk', rx: 0, ry: 0, rw: cw, rh: ch, ow: 100, oh: 138, bottomAlign: !0 }
      ]);
    }
    if (this.textures.exists('desert-night-tiles-raw')) {
      const tw = this.textures.get('desert-night-tiles-raw').getSourceImage().width, th = this.textures.get('desert-night-tiles-raw').getSourceImage().height;
      procCrop('desert-night-tiles-raw', [{ key: 'tile-night-sand-cube', rx: 0.02 * tw, ry: 0.04 * th, rw: 0.25 * tw, rh: 0.45 * th, ow: 54, oh: 54, bottomAlign: !1 }, { key: 'tile-night-sand-cuboid', rx: 0.26 * tw, ry: 0.04 * th, rw: 0.38 * tw, rh: 0.45 * th, ow: 108, oh: 54, bottomAlign: !1 }, { key: 'tile-night-cactus-trunk', rx: 0.65 * tw, ry: 0.06 * th, rw: 0.32 * tw, rh: 0.88 * th, ow: 85, oh: 140, bottomAlign: !0 }]);
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
      const frameData = [];
      let maxCropW = 0, maxCropH = 0;
      for (let i = 0; i < fc; i++) {
        try {
          const d = tctx.getImageData(i * fw, 0, fw, cH).data; let minX = fw, maxX = 0, minY = cH, maxY = 0;
          for (let y = 0; y < cH; y += 2) for (let x = 0; x < fw; x += 2) {
            const idx = (y * fw + x) * 4;
            if (d[idx] > 248 && d[idx + 1] > 248 && d[idx + 2] > 248) d[idx + 3] = 0;
            else if (d[idx + 3] > 20) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
          }
          if (minX > maxX) { minX = 0; maxX = fw - 1; minY = 0; maxY = cH - 1; }
          const cropW = maxX - minX + 1, cropH = maxY - minY + 1;
          if (cropW > maxCropW) maxCropW = cropW;
          if (cropH > maxCropH) maxCropH = cropH;
          frameData.push({ minX, minY, cropW, cropH });
        } catch (e) {
          frameData.push({ minX: 0, minY: 0, cropW: fw, cropH: cH });
        }
      }
      const sc = Math.min((oh - 4) / (maxCropH || oh), (ow - 4) / (maxCropW || ow));
      for (let i = 0; i < fc; i++) {
        try {
          const { minX, minY, cropW, cropH } = frameData[i];
          const fcan = document.createElement('canvas'); fcan.width = fw; fcan.height = cH;
          fcan.getContext('2d').putImageData(tctx.getImageData(i * fw, 0, fw, cH), 0, 0);
          const tw_s = Math.round(cropW * sc), th_s = Math.round(cropH * sc);
          cs.drawImage(fcan, minX, minY, cropW, cropH, i * ow + Math.round((ow - tw_s) / 2), oh - th_s, tw_s, th_s);
        } catch (e) {}
      }
      outCan.refresh(); const tex = this.textures.get(outKey);
      for (let i = 0; i < fc; i++) tex.add(i, 0, i * ow, 0, ow, oh);
    };

    procSheet('camel-raw', 'camel-spritesheet', 3, 180, 120);
    procSheet('bear-raw', 'bear-spritesheet', 2, 160, 120);
    // 4K Ultra-Sharp processing for Crocodile (440x220 canvas resolution for pristine high-DPI rendering)
    procSheet('crocodile-raw', 'croc-spritesheet', 2, 440, 220);
    // 4K Ultra-Sharp processing for Water Enemy (320x320 canvas resolution for crisp textures)
    procSheet('water-enemy-raw', 'water-enemy-spritesheet', 2, 320, 320);
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

    // Process Prince Shooting sprite for TitleScene (cropped to exact feet/body bounding box)
    if (this.textures.exists('player_shoot')) {
      const raw = this.textures.get('player_shoot').getSourceImage();
      if (raw?.width) {
        const W = raw.width, H = raw.height, tCan = document.createElement('canvas');
        tCan.width = W; tCan.height = H; const tCtx = tCan.getContext('2d');
        tCtx.drawImage(raw, 0, 0);
        try {
          const d = tCtx.getImageData(0, 0, W, H).data;
          let minX = W, maxX = 0, minY = H, maxY = 0;
          for (let y = 0; y < H; y += 2) {
            for (let x = 0; x < W; x += 2) {
              if (d[(y * W + x) * 4 + 3] > 20) {
                if (x < minX) minX = x; if (x > maxX) maxX = x;
                if (y < minY) minY = y; if (y > maxY) maxY = y;
              }
            }
          }
          if (minX > maxX) { minX = 0; maxX = W - 1; minY = 0; maxY = H - 1; }
          const cropW = maxX - minX + 1, cropH = maxY - minY + 1;
          if (this.textures.exists('player_shoot_title')) this.textures.remove('player_shoot_title');
          const can = this.textures.createCanvas('player_shoot_title', cropW, cropH);
          if (can) {
            const ctx = can.getContext();
            ctx.imageSmoothingEnabled = !0;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(tCan, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
            can.refresh();
          }
        } catch (e) {}
      }
    }

    const genG = (k, w, h, fn) => { if (this.textures.exists(k)) return; const g = this.make.graphics({ x: 0, y: 0, add: !1 }); fn(g); g.generateTexture(k, w, h); g.destroy(); };
    genG('checkpoint-inactive', 56, 92, g => {
      // Sleek beveled silver-steel base pedestal
      g.fillStyle(0x1a202c, 1);
      g.fillRoundedRect(4, 82, 34, 8, 3);
      g.fillStyle(0x475569, 1);
      g.fillRect(8, 77, 26, 6);
      g.fillStyle(0x64748b, 1);
      g.fillRect(11, 74, 20, 4);

      // Polished metallic steel pole with bevel/highlight
      g.fillStyle(0x334155, 1);
      g.fillRect(18, 12, 5, 63);
      g.fillStyle(0x94a3b8, 1);
      g.fillRect(19, 12, 2, 63);
      g.fillStyle(0xf1f5f9, 0.9);
      g.fillRect(19, 12, 1, 63);

      // Spherical chrome finial topper
      g.fillStyle(0x475569, 1);
      g.fillCircle(20.5, 9, 6.5);
      g.fillStyle(0x94a3b8, 1);
      g.fillCircle(20.5, 8.5, 5);
      g.fillStyle(0xffffff, 0.95);
      g.fillCircle(19, 7, 2);

      // Beautiful draped satin pennant banner (unactivated slate/charcoal)
      // Wavy natural cloth ripples
      g.fillStyle(0x27272a, 1);
      g.beginPath();
      g.moveTo(23, 14);
      g.lineTo(54, 22);
      g.lineTo(46, 32);
      g.lineTo(54, 42);
      g.lineTo(23, 38);
      g.closePath();
      g.fill();

      // Soft cloth shadow & fold highlights
      g.fillStyle(0x3f3f46, 1);
      g.beginPath();
      g.moveTo(23, 14);
      g.lineTo(42, 19);
      g.lineTo(38, 35);
      g.lineTo(23, 38);
      g.closePath();
      g.fill();

      // Elegant inner cloth emblem line
      g.lineStyle(1.2, 0x71717a, 0.75);
      g.beginPath();
      g.moveTo(26, 18);
      g.lineTo(47, 24);
      g.lineTo(42, 31);
      g.lineTo(47, 38);
      g.lineTo(26, 35);
      g.closePath();
      g.stroke();
    });

    genG('checkpoint-active', 56, 92, g => {
      // Golden royal brass pedestal with bevel
      g.fillStyle(0x451a03, 1);
      g.fillRoundedRect(4, 82, 34, 8, 3);
      g.fillStyle(0xb45309, 1);
      g.fillRect(8, 77, 26, 6);
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(11, 74, 20, 4);

      // Gleaming gilded gold pole
      g.fillStyle(0x78350f, 1);
      g.fillRect(18, 12, 5, 63);
      g.fillStyle(0xfbbf24, 1);
      g.fillRect(19, 12, 2, 63);
      g.fillStyle(0xfffbeb, 0.95);
      g.fillRect(19, 12, 1, 63);

      // Brilliant gold finial topper with jewel gleam
      g.fillStyle(0xd97706, 1);
      g.fillCircle(20.5, 9, 6.5);
      g.fillStyle(0xfde047, 1);
      g.fillCircle(20.5, 8.5, 5);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(19, 7, 2);

      // Gorgeous fluttering royal emerald & gold silk pennant
      g.fillStyle(0x064e3b, 1);
      g.beginPath();
      g.moveTo(23, 14);
      g.lineTo(54, 22);
      g.lineTo(46, 32);
      g.lineTo(54, 42);
      g.lineTo(23, 38);
      g.closePath();
      g.fill();

      // Rich vibrant emerald silk wave highlight
      g.fillStyle(0x059669, 1);
      g.beginPath();
      g.moveTo(23, 14);
      g.lineTo(42, 19);
      g.lineTo(38, 35);
      g.lineTo(23, 38);
      g.closePath();
      g.fill();

      // Silken top crest highlight
      g.fillStyle(0x34d399, 0.85);
      g.beginPath();
      g.moveTo(23, 15);
      g.lineTo(39, 19.5);
      g.lineTo(23, 23);
      g.closePath();
      g.fill();

      // Royal Gold filigree trim & star emblem
      g.lineStyle(1.8, 0xffd700, 0.95);
      g.beginPath();
      g.moveTo(23, 14);
      g.lineTo(54, 22);
      g.lineTo(46, 32);
      g.lineTo(54, 42);
      g.lineTo(23, 38);
      g.closePath();
      g.stroke();

      // Center golden crest star
      g.fillStyle(0xffea00, 1);
      g.fillCircle(33, 26, 3.2);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(33, 26, 1.2);
    });
    genG('subtle-gem-glow', 80, 80, g => { g.fillStyle(0xffffff, 0.16); g.fillCircle(40, 40, 34); g.fillStyle(0xffffff, 0.30); g.fillCircle(40, 40, 20); g.fillStyle(0xffffff, 0.70); g.fillCircle(40, 40, 6); });
    // Highly realistic, elegant metallic finish flagpole with brass finial & weighted pedestal
    genG('flagpole-bare', 36, 272, g => {
      // Golden finial globe at top
      g.fillStyle(0xcca01a, 1);
      g.fillCircle(18, 14, 11);
      g.fillStyle(0xffea60, 1);
      g.fillCircle(16, 11, 7);
      g.fillStyle(0xffffff, 0.95);
      g.fillCircle(14, 9, 3);
      // Finial collar
      g.fillStyle(0x997300, 1);
      g.fillRect(11, 23, 14, 5);
      g.fillStyle(0xffd700, 1);
      g.fillRect(13, 24, 10, 3);

      // Polished stainless steel / chrome pole with cylindrical specular shading
      // Base shadow / rim
      g.fillStyle(0x5a5a64, 1);
      g.fillRect(14, 28, 8, 230);
      // Mid chrome tone
      g.fillStyle(0xb0b0bc, 1);
      g.fillRect(15, 28, 6, 230);
      // Bright reflective core
      g.fillStyle(0xffffff, 0.95);
      g.fillRect(16, 28, 2, 230);
      // Soft reflection edge
      g.fillStyle(0xe2e2ea, 0.85);
      g.fillRect(18, 28, 2, 230);

      // Multi-tiered heavy brass & obsidian base pedestal
      g.fillStyle(0x222228, 1);
      g.fillRect(8, 254, 20, 4);
      g.fillStyle(0xb38600, 1);
      g.fillRect(6, 258, 24, 4);
      g.fillStyle(0xffd700, 0.9);
      g.fillRect(8, 259, 20, 2);
      g.fillStyle(0x1a1a20, 1);
      g.fillRect(2, 262, 32, 10);
      g.fillStyle(0x383842, 1);
      g.fillRect(4, 263, 28, 2);
    });

    // Beautiful High-Detail Mario "M" Pennant with gold embroidered fringe and royal fabric texture
    genG('flag-red-m', 64, 38, g => {
      // Deep scarlet satin banner base (exact 64x38 matching aspect ratio)
      g.fillStyle(0xb71c1c, 1);
      g.fillRect(0, 0, 64, 38);
      // Subtle fabric weave highlights
      g.fillStyle(0xd32f2f, 0.85);
      g.fillRect(2, 2, 60, 17);
      g.fillStyle(0x8e0000, 0.7);
      g.fillRect(2, 20, 60, 16);
      // Gold ornate braided border
      g.lineStyle(2, 0xffd700, 0.95);
      g.strokeRect(2, 2, 60, 34);
      g.lineStyle(1, 0xffea70, 0.8);
      g.strokeRect(4, 4, 56, 30);

      // Hoist sleeve with brass grommets
      g.fillStyle(0x2d0505, 1);
      g.fillRect(0, 0, 4, 38);
      g.fillStyle(0xffd700, 1);
      g.fillCircle(2, 6, 1.5);
      g.fillCircle(2, 32, 1.5);

      // Elegant Mario Emblem: Circular white crest with golden bevel
      g.fillStyle(0xffd700, 1);
      g.fillCircle(32, 19, 13);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(32, 19, 11);
      // Mario "M" letter insignia in royal crimson
      g.fillStyle(0xb71c1c, 1);
      g.fillRect(25, 12, 3, 14);
      g.fillRect(36, 12, 3, 14);
      g.fillTriangle(25, 12, 32, 20, 32, 24);
      g.fillTriangle(39, 12, 32, 20, 32, 24);
    });

    // Realistic Silver & Golden Bow Arrows
    genG('item-arrow', 60, 20, g => {
      // Polished timber/steel shaft with specular gleam
      g.fillStyle(0x5c4033, 1); g.fillRect(10, 8, 40, 4);
      g.fillStyle(0x8b5a2b, 1); g.fillRect(10, 9, 40, 2);
      g.fillStyle(0xffffff, 0.7); g.fillRect(12, 9, 36, 1);
      // Sharp steel arrowhead
      g.fillStyle(0x333333, 1); g.fillTriangle(48, 3, 60, 10, 48, 17);
      g.fillStyle(0xb0b0bc, 1); g.fillTriangle(49, 5, 59, 10, 49, 15);
      g.fillStyle(0xffffff, 0.9); g.fillTriangle(50, 7, 57, 10, 50, 13);
      // Royal crimson & gold feather fletchings
      g.fillStyle(0xb71c1c, 1); g.fillTriangle(12, 9, 2, 2, 4, 9);
      g.fillTriangle(12, 11, 2, 18, 4, 11);
      g.fillStyle(0xffd700, 1); g.fillTriangle(10, 9, 2, 4, 4, 9);
      g.fillTriangle(10, 11, 2, 16, 4, 11);
    });
    genG('item-powerup-arrow', 60, 24, g => {
      // Royal golden arrow shaft (clean, no outer glow)
      g.fillStyle(0xb38600, 1); g.fillRect(10, 10, 40, 4);
      g.fillStyle(0xffd700, 1); g.fillRect(10, 11, 40, 2);
      g.fillStyle(0xffffff, 0.9); g.fillRect(12, 11, 36, 1);
      // Ornate golden broadhead arrowhead
      g.fillStyle(0x996515, 1); g.fillTriangle(48, 2, 60, 12, 48, 22);
      g.fillStyle(0xffd700, 1); g.fillTriangle(49, 4, 59, 12, 49, 20);
      g.fillStyle(0xffffff, 0.95); g.fillTriangle(51, 7, 57, 12, 51, 17);
      // Royal crimson fletchings with gold tips
      g.fillStyle(0xb71c1c, 1); g.fillTriangle(12, 10, 0, 1, 3, 10);
      g.fillTriangle(12, 14, 0, 23, 3, 14);
      g.fillStyle(0xffd700, 1); g.fillTriangle(10, 10, 2, 4, 3, 10);
      g.fillTriangle(10, 14, 2, 20, 3, 14);
    });
    // Aesthetic sculpted 3D royal ruby-gold heart (Zero flash, crisp jewel shape)
    genG('item-heart', 36, 36, g => {
      // 1. Soft subtle 3D drop-shadow
      g.fillStyle(0x000000, 0.45);
      g.fillCircle(12, 14, 8);
      g.fillCircle(24, 14, 8);
      g.fillTriangle(4, 16.5, 32, 16.5, 18, 34);

      // 2. Ornate Golden Outer Filigree Bevel Rim
      g.fillStyle(0xd4af37, 1);
      g.fillCircle(12, 12, 8.5);
      g.fillCircle(24, 12, 8.5);
      g.fillTriangle(3.5, 14.5, 32.5, 14.5, 18, 33);

      // 3. Deep Royal Crimson Base
      g.fillStyle(0x8b0000, 1);
      g.fillCircle(12, 12, 7.5);
      g.fillCircle(24, 12, 7.5);
      g.fillTriangle(4.5, 14.5, 31.5, 14.5, 18, 31.5);

      // 4. Vibrant Ruby Jewel Body
      g.fillStyle(0xd90429, 1);
      g.fillCircle(12, 12, 6.5);
      g.fillCircle(24, 12, 6.5);
      g.fillTriangle(5.5, 14.5, 30.5, 14.5, 18, 29.5);

      // 5. Specular Crystal Highlights (Diamond Luster)
      g.fillStyle(0xff85a1, 0.85);
      g.fillCircle(10, 9.5, 3);
      g.fillStyle(0xffffff, 0.95);
      g.fillCircle(9.5, 9, 1.5);
      g.fillStyle(0xffffff, 0.75);
      g.fillCircle(22, 9.5, 1.2);
    });
    // Hyper-realistic hydrodynamic water projectile (multi-layered refractive water sphere with aqua core, caustic rim, zero flash)
    genG('water-projectile', 32, 32, g => {
      // Outer translucent aqueous meniscus
      g.fillStyle(0x0088cc, 0.35);
      g.fillCircle(16, 16, 15);
      // Main deep aqua water volume
      g.fillStyle(0x00a8e8, 0.75);
      g.fillCircle(16, 16, 12);
      // High-pressure dense hydraulic core
      g.fillStyle(0x0077b6, 0.95);
      g.fillCircle(16, 16, 8);
      // Refractive specular glint 1 (top-left)
      g.fillStyle(0xffffff, 0.95);
      g.fillCircle(12, 12, 4);
      // Small bottom-right internal caustic reflection
      g.fillStyle(0x90e0ef, 0.8);
      g.fillCircle(19, 19, 2.5);
    });

    this.anims.create({ key: 'idle', frames: [{ key: 'player', frame: 0 }], frameRate: 1 });
    this.anims.create({ key: 'walk', frames: [{ key: 'player', frame: 1 }, { key: 'player', frame: 2 }], frameRate: 10, repeat: -1 });
    ['jump', 'fall', 'hurt', 'win-pose', 'shoot'].forEach((k, i) => this.anims.create({ key: k, frames: [{ key: 'player', frame: i + 3 }], frameRate: 1 }));
    this.anims.create({ key: 'turtle-walk', frames: [{ key: 'turtle', frame: 0 }, { key: 'turtle', frame: 1 }, { key: 'turtle', frame: 2 }, { key: 'turtle', frame: 3 }], frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'turtle-shell', frames: [{ key: 'turtle', frame: 4 }], frameRate: 1 });
    this.anims.create({ key: 'mushroom-walk', frames: [{ key: 'mushroom', frame: 0 }, { key: 'mushroom', frame: 1 }, { key: 'mushroom', frame: 2 }], frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'mushroom-dead', frames: [{ key: 'mushroom', frame: 3 }], frameRate: 1 });

    if (this.textures.exists('camel-spritesheet')) {
      this.anims.create({ key: 'camel-walk', frames: [{ key: 'camel-spritesheet', frame: 0 }, { key: 'camel-spritesheet', frame: 1 }], frameRate: 4, repeat: -1 });
      this.anims.create({ key: 'camel-dizzy', frames: [{ key: 'camel-spritesheet', frame: 2 }], frameRate: 1 });
    }
    if (this.textures.exists('bear-spritesheet')) this.anims.create({ key: 'bear-walk', frames: [{ key: 'bear-spritesheet', frame: 0 }, { key: 'bear-spritesheet', frame: 1 }], frameRate: 8, repeat: -1 });
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
    this.scene.start('IntroVideoScene');
  }
}

class IntroVideoScene extends Phaser.Scene {
  constructor() { super('IntroVideoScene'); }
  create() {
    synth.stopMenuBGM();
    const W = this.scale.width, H = this.scale.height;
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000).setDepth(0);
    this.canContinue = !1;
    this.isTransitioning = !1;

    // 1. Play vjworld_intro.mp4 immediately with responsive fit
    if (this.cache.video.exists('vj-intro')) {
      try {
        this.videoObj = this.add.video(W / 2, H / 2, 'vj-intro').setOrigin(0.5).setMute(!1).setVolume(1.0).setDepth(1);
        this.videoObj.play();
        const fit = () => {
          if (this.videoObj?.video?.videoWidth > 0) {
            const sc = Math.max(W / this.videoObj.video.videoWidth, H / this.videoObj.video.videoHeight);
            this.videoObj.setScale(sc);
          }
        };
        this.videoObj.on('play', fit);
        this.videoObj.on('unlocked', fit);
        this.videoObj.on('complete', () => this.goToStory());
        if (this.videoObj.video) {
          this.videoObj.video.addEventListener('ended', () => this.goToStory());
        }
        this.time.addEvent({ delay: 100, repeat: 10, callback: fit });
      } catch (e) {
        try {
          this.videoObj?.setMute(!0);
          this.videoObj?.play();
        } catch (err) {}
      }
    }

    // Direct SKIP button at top-right
    const skipBtn = this.add.container(W - 65, 30).setDepth(100);
    const sGfx = this.add.graphics();
    sGfx.fillStyle(0x0c0714, 0.80);
    sGfx.fillRoundedRect(-45, -16, 90, 32, 8);
    sGfx.lineStyle(1.8, 0xffd700, 0.9);
    sGfx.strokeRoundedRect(-45, -16, 90, 32, 8);
    const sTxt = this.add.text(0, 0, 'SKIP ⏭️', { fontFamily: 'Arial Black', fontSize: '12px', color: '#ffd700' }).setOrigin(0.5);
    skipBtn.add([sGfx, sTxt]);
    skipBtn.setSize(90, 32).setInteractive({ useHandCursor: !0 });
    skipBtn.on('pointerdown', (p, x, y, ev) => { if (ev) ev.stopPropagation(); this.goToStory(); });

    // 2. Aesthetic Golden Loading Bar & Percentage Counter (Bottom Center)
    const barW = 460, barH = 16, barY = H - 52;
    this.loadingContainer = this.add.container(W / 2, barY).setDepth(20);

    // Glassmorphic bar background
    const barBg = this.add.graphics();
    barBg.fillStyle(0x000000, 0.75);
    barBg.fillRoundedRect(-barW / 2, -barH / 2, barW, barH, 8);
    barBg.lineStyle(2, 0xffd700, 0.95);
    barBg.strokeRoundedRect(-barW / 2, -barH / 2, barW, barH, 8);

    // Subtle outer glow
    barBg.lineStyle(5, 0xffea00, 0.35);
    barBg.strokeRoundedRect(-barW / 2 - 2, -barH / 2 - 2, barW + 4, barH + 4, 10);

    // Fill bar
    this.barFill = this.add.graphics();

    // Percentage & Status Counter
    this.pctText = this.add.text(0, -22, 'LOADING VJ REALM... 0%', {
      fontFamily: 'Arial Black',
      fontSize: '13px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.loadingContainer.add([barBg, this.barFill, this.pctText]);

    // 3. Exactly 8 Seconds Smooth Progress (0% -> 100%)
    this.loadProgress = 0;
    this.tweens.add({
      targets: this,
      loadProgress: 100,
      duration: 8000,
      ease: 'Power1',
      onUpdate: () => {
        const pct = Math.floor(this.loadProgress);
        this.pctText.setText(`LOADING VJ REALM... ${pct}%`);
        const fillW = Math.max(0, (pct / 100) * (barW - 6));
        this.barFill.clear();
        this.barFill.fillStyle(0xffea00, 0.95);
        this.barFill.fillRoundedRect(-barW / 2 + 3, -barH / 2 + 3, fillW, barH - 6, 5);
      },
      onComplete: () => {
        this.showTapToContinue();
      }
    });

    // Tap/Enter prompt listener: instant skip on user action
    const onAction = () => {
      this.goToStory();
    };
    this.input.on('pointerdown', onAction);
    ['keydown-SPACE', 'keydown-ENTER'].forEach(e => this.input.keyboard.on(e, onAction));
  }

  showTapToContinue() {
    const W = this.scale.width, H = this.scale.height;

    // Fade out loading bar
    this.tweens.add({
      targets: this.loadingContainer,
      alpha: 0,
      duration: 350,
      onComplete: () => {
        this.loadingContainer?.destroy();
      }
    });

    // Reveal glowing "Tap to Continue" screen
    this.continueContainer = this.add.container(W / 2, H - 55).setDepth(25).setAlpha(0);

    const promptCard = this.add.graphics();
    promptCard.fillStyle(0x0c0714, 0.85);
    promptCard.fillRoundedRect(-180, -22, 360, 44, 12);
    promptCard.lineStyle(2.5, 0xffea00, 1.0);
    promptCard.strokeRoundedRect(-180, -22, 360, 44, 12);
    promptCard.lineStyle(6, 0xffd700, 0.40);
    promptCard.strokeRoundedRect(-182, -24, 364, 48, 14);

    const promptTxt = this.add.text(0, -4, 'TAP TO CONTINUE ⏩', {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#fff3a0',
      stroke: '#180a00',
      strokeThickness: 4
    }).setOrigin(0.5);

    const subTxt = this.add.text(0, 12, 'OR PRESS ENTER / SPACE', {
      fontFamily: 'Arial Black',
      fontSize: '9px',
      color: '#ffd700'
    }).setOrigin(0.5);

    this.continueContainer.add([promptCard, promptTxt, subTxt]);

    this.tweens.add({
      targets: this.continueContainer,
      alpha: 1,
      duration: 400,
      onComplete: () => {
        this.canContinue = !0;
        this.tweens.add({
          targets: this.continueContainer,
          scale: 1.04,
          duration: 700,
          yoyo: !0,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });
  }

  goToStory() {
    if (this.isTransitioning) return;
    this.isTransitioning = !0;
    synth.getCtx();
    if (this.videoObj) {
      try { this.videoObj.stop(); this.videoObj.destroy(); } catch (e) {}
    }
    this.cameras.main.fade(350, 0, 0, 0, !1, (c, p) => {
      if (p === 1) this.scene.start('StoryVideoScene');
    });
  }
}

class StoryVideoScene extends Phaser.Scene {
  constructor() { super('StoryVideoScene'); }
  create() {
    synth.stopMenuBGM();
    const W = this.scale.width, H = this.scale.height;
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000).setDepth(0);
    this.skipPressCount = 0;
    this.isTransitioning = !1;

    // Play story.mp4 with audio and responsive fit (jaise pehle tha)
    if (this.cache.video.exists('story-video')) {
      try {
        this.videoObj = this.add.video(W / 2, H / 2, 'story-video').setOrigin(0.5).setMute(!1).setVolume(1.0).setDepth(1);
        this.videoObj.play();
        const fit = () => {
          if (this.videoObj?.video?.videoWidth > 0) {
            this.videoObj.setScale(Math.min(W / this.videoObj.video.videoWidth, H / this.videoObj.video.videoHeight));
          }
        };
        this.videoObj.on('play', fit);
        this.videoObj.on('unlocked', fit);
        this.time.addEvent({ delay: 100, repeat: 10, callback: fit });
        this.videoObj.on('complete', () => this.goToTitle());
        if (this.videoObj.video) {
          this.videoObj.video.addEventListener('ended', () => this.goToTitle());
        }
      } catch (e) {
        this.goToTitle();
      }
    } else {
      this.time.delayedCall(300, () => this.goToTitle());
    }

    // Skip prompt at bottom (original behavior: 2-tap to skip)
    this.skipPrompt = this.add.text(W / 2, H - 35, '', {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0).setDepth(100);

    const onSkip = () => {
      this.goToTitle();
    };
    ['keydown-SPACE', 'keydown-ENTER'].forEach(e => this.input.keyboard.on(e, onSkip));
    this.input.on('pointerdown', onSkip);

    // Sleek direct SKIP button at top-right
    const skipBtn = this.add.container(W - 65, 30).setDepth(100);
    const sGfx = this.add.graphics();
    sGfx.fillStyle(0x0c0714, 0.80);
    sGfx.fillRoundedRect(-45, -16, 90, 32, 8);
    sGfx.lineStyle(1.8, 0xffd700, 0.9);
    sGfx.strokeRoundedRect(-45, -16, 90, 32, 8);
    const sTxt = this.add.text(0, 0, 'SKIP ⏭️', {
      fontFamily: 'Arial Black',
      fontSize: '12px',
      color: '#ffd700'
    }).setOrigin(0.5);
    skipBtn.add([sGfx, sTxt]);
    skipBtn.setSize(90, 32);
    skipBtn.setInteractive({ useHandCursor: !0 });
    skipBtn.on('pointerdown', (p, x, y, event) => {
      if (event) event.stopPropagation();
      this.goToTitle();
    });
  }

  update() {
    if (this.videoObj?.video?.videoWidth > 0) {
      const sc = Math.min(this.scale.width / this.videoObj.video.videoWidth, this.scale.height / this.videoObj.video.videoHeight);
      if (Math.abs(this.videoObj.scaleX - sc) > 0.001) this.videoObj.setScale(sc);
    }
  }

  goToTitle() {
    if (this.isTransitioning) return;
    this.isTransitioning = !0;
    synth.getCtx();
    if (this.videoObj) {
      try { this.videoObj.stop(); this.videoObj.destroy(); } catch (e) {}
    }
    this.cameras.main.fade(300, 0, 0, 0, !1, (c, p) => {
      if (p === 1) this.scene.start('TitleScene');
    });
  }
}

class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }
  create() {
    document.body.style.backgroundColor = '#0b101c';
    this.activeModal = null;
    const W = this.scale.width, H = this.scale.height;

    // Continuous Menu BGM (home bgm.mp3) across home, settings, credits, controls & level select
    synth.playMenuBGM();

    // 1. Ultra-High 4K Video / Image Title Background
    const titleBgImg = this.textures.exists('title_bg') ? 'title_bg' : 'bg-sky';
    const fallbackBg = this.add.image(W / 2, H / 2, titleBgImg).setDisplaySize(W, H).setDepth(0);

    if (this.cache.video.exists('title-bg-video')) {
      try {
        const bgVid = this.add.video(W / 2, H / 2, 'title-bg-video').setOrigin(0.5).setMute(!0).setDepth(1);
        bgVid.play(!0); // loop softly
        const fitVideo = () => {
          if (bgVid?.video?.videoWidth > 0) {
            const sc = Math.max(W / bgVid.video.videoWidth, H / bgVid.video.videoHeight);
            bgVid.setScale(sc);
            fallbackBg.setVisible(!1);
          }
        };
        bgVid.on('play', fitVideo);
        bgVid.on('unlocked', fitVideo);
        if (bgVid.video) {
          bgVid.video.loop = !0;
          bgVid.video.muted = !0;
          bgVid.video.playsInline = !0;
          bgVid.video.setAttribute('playsinline', '');
          bgVid.video.setAttribute('webkit-playsinline', '');
          bgVid.video.addEventListener('loadeddata', fitVideo);
        }
        this.time.addEvent({ delay: 100, repeat: 10, callback: fitVideo });
        this.events.once('shutdown', () => {
          try { bgVid.stop(); bgVid.destroy(); } catch (e) {}
        });
      } catch (e) {}
    }

    // 2. Left-Bottom Corner: Character (assets/player shoot.png) - Smooth gentle bounce & interactive tap
    const pTexture = this.textures.exists('player_shoot_title') ? 'player_shoot_title' : 'player_shoot';
    const princeHeight = 295;
    const pSource = this.textures.get(pTexture).getSourceImage();
    const pAspect = (pSource?.width && pSource?.height) ? (pSource.width / pSource.height) : (1187 / 1287);
    const princeWidth = Math.round(princeHeight * pAspect);

    const princeImg = this.add.image(18, H, pTexture)
      .setOrigin(0, 1)
      .setDisplaySize(princeWidth, princeHeight)
      .setDepth(10)
      .setInteractive({ useHandCursor: !0 });

    princeImg.on('pointerdown', () => {
      synth.getCtx();
      if (synth.jump) synth.jump();
      this.scene.start('LevelSelectScene');
    });

    this.tweens.add({
      targets: princeImg,
      y: H - 8,
      duration: 1500,
      yoyo: !0,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 3. Right-Top Corner: Settings Gear Icon
    const gearBtn = this.add.container(W - 42, 38).setDepth(25);
    const gearGfx = this.add.graphics();
    const drawGearBtn = (isHover) => {
      gearGfx.clear();
      gearGfx.fillStyle(isHover ? 0x241402 : 0x140a00, isHover ? 0.90 : 0.75);
      gearGfx.fillCircle(0, 0, 20);
      gearGfx.lineStyle(isHover ? 2.5 : 1.5, isHover ? 0xffea00 : 0xffd700, 1.0);
      gearGfx.strokeCircle(0, 0, 20);
      if (isHover) {
        gearGfx.lineStyle(5, 0xffd700, 0.35);
        gearGfx.strokeCircle(0, 0, 22);
      }
    };
    drawGearBtn(!1);

    const gearTxt = this.add.text(0, -1, '⚙️', {
      fontFamily: 'Arial',
      fontSize: '18px'
    }).setOrigin(0.5);

    gearBtn.add([gearGfx, gearTxt]);
    gearBtn.setSize(40, 40);
    gearBtn.setInteractive({ useHandCursor: !0 });

    gearBtn.on('pointerover', () => {
      drawGearBtn(!0);
      this.tweens.add({ targets: gearBtn, scale: 1.12, rotation: 0.5, duration: 160, ease: 'Quad.easeOut' });
    });
    gearBtn.on('pointerout', () => {
      drawGearBtn(!1);
      this.tweens.add({ targets: gearBtn, scale: 1.0, rotation: 0, duration: 160, ease: 'Quad.easeOut' });
    });
    gearBtn.on('pointerdown', () => {
      synth.getCtx();
      this.openSettingsModal();
    });

    // 4. Right-Bottom Corner: Single Column List (PLAY on top, NO arrow, CONTROLS, LEADERBOARD, CREDITS, EXIT)
    const makeMenuBtn = (x, y, w, h, labelText, isPrimary, onClick) => {
      const container = this.add.container(x, y).setDepth(20);
      const bg = this.add.graphics();
      const drawBtn = (isHover) => {
        bg.clear();
        if (isPrimary) {
          bg.fillStyle(isHover ? 0x341800 : 0x221000, isHover ? 0.95 : 0.88);
          bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
          bg.lineStyle(isHover ? 3 : 2, isHover ? 0xfff000 : 0xffea00, 1.0);
          bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
          bg.lineStyle(isHover ? 6 : 4, 0xffd700, isHover ? 0.60 : 0.35);
          bg.strokeRoundedRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4, 12);
        } else {
          bg.fillStyle(isHover ? 0x241402 : 0x140a02, isHover ? 0.92 : 0.78);
          bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
          bg.lineStyle(isHover ? 2.5 : 1.5, isHover ? 0xffea00 : 0xd4af37, isHover ? 1.0 : 0.75);
          bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
          if (isHover) {
            bg.lineStyle(5, 0xffd700, 0.35);
            bg.strokeRoundedRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4, 10);
          }
        }
      };
      drawBtn(!1);

      const label = this.add.text(0, 0, labelText, {
        fontFamily: 'Arial Black',
        fontSize: isPrimary ? '16px' : '12px',
        color: isPrimary ? '#fff4b8' : (labelText === 'EXIT' ? '#ffaa66' : '#ffd700'),
        stroke: '#180a00',
        strokeThickness: isPrimary ? 4 : 3
      }).setOrigin(0.5);

      container.add([bg, label]);
      container.setSize(w, h);
      container.setInteractive({ useHandCursor: !0 });

      container.on('pointerover', () => {
        drawBtn(!0);
        this.tweens.add({ targets: container, scale: isPrimary ? 1.07 : 1.05, duration: 120, ease: 'Quad.easeOut' });
      });
      container.on('pointerout', () => {
        drawBtn(!1);
        this.tweens.add({ targets: container, scale: 1.0, duration: 120, ease: 'Quad.easeOut' });
      });
      container.on('pointerdown', () => {
        synth.getCtx();
        this.tweens.add({
          targets: container,
          scale: 0.94,
          duration: 70,
          yoyo: !0,
          onComplete: () => {
            drawBtn(!1);
            onClick();
          }
        });
      });

      return container;
    };

    const colX = W - 24 - 76; // 860
    const bW = 152;
    const playH = 40, itemH = 33, gap = 6;
    const totalH = playH + itemH * 5 + gap * 5; // 235px
    const startY = (H - 18) - totalH; // 287px

    const y1 = startY + playH / 2; // 307
    const y2 = y1 + playH / 2 + gap + itemH / 2; // 349.5
    const y3 = y2 + itemH + gap; // 388.5
    const y4 = y3 + itemH + gap; // 427.5
    const y5 = y4 + itemH + gap; // 466.5
    const y6 = y5 + itemH + gap; // 505.5

    // Single Column arrangement: PLAY on top, followed by NEW GAME, CONTROLS, STORY, CREDITS, EXIT
    makeMenuBtn(colX, y1, bW, playH, 'PLAY', !0, () => {
      if (!this.activeModal) this.scene.start('LevelSelectScene');
    });
    makeMenuBtn(colX, y2, bW, itemH, 'NEW GAME', !1, () => {
      if (!this.activeModal) {
        synth.getCtx();
        synth.stopMenuBGM();
        this.scene.start('PlayScene', { currentLevel: 1, currentScore: 0, currentLives: 5 });
      }
    });
    makeMenuBtn(colX, y3, bW, itemH, 'CONTROLS', !1, () => this.showHTP());
    makeMenuBtn(colX, y4, bW, itemH, 'STORY', !1, () => {
      if (!this.activeModal) {
        synth.getCtx();
        synth.stopMenuBGM();
        this.scene.start('StoryVideoScene');
      }
    });
    makeMenuBtn(colX, y5, bW, itemH, 'CREDITS', !1, () => this.showCredits());
    makeMenuBtn(colX, y6, bW, itemH, 'EXIT', !1, () => this.showExitModal());

    // Enter / Space to start play
    const enterPlay = () => {
      if (!this.activeModal) {
        synth.getCtx();
        this.scene.start('LevelSelectScene');
      }
    };
    ['keydown-ENTER', 'keydown-SPACE'].forEach(e => this.input.keyboard.on(e, enterPlay));

    // Global 'F' key toggle fullscreen
    const toggleFS = () => {
      const isFS = () => !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
      if (!isFS()) {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    };
    this.input.keyboard.on('keydown-F', toggleFS);
  }

  // Royal Realm Settings Pop-up Modal (Aesthetic 3D Gold & Obsidian physical controls)
  openSettingsModal() {
    if (this.activeModal) return;
    const W = this.scale.width, H = this.scale.height;
    const g = this.add.group();
    this.activeModal = g;

    // 1. Semi-translucent dark vignette backdrop
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(300).setInteractive();

    // 2. Ornate Royal Obsidian & Velvet Glass Panel (Width 520, Height 410)
    const cardW = 520, cardH = 410, cardX = W / 2, cardY = H / 2;
    const cardGfx = this.add.graphics().setDepth(301);

    // Deep royal obsidian fill with subtle purple-gold ambiance
    cardGfx.fillStyle(0x0a0512, 0.97);
    cardGfx.fillRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 20);

    // Dual-tone heavy royal golden filigree frame
    cardGfx.lineStyle(3, 0xffd700, 0.95);
    cardGfx.strokeRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 20);
    cardGfx.lineStyle(1.5, 0xffea70, 0.45);
    cardGfx.strokeRoundedRect(cardX - cardW / 2 + 5, cardY - cardH / 2 + 5, cardW - 10, cardH - 10, 16);

    // Corner ornate fleur diamonds
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => {
      const cx = cardX + dx * (cardW / 2 - 16), cy = cardY + dy * (cardH / 2 - 16);
      cardGfx.fillStyle(0xffd700, 0.9);
      cardGfx.fillCircle(cx, cy, 3.5);
    });

    // Ornate Royal Header
    const crownTxt = this.add.text(cardX, cardY - 165, '✦ ROYAL REALM SETTINGS ✦', {
      fontFamily: 'Cinzel, Georgia, serif', fontSize: '20px', color: '#ffd700', fontStyle: 'bold', stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(302);

    const subTxt = this.add.text(cardX, cardY - 140, 'Master Audio, Visual Display & Realm Ambience', {
      fontFamily: 'Arial', fontSize: '11px', color: '#d4af37', fontStyle: 'italic'
    }).setOrigin(0.5).setDepth(302);

    // Decorative golden divider line
    const divider = this.add.graphics().setDepth(302);
    divider.lineStyle(1.5, 0xffd700, 0.6);
    divider.lineBetween(cardX - 210, cardY - 128, cardX + 210, cardY - 128);

    // Helper: Real Look 3D Embossed Physical Button generator
    const makeRealBtn = (x, y, w, h, baseCol, activeCol, isActiveFn, getLabelFn, onToggle) => {
      const btnCont = this.add.container(x, y).setDepth(303);
      const bgGfx = this.add.graphics();
      const txt = this.add.text(0, 0, '', {
        fontFamily: 'Arial Black', fontSize: '12px', color: '#ffffff', stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5);

      const render = (isHover = !1) => {
        bgGfx.clear();
        const active = isActiveFn();
        const fillCol = active ? (isHover ? activeCol.hover : activeCol.base) : (isHover ? baseCol.hover : baseCol.base);
        const rimCol = active ? (isHover ? 0xffea70 : 0xffd700) : (isHover ? 0xaaaaaa : 0x777777);

        // 3D Drop shadow
        bgGfx.fillStyle(0x000000, 0.6);
        bgGfx.fillRoundedRect(-w / 2, -h / 2 + 3, w, h, 10);

        // Physical base plate
        bgGfx.fillStyle(fillCol, 1);
        bgGfx.fillRoundedRect(-w / 2, -h / 2, w, h, 10);

        // Top specular bevel highlight
        bgGfx.fillStyle(0xffffff, active ? 0.25 : 0.12);
        bgGfx.fillRoundedRect(-w / 2 + 2, -h / 2 + 2, w - 4, Math.floor(h / 2) - 2, 8);

        // Embossed metallic border
        bgGfx.lineStyle(isHover ? 2.5 : 1.5, rimCol, 1);
        bgGfx.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);

        txt.setText(getLabelFn(active));
      };

      render(!1);
      btnCont.add([bgGfx, txt]);
      btnCont.setSize(w, h);
      btnCont.setInteractive({ useHandCursor: !0 });

      btnCont.on('pointerover', () => { render(!0); btnCont.setScale(1.02); });
      btnCont.on('pointerout', () => { render(!1); btnCont.setScale(1.0); });
      btnCont.on('pointerdown', () => {
        synth.getCtx();
        onToggle();
        render(!0);
      });

      return { container: btnCont, update: () => render(!1) };
    };

    // SECTION 1: Modern Royal Aesthetic On/Off Controls (No redundant header)
    let bgmBtn, sfxBtn;
    bgmBtn = makeRealBtn(
      cardX - 115, cardY - 78, 215, 44,
      { base: 0x381216, hover: 0x501820 },
      { base: 0x143c1c, hover: 0x1f5428 },
      () => window.gameSettings.bgmEnabled,
      (active) => active ? '🎵 MUSIC: ON' : '🔇 MUSIC: OFF',
      () => {
        window.gameSettings.bgmEnabled = !window.gameSettings.bgmEnabled;
        synth.updateMenuBGMVolume();
        if (window.gameSettings.bgmEnabled) synth.playMenuBGM();
        else synth.pauseMenuBGM();
        synth.beep(window.gameSettings.bgmEnabled ? 580 : 290, 0.1, 'triangle', 0.15);
        if (volControls) volControls.update();
      }
    );

    sfxBtn = makeRealBtn(
      cardX + 115, cardY - 78, 215, 44,
      { base: 0x381216, hover: 0x501820 },
      { base: 0x143c1c, hover: 0x1f5428 },
      () => window.gameSettings.sfxEnabled,
      (active) => active ? '🔔 SOUND: ON' : '🔕 SOUND: OFF',
      () => {
        window.gameSettings.sfxEnabled = !window.gameSettings.sfxEnabled;
        synth.beep(window.gameSettings.sfxEnabled ? 660 : 330, 0.1, 'triangle', 0.18);
      }
    );

    // SECTION 2: BGM Volume Control (Volume Slider / Step Buttons)
    const s2Title = this.add.text(cardX - 220, cardY - 26, '🎵 BGM VOLUME LEVEL', {
      fontFamily: 'Arial Black', fontSize: '12px', color: '#ffd700'
    }).setDepth(302);

    const volGfx = this.add.graphics().setDepth(303);
    const volTxt = this.add.text(cardX, cardY - 2, '', {
      fontFamily: 'Arial Black', fontSize: '12px', color: '#ffea70'
    }).setOrigin(0.5).setDepth(304);

    const presetBtns = [];
    const volLevels = [
      { label: '25%', val: 0.25 },
      { label: '50%', val: 0.50 },
      { label: '75%', val: 0.75 },
      { label: '100%', val: 1.0 }
    ];

    const updateVolDisplay = () => {
      const vol = (window.gameSettings.bgmVolume !== undefined ? window.gameSettings.bgmVolume : 0.7);
      volGfx.clear();
      // Track background stretched nicely
      volGfx.fillStyle(0x1a1224, 1);
      volGfx.fillRoundedRect(cardX - 215, cardY - 13, 430, 22, 11);
      volGfx.lineStyle(1.5, 0xd4af37, 0.75);
      volGfx.strokeRoundedRect(cardX - 215, cardY - 13, 430, 22, 11);

      // Filled volume bar
      const fillW = Math.max(0, Math.min(426, Math.round(426 * vol)));
      if (fillW > 0 && window.gameSettings.bgmEnabled) {
        volGfx.fillStyle(0xffd700, 0.95);
        volGfx.fillRoundedRect(cardX - 213, cardY - 11, fillW, 18, 9);
        volGfx.fillStyle(0xffffff, 0.45);
        volGfx.fillRoundedRect(cardX - 213, cardY - 11, fillW, 8, 7);
      }

      volTxt.setText(`ROYAL BGM: ${Math.round(vol * 100)}%${!window.gameSettings.bgmEnabled ? ' (MUTED)' : ''}`);

      presetBtns.forEach(p => p.update());
    };

    volLevels.forEach((lvl, idx) => {
      const bx = cardX - 165 + idx * 110;
      const pBtn = makeRealBtn(
        bx, cardY + 36, 95, 30,
        { base: 0x1f1430, hover: 0x342050 },
        { base: 0x8a6208, hover: 0xb38600 },
        () => Math.abs((window.gameSettings.bgmVolume || 0.7) - lvl.val) < 0.08,
        () => lvl.label,
        () => {
          window.gameSettings.bgmVolume = lvl.val;
          synth.updateMenuBGMVolume();
          updateVolDisplay();
          synth.beep(400 + lvl.val * 300, 0.08, 'sine', 0.15);
        }
      );
      presetBtns.push(pBtn);
    });

    const volControls = { update: updateVolDisplay };
    updateVolDisplay();

    // SECTION 3: Dedicated Fullscreen Button ("full screen button hona chahiye")
    const isFS = () => !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    const fsBtn = makeRealBtn(
      cardX, cardY + 95, 440, 42,
      { base: 0x102035, hover: 0x183252 },
      { base: 0x3d1052, hover: 0x5a187a },
      () => isFS(),
      (active) => active ? '🗗 EXIT FULLSCREEN (WINDOWED)' : '⛶ ENTER FULLSCREEN (EXPAND VIEW)',
      () => {
        if (!isFS()) {
          const el = document.documentElement;
          if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
          else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        } else {
          if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
        setTimeout(() => fsBtn.update(), 150);
        synth.beep(520, 0.09, 'triangle', 0.16);
      }
    );

    // SECTION 4: Ornate Royal Close Button
    const closeBtn = makeRealBtn(
      cardX, cardY + 155, 280, 38,
      { base: 0x37474f, hover: 0x455a64 },
      { base: 0xb71c1c, hover: 0xd32f2f },
      () => !0,
      () => '✖ CLOSE REALM SETTINGS',
      () => closeModal()
    );

    const closeModal = () => {
      overlay.off('pointerdown', closeModal);
      g.destroy(!0);
      this.activeModal = null;
    };
    overlay.on('pointerdown', closeModal);

    g.addMultiple([
      overlay, cardGfx, crownTxt, subTxt, divider,
      bgmBtn.container, sfxBtn.container,
      s2Title, volGfx, volTxt, ...presetBtns.map(p => p.container),
      fsBtn.container,
      closeBtn.container
    ]);
  }

  // How to Play Fullscreen Artwork Modal
  showHTP() {
    if (this.activeModal) return;
    const W = this.scale.width, H = this.scale.height;
    const g = this.add.group();
    this.activeModal = g;

    const bgDim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setInteractive().setDepth(300);
    const howtoBgKey = this.textures.exists('howto_bg') ? 'howto_bg' : 'title_bg';
    const howtoImg = this.add.image(W / 2, H / 2, howtoBgKey).setDisplaySize(W, H).setInteractive().setDepth(301);

    const cTxt = this.add.text(W / 2, H - 24, '✖ TAP ANYWHERE TO CLOSE', {
      fontFamily: 'Arial Black', fontSize: '13px', color: '#ffd700', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(302);
    this.tweens.add({ targets: cTxt, alpha: 0.35, duration: 600, yoyo: !0, repeat: -1 });

    g.addMultiple([bgDim, howtoImg, cTxt]);

    this.time.delayedCall(120, () => {
      const close = () => {
        this.input.keyboard.off('keydown', close);
        bgDim.off('pointerdown', close);
        howtoImg.off('pointerdown', close);
        g.destroy(!0);
        this.activeModal = null;
      };
      this.input.keyboard.once('keydown', close);
      bgDim.once('pointerdown', close);
      howtoImg.once('pointerdown', close);
    });
  }

  // Leaderboard Modal
  showLeaderboard() {
    if (this.activeModal) return;
    const W = this.scale.width, H = this.scale.height;
    const g = this.add.group();
    this.activeModal = g;

    const bg = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setInteractive().setDepth(300);
    const card = this.add.rectangle(W / 2, H / 2, 580, 410, 0x0f0b18, 0.98).setStrokeStyle(3, 0xffd700).setDepth(301);
    const title = this.add.text(W / 2, H / 2 - 165, '🏆 HALL OF WARRIORS 🏆', { fontFamily: 'Arial Black', fontSize: '22px', color: '#ffd700', stroke: '#7a2fbf', strokeThickness: 6 }).setOrigin(0.5).setDepth(302);
    const sub = this.add.text(W / 2, H / 2 - 130, '★ TOP REALM HIGH SCORES ★', { fontFamily: 'Arial Black', fontSize: '11px', color: '#38bdf8' }).setOrigin(0.5).setDepth(302);

    const scores = [
      { rank: '👑 1', name: 'VAIBHAV (VJ)', score: '28,500', title: 'SUPREME REALM CHAMPION' },
      { rank: '🥈 2', name: 'ARJUN', score: '24,200', title: 'THAR DESERT CONQUEROR' },
      { rank: '🥉 3', name: 'VEER', score: '21,800', title: 'KALINGA NIGHT GUARDIAN' },
      { rank: '🎖️ 4', name: 'KABIR', score: '18,900', title: 'HIMALAYAN FROST RUNNER' },
      { rank: '🎖️ 5', name: 'DHRUV', score: '16,400', title: 'JAL MAHAL WATER SEEKER' }
    ];

    scores.forEach((s, i) => {
      const y = H / 2 - 80 + i * 44;
      const rowBg = this.add.rectangle(W / 2, y, 520, 36, i === 0 ? 0x2e1e05 : 0x181324, 0.9).setStrokeStyle(1.5, i === 0 ? 0xffd700 : 0x4a3a60).setDepth(302);
      const rTxt = this.add.text(W / 2 - 230, y, s.rank, { fontFamily: 'Arial Black', fontSize: '14px', color: '#ffd700' }).setOrigin(0, 0.5).setDepth(303);
      const nTxt = this.add.text(W / 2 - 140, y, s.name, { fontFamily: 'Arial Black', fontSize: '13px', color: '#ffffff' }).setOrigin(0, 0.5).setDepth(303);
      const tTxt = this.add.text(W / 2 + 10, y, s.title, { fontFamily: 'Arial', fontSize: '10px', color: '#94a3b8' }).setOrigin(0, 0.5).setDepth(303);
      const sTxt = this.add.text(W / 2 + 230, y, `${s.score} PTS`, { fontFamily: 'Arial Black', fontSize: '13px', color: '#00ffff' }).setOrigin(1, 0.5).setDepth(303);
      g.addMultiple([rowBg, rTxt, nTxt, tTxt, sTxt]);
    });

    const cTxt = this.add.text(W / 2, H / 2 + 168, '✖ TAP ANYWHERE TO CLOSE', { fontFamily: 'Arial Black', fontSize: '13px', color: '#ff5555' }).setOrigin(0.5).setDepth(303);
    this.tweens.add({ targets: cTxt, alpha: 0.4, duration: 600, yoyo: !0, repeat: -1 });

    g.addMultiple([bg, card, title, sub, cTxt]);

    this.time.delayedCall(120, () => {
      const close = () => {
        this.input.keyboard.off('keydown', close);
        bg.off('pointerdown', close);
        g.destroy(!0);
        this.activeModal = null;
      };
      this.input.keyboard.once('keydown', close);
      bg.once('pointerdown', close);
    });
  }

  // Credits Artwork Modal
  showCredits() {
    if (this.activeModal) return;
    const W = this.scale.width, H = this.scale.height;
    const g = this.add.group();
    this.activeModal = g;

    const bgDim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.90).setInteractive().setDepth(300);

    let creditsImg = null;
    if (this.textures.exists('credits_img')) {
      creditsImg = this.add.image(W / 2, H / 2, 'credits_img').setDisplaySize(W, H).setInteractive().setDepth(301);
      g.addMultiple([bgDim, creditsImg]);
    } else {
      const card = this.add.rectangle(W / 2, H / 2, 680, 420, 0x0d1117, 0.98).setStrokeStyle(3, 0xffcc00).setDepth(301);
      const title = this.add.text(W / 2, H / 2 - 170, 'THE LEGEND OF VJ — CHRONICLES', { fontFamily: 'Arial Black', fontSize: '20px', color: '#ffcc00', stroke: '#7a2fbf', strokeThickness: 5 }).setOrigin(0.5).setDepth(302);
      const lore = `When the ancient elemental harmony was disrupted, 5 Sacred Gems were scattered across 7 dangerous Indian territories — Shivalik Hills, the mystical Sunderbans, scorching Thar Desert, Kalinga Midnight, the frozen Himalayan storms, the submerged Jal Mahal Palace, and the storm heights of Meghalaya.\n\nTaking up the warrior mantle, VJ ventures through each territory to vanquish mystical beasts, collect all 5 gems, and hoist the royal purple VJ crest atop the castles.`;
      const loreTxt = this.add.text(W / 2, H / 2 - 50, lore, { fontFamily: 'Arial', fontSize: '13px', color: '#e2e8f0', align: 'center', wordWrap: { width: 610 }, lineSpacing: 4 }).setOrigin(0.5).setDepth(302);
      const credCard = this.add.rectangle(W / 2, H / 2 + 88, 620, 75, 0x161b22).setStrokeStyle(1.5, 0x7a2fbf).setDepth(302);
      const devTxt = this.add.text(W / 2, H / 2 + 76, 'LEAD CREATOR & DEVELOPER: VAIBHAV JAIN', { fontFamily: 'Arial Black', fontSize: '15px', color: '#ffd700' }).setOrigin(0.5).setDepth(303);
      const subCred = this.add.text(W / 2, H / 2 + 102, 'VJ World Studios • 2026 Live Edition • Phaser 3 Engine', { fontFamily: 'Arial', fontSize: '12px', color: '#38bdf8' }).setOrigin(0.5).setDepth(303);
      g.addMultiple([bgDim, card, title, loreTxt, credCard, devTxt, subCred]);
    }

    this.time.delayedCall(120, () => {
      const close = () => {
        this.input.keyboard.off('keydown', close);
        bgDim.off('pointerdown', close);
        if (creditsImg) creditsImg.off('pointerdown', close);
        g.destroy(!0);
        this.activeModal = null;
      };
      this.input.keyboard.once('keydown', close);
      bgDim.once('pointerdown', close);
      if (creditsImg) creditsImg.once('pointerdown', close);
    });
  }

  // Exit Modal
  showExitModal() {
    if (this.activeModal) return;
    const W = this.scale.width, H = this.scale.height;
    const g = this.add.group();
    this.activeModal = g;

    const bg = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setInteractive().setDepth(300);
    const card = this.add.rectangle(W / 2, H / 2, 420, 220, 0x120c1c, 0.98).setStrokeStyle(3, 0xffd700).setDepth(301);
    const title = this.add.text(W / 2, H / 2 - 65, '🚪 EXIT REALM', { fontFamily: 'Arial Black', fontSize: '20px', color: '#ffcc00' }).setOrigin(0.5).setDepth(302);
    const prompt = this.add.text(W / 2, H / 2 - 20, 'Are you sure you want to leave the adventure?', { fontFamily: 'Arial', fontSize: '14px', color: '#e2e8f0' }).setOrigin(0.5).setDepth(302);

    const cancelBtn = this.add.text(W / 2 - 80, H / 2 + 45, 'STAY & PLAY', {
      fontFamily: 'Arial Black', fontSize: '13px', color: '#fff', backgroundColor: '#2e7d32', padding: { x: 14, y: 8 }
    }).setOrigin(0.5).setDepth(302).setInteractive({ useHandCursor: !0 });

    const quitBtn = this.add.text(W / 2 + 80, H / 2 + 45, 'EXIT GAME', {
      fontFamily: 'Arial Black', fontSize: '13px', color: '#fff', backgroundColor: '#c62828', padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setDepth(302).setInteractive({ useHandCursor: !0 });

    const closeModal = () => {
      bg.off('pointerdown', closeModal);
      cancelBtn.off('pointerdown', closeModal);
      g.destroy(!0);
      this.activeModal = null;
    };
    bg.on('pointerdown', closeModal);
    cancelBtn.on('pointerdown', closeModal);

    quitBtn.on('pointerdown', () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      closeModal();
      this.add.text(W / 2, H / 2, 'THANK YOU FOR PLAYING!\n★ VJ WORLD STUDIOS ★', {
        fontFamily: 'Arial Black', fontSize: '22px', color: '#ffd700', stroke: '#000', strokeThickness: 6, align: 'center'
      }).setOrigin(0.5).setDepth(500);
    });

    g.addMultiple([bg, card, title, prompt, cancelBtn, quitBtn]);
  }
}

class LevelSelectScene extends Phaser.Scene {
  constructor() { super('LevelSelectScene'); }
  create() {
    // Seamless Menu BGM continuation across Title & Level Select
    synth.playMenuBGM();
    const W = this.scale.width, H = this.scale.height;

    // Full screen AI Artwork level background
    const lvlBgKey = this.textures.exists('level_bg') ? 'level_bg' : 'bg-sky';
    this.add.image(W / 2, H / 2, lvlBgKey).setDisplaySize(W, H).setDepth(0);

    // Exact card coordinates for 10 cards mapped from level_bg artwork
    const colXs = [124, 305, 485, 665, 846];
    const cardW = 156;
    const cardH = 148;
    const row1Y = 208;
    const row2Y = 405;

    const cardsData = [
      // Row 1: Levels 1–5
      { lvl: 1, x: colXs[0], y: row1Y },
      { lvl: 2, x: colXs[1], y: row1Y },
      { lvl: 3, x: colXs[2], y: row1Y },
      { lvl: 4, x: colXs[3], y: row1Y },
      { lvl: 5, x: colXs[4], y: row1Y },
      // Row 2: Levels 6–10
      { lvl: 6, x: colXs[0], y: row2Y },
      { lvl: 7, x: colXs[1], y: row2Y },
      { lvl: 8, x: colXs[2], y: row2Y },
      { lvl: 9, x: colXs[3], y: row2Y },
      { lvl: 10, x: colXs[4], y: row2Y }
    ];

    this.selectedIndex = 0;
    this.cardGlows = [];
    this.isStartingLevel = !1;

    cardsData.forEach((c) => {
      const isPlayable = c.lvl <= 7;

      // Glow / border graphics object for visual feedback
      const glow = this.add.graphics({ x: c.x, y: c.y }).setDepth(15).setAlpha(0);
      glow.baseX = c.x;
      glow.baseY = c.y;

      const drawGlow = (bright = !1) => {
        glow.clear();
        glow.lineStyle(bright ? 5 : 4, bright ? 0xffea00 : 0xffd700, 1.0);
        glow.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
        glow.lineStyle(8, 0xffd700, bright ? 0.55 : 0.35);
        glow.strokeRoundedRect(-cardW / 2 - 2, -cardH / 2 - 2, cardW + 4, cardH + 4, 14);
        glow.fillStyle(0xffea00, bright ? 0.12 : 0.08);
        glow.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
      };
      drawGlow(!1);

      this.cardGlows.push(glow);

      // Transparent interactive hitbox
      const hitZone = this.add.zone(c.x, c.y, cardW, cardH).setDepth(20).setInteractive({ useHandCursor: !0 });

      if (isPlayable) {
        hitZone.on('pointerover', () => {
          this.selectedIndex = c.lvl - 1;
          drawGlow(!0);
          glow.setAlpha(1);
          this.tweens.add({ targets: glow, scale: 1.03, duration: 120, ease: 'Quad.easeOut' });
        });

        hitZone.on('pointerout', () => {
          this.tweens.add({
            targets: glow,
            scale: 1.0,
            duration: 120,
            ease: 'Quad.easeOut',
            onComplete: () => {
              drawGlow(!1);
              if (this.selectedIndex !== c.lvl - 1) glow.setAlpha(0);
            }
          });
        });

        const onSelect = () => {
          if (this.isStartingLevel) return;
          this.isStartingLevel = !0;
          try {
            synth.getCtx();
            synth.stopMenuBGM();
            this.scene.start('PlayScene', { currentLevel: c.lvl, currentScore: 0, currentLives: 5 });
          } catch (err) {
            console.error('PlayScene launch error:', err);
            this.isStartingLevel = !1;
          }
        };
        hitZone.on('pointerdown', onSelect);
        hitZone.on('pointerup', onSelect);
      } else {
        hitZone.on('pointerover', () => {
          this.selectedIndex = c.lvl - 1;
        });

        const onLocked = () => {
          synth.beep(160, 0.14, 'sawtooth', 0.15);

          // Subtle shake animation on the card hitbox
          glow.clear();
          glow.lineStyle(4, 0xff4444, 0.95);
          glow.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
          glow.fillStyle(0xff0000, 0.15);
          glow.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
          glow.setAlpha(1);

          this.tweens.add({
            targets: glow,
            x: c.x + 7,
            duration: 40,
            yoyo: !0,
            repeat: 4,
            onComplete: () => {
              glow.setX(c.x);
              glow.setAlpha(0);
              drawGlow(!1);
            }
          });

          // Floating locked indicator
          const lockTxt = this.add.text(c.x, c.y, '🔒 LOCKED', {
            fontFamily: 'Arial Black',
            fontSize: '15px',
            color: '#ff4444',
            stroke: '#000000',
            strokeThickness: 4
          }).setOrigin(0.5).setDepth(30);

          this.tweens.add({
            targets: lockTxt,
            y: c.y - 30,
            alpha: 0,
            duration: 750,
            onComplete: () => lockTxt.destroy()
          });
        };
        hitZone.on('pointerdown', onLocked);
        hitZone.on('pointerup', onLocked);
      }
    });

    // Sleek BACK TO TITLE button at bottom center
    const backBtn = this.add.container(W / 2, 514).setDepth(25);
    const backGfx = this.add.graphics();
    const drawBackGfx = (isHover) => {
      backGfx.clear();
      backGfx.fillStyle(isHover ? 0x221200 : 0x100a00, isHover ? 0.88 : 0.70);
      backGfx.fillRoundedRect(-95, -16, 190, 32, 10);
      backGfx.lineStyle(isHover ? 2.5 : 1.5, isHover ? 0xffea00 : 0xd4af37, isHover ? 1.0 : 0.8);
      backGfx.strokeRoundedRect(-95, -16, 190, 32, 10);
      if (isHover) {
        backGfx.lineStyle(5, 0xffd700, 0.35);
        backGfx.strokeRoundedRect(-97, -18, 194, 36, 12);
      }
    };
    drawBackGfx(!1);

    const backTxt = this.add.text(0, 0, '⬅ BACK TO TITLE', {
      fontFamily: 'Arial Black',
      fontSize: '12px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    backBtn.add([backGfx, backTxt]);
    backBtn.setSize(190, 32);
    backBtn.setInteractive({ useHandCursor: !0 });

    backBtn.on('pointerover', () => {
      drawBackGfx(!0);
      this.tweens.add({ targets: backBtn, scale: 1.05, duration: 140, ease: 'Quad.easeOut' });
    });

    backBtn.on('pointerout', () => {
      drawBackGfx(!1);
      this.tweens.add({ targets: backBtn, scale: 1.0, duration: 140, ease: 'Quad.easeOut' });
    });

    const onBack = () => {
      synth.getCtx();
      this.scene.start('TitleScene');
    };
    backBtn.on('pointerdown', onBack);
    backBtn.on('pointerup', onBack);

    // Keyboard support for level selection
    const updateHighlights = () => {
      this.cardGlows.forEach((g, idx) => {
        if (idx < 7) {
          g.setAlpha(idx === this.selectedIndex ? 1 : 0);
        }
      });
    };
    updateHighlights();

    this.input.keyboard.on('keydown-LEFT', () => {
      synth.getCtx();
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      updateHighlights();
    });
    this.input.keyboard.on('keydown-RIGHT', () => {
      synth.getCtx();
      this.selectedIndex = Math.min(6, this.selectedIndex + 1);
      updateHighlights();
    });
    this.input.keyboard.on('keydown-UP', () => {
      if (this.selectedIndex >= 5) {
        synth.getCtx();
        this.selectedIndex -= 5;
        updateHighlights();
      }
    });
    this.input.keyboard.on('keydown-DOWN', () => {
      if (this.selectedIndex < 2) {
        synth.getCtx();
        this.selectedIndex += 5;
        updateHighlights();
      }
    });

    const enterFn = () => {
      synth.getCtx();
      if (this.selectedIndex < 7) {
        this.scene.start('PlayScene', { currentLevel: this.selectedIndex + 1, currentScore: 0, currentLives: 5 });
      }
    };
    ['keydown-ENTER', 'keydown-SPACE'].forEach(e => this.input.keyboard.on(e, enterFn));
  }
}
