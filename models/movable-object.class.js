class MovableObject extends DrawableObject {
  isFlipped = false;
  speedX = 0;
  speedY = 0;
  acceleration = 5;
  groundPosition = 0;
  health = 0;
  isWalking = false;
  isJumping = false;
  gotHit = false;
  isDead = false;
  isSmashed = false;
  moveIntervalId = 0;
  walkIntervalId = 0;
  moveInterval;

  constructor(x, y) {
    super(x, y);
  }

  isColliding(object) {
    const thisCollisionX = this.getCollisionX(this);
    const objectCollisionX = this.getCollisionX(object);

    return (
      thisCollisionX + this.collisionArea.width >= objectCollisionX &&
      thisCollisionX <= objectCollisionX + object.collisionArea.width &&
      this.collisionArea.y + this.collisionArea.height >=
        object.collisionArea.y &&
      this.collisionArea.y <=
        object.collisionArea.y + object.collisionArea.height
    );
  }

  /**
   * Returns the horizontal collision position and mirrors its offset
   * when the object is facing the opposite direction.
   *
   * @param {MovableObject} object - Object whose collision position is needed.
   * @returns {number} Horizontal position of the collision area.
   */
  getCollisionX(object) {
    if (!object.isFlipped) {
      return object.collisionArea.x;
    }

    const offsetX = object.width * object.collisionBasis.offsetX;

    return object.x + object.width - offsetX - object.collisionArea.width;
  }

  playAnimation(images) {
    this.currentImage %= images.length;
    this.img = this.imageCache[images[this.currentImage]];
    this.currentImage++;
  }

  isAboveGround() {
    return this.y < this.groundPosition;
  }

  applyGravity() {
    const intervalId = setInterval(() => {
      this.y -= this.speedY;
      this.speedY -= this.acceleration;

      if (!this.isAboveGround() || this.isSmashed) {
        clearInterval(intervalId);
        this.speedY = 0;

        if (!this.isSmashed) {
          this.y = this.groundPosition;
        }

        if (this instanceof Character) {
          setTimeout(() => {
            this.isJumping = false;
          }, 200);
        }
      }
    }, 40);
  }

  setMoveInterval(fast, slow) {
    this.moveInterval = calcRandomNumber(fast, slow);
  }

  startMoving(objectArray, direction) {
    this.moveIntervalId = setInterval(() => {
      this.move(direction);
      this.handleEdge(objectArray);
    }, this.moveInterval);
  }

  walk(frequency, images) {
    this.walkIntervalId = setInterval(() => {
      this.playAnimation(images);
    }, frequency);
  }

  move(direction) {
    this.x += this.speedX * direction;
  }

  handleEdge(objectArray) {
    if (this.x + this.width < 0) {
      const objectIndex = objectArray.findIndex((object) => object === this);

      clearInterval(this.moveIntervalId);
      clearInterval(this.walkIntervalId);

      objectArray.splice(objectIndex, 1);
    }
  }

  die() {
    this.currentImage = 0;

    const intervalId = setInterval(() => {
      this.playAnimation(this.IMAGES_DIE);

      if (this.currentImage >= this.IMAGES_DIE.length) {
        clearInterval(intervalId);
      }
    }, 160);

    world.gameOver(this);
  }
}
