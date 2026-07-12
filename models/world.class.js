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
    this.statusbars.bottle = new Statusbar("bottle", 0, this.level.maxBottles);
    this.statusbars.coin = new Statusbar("coin", 0, this.level.maxCoins);
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
      this.moveBackgroundPart(layer, part, direction);
    }
  }

  moveBackgroundPart(layer, part, direction) {
    const backgroundIndex = layer * 2 + part;
    const layerSpeed = this.level.parallaxLayers[layer];
    const background = this.level.background.landscapeLayer[backgroundIndex];

    background.x += layerSpeed * direction;
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
    clearAllTimers();
    object.isDead = true;
    object.die();
  }

  gameOver(object) {
    endGame(this, this.getGameResult(object));
  }

  getGameResult(object) {
    return object instanceof Endboss ? "win" : "lose";
  }

  stopEnemy(enemy) {
    this.stopObjectInterval(enemy, "moveIntervalId");
    this.stopObjectInterval(enemy, "walkIntervalId");
  }

  stopObjectInterval(object, propertyName) {
    const intervalId = object[propertyName];

    if (intervalId === null || intervalId === undefined) return;

    clearStoppableInterval(intervalId);
    object[propertyName] = null;
  }

  removeEnemy(enemy) {
    const enemyIndex = this.level.enemies.indexOf(enemy);

    if (enemyIndex === -1) return;

    this.level.enemies.splice(enemyIndex, 1);
  }

  stopEnemiesAndClouds() {
    this.level.enemies.forEach((enemy) => this.stopEnemy(enemy));
    this.level.background.clouds.forEach((cloud) => this.stopCloud(cloud));
  }

  stopCloud(cloud) {
    this.stopObjectInterval(cloud, "moveIntervalId");
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
    this.ctx.save();
    this.ctx.translate(this.cameraPos, 0);
    this.drawBackground();
    this.drawGameObjects();
    this.ctx.restore();
  }

  drawBackground() {
    this.drawObjects(this.level.background.sky);
    this.drawObjects(this.level.background.clouds);
    this.drawObjects(this.level.background.landscapeLayer);
  }

  drawGameObjects() {
    this.drawObjects(this.level.collectables);
    this.drawObject(this.character);
    this.drawObject(this.level.endboss);
    this.drawObjects(this.level.enemies);
    this.drawObjects(this.throwables);
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
    object.draw(this.ctx);
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
