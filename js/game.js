const GAME_END_DELAY = 1600;

let canvas;
let world;
let keyboardListener;
let audioManager;
let lastActiveTimestamp = Date.now();
let intervals = [];
let timeouts = [];
let gameEndTimeoutId = null;
let isGameRunning = false;
let isGameEnding = false;
let isGamePaused = false;
let pauseStartedAt = null;

/** Starts the game. */
function startGame() {
  if (isGameRunning || isGameEnding) return;

  initializeGameSession();
  createWorld();
  world.draw();
  initLevel1Intervals();
}

/** Initializes the game session. */
function initializeGameSession() {
  init();
  hideGameOverlay();
  closePauseMenu(false);
  showGameMenuButton();
  blurActiveElement();
  prepareGameAudio();
  isGameRunning = true;
  isGamePaused = false;
}

/** Prepares the game audio. */
function prepareGameAudio() {
  audioManager.stopAllSounds();
  audioManager.unlockAudio();
  audioManager.playBackgroundMusic();
}

/** Creates the active game world. */
function createWorld() {
  world = new World(canvas);
  createLevel1();
  world.setLevel(level1);
  world.createCharacter();
  world.createStatusBars();
}

/**
 * Creates a pause-aware interval and registers it for cleanup.
 *
 * @param {Function} callback - Function executed after each delay.
 * @param {number} delay - Interval delay in milliseconds.
 * @returns {number} Browser interval identifier.
 */
function setStoppableInterval(callback, delay) {
  const intervalId = setInterval(() => {
    if (!isGamePaused) callback();
  }, delay);

  intervals.push(intervalId);
  return intervalId;
}

/**
 * Clears a registered interval.
 *
 * @param {number|null|undefined} intervalId - Interval identifier to clear.
 */
function clearStoppableInterval(intervalId) {
  if (intervalId === null || intervalId === undefined) return;

  clearInterval(intervalId);
  intervals = intervals.filter((id) => id !== intervalId);
}

/**
 * Creates a pause-aware timeout and registers it for cleanup.
 *
 * @param {Function} callback - Function executed after the delay.
 * @param {number} delay - Timeout delay in milliseconds.
 * @returns {{id: number|null, callback: Function, remaining: number, startedAt: number}}
 *   Registered timeout record.
 */
function setStoppableTimeout(callback, delay) {
  const timeout = createTimeoutRecord(callback, delay);

  timeouts.push(timeout);
  scheduleTimeout(timeout);

  return timeout;
}

/**
 * Creates a pause-aware timeout record.
 *
 * @param {Function} callback - Function to execute.
 * @param {number} delay - Delay in milliseconds.
 * @returns {{id: number|null, callback: Function, remaining: number, startedAt: number}} Registered timeout record.
 */
function createTimeoutRecord(callback, delay) {
  return {
    id: null,
    callback,
    remaining: delay,
    startedAt: 0,
  };
}

/**
 * Schedules the timeout.
 *
 * @param {{id: number|null, callback: Function, remaining: number, startedAt: number}} timeout - Timeout record.
 */
function scheduleTimeout(timeout) {
  timeout.startedAt = Date.now();
  timeout.id = setTimeout(() => executeTimeout(timeout), timeout.remaining);
}

/**
 * Executes the timeout.
 *
 * @param {{id: number|null, callback: Function, remaining: number, startedAt: number}} timeout - Timeout record.
 */
function executeTimeout(timeout) {
  removeTimeout(timeout);
  timeout.id = null;
  timeout.callback();
}

/** Pauses all registered timeouts. */
function pauseAllTimeouts() {
  timeouts.forEach((timeout) => pauseTimeout(timeout));
}

/**
 * Pauses the timeout.
 *
 * @param {{id: number|null, callback: Function, remaining: number, startedAt: number}} timeout - Timeout record.
 */
function pauseTimeout(timeout) {
  if (timeout.id === null) return;

  clearTimeout(timeout.id);
  timeout.remaining = getRemainingTime(timeout);
  timeout.id = null;
}

/**
 * Calculates the remaining delay for a timeout.
 *
 * @param {{remaining: number, startedAt: number}} timeout - Timeout record.
 * @returns {number} Remaining delay in milliseconds.
 */
