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
    setStopableInterval(() => {
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
      if (enemy.isDead) return false;

      enemy.getCollisionArea();

      return this.world.character.isColliding(enemy);
    });
  }

  handleEnemyCollision(enemy) {
    if (this.isStompCollision(enemy)) {
      this.smashEnemy(enemy);
      return;
    }

    if (this.canTakeEnemyDamage()) {
      this.hitByEnemy(enemy);
    }
  }

  /**
   * Checks whether the character crosses the enemy's upper edge while falling.
   *
   * @param {MovableObject} enemy - Enemy involved in the collision.
   * @returns {boolean} Whether the collision is a valid stomp.
   */
  isStompCollision(enemy) {
    const character = this.world.character;
    const characterBottom =
      character.collisionArea.y + character.collisionArea.height;

    const previousCharacterBottom = characterBottom + character.speedY;
    const enemyTop = enemy.collisionArea.y;
    const tolerance = 15;

    return (
      character.isJumping &&
      character.speedY <= 0 &&
      previousCharacterBottom <= enemyTop + tolerance &&
      characterBottom >= enemyTop
    );
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
    if (!this.canDamageCharacter()) return;

    this.lastCharacterDamageAt = Date.now();

    this.world.reduceHealth(
      this.world.character,
      amount,
      this.world.statusbars.health,
    );
  }

  smashEnemy(enemy) {
    this.defeatEnemy(enemy);
    this.world.character.speedY = 10;
  }

  defeatEnemy(enemy) {
    this.world.stopEnemy(enemy);

    enemy.isDead = true;
    enemy.img = enemy.imageCache[enemy.IMAGES_DIE[0]];

    setTimeout(() => {
      this.world.removeEnemy(enemy);
    }, 1500);
  }

  hitByEnemy(enemy) {
    if (enemy instanceof Chicken) {
      this.damageCharacter(5);
      return;
    }

    if (enemy instanceof Chick) {
      this.collectHealthFromChick(enemy);
    }
  }

  collectHealthFromChick(chick) {
    const character = this.world.character;

    this.world.gainHealth(character, 5);
    this.world.statusbars.health.setValue(character.health);
    this.world.stopEnemy(chick);

    chick.isDead = true;

    this.world.removeEnemy(chick);
  }

  checkEndbossCollision() {
    const endboss = this.world.level.endboss;
    const character = this.world.character;

    endboss.getCollisionArea();

    if (character.isColliding(endboss)) {
      this.damageCharacter(8);
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
    return !bottle.isSmashed && bottle.y < bottle.groundPosition;
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
      if (!this.canBottleHitEnemy(enemy)) return false;

      enemy.getCollisionArea();

      return enemy.isColliding(bottle);
    });
  }

  canBottleHitEnemy(enemy) {
    return enemy instanceof Chicken && !enemy.isDead;
  }

  handleBottleEndbossCollision(bottle) {
    const endboss = this.world.level.endboss;

    endboss.getCollisionArea();

    if (!this.isBottleHittingEndboss(bottle, endboss)) return;

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

    character.bottleCount++;

    this.world.statusbars.bottle.setValue(
      (100 / maxBottles) * character.bottleCount,
    );
  }

  collectCoin() {
    const character = this.world.character;
    const maxCoins = this.world.level.maxCoins;

    character.coinCount++;

    this.world.statusbars.coin.setValue((100 / maxCoins) * character.coinCount);
  }
}
