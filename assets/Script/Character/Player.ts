import { _decorator, Component, Node, Vec3, Tween } from "cc";
import { PLAYER_STATUS, PLAYER_ACTIONS } from "../Types/PlayerStatus";

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
  playerJumpDelay = 0;

  currentPlayerStatus = PLAYER_STATUS.STAND_BY;
  currentPlayerAction = PLAYER_ACTIONS.NO_ACTION;
  playerPosition = null;

  playerMovingPool = [];

  currentDeltaTime = 0;

  onLoad() {}

  start() {}

  test(testInfo) {
    console.log("player test==============");
    console.log(testInfo);
    console.log("player test==============");
  }

  update(deltaTime: number) {
    this.currentDeltaTime = deltaTime;
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
    let newPosition = new Vec3(0, 0, 0);
    switch (direction) {
      case PLAYER_STATUS.MOVE_LEFT:
        newPosition.x -= this.playerMovingSpeed;
        break;
      case PLAYER_STATUS.MOVE_RIGHT:
        newPosition.x += this.playerMovingSpeed;
        break;
    }

    Vec3.add(currentPosition, currentPosition, newPosition);
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
      this.changePlayerStatus(this.playerMovingPool[0]);
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
    let jumpAllTime = this.playerJumpTime + this.playerJumpDelay;
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

    const jumpTw = new Tween(this.node)
      .parallel(
        new Tween()
          .by(
            this.playerJumpTime / 2,
            {
              position: new Vec3(0, this.playerJumpHeight, 0),
            },
            {
              easing: "sineOut",
            }
          )
          .delay(this.playerJumpDelay)
          .by(
            this.playerJumpTime / 2,
            {
              position: new Vec3(0, -this.playerJumpHeight, 0),
            },
            {
              easing: "sineIn",
            }
          ),
        new Tween().by(jumpAllTime, {
          position: new Vec3(jumpMove, 0, 0),
          eulerAngles: new Vec3(0, 0, rotate), // 欧拉角旋转，rotation 四元是什么鬼？？？
        })
      )
      .call(() => {
        this.changePlayerMovingStatus(-1);
        this.setPlayerAction(PLAYER_ACTIONS.NO_ACTION);
      })
      .start();
  }
}
