class CollisionManager {
  world;
  groundedBottleLifetime = 3000;
  characterDamageCooldown = 1000;
  lastCharacterDamageAt = 0;

  constructor(world) {
    this.world = world;
    this.start();
  }

  /** Starts continuous collision checks. */
  start() {
    setStoppableInterval(() => {
      this.checkAllCollisions();
    }, 40);
  }

  /** Checks all active collisions. */
  checkAllCollisions() {
    if (!this.isWorldReady()) return;

    this.checkEnemyCollisions();
    this.checkEndbossCollision();
    this.checkCollectables();
    this.checkBottleCollisions();
    this.cleanupGroundedBottles();
  }

  /**
   * Checks whether collision checks can run.
   *
   * @returns {boolean} Whether collision checks can run.
   */
  isWorldReady() {
    return Boolean(
      this.world.level && this.world.character && this.world.level.endboss,
    );
  }

  /** Checks the enemy collisions. */
  checkEnemyCollisions() {
    this.world.character.getCollisionArea();

    const enemy = this.getCollidingEnemy();

    if (!enemy) return;

    this.handleEnemyCollision(enemy);
  }

  /**
   * Returns the enemy colliding with the character.
   *
   * @returns {MovableObject|undefined} Colliding enemy, if found.
   */
  getCollidingEnemy() {
    return this.world.level.enemies.find((enemy) => {
      if (!this.isActiveRegularEnemy(enemy)) return false;

      enemy.getCollisionArea();

      return this.world.character.isColliding(enemy);
    });
  }

  /**
   * Handles the enemy collision.
   *
   * @param {MovableObject} enemy - Enemy to process.
   */
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

  /**
   * Returns the collision bottom.
   *
   * @param {MovableObject} object - Object to inspect.
   * @returns {number} Bottom collision coordinate.
   */
  getCollisionBottom(object) {
    return object.collisionArea.y + object.collisionArea.height;
  }

  /**
   * Checks whether the character is falling.
   *
   * @param {Character} character - Character to inspect.
   * @returns {boolean} Whether the character is falling.
   */
  isFalling(character) {
    return character.isJumping && character.speedY <= 0;
  }

  /**
   * Checks whether the character is within stomp range.
   *
   * @param {number} characterBottom - Character collision bottom.
   * @param {number} enemyTop - Enemy collision top.
   * @param {MovableObject} enemy - Enemy to process.
   * @returns {boolean} Whether the character is within stomp range.
   */
  isWithinStompRange(characterBottom, enemyTop, enemy) {
    const stompRange = this.getStompRange(enemy);

    return (
      characterBottom >= enemyTop - 5 &&
      characterBottom <= enemyTop + stompRange
    );
  }

  /**
   * Returns the stomp range.
   *
   * @param {MovableObject} enemy - Enemy to process.
   * @returns {number} Allowed stomp range.
   */
  getStompRange(enemy) {
    if (enemy instanceof Chick) return 45;

    return 32;
  }

  /**
   * Checks whether two collision areas overlap horizontally.
   *
   * @param {Character} character - Character to inspect.
   * @param {MovableObject} enemy - Enemy to process.
   * @returns {boolean} Whether both collision areas overlap horizontally.
   */
  hasHorizontalOverlap(character, enemy) {
    const characterEdges = this.getHorizontalEdges(character);
    const enemyEdges = this.getHorizontalEdges(enemy);

    return this.overlapsWithTolerance(characterEdges, enemyEdges, 8);
  }

  /**
   * Returns the horizontal edges.
   *
   * @param {MovableObject} object - Object to inspect.
   * @returns {{left: number, right: number}} Horizontal collision edges.
   */
  getHorizontalEdges(object) {
    const left = object.getCollisionX(object);

    return {
      left,
      right: left + object.collisionArea.width,
    };
  }

  /**
   * Checks whether two edge ranges overlap.
   *
   * @param {{left: number, right: number}} first - First edge range.
   * @param {{left: number, right: number}} second - Second edge range.
   * @param {number} tolerance - Allowed overlap tolerance.
   * @returns {boolean} Whether both edge ranges overlap.
   */
  overlapsWithTolerance(first, second, tolerance) {
    return (
      first.right > second.left + tolerance &&
      first.left < second.right - tolerance
    );
  }

  /**
   * Applies collision damage from an enemy.
   *
   * @param {MovableObject} enemy - Enemy to process.
   */
  damageByEnemy(enemy) {
    if (!this.canTakeEnemyDamage()) return;

    this.damageCharacter(this.getEnemyDamage(enemy));
  }

