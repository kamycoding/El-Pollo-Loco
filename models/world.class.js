class World {
  canvas;
  ctx;
  level;
  character;
  collisionManager;
  statusbars = {};
  throwables = [];
  cameraPos = 0;
  animationFrameId = null;
  isRendering = false;

  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.collisionManager = new CollisionManager(this);
  }

  setLevel(level) {
    this.level = level;
  }

  createCharacter() {
    const startX = 100;

    this.character = new Character(startX, 0, keyboardListener);

    this.character.y = this.canvas.height - this.character.height - 40;

    this.character.groundPosition = this.character.y;
    this.character.applyGravity();
  }

  createStatusBars() {
    this.statusbars.health = new Statusbar("characterHealth", 100);
    this.statusbars.bottle = new Statusbar("bottle", 0);
    this.statusbars.coin = new Statusbar("coin", 0);
  }

  setCameraPos(position) {
    this.cameraPos = position;
  }

  moveBackground(direction) {
    for (let layer = 0; layer < 2; layer++) {
      this.moveBackgroundLayer(layer, direction);
    }
  }

  moveBackgroundLayer(layer, direction) {
    for (let part = 0; part < this.level.sceneParts; part++) {
      const backgroundIndex = layer * 2 + part;
      const layerSpeed = this.level.parallaxLayers[layer];

      this.level.background.landscapeLayer[backgroundIndex].x +=
        layerSpeed * direction;
    }
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
    intervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });

    intervals = [];
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
