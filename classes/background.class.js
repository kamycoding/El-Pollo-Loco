class Background extends MovableObject {
  aspectRatio = 3840 / 1080;
  height = canvas.height;
  width = this.height * this.aspectRatio;

  constructor(x, y, imgUrl) {
    super(x, y).loadImage(imgUrl);
  }
}
