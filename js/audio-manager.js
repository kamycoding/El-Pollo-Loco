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

  /** Creates the configured audio elements. */
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

  /** Creates the Web Audio context. */
  createAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    this.audioContext = new AudioContextClass();
  }

  /** Loads the sound effect buffers. */
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

  /** Loads the saved mute state. */
  loadMuteState() {
    this.isMuted = localStorage.getItem(this.storageKey) === "true";
  }

  /** Saves the current mute state. */
  saveMuteState() {
    localStorage.setItem(this.storageKey, this.isMuted);
  }

  /** Toggles the mute state. */
  toggleMute() {
    this.isMuted = !this.isMuted;

    this.saveMuteState();
    this.applyMuteState();
  }

  /** Applies the current mute state. */
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

  /** Plays the background music. */
  playBackgroundMusic() {
    const background = this.sounds.background;

    if (this.isMuted || !background) return;

    background.pause();
    background.currentTime = 0;
    background.play().catch(() => {});
  }

  /** Resumes the background music. */
  resumeBackgroundMusic() {
    const background = this.sounds.background;

    if (this.isMuted || !background || !background.paused) return;

    background.play().catch(() => {});
  }

  /** Pauses the background music. */
  pauseBackgroundMusic() {
    const background = this.sounds.background;

    if (background) background.pause();
  }

  /** Stops the background music. */
  stopBackgroundMusic() {
    const background = this.sounds.background;

    if (!background) return;

    background.pause();
    background.currentTime = 0;
  }

  /** Pauses all active sounds. */
  pauseAllSounds() {
    Object.values(this.sounds).forEach((sound) => {
      sound.pause();
    });

    this.stopActiveEffects();
  }

  /** Stops all active sounds. */
  stopAllSounds() {
    Object.values(this.sounds).forEach((sound) => {
      sound.pause();
      sound.currentTime = 0;
    });

    this.stopActiveEffects();
  }

  /** Stops the active effects. */
  stopActiveEffects() {
    this.activeSources.forEach((source) => {
      source.stop();
    });

    this.activeSources.clear();
  }

  /** Plays the game-over sound effect. */
  playGameOverSound() {
    this.playEffect("gameOver");
  }

  /** Plays the win sound effect. */
  playWinSound() {
    this.playEffect("win");
  }

  /** Plays the jump sound effect. */
  playJumpSound() {
    this.playEffect("jump");
  }

  /** Plays the bottle-smash sound effect. */
  playBottleSmashSound() {
    this.playEffect("bottleSmash");
  }

  /** Plays the bottle collection sound effect. */
  playCollectBottleSound() {
    this.playEffect("collectBottle");
  }

  /** Plays the coin collection sound effect. */
  playCollectCoinSound() {
    this.playEffect("collectCoin");
  }

  /** Plays the hurt sound effect. */
  playHurtSound() {
    this.playEffect("hurt");
  }

  /** Plays the enemy defeat sound effect. */
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

  /**
   * Checks whether a buffered effect can be played.
   *
   * @param {string} name - Sound effect name.
   * @returns {boolean} Whether the buffer is ready.
   */
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

  /**
   * Tracks an active audio source until it ends.
   *
   * @param {AudioBufferSourceNode} source - Audio source to track.
   */
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
