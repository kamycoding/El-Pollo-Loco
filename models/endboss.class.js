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
  statusbar = new Statusbar("health", 100);
  status = "alert";
  isAnimPaused = false;

  constructor(x, y) {
    super(x, y).loadImage(this.IMAGES_WALK[0]);
    this.aspectRatio = 1045 / 1217;
    this.width = 400;
    this.height = this.width / this.aspectRatio;
    this.health = 100;
    this.speedX = 20;
    this.setCollisionBasis(0.12, 0.25, 0.85, 0.6);
    this.loadImages(
      this.IMAGES_WALK,
      this.IMAGES_ALERT,
      this.IMAGES_ATTACK,
      this.IMAGES_HURT,
      this.IMAGES_DIE,
    );
    this.animateAlert();
    this.animateAttack();
  }

  animateAlert() {
    setStopableInterval(() => {
      if (!this.isAnimPaused && this.status == "alert") {
        if (
          this.currentImage > 0 &&
          this.currentImage % this.IMAGES_ALERT.length == 0
        ) {
          this.isAnimPaused = true;
          setTimeout(
            () => {
              this.isAnimPaused = false;
              this.playAnimation(this.IMAGES_ALERT);
            },
            calcRandomNumber(200, 700),
          );
        } else {
          this.playAnimation(this.IMAGES_ALERT);
        }
      }
    }, 150);
  }

  animateAttack() {
    let sequCount = 0;
    this.currentImage = 0;
    setStopableInterval(() => {
      if (!this.gotHit) {
        if (this.status == "attack") sequCount = this.handleAttack(sequCount);
        else if (this.status == "walk") sequCount = this.handleWalk(sequCount);
      }
    }, 130);
  }

  handleAttack(sequCount) {
    this.playAnimation(this.IMAGES_ATTACK);
    if (this.currentImage >= this.IMAGES_ATTACK.length) {
      this.currentImage = 0;
      this.status = "walk";
    }
    return sequCount;
  }

  handleWalk(sequCount) {
    this.move(-1);
    this.playAnimation(this.IMAGES_WALK);
    sequCount++;
    if (sequCount >= this.IMAGES_WALK.length * 5) {
      this.currentImage = 0;
      sequCount = 0;
      this.status = "attack";
    }
    return sequCount;
  }

  hurt() {
    this.currentImage = 0;
    let interval = setInterval(() => {
      this.playAnimation(this.IMAGES_HURT);
      if (this.currentImage >= this.IMAGES_HURT.length) {
        clearInterval(interval);
        setTimeout(() => {
          this.gotHit = false;
          this.status = "attack";
          this.currentImage = 0;
        }, 200);
      }
    }, 150);
  }
}
