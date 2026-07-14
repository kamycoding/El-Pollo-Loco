const OVERLAY_BACKGROUNDS = {
  start: "./img/ui/start-screen-bg.webp",
  lose: "./img/ui/game-over-bg.webp",
  win: "./img/ui/win-screen-bg.webp",
};

let gameOverlay;
let overlayTitle;
let overlayMessage;
let startButton;
let restartButton;
let homeButton;
let gameMenuButton;
let gameFullscreenButton;
let soundButtons = [];
let soundIcons = [];
let pauseSoundLabel;
let controlsButton;
let controlsDialog;
let controlsCloseButton;
let pauseDialog;
let resumeButton;

/** Shows the start screen. */
function showStartScreen() {
  init();
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
  hideGameMenuButton();
  closeControlsDialog(false);
  closePauseMenu(false);

  if (result === "win") {
    showWinScreen();
    return;
  }

  showLoseScreen();
}

/** Shows the win screen. */
function showWinScreen() {
  setOverlayBackground("win");
  setOverlayContent("You won!", "The endboss is defeated. Nice job.");
  showEndMenu();
  showGameOverlay();
  updateInterfaceButtons();
}

/** Shows the loss screen. */
function showLoseScreen() {
  setOverlayBackground("lose");
  setOverlayContent("Game over", "Pepe lost all health. Try again.");
  showEndMenu();
  showGameOverlay();
  updateInterfaceButtons();
}

/** Updates the interface buttons. */
function updateInterfaceButtons() {
  updateSoundButton();
  updateFullscreenButton();
}

/**
 * Updates the overlay title and message.
 *
 * @param {string} title - Overlay heading.
 * @param {string} message - Overlay description.
 */
function setOverlayContent(title, message) {
  overlayTitle.textContent = title;
  overlayMessage.textContent = message;
}

/** Shows the start menu. */
function showStartMenu() {
  startButton.classList.remove("hidden");
  restartButton.classList.add("hidden");
  homeButton.classList.add("hidden");
  controlsButton.classList.remove("hidden");
  closeControlsDialog(false);
}

/** Shows the end menu. */
function showEndMenu() {
  startButton.classList.add("hidden");
  restartButton.classList.remove("hidden");
  homeButton.classList.remove("hidden");
  controlsButton.classList.add("hidden");
  closeControlsDialog(false);
}

/** Shows the game overlay. */
function showGameOverlay() {
  gameOverlay.classList.remove("hidden");
}

/** Hides the game overlay. */
function hideGameOverlay() {
  gameOverlay.classList.add("hidden");
}

/** Shows the game menu button. */
function showGameMenuButton() {
  gameMenuButton?.classList.remove("hidden");
  gameFullscreenButton?.classList.remove("hidden");
}

/** Hides the game menu button. */
function hideGameMenuButton() {
  gameMenuButton?.classList.add("hidden");
  gameFullscreenButton?.classList.add("hidden");
}