  /**
   * Returns the enemy damage.
   *
   * @param {MovableObject} enemy - Enemy to process.
   * @returns {number} Damage caused by the enemy.
   */
  getEnemyDamage(enemy) {
    if (enemy instanceof Chick) return 5;
    if (enemy instanceof Chicken) return 10;

    return 0;
  }

  /**
   * Checks whether the character can take enemy damage.
   *
   * @returns {boolean} Whether the character can take enemy damage.
   */
  canTakeEnemyDamage() {
    return !this.world.character.isAboveGround() && this.canDamageCharacter();
  }

  /**
   * Checks whether character damage is currently allowed.
   *
   * @returns {boolean} Whether character damage is currently allowed.
   */
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

  /**
   * Smashes the enemy.
   *
   * @param {MovableObject} enemy - Enemy to process.
   */
  smashEnemy(enemy) {
    audioManager.playEnemyDefeatSound();
    this.defeatEnemy(enemy);
    this.world.character.speedY = 14;
  }

  /**
   * Defeats the enemy.
   *
   * @param {MovableObject} enemy - Enemy to process.
   */
  defeatEnemy(enemy) {
    this.world.stopEnemy(enemy);
    enemy.isDead = true;
    this.setEnemyDeathImage(enemy);
    this.removeDefeatedEnemy(enemy);
  }

  /**
   * Sets the enemy death image.
   *
   * @param {MovableObject} enemy - Enemy to process.
   */
  setEnemyDeathImage(enemy) {
    if (!this.hasDeathImage(enemy)) return;

    enemy.img = enemy.imageCache[enemy.IMAGES_DIE[0]];
  }

  /**
   * Checks whether an enemy has a loaded death image.
   *
   * @param {MovableObject} enemy - Enemy to process.
   * @returns {boolean} Whether the enemy has a loaded death image.
   */
  hasDeathImage(enemy) {
    return (
      enemy.IMAGES_DIE &&
      enemy.IMAGES_DIE.length > 0 &&
      enemy.imageCache &&
      enemy.imageCache[enemy.IMAGES_DIE[0]]
    );
  }

  /**
   * Removes the defeated enemy.
   *
   * @param {MovableObject} enemy - Enemy to process.
   */
  removeDefeatedEnemy(enemy) {
    setStoppableTimeout(() => {
      this.world.removeEnemy(enemy);
    }, this.getEnemyRemoveDelay(enemy));
  }

  /**
   * Returns the enemy removal delay.
   *
   * @param {MovableObject} enemy - Enemy to process.
   * @returns {number} Enemy removal delay in milliseconds.
   */
  getEnemyRemoveDelay(enemy) {
    if (enemy instanceof Chick) return 600;

    return 1200;
  }

  /** Checks the endboss collision. */
  checkEndbossCollision() {
    const endboss = this.world.level.endboss;
    const character = this.world.character;

    character.getCollisionArea();
    endboss.getCollisionArea();

    if (character.isColliding(endboss)) this.damageCharacter(20);
  }

  /** Checks the bottle collisions. */
  checkBottleCollisions() {
    this.world.throwables.forEach((bottle) => {
      if (!this.canBottleHit(bottle)) return;

      bottle.getCollisionArea();

      if (this.handleBottleEnemyCollision(bottle)) return;

      this.handleBottleEndbossCollision(bottle);
    });
  }

  /**
   * Checks whether a bottle can hit a target.
   *
   * @param {ThrowableObject} bottle - Bottle to process.
   * @returns {boolean} Whether the bottle can hit a target.
   */
  canBottleHit(bottle) {
    return !bottle.isSmashed && !this.isOldGroundedBottle(bottle);
  }

  /**
   * Checks whether a grounded bottle is stale.
   *
   * @param {ThrowableObject} bottle - Bottle to process.
   * @returns {boolean} Whether the grounded bottle is stale.
   */
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

  /**
   * Returns the enemy hit by a bottle.
   *
   * @param {ThrowableObject} bottle - Bottle to process.
   * @returns {MovableObject|undefined} Enemy hit by the bottle, if found.
   */
  getBottleHitEnemy(bottle) {
    return this.world.level.enemies.find((enemy) => {
      if (!this.isActiveRegularEnemy(enemy)) return false;

      enemy.getCollisionArea();

      return this.isBottleCollidingWithEnemy(bottle, enemy);
    });
  }

