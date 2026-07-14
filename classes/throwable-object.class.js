class ThrowableObject extends MovableObject {
  IMAGES_ROTATE = [
    "./img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
    "./img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png",
    "./img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png",
    "./img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png",
  ];

  IMAGES_SPLASH = [
    "./img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png",
    "./img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png",
    "./img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png",
    "./img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png",
    "./img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png",
    "./img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png",
  ];

  IMAGES_GROUND = [
    "./img/6_salsa_bottle/1_salsa_bottle_on_ground.png",
    "./img/6_salsa_bottle/2_salsa_bottle_on_ground.png",
  ];

  throwIntervalId = null;
  splashIntervalId = null;
  landedAt = null;

  constructor(x, y, isFlipped) {
    super(x, y);
    this.configureBottle(isFlipped);
    this.loadBottleImages();
    this.throw();
  }

  /**
   * Configures the bottle.
   *
   * @param {boolean} isFlipped - Whether the bottle is thrown left.
   */
  configureBottle(isFlipped) {
    this.loadImage(this.IMAGES_ROTATE[0]);
    this.isFlipped = isFlipped;
    this.speedX = 18;
    this.speedY = 45;
    this.width = 80;
    this.height = 80;
    this.groundPosition = canvas.height - this.height - 53;
    this.setCollisionBasis(0.15, 0.15, 0.72, 0.72);
  }

  /** Loads the bottle images. */
  loadBottleImages() {
    this.loadImages(this.IMAGES_ROTATE, this.IMAGES_SPLASH, this.IMAGES_GROUND);
  }

  /** Throws the bottle. */
  throw() {
    this.currentImage = 0;
    this.startThrowAnimation();
    this.startThrowGravity();
  }

  /** Starts the throw animation. */
  startThrowAnimation() {
    this.throwIntervalId = setStoppableInterval(() => {
      this.updateThrow();
    }, 40);
  }

  /** Updates the throw. */
  updateThrow() {
    this.playAnimation(this.IMAGES_ROTATE);
    this.move(this.isFlipped ? -1 : 1);

    if (!this.isAboveGround()) this.stopOnGround();
  }

  /** Starts the throw gravity. */
  startThrowGravity() {
    setStoppableTimeout(() => {
      this.applyGravity();
    }, 100);
  }

  /** Stops the bottle on the ground. */
  stopOnGround() {
    this.stopThrowAnimation();
    this.landedAt = Date.now();
    this.loadGroundImage();
  }

  /** Stops the throw animation. */
  stopThrowAnimation() {
    if (this.throwIntervalId === null) return;

    clearStoppableInterval(this.throwIntervalId);
    this.throwIntervalId = null;
  }

  /** Loads the ground image. */
  loadGroundImage() {
    const imageIndex = Math.round(Math.random());

    this.loadImage(this.IMAGES_GROUND[imageIndex]);
  }

  /**
   * Plays the bottle splash animation and removes the bottle afterwards.
   *
   * @param {Function} onFinished - Runs after the splash animation.
   */
  smash(onFinished) {
    if (this.isSmashed) return;

    this.prepareSmash();
    this.startSplashAnimation(onFinished);
  }

  /** Prepares the smash. */
  prepareSmash() {
    audioManager.playBottleSmashSound();
    this.currentImage = 0;
    this.isSmashed = true;
    this.landedAt = null;
    this.stopThrowAnimation();
    this.stopGravity();
  }

  /**
   * Starts the splash animation.
   *
   * @param {Function} onFinished - Callback run after the animation.
   */
  startSplashAnimation(onFinished) {
    this.splashIntervalId = setStoppableInterval(() => {
      this.animateSplash(onFinished);
    }, 70);
  }

  /**
   * Animates the splash.
   *
   * @param {Function} onFinished - Callback run after the animation.
   */
  animateSplash(onFinished) {
    if (this.currentImage >= this.IMAGES_SPLASH.length) {
      this.finishSplash(onFinished);
      return;
    }

    this.playAnimation(this.IMAGES_SPLASH);
  }

  /**
   * Finishes the splash.
   *
   * @param {Function} onFinished - Callback run after the animation.
   */
  finishSplash(onFinished) {
    this.stopSplashAnimation();

    if (typeof onFinished === "function") onFinished();
  }

  /** Stops the splash animation. */
  stopSplashAnimation() {
    if (this.splashIntervalId === null) return;

    clearStoppableInterval(this.splashIntervalId);
    this.splashIntervalId = null;
  }
}
