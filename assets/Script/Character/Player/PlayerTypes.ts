export interface PlayerActionNodeTree {
  parallelChildNodes: Array<PlayerActionNodeTree>; // 并行子节点，即子节点串行节点中如果有满足执行条件的情况下，即可执行的子节点
  serialChildNodes: Array<PlayerActionNodeTree>; // 串行子节点，递归检查是否有可执行的子节点
  nodeFunction: Function | undefined; // 当前节点的执行函数，返回 true 表示该节点满足执行条件并已成功执行
}

export interface JumpActionData {
  startPositionY: number;
  jumpSpeed: number;
  moveSpeed: number;
}

export enum PLAYER_STATUS {
  STAND_BY,
  MOVE_LEFT,
  MOVE_RIGHT,
}

export enum PLAYER_DIRECTION {
  TO_LEFT,
  TO_RIGHT,
}

export enum PLAYER_JUMP_DIRECTION {
  TO_UP,
  TO_UP_OVER,
  TO_DOWN_START,
  TO_DOWN,
}

export enum PLAYER_ACTIONS {
  MOVING,
  JUMPING,
  MOVING_JUMP,
  JUMPING_MOVE,
}
