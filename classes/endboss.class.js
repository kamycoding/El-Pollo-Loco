class Endboss extends MovableObject {
  IMAGES_WALK = [
    "./img/4_enemie_boss_chicken/1_walk/G1.png",
    "./img/4_enemie_boss_chicken/1_walk/G2.png",
    "./img/4_enemie_boss_chicken/1_walk/G3.png",
    "./img/4_enemie_boss_chicken/1_walk/G4.png",
  ];

  IMAGES_ALERT = [
    "./img/4_enemie_boss_chicken/2_alert/G5.png",
    "./img/4_enemie_boss_chicken/2_alert/G6.png",
    "./img/4_enemie_boss_chicken/2_alert/G7.png",
    "./img/4_enemie_boss_chicken/2_alert/G8.png",
    "./img/4_enemie_boss_chicken/2_alert/G9.png",
    "./img/4_enemie_boss_chicken/2_alert/G10.png",
    "./img/4_enemie_boss_chicken/2_alert/G11.png",
    "./img/4_enemie_boss_chicken/2_alert/G12.png",
  ];

  IMAGES_ATTACK = [
    "./img/4_enemie_boss_chicken/3_attack/G13.png",
    "./img/4_enemie_boss_chicken/3_attack/G14.png",
    "./img/4_enemie_boss_chicken/3_attack/G15.png",
    "./img/4_enemie_boss_chicken/3_attack/G16.png",
    "./img/4_enemie_boss_chicken/3_attack/G17.png",
    "./img/4_enemie_boss_chicken/3_attack/G18.png",
    "./img/4_enemie_boss_chicken/3_attack/G19.png",
    "./img/4_enemie_boss_chicken/3_attack/G20.png",
  ];

  IMAGES_HURT = [
    "./img/4_enemie_boss_chicken/4_hurt/G21.png",
    "./img/4_enemie_boss_chicken/4_hurt/G22.png",
    "./img/4_enemie_boss_chicken/4_hurt/G23.png",
  ];

  IMAGES_DIE = [
    "./img/4_enemie_boss_chicken/5_dead/G24.png",
    "./img/4_enemie_boss_chicken/5_dead/G25.png",
    "./img/4_enemie_boss_chicken/5_dead/G26.png",
  ];

  statusbar = new Statusbar("endbossHealth", 100);
  status = "alert";
  isAnimPaused = false;
  activationDistance = 420;

  constructor(x, y) {
    super(x, y).loadImage(this.IMAGES_WALK[0]);

    this.setUpEndboss();
    this.loadEndbossImages();
    this.startAnimations();
  }

  /** Configures the endboss state and dimensions. */
  setUpEndboss() {
    this.aspectRatio = 1045 / 1217;
    this.width = 400;
    this.height = this.width / this.aspectRatio;
    this.health = 100;
    this.speedX = 20;

    this.setCollisionBasis(0.12, 0.25, 0.85, 0.6);
  }

  /** Loads the endboss images. */
  loadEndbossImages() {
    this.loadImages(
      this.IMAGES_WALK,
      this.IMAGES_ALERT,
      this.IMAGES_ATTACK,
      this.IMAGES_HURT,
      this.IMAGES_DIE,
    );
  }

  /** Starts the animations. */
  startAnimations() {
    this.animateAlert();
    this.animateFight();
  }

  /** Animates the alert. */
  animateAlert() {
    setStoppableInterval(() => {
      this.activateWhenCharacterIsNear();

      if (this.canAnimateAlert()) {
        this.playAlertAnimation();
      }
    }, 150);
  }

  /** Activates the endboss when the character approaches. */
  activateWhenCharacterIsNear() {
    const character = world?.character;

    if (!character || this.status !== "alert") {
      return;
    }

    if (this.isCharacterNear(character)) {
      this.startFight();
    }
  }

  /**
   * Checks whether the character entered the boss activation range.
   *
   * @param {Character} character - Active player character.
   * @returns {boolean} Whether the character is close enough.
   */
  isCharacterNear(character) {
    const distance = this.x - character.x;

    return distance <= this.activationDistance;
  }

  /** Starts the fight. */
  startFight() {
    this.status = "walk";
    this.currentImage = 0;
    this.isAnimPaused = false;
  }

  /**
   * Checks whether the alert animation can play.
   *
   * @returns {boolean} Whether the alert animation can play.
   */
  canAnimateAlert() {
    return !this.isAnimPaused && this.status === "alert";
  }

  /** Plays the alert animation. */
  playAlertAnimation() {
    if (this.shouldPauseAlert()) {
      this.pauseAlertAnimation();
      return;
    }

    this.playAnimation(this.IMAGES_ALERT);
  }

  /**
   * Checks whether the alert animation should pause.
   *
   * @returns {boolean} Whether the alert animation should pause.
   */
  shouldPauseAlert() {
    return (
      this.currentImage > 0 &&
      this.currentImage % this.IMAGES_ALERT.length === 0
    );
  }

  /** Pauses the alert animation. */
  pauseAlertAnimation() {
    this.isAnimPaused = true;

    setStoppableTimeout(
      () => {
        this.resumeAlertAnimation();
      },
      calcRandomNumber(200, 700),
    );
  }

  /** Resumes the alert animation. */
  resumeAlertAnimation() {
    this.isAnimPaused = false;

    if (this.status === "alert") {
      this.playAnimation(this.IMAGES_ALERT);
    }
  }

  /** Animates the fight. */
  animateFight() {
    let sequenceCount = 0;

    setStoppableInterval(() => {
      sequenceCount = this.handleFightAnimation(sequenceCount);
    }, 110);
  }

  /**
   * Updates the current fight animation sequence.
   *
   * @param {number} sequenceCount - Current walk sequence progress.
   * @returns {number} Updated sequence progress.
   */
  handleFightAnimation(sequenceCount) {
    if (this.gotHit || this.status === "alert") {
      return sequenceCount;
    }

    if (this.status === "attack") {
      return this.handleAttack();
    }

    return this.handleWalk(sequenceCount);
  }

  /**
   * Handles the attack.
   *
   * @returns {number} Reset fight sequence count.
   */
  handleAttack() {
    this.playAnimation(this.IMAGES_ATTACK);

    if (this.currentImage >= this.IMAGES_ATTACK.length) {
      this.currentImage = 0;
      this.status = "walk";
    }

    return 0;
  }

  /**
   * Advances the boss walk sequence.
   *
   * @param {number} sequenceCount - Current walk sequence progress.
   * @returns {number} Updated walk sequence progress.
   */
  handleWalk(sequenceCount) {
    this.move(-1);
    this.playAnimation(this.IMAGES_WALK);
    const nextSequenceCount = sequenceCount + 1;
    if (nextSequenceCount >= this.IMAGES_WALK.length * 5) {
      this.currentImage = 0;
      this.status = "attack";
      return 0;
    }
    return nextSequenceCount;
  }

  /** Starts the endboss hurt state. */
  hurt() {
    this.currentImage = 0;
    this.startHurtAnimation();
  }

  /** Starts the hurt animation. */
  startHurtAnimation() {
    const intervalId = setStoppableInterval(() => {
      this.playAnimation(this.IMAGES_HURT);

      if (this.currentImage >= this.IMAGES_HURT.length) {
        this.finishHurtAnimation(intervalId);
      }
    }, 150);
  }

  /**
   * Stops the hurt animation and schedules the boss fight to resume.
   *
   * @param {number} intervalId - Hurt animation interval identifier.
   */
  finishHurtAnimation(intervalId) {
    clearStoppableInterval(intervalId);

    setStoppableTimeout(() => {
      this.resumeFight();
    }, 200);
  }

  /** Resumes the fight. */
  resumeFight() {
    this.gotHit = false;

    if (this.isDead) return;

    this.status = "attack";
    this.currentImage = 0;
  }
}
