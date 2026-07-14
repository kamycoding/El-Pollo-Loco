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

  /**
   * Sets the level.
   *
   * @param {Level} level - Level to assign.
   */
  setLevel(level) {
    this.level = level;
  }

  /** Creates the character. */
  createCharacter() {
    const startX = 100;

    this.character = new Character(startX, 0, keyboardListener);
    this.character.y = this.canvas.height - this.character.height - 40;
    this.character.groundPosition = this.character.y;
    this.character.applyGravity();
  }

  /** Creates the status bars. */
  createStatusBars() {
    this.statusbars.health = new Statusbar("characterHealth", 100);
    this.statusbars.bottle = new Statusbar("bottle", 0, this.level.maxBottles);
    this.statusbars.coin = new Statusbar("coin", 0, this.level.maxCoins);
  }

  /**
   * Sets the horizontal camera position.
   *
   * @param {number} position - Horizontal camera position.
   */
  setCameraPos(position) {
    this.cameraPos = position;
  }

  /**
   * Moves the background.
   *
   * @param {number} direction - Movement direction.
   */
  moveBackground(direction) {
    for (let layer = 0; layer < 2; layer++) {
      this.moveBackgroundLayer(layer, direction);
    }
  }

  /**
   * Moves the background layer.
   *
   * @param {Background[]} layer - Background layer to move.
   * @param {number} direction - Movement direction.
   */
  moveBackgroundLayer(layer, direction) {
    for (let part = 0; part < this.level.sceneParts; part++) {
      this.moveBackgroundPart(layer, part, direction);
    }
  }

  /**
   * Moves the background part.
   *
   * @param {Background[]} layer - Background layer to move.
   * @param {Background} part - Background part to move.
   * @param {number} direction - Movement direction.
   */
  moveBackgroundPart(layer, part, direction) {
    const backgroundIndex = layer * 2 + part;
    const layerSpeed = this.level.parallaxLayers[layer];
    const background = this.level.background.landscapeLayer[backgroundIndex];

    background.x += layerSpeed * direction;
  }

  /**
   * Reduces an object's health and triggers its hurt or death state.
   *
   * @param {MovableObject} object - Object receiving damage.
   * @param {number} amount - Amount of health to remove.
   * @param {Statusbar} statusbar - Statusbar updated after damage.
   */
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

  /**
   * Handles the object death.
   *
   * @param {MovableObject} object - Object to inspect.
   */
  handleObjectDeath(object) {
    clearAllTimers();
    object.isDead = true;
    object.die();
  }

  /**
   * Ends the current game and determines whether it was won or lost.
   *
   * @param {MovableObject} object - Object whose death ended the game.
   */
  gameOver(object) {
    endGame(this, this.getGameResult(object));
  }

  /**
   * Determines the result for a defeated object.
   *
   * @param {MovableObject} object - Object that ended the game.
   * @returns {"win"|"lose"} Game result.
   */
  getGameResult(object) {
    return object instanceof Endboss ? "win" : "lose";
  }

  /**
   * Stops the enemy.
   *
   * @param {MovableObject} enemy - Enemy to process.
   */
  stopEnemy(enemy) {
    this.stopObjectInterval(enemy, "moveIntervalId");
    this.stopObjectInterval(enemy, "walkIntervalId");
  }

  /**
   * Clears an interval stored on an object's property.
   *
   * @param {Object} object - Object containing the interval identifier.
   * @param {string} propertyName - Property holding the interval identifier.
   */
  stopObjectInterval(object, propertyName) {
    const intervalId = object[propertyName];

    if (intervalId === null || intervalId === undefined) return;

    clearStoppableInterval(intervalId);
    object[propertyName] = null;
  }

  /**
   * Removes the enemy.
   *
   * @param {MovableObject} enemy - Enemy to process.
   */
  removeEnemy(enemy) {
    const enemyIndex = this.level.enemies.indexOf(enemy);

    if (enemyIndex === -1) return;

    this.level.enemies.splice(enemyIndex, 1);
  }

  /** Stops the enemies and clouds. */
  stopEnemiesAndClouds() {
    this.level.enemies.forEach((enemy) => this.stopEnemy(enemy));
    this.level.background.clouds.forEach((cloud) => this.stopCloud(cloud));
  }

  /**
   * Stops the cloud.
   *
   * @param {Cloud} cloud - Cloud to stop.
   */
  stopCloud(cloud) {
    this.stopObjectInterval(cloud, "moveIntervalId");
  }

  /** Starts rendering the world. */
  draw() {
    if (this.isRendering || !this.canRender()) return;

    this.isRendering = true;
    this.renderFrame();
  }

  /** Renders the frame. */
  renderFrame() {
    if (!this.canRender()) {
      this.stopDrawing();
      return;
    }

    this.clearCanvas();
    this.drawWorld();
    this.drawInterface();
    this.scheduleNextFrame();
  }

  /**
   * Checks whether this world may continue rendering gameplay.
   *
   * @returns {boolean} Whether another frame may render.
   */
  canRender() {
    return isGameRunning && !isGamePaused && world === this;
  }

  /** Clears the canvas. */
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** Draws the world. */
  drawWorld() {
    this.ctx.save();
    this.ctx.translate(this.cameraPos, 0);
    this.drawBackground();
    this.drawGameObjects();
    this.ctx.restore();
  }

  /** Draws the background. */
  drawBackground() {
    this.drawObjects(this.level.background.sky);
    this.drawObjects(this.level.background.clouds);
    this.drawObjects(this.level.background.landscapeLayer);
  }

  /** Draws the game objects. */
  drawGameObjects() {
    this.drawObjects(this.level.collectables);
    this.drawObject(this.character);
    this.drawObject(this.level.endboss);
    this.drawObjects(this.level.enemies);
    this.drawObjects(this.throwables);
  }

  /** Draws the interface. */
  drawInterface() {
    this.drawObjects(Object.values(this.statusbars));
    this.drawObject(this.level.endboss.statusbar);
  }

  /** Schedules the next frame. */
  scheduleNextFrame() {
    if (!this.canRender()) {
      this.animationFrameId = null;
      this.isRendering = false;
      return;
    }

    this.animationFrameId = requestAnimationFrame(() => {
      this.renderFrame();
    });
  }

  /** Stops the drawing. */
  stopDrawing() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.animationFrameId = null;
    this.isRendering = false;
  }

  /**
   * Draws the objects.
   *
   * @param {DrawableObject[]} objects - Objects to draw.
   */
  drawObjects(objects) {
    objects.forEach((object) => {
      this.drawObject(object);
    });
  }

  /**
   * Draws the object.
   *
   * @param {MovableObject} object - Object to inspect.
   */
  drawObject(object) {
    this.mirrorImage(object);
    object.draw(this.ctx);
    this.resetMirror(object);
  }

  /**
   * Mirrors the image.
   *
   * @param {MovableObject} object - Object to inspect.
   */
  mirrorImage(object) {
    if (!object.isFlipped) return;

    this.ctx.save();
    this.ctx.translate(object.width, 0);
    this.ctx.scale(-1, 1);
    object.x *= -1;
  }

  /**
   * Resets the mirror.
   *
   * @param {MovableObject} object - Object to inspect.
   */
  resetMirror(object) {
    if (!object.isFlipped) return;

    object.x *= -1;
    this.ctx.restore();
  }
}
