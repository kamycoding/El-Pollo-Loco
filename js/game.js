let canvas;
let world;
let keyboardListener;
let lastActiveTimestamp = Date.now();
let intervals = [];
let isGameRunning = false;

function init() {
  canvas = document.querySelector("canvas");
  keyboardListener = new Keyboard();
}

function startGame() {
  createWorld();
  world.draw();
  initLevel1Intervals();
  isGameRunning = true;
}

function createWorld() {
  world = new World(canvas);
  createLevel1();
  world.setLevel(level1);
  world.createCharacter();
  world.createStatusBars();
}

function setStopableInterval(fn, time) {
  intervals.push(setInterval(fn, time));
}

function calcRandomNumber(min, max) {
  return Math.round(Math.random() * (max - min)) + min;
}

function endGame() {
  setTimeout(() => {
    world.stopEnemiesAndClouds();
    world = null;
  }, 8000);
}
