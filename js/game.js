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

function startGame() {
  if (isGameRunning || isGameEnding) return;

  initializeGameSession();
  createWorld();
  world.draw();
  initLevel1Intervals();
}

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

function prepareGameAudio() {
  audioManager.stopAllSounds();
  audioManager.unlockAudio();
  audioManager.playBackgroundMusic();
}

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

function createTimeoutRecord(callback, delay) {
  return {
    id: null,
    callback,
    remaining: delay,
    startedAt: 0,
  };
}

function scheduleTimeout(timeout) {
  timeout.startedAt = Date.now();
  timeout.id = setTimeout(() => executeTimeout(timeout), timeout.remaining);
}

function executeTimeout(timeout) {
  removeTimeout(timeout);
  timeout.id = null;
  timeout.callback();
}

function pauseAllTimeouts() {
  timeouts.forEach((timeout) => pauseTimeout(timeout));
}

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

function removeTimeout(timeout) {
  timeouts = timeouts.filter((item) => item !== timeout);
}

function clearAllIntervals() {
  intervals.forEach((intervalId) => clearInterval(intervalId));
  intervals = [];
}

function clearAllTimeouts() {
  timeouts.forEach((timeout) => {
    if (timeout.id !== null) clearTimeout(timeout.id);
  });

  timeouts = [];
}

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

function canPauseGame() {
  return isGameRunning && !isGameEnding && !isGamePaused && Boolean(world);
}

/** Resumes the paused game. */
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

function preservePausedTimestamps() {
  const pauseDuration = Date.now() - pauseStartedAt;

  lastActiveTimestamp = Date.now();
  shiftCollisionTimestamp(pauseDuration);
  shiftBottleTimestamps(pauseDuration);
}

function shiftCollisionTimestamp(pauseDuration) {
  const collisionManager = world?.collisionManager;

  if (!collisionManager?.lastCharacterDamageAt) return;

  collisionManager.lastCharacterDamageAt += pauseDuration;
}

function shiftBottleTimestamps(pauseDuration) {
  world.throwables.forEach((bottle) => {
    if (bottle.landedAt) bottle.landedAt += pauseDuration;
  });
}

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

function stopFinishedWorld(finishedWorld) {
  clearAllTimers();
  finishedWorld.stopEnemiesAndClouds();
  finishedWorld.stopDrawing();
}

function resetGameState(finishedWorld) {
  if (world === finishedWorld) world = null;

  isGameRunning = false;
  isGameEnding = false;
  isGamePaused = false;
  pauseStartedAt = null;
}

function playEndSound(result) {
  if (result === "win") {
    audioManager.playWinSound();
    return;
  }

  audioManager.playGameOverSound();
}

/** Restarts the active game. */
function restartGame() {
  resetCurrentGame();
  startGame();
}

/** Returns to the start screen. */
function goToHomeScreen() {
  resetCurrentGame();
  showStartScreen();
}

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

function resetSessionFlags() {
  isGameRunning = false;
  isGameEnding = false;
  isGamePaused = false;
  pauseStartedAt = null;
}

function clearPendingGameEnd() {
  if (gameEndTimeoutId === null) return;

  clearStoppableTimeout(gameEndTimeoutId);
  gameEndTimeoutId = null;
}

function stopCurrentWorld() {
  if (!world) return;

  world.stopEnemiesAndClouds();
  world.stopDrawing();
  world = null;
}

function stopCurrentAudio() {
  if (!audioManager) return;

  audioManager.stopAllSounds();
}

function init() {
  cacheDomElements();
  createAudioManager();
  createKeyboardListener();
  resetKeyboard();
  addFullscreenListener();
  initTouchControls();
  canvas.focus();
}

function createAudioManager() {
  if (audioManager) return;

  audioManager = new AudioManager();
  updateSoundButton();
}

function createKeyboardListener() {
  if (keyboardListener) return;

  keyboardListener = new Keyboard();
}

function resetKeyboard() {
  if (!keyboardListener) return;

  keyboardListener.resetKeys();
  if (typeof resetTouchControls === "function") resetTouchControls();
}

function addFullscreenListener() {
  document.removeEventListener("fullscreenchange", updateFullscreenButton);
  document.addEventListener("fullscreenchange", updateFullscreenButton);
}
