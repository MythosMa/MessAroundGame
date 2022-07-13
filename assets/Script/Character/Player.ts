import { _decorator, Component, Vec3, Tween } from "cc";
import {
  PLAYER_STATUS,
  PLAYER_ACTIONS,
  PLAYER_DIRECTION,
  PLAYER_JUMP_DIRECTION,
} from "../Types/PlayerStatus";
import { JumpActionData, PlayerActionTreeNode } from "../Types/Common";
import { changePosition, dealCoolDown } from "../utils/nodeScriptTools";

const { ccclass, property } = _decorator;
@ccclass("Player")
export class Player extends Component {
  @property
  playerMovingSpeed = 0;

  @property
  playerJumpHeight = 0;

  @property
  playerJumpSpeed = 0;

  @property
  playerJumpSinRatio = 0;

  @property
  playerJumpHeighestDelay = 0;

  @property
  playerShotCD = 0; // 公开设置数据：角色射击CD值

  @property
  playerJumpKeyPressTime = 0; // 跳跃按钮响应最长时长（根据按键时长跳跃高度的上限）

  playerPosition = null;

  currentDeltaTime = 0;

  currentScene = null;

  // 角色当前移动操作池，为了处理有同时按下按键的可能性
  playerMovingPool = [];

  // 角色当前行为
  playerStatus = {
    direction: PLAYER_DIRECTION.TO_RIGHT,
    jumpDirection: PLAYER_JUMP_DIRECTION.TO_DOWN,
    isMoving: false,
    isJumping: false,
  };

  // 角色当前行为树
  playerActionNode: PlayerActionTreeNode = {
    currentNodeFunc: undefined,
    toNextConditionFunc: undefined,
    falseNext: undefined,
    trueNext: undefined,
    noNextNodeFunc: undefined,
  };

  // 角色跳跃信息
  playerJumpDatas: JumpActionData = {
    startPositionY: 0,
    changeToOverPositionY: 0,
    targetPositionY: 0,
    currentPositionY: 0,
    jumpSpeed: 0,
  };

  // 角色当前数值

  // 当前移动速度
  playerCurrentMovingSpeed = 0;

  // 当前技能冷却
  coolDownMaps = { shot: 0, jumpKeyPress: 0 };

