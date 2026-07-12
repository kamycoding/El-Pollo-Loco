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
  moveIntervalId = null;
  walkIntervalId = null;
  gravityIntervalId = null;
  deathIntervalId = null;
  moveInterval;

  constructor(x, y) {
    super(x, y);
  }

  isColliding(object) {
    const thisX = this.getCollisionX(this);
    const objectX = this.getCollisionX(object);

    return (
      thisX + this.collisionArea.width >= objectX &&
      thisX <= objectX + object.collisionArea.width &&
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
    if (!object.isFlipped) return object.collisionArea.x;

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
    if (this.gravityIntervalId !== null) return;

    this.gravityIntervalId = setStoppableInterval(() => {
      this.updateGravity();
    }, 40);
  }

  updateGravity() {
    this.y -= this.speedY;
    this.speedY -= this.acceleration;

    if (this.isAboveGround() && !this.isSmashed) return;

    this.finishGravity();
  }

  finishGravity() {
    this.stopGravity();

    if (!this.isSmashed) this.y = this.groundPosition;
    if (this instanceof Character) this.releaseJumpState();
  }

  stopGravity() {
    if (this.gravityIntervalId === null) return;

    clearStoppableInterval(this.gravityIntervalId);
    this.gravityIntervalId = null;
    this.speedY = 0;
  }

  releaseJumpState() {
    setStoppableTimeout(() => {
      this.isJumping = false;
    }, 200);
  }

  setMoveInterval(fast, slow) {
    this.moveInterval = calcRandomNumber(fast, slow);
  }

  startMoving(objectArray, direction) {
    this.moveIntervalId = setStoppableInterval(() => {
      this.move(direction);
      this.handleEdge(objectArray);
    }, this.moveInterval);
  }

  walk(frequency, images) {
    this.walkIntervalId = setStoppableInterval(() => {
      this.playAnimation(images);
    }, frequency);
  }

  move(direction) {
    this.x += this.speedX * direction;
  }

  handleEdge(objectArray) {
    if (this.x + this.width >= 0) return;

    this.stopMovementIntervals();
    this.removeFromArray(objectArray);
  }

  stopMovementIntervals() {
    clearStoppableInterval(this.moveIntervalId);
    clearStoppableInterval(this.walkIntervalId);
    this.moveIntervalId = null;
    this.walkIntervalId = null;
  }

  removeFromArray(objectArray) {
    const objectIndex = objectArray.indexOf(this);

    if (objectIndex !== -1) objectArray.splice(objectIndex, 1);
  }

  die() {
    this.currentImage = 0;
    this.deathIntervalId = setStoppableInterval(() => {
      this.animateDeath();
    }, 160);

    world.gameOver(this);
  }

  animateDeath() {
    this.playAnimation(this.IMAGES_DIE);

    if (this.currentImage < this.IMAGES_DIE.length) return;

    clearStoppableInterval(this.deathIntervalId);
    this.deathIntervalId = null;
  }
}
