class Keyboard {
  KEYS = {
    LEFT: { code: "ArrowLeft", status: false },
    RIGHT: { code: "ArrowRight", status: false },
    JUMP: { code: "Space", status: false },
    THROW: { code: "KeyD", status: false },
  };

  constructor() {
    this.handleKeyDown();
    this.handleKeyUp();
  }

  handleKeyDown() {
    document.addEventListener("keydown", (e) => {
      switch (e.code) {
        case this.KEYS.LEFT.code:
          this.KEYS.LEFT.status = true;
          break;
        case this.KEYS.RIGHT.code:
          this.KEYS.RIGHT.status = true;
          break;
        case this.KEYS.JUMP.code:
          this.KEYS.JUMP.status = true;
          break;
        case this.KEYS.THROW.code:
          this.KEYS.THROW.status = true;
          break;
      }
    });
  }

  handleKeyUp() {
    document.addEventListener("keyup", (e) => {
      switch (e.code) {
        case this.KEYS.LEFT.code:
          this.KEYS.LEFT.status = false;
          break;
        case this.KEYS.RIGHT.code:
          this.KEYS.RIGHT.status = false;
          break;
        case this.KEYS.JUMP.code:
          this.KEYS.JUMP.status = false;
          break;
        case this.KEYS.THROW.code:
          this.KEYS.THROW.status = false;
          break;
      }
    });
  }

  isAnyKeyPressed() {
    for (let key in this.KEYS) {
      if (this.KEYS[key].status) return true;
    }
    return false;
  }
}
