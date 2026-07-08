class World {
  canvas;
  ctx;
  level;
  character;
  statusbars = {};
  throwables = [];
  cameraPos = 0;
  animationFrameId = null;
  isRendering = false;

  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.checkCollisions();
  }

  setLevel(level) {
    this.level = level;
  }

  createCharacter() {
    const startX = 100;

    this.character = new Character(startX, 0, keyboardListener);
    this.character.y = canvas.height - this.character.height - 40;
    this.character.groundPosition = this.character.y;
    this.character.applyGravity();
  }

  createStatusBars() {
    this.statusbars.health = new Statusbar("health", 100);
    this.statusbars.bottle = new Statusbar("bottle", 0);
    this.statusbars.coin = new Statusbar("coin", 0);
  }

  setCameraPos(position) {
    this.cameraPos = position;
  }

  moveBackground(direction) {
    for (let layer = 0; layer < 2; layer++) {
      for (let part = 0; part < this.level.sceneParts; part++) {
        this.level.background.landscapeLayer[layer * 2 + part].x +=
          this.level.parallaxLayers[layer] * direction;
      }
    }
  }

  checkCollisions() {
    setStopableInterval(() => {
      this.checkEnemyCollisions();
      this.checkEndbossCollision();
      this.checkCollectables();
      this.checkBottleHitsEndboss();
    }, 40);
  }

  checkEnemyCollisions() {
    this.character.getCollisionArea();

    const enemy = this.getCollidingEnemy();

    if (!enemy) return;

    this.handleEnemyCollision(enemy);
  }

  getCollidingEnemy() {
    return this.level.enemies.find((enemy) => {
      if (enemy.isDead) return false;

      enemy.getCollisionArea();

      return this.character.isColliding(enemy);
    });
  }

  handleEnemyCollision(enemy) {
    if (this.isStompCollision(enemy)) {
      this.smashEnemy(enemy);
      return;
    }

    if (this.canTakeEnemyDamage()) {
      this.hitByEnemy(enemy);
    }
  }

  /**
   * Checks whether the character crosses the enemy's upper edge while falling.
   *
   * @param {MovableObject} enemy - Enemy involved in the collision.
   * @returns {boolean} Whether the collision is a valid stomp.
   */
  isStompCollision(enemy) {
    const characterBottom =
      this.character.collisionArea.y + this.character.collisionArea.height;

    const previousCharacterBottom = characterBottom + this.character.speedY;

    const enemyTop = enemy.collisionArea.y;
    const tolerance = 15;

    return (
      this.character.isJumping &&
      this.character.speedY <= 0 &&
      previousCharacterBottom <= enemyTop + tolerance &&
      characterBottom >= enemyTop
    );
  }

  canTakeEnemyDamage() {
    return (
      !this.character.isAboveGround() &&
      !this.character.gotHit &&
      !this.character.isDead
    );
  }

  smashEnemy(enemy) {
    this.stopEnemy(enemy);

    enemy.isDead = true;
    enemy.img = enemy.imageCache[enemy.IMAGES_DIE[0]];

    this.character.speedY = 10;

    setTimeout(() => {
      this.removeEnemy(enemy);
    }, 1500);
  }

  stopEnemy(enemy) {
    clearInterval(enemy.moveIntervalId);
    clearInterval(enemy.walkIntervalId);
  }

  removeEnemy(enemy) {
    const enemyIndex = this.level.enemies.indexOf(enemy);

    if (enemyIndex === -1) return;

    this.level.enemies.splice(enemyIndex, 1);
  }

  hitByEnemy(enemy) {
    if (enemy instanceof Chicken) {
      this.reduceHealth(this.character, 5, this.statusbars.health);
      return;
    }

    if (enemy instanceof Chick) {
      this.collectHealthFromChick(enemy);
    }
  }

  collectHealthFromChick(chick) {
    this.gainHealth(this.character, 5);
    this.statusbars.health.setValue(this.character.health);

    this.stopEnemy(chick);

    chick.isDead = true;

    this.removeEnemy(chick);
  }

  checkEndbossCollision() {
    this.level.endboss.getCollisionArea();

    if (
      this.character.isColliding(this.level.endboss) &&
      !this.character.gotHit &&
      !this.character.isDead
    ) {
      this.reduceHealth(this.character, 8, this.statusbars.health);
    }
  }

  checkBottleHitsEndboss() {
    this.level.endboss.getCollisionArea();

    this.throwables.forEach((bottle) => {
      bottle.getCollisionArea();

      if (this.isBottleHittingEndboss(bottle)) {
        this.damageEndboss(bottle);
      }
    });
  }

  isBottleHittingEndboss(bottle) {
    return (
      bottle.y !== bottle.groundPosition &&
      this.level.endboss.isColliding(bottle) &&
      !this.level.endboss.gotHit &&
      !this.level.endboss.isDead
    );
  }

  damageEndboss(bottle) {
    bottle.smash();

    this.reduceHealth(this.level.endboss, 20, this.level.endboss.statusbar);
  }

  checkCollectables() {
    const itemIndex = this.getCollectableIndex();

    if (itemIndex === -1) return;

    const item = this.level.collectables[itemIndex];

    this.collectItem(item);
    this.level.collectables.splice(itemIndex, 1);
  }

  getCollectableIndex() {
    return this.level.collectables.findIndex((item) => {
      return this.character.isColliding(item);
    });
  }

  collectItem(item) {
    if (item.type === "bottle") {
      this.collectBottle();
    }

    if (item.type === "coin") {
      this.collectCoin();
    }
  }

  collectBottle() {
    this.character.bottleCount++;

    this.statusbars.bottle.setValue(
      (100 / this.level.maxBottles) * this.character.bottleCount,
    );
  }

  collectCoin() {
    this.character.coinCount++;

    this.statusbars.coin.setValue(
      (100 / this.level.maxCoins) * this.character.coinCount,
    );
  }

  reduceHealth(object, amount, statusbar) {
    object.health = Math.max(0, object.health - amount);

    statusbar.setValue(object.health);

    if (object.health <= 0) {
      this.handleObjectDeath(object);
      return;
    }

    object.gotHit = true;
    object.hurt();
  }

  handleObjectDeath(object) {
    this.clearAllIntervals();

    object.isDead = true;
    object.die();
  }

  gainHealth(object, amount) {
    object.health = Math.min(100, object.health + amount);
  }

  gameOver() {
    endGame(this);
  }

  clearAllIntervals() {
    intervals.forEach((intervalId) => clearInterval(intervalId));
    intervals = [];
  }

  stopEnemiesAndClouds() {
    this.level.enemies.forEach((enemy) => {
      this.stopEnemy(enemy);
    });

    this.level.background.clouds.forEach((cloud) => {
      clearInterval(cloud.moveIntervalId);
    });
  }

  draw() {
    if (this.isRendering) return;

    this.isRendering = true;
    this.renderFrame();
  }

  renderFrame() {
    this.clearCanvas();
    this.drawWorld();
    this.drawInterface();
    this.scheduleNextFrame();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawWorld() {
    this.ctx.translate(this.cameraPos, 0);

    this.drawObjects(this.level.background.sky);
    this.drawObjects(this.level.background.clouds);
    this.drawObjects(this.level.background.landscapeLayer);
    this.drawObjects(this.level.collectables);
    this.drawObject(this.character);
    this.drawObject(this.level.endboss);
    this.drawObjects(this.level.enemies);
    this.drawObjects(this.throwables);

    this.ctx.translate(-this.cameraPos, 0);
  }

  drawInterface() {
    this.drawObjects(Object.values(this.statusbars));
    this.drawObject(this.level.endboss.statusbar);
  }

  scheduleNextFrame() {
    this.animationFrameId = requestAnimationFrame(() => {
      this.renderFrame();
    });
  }

  stopDrawing() {
    if (this.animationFrameId === null) return;

    cancelAnimationFrame(this.animationFrameId);

    this.animationFrameId = null;
    this.isRendering = false;
  }

  drawObjects(objects) {
    objects.forEach((object) => {
      this.drawObject(object);
    });
  }

  drawObject(object) {
    this.mirrorImage(object);

    this.ctx.drawImage(
      object.img,
      object.x,
      object.y,
      object.width,
      object.height,
    );

    this.resetMirror(object);
  }

  mirrorImage(object) {
    if (!object.isFlipped) return;

    this.ctx.save();
    this.ctx.translate(object.width, 0);
    this.ctx.scale(-1, 1);

    object.x *= -1;
  }

  resetMirror(object) {
    if (!object.isFlipped) return;

    object.x *= -1;

    this.ctx.restore();
  }
}
