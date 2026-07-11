let canvas;
let world;
let keyboardListener;
let audioManager;
let lastActiveTimestamp = Date.now();
let intervals = [];
let isGameRunning = false;
let isGameEnding = false;
let isTouchContextMenuDisabled = false;

function startGame() {
  if (isGameRunning || isGameEnding) return;

  init();
  hideGameOverlay();
  showGameSoundButton();
  blurActiveElement();
  prepareGameAudio();

  isGameRunning = true;

  createWorld();
  world.draw();
  initLevel1Intervals();
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

function setStoppableInterval(callback, delay) {
  const intervalId = setInterval(callback, delay);

  intervals.push(intervalId);
}

function clearAllIntervals() {
  intervals.forEach((intervalId) => {
    clearInterval(intervalId);
  });

  intervals = [];
}

function calcRandomNumber(min, max) {
  return Math.round(Math.random() * (max - min)) + min;
}

function endGame(finishedWorld, result) {
  if (isGameEnding) return;

  isGameEnding = true;

  setTimeout(() => {
    finishGame(finishedWorld, result);
  }, 2500);
}

function finishGame(finishedWorld, result) {
  stopFinishedWorld(finishedWorld);
  resetGameState(finishedWorld);
  hideGameSoundButton();
  audioManager.stopBackgroundMusic();
  playEndSound(result);
  showEndScreen(result);
}

function stopFinishedWorld(finishedWorld) {
  clearAllIntervals();

  finishedWorld.stopEnemiesAndClouds();
  finishedWorld.stopDrawing();
}

function resetGameState(finishedWorld) {
  if (world === finishedWorld) {
    world = null;
  }

  isGameRunning = false;
  isGameEnding = false;
}

function playEndSound(result) {
  if (result === "win") {
    audioManager.playWinSound();
    return;
  }

  audioManager.playGameOverSound();
}

function restartGame() {
  resetCurrentGame();
  startGame();
}

function goToHomeScreen() {
  resetCurrentGame();
  showStartScreen();
}

function resetCurrentGame() {
  clearAllIntervals();
  resetKeyboard();
  hideGameSoundButton();
  stopCurrentWorld();
  stopCurrentAudio();

  isGameRunning = false;
  isGameEnding = false;
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
  disableTouchContextMenu();

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
}

function addFullscreenListener() {
  document.removeEventListener("fullscreenchange", updateFullscreenButton);

  document.addEventListener("fullscreenchange", updateFullscreenButton);
}

function disableTouchContextMenu() {
  if (isTouchContextMenuDisabled) return;

  const touchControls = document.getElementById("touch-controls");

  if (!touchControls) return;

  touchControls.addEventListener("contextmenu", preventContextMenu);

  isTouchContextMenuDisabled = true;
}

function preventContextMenu(event) {
  event.preventDefault();
}

function setTouchKey(keyName, status, event) {
  if (event) {
    event.preventDefault();
  }

  createKeyboardListener();

  if (!keyboardListener.KEYS[keyName]) return;

  keyboardListener.KEYS[keyName].status = status;
  lastActiveTimestamp = Date.now();
}
