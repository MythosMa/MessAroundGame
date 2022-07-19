export enum KEY_CODE {
  KEY_SPACE = 32,
  KEY_LEFT = 37,
  KEY_RIGHT = 39,
  KEY_X = 88,
  KEY_Z = 90,
}

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
