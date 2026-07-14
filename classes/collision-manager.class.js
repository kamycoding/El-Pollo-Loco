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

  /**
   * Checks whether the character landed on an enemy from above.
   *
   * @param {MovableObject} enemy - Enemy involved in the collision.
   * @returns {boolean} Whether the collision is a valid stomp.
   */
  isStompCollision(enemy) {
    const character = this.world.character;
    const characterBottom = this.getCollisionBottom(character);
    const enemyTop = enemy.collisionArea.y;

    return (
      this.isFalling(character) &&
      this.isWithinStompRange(characterBottom, enemyTop, enemy) &&
      this.hasHorizontalOverlap(character, enemy)
    );
  }

  getCollisionBottom(object) {
    return object.collisionArea.y + object.collisionArea.height;
  }

  isFalling(character) {
    return character.isJumping && character.speedY <= 0;
  }

  isWithinStompRange(characterBottom, enemyTop, enemy) {
    const stompRange = this.getStompRange(enemy);

    return (
      characterBottom >= enemyTop - 5 &&
      characterBottom <= enemyTop + stompRange
    );
  }

  getStompRange(enemy) {
    if (enemy instanceof Chick) return 45;

    return 32;
  }

  hasHorizontalOverlap(character, enemy) {
    const characterEdges = this.getHorizontalEdges(character);
    const enemyEdges = this.getHorizontalEdges(enemy);

    return this.overlapsWithTolerance(characterEdges, enemyEdges, 8);
  }

  getHorizontalEdges(object) {
    const left = object.getCollisionX(object);

    return {
      left,
      right: left + object.collisionArea.width,
    };
  }

  overlapsWithTolerance(first, second, tolerance) {
    return (
      first.right > second.left + tolerance &&
      first.left < second.right - tolerance
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

  /**
   * Applies damage to the character when the damage cooldown allows it.
   *
   * @param {number} amount - Amount of health removed from the character.
   */
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
    setStoppableTimeout(() => {
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

    character.getCollisionArea();
    endboss.getCollisionArea();

    if (character.isColliding(endboss)) this.damageCharacter(20);
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
    return Boolean(bottle.landedAt && Date.now() - bottle.landedAt > 200);
  }

  /**
   * Handles a bottle collision with a regular enemy.
   *
   * @param {ThrowableObject} bottle - Bottle being checked.
   * @returns {boolean} Whether an enemy was hit.
   */
  handleBottleEnemyCollision(bottle) {
    const enemy = this.getBottleHitEnemy(bottle);

    if (!enemy) return false;

    audioManager.playEnemyDefeatSound();
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

  /**
   * Applies bottle damage when the bottle hits the active endboss.
   *
   * @param {ThrowableObject} bottle - Bottle being checked.
   */
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
    return Boolean(
      bottle.landedAt &&
      Date.now() - bottle.landedAt > this.groundedBottleLifetime,
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
    const character = this.world.character;

    character.getCollisionArea();

    return this.world.level.collectables.findIndex((item) => {
      item.getCollisionArea();
      return character.isColliding(item);
    });
  }

  collectItem(item) {
    if (item.type === "bottle") this.collectBottle();
    if (item.type === "coin") this.collectCoin();
  }

  collectBottle() {
    const character = this.world.character;
    const maxBottles = this.world.level.maxBottles;

    audioManager.playCollectBottleSound();
    character.bottleCount = Math.min(maxBottles, character.bottleCount + 1);
    this.updateCounterStatus("bottle", character.bottleCount, maxBottles);
  }

  collectCoin() {
    const character = this.world.character;
    const maxCoins = this.world.level.maxCoins;

    audioManager.playCollectCoinSound();
    character.coinCount = Math.min(maxCoins, character.coinCount + 1);
    this.updateCounterStatus("coin", character.coinCount, maxCoins);
  }

  updateCounterStatus(type, count, maxValue) {
    this.world.statusbars[type].setValue((100 / maxValue) * count);
  }
}
