let level1;

function createLevel1() {
  level1 = new Level(2, [0.7, 1.4], 10, 10);
  createLevel1Background();
  createLevel1Enemies();
  level1.createEndboss();
  level1.createCollectables();
}

function createLevel1Background() {
  level1.createSky("./img/5_background/layers/air.png");
  level1.createLandscape(
    "./img/5_background/layers/1_first_layer/full.png",
    "./img/5_background/layers/2_second_layer/full.png",
    "./img/5_background/layers/3_third_layer/full.png",
  );
  level1.createClouds(0, 10);
}

function createLevel1Enemies() {
  const endPosition = level1.getLevelEndPosition();

  level1.createEnemies(Chicken, 11, 350, endPosition);
  level1.createEnemies(Chick, 5, 350, endPosition);
}

function initLevel1Intervals() {
  const maxPosition = level1.getLevelEndPosition();

  level1.addMoreClouds(maxPosition);
  level1.addMoreEnemies(Chicken, 2, maxPosition, maxPosition + canvas.width, 25000);
  level1.addMoreEnemies(Chick, 1, maxPosition, maxPosition + canvas.width, 45000);
}