function getRemainingTime(timeout) {
  const elapsed = Date.now() - timeout.startedAt;

  return Math.max(0, timeout.remaining - elapsed);
}

/** Resumes all paused timeouts. */
function resumeAllTimeouts() {
  timeouts.forEach((timeout) => {
    if (timeout.id === null) scheduleTimeout(timeout);
  });
}

/**
 * Clears a registered pause-aware timeout.
 *
 * @param {{id: number|null}|null|undefined} timeout - Timeout record to clear.
 */
function clearStoppableTimeout(timeout) {
  if (!timeout) return;

  if (timeout.id !== null) clearTimeout(timeout.id);
  removeTimeout(timeout);
}

/**
 * Removes the timeout.
 *
 * @param {{id: number|null, callback: Function, remaining: number, startedAt: number}} timeout - Timeout record.
 */
function removeTimeout(timeout) {
  timeouts = timeouts.filter((item) => item !== timeout);
}

/** Clears all registered intervals. */
function clearAllIntervals() {
  intervals.forEach((intervalId) => clearInterval(intervalId));
  intervals = [];
}

/** Clears all registered timeouts. */
function clearAllTimeouts() {
  timeouts.forEach((timeout) => {
    if (timeout.id !== null) clearTimeout(timeout.id);
  });

  timeouts = [];
}

/** Clears all registered timers. */
function clearAllTimers() {
  clearAllIntervals();
  clearAllTimeouts();
}

/**
 * Returns a random integer within the inclusive range.
 *
 * @param {number} min - Lowest possible value.
 * @param {number} max - Highest possible value.
 * @returns {number} Random integer between min and max.
 */
function calcRandomNumber(min, max) {
  return Math.round(Math.random() * (max - min)) + min;
}

/**
 * Checks whether gameplay input may update the active world.
 *
 * @returns {boolean} Whether gameplay can accept input.
 */
function canProcessGameInput() {
  return isGameRunning && !isGamePaused && !isGameEnding && Boolean(world);
}

/** Pauses the active game. */
/** Pauses the game. */
function pauseGame() {
  if (!canPauseGame()) return;

  isGamePaused = true;
  pauseStartedAt = Date.now();
  resetKeyboard();
  pauseAllTimeouts();
  world.stopDrawing();
  audioManager.pauseAllSounds();
  showPauseMenu();
}

/**
 * Checks whether the current game can be paused.
 *
 * @returns {boolean} Whether the current game can be paused.
 */
function canPauseGame() {
  return isGameRunning && !isGameEnding && !isGamePaused && Boolean(world);
}

/** Resumes the paused game. */
/** Resumes the game. */
function resumeGame() {
  if (!isGamePaused || !world) return;

  preservePausedTimestamps();
  resetKeyboard();
  isGamePaused = false;
  pauseStartedAt = null;
  resumeAllTimeouts();
  closePauseMenu(false);
  showGameMenuButton();
  world.draw();
  resumeGameAudio();
  canvas.focus();
}

/** Preserves the paused timestamps. */
function preservePausedTimestamps() {
  const pauseDuration = Date.now() - pauseStartedAt;

  lastActiveTimestamp = Date.now();
  shiftCollisionTimestamp(pauseDuration);
  shiftBottleTimestamps(pauseDuration);
}

/**
 * Shifts the collision timestamp.
 *
 * @param {number} pauseDuration - Pause duration in milliseconds.
 */
function shiftCollisionTimestamp(pauseDuration) {
  const collisionManager = world?.collisionManager;

  if (!collisionManager?.lastCharacterDamageAt) return;

  collisionManager.lastCharacterDamageAt += pauseDuration;
}

/**
 * Shifts the bottle timestamps.
 *
 * @param {number} pauseDuration - Pause duration in milliseconds.
 */
function shiftBottleTimestamps(pauseDuration) {
  world.throwables.forEach((bottle) => {
    if (bottle.landedAt) bottle.landedAt += pauseDuration;
  });
}

/** Resumes the game audio. */
function resumeGameAudio() {
  if (audioManager.isMuted) return;

  audioManager.resumeBackgroundMusic();
}

