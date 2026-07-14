class Cloud extends MovableObject {
  imgUrls = [
    "./img/5_background/layers/4_clouds/1.png",
    "./img/5_background/layers/4_clouds/2.png",
  ];

  constructor(x, y) {
    super(x, y).loadImage(this.imgUrls[Math.round(Math.random())]);
    this.aspectRatio = 1.7778;
    this.width = calcRandomNumber(200, 500);
    this.height = this.width / this.aspectRatio;
    this.speedX = 0.5;
    this.setMoveInterval(35, 90);
  }
}
