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
let soundButtons = [];
let soundIcons = [];
let controlsButton;
let controlsDialog;
let controlsCloseButton;
let fullscreenButton;
let fullscreenIcon;

function showStartScreen() {
  init();
  hideGameSoundButton();
  setOverlayBackground("start");

  setOverlayContent(
    "El Pollo Loco",
    "Collect bottles, defeat chickens and beat the final boss.",
  );

  showStartMenu();
  showGameOverlay();
  updateInterfaceButtons();
}

function showEndScreen(result) {
  hideGameSoundButton();
  closeControlsDialog(false);

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
  if (!isGameRunning) return;

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
    ? "symbols/music_off.png"
    : "symbols/music_on.png";
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

function closeControlsDialog(restoreFocus = true) {
  if (!controlsDialog) return;

  controlsDialog.classList.add("hidden");

  if (controlsButton) {
    controlsButton.setAttribute("aria-expanded", "false");
  }

  if (restoreFocus && controlsButton) {
    controlsButton.focus();
  }
}

function handleControlsBackdropClick(event) {
  if (event.target !== event.currentTarget) {
    return;
  }

  closeControlsDialog();
}

function handleControlsDialogKeydown(event) {
  if (event.key !== "Escape") return;

  event.preventDefault();
  closeControlsDialog();
}

function toggleFullscreen() {
  const gameContainer = document.getElementById("game-container");

  if (!document.fullscreenElement) {
    requestGameFullscreen(gameContainer);
    return;
  }

  document.exitFullscreen();
}

function requestGameFullscreen(gameContainer) {
  gameContainer.requestFullscreen().catch(() => {});
}

function updateFullscreenButton() {
  if (!fullscreenIcon) return;

  fullscreenIcon.src = document.fullscreenElement
    ? "symbols/exit-fullscreen.png"
    : "symbols/enter-fullscreen.png";

  updateFullscreenButtonLabel();
}

function updateFullscreenButtonLabel() {
  if (!fullscreenButton) return;

  const label = document.fullscreenElement
    ? "Exit fullscreen"
    : "Enter fullscreen";

  fullscreenButton.setAttribute("aria-label", label);

  fullscreenButton.title = label;
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
}

function cacheActionButtons() {
  startButton = document.getElementById("start-button");

  restartButton = document.getElementById("restart-button");

  homeButton = document.getElementById("home-button");
}

function cacheSoundControls() {
  gameSoundButton = document.getElementById("game-sound-button");

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

  fullscreenButton = document.getElementById("fullscreen-button");

  fullscreenIcon = document.getElementById("fullscreen-icon");
}
