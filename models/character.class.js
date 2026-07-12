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

  constructor(x, y, keyboard) {
    super(x, y).loadImage(this.IMAGES_WAIT[0]);
    this.keyboard = keyboard;
    this.configureCharacter(x);
    this.loadCharacterImages();
    this.resetActivityTimer();
    this.initIntervals();
  }

  configureCharacter(x) {
    this.aspectRatio = 0.5083;
    this.width = 220;
    this.height = this.width / this.aspectRatio;
    this.startX = x;
    this.speedX = 12;
    this.health = 100;
    this.setCollisionBasis(0.15, 0.45, 0.55, 0.55);
  }

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

  initIntervals() {
    this.handleMovement();
    this.animateWalk();
    this.animateJump();
    this.handleThrow();
    this.animateIdle();
  }

  handleMovement() {
    setStoppableInterval(() => {
      this.updateMovement();
    }, 55);
  }

  updateMovement() {
    const { maxX, maxCamX } = this.getMovementLimits();

    if (this.keyboard.KEYS.RIGHT.status) {
      this.moveRight(maxX, maxCamX);
      return;
    }

    if (this.keyboard.KEYS.LEFT.status) this.moveLeft(maxCamX);
  }

  getMovementLimits() {
    const backgroundWidth = world.level.background.landscapeLayer[0].width;
    const levelWidth = backgroundWidth * world.level.sceneParts;

    return {
      maxX: levelWidth - this.startX - this.width,
      maxCamX: levelWidth - this.startX - canvas.width,
    };
  }

  moveRight(maxX, maxCamX) {
    this.isFlipped = false;

    if (this.x <= maxX) this.move(1);

    if (this.x <= maxCamX) {
      world.setCameraPos(-this.x + this.startX);
      world.moveBackground(1);
    }
  }

  moveLeft(maxCamX) {
    this.isFlipped = true;

    if (this.x <= this.startX) return;

    this.move(-1);

    if (this.x <= maxCamX) {
      world.setCameraPos(-this.x + this.startX);
      world.moveBackground(-1);
    }
  }

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

  isMovementKeyPressed() {
    return this.keyboard.KEYS.RIGHT.status || this.keyboard.KEYS.LEFT.status;
  }

  stopWalk() {
    this.isWalking = false;
    this.reset();
  }

  animateJump() {
    setStoppableInterval(() => {
      this.tryJump();
    }, 20);
  }

  tryJump() {
    if (!this.canJump()) return;

    audioManager.playJumpSound();
    this.startJumpState();
    this.applyGravity();
    this.startJumpAnimation();
  }

  startJumpState() {
    this.isJumping = true;
    this.currentImage = 2;
    this.speedY = 50;
  }

  canJump() {
    return (
      this.keyboard.KEYS.JUMP.status && !this.isAboveGround() && !this.isJumping
    );
  }

  startJumpAnimation() {
    this.jumpIntervalId = setStoppableInterval(() => {
      this.updateJumpAnimation();
    }, 90);
  }

  updateJumpAnimation() {
    if (!this.gotHit) this.playAnimation(this.IMAGES_JUMP);
    if (this.isAboveGround()) return;

    this.finishJumpAnimation();
  }

  finishJumpAnimation() {
    clearStoppableInterval(this.jumpIntervalId);
    this.jumpIntervalId = null;
    this.speedY = 0;

    if (!this.gotHit) this.reset();
  }

  animateIdle() {
    setStoppableInterval(() => {
      if (this.canAnimateIdle()) this.playIdleAnimation();
    }, 180);
  }

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

  playIdleAnimation() {
    const images = this.shouldSleep() ? this.IMAGES_SNOOZE : this.IMAGES_WAIT;

    this.playAnimation(images);
  }

  shouldSleep() {
    return Date.now() - lastActiveTimestamp >= this.sleepDelay;
  }

  handleThrow() {
    setStoppableInterval(() => {
      this.tryThrowBottle();
    }, 50);
  }

  tryThrowBottle() {
    if (!this.canThrowBottle()) return;

    this.hasThrownBottle = true;
    this.bottleCount--;
    this.resetActivityTimer();
    this.updateBottleStatus();
    this.throwBottle();
    this.scheduleThrowReset();
  }

  updateBottleStatus() {
    const percent = (100 / world.level.maxBottles) * this.bottleCount;

    world.statusbars.bottle.setValue(percent);
  }

  scheduleThrowReset() {
    setStoppableTimeout(() => {
      this.hasThrownBottle = false;
    }, 500);
  }

  canThrowBottle() {
    return (
      this.keyboard.KEYS.THROW.status &&
      !this.hasThrownBottle &&
      this.bottleCount > 0
    );
  }

  throwBottle() {
    const startX = this.x + this.width / 2;
    const startY = this.y + this.height / 3;

    world.throwables.push(new ThrowableObject(startX, startY, this.isFlipped));
  }

  hurt() {
    this.currentImage = 0;
    this.hurtIntervalId = setStoppableInterval(() => {
      this.updateHurtAnimation();
    }, 120);
  }

  updateHurtAnimation() {
    this.playAnimation(this.IMAGES_HURT);

    if (this.currentImage < this.IMAGES_HURT.length) return;

    clearStoppableInterval(this.hurtIntervalId);
    this.hurtIntervalId = null;
    this.finishHurtAnimation();
  }

  finishHurtAnimation() {
    setStoppableTimeout(() => {
      this.gotHit = false;

      if (!this.isDead) this.reset();
    }, 250);
  }

  reset() {
    this.currentImage = 0;
    this.loadImage(this.IMAGES_WAIT[0]);
    this.resetActivityTimer();
  }

  resetActivityTimer() {
    lastActiveTimestamp = Date.now();
  }
}
