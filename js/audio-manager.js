const AUDIO_CONFIG = {
  background: {
    src: "./audio/background-music_3.mp3",
    loop: true,
    volume: 0.35,
  },
  gameOver: {
    src: "./audio/game-over_4.mp3",
    volume: 0.7,
  },
  win: {
    src: "./audio/win_1.mp3",
    volume: 0.7,
  },
  jump: {
    src: "./audio/jump_2.mp3",
    volume: 0.55,
  },
  bottleSmash: {
    src: "./audio/bottle-smash_2.mp3",
    volume: 0.65,
  },
  collectBottle: {
    src: "./audio/collect-bottle.mp3",
    volume: 0.65,
  },
  collectCoin: {
    src: "./audio/collect-coin_1.mp3",
    volume: 0.65,
  },
  hurt: {
    src: "./audio/got-hurt_1.mp3",
    volume: 0.65,
  },
  enemyDefeat: {
    src: "./audio/chicken-single-alarm-call.mp3",
    volume: 0.55,
  },
};

class AudioManager {
  sounds = {};
  effectBuffers = {};
  activeSources = new Set();
  audioContext = null;
  isMuted = false;
  isUnlocked = false;
  storageKey = "elPolloLocoMuted";

  constructor() {
    this.loadMuteState();
    this.createSounds();
    this.createAudioContext();
    this.loadEffectBuffers();
    this.applyMuteState();
  }

  createSounds() {
    Object.entries(AUDIO_CONFIG).forEach(([name, config]) => {
      this.sounds[name] = this.createAudio(config);
    });
  }

  /**
   * Creates and configures an audio element.
   *
   * @param {Object} config - Audio configuration.
   * @param {string} config.src - Audio file path.
   * @param {boolean} [config.loop=false] - Whether the audio should loop.
   * @param {number} [config.volume=1] - Playback volume between 0 and 1.
   * @returns {HTMLAudioElement} Configured audio element.
   */
  createAudio({ src, loop = false, volume = 1 }) {
    const audio = new Audio(src);

    audio.loop = loop;
    audio.volume = volume;
    audio.preload = "auto";
    audio.load();

    return audio;
  }

  /**
   * Creates the Web Audio context used for low-latency sound effects.
   * Falls back silently if the API is unavailable.
   */
  createAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    this.audioContext = new AudioContextClass();
  }

  /**
   * Fetches and decodes all sound effects into memory once.
   * Decoded buffers play without per-call media pipeline costs,
   * which avoids frame drops on iOS Safari.
   */
  loadEffectBuffers() {
    if (!this.audioContext) return;

    Object.entries(AUDIO_CONFIG).forEach(([name, config]) => {
      if (name !== "background") this.loadEffectBuffer(name, config.src);
    });
  }

  /**
   * Loads a single effect into an AudioBuffer.
   *
   * @param {string} name - Sound key defined in AUDIO_CONFIG.
   * @param {string} src - Audio file path.
   */
  loadEffectBuffer(name, src) {
    fetch(src)
      .then((response) => response.arrayBuffer())
      .then((data) => this.audioContext.decodeAudioData(data))
      .then((buffer) => (this.effectBuffers[name] = buffer))
      .catch(() => {});
  }

  loadMuteState() {
    this.isMuted = localStorage.getItem(this.storageKey) === "true";
  }

  saveMuteState() {
    localStorage.setItem(this.storageKey, this.isMuted);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;

    this.saveMuteState();
    this.applyMuteState();
  }

  applyMuteState() {
    Object.values(this.sounds).forEach((sound) => {
      sound.muted = this.isMuted;
    });

    if (this.isMuted) this.stopActiveEffects();
  }

  /**
   * Resumes the audio context after the first user gesture.
   * Browsers require a gesture before any audio may play.
   */
  unlockAudio() {
    if (this.isUnlocked) return;

    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume().catch(() => {});
    }

    this.isUnlocked = true;
  }

  playBackgroundMusic() {
    const background = this.sounds.background;

    if (this.isMuted || !background) return;

    background.pause();
    background.currentTime = 0;
    background.play().catch(() => {});
  }

  resumeBackgroundMusic() {
    const background = this.sounds.background;

    if (this.isMuted || !background || !background.paused) return;

    background.play().catch(() => {});
  }

  pauseBackgroundMusic() {
    const background = this.sounds.background;

    if (background) background.pause();
  }

  stopBackgroundMusic() {
    const background = this.sounds.background;

    if (!background) return;

    background.pause();
    background.currentTime = 0;
  }

  pauseAllSounds() {
    Object.values(this.sounds).forEach((sound) => {
      sound.pause();
    });

    this.stopActiveEffects();
  }

  stopAllSounds() {
    Object.values(this.sounds).forEach((sound) => {
      sound.pause();
      sound.currentTime = 0;
    });

    this.stopActiveEffects();
  }

  stopActiveEffects() {
    this.activeSources.forEach((source) => {
      source.stop();
    });

    this.activeSources.clear();
  }

  playGameOverSound() {
    this.playEffect("gameOver");
  }

  playWinSound() {
    this.playEffect("win");
  }

  playJumpSound() {
    this.playEffect("jump");
  }

  playBottleSmashSound() {
    this.playEffect("bottleSmash");
  }

  playCollectBottleSound() {
    this.playEffect("collectBottle");
  }

  playCollectCoinSound() {
    this.playEffect("collectCoin");
  }

  playHurtSound() {
    this.playEffect("hurt");
  }

  playEnemyDefeatSound() {
    this.playEffect("enemyDefeat");
  }

  /**
   * Plays a sound effect with minimal latency.
   * Uses a decoded Web Audio buffer when available and falls back
   * to the audio element otherwise.
   *
   * @param {string} name - Sound key defined in AUDIO_CONFIG.
   */
  playEffect(name) {
    if (this.isMuted) return;

    if (this.canPlayBuffer(name)) return this.playBufferEffect(name);

    this.playElementEffect(name);
  }

  canPlayBuffer(name) {
    return (
      this.effectBuffers[name] &&
      this.audioContext &&
      this.audioContext.state === "running"
    );
  }

  /**
   * Plays a decoded effect buffer through a one-shot source node.
   *
   * @param {string} name - Sound key defined in AUDIO_CONFIG.
   */
  playBufferEffect(name) {
    const source = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();

    source.buffer = this.effectBuffers[name];
    gain.gain.value = AUDIO_CONFIG[name].volume;

    source.connect(gain);
    gain.connect(this.audioContext.destination);

    this.registerSource(source);
    source.start();
  }

  registerSource(source) {
    this.activeSources.add(source);

    source.onended = () => {
      this.activeSources.delete(source);
    };
  }

  /**
   * Fallback playback through the preloaded audio element.
   *
   * @param {string} name - Sound key defined in AUDIO_CONFIG.
   */
  playElementEffect(name) {
    const sound = this.sounds[name];

    if (!sound) return;

    sound.pause();
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}
