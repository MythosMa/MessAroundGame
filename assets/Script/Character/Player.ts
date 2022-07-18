import { _decorator, Component, Vec3, Tween, UITransform } from "cc";
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
  playerJumpSpeed = 0;

  @property
  playerJumpSinRatio = 0;

  @property
  playerJumpHeighestDelay = 0;

  @property
  playerShotCD = 0; // 公开设置数据：角色射击CD值

  @property
  playerJumpKeyPressTime = 0; // 跳跃按钮响应最长时长（根据按键时长跳跃高度的上限）

  @property
  playerJumpGravity = 0; // 角色受到的重力加速度，用来控制跳跃时的速度变化

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
    isMovingJump: false,
    isJumping: false,
    isJumpingMove: false,
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
    jumpSpeed: 0,
    moveSpeed: 0,
  };

  // 角色当前数值

  // 当前移动速度
  playerCurrentMovingSpeed = 0;

  // 当前技能冷却
  coolDownMaps = { shot: 0, jumpKeyPress: 0 };

  onLoad() {
    const movingJumpActionNode: PlayerActionTreeNode = {
      toNextConditionFunc: undefined,
      trueNext: undefined,
      falseNext: undefined,
      currentNodeFunc: undefined,
      noNextNodeFunc: this.runAction.bind(this, PLAYER_ACTIONS.MOVING_JUMP),
    };
    const movingActionNode: PlayerActionTreeNode = {
      toNextConditionFunc: this.checkIsMovingJump.bind(this),
      trueNext: movingJumpActionNode,
      falseNext: undefined,
      currentNodeFunc: undefined,
      noNextNodeFunc: this.runAction.bind(this, PLAYER_ACTIONS.MOVING),
    };
    const jumpingMoveActionNode: PlayerActionTreeNode = {
      toNextConditionFunc: undefined,
      trueNext: undefined,
      falseNext: undefined,
      currentNodeFunc: undefined,
      noNextNodeFunc: this.runAction.bind(this, PLAYER_ACTIONS.JUMPING_MOVE),
    };
    const jumpingActionNode: PlayerActionTreeNode = {
      toNextConditionFunc: this.checkIsJumpingMove.bind(this),
      trueNext: jumpingMoveActionNode,
      falseNext: undefined,
      currentNodeFunc: undefined,
      noNextNodeFunc: this.runAction.bind(this, PLAYER_ACTIONS.JUMPING),
    };
    this.playerActionNode.toNextConditionFunc = this.checkIsJumping.bind(this);
    this.playerActionNode.falseNext = movingActionNode;
    this.playerActionNode.trueNext = jumpingActionNode;
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
        new Vec3(
          this.node.getPosition().x,
          this.node.getPosition().y +
            this.node.getComponent(UITransform).contentSize.height / 2,
          this.node.getPosition().z
        ),
        this.playerStatus.direction
      );
      this.coolDownMaps.shot = this.playerShotCD;
    }
  }

  runAction(actions: PLAYER_ACTIONS, deltaTime: number) {
    let currentPosition = this.node.getPosition(this.playerPosition);
    switch (actions) {
      case PLAYER_ACTIONS.MOVING:
        this.movingAction(deltaTime, currentPosition);
        break;
      case PLAYER_ACTIONS.JUMPING:
        this.jumpingAction(deltaTime, currentPosition);
        break;
      case PLAYER_ACTIONS.JUMPING_MOVE:
        this.jumpingMoveAction(deltaTime, currentPosition);
        break;
      case PLAYER_ACTIONS.MOVING_JUMP:
        this.movingJumpAction(deltaTime, currentPosition);
        break;
    }

    // console.log("runAction=============");
    // console.log(deltaTime);
    // console.log(actions);
    // console.log("runAction=============");

    this.node.setPosition(currentPosition);
  }

  checkIsMovingJump() {
    return this.playerStatus.isMovingJump;
  }

  moveKeyDown(playerMovingDirection) {
    this.playerMovingPool.push(playerMovingDirection);
    this.setMovingStatus();
    if (!this.playerStatus.isMovingJump && this.playerStatus.isJumping) {
      this.playerStatus.isJumpingMove = true;
    }
  }

  moveKeyUp(playerMovingDirection: PLAYER_DIRECTION) {
    let index = this.playerMovingPool.indexOf(playerMovingDirection);
    if (index !== -1) {
      this.playerMovingPool.splice(index, 1);
    }
    if (this.playerMovingPool.length) {
      this.setMovingStatus();
      if (this.playerStatus.isMovingJump) {
        this.setMovingJumpStatus();
      } else if (this.playerStatus.isJumpingMove) {
        this.setJumpingMoveStatus();
      }
    } else {
      this.playerCurrentMovingSpeed = 0;
      this.playerStatus.isMoving = false;
    }
    if (!this.playerStatus.isJumping) {
      this.playerStatus.isJumpingMove = false;
    }
  }

  setMovingStatus() {
    this.changePlayerDirection(this.playerMovingPool[0]);
    this.playerCurrentMovingSpeed =
      this.playerMovingSpeed *
      (this.playerStatus.direction === PLAYER_DIRECTION.TO_RIGHT ? 1 : -1);
    this.playerStatus.isMoving = true;
  }

  setMovingJumpStatus() {
    this.playerJumpDatas.moveSpeed =
      this.playerJumpDatas.moveSpeed *
      (this.playerStatus.direction === PLAYER_DIRECTION.TO_RIGHT ? 1 : -1) *
      0.5;
  }

  setJumpingMoveStatus() {
    this.playerJumpDatas.moveSpeed =
      this.playerJumpDatas.moveSpeed *
      (this.playerStatus.direction === PLAYER_DIRECTION.TO_RIGHT ? 1 : -1) *
      0.5;
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

  movingAction(deltaTime: number, currentPosition) {
    changePosition(
      currentPosition,
      this.playerCurrentMovingSpeed * deltaTime,
      "x"
    );
  }

  movingJumpAction(deltaTime: number, currentPosition) {
    this.jumpingAction(deltaTime, currentPosition);
    changePosition(
      currentPosition,
      this.playerJumpDatas.moveSpeed * deltaTime,
      "x"
    );
    console.log("movingJumpAction================");
    console.log(this.playerJumpDatas.moveSpeed);
    console.log("movingJumpAction================");
  }

  checkIsJumping() {
    return !this.playerStatus.isMovingJump && this.playerStatus.isJumping;
  }

  checkIsJumpingMove() {
    return this.playerStatus.isJumpingMove;
  }

  jumpKeyDown() {
    if (!this.playerStatus.isJumping) {
      this.playerStatus.isJumping = true;
      if (this.playerCurrentMovingSpeed) {
        this.playerStatus.isMovingJump = true;
      }
      this.coolDownMaps.jumpKeyPress = this.playerJumpKeyPressTime;

      this.playerJumpDatas.jumpSpeed = this.playerJumpSpeed;
      this.playerJumpDatas.moveSpeed = this.playerCurrentMovingSpeed;
      this.playerJumpDatas.startPositionY = this.node.getPosition().y;
    }
  }

  jumpKeyUp() {
    if (this.playerStatus.isJumping) {
      this.coolDownMaps.jumpKeyPress = 0;
    }
  }

  jumpingAction(deltaTime: number, currentPosition) {
    if (this.coolDownMaps.jumpKeyPress > 0) {
      this.jumpUpAction(deltaTime, currentPosition);
    } else {
      if (this.playerStatus.jumpDirection === PLAYER_JUMP_DIRECTION.TO_UP) {
        this.playerStatus.jumpDirection = PLAYER_JUMP_DIRECTION.TO_UP_OVER;
      }
      switch (this.playerStatus.jumpDirection) {
        case PLAYER_JUMP_DIRECTION.TO_UP_OVER:
          this.jumpUpOverAction(deltaTime, currentPosition);
          break;
        case PLAYER_JUMP_DIRECTION.TO_DOWN_START:
          this.jumpDownStartAction(deltaTime, currentPosition);
          break;
        case PLAYER_JUMP_DIRECTION.TO_DOWN:
          this.jumpDownAction(deltaTime, currentPosition);
          break;
      }
    }
  }

  jumpUpAction(deltaTime: number, currentPosition) {
    this.playerStatus.jumpDirection = PLAYER_JUMP_DIRECTION.TO_UP;
    changePosition(
      currentPosition,
      this.playerJumpDatas.jumpSpeed * deltaTime,
      "y"
    );
  }

  jumpUpOverAction(deltaTime: number, currentPosition) {
    let v0 = this.playerJumpDatas.jumpSpeed;
    let t = deltaTime;
    let a = this.playerJumpGravity;
    let s = v0 * t + 0.5 * a * t * t;
    this.playerJumpDatas.jumpSpeed = this.playerJumpDatas.jumpSpeed - a * t;

    changePosition(currentPosition, s, "y");

    if (this.playerJumpDatas.jumpSpeed <= 0) {
      this.playerJumpDatas.jumpSpeed = 0;
      this.playerStatus.jumpDirection = PLAYER_JUMP_DIRECTION.TO_DOWN_START;
    }
  }

  jumpDownStartAction(deltaTime: number, currentPosition) {
    let v0 = this.playerJumpDatas.jumpSpeed;
    let t = deltaTime;
    let a = this.playerJumpGravity;
    let s = v0 * t + 0.5 * a * t * t;
    this.playerJumpDatas.jumpSpeed = this.playerJumpDatas.jumpSpeed + a * t;

    changePosition(currentPosition, -s, "y");

    if (this.playerJumpDatas.jumpSpeed >= this.playerJumpSpeed) {
      this.playerJumpDatas.jumpSpeed = this.playerJumpSpeed;
      this.playerStatus.jumpDirection = PLAYER_JUMP_DIRECTION.TO_DOWN;
    }
  }

  jumpDownAction(deltaTime: number, currentPosition) {
    changePosition(
      currentPosition,
      -this.playerJumpDatas.jumpSpeed * deltaTime,
      "y"
    );
    if (currentPosition.y <= this.playerJumpDatas.startPositionY) {
      currentPosition.y = this.playerJumpDatas.startPositionY;
      this.playerStatus.isJumping = false;
      this.playerStatus.isMovingJump = false;
    }
  }

  jumpingMoveAction(deltaTime: number, currentPosition) {
    this.jumpingAction(deltaTime, currentPosition);
    changePosition(
      currentPosition,
      this.playerJumpDatas.moveSpeed * deltaTime,
      "x"
    );
  }
}
