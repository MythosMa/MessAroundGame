import { _decorator, Component, Node, input, Input, KeyCode } from "cc";
import { PLAYER_DIRECTION } from "../Character/Player/PlayerTypes";
import { KEY_CODE } from "./ControllerTypes";

const { ccclass, property } = _decorator;

@ccclass("Controller")
export class Controller extends Component {
  player = null;
  pressingKeys = [];

  onLoad() {
    this.player = this.node.getComponent("Player");
    input.on(Input.EventType.KEY_DOWN, this.keyDownCallback, this);
    input.on(Input.EventType.KEY_PRESSING, this.keyPressingCallback, this);
    input.on(Input.EventType.KEY_UP, this.keyUpCallback, this);
  }

  start() {}

  update(deltaTime: number) {}

  onDestory() {
    input.off(Input.EventType.KEY_DOWN, this.keyDownCallback, this);
  }

  keyDownCallback(event) {
    switch (event.keyCode) {
      case KEY_CODE.KEY_LEFT:
        this.player.moveKeyDown(PLAYER_DIRECTION.TO_LEFT);
        break;
      case KEY_CODE.KEY_RIGHT:
        this.player.moveKeyDown(PLAYER_DIRECTION.TO_RIGHT);
        break;
      case KEY_CODE.KEY_Z: // 射击
        this.player.playerShot();
        break;
      case KEY_CODE.KEY_SPACE:
        this.player.jumpKeyDown();
        break;
      case KeyCode.KEY_X:
        break;
    }
    if (this.pressingKeys.indexOf(event.keyCode) === -1) {
      this.pressingKeys.push(event.keyCode);
    }
  }

  keyPressingCallback(event) {}

  keyUpCallback(event) {
    switch (event.keyCode) {
      case KEY_CODE.KEY_LEFT:
        this.player.moveKeyUp(PLAYER_DIRECTION.TO_LEFT);
        break;
      case KEY_CODE.KEY_RIGHT:
        this.player.moveKeyUp(PLAYER_DIRECTION.TO_RIGHT);
        break;
      case KEY_CODE.KEY_SPACE:
        this.player.jumpKeyUp();
        break;
      case KEY_CODE.KEY_Z:
        break;
    }
    let keyIndex = this.pressingKeys.indexOf(event.keyCode);
    if (keyIndex !== -1) {
      this.pressingKeys.splice(keyIndex, 1);
    }
  }

  checkIsKeyPressing(keyCode) {
    return this.pressingKeys.indexOf(keyCode) !== -1;
  }
}
