import { _decorator, Component, Vec3, Tween } from "cc";
import {
  PLAYER_STATUS,
  PLAYER_ACTIONS,
  PLAYER_DIRECTION,
} from "../Types/PlayerStatus";

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

  currentCoolDown = { shot: 0 };
  currentPlayerStatus = PLAYER_STATUS.STAND_BY;
  currentPlayerAction = PLAYER_ACTIONS.NO_ACTION;
  currentPlayerDirection = PLAYER_DIRECTION.TO_RIGHT;

  playerPosition = null;

  playerMovingPool = [];

  currentDeltaTime = 0;

  currentScene = null;

  onLoad() {}

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
    switch (this.currentPlayerStatus) {
      case PLAYER_STATUS.MOVE_LEFT:
      case PLAYER_STATUS.MOVE_RIGHT:
        this.playerMoving(this.currentPlayerStatus);
        break;
      default:
        break;
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

  changePlayerMovingStatus(status: PLAYER_STATUS, isAdd = true) {
    let index = this.playerMovingPool.indexOf(status);
    if (
      status === PLAYER_STATUS.MOVE_LEFT ||
      status === PLAYER_STATUS.MOVE_RIGHT
    ) {
      if (isAdd) {
        if (index === -1) {
          this.playerMovingPool.push(status);
        }
      } else {
        if (index !== -1) {
          this.playerMovingPool.splice(index, 1);
        }
      }
    }

    if (this.playerMovingPool.length <= 0) {
      this.changePlayerStatus(PLAYER_STATUS.STAND_BY);
    } else {
      let lastStatus = this.playerMovingPool[0];
      if (lastStatus === PLAYER_STATUS.MOVE_LEFT) {
        this.currentPlayerDirection = PLAYER_DIRECTION.TO_LEFT;
      } else {
        this.currentPlayerDirection = PLAYER_DIRECTION.TO_RIGHT;
      }
      this.changePlayerStatus(lastStatus);
    }
  }

  changePlayerStatus(status: PLAYER_STATUS) {
    if (status === this.currentPlayerStatus) {
      return;
    }
    switch (status) {
      default:
        break;
    }
    this.currentPlayerStatus = status;
  }

  setPlayerAction(action) {
    if (
      action === PLAYER_ACTIONS.NO_ACTION ||
      this.currentPlayerAction === PLAYER_ACTIONS.NO_ACTION
    )
      switch (action) {
        case PLAYER_ACTIONS.JUMP:
          this.playerJump(this.currentPlayerStatus);
          break;
        default:
          break;
      }
    this.currentPlayerAction = action;
  }

  playerJump(status) {
    let jumpAllTime = this.playerJumpTime + this.playerJumpHeighestDelay;
    let jumpMove = 0;
    let rotate = 0;

    if (
      status === PLAYER_STATUS.MOVE_LEFT ||
      status === PLAYER_STATUS.MOVE_RIGHT
    ) {
      let direction = 1;
      rotate = -180;

      if (status === PLAYER_STATUS.MOVE_LEFT) {
        direction = -1;
        rotate *= direction;
      }
      let p = jumpAllTime / this.currentDeltaTime;
      jumpMove = p * this.playerMovingSpeed * direction;
    }

    let singleRatio = 0;
    /**
     * 动作跳跃，想要跳跃的感觉更自然一点，使用了Y轴的缓入缓出，但是X轴要保证匀速
     * 所以无法直接写成一个动作，只能动态计算X轴的移动
     */
    const jumpMoveTw = new Tween(this.node.getPosition())
      .by(
        this.playerJumpTime / 2,
        {
          y: this.playerJumpHeight,
        },
        {
          easing: "sineOut",
          onStart: () => {
            singleRatio = 0;
          },
          onUpdate: (target, ratio) => {
            singleRatio = ratio - singleRatio;
            changePosition(target, jumpMove * 0.5 * singleRatio);
            this.node.setPosition(target as Vec3);
            singleRatio = ratio;
          },
        }
      )
      .delay(this.playerJumpHeighestDelay)
      .by(
        this.playerJumpTime / 2,
        {
          y: -this.playerJumpHeight,
        },
        {
          easing: "sineIn",
          onStart: () => {
            singleRatio = 0;
          },
          onUpdate: (target, ratio) => {
            singleRatio = ratio - singleRatio;
            changePosition(target, jumpMove * 0.5 * singleRatio);
            this.node.setPosition(target as Vec3);
            singleRatio = ratio;
          },
        }
      )
      .call(() => {
        this.changePlayerMovingStatus(-1);
        this.setPlayerAction(PLAYER_ACTIONS.NO_ACTION);
      })
      .start();

    const jumpRotate = new Tween(this.node)
      .by(jumpAllTime, {
        eulerAngles: new Vec3(0, 0, rotate),
      })
      .start();
  }

  playerShot() {
    if (this.currentCoolDown.shot <= 0) {
      this.currentScene.playerShot(
        this.node.getPosition(),
        this.currentPlayerDirection
      );
      this.currentCoolDown.shot = this.playerShotCD;
    }
  }
}
