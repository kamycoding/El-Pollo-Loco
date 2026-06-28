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
  throwIntervalId = 0;

  constructor(x, y, isFlipped) {
    super(x, y).loadImage(this.IMAGES_ROTATE[0]);
    this.isFlipped = isFlipped;
    this.speedX = 18;
    this.speedY = 45;
    this.width = 80;
    this.height = 80;
    this.groundPosition = canvas.height - this.height - 53;
    this.setCollisionBasis(0.15, 0.15, 0.72, 0.72);
    this.loadImages(this.IMAGES_ROTATE, this.IMAGES_SPLASH, this.IMAGES_GROUND);
    this.throw();
  }

  throw() {
    this.currentImage = 0;
    this.throwIntervalId = setInterval(() => {
      this.playAnimation(this.IMAGES_ROTATE);
      this.isFlipped ? this.move(-1) : this.move(1);
      if (!this.isAboveGround()) {
        clearInterval(this.throwIntervalId);
        this.loadImage(this.IMAGES_GROUND[Math.round(Math.random())]);
      }
    }, 40);
    setTimeout(() => {
      this.applyGravity();
    }, 100);
  }

  smash() {
    this.currentImage = 0;
    this.isSmashed = true;
    clearInterval(this.throwIntervalId);
    let interval = setInterval(() => {
      this.playAnimation(this.IMAGES_SPLASH);
      if (this.currentImage >= this.IMAGES_SPLASH.length) {
        const id = world.throwables.findIndex((b) => b === this);
        clearInterval(interval);
        world.throwables.splice(id, 1);
      }
    }, 70);
  }
}