  /**
   * Checks whether a bottle and enemy collide.
   *
   * @param {ThrowableObject} bottle - Bottle to process.
   * @param {MovableObject} enemy - Enemy to process.
   * @returns {boolean} Whether the bottle and enemy collide.
   */
  isBottleCollidingWithEnemy(bottle, enemy) {
    return bottle.isColliding(enemy) || enemy.isColliding(bottle);
  }

  /**
   * Checks whether an enemy is active and regular.
   *
   * @param {MovableObject} enemy - Enemy to process.
   * @returns {boolean} Whether the enemy is an active regular enemy.
   */
  isActiveRegularEnemy(enemy) {
    return this.isRegularEnemy(enemy) && !enemy.isDead;
  }

  /**
   * Checks whether an object is a regular enemy.
   *
   * @param {MovableObject} enemy - Enemy to process.
   * @returns {boolean} Whether the object is a regular enemy.
   */
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

  /**
   * Checks whether a bottle hits the active endboss.
   *
   * @param {ThrowableObject} bottle - Bottle to process.
   * @param {Endboss} endboss - Endboss to inspect.
   * @returns {boolean} Whether the bottle hits the active endboss.
   */
  isBottleHittingEndboss(bottle, endboss) {
    return !endboss.isDead && !endboss.gotHit && endboss.isColliding(bottle);
  }

  /**
   * Smashes the bottle.
   *
   * @param {ThrowableObject} bottle - Bottle to process.
   */
  smashBottle(bottle) {
    bottle.smash(() => {
      this.removeThrowable(bottle);
    });
  }

  /**
   * Removes the throwable.
   *
   * @param {ThrowableObject} bottle - Bottle to process.
   */
  removeThrowable(bottle) {
    const bottleIndex = this.world.throwables.indexOf(bottle);

    if (bottleIndex === -1) return;

    this.world.throwables.splice(bottleIndex, 1);
  }

  /** Cleans up the grounded bottles. */
  cleanupGroundedBottles() {
    this.world.throwables = this.world.throwables.filter((bottle) => {
      return !this.shouldRemoveGroundedBottle(bottle);
    });
  }

  /**
   * Checks whether a grounded bottle should be removed.
   *
   * @param {ThrowableObject} bottle - Bottle to process.
   * @returns {boolean} Whether the grounded bottle should be removed.
   */
  shouldRemoveGroundedBottle(bottle) {
    return Boolean(
      bottle.landedAt &&
      Date.now() - bottle.landedAt > this.groundedBottleLifetime,
    );
  }

  /** Checks the collectables. */
  checkCollectables() {
    const itemIndex = this.getCollectableIndex();

    if (itemIndex === -1) return;

    const item = this.world.level.collectables[itemIndex];

    this.collectItem(item);
    this.world.level.collectables.splice(itemIndex, 1);
  }

  /**
   * Returns the collectable index.
   *
   * @returns {number} Index of the colliding collectable.
   */
  getCollectableIndex() {
    const character = this.world.character;

    character.getCollisionArea();

    return this.world.level.collectables.findIndex((item) => {
      item.getCollisionArea();
      return character.isColliding(item);
    });
  }

  /**
   * Collects the item.
   *
   * @param {CollectableObject} item - Collectable item.
   */
  collectItem(item) {
    if (item.type === "bottle") this.collectBottle();
    if (item.type === "coin") this.collectCoin();
  }

  /** Collects the bottle. */
  collectBottle() {
    const character = this.world.character;
    const maxBottles = this.world.level.maxBottles;

    audioManager.playCollectBottleSound();
    character.bottleCount = Math.min(maxBottles, character.bottleCount + 1);
    this.updateCounterStatus("bottle", character.bottleCount, maxBottles);
  }

  /** Collects the coin. */
  collectCoin() {
    const character = this.world.character;
    const maxCoins = this.world.level.maxCoins;

    audioManager.playCollectCoinSound();
    character.coinCount = Math.min(maxCoins, character.coinCount + 1);
    this.updateCounterStatus("coin", character.coinCount, maxCoins);
  }

  /**
   * Updates the counter status.
   *
   * @param {"bottle"|"coin"} type - Collectable type.
   * @param {number} count - Current collected item count.
   * @param {number} maxValue - Maximum counter value.
   */
  updateCounterStatus(type, count, maxValue) {
    this.world.statusbars[type].setValue((100 / maxValue) * count);
  }
}
