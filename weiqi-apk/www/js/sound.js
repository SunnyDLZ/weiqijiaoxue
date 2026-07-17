/**
 * 围棋音效生成器 - 使用Web Audio API合成
 * 生成：落子音、提子音、按钮音、胜利音、提示音等
 */
class SoundGenerator {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.5;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('无法初始化音频:', e);
      this.enabled = false;
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  // 落子音 - 清脆的木质敲击声
  playStonePlace() {
    this.ensureContext();
    if (!this.enabled || !this.audioContext) return;
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // 短促的木质感敲击
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(500, now + 0.06);

    gain.gain.setValueAtTime(this.volume * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // 提子音 - 多个棋子被提起的声音
  playCapture(count = 1) {
    this.ensureContext();
    if (!this.enabled || !this.audioContext) return;
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    for (let i = 0; i < Math.min(count, 5); i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.04;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200 + i * 100, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.06);

      gain.gain.setValueAtTime(this.volume * 0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.08);
    }
  }

  // 按钮点击音
  playClick() {
    this.ensureContext();
    if (!this.enabled || !this.audioContext) return;
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    gain.gain.setValueAtTime(this.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // 胜利音 - 欢快的上升音阶
  playVictory() {
    this.ensureContext();
    if (!this.enabled || !this.audioContext) return;
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.15;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(this.volume * 0.4, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  // 失败音
  playDefeat() {
    this.ensureContext();
    if (!this.enabled || !this.audioContext) return;
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const notes = [400, 350, 300, 250];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.2;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(this.volume * 0.3, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  // 提示音
  playHint() {
    this.ensureContext();
    if (!this.enabled || !this.audioContext) return;
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1100, now + 0.08);

    gain.gain.setValueAtTime(this.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // 通关音效
  playLevelComplete() {
    this.ensureContext();
    if (!this.enabled || !this.audioContext) return;
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const notes = [523, 659, 784, 659, 784, 1047];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(this.volume * 0.4, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  // 游戏开始音
  playGameStart() {
    this.ensureContext();
    if (!this.enabled || !this.audioContext) return;
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.1;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(this.volume * 0.35, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  // 错误音
  playError() {
    this.ensureContext();
    if (!this.enabled || !this.audioContext) return;
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.setValueAtTime(150, now + 0.1);

    gain.gain.setValueAtTime(this.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }
}

// 全局音效实例
const sound = new SoundGenerator();