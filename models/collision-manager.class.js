class CollisionManager {
  world;
  groundedBottleLifetime = 3000;
  characterDamageCooldown = 1000;
  lastCharacterDamageAt = 0;

  constructor(world) {
    this.world = world;
    this.start();
  }

  start() {
    setStoppableInterval(() => {
      this.checkAllCollisions();
    }, 40);
  }

  checkAllCollisions() {
    if (!this.isWorldReady()) return;

    this.checkEnemyCollisions();
    this.checkEndbossCollision();
    this.checkCollectables();
    this.checkBottleCollisions();
    this.cleanupGroundedBottles();
  }

  isWorldReady() {
    return Boolean(
      this.world.level && this.world.character && this.world.level.endboss,
    );
  }

  checkEnemyCollisions() {
    this.world.character.getCollisionArea();

    const enemy = this.getCollidingEnemy();

    if (!enemy) return;

    this.handleEnemyCollision(enemy);
  }

  getCollidingEnemy() {
    return this.world.level.enemies.find((enemy) => {
      if (!this.isActiveRegularEnemy(enemy)) return false;

      enemy.getCollisionArea();

      return this.world.character.isColliding(enemy);
    });
  }

  handleEnemyCollision(enemy) {
    if (this.isStompCollision(enemy)) {
      this.smashEnemy(enemy);
      return;
    }

    this.damageByEnemy(enemy);
  }

  isStompCollision(enemy) {
    const character = this.world.character;
    const characterBottom =
      character.collisionArea.y + character.collisionArea.height;

    const enemyTop = enemy.collisionArea.y;
    const stompRange = this.getStompRange(enemy);

    return (
      character.isJumping &&
      character.speedY <= 0 &&
      characterBottom >= enemyTop - 5 &&
      characterBottom <= enemyTop + stompRange &&
      this.hasHorizontalOverlap(character, enemy)
    );
  }

  getStompRange(enemy) {
    if (enemy instanceof Chick) return 45;

    return 32;
  }

  hasHorizontalOverlap(character, enemy) {
    const characterLeft = character.getCollisionX(character);
    const enemyLeft = enemy.getCollisionX(enemy);

    const characterRight = characterLeft + character.collisionArea.width;

    const enemyRight = enemyLeft + enemy.collisionArea.width;

    const tolerance = 8;

    return (
      characterRight > enemyLeft + tolerance &&
      characterLeft < enemyRight - tolerance
    );
  }

  damageByEnemy(enemy) {
    if (!this.canTakeEnemyDamage()) return;

    this.damageCharacter(this.getEnemyDamage(enemy));
  }

  getEnemyDamage(enemy) {
    if (enemy instanceof Chick) return 5;
    if (enemy instanceof Chicken) return 10;

    return 0;
  }

  canTakeEnemyDamage() {
    return !this.world.character.isAboveGround() && this.canDamageCharacter();
  }

  canDamageCharacter() {
    const character = this.world.character;
    const now = Date.now();

    return (
      !character.gotHit &&
      !character.isDead &&
      now - this.lastCharacterDamageAt >= this.characterDamageCooldown
    );
  }

  damageCharacter(amount) {
    if (!amount || !this.canDamageCharacter()) return;

    this.lastCharacterDamageAt = Date.now();

    audioManager.playHurtSound();

    this.world.reduceHealth(
      this.world.character,
      amount,
      this.world.statusbars.health,
    );
  }

  smashEnemy(enemy) {
    audioManager.playEnemyDefeatSound();

    this.defeatEnemy(enemy);
    this.world.character.speedY = 14;
  }

  defeatEnemy(enemy) {
    this.world.stopEnemy(enemy);

    enemy.isDead = true;

    this.setEnemyDeathImage(enemy);
    this.removeDefeatedEnemy(enemy);
  }

  setEnemyDeathImage(enemy) {
    if (!this.hasDeathImage(enemy)) return;

    enemy.img = enemy.imageCache[enemy.IMAGES_DIE[0]];
  }

  hasDeathImage(enemy) {
    return (
      enemy.IMAGES_DIE &&
      enemy.IMAGES_DIE.length > 0 &&
      enemy.imageCache &&
      enemy.imageCache[enemy.IMAGES_DIE[0]]
    );
  }

  removeDefeatedEnemy(enemy) {
    setTimeout(() => {
      this.world.removeEnemy(enemy);
    }, this.getEnemyRemoveDelay(enemy));
  }

  getEnemyRemoveDelay(enemy) {
    if (enemy instanceof Chick) return 600;

    return 1200;
  }

  checkEndbossCollision() {
    const endboss = this.world.level.endboss;
    const character = this.world.character;

    endboss.getCollisionArea();

    if (character.isColliding(endboss)) {
      this.damageCharacter(20);
    }
  }

  checkBottleCollisions() {
    this.world.throwables.forEach((bottle) => {
      if (!this.canBottleHit(bottle)) return;

      bottle.getCollisionArea();

      if (this.handleBottleEnemyCollision(bottle)) return;

      this.handleBottleEndbossCollision(bottle);
    });
  }

  canBottleHit(bottle) {
    return !bottle.isSmashed && !this.isOldGroundedBottle(bottle);
  }

  isOldGroundedBottle(bottle) {
    return bottle.landedAt && Date.now() - bottle.landedAt > 200;
  }

  handleBottleEnemyCollision(bottle) {
    const enemy = this.getBottleHitEnemy(bottle);

    if (!enemy) return false;

    this.defeatEnemy(enemy);
    this.smashBottle(bottle);

    return true;
  }

  getBottleHitEnemy(bottle) {
    return this.world.level.enemies.find((enemy) => {
      if (!this.isActiveRegularEnemy(enemy)) return false;

      enemy.getCollisionArea();

      return this.isBottleCollidingWithEnemy(bottle, enemy);
    });
  }

  isBottleCollidingWithEnemy(bottle, enemy) {
    return bottle.isColliding(enemy) || enemy.isColliding(bottle);
  }

  isActiveRegularEnemy(enemy) {
    return this.isRegularEnemy(enemy) && !enemy.isDead;
  }

  isRegularEnemy(enemy) {
    return enemy instanceof Chicken || enemy instanceof Chick;
  }

  handleBottleEndbossCollision(bottle) {
    const endboss = this.world.level.endboss;

    endboss.getCollisionArea();

    if (!this.isBottleHittingEndboss(bottle, endboss)) {
      return;
    }

    this.smashBottle(bottle);

    this.world.reduceHealth(endboss, 20, endboss.statusbar);
  }

  isBottleHittingEndboss(bottle, endboss) {
    return !endboss.isDead && !endboss.gotHit && endboss.isColliding(bottle);
  }

  smashBottle(bottle) {
    bottle.smash(() => {
      this.removeThrowable(bottle);
    });
  }

  removeThrowable(bottle) {
    const bottleIndex = this.world.throwables.indexOf(bottle);

    if (bottleIndex === -1) return;

    this.world.throwables.splice(bottleIndex, 1);
  }

  cleanupGroundedBottles() {
    this.world.throwables = this.world.throwables.filter((bottle) => {
      return !this.shouldRemoveGroundedBottle(bottle);
    });
  }

  shouldRemoveGroundedBottle(bottle) {
    return (
      bottle.landedAt &&
      Date.now() - bottle.landedAt > this.groundedBottleLifetime
    );
  }

  checkCollectables() {
    const itemIndex = this.getCollectableIndex();

    if (itemIndex === -1) return;

    const item = this.world.level.collectables[itemIndex];

    this.collectItem(item);

    this.world.level.collectables.splice(itemIndex, 1);
  }

  getCollectableIndex() {
    return this.world.level.collectables.findIndex((item) => {
      return this.world.character.isColliding(item);
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
    const character = this.world.character;
    const maxBottles = this.world.level.maxBottles;

    audioManager.playCollectBottleSound();

    character.bottleCount++;

    this.world.statusbars.bottle.setValue(
      (100 / maxBottles) * character.bottleCount,
    );
  }

  collectCoin() {
    const character = this.world.character;
    const maxCoins = this.world.level.maxCoins;

    audioManager.playCollectCoinSound();

    character.coinCount++;

    this.world.statusbars.coin.setValue((100 / maxCoins) * character.coinCount);
  }
}
