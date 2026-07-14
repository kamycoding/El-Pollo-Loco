class Statusbar extends DrawableObject {
  TYPE = {
    characterHealth: {
      x: 70,
      y: 10,
      color: "#ff7a00",
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
      color: "#2d8cff",
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
      color: "#2d8cff",
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
      color: "#3dbb45",
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

  value = 100;
  maxValue = 100;
  currentCount = 0;

  /**
   * Creates a configured health or collectable statusbar.
   *
   * @param {"characterHealth"|"endbossHealth"|"bottle"|"coin"} type
   *   Statusbar type.
   * @param {number} percent - Initial percentage value.
   * @param {number} [maxValue=100] - Maximum value used by counter bars.
   */
  constructor(type, percent, maxValue = 100) {
    super(0, 0);
    this.validateType(type);
    this.type = type;
    this.maxValue = Math.max(1, maxValue);
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

  /**
   * Updates the displayed statusbar value.
   *
   * @param {number} percent - Percentage value between 0 and 100.
   */
  setValue(percent) {
    const safePercent = this.getSafePercent(percent);
    const imageIndex = this.getImageIndex(safePercent);

    this.value = safePercent;
    this.currentImage = imageIndex;
    this.img = this.imageCache[this.TYPE[this.type].images[imageIndex]];

    this.updateCurrentCount();
  }

  updateCurrentCount() {
    if (!this.isCounterBar()) return;

    this.currentCount = Math.round((this.value / 100) * this.maxValue);
  }

  /**
   * Clamps a status value to its valid range.
   *
   * @param {number} percent - Status percentage.
   * @returns {number} Percentage between zero and one hundred.
   */
  getSafePercent(percent) {
    return Math.max(0, Math.min(100, percent));
  }

  /**
   * Maps a percentage to its statusbar image index.
   *
   * @param {number} percent - Status percentage.
   * @returns {number} Image index.
   */
  getImageIndex(percent) {
    return Math.round((percent * 5) / 100);
  }

  draw(ctx) {
    if (!this.img) return;

    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    this.drawStatusValue(ctx);
  }

  drawStatusValue(ctx) {
    if (this.isHealthbar()) {
      this.drawExactHealthValue(ctx);
      return;
    }

    if (this.isCounterBar()) this.drawCounterText(ctx);
  }

  isHealthbar() {
    return this.type === "characterHealth" || this.type === "endbossHealth";
  }

  isCounterBar() {
    return this.type === "bottle" || this.type === "coin";
  }

  drawExactHealthValue(ctx) {
    this.drawHealthFill(ctx);
    this.drawHealthText(ctx);
  }

  drawHealthFill(ctx) {
    const bar = this.getHealthFillPosition();
    ctx.save();
    ctx.fillStyle = "rgba(45, 20, 0, 0.7)";
    ctx.fillRect(bar.x, bar.y, bar.width, bar.height);
    ctx.fillStyle = this.TYPE[this.type].color;
    ctx.fillRect(bar.x, bar.y, bar.width * (this.value / 100), bar.height);
    ctx.strokeStyle = "rgba(255, 245, 190, 0.85)";
    ctx.lineWidth = 1;
    ctx.strokeRect(bar.x, bar.y, bar.width, bar.height);
    ctx.restore();
  }

  getHealthFillPosition() {
    return {
      x: this.x + 32,
      y: this.y + this.height - 9,
      width: this.width - 64,
      height: 6,
    };
  }

  drawHealthText(ctx) {
    const text = `${Math.round(this.value)}%`;

    this.drawOutlinedText(ctx, text, this.x + this.width - 42, this.y + 24, 13);
  }

  drawCounterText(ctx) {
    const text = `${this.currentCount}/${this.maxValue}`;

    this.drawOutlinedText(ctx, text, this.x + this.width - 40, this.y + 24, 15);
  }

  drawOutlinedText(ctx, text, x, y, fontSize) {
    ctx.save();
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(70, 25, 0, 0.9)";
    ctx.fillStyle = "#fff6c7";
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    ctx.restore();
  }
}
