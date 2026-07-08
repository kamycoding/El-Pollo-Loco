let canvas;
let world;
let keyboardListener;
let lastActiveTimestamp = Date.now();
let intervals = [];
let isGameRunning = false;
let isGameEnding = false;

function startGame() {
  if (isGameRunning || isGameEnding) return;

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

function endGame(finishedWorld) {
  if (isGameEnding) return;

  isGameEnding = true;

  setTimeout(() => {
    clearAllIntervals();
    finishedWorld.stopEnemiesAndClouds();
    finishedWorld.stopDrawing();

    if (world === finishedWorld) {
      world = null;
    }

    isGameRunning = false;
    isGameEnding = false;
  }, 8000);
}

function init() {
  canvas = document.querySelector("canvas");
  keyboardListener = new Keyboard();
  canvas.focus();
  document.querySelector("button").blur();
}
