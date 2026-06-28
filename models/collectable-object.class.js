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

  constructor(x, y, type) {
    super(x, y).loadImage(this.TYPE[type].img);
    this.width = this.TYPE[type].width;
    this.height = this.TYPE[type].height;
    this.type = type;
    this.setCollisionBasis(
      this.TYPE[type].collision.offsetX,
      this.TYPE[type].collision.offsetY,
      this.TYPE[type].collision.widthRatio,
      this.TYPE[type].collision.heightRatio,
    );
    this.getCollisionArea();
  }
}