  onLoad() {
    const moveActionNode: PlayerActionTreeNode = {
      toNextConditionFunc: undefined,
      trueNext: undefined,
      falseNext: undefined,
      currentNodeFunc: undefined,
      noNextNodeFunc: this.movingAction.bind(this),
    };
    const jumpMoveActionNode: PlayerActionTreeNode = {
      toNextConditionFunc: undefined,
      trueNext: undefined,
      falseNext: undefined,
      currentNodeFunc: undefined,
      noNextNodeFunc: this.jumpingMoveAction.bind(this),
    };
    const jumpActionNode: PlayerActionTreeNode = {
      toNextConditionFunc: this.checkIsMoving.bind(this),
      trueNext: jumpMoveActionNode,
      falseNext: undefined,
      currentNodeFunc: undefined,
      noNextNodeFunc: this.jumpingAction.bind(this),
    };
    this.playerActionNode.toNextConditionFunc = this.checkIsJumping.bind(this);
    this.playerActionNode.falseNext = moveActionNode;
    this.playerActionNode.trueNext = jumpActionNode;
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
    Object.keys(this.coolDownMaps).forEach((item) => {
      this.coolDownMaps[item] = dealCoolDown(
        this.coolDownMaps[item],
        deltaTime
      );
    });

    let actionNode = this.playerActionNode;
    while (actionNode) {
      actionNode.currentNodeFunc && actionNode.currentNodeFunc(deltaTime);
      let nextNode = null;
      if (actionNode.toNextConditionFunc) {
        nextNode = actionNode.toNextConditionFunc()
          ? actionNode.trueNext
          : actionNode.falseNext;
      } else {
        nextNode = null;
      }
      if (!nextNode) {
        actionNode.noNextNodeFunc && actionNode.noNextNodeFunc(deltaTime);
      }
      actionNode = nextNode;
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
    if (this.coolDownMaps.shot <= 0) {
      this.currentScene.playerShot(
        this.node.getPosition(),
        this.playerStatus.direction
      );
      this.coolDownMaps.shot = this.playerShotCD;
    }
  }

  checkIsMoving() {
    return this.playerStatus.isMoving;
  }

  moveKeyDown(playerMovingDirection) {
    this.playerMovingPool.push(playerMovingDirection);
    this.changePlayerDirection(this.playerMovingPool[0]);
    this.playerCurrentMovingSpeed =
      this.playerMovingSpeed *
      (this.playerStatus.direction === PLAYER_DIRECTION.TO_RIGHT ? 1 : -1);
    this.playerStatus.isMoving = true;
  }

  moveKeyUp(playerMovingDirection: PLAYER_DIRECTION) {
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

  checkIsJumping() {
    return this.playerStatus.isJumping;
  }

  jumpKeyDown() {
    if (!this.playerStatus.isJumping) {
      this.playerStatus.isJumping = true;
      this.coolDownMaps.jumpKeyPress = this.playerJumpKeyPressTime;
    }
  }

  jumpKeyUp() {
    if (this.playerStatus.isJumping) {
      this.coolDownMaps.jumpKeyPress = 0;
    }
  }

  // jumpKeyDown() {
  //   if (!this.playerStatus.isJumping) {
  //     this.playerStatus.isJumping = true;
  //     let currentPosition = this.node.getPosition();
  //     this.playerJumpDatas.targetPositionY =
  //       currentPosition.y + this.playerJumpHeight;
  //     this.playerJumpDatas.startPositionY = currentPosition.y;
  //     this.playerJumpDatas.currentPositionY = currentPosition.y;
  //     this.playerJumpDatas.changeToOverPositionY =
  //       currentPosition.y + this.playerJumpHeight * this.playerJumpSinRatio;
  //     this.playerJumpDatas.jumpSpeed = this.playerJumpSpeed;
  //     this.playerStatus.jumpDirection = PLAYER_JUMP_DIRECTION.TO_UP;
  //   }
  // }

  // jumpKeyUp() {
  //   if (this.playerStatus.jumpDirection === PLAYER_JUMP_DIRECTION.TO_UP) {
  //     // this.playerStatus.jumpDirection = PLAYER_JUMP_DIRECTION.TO_UP_OVER;
  //   }
  // }

  // jumpingAction(deltaTime: number) {
  //   let currentPosition = this.node.getPosition(this.playerPosition);
  //   switch (this.playerStatus.jumpDirection) {
  //     case PLAYER_JUMP_DIRECTION.TO_UP:
  //       changePosition(currentPosition, this.playerJumpSpeed, "y");
  //       break;
  //     case PLAYER_JUMP_DIRECTION.TO_UP_OVER:
  //       break;
  //     case PLAYER_JUMP_DIRECTION.TO_DOWN_START:
  //       break;
  //     case PLAYER_JUMP_DIRECTION.TO_DOWN:
  //       break;
  //   }
  //   this.node.setPosition(currentPosition);
  //   console.log("jumpingAction===============");
  //   console.log("jumpingAction");
  //   console.log(currentPosition);
  //   console.log("jumpingAction===============");
  // }

  // jumpingMoveAction(deltaTime: number) {
  //   console.log("jumpingMoveAction===============");
  //   console.log("jumpingMoveAction");
  //   console.log("jumpingMoveAction===============");
  // }

  jumpingAction(deltaTime: number) {
    console.log("jumpingAction========================");
    console.log(this.coolDownMaps.jumpKeyPress);
    console.log("jumpingAction========================");
    let currentPosition = this.node.getPosition(this.playerPosition);
    if (this.coolDownMaps.jumpKeyPress > 0) {
      changePosition(currentPosition, this.playerJumpSpeed, "y");
      this.playerStatus.jumpDirection = PLAYER_JUMP_DIRECTION.TO_UP;
    } else {
      if (this.playerStatus.jumpDirection === PLAYER_JUMP_DIRECTION.TO_UP) {
        this.playerStatus.jumpDirection = PLAYER_JUMP_DIRECTION.TO_UP_OVER;
      }
    }
    this.node.setPosition(currentPosition);
  }

  jumpUpOverAction(deltaTime: number){
    
  }

  jumpingMoveAction(deltaTime: number) {
    // console.log("jumpingMoveAction===============");
    // console.log("jumpingMoveAction");
    // console.log("jumpingMoveAction===============");
  }
}
