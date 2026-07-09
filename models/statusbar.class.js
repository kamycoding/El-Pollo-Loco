class Statusbar extends DrawableObject {
  TYPE = {
    characterHealth: {
      x: 70,
      y: 10,
      images: [
        "./img/7_statusbars/1_statusbar/2_statusbar_health/orange/0.png",
        "./img/7_statusbars/1_statusbar/2_statusbar_health/orange/20.png",
        "./img/7_statusbars/1_statusbar/2_statusbar_health/orange/40.png",
        "./img/7_statusbars/1_statusbar/2_statusbar_health/orange/60.png",
        "./img/7_statusbars/1_statusbar/2_statusbar_health/orange/80.png",
        "./img/7_statusbars/1_statusbar/2_statusbar_health/orange/100.png",
      ],
    },

    endbossHealth: {
      x: 450,
      y: 10,
      images: [
        "./img/7_statusbars/1_statusbar/2_statusbar_health/blue/0.png",
        "./img/7_statusbars/1_statusbar/2_statusbar_health/blue/20.png",
        "./img/7_statusbars/1_statusbar/2_statusbar_health/blue/40.png",
        "./img/7_statusbars/1_statusbar/2_statusbar_health/blue/60.png",
        "./img/7_statusbars/1_statusbar/2_statusbar_health/blue/80.png",
        "./img/7_statusbars/1_statusbar/2_statusbar_health/blue/100.png",
      ],
    },

    bottle: {
      x: 50,
      y: 45,
      images: [
        "./img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/0.png",
        "./img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/20.png",
        "./img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/40.png",
        "./img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/60.png",
        "./img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/80.png",
        "./img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/100.png",
      ],
    },

    coin: {
      x: 30,
      y: 80,
      images: [
        "./img/7_statusbars/1_statusbar/1_statusbar_coin/green/0.png",
        "./img/7_statusbars/1_statusbar/1_statusbar_coin/green/20.png",
        "./img/7_statusbars/1_statusbar/1_statusbar_coin/green/40.png",
        "./img/7_statusbars/1_statusbar/1_statusbar_coin/green/60.png",
        "./img/7_statusbars/1_statusbar/1_statusbar_coin/green/80.png",
        "./img/7_statusbars/1_statusbar/1_statusbar_coin/green/100.png",
      ],
    },
  };

  constructor(type, percent) {
    super(0, 0);

    this.validateType(type);

    this.type = type;
    this.aspectRatio = 595 / 158;
    this.width = 200;
    this.height = this.width / this.aspectRatio;
    this.x = this.TYPE[type].x;
    this.y = this.TYPE[type].y;

    this.loadImageCache(this.TYPE[type].images);
    this.setValue(percent);
  }

  validateType(type) {
    if (this.TYPE[type]) return;

    throw new Error(`Unknown statusbar type: ${type}`);
  }

  setValue(percent) {
    const safePercent = this.getSafePercent(percent);
    const imageIndex = this.getImageIndex(safePercent);

    this.currentImage = imageIndex;
    this.img = this.imageCache[this.TYPE[this.type].images[imageIndex]];
  }

  getSafePercent(percent) {
    return Math.max(0, Math.min(100, percent));
  }

  getImageIndex(percent) {
    return Math.floor((percent * 5) / 100);
  }
}
