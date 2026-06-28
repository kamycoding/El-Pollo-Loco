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

  isColliding(obj) {
    const ax = this.getCollisionX(this);
    const ay = this.collisionArea.y;
    const bx = this.getCollisionX(obj);
    const by = obj.collisionArea.y;
    return (
      ax + this.collisionArea.width >= bx &&
      ax <= bx + obj.collisionArea.width &&
      ay + this.collisionArea.height >= by &&
      ay <= by + obj.collisionArea.height
    );
  }

  getCollisionX(obj) {
    if (obj.isFlipped) return obj.x + obj.collisionArea.x + obj.x;
    return obj.collisionArea.x;
  }

  playAnimation(images) {
    this.currentImage = this.currentImage % images.length;
    this.img = this.imageCache[images[this.currentImage]];
    this.currentImage++;
  }

  isAboveGround() {
    return this.y - this.speedY < this.groundPosition;
  }

  applyGravity() {
    let interval = setInterval(() => {
      this.y -= this.speedY;
      this.speedY -= this.acceleration;
      if (!this.isAboveGround() || this.isSmashed) {
        clearInterval(interval);
        this.speedY = 0;
        if (!this.isSmashed) this.y = this.groundPosition;
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

  startMoving(objArray, direction) {
    this.moveIntervalId = setInterval(() => {
      this.move(direction);
      this.handleEdge(objArray);
    }, this.moveInterval);
  }

  walk(frequency, images) {
    this.walkIntervalId = setInterval(() => {
      this.playAnimation(images);
    }, frequency);
  }

  move(direction) {
    this.x = this.x + this.speedX * direction;
  }

  handleEdge(objArray) {
    if (this.x + this.width < 0) {
      const id = objArray.findIndex((o) => o === this);
      clearInterval(this.moveIntervalId);
      clearInterval(this.walkIntervalId);
      objArray.splice(id, 1);
    }
  }

  die() {
    this.currentImage = 0;
    let interval = setInterval(() => {
      this.playAnimation(this.IMAGES_DIE);
      if (this.currentImage >= this.IMAGES_DIE.length) {
        clearInterval(interval);
      }
    }, 160);
    world.gameOver(this);
  }
}
