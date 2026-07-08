const OVERLAY_BACKGROUNDS = {
  start: "./img/ui/start-screen-bg.png",
  lose: "./img/ui/game-over-bg.png",
  win: "./img/ui/win-screen-bg.png",
};

let canvas;
let world;
let keyboardListener;
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

function startGame() {
  if (isGameRunning || isGameEnding) return;

  init();
  hideGameOverlay();
  blurActiveElement();

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
  showEndScreen(result);
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

  if (world) {
    world.stopEnemiesAndClouds();
    world.stopDrawing();
    world = null;
  }

  isGameRunning = false;
  isGameEnding = false;
}

function showStartScreen() {
  if (!canvas) {
    init();
  }

  setOverlayBackground("start");
  setOverlayContent(
    "El Pollo Loco",
    "Collect bottles, defeat chickens and beat the final boss.",
  );
  showStartButton();
  showGameOverlay();
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
  showEndButtons();
  showGameOverlay();
}

function showLoseScreen() {
  setOverlayBackground("lose");
  setOverlayContent("Game over", "Pepe lost all health. Try again.");
  showEndButtons();
  showGameOverlay();
}

function setOverlayContent(title, message) {
  overlayTitle.textContent = title;
  overlayMessage.textContent = message;
}

function showStartButton() {
  startButton.classList.remove("hidden");
  restartButton.classList.add("hidden");
  homeButton.classList.add("hidden");
}

function showEndButtons() {
  startButton.classList.add("hidden");
  restartButton.classList.remove("hidden");
  homeButton.classList.remove("hidden");
}

function showGameOverlay() {
  gameOverlay.classList.remove("hidden");
}

function hideGameOverlay() {
  gameOverlay.classList.add("hidden");
}

function blurActiveElement() {
  if (document.activeElement) {
    document.activeElement.blur();
  }
}

function init() {
  cacheDomElements();
  keyboardListener = new Keyboard();
  canvas.focus();
}

function cacheDomElements() {
  canvas = document.getElementById("canvas");
  gameOverlay = document.getElementById("game-overlay");
  overlayTitle = document.getElementById("overlay-title");
  overlayMessage = document.getElementById("overlay-message");
  startButton = document.getElementById("start-button");
  restartButton = document.getElementById("restart-button");
  homeButton = document.getElementById("home-button");
}

function setOverlayBackground(screen) {
  const imagePath = OVERLAY_BACKGROUNDS[screen];

  gameOverlay.style.backgroundImage = `url("${imagePath}")`;
}
