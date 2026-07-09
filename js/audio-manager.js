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
    this.sounds.background = this.createAudio(
      "./audio/background-music_3.mp3",
      true,
      0.35,
    );

    this.sounds.gameOver = this.createAudio(
      "./audio/game-over_4.mp3",
      false,
      0.7,
    );

    this.sounds.win = this.createAudio("./audio/win_1.mp3", false, 0.7);
    this.sounds.jump = this.createAudio("./audio/jump_2.mp3", false, 0.55);

    this.sounds.bottleSmash = this.createAudio(
      "./audio/bottle-smash_2.mp3",
      false,
      0.65,
    );

    this.sounds.collectBottle = this.createAudio(
      "./audio/collect-bottle.wav",
      false,
      0.65,
    );

    this.sounds.collectCoin = this.createAudio(
      "./audio/collect-coin_1.mp3",
      false,
      0.65,
    );

    this.sounds.bonusHealth = this.createAudio(
      "./audio/get-bonus-hp.mp3",
      false,
      0.65,
    );

    this.sounds.hurt = this.createAudio("./audio/got-hurt_1.mp3", false, 0.65);

    this.sounds.enemyDefeat = this.createAudio(
      "./audio/chicken-single-alarm-call.wav",
      false,
      0.55,
    );
  }

  createAudio(src, loop, volume) {
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
      if (name === "background") return;

      this.prepareSound(sound);
    });

    this.isUnlocked = true;
  }

  prepareSound(sound) {
    const volume = sound.volume;

    sound.muted = true;
    sound.volume = 0;

    sound
      .play()
      .then(() => {
        sound.pause();
        sound.currentTime = 0;
        sound.volume = volume;
        sound.muted = this.isMuted;
      })
      .catch(() => {
        sound.volume = volume;
        sound.muted = this.isMuted;
      });
  }

  playBackgroundMusic() {
    const background = this.sounds.background;

    if (this.isMuted || !background) return;

    background.pause();
    background.currentTime = 0;
    background.muted = false;
    background.play().catch(() => {});
  }

  stopBackgroundMusic() {
    const background = this.sounds.background;

    if (!background) return;

    background.pause();
    background.currentTime = 0;
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

  playBonusHealthSound() {
    this.playEffect("bonusHealth");
  }

  playHurtSound() {
    this.playEffect("hurt");
  }

  playEnemyDefeatSound() {
    this.playEffect("enemyDefeat");
  }

  playEffect(name) {
    const sound = this.sounds[name];

    if (this.isMuted || !sound) return;

    sound.pause();
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}
