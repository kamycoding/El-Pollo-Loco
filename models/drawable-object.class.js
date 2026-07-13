class DrawableObject {
  x = 0;
  y = 0;
  img = new Image();
  imageCache = {};
  currentImage = 0;
  width = 0;
  height = 0;

  collisionBasis = {
    offsetX: 0,
    offsetY: 0,
    widthRatio: 0,
    heightRatio: 0,
  };

  collisionArea = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  loadImage(imgUrl) {
    const img = new Image();
    img.src = imgUrl;
    this.img = img;

    img.onload = () => {
      if (this.img === img) this.img = this.downscaleImage(img);
    };

    return this;
  }

  loadImageCache(urlList) {
    urlList.forEach((url) => {
      const img = new Image();
      img.src = url;
      this.imageCache[url] = img;

      img.onload = () => {
        if (this.imageCache[url] === img)
          this.imageCache[url] = this.downscaleImage(img);
      };
    });
  }

  /**
   * Downscales oversized source images once at load time.
   * Drawing from a pre-scaled canvas avoids per-frame scaling,
   * which causes noticeable lag on iOS Safari.
   *
   * @param {HTMLImageElement} img - Fully loaded source image.
   * @returns {HTMLImageElement|HTMLCanvasElement} Original image or pre-scaled canvas.
   */
  downscaleImage(img) {
    const maxHeight = 480;

    if (!img.naturalHeight || img.naturalHeight <= maxHeight) return img;

    const scale = maxHeight / img.naturalHeight;
    const offscreen = document.createElement("canvas");

    offscreen.width = Math.round(img.naturalWidth * scale);
    offscreen.height = maxHeight;
    offscreen
      .getContext("2d")
      .drawImage(img, 0, 0, offscreen.width, offscreen.height);

    return offscreen;
  }

  /**
   * Loads multiple image sequences into the image cache.
   *
   * @param {...string[]} imageArrays - Arrays containing image paths.
   */
  loadImages(...imageArrays) {
    imageArrays.forEach((array) => {
      this.loadImageCache(array);
    });
  }

  draw(ctx) {
    if (!this.img) return;

    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  /**
   * Defines the collision area relative to the object's dimensions.
   *
   * @param {number} offsetX - Horizontal offset as a width ratio.
   * @param {number} offsetY - Vertical offset as a height ratio.
   * @param {number} widthRatio - Collision width relative to object width.
   * @param {number} heightRatio - Collision height relative to object height.
   */
  setCollisionBasis(offsetX, offsetY, widthRatio, heightRatio) {
    this.collisionBasis = {
      offsetX,
      offsetY,
      widthRatio,
      heightRatio,
    };
  }

  /**
   * Updates the absolute collision area from the configured ratios.
   */
  getCollisionArea() {
    this.collisionArea.x = this.x + this.width * this.collisionBasis.offsetX;

    this.collisionArea.y = this.y + this.height * this.collisionBasis.offsetY;

    this.collisionArea.width = this.width * this.collisionBasis.widthRatio;

    this.collisionArea.height = this.height * this.collisionBasis.heightRatio;
  }
}
