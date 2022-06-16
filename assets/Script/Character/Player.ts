import { _decorator, Component, Vec3, Tween } from "cc";
import {
  PLAYER_STATUS,
  PLAYER_ACTIONS,
  PLAYER_DIRECTION,
} from "../Types/PlayerStatus";
import { PlayerActionTreeNode } from "../Types/Common";
import { changePosition, dealCoolDown } from "../utils/nodeScriptTools";

const { ccclass, property } = _decorator;
@ccclass("Player")
export class Player extends Component {
  @property
  playerMovingSpeed = 0;

  @property
  playerJumpHeight = 0;

  @property
  playerJumpTime = 0;

  @property
  playerJumpHeighestDelay = 0;

  @property
  playerShotCD = 0;

  currentPlayerStatus = PLAYER_STATUS.STAND_BY;
  currentPlayerAction = PLAYER_ACTIONS.NO_ACTION;

  playerPosition = null;

  currentDeltaTime = 0;

  currentScene = null;

  // 角色当前移动操作池，为了处理有同时按下按键的可能性
  playerMovingPool = [];

  // 角色当前行为
  playerStatus = {
    direction: PLAYER_DIRECTION.TO_RIGHT,
    isMoving: false,
    isJumping: false,
  };

  // 角色当前行为树
  playerActionNode: PlayerActionTreeNode = {
    currentFunc: null,
    toNextConditionFunc: null,
    falseNext: null,
    trueNext: null,
  };

  // 角色当前数值

  // 当前移动速度
  playerCurrentMovingSpeed = 0;

  // 当前技能冷却
  currentCoolDown = { shot: 0 };

  onLoad() {
    const moveActionNode: PlayerActionTreeNode = {
      currentFunc: this.movingAction.bind(this),
      toNextConditionFunc: null,
      trueNext: null,
      falseNext: null,
    };
    this.playerActionNode.toNextConditionFunc = this.checkIsJumping.bind(this);
    this.playerActionNode.falseNext = moveActionNode;
  }

  start() {}

  test(testInfo) {
    console.log("player test==============");
    console.log(testInfo);
    console.log("player test==============");
  }

  setScene(scene) {
    this.currentScene = scene;
  }

  update(deltaTime: number) {
    this.currentDeltaTime = deltaTime;
    Object.keys(this.currentCoolDown).forEach((item) => {
      this.currentCoolDown[item] = dealCoolDown(
        this.currentCoolDown[item],
        deltaTime
      );
    });

    let actionNode = this.playerActionNode;
    while (actionNode) {
      actionNode.currentFunc && actionNode.currentFunc(deltaTime);
      if (actionNode.toNextConditionFunc) {
        actionNode = actionNode.toNextConditionFunc()
          ? actionNode.trueNext
          : actionNode.falseNext;
      } else {
        actionNode = null;
      }
    }
  }

  playerMoving(direction) {
    let currentPosition = this.node.getPosition(this.playerPosition);
    switch (direction) {
      case PLAYER_STATUS.MOVE_LEFT:
        changePosition(currentPosition, -this.playerMovingSpeed, "x");
        break;
      case PLAYER_STATUS.MOVE_RIGHT:
        changePosition(currentPosition, this.playerMovingSpeed, "x");

        break;
    }
    this.node.setPosition(currentPosition);
  }

  playerShot() {
    if (this.currentCoolDown.shot <= 0) {
      this.currentScene.playerShot(
        this.node.getPosition(),
        this.playerStatus.direction
      );
      this.currentCoolDown.shot = this.playerShotCD;
    }
  }

  checkIsJumping() {
    return this.playerStatus.isJumping;
  }

  checkIsMoving() {
    return this.playerStatus.isMoving;
  }

  movingKeyDown(playerMovingDirection) {
    this.playerMovingPool.push(playerMovingDirection);
    this.changePlayerDirection(this.playerMovingPool[0]);
    this.playerCurrentMovingSpeed =
      this.playerMovingSpeed *
      (this.playerStatus.direction === PLAYER_DIRECTION.TO_RIGHT ? 1 : -1);
    this.playerStatus.isMoving = true;
  }

  movingKeyUp(playerMovingDirection: PLAYER_DIRECTION) {
    let index = this.playerMovingPool.indexOf(playerMovingDirection);
    if (index !== -1) {
      this.playerMovingPool.splice(index, 1);
    }
    if (this.playerMovingPool.length) {
      this.changePlayerDirection(this.playerMovingPool[0]);
      this.playerCurrentMovingSpeed =
        this.playerMovingSpeed *
        (this.playerStatus.direction === PLAYER_DIRECTION.TO_RIGHT ? 1 : -1);
      this.playerStatus.isMoving = true;
    } else {
      this.playerCurrentMovingSpeed = 0;
      this.playerStatus.isMoving = false;
    }
  }

  movingAction(deltaTime: number) {
    let currentPosition = this.node.getPosition(this.playerPosition);
    changePosition(currentPosition, this.playerCurrentMovingSpeed, "x");
    this.node.setPosition(currentPosition);
  }

  changePlayerDirection(direction) { 
    if (this.playerStatus.direction !== direction) {
      this.playerStatus.direction = direction;
      const originScale = this.node.getScale();
      this.node.setScale(
        new Vec3(originScale.x * -1, originScale.y, originScale.z)
      );
    }
  }
}
