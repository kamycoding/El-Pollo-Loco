let fullscreenButton;
let fullscreenIcon;
let fullscreenScrollY = 0;
let isPseudoFullscreen = false;
let isFullscreenListenerReady = false;

function addFullscreenListener() {
  cacheFullscreenElements();
  if (isFullscreenListenerReady) return updateFullscreenButton();

  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("keydown", handleFullscreenEscape);
  window.addEventListener("pagehide", cleanupFullscreenState);
  isFullscreenListenerReady = true;
  updateFullscreenButton();
}

function cacheFullscreenElements() {
  fullscreenButton = document.getElementById("fullscreen-button");
  fullscreenIcon = document.getElementById("fullscreen-icon");
}

function toggleFullscreen() {
  if (isGameFullscreenActive()) {
    exitGameFullscreen();
    return;
  }

  enterGameFullscreen();
}

function enterGameFullscreen() {
  const gameContainer = getGameContainer();
  if (!gameContainer) return;

  if (canUseNativeFullscreen(gameContainer)) {
    requestNativeFullscreen(gameContainer);
    return;
  }

  enterPseudoFullscreen(gameContainer);
}

function canUseNativeFullscreen(gameContainer) {
  return Boolean(document.fullscreenEnabled && gameContainer.requestFullscreen);
}

function requestNativeFullscreen(gameContainer) {
  gameContainer.requestFullscreen().catch(() => {
    enterPseudoFullscreen(gameContainer);
  });
}

function enterPseudoFullscreen(gameContainer) {
  if (isPseudoFullscreen) return;

  isPseudoFullscreen = true;
  lockPageScroll();
  gameContainer.classList.add("pseudo-fullscreen", "fullscreen-active");
  updateFullscreenButton();
}

function exitGameFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(cleanupFullscreenState);
    return;
  }

  exitPseudoFullscreen();
}

function exitPseudoFullscreen() {
  if (!isPseudoFullscreen) return;

  isPseudoFullscreen = false;
  getGameContainer()?.classList.remove(
    "pseudo-fullscreen",
    "fullscreen-active",
  );
  unlockPageScroll();
  updateFullscreenButton();
}

function handleFullscreenChange() {
  const gameContainer = getGameContainer();
  if (!gameContainer) return;

  gameContainer.classList.toggle(
    "fullscreen-active",
    document.fullscreenElement === gameContainer,
  );
  updateFullscreenButton();
}

function handleFullscreenEscape(event) {
  if (event.key !== "Escape" || !isPseudoFullscreen) return;

  event.preventDefault();
  exitPseudoFullscreen();
}

function cleanupFullscreenState() {
  isPseudoFullscreen = false;
  getGameContainer()?.classList.remove(
    "pseudo-fullscreen",
    "fullscreen-active",
  );
  unlockPageScroll();
  updateFullscreenButton();
}

function lockPageScroll() {
  fullscreenScrollY = window.scrollY;
  document.body.style.top = `-${fullscreenScrollY}px`;
  document.body.classList.add("fullscreen-scroll-lock");
}

function unlockPageScroll() {
  document.body.classList.remove("fullscreen-scroll-lock");
  document.body.style.top = "";
  window.scrollTo(0, fullscreenScrollY);
}

function isGameFullscreenActive() {
  return Boolean(document.fullscreenElement || isPseudoFullscreen);
}

function getGameContainer() {
  return document.getElementById("game-container");
}

function updateFullscreenButton() {
  if (!fullscreenButton || !fullscreenIcon) cacheFullscreenElements();
  if (!fullscreenButton || !fullscreenIcon) return;

  const isActive = isGameFullscreenActive();
  fullscreenIcon.src = getFullscreenIconPath(isActive);
  updateFullscreenButtonLabel(isActive);
}

function getFullscreenIconPath(isActive) {
  return isActive
    ? "symbols/exit-fullscreen.png"
    : "symbols/enter-fullscreen.png";
}

function updateFullscreenButtonLabel(isActive) {
  const label = isActive ? "Exit fullscreen" : "Enter fullscreen";

  fullscreenButton.setAttribute("aria-label", label);
  fullscreenButton.title = label;
}
