let level1;

function createLevel1() {
  level1 = new Level(2, [0.7, 1.4], 10, 10);
  level1.createSky("./img/5_background/layers/air.png");
  level1.createLandscape(
    "./img/5_background/layers/1_first_layer/full.png",
    "./img/5_background/layers/2_second_layer/full.png",
    "./img/5_background/layers/3_third_layer/full.png",
  );
  level1.createClouds(0, 10);
  level1.createEnemies(
    Chicken,
    11,
    350,
    level1.background.landscapeLayer[0].width * level1.sceneParts,
  );
  level1.createEnemies(
    Chick,
    5,
    350,
    level1.background.landscapeLayer[0].width * level1.sceneParts,
  );
  level1.createEndboss();
  level1.createCollectables();
}

function initLevel1Intervals() {
  const maxPos = level1.background.landscapeLayer[0].width * level1.sceneParts;
  level1.addMoreClouds(maxPos);
  level1.addMoreEnemies(Chicken, 2, maxPos, maxPos + canvas.width, 25000);
  level1.addMoreEnemies(Chick, 1, maxPos, maxPos + canvas.width, 45000);
}
