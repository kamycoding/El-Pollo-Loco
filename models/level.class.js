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

  createSky(imgUrl) {
    let x = 0;

    for (let i = 0; i < this.sceneParts; i++) {
      this.background.sky.push(new Background(x, 0, imgUrl));

      x += this.background.sky[0].width - 2;
    }
  }

  createLandscape(layer1, layer2, layer3) {
    const layers = [layer3, layer2, layer1];

    layers.forEach((layer) => {
      this.createLandscapeLayer(layer);
    });
  }

  createLandscapeLayer(imagePath) {
    let x = 0;

    for (let i = 0; i < this.sceneParts; i++) {
      this.background.landscapeLayer.push(new Background(x, 0, imagePath));

      x += this.background.landscapeLayer[0].width - 1;
    }
  }

  createClouds(startPosition, count) {
    for (let index = 0; index < count; index++) {
      const cloud = new Cloud(0, 0);

      cloud.x = calcRandomNumber(-100, 300) + 500 * index + startPosition;

      cloud.y = calcRandomNumber(0, 50);

      this.background.clouds.push(cloud);

      cloud.startMoving(this.background.clouds, -1);
    }
  }

  createEnemies(EnemyClass, count, startPosition, endPosition) {
    for (let index = 0; index < count; index++) {
      const enemy = new EnemyClass(0, 0);

      enemy.x = calcRandomNumber(startPosition, endPosition);

      enemy.y = canvas.height - enemy.height - 55;

      this.enemies.push(enemy);

      enemy.startMoving(this.enemies, -1);
    }
  }

  createEndboss() {
    this.endboss = new Endboss(0, 0);

    this.endboss.x = this.getLevelEndPosition() - this.endboss.width - 100;

    this.endboss.y = canvas.height - this.endboss.height - 40;
  }

  getLevelEndPosition() {
    return this.background.landscapeLayer[0].width * this.sceneParts;
  }

  createCollectables() {
    const types = ["bottle", "coin"];

    const remaining = [this.maxBottles, this.maxCoins];

    const layout = this.getCollectableLayout();

    this.addCollectables(types, remaining, layout);
  }

  getCollectableLayout() {
    const total = this.maxBottles + this.maxCoins;
    const startPosition = canvas.width * 0.6;
    const distance = this.getCollectableDistance(total, startPosition);

    return {
      total,
      distance,
      currentPosition: startPosition - distance,
    };
  }

  getCollectableDistance(total, startPosition) {
    const endPosition = this.getLevelEndPosition() - canvas.width * 0.7;

    return (endPosition - startPosition) / Math.max(1, total);
  }

  addCollectables(types, remaining, layout) {
    for (let index = 0; index < layout.total; index++) {
      this.addCollectable(types, remaining, layout);
    }
  }

  addCollectable(types, remaining, layout) {
    const typeIndex = this.getObjectType(remaining);
    const position = this.getCollectablePosition(
      layout.currentPosition,
      layout.distance,
    );

    this.pushCollectable(position, types[typeIndex]);
    this.updateCollectableLayout(remaining, layout, typeIndex, position.x);
  }

  pushCollectable(position, type) {
    this.collectables.push(new CollectableObject(position.x, position.y, type));
  }

  updateCollectableLayout(remaining, layout, typeIndex, positionX) {
    remaining[typeIndex]--;
    layout.currentPosition = positionX;
  }

  getObjectType(remaining) {
    if (remaining[0] === 0) {
      return 1;
    }

    if (remaining[1] === 0) {
      return 0;
    }

    return Math.round(Math.random());
  }

  getCollectablePosition(currentPosition, distance) {
    const x = currentPosition + distance * (calcRandomNumber(80, 110) / 100);

    const y =
      canvas.height / 2 +
      (canvas.height / 4) * (calcRandomNumber(-170, 30) / 100);

    return { x, y };
  }

  addMoreClouds(startPosition) {
    setStoppableInterval(() => {
      this.createClouds(startPosition, 5);
    }, 180000);
  }

  addMoreEnemies(EnemyClass, count, startPosition, endPosition, intervalTime) {
    setStoppableInterval(() => {
      this.createEnemies(EnemyClass, count, startPosition, endPosition);
    }, intervalTime);
  }
}
