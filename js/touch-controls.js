const TOUCH_ACTION_KEYS = new Set(["JUMP", "THROW"]);
const TOUCH_MIN_PRESS_MS = 90;
const touchStartedAt = new Map();
const touchReleaseTimers = new Map();
let touchControlsInitialized = false;

function initTouchControls() {
  if (touchControlsInitialized) return;

  const controls = document.getElementById("touch-controls");
  if (!controls) return;

  controls.addEventListener("contextmenu", preventTouchDefault);
  window.addEventListener("blur", resetTouchControls);
  document.addEventListener("visibilitychange", handleTouchVisibility);
  touchControlsInitialized = true;
}

/**
 * Updates a touch-controlled key.
 *
 * @param {string} keyName - Keyboard action name.
 * @param {boolean} status - Whether the action is pressed.
 * @param {PointerEvent} event - Pointer event from the touch button.
 */
function setTouchKey(keyName, status, event) {
  event?.preventDefault();
  createKeyboardListener();

  const key = keyboardListener?.KEYS[keyName];
  if (!key) return;
  if (rejectInactiveTouchInput(keyName, key, event)) return;

  if (status) pressTouchKey(keyName, key, event);
  else releaseTouchKey(keyName, key, event);

  lastActiveTimestamp = Date.now();
}

/**
 * Clears a touch action when gameplay cannot accept input.
 *
 * @param {string} keyName - Keyboard action name.
 * @param {{status: boolean}} key - Keyboard state to clear.
 * @param {PointerEvent} event - Pointer event from the touch button.
 * @returns {boolean} Whether the touch action was rejected.
 */
function rejectInactiveTouchInput(keyName, key, event) {
  if (canProcessGameInput()) return false;

  key.status = false;
  touchStartedAt.delete(keyName);
  clearTouchReleaseTimer(keyName);
  setTouchButtonPressed(event, false);
  return true;
}

function pressTouchKey(keyName, key, event) {
  clearTouchReleaseTimer(keyName);
  touchStartedAt.set(keyName, performance.now());
  key.status = true;
  captureTouchPointer(event);
  setTouchButtonPressed(event, true);
}

function releaseTouchKey(keyName, key, event) {
  if (shouldKeepCapturedPointer(event)) return;

  setTouchButtonPressed(event, false);
  releaseTouchPointer(event);
  scheduleTouchRelease(keyName, key, event);
}

function scheduleTouchRelease(keyName, key, event) {
  if (event?.type === "pointercancel") {
    finishTouchRelease(keyName, key);
    return;
  }

  const delay = getTouchReleaseDelay(keyName);
  if (delay === 0) finishTouchRelease(keyName, key);
  else queueTouchRelease(keyName, key, delay);
}

/**
 * Calculates the remaining minimum touch duration.
 *
 * @param {string} keyName - Keyboard action name.
 * @returns {number} Remaining delay in milliseconds.
 */
function getTouchReleaseDelay(keyName) {
  if (!TOUCH_ACTION_KEYS.has(keyName)) return 0;

  const startedAt = touchStartedAt.get(keyName) ?? performance.now();
  const elapsed = performance.now() - startedAt;
  return Math.max(0, TOUCH_MIN_PRESS_MS - elapsed);
}

function queueTouchRelease(keyName, key, delay) {
  const timerId = window.setTimeout(() => {
    finishTouchRelease(keyName, key);
  }, delay);

  touchReleaseTimers.set(keyName, timerId);
}

function finishTouchRelease(keyName, key) {
  key.status = false;
  touchStartedAt.delete(keyName);
  clearTouchReleaseTimer(keyName);
}

function clearTouchReleaseTimer(keyName) {
  const timerId = touchReleaseTimers.get(keyName);
  if (timerId === undefined) return;

  clearTimeout(timerId);
  touchReleaseTimers.delete(keyName);
}

function captureTouchPointer(event) {
  const button = event?.currentTarget;
  if (!button?.setPointerCapture) return;

  try {
    button.setPointerCapture(event.pointerId);
  } catch {}
}

function releaseTouchPointer(event) {
  const button = event?.currentTarget;
  if (!button?.hasPointerCapture?.(event.pointerId)) return;

  try {
    button.releasePointerCapture(event.pointerId);
  } catch {}
}

/**
 * Checks whether a pointer should remain captured.
 *
 * @param {PointerEvent} event - Pointer event to inspect.
 * @returns {boolean} Whether pointer capture should be kept.
 */
function shouldKeepCapturedPointer(event) {
  if (event?.type !== "pointerleave") return false;

  return Boolean(event.currentTarget?.hasPointerCapture?.(event.pointerId));
}

function setTouchButtonPressed(event, isPressed) {
  const button = event?.currentTarget;
  if (!button) return;

  button.classList.toggle("is-pressed", isPressed);
}

function handleTouchVisibility() {
  if (document.hidden) resetTouchControls();
}

function resetTouchControls() {
  touchReleaseTimers.forEach((timerId) => clearTimeout(timerId));
  touchReleaseTimers.clear();
  touchStartedAt.clear();
  keyboardListener?.resetKeys();
  clearTouchButtonStates();
}

function clearTouchButtonStates() {
  document.querySelectorAll(".touch-button.is-pressed").forEach((button) => {
    button.classList.remove("is-pressed");
  });
}

function preventTouchDefault(event) {
  event.preventDefault();
}
