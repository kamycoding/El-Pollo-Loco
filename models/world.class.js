class World {
  canvas;
  ctx;
  level;
  character;
  statusbars = {};
  throwables = [];
  cameraPos = 0;

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
    this.statusbars["health"] = new Statusbar("health", 100);
    this.statusbars["bottle"] = new Statusbar("bottle", 0);
    this.statusbars["coin"] = new Statusbar("coin", 0);
  }

  setCameraPos(pos) {
    this.cameraPos = pos;
  }

  moveBackground(direction) {
    for (let l = 0; l < 2; l++) {
      for (let i = 0; i < this.level.sceneParts; i++) {
        this.level.background.landscapeLayer[l * 2 + i].x +=
          this.level.parallaxLayers[l] * direction;
      }
    }
  }

  checkCollisions() {
    setStopableInterval(() => {
      this.checkEnemyCollisions();
      this.checkEndbossCollision();
      this.checkCollectables();
      this.checkBottleHitsEndboss();
    }, 100);
  }

  checkEnemyCollisions() {
    this.character.getCollisionArea();
    this.level.enemies.forEach((enemy) => {
      enemy.getCollisionArea();
      if (this.character.isColliding(enemy)) {
        if (
          this.character.isJumping &&
          this.character.speedY <= 0 &&
          !enemy.isDead
        ) {
          this.smashEnemy(enemy);
        } else if (
          !enemy.isDead &&
          !this.character.isAboveGround() &&
          !this.character.gotHit
        ) {
          this.hitByEnemy(enemy);
        }
      }
    });
  }

  smashEnemy(enemy) {
    clearInterval(enemy.moveIntervalId);
    clearInterval(enemy.walkIntervalId);
    enemy.isDead = true;
    enemy.img = enemy.imageCache[enemy.IMAGES_DIE[0]];
    setTimeout(() => {
      const id = this.level.enemies.findIndex((e) => e.isDead);
      this.level.enemies.splice(id, 1);
    }, 1500);
  }

  hitByEnemy(enemy) {
    if (enemy instanceof Chicken) {
      this.reduceHealth(this.character, 5, this.statusbars.health);
    } else if (enemy instanceof Chick) {
      this.gainHealth(this.character, 5);
      this.statusbars.health.setValue(this.character.health);
      clearInterval(enemy.moveIntervalId);
      clearInterval(enemy.walkIntervalId);
      enemy.isDead = true;
      const id = this.level.enemies.findIndex((e) => e.isDead);
      this.level.enemies.splice(id, 1);
    }
  }

  checkEndbossCollision() {
    this.level.endboss.getCollisionArea();
    if (this.character.isColliding(this.level.endboss)) {
      this.reduceHealth(this.character, 8, this.statusbars.health);
    }
  }

  checkBottleHitsEndboss() {
    this.level.endboss.getCollisionArea();
    this.throwables.forEach((bottle) => {
      bottle.getCollisionArea();
      if (
        bottle.y != bottle.groundPosition &&
        this.level.endboss.isColliding(bottle) &&
        !this.level.endboss.gotHit
      ) {
        bottle.smash();
        this.reduceHealth(this.level.endboss, 20, this.level.endboss.statusbar);
      }
    });
  }

  checkCollectables() {
    this.level.collectables.forEach((item, id) => {
      if (this.character.isColliding(item)) {
        if (item.type == "bottle") this.collectBottle();
        if (item.type == "coin") this.collectCoin();
        this.level.collectables.splice(id, 1);
      }
    });
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

  reduceHealth(obj, amount, statusbar) {
    obj.health = Math.max(0, obj.health - amount);
    statusbar.setValue(obj.health);
    if (obj.health <= 0) {
      this.clearAllIntervals();
      obj.isDead = true;
      obj.die();
    } else {
      obj.gotHit = true;
      obj.hurt();
    }
  }

  gainHealth(obj, amount) {
    obj.health = Math.min(100, obj.health + amount);
  }

  gameOver(obj) {
    isGameRunning = false;
    endGame();
  }

  clearAllIntervals() {
    intervals.forEach((interval) => clearInterval(interval));
    intervals = [];
  }

  stopEnemiesAndClouds() {
    this.level.enemies.forEach((enemy) => {
      clearInterval(enemy.moveIntervalId);
      clearInterval(enemy.walkIntervalId);
    });
    this.level.background.clouds.forEach((cloud) => {
      clearInterval(cloud.moveIntervalId);
    });
  }

  draw() {
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
    this.drawObjects(Object.values(this.statusbars));
    this.drawObject(this.level.endboss.statusbar);
    requestAnimationFrame(() => this.draw());
  }

  drawObjects(array) {
    array.forEach((obj) => this.drawObject(obj));
  }

  drawObject(obj) {
    this.mirrorImage(obj);
    this.ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height);
    this.resetMirror(obj);
  }

  mirrorImage(obj) {
    if (obj.isFlipped) {
      this.ctx.save();
      this.ctx.translate(obj.width, 0);
      this.ctx.scale(-1, 1);
      obj.x = obj.x * -1;
    }
  }

  resetMirror(obj) {
    if (obj.isFlipped) {
      obj.x = obj.x * -1;
      this.ctx.restore();
    }
  }
}
