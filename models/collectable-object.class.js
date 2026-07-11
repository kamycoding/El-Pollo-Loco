class CollectableObject extends DrawableObject {
  TYPE = {
    bottle: {
      img: "./img/6_salsa_bottle/salsa_bottle.png",
      width: 100,
      height: 100,
      collision: {
        offsetX: 0.3,
        offsetY: 0.3,
        widthRatio: 0.4,
        heightRatio: 0.4,
      },
    },

    coin: {
      img: "./img/8_coin/coin_2.png",
      width: 130,
      height: 130,
      collision: {
        offsetX: 0.15,
        offsetY: 0.15,
        widthRatio: 0.72,
        heightRatio: 0.72,
      },
    },
  };

  baseWidth = 0;
  baseHeight = 0;
  pulseAmount = 0.045;
  pulseSpeed = 0.004;
  pulsePhase = 0;

  constructor(x, y, type) {
    super(x, y).loadImage(this.TYPE[type].img);

    this.type = type;
    this.setDimensions(type);
    this.setCollectableCollision(type);

    this.pulsePhase = x * 0.01;
    this.getCollisionArea();
  }

  setDimensions(type) {
    this.width = this.TYPE[type].width;
    this.height = this.TYPE[type].height;
    this.baseWidth = this.width;
    this.baseHeight = this.height;
  }

  setCollectableCollision(type) {
    const collision = this.TYPE[type].collision;

    this.setCollisionBasis(
      collision.offsetX,
      collision.offsetY,
      collision.widthRatio,
      collision.heightRatio,
    );
  }

  draw(ctx) {
    if (!this.img) return;

    if (this.type !== "coin") {
      super.draw(ctx);
      return;
    }

    this.drawPulsingCoin(ctx);
  }

  drawPulsingCoin(ctx) {
    const scale = this.getPulseScale();
    const width = this.baseWidth * scale;
    const height = this.baseHeight * scale;

    const x = this.x + (this.baseWidth - width) / 2;

    const y = this.y + (this.baseHeight - height) / 2;

    ctx.drawImage(this.img, x, y, width, height);
  }

  getPulseScale() {
    const animationTime = performance.now() * this.pulseSpeed;

    return 1 + Math.sin(animationTime + this.pulsePhase) * this.pulseAmount;
  }
}
