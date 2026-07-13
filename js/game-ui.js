const OVERLAY_BACKGROUNDS = {
  start: "./img/ui/start-screen-bg.png",
  lose: "./img/ui/game-over-bg.png",
  win: "./img/ui/win-screen-bg.png",
};

let gameOverlay;
let overlayTitle;
let overlayMessage;
let startButton;
let restartButton;
let homeButton;
let gameSoundButton;
let gameMenuButton;
let soundButtons = [];
let soundIcons = [];
let controlsButton;
let controlsDialog;
let controlsCloseButton;
let pauseDialog;
let resumeButton;

function showStartScreen() {
  init();
  hideGameSoundButton();
  hideGameMenuButton();
  closePauseMenu(false);
  setOverlayBackground("start");
  setOverlayContent(
    "El Pollo Loco",
    "Collect bottles, defeat chickens and beat the final boss.",
  );
  showStartMenu();
  showGameOverlay();
  updateInterfaceButtons();
}

/**
 * Displays the appropriate end screen for the game result.
 *
 * @param {"win"|"lose"} result - Final result of the game.
 */
function showEndScreen(result) {
  hideGameSoundButton();
  hideGameMenuButton();
  closeControlsDialog(false);
  closePauseMenu(false);

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
  updateInterfaceButtons();
}

function showLoseScreen() {
  setOverlayBackground("lose");
  setOverlayContent("Game over", "Pepe lost all health. Try again.");
  showEndMenu();
  showGameOverlay();
  updateInterfaceButtons();
}

function updateInterfaceButtons() {
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
  closeControlsDialog(false);
}

function showEndMenu() {
  startButton.classList.add("hidden");
  restartButton.classList.remove("hidden");
  homeButton.classList.remove("hidden");
  controlsButton.classList.add("hidden");
  closeControlsDialog(false);
}

function showGameOverlay() {
  gameOverlay.classList.remove("hidden");
}

function hideGameOverlay() {
  gameOverlay.classList.add("hidden");
}

function showGameSoundButton() {
  if (!gameSoundButton) return;

  gameSoundButton.classList.remove("hidden");
}

function hideGameSoundButton() {
  if (!gameSoundButton) return;

  gameSoundButton.classList.add("hidden");
}

function showGameMenuButton() {
  if (!gameMenuButton) return;

  gameMenuButton.classList.remove("hidden");
}

function hideGameMenuButton() {
  if (!gameMenuButton) return;

  gameMenuButton.classList.add("hidden");
}

function showPauseMenu() {
  if (!pauseDialog) return;

  pauseDialog.classList.remove("hidden");
  gameMenuButton?.setAttribute("aria-expanded", "true");
  hideGameMenuButton();
  resumeButton?.focus();
}

/**
 * Closes the pause menu.
 *
 * @param {boolean} [restoreFocus=true] - Whether focus returns to the menu button.
 */
function closePauseMenu(restoreFocus = true) {
  if (!pauseDialog) return;

  pauseDialog.classList.add("hidden");
  gameMenuButton?.setAttribute("aria-expanded", "false");

  if (restoreFocus) gameMenuButton?.focus();
}

function handlePauseDialogKeydown(event) {
  if (event.key !== "Escape") return;

  event.preventDefault();
  resumeGame();
}

/**
 * Updates the overlay background for the selected screen.
 *
 * @param {"start"|"win"|"lose"} screen - Overlay screen identifier.
 */
function setOverlayBackground(screen) {
  const imagePath = OVERLAY_BACKGROUNDS[screen];

  gameOverlay.style.backgroundImage = `url("${imagePath}")`;
}

function toggleSound() {
  createAudioManager();
  audioManager.toggleMute();
  updateSoundButton();
  updateBackgroundMusic();
}

function updateBackgroundMusic() {
  if (!isGameRunning || isGamePaused) return;

  if (audioManager.isMuted) {
    audioManager.pauseBackgroundMusic();
    return;
  }

  audioManager.resumeBackgroundMusic();
}

function updateSoundButton() {
  if (!audioManager) return;

  const iconPath = getSoundIconPath();

  soundIcons.forEach((icon) => {
    icon.src = iconPath;
  });

  updateSoundButtonLabels();
}

function getSoundIconPath() {
  return audioManager.isMuted
    ? "./img/symbol/volume-off.svg"
    : "./img/symbol/volume-on.svg";
}

function updateSoundButtonLabels() {
  const label = getSoundButtonLabel();

  soundButtons.forEach((button) => {
    updateSoundButtonAccessibility(button, label);
  });
}

function getSoundButtonLabel() {
  return audioManager.isMuted ? "Turn sound on" : "Turn sound off";
}

function updateSoundButtonAccessibility(button, label) {
  button.setAttribute("aria-label", label);
  button.setAttribute("aria-pressed", String(audioManager.isMuted));
  button.title = label;
}

function toggleControlsDialog() {
  if (controlsDialog.classList.contains("hidden")) {
    openControlsDialog();
    return;
  }

  closeControlsDialog();
}

function openControlsDialog() {
  controlsDialog.classList.remove("hidden");
  controlsButton.setAttribute("aria-expanded", "true");
  controlsCloseButton.focus();
}

/**
 * Closes the controls dialog.
 *
 * @param {boolean} [restoreFocus=true] - Whether focus returns to the controls button.
 */
function closeControlsDialog(restoreFocus = true) {
  if (!controlsDialog) return;

  controlsDialog.classList.add("hidden");
  controlsButton?.setAttribute("aria-expanded", "false");

  if (restoreFocus) controlsButton?.focus();
}

function handleControlsBackdropClick(event) {
  if (event.target !== event.currentTarget) return;

  closeControlsDialog();
}

function handleControlsDialogKeydown(event) {
  if (event.key !== "Escape") return;

  event.preventDefault();
  closeControlsDialog();
}

function blurActiveElement() {
  if (!document.activeElement) return;

  document.activeElement.blur();
}

function cacheDomElements() {
  cacheGameElements();
  cacheOverlayElements();
  cacheActionButtons();
  cacheSoundControls();
  cacheInterfaceButtons();
}

function cacheGameElements() {
  canvas = document.getElementById("canvas");
  gameOverlay = document.getElementById("game-overlay");
}

function cacheOverlayElements() {
  overlayTitle = document.getElementById("overlay-title");
  overlayMessage = document.getElementById("overlay-message");
  controlsDialog = document.getElementById("controls-dialog");
  controlsCloseButton = document.getElementById("controls-close-button");
  pauseDialog = document.getElementById("pause-dialog");
  resumeButton = document.getElementById("resume-button");
}

function cacheActionButtons() {
  startButton = document.getElementById("start-button");
  restartButton = document.getElementById("restart-button");
  homeButton = document.getElementById("home-button");
}

function cacheSoundControls() {
  gameSoundButton = document.getElementById("game-sound-button");
  gameMenuButton = document.getElementById("game-menu-button");
  soundButtons = getSoundButtons();
  soundIcons = getSoundIcons();
}

function getSoundButtons() {
  return [document.getElementById("sound-button"), gameSoundButton].filter(
    Boolean,
  );
}

function getSoundIcons() {
  return [
    document.getElementById("sound-icon"),
    document.getElementById("game-sound-icon"),
  ].filter(Boolean);
}

function cacheInterfaceButtons() {
  controlsButton = document.getElementById("controls-button");
}
