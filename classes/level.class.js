class Level {
  background = {
    sky: [],
    clouds: [],
    landscapeLayer: [],
  };

  enemies = [];
  collectables = [];
  maxBottles = 0;
  maxCoins = 0;
  endboss = undefined;
  sceneParts = 0;
  parallaxLayers = [];

  constructor(sceneParts, parallaxLayers, maxBottles, maxCoins) {
    this.sceneParts = sceneParts;
    this.parallaxLayers = parallaxLayers;
    this.maxBottles = maxBottles;
    this.maxCoins = maxCoins;
  }

  /**
   * Creates the sky.
   *
   * @param {string} imgUrl - Image file path.
   */
  createSky(imgUrl) {
    let x = 0;

    for (let i = 0; i < this.sceneParts; i++) {
      this.background.sky.push(new Background(x, 0, imgUrl));

      x += this.background.sky[0].width - 2;
    }
  }

  /**
   * Creates the landscape.
   *
   * @param {string} layer1 - First landscape layer path.
   * @param {string} layer2 - Second landscape layer path.
   * @param {string} layer3 - Third landscape layer path.
   */
  createLandscape(layer1, layer2, layer3) {
    const layers = [layer3, layer2, layer1];

    layers.forEach((layer) => {
      this.createLandscapeLayer(layer);
    });
  }

  /**
   * Creates the landscape layer.
   *
   * @param {string} imagePath - Image file path.
   */
  createLandscapeLayer(imagePath) {
    let x = 0;

    for (let i = 0; i < this.sceneParts; i++) {
      this.background.landscapeLayer.push(new Background(x, 0, imagePath));

      x += this.background.landscapeLayer[0].width - 1;
    }
  }

  /**
   * Creates the clouds.
   *
   * @param {number} startPosition - Initial horizontal position.
   * @param {number} count - Number of objects to create.
   */
  createClouds(startPosition, count) {
    for (let index = 0; index < count; index++) {
      const cloud = new Cloud(0, 0);

      cloud.x = calcRandomNumber(-100, 300) + 500 * index + startPosition;

      cloud.y = calcRandomNumber(0, 50);

      this.background.clouds.push(cloud);

      cloud.startMoving(this.background.clouds, -1);
    }
  }

  /**
   * Creates and starts a group of enemies within a level range.
   *
   * @param {typeof MovableObject} EnemyClass - Enemy class to instantiate.
   * @param {number} count - Number of enemies to create.
   * @param {number} startPosition - Minimum horizontal spawn position.
   * @param {number} endPosition - Maximum horizontal spawn position.
   */
  createEnemies(EnemyClass, count, startPosition, endPosition) {
    for (let index = 0; index < count; index++) {
      const enemy = new EnemyClass(0, 0);

      enemy.x = calcRandomNumber(startPosition, endPosition);

      enemy.y = canvas.height - enemy.height - 55;

      this.enemies.push(enemy);

      enemy.startMoving(this.enemies, -1);
    }
  }

  /** Creates the endboss. */
  createEndboss() {
    this.endboss = new Endboss(0, 0);

    this.endboss.x = this.getLevelEndPosition() - this.endboss.width - 100;

    this.endboss.y = canvas.height - this.endboss.height - 40;
  }

  /**
   * Returns the level end position.
   *
   * @returns {number} Horizontal end position of the level.
   */
  getLevelEndPosition() {
    return this.background.landscapeLayer[0].width * this.sceneParts;
  }

  /** Creates the collectables. */
  createCollectables() {
    const types = ["bottle", "coin"];

    const remaining = [this.maxBottles, this.maxCoins];

    const layout = this.getCollectableLayout();

    this.addCollectables(types, remaining, layout);
  }

  /**
   * Calculates spacing for level collectables.
   *
   * @returns {{total: number, distance: number, currentPosition: number}}
   *   Collectable layout values.
   */
  getCollectableLayout() {
    const total = this.maxBottles + this.maxCoins;
    const startPosition = canvas.width * 0.6;
    const endPosition = this.getLevelEndPosition() - canvas.width * 0.7;
    const distance = (endPosition - startPosition) / total;
    return {
      total,
      distance,
      currentPosition: startPosition - distance,
    };
  }

  /**
   * Adds the collectables.
   *
   * @param {string[]} types - Available collectable types.
   * @param {number[]} remaining - Remaining collectable counts.
   * @param {{total: number, distance: number, currentPosition: number}} layout - Collectable layout state.
   */
  addCollectables(types, remaining, layout) {
    for (let index = 0; index < layout.total; index++) {
      this.addCollectable(types, remaining, layout);
    }
  }

  /**
   * Adds the collectable.
   *
   * @param {string[]} types - Available collectable types.
   * @param {number[]} remaining - Remaining collectable counts.
   * @param {{total: number, distance: number, currentPosition: number}} layout - Collectable layout state.
   */
  addCollectable(types, remaining, layout) {
    const typeIndex = this.getObjectType(remaining);
    const position = this.getCollectablePosition(
      layout.currentPosition,
      layout.distance,
    );
    this.collectables.push(
      new CollectableObject(position.x, position.y, types[typeIndex]),
    );
    remaining[typeIndex]--;
    layout.currentPosition = position.x;
  }

  /**
   * Selects a collectable type that is still available.
   *
   * @param {number[]} remaining - Remaining counts by type.
   * @returns {number} Selected type index.
   */
  getObjectType(remaining) {
    if (remaining[0] === 0) {
      return 1;
    }

    if (remaining[1] === 0) {
      return 0;
    }

    return Math.round(Math.random());
  }

  /**
   * Calculates the next collectable position.
   *
   * @param {number} currentPosition - Previous horizontal position.
   * @param {number} distance - Base spacing between items.
   * @returns {{x: number, y: number}} Next collectable position.
   */
  getCollectablePosition(currentPosition, distance) {
    const x = currentPosition + distance * (calcRandomNumber(80, 110) / 100);

    const y =
      canvas.height / 2 +
      (canvas.height / 4) * (calcRandomNumber(-170, 30) / 100);

    return { x, y };
  }

  /**
   * Adds another group of clouds.
   *
   * @param {number} startPosition - Initial horizontal position.
   */
  addMoreClouds(startPosition) {
    setStoppableInterval(() => {
      this.createClouds(startPosition, 5);
    }, 180000);
  }

  /**
   * Schedules recurring enemy creation.
   *
   * @param {typeof MovableObject} EnemyClass - Enemy class to instantiate.
   * @param {number} count - Number of enemies created per interval.
   * @param {number} startPosition - Minimum horizontal spawn position.
   * @param {number} endPosition - Maximum horizontal spawn position.
   * @param {number} intervalTime - Spawn interval in milliseconds.
   */
  addMoreEnemies(EnemyClass, count, startPosition, endPosition, intervalTime) {
    setStoppableInterval(() => {
      this.createEnemies(EnemyClass, count, startPosition, endPosition);
    }, intervalTime);
  }
}