/** Displays the pause menu. */
/** Shows the pause menu. */
function showPauseMenu() {
  if (!pauseDialog) return;

  updateSoundButton();
  pauseDialog.classList.remove("hidden");
  gameMenuButton?.setAttribute("aria-expanded", "true");
  gameMenuButton?.classList.add("hidden");
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

/**
 * Resumes the game when Escape is pressed.
 *
 * @param {KeyboardEvent} event - Keyboard event to inspect.
 */
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

/** Toggles game audio mute state. */
/** Toggles the sound mute state. */
function toggleSound() {
  createAudioManager();
  audioManager.toggleMute();
  updateSoundButton();
  updateBackgroundMusic();
}

/** Updates the background music. */
function updateBackgroundMusic() {
  if (!isGameRunning || isGamePaused) return;

  if (audioManager.isMuted) {
    audioManager.pauseBackgroundMusic();
    return;
  }

  audioManager.resumeBackgroundMusic();
}

/** Updates the sound button. */
function updateSoundButton() {
  if (!audioManager) return;

  const iconPath = getSoundIconPath();

  soundIcons.forEach((icon) => {
    icon.src = iconPath;
  });

  updateSoundButtonLabels();
}

/**
 * Returns the icon for the current sound state.
 *
 * @returns {string} Current sound icon path.
 */
function getSoundIconPath() {
  return audioManager.isMuted
    ? "./img/symbol/volume-off.svg"
    : "./img/symbol/volume-on.svg";
}

/** Updates the sound button labels. */
function updateSoundButtonLabels() {
  const label = getSoundButtonLabel();

  soundButtons.forEach((button) => {
    updateSoundButtonAccessibility(button, label);
  });
  updatePauseSoundLabel();
}

/**
 * Returns the label for the current sound state.
 *
 * @returns {string} Accessible sound button label.
 */
function getSoundButtonLabel() {
  return audioManager.isMuted ? "Turn sound on" : "Turn sound off";
}

/** Updates the pause sound label. */
function updatePauseSoundLabel() {
  if (!pauseSoundLabel) return;

  pauseSoundLabel.textContent = audioManager.isMuted ? "Unmute" : "Mute";
}

/**
 * Updates a sound button's accessible state.
 *
 * @param {HTMLButtonElement} button - Sound button to update.
 * @param {string} label - Accessible button label.
 */
function updateSoundButtonAccessibility(button, label) {
  button.setAttribute("aria-label", label);
  button.setAttribute("aria-pressed", String(audioManager.isMuted));
  button.title = label;
}

/** Toggles the controls dialog. */
/** Toggles the controls dialog. */
function toggleControlsDialog() {
  if (controlsDialog.classList.contains("hidden")) {
    openControlsDialog();
    return;
  }

  closeControlsDialog();
}

/** Opens the controls dialog. */
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

/**
 * Closes the controls dialog from a backdrop click.
 *
 * @param {MouseEvent} event - Backdrop click event.
 */
function handleControlsBackdropClick(event) {
  if (event.target !== event.currentTarget) return;

  closeControlsDialog();
}

/**
 * Handles keyboard input for the controls dialog.
 *
 * @param {KeyboardEvent} event - Keyboard event to inspect.
 */
function handleControlsDialogKeydown(event) {
  if (event.key !== "Escape") return;

  event.preventDefault();
  closeControlsDialog();
}

/** Blurs the active element. */
function blurActiveElement() {
  if (!document.activeElement) return;

  document.activeElement.blur();
}

/** Caches the dom elements. */
function cacheDomElements() {
  cacheGameElements();
  cacheOverlayElements();
  cacheActionButtons();
  cacheSoundControls();
  cacheInterfaceButtons();
}

/** Caches the game elements. */
function cacheGameElements() {
  canvas = document.getElementById("canvas");
  gameOverlay = document.getElementById("game-overlay");
}

/** Caches the overlay elements. */
function cacheOverlayElements() {
  overlayTitle = document.getElementById("overlay-title");
  overlayMessage = document.getElementById("overlay-message");
  controlsDialog = document.getElementById("controls-dialog");
  controlsCloseButton = document.getElementById("controls-close-button");
  pauseDialog = document.getElementById("pause-dialog");
  resumeButton = document.getElementById("resume-button");
}

/** Caches the action buttons. */
function cacheActionButtons() {
  startButton = document.getElementById("start-button");
  restartButton = document.getElementById("restart-button");
  homeButton = document.getElementById("home-button");
}

/** Caches the sound controls. */
function cacheSoundControls() {
  gameMenuButton = document.getElementById("game-menu-button");
  pauseSoundLabel = document.getElementById("pause-sound-label");
  soundButtons = getSoundButtons();
  soundIcons = getSoundIcons();
}

/**
 * Returns all sound control buttons.
 *
 * @returns {HTMLButtonElement[]} Available sound buttons.
 */
function getSoundButtons() {
  return [
    document.getElementById("sound-button"),
    document.getElementById("pause-sound-button"),
  ].filter(Boolean);
}

/**
 * Returns all sound control icons.
 *
 * @returns {HTMLImageElement[]} Available sound icons.
 */
function getSoundIcons() {
  return [
    document.getElementById("sound-icon"),
    document.getElementById("pause-sound-icon"),
  ].filter(Boolean);
}

/** Caches the interface buttons. */
function cacheInterfaceButtons() {
  controlsButton = document.getElementById("controls-button");
  gameFullscreenButton = document.getElementById("game-fullscreen-button");
}
