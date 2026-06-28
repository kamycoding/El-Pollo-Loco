class Level {
  background = { sky: [], clouds: [], landscapeLayer: [] };
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
    let x;
    for (let l = 0; l < layers.length; l++) {
      x = 0;
      for (let i = 0; i < this.sceneParts; i++) {
        this.background.landscapeLayer.push(new Background(x, 0, layers[l]));
        x += this.background.landscapeLayer[0].width - 1;
      }
    }
  }

  createClouds(startPos, count) {
    for (let c = 0; c < count; c++) {
      const cloud = new Cloud(0, 0);
      cloud.x = calcRandomNumber(-100, 300) + 500 * c + startPos;
      cloud.y = calcRandomNumber(0, 50);
      this.background.clouds.push(cloud);
      cloud.startMoving(this.background.clouds, -1);
    }
  }

  createEnemies(EnemyClass, count, startPos, endPos) {
    for (let e = 0; e < count; e++) {
      const enemy = new EnemyClass(0, 0);
      enemy.x = calcRandomNumber(startPos, endPos);
      enemy.y = canvas.height - enemy.height - 55;
      this.enemies.push(enemy);
      enemy.startMoving(this.enemies, -1);
    }
  }

  createEndboss() {
    this.endboss = new Endboss(0, 0);
    this.endboss.x =
      this.background.landscapeLayer[0].width * this.sceneParts -
      this.endboss.width -
      100;
    this.endboss.y = canvas.height - this.endboss.height - 40;
  }

  createCollectables() {
    const types = ["bottle", "coin"];
    const remaining = [this.maxBottles, this.maxCoins];
    const total = this.maxBottles + this.maxCoins;
    const startPos = canvas.width * 0.6;
    const endPos =
      this.background.landscapeLayer[0].width * this.sceneParts -
      canvas.width * 0.7;
    const dist = (endPos - startPos) / total;
    let currPos = startPos - dist;

    for (let c = 0; c < total; c++) {
      const typeId = this.getObjectType(remaining);
      const coords = this.getCollectablePosition(currPos, dist);
      this.collectables.push(
        new CollectableObject(coords.x, coords.y, types[typeId]),
      );
      remaining[typeId]--;
      currPos = coords.x;
    }
  }

  getObjectType(remaining) {
    if (remaining[0] == 0) return 1;
    if (remaining[1] == 0) return 0;
    return Math.round(Math.random());
  }

  getCollectablePosition(currPos, dist) {
    const x = currPos + dist * (calcRandomNumber(80, 110) / 100);
    const y =
      canvas.height / 2 +
      (canvas.height / 4) * (calcRandomNumber(-170, 30) / 100);
    return { x, y };
  }

  addMoreClouds(startPos) {
    setStopableInterval(() => {
      this.createClouds(startPos, 5);
    }, 180000);
  }

  addMoreEnemies(EnemyClass, count, startPos, endPos, time) {
    setStopableInterval(() => {
      this.createEnemies(EnemyClass, count, startPos, endPos);
    }, time);
  }
}
