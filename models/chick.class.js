class Chick extends MovableObject {
  IMAGES_WALK = [
    "img/3_enemies_chicken/chicken_small/1_walk/1_w.png",
    "img/3_enemies_chicken/chicken_small/1_walk/2_w.png",
    "img/3_enemies_chicken/chicken_small/1_walk/3_w.png",
  ];
  IMAGES_DIE = ["img/3_enemies_chicken/chicken_small/2_dead/dead.png"];

  constructor(x, y) {
    super(x, y);
    this.aspectRatio = 1.1238;
    this.width = 70;
    this.height = this.width / this.aspectRatio;
    this.speedX = 6;
    this.health = 1;
    this.setCollisionBasis(0, 0, 1, 1);
    this.loadImages(this.IMAGES_WALK, this.IMAGES_DIE);
    this.setMoveInterval(100, 300);
    this.walk(calcRandomNumber(90, 150), this.IMAGES_WALK);
  }
}
