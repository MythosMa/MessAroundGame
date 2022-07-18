export enum KEY_CODE {
  KEY_SPACE = 32,
  KEY_LEFT = 37,
  KEY_RIGHT = 39,
  KEY_X = 88,
  KEY_Z = 90,
}

export interface PlayerActionTreeNode {
  toNextConditionFunc: Function | null; // 子节点的判定函数
  trueNext: PlayerActionTreeNode | null; // 判定为真执行的子节点
  falseNext: PlayerActionTreeNode | null; // 判定为假执行的子节点
  currentNodeFunc: Function | null; // 当前节点必须要执行的函数
  noNextNodeFunc: Function | null; // 当不存在子节点时要执行的函数
}

export interface JumpActionData {
  startPositionY: number;
  jumpSpeed: number;
  moveSpeed: number;
}
