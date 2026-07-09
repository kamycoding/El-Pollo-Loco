const OVERLAY_BACKGROUNDS = {
  start: "./img/ui/start-screen-bg.png",
  lose: "./img/ui/game-over-bg.png",
  win: "./img/ui/win-screen-bg.png",
};

let canvas;
let world;
let keyboardListener;
let audioManager;
let lastActiveTimestamp = Date.now();
let intervals = [];
let isGameRunning = false;
let isGameEnding = false;
let gameOverlay;
let overlayTitle;
let overlayMessage;
let startButton;
let restartButton;
let homeButton;
let soundButton;
let soundIcon;
let controlsButton;
let controlsPanel;
let fullscreenButton;
let fullscreenIcon;

function startGame() {
  if (isGameRunning || isGameEnding) return;

  init();
  hideGameOverlay();
  blurActiveElement();
  audioManager.unlockAudio();
  audioManager.playBackgroundMusic();

  isGameRunning = true;
  createWorld();
  world.draw();
  initLevel1Intervals();
}

function createWorld() {
  world = new World(canvas);
  createLevel1();
  world.setLevel(level1);
  world.createCharacter();
  world.createStatusBars();
}

function setStopableInterval(fn, time) {
  const intervalId = setInterval(fn, time);
  intervals.push(intervalId);
}

function clearAllIntervals() {
  intervals.forEach((intervalId) => clearInterval(intervalId));
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
  clearAllIntervals();
  finishedWorld.stopEnemiesAndClouds();
  finishedWorld.stopDrawing();

  if (world === finishedWorld) {
    world = null;
  }

  isGameRunning = false;
  isGameEnding = false;

  audioManager.stopBackgroundMusic();
  playEndSound(result);
  showEndScreen(result);
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

  if (world) {
    world.stopEnemiesAndClouds();
    world.stopDrawing();
    world = null;
  }

  if (audioManager) {
    audioManager.stopBackgroundMusic();
  }

  isGameRunning = false;
  isGameEnding = false;
}

function showStartScreen() {
  init();
  setOverlayBackground("start");
  setOverlayContent(
    "El Pollo Loco",
    "Collect bottles, defeat chickens and beat the final boss.",
  );
  showStartMenu();
  showGameOverlay();
  updateSoundButton();
  updateFullscreenButton();
}

function showEndScreen(result) {
  if (result === "win") {
    showWinScreen();
    return;
  }

  showLoseScreen();
}

function showWinScreen() {
  setOverlayBackground("win");
  setOverlayContent("You won!", "The endboss is defeated. Nice job.");
  showEndMenu();
  showGameOverlay();
  updateSoundButton();
  updateFullscreenButton();
}

function showLoseScreen() {
  setOverlayBackground("lose");
  setOverlayContent("Game over", "Pepe lost all health. Try again.");
  showEndMenu();
  showGameOverlay();
  updateSoundButton();
  updateFullscreenButton();
}

function setOverlayContent(title, message) {
  overlayTitle.textContent = title;
  overlayMessage.textContent = message;
}

function showStartMenu() {
  startButton.classList.remove("hidden");
  restartButton.classList.add("hidden");
  homeButton.classList.add("hidden");
  controlsButton.classList.remove("hidden");
  controlsPanel.classList.remove("hidden");
}

function showEndMenu() {
  startButton.classList.add("hidden");
  restartButton.classList.remove("hidden");
  homeButton.classList.remove("hidden");
  controlsButton.classList.add("hidden");
  controlsPanel.classList.add("hidden");
}

function showGameOverlay() {
  gameOverlay.classList.remove("hidden");
}

function hideGameOverlay() {
  gameOverlay.classList.add("hidden");
}

function setOverlayBackground(screen) {
  const imagePath = OVERLAY_BACKGROUNDS[screen];

  gameOverlay.style.backgroundImage = `url("${imagePath}")`;
}

function toggleSound() {
  createAudioManager();
  audioManager.toggleMute();
  updateSoundButton();
}

function updateSoundButton() {
  if (!soundIcon || !audioManager) return;

  soundIcon.src = audioManager.isMuted
    ? "symbols/music_off.png"
    : "symbols/music_on.png";
}

function toggleControls() {
  controlsPanel.classList.toggle("hidden");
}

function toggleFullscreen() {
  const gameContainer = document.getElementById("game-container");

  if (!document.fullscreenElement) {
    gameContainer.requestFullscreen();
    return;
  }

  document.exitFullscreen();
}

function updateFullscreenButton() {
  if (!fullscreenIcon) return;

  fullscreenIcon.src = document.fullscreenElement
    ? "symbols/exit-fullscreen.png"
    : "symbols/enter-fullscreen.png";
}

function blurActiveElement() {
  if (document.activeElement) {
    document.activeElement.blur();
  }
}

function init() {
  cacheDomElements();
  createAudioManager();
  createKeyboardListener();
  resetKeyboard();
  addFullscreenListener();
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

function cacheDomElements() {
  canvas = document.getElementById("canvas");
  gameOverlay = document.getElementById("game-overlay");
  overlayTitle = document.getElementById("overlay-title");
  overlayMessage = document.getElementById("overlay-message");
  startButton = document.getElementById("start-button");
  restartButton = document.getElementById("restart-button");
  homeButton = document.getElementById("home-button");
  soundButton = document.getElementById("sound-button");
  soundIcon = document.getElementById("sound-icon");
  controlsButton = document.getElementById("controls-button");
  controlsPanel = document.getElementById("controls-panel");
  fullscreenButton = document.getElementById("fullscreen-button");
  fullscreenIcon = document.getElementById("fullscreen-icon");
}
