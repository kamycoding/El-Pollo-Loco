class Endboss extends MovableObject {
  width = 250;
  height = 400;
  y = 55;

  images = [
    "img/4_enemie_boss_chicken/1_walk/G1.png",
    "img/4_enemie_boss_chicken/1_walk/G2.png",
    "img/4_enemie_boss_chicken/1_walk/G3.png",
    "img/4_enemie_boss_chicken/1_walk/G4.png",
  ];

  constructor() {
    super();
    this.loadImage(this.images[0]);
    this.loadImages(this.images);
    this.animate();
  }

  animate() {
    setInterval(() => this.playAnimation(this.images), 200);
  }
}
