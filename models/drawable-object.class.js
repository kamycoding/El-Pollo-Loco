class DrawableObject {
  x = 0;
  y = 0;
  img = new Image();
  imageCache = {};
  currentImage = 0;
  width = 0;
  height = 0;
  collisionBasis = { offsetX: 0, offsetY: 0, widthRatio: 0, heightRatio: 0 };
  collisionArea = { x: 0, y: 0, width: 0, height: 0 };

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  loadImage(imgUrl) {
    this.img = new Image();
    this.img.src = imgUrl;
    return this;
  }

  loadImageCache(urlList) {
    urlList.forEach((url) => {
      this.imageCache[url] = new Image();
      this.imageCache[url].src = url;
    });
  }

  loadImages(...imageArrays) {
    imageArrays.forEach((array) => this.loadImageCache(array));
  }

  setCollisionBasis(offsetX, offsetY, widthRatio, heightRatio) {
    this.collisionBasis = { offsetX, offsetY, widthRatio, heightRatio };
  }

  getCollisionArea() {
    this.collisionArea.x = this.x + this.width * this.collisionBasis.offsetX;
    this.collisionArea.y = this.y + this.height * this.collisionBasis.offsetY;
    this.collisionArea.width = this.width * this.collisionBasis.widthRatio;
    this.collisionArea.height = this.height * this.collisionBasis.heightRatio;
  }
}
