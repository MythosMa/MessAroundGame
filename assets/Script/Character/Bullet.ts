import { _decorator, Component, Node } from "cc";
import { PLAYER_DIRECTION } from "../Types/PlayerStatus";
import { changePosition, checkOutScreen } from "../utils/nodeScriptTools";

const { ccclass, property } = _decorator;

@ccclass("Bullet")
export class Bul_le_t extends Component {
  @property
  bulletSpeed = 1;

  isStart = false;
  startPosition = null;
  bulletDirection = -1;
  currentScene = null;

  start() {}

  update(deltaTime: number) {
    if (this.isStart) {
      let currentPosition = this.node.getPosition(this.startPosition);
      if (this.bulletDirection === PLAYER_DIRECTION.TO_LEFT) {
        changePosition(currentPosition, -this.bulletSpeed);
      } else {
        changePosition(currentPosition, this.bulletSpeed);
      }
      this.node.setPosition(currentPosition);
      this.destoryBullet();
    }
  }

  shot(direction, currentScene) {
    this.bulletDirection = direction;
    this.currentScene = currentScene;
    this.isStart = true;
  }

  destoryBullet() {
    if (checkOutScreen(this.node.getPosition()) && this.currentScene) {
      this.currentScene.destoryBullet(this.node);
      this.isStart = false;
      this.node.removeFromParent();
    }
  }
}
