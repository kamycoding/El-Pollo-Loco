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
  isMuted = false;
  isUnlocked = false;
  storageKey = "elPolloLocoMuted";

  constructor() {
    this.loadMuteState();
    this.createSounds();
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
  }

  unlockAudio() {
    if (this.isUnlocked) return;

    Object.entries(this.sounds).forEach(([name, sound]) => {
      if (name !== "background") this.prepareSound(sound);
    });

    this.isUnlocked = true;
  }

  prepareSound(sound) {
    const volume = sound.volume;

    this.muteForPreparation(sound);

    sound
      .play()
      .then(() => this.finishSoundPreparation(sound, volume))
      .catch(() => this.restorePreparedSound(sound, volume));
  }

  muteForPreparation(sound) {
    sound.muted = true;
    sound.volume = 0;
  }

  finishSoundPreparation(sound, volume) {
    sound.pause();
    sound.currentTime = 0;

    this.restorePreparedSound(sound, volume);
  }

  restorePreparedSound(sound, volume) {
    sound.volume = volume;
    sound.muted = this.isMuted;
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
  }

  stopAllSounds() {
    Object.values(this.sounds).forEach((sound) => {
      sound.pause();
      sound.currentTime = 0;
    });
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
   * Restarts and plays a configured sound effect.
   *
   * @param {string} name - Sound key defined in AUDIO_CONFIG.
   */
  playEffect(name) {
    const sound = this.sounds[name];

    if (this.isMuted || !sound) return;

    sound.pause();
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}
