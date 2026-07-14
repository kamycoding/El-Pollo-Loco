class Character extends MovableObject {
  IMAGES_WAIT = [
    "./img/2_character_pepe/1_idle/idle/I-1.png",
    "./img/2_character_pepe/1_idle/idle/I-2.png",
    "./img/2_character_pepe/1_idle/idle/I-3.png",
    "./img/2_character_pepe/1_idle/idle/I-4.png",
    "./img/2_character_pepe/1_idle/idle/I-5.png",
    "./img/2_character_pepe/1_idle/idle/I-6.png",
    "./img/2_character_pepe/1_idle/idle/I-7.png",
    "./img/2_character_pepe/1_idle/idle/I-8.png",
    "./img/2_character_pepe/1_idle/idle/I-9.png",
    "./img/2_character_pepe/1_idle/idle/I-10.png",
  ];

  IMAGES_SNOOZE = [
    "./img/2_character_pepe/1_idle/long_idle/I-11.png",
    "./img/2_character_pepe/1_idle/long_idle/I-12.png",
    "./img/2_character_pepe/1_idle/long_idle/I-13.png",
    "./img/2_character_pepe/1_idle/long_idle/I-14.png",
    "./img/2_character_pepe/1_idle/long_idle/I-15.png",
    "./img/2_character_pepe/1_idle/long_idle/I-16.png",
    "./img/2_character_pepe/1_idle/long_idle/I-17.png",
    "./img/2_character_pepe/1_idle/long_idle/I-18.png",
    "./img/2_character_pepe/1_idle/long_idle/I-19.png",
    "./img/2_character_pepe/1_idle/long_idle/I-20.png",
  ];

  IMAGES_WALK = [
    "./img/2_character_pepe/2_walk/W-21.png",
    "./img/2_character_pepe/2_walk/W-22.png",
    "./img/2_character_pepe/2_walk/W-23.png",
    "./img/2_character_pepe/2_walk/W-24.png",
    "./img/2_character_pepe/2_walk/W-25.png",
    "./img/2_character_pepe/2_walk/W-26.png",
  ];

  IMAGES_JUMP = [
    "./img/2_character_pepe/3_jump/J-31.png",
    "./img/2_character_pepe/3_jump/J-32.png",
    "./img/2_character_pepe/3_jump/J-33.png",
    "./img/2_character_pepe/3_jump/J-34.png",
    "./img/2_character_pepe/3_jump/J-35.png",
    "./img/2_character_pepe/3_jump/J-36.png",
    "./img/2_character_pepe/3_jump/J-37.png",
    "./img/2_character_pepe/3_jump/J-38.png",
    "./img/2_character_pepe/3_jump/J-39.png",
  ];

  IMAGES_HURT = [
    "./img/2_character_pepe/4_hurt/H-41.png",
    "./img/2_character_pepe/4_hurt/H-42.png",
    "./img/2_character_pepe/4_hurt/H-43.png",
  ];

  IMAGES_DIE = [
    "./img/2_character_pepe/5_dead/D-51.png",
    "./img/2_character_pepe/5_dead/D-52.png",
    "./img/2_character_pepe/5_dead/D-53.png",
    "./img/2_character_pepe/5_dead/D-54.png",
    "./img/2_character_pepe/5_dead/D-55.png",
    "./img/2_character_pepe/5_dead/D-56.png",
    "./img/2_character_pepe/5_dead/D-57.png",
  ];

  keyboard;
  startX = 0;
  hasThrownBottle = false;
  bottleCount = 0;
  coinCount = 0;
  sleepDelay = 5000;
  jumpIntervalId = null;
  hurtIntervalId = null;

  /**
   * Creates the playable character and starts its control intervals.
   *
   * @param {number} x - Initial horizontal position.
   * @param {number} y - Initial vertical position.
   * @param {Keyboard} keyboard - Shared keyboard input state.
   */
  constructor(x, y, keyboard) {
    super(x, y).loadImage(this.IMAGES_WAIT[0]);
    this.keyboard = keyboard;
    this.configureCharacter(x);
    this.loadCharacterImages();
    this.resetActivityTimer();
    this.initIntervals();
  }

  /**
   * Configures the character.
   *
   * @param {number} x - Horizontal position.
   */
  configureCharacter(x) {
    this.aspectRatio = 0.5083;
    this.width = 220;
    this.height = this.width / this.aspectRatio;
    this.startX = x;
    this.speedX = 12;
    this.health = 100;
    this.setCollisionBasis(0.15, 0.45, 0.55, 0.55);
  }

  /** Loads the character images. */
  loadCharacterImages() {
    this.loadImages(
      this.IMAGES_WAIT,
      this.IMAGES_SNOOZE,
      this.IMAGES_WALK,
      this.IMAGES_JUMP,
      this.IMAGES_HURT,
      this.IMAGES_DIE,
    );
  }

  /** Initializes the intervals. */
  initIntervals() {
    this.handleMovement();
    this.animateWalk();
    this.animateJump();
    this.handleThrow();
    this.animateIdle();
  }

  /** Handles the movement. */
  handleMovement() {
    setStoppableInterval(() => {
      this.updateMovement();
    }, 55);
  }

  /** Updates the movement. */
  updateMovement() {
    const { maxX, maxCamX } = this.getMovementLimits();

    if (this.keyboard.KEYS.RIGHT.status) {
      this.moveRight(maxX, maxCamX);
      return;
    }

    if (this.keyboard.KEYS.LEFT.status) this.moveLeft(maxCamX);
  }

  /**
   * Calculates the character and camera movement boundaries.
   *
   * @returns {{maxX: number, maxCamX: number}} Movement limits.
   */
  getMovementLimits() {
    const backgroundWidth = world.level.background.landscapeLayer[0].width;
    const levelWidth = backgroundWidth * world.level.sceneParts;

    return {
      maxX: levelWidth - this.startX - this.width,
      maxCamX: levelWidth - this.startX - canvas.width,
    };
  }

  /**
   * Moves the character right and updates the camera.
   *
   * @param {number} maxX - Maximum horizontal position.
   * @param {number} maxCamX - Maximum camera position.
   */
  moveRight(maxX, maxCamX) {
    this.isFlipped = false;

    if (this.x <= maxX) this.move(1);

    if (this.x <= maxCamX) {
      world.setCameraPos(-this.x + this.startX);
      world.moveBackground(1);
    }
  }

  /**
   * Moves the character left and updates the camera.
   *
   * @param {number} maxCamX - Maximum camera position.
   */
  moveLeft(maxCamX) {
    this.isFlipped = true;

    if (this.x <= this.startX) return;

    this.move(-1);

    if (this.x <= maxCamX) {
      world.setCameraPos(-this.x + this.startX);
      world.moveBackground(-1);
    }
  }

  /** Animates the walk. */
  animateWalk() {
    setStoppableInterval(() => {
      const isMoving = this.isMovementKeyPressed();

      if (isMoving && !this.isAboveGround() && !this.gotHit) {
        this.isWalking = true;
        this.playAnimation(this.IMAGES_WALK);
      } else if (this.isWalking) {
        this.stopWalk();
      }
    }, 100);
  }

  /**
   * Checks whether a movement key is pressed.
   *
   * @returns {boolean} Whether a movement key is pressed.
   */
  isMovementKeyPressed() {
    return this.keyboard.KEYS.RIGHT.status || this.keyboard.KEYS.LEFT.status;
  }

  /** Stops the walk. */
  stopWalk() {
    this.isWalking = false;
    this.reset();
  }

  /** Animates the jump. */
  animateJump() {
    setStoppableInterval(() => {
      this.tryJump();
    }, 20);
  }

  /** Attempts to start a jump. */
  tryJump() {
    if (!this.canJump()) return;

    audioManager.playJumpSound();
    this.startJumpState();
    this.applyGravity();
    this.startJumpAnimation();
  }

  /** Starts the jump state. */
  startJumpState() {
    this.isJumping = true;
    this.currentImage = 2;
    this.speedY = 50;
  }

  /**
   * Checks whether the character can jump.
   *
   * @returns {boolean} Whether the character can jump.
   */
  canJump() {
    return (
      this.keyboard.KEYS.JUMP.status && !this.isAboveGround() && !this.isJumping
    );
  }

  /** Starts the jump animation. */
  startJumpAnimation() {
    this.jumpIntervalId = setStoppableInterval(() => {
      this.updateJumpAnimation();
    }, 90);
  }

  /** Updates the jump animation. */
  updateJumpAnimation() {
    if (!this.gotHit) this.playAnimation(this.IMAGES_JUMP);
    if (this.isAboveGround()) return;

    this.finishJumpAnimation();
  }

  /** Finishes the jump animation. */
  finishJumpAnimation() {
    clearStoppableInterval(this.jumpIntervalId);
    this.jumpIntervalId = null;
    this.speedY = 0;

    if (!this.gotHit) this.reset();
  }

  /** Animates the idle. */
  animateIdle() {
    setStoppableInterval(() => {
      if (this.canAnimateIdle()) this.playIdleAnimation();
    }, 180);
  }

  /**
   * Checks whether the idle animation can play.
   *
   * @returns {boolean} Whether the idle animation can play.
   */
  canAnimateIdle() {
    return (
      !this.keyboard.isAnyKeyPressed() &&
      !this.isAboveGround() &&
      !this.isWalking &&
      !this.isJumping &&
      !this.hasThrownBottle &&
      !this.gotHit &&
      !this.isDead
    );
  }

  /** Plays the idle animation. */
  playIdleAnimation() {
    const images = this.shouldSleep() ? this.IMAGES_SNOOZE : this.IMAGES_WAIT;

    this.playAnimation(images);
  }

  /**
   * Checks whether the sleeping animation should play.
   *
   * @returns {boolean} Whether the sleeping animation should play.
   */
  shouldSleep() {
    return Date.now() - lastActiveTimestamp >= this.sleepDelay;
  }

  /** Handles the throw. */
  handleThrow() {
    setStoppableInterval(() => {
      this.tryThrowBottle();
    }, 50);
  }

  /** Attempts to throw a bottle. */
  tryThrowBottle() {
    if (!this.canThrowBottle()) return;

    this.hasThrownBottle = true;
    this.bottleCount--;
    this.resetActivityTimer();
    this.updateBottleStatus();
    this.throwBottle();
    this.scheduleThrowReset();
  }

  /** Updates the bottle status. */
  updateBottleStatus() {
    const percent = (100 / world.level.maxBottles) * this.bottleCount;

    world.statusbars.bottle.setValue(percent);
  }

  /** Schedules the throw reset. */
  scheduleThrowReset() {
    setStoppableTimeout(() => {
      this.hasThrownBottle = false;
    }, 500);
  }

  /**
   * Checks whether the character can throw a bottle.
   *
   * @returns {boolean} Whether the character can throw a bottle.
   */
  canThrowBottle() {
    return (
      this.keyboard.KEYS.THROW.status &&
      !this.hasThrownBottle &&
      this.bottleCount > 0
    );
  }

  /** Throws the bottle. */
  throwBottle() {
    const startX = this.x + this.width / 2;
    const startY = this.y + this.height / 3;

    world.throwables.push(new ThrowableObject(startX, startY, this.isFlipped));
  }

  /** Starts the character hurt animation. */
  hurt() {
    this.currentImage = 0;
    this.hurtIntervalId = setStoppableInterval(() => {
      this.updateHurtAnimation();
    }, 120);
  }

  /** Updates the hurt animation. */
  updateHurtAnimation() {
    this.playAnimation(this.IMAGES_HURT);

    if (this.currentImage < this.IMAGES_HURT.length) return;

    clearStoppableInterval(this.hurtIntervalId);
    this.hurtIntervalId = null;
    this.finishHurtAnimation();
  }

  /** Finishes the hurt animation. */
  finishHurtAnimation() {
    setStoppableTimeout(() => {
      this.gotHit = false;

      if (!this.isDead) this.reset();
    }, 250);
  }

  /** Resets the character animation state. */
  reset() {
    this.currentImage = 0;
    this.loadImage(this.IMAGES_WAIT[0]);
    this.resetActivityTimer();
  }

  /** Resets the activity timer. */
  resetActivityTimer() {
    lastActiveTimestamp = Date.now();
  }
}
