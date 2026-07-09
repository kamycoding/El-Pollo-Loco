class AudioManager {
  sounds = {};
  isMuted = false;
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
  }

  createAudio(src, loop, volume) {
    const audio = new Audio(src);

    audio.loop = loop;
    audio.volume = volume;

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

  playBackgroundMusic() {
    if (this.isMuted) return;

    this.sounds.background.currentTime = 0;
    this.sounds.background.play();
  }

  stopBackgroundMusic() {
    this.sounds.background.pause();
    this.sounds.background.currentTime = 0;
  }

  playGameOverSound() {
    this.playEffect("gameOver");
  }

  playWinSound() {
    this.playEffect("win");
  }

  playEffect(name) {
    if (this.isMuted || !this.sounds[name]) return;

    this.sounds[name].currentTime = 0;
    this.sounds[name].play();
  }
}
