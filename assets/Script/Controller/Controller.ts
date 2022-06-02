import { _decorator, Component, Node, input, Input, KeyCode } from "cc";
import { PLAYER_STATUS, PLAYER_ACTIONS } from "../Types/PlayerStatus";
import { KEY_CODE } from "../Types/Common";

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
    console.log("keyDownCallback===============");
    console.log(event);
    console.log("keyDownCallback===============");
    switch (event.keyCode) {
      case KEY_CODE.KEY_LEFT:
        this.player.changePlayerMovingStatus(PLAYER_STATUS.MOVE_LEFT);
        break;
      case KEY_CODE.KEY_RIGHT:
        this.player.changePlayerMovingStatus(PLAYER_STATUS.MOVE_RIGHT);
        break;
      case KEY_CODE.KEY_Z:
        this.player.setPlayerAction(PLAYER_ACTIONS.JUMP);
        break;
      case KeyCode.KEY_X:
        this.player.playerShot();
        break;
    }
  }

  keyPressingCallback(event) {
    console.log("keyPressingCallback===============");
    console.log(event);
    console.log("keyPressingCallback===============");
  }

  keyUpCallback(event) {
    console.log("keyUpCallback===============");
    console.log(event);
    console.log("keyUpCallback===============");
    switch (event.keyCode) {
      case KEY_CODE.KEY_LEFT:
        this.player.changePlayerMovingStatus(PLAYER_STATUS.MOVE_LEFT, false);
        break;
      case KEY_CODE.KEY_RIGHT:
        this.player.changePlayerMovingStatus(PLAYER_STATUS.MOVE_RIGHT, false);
        break;
    }
  }

  checkIsKeyPressing(keyCode) {
    return this.pressingKeys.indexOf(keyCode) !== -1;
  }
}