/**
 * Schedules the end screen for the finished game session.
 *
 * @param {World} finishedWorld - World instance that reached an end state.
 * @param {"win"|"lose"} result - Result displayed on the end screen.
 */
function endGame(finishedWorld, result) {
  if (isGameEnding) return;

  isGameEnding = true;
  hideGameMenuButton();

  gameEndTimeoutId = setStoppableTimeout(() => {
    finishGame(finishedWorld, result);
  }, GAME_END_DELAY);
}

/**
 * Finishes the game.
 *
 * @param {World} finishedWorld - Finished world instance.
 * @param {"win"|"lose"} result - Game result.
 */
function finishGame(finishedWorld, result) {
  gameEndTimeoutId = null;

  if (world !== finishedWorld) return;

  stopFinishedWorld(finishedWorld);
  resetGameState(finishedWorld);
  hideGameMenuButton();
  audioManager.stopBackgroundMusic();
  playEndSound(result);
  showEndScreen(result);
}

/**
 * Stops the finished world.
 *
 * @param {World} finishedWorld - Finished world instance.
 */
function stopFinishedWorld(finishedWorld) {
  clearAllTimers();
  finishedWorld.stopEnemiesAndClouds();
  finishedWorld.stopDrawing();
}

/**
 * Resets the game state.
 *
 * @param {World} finishedWorld - Finished world instance.
 */
function resetGameState(finishedWorld) {
  if (world === finishedWorld) world = null;

  isGameRunning = false;
  isGameEnding = false;
  isGamePaused = false;
  pauseStartedAt = null;
}

/**
 * Plays the end sound.
 *
 * @param {"win"|"lose"} result - Game result.
 */
function playEndSound(result) {
  if (result === "win") {
    audioManager.playWinSound();
    return;
  }

  audioManager.playGameOverSound();
}

/** Restarts the active game. */
/** Restarts the game. */
function restartGame() {
  resetCurrentGame();
  startGame();
}

/** Returns to the start screen. */
/** Returns to the home screen. */
function goToHomeScreen() {
  resetCurrentGame();
  showStartScreen();
}

/** Resets the current game. */
function resetCurrentGame() {
  clearPendingGameEnd();
  clearAllTimers();
  resetKeyboard();
  exitGameFullscreen();
  closePauseMenu(false);
  hideGameMenuButton();
  stopCurrentWorld();
  stopCurrentAudio();
  resetSessionFlags();
}

/** Resets the session flags. */
function resetSessionFlags() {
  isGameRunning = false;
  isGameEnding = false;
  isGamePaused = false;
  pauseStartedAt = null;
}

/** Clears the pending game end. */
function clearPendingGameEnd() {
  if (gameEndTimeoutId === null) return;

  clearStoppableTimeout(gameEndTimeoutId);
  gameEndTimeoutId = null;
}

/** Stops the current world. */
function stopCurrentWorld() {
  if (!world) return;

  world.stopEnemiesAndClouds();
  world.stopDrawing();
  world = null;
}

/** Stops the current audio. */
function stopCurrentAudio() {
  if (!audioManager) return;

  audioManager.stopAllSounds();
}

/** Initializes the game dependencies. */
function init() {
  cacheDomElements();
  createAudioManager();
  createKeyboardListener();
  resetKeyboard();
  addFullscreenListener();
  initTouchControls();
  canvas.focus();
}

/** Creates the audio manager. */
function createAudioManager() {
  if (audioManager) return;

  audioManager = new AudioManager();
  updateSoundButton();
}

/** Creates the keyboard listener. */
function createKeyboardListener() {
  if (keyboardListener) return;

  keyboardListener = new Keyboard();
}

/** Resets the keyboard. */
function resetKeyboard() {
  if (!keyboardListener) return;

  keyboardListener.resetKeys();
  if (typeof resetTouchControls === "function") resetTouchControls();
}

/** Adds the fullscreen event listeners. */
function addFullscreenListener() {
  document.removeEventListener("fullscreenchange", updateFullscreenButton);
  document.addEventListener("fullscreenchange", updateFullscreenButton);
}
