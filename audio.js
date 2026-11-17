/* =====================================================================
   THE LEGEND OF VJ — audio.js
   RetroSynth audio engine
   ===================================================================== */

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
  thunder() {
    if (!window.gameSettings.sfxEnabled) return;
    try {
      const c = this.getCtx(), now = c.currentTime;
      if (!this._thunderBuffer) {
        const sr = c.sampleRate || 44100;
        const bufferSize = Math.floor(sr * 1.5);
        this._thunderBuffer = c.createBuffer(1, bufferSize, sr);
        const data = this._thunderBuffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          last = (last + (0.02 * white)) / 1.02;
          data[i] = last * 3.5;
        }
      }
      const noise = c.createBufferSource();
      noise.buffer = this._thunderBuffer;
      const filter = c.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, now);
      filter.frequency.exponentialRampToValueAtTime(70, now + 1.4);
      const gain = c.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(c.destination);
      noise.start(now);
      noise.stop(now + 1.5);
    } catch (e) {}
  }
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
          o.type = (lvl === 6 || lvl === 7 || lvl === 2) ? 'sine' : (isFast ? 'sawtooth' : 'triangle'); o.frequency.value = notes[i % notes.length];
          g.gain.value = 0.04; o.connect(g); g.connect(c.destination);
          g.gain.setValueAtTime(0.04, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.14); o.start(t0); o.stop(t0 + 0.16);
        } catch (e) {}
        i++; this.bgmTimer = setTimeout(step, isFast ? 200 : 250);
      };
      step();
    }
  }
  stopBGM() { this.bgmOn = !1; if (this.bgmTimer) clearTimeout(this.bgmTimer); if (this.customMusicInstance) { this.customMusicInstance.stop(); this.customMusicInstance = null; } }

  // Seamless HTML5 Menu BGM Engine (Continuous across TitleScene, Modals & LevelSelectScene)
  initMenuBGM() {
    if (this.menuAudio) return;
    try {
      this.menuAudio = new Audio('assets/home bgm.mp3');
      this.menuAudio.loop = true;
      this.menuAudio.preload = 'auto';
      this.updateMenuBGMVolume();
    } catch (e) {}
  }
  updateMenuBGMVolume() {
    if (!this.menuAudio) return;
    const vol = (window.gameSettings && window.gameSettings.bgmVolume !== undefined) ? window.gameSettings.bgmVolume : 0.7;
    const isEnabled = window.gameSettings ? window.gameSettings.bgmEnabled : !0;
    this.menuAudio.volume = isEnabled ? Math.max(0, Math.min(1, vol)) : 0;
  }
  playMenuBGM() {
    this.initMenuBGM();
    if (!this.menuAudio) return;
    this.updateMenuBGMVolume();
    if (window.gameSettings && !window.gameSettings.bgmEnabled) {
      if (!this.menuAudio.paused) this.menuAudio.pause();
      return;
    }
    if (this.menuAudio.paused) {
      const p = this.menuAudio.play();
      if (p && p.catch) {
        p.catch(() => {
          const unlock = () => {
            if (this.menuAudio && (!window.gameSettings || window.gameSettings.bgmEnabled) && this.menuAudio.paused) {
              this.menuAudio.play().catch(() => {});
            }
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
          };
          window.addEventListener('pointerdown', unlock, { once: !0 });
          window.addEventListener('keydown', unlock, { once: !0 });
        });
      }
    }
  }
  stopMenuBGM() {
    if (this.menuAudio && !this.menuAudio.paused) {
      try {
        this.menuAudio.pause();
        this.menuAudio.currentTime = 0;
      } catch (e) {}
    }
  }
  pauseMenuBGM() {
    if (this.menuAudio && !this.menuAudio.paused) {
      try { this.menuAudio.pause(); } catch (e) {}
    }
  }
}

const synth = new RetroSynth();
