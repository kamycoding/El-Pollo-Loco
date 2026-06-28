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

  constructor(x, y, keyboard) {
    super(x, y).loadImage(this.IMAGES_WAIT[0]);
    this.keyboard = keyboard;
    this.aspectRatio = 0.5083;
    this.width = 220;
    this.height = this.width / this.aspectRatio;
    this.startX = x;
    this.speedX = 12;
    this.health = 100;
    this.setCollisionBasis(0.15, 0.45, 0.55, 0.55);
    this.loadImages(
      this.IMAGES_WAIT,
      this.IMAGES_SNOOZE,
      this.IMAGES_WALK,
      this.IMAGES_JUMP,
      this.IMAGES_HURT,
      this.IMAGES_DIE,
    );
    this.initIntervals();
  }

  initIntervals() {
    this.handleMovement();
    this.animateWalk();
    this.animateJump();
    this.handleThrow();
    this.animateIdle();
  }

  handleMovement() {
    setStopableInterval(() => {
      const maxX =
        world.level.background.landscapeLayer[0].width *
          world.level.sceneParts -
        this.startX -
        this.width;
      const maxCamX =
        world.level.background.landscapeLayer[0].width *
          world.level.sceneParts -
        this.startX -
        canvas.width;
      if (this.keyboard.KEYS.RIGHT.status) {
        this.moveRight(maxX, maxCamX);
      } else if (this.keyboard.KEYS.LEFT.status) {
        this.moveLeft(maxCamX);
      }
    }, 55);
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
    if (this.x > this.startX) {
      this.move(-1);
      if (this.x <= maxCamX) {
        world.setCameraPos(-this.x + this.startX);
        world.moveBackground(-1);
      }
    }
  }

  animateWalk() {
    setStopableInterval(() => {
      if (
        (this.keyboard.KEYS.RIGHT.status || this.keyboard.KEYS.LEFT.status) &&
        !this.isAboveGround() &&
        !this.gotHit
      ) {
        this.isWalking = true;
        this.playAnimation(this.IMAGES_WALK);
      } else if (this.isWalking) {
        this.stopWalk();
      }
    }, 100);
  }

  stopWalk() {
    this.isWalking = false;
    this.reset();
  }

  animateJump() {
    setStopableInterval(() => {
      if (
        this.keyboard.KEYS.JUMP.status &&
        !this.isAboveGround() &&
        !this.isJumping
      ) {
        this.isJumping = true;
        this.currentImage = 2;
        this.startJumpAnimation();
        this.speedY = 50;
        setTimeout(() => {
          this.applyGravity();
        }, 100);
      }
    }, 50);
  }

  startJumpAnimation() {
    let interval = setInterval(() => {
      this.playAnimation(this.IMAGES_JUMP);
      if (!this.isAboveGround()) {
        clearInterval(interval);
        this.speedY = 0;
        this.reset();
      }
    }, 90);
  }

  animateIdle() {
    setStopableInterval(() => {
      if (!this.keyboard.isAnyKeyPressed() && !this.gotHit) {
        let now = Date.now();
        if (
          now - lastActiveTimestamp > 4000 &&
          now - lastActiveTimestamp <= 8000
        ) {
          this.playAnimation(this.IMAGES_WAIT);
        } else if (now - lastActiveTimestamp > 8000) {
          this.playAnimation(this.IMAGES_SNOOZE);
        }
      }
    }, 180);
  }

  handleThrow() {
    setStopableInterval(() => {
      if (
        this.keyboard.KEYS.THROW.status &&
        !this.hasThrownBottle &&
        this.bottleCount > 0
      ) {
        this.hasThrownBottle = true;
        this.bottleCount--;
        world.statusbars.bottle.setValue(
          (100 / world.level.maxBottles) * this.bottleCount,
        );
        this.throwBottle();
        setTimeout(() => {
          this.hasThrownBottle = false;
        }, 500);
      }
    }, 50);
  }

  throwBottle() {
    const startX = this.x + this.width / 2;
    const startY = this.y + this.height / 3;
    world.throwables.push(new ThrowableObject(startX, startY, this.isFlipped));
  }

  hurt() {
    this.currentImage = 0;
    let interval = setInterval(() => {
      this.playAnimation(this.IMAGES_HURT);
      if (
        this.currentImage >= this.IMAGES_HURT.length ||
        this.isAboveGround()
      ) {
        clearInterval(interval);
        setTimeout(() => {
          this.gotHit = false;
          this.reset();
        }, 200);
      }
    }, 90);
  }

  reset() {
    this.currentImage = 0;
    this.loadImage(this.IMAGES_WAIT[0]);
    lastActiveTimestamp = Date.now();
  }
}
