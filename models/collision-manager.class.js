class CollisionManager {
  world;

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
    this.checkBottleHitsEndboss();
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
    const character = this.world.character;

    return !character.isAboveGround() && !character.gotHit && !character.isDead;
  }

  smashEnemy(enemy) {
    this.world.stopEnemy(enemy);

    enemy.isDead = true;
    enemy.img = enemy.imageCache[enemy.IMAGES_DIE[0]];

    this.world.character.speedY = 10;

    setTimeout(() => {
      this.world.removeEnemy(enemy);
    }, 1500);
  }

  hitByEnemy(enemy) {
    if (enemy instanceof Chicken) {
      this.world.reduceHealth(
        this.world.character,
        5,
        this.world.statusbars.health,
      );

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

    if (
      character.isColliding(endboss) &&
      !character.gotHit &&
      !character.isDead
    ) {
      this.world.reduceHealth(character, 8, this.world.statusbars.health);
    }
  }

  checkBottleHitsEndboss() {
    const endboss = this.world.level.endboss;

    endboss.getCollisionArea();

    this.world.throwables.forEach((bottle) => {
      bottle.getCollisionArea();

      if (this.isBottleHittingEndboss(bottle, endboss)) {
        this.damageEndboss(bottle, endboss);
      }
    });
  }

  isBottleHittingEndboss(bottle, endboss) {
    return (
      bottle.y !== bottle.groundPosition &&
      endboss.isColliding(bottle) &&
      !endboss.gotHit &&
      !endboss.isDead
    );
  }

  damageEndboss(bottle, endboss) {
    bottle.smash();

    this.world.reduceHealth(endboss, 20, endboss.statusbar);
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
