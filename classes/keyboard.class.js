class Keyboard {
  KEYS = {
    LEFT: {
      code: "ArrowLeft",
      status: false,
    },

    RIGHT: {
      code: "ArrowRight",
      status: false,
    },

    JUMP: {
      code: "Space",
      status: false,
    },

    THROW: {
      code: "KeyD",
      status: false,
    },
  };

  constructor() {
    this.addListeners();
  }

  /** Adds keyboard event listeners. */
  addListeners() {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  }

  /**
   * Handles a keyboard keydown event.
   *
   * @param {KeyboardEvent} event - Triggered keyboard event.
   */
  handleKeyDown = (event) => {
    this.handleKeyChange(event, true);
  };

  /**
   * Handles a keyboard keyup event.
   *
   * @param {KeyboardEvent} event - Triggered keyboard event.
   */
  handleKeyUp = (event) => {
    this.handleKeyChange(event, false);
  };

  /**
   * Updates a key state from a keyboard event.
   *
   * @param {KeyboardEvent} event - Triggered keyboard event.
   * @param {boolean} status - Whether the key is pressed.
   */
  handleKeyChange(event, status) {
    const key = this.getKeyByCode(event.code);
    if (!key) return;

    event.preventDefault();
    if (!canProcessGameInput()) {
      key.status = false;
      return;
    }

    key.status = status;
    if (status) this.updateActivityTimer();
  }

  /** Updates the activity timer. */
  updateActivityTimer() {
    lastActiveTimestamp = Date.now();
  }

  /**
   * Finds a configured key by its keyboard event code.
   *
   * @param {string} code - Keyboard event code.
   * @returns {{code: string, status: boolean}|undefined} Matching key state.
   */
  getKeyByCode(code) {
    return Object.values(this.KEYS).find((key) => {
      return key.code === code;
    });
  }

  /** Resets the keys. */
  resetKeys() {
    Object.values(this.KEYS).forEach((key) => {
      key.status = false;
    });
  }

  /**
   * Checks whether any configured key is pressed.
   *
   * @returns {boolean} Whether any configured key is pressed.
   */
  isAnyKeyPressed() {
    return Object.values(this.KEYS).some((key) => {
      return key.status;
    });
  }
}
