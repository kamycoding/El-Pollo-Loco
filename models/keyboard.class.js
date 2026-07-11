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

  addListeners() {
    document.addEventListener("keydown", this.handleKeyDown);

    document.addEventListener("keyup", this.handleKeyUp);
  }

  handleKeyDown = (event) => {
    this.handleKeyChange(event, true);
  };

  handleKeyUp = (event) => {
    this.handleKeyChange(event, false);
  };

  handleKeyChange(event, status) {
    const key = this.getKeyByCode(event.code);

    if (!key) return;

    event.preventDefault();
    key.status = status;

    if (status) {
      this.updateActivityTimer();
    }
  }

  updateActivityTimer() {
    lastActiveTimestamp = Date.now();
  }

  getKeyByCode(code) {
    return Object.values(this.KEYS).find((key) => {
      return key.code === code;
    });
  }

  resetKeys() {
    Object.values(this.KEYS).forEach((key) => {
      key.status = false;
    });
  }

  isAnyKeyPressed() {
    return Object.values(this.KEYS).some((key) => {
      return key.status;
    });
  }
}
