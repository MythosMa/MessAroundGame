export enum KEY_CODE {
  KEY_SPACE = 32,
  KEY_LEFT = 37,
  KEY_RIGHT = 39,
  KEY_X = 88,
  KEY_Z = 90,
}

export interface PlayerActionTreeNode {
  toNextConditionFunc: Function | null; // 子节点的判定函数，返回值是子节点的索引
  nextNodeIndex: number; // 当前正在执行的子节点的索引
  checkNextNodeConditionFunc: Function | null; // 检测当前执行的子节点是否还满足条件
  currentNodeFunc: Function | null; // 当前节点必须要执行的函数
  noNextNodeFunc: Function | null; // 当不存在子节点时要执行的函数
  nextNodeArray: Array<PlayerActionTreeNode>; // 子节点合集(每个行为可能存在多个节点)
}

export interface JumpActionData {
  startPositionY: number;
  changeToOverPositionY: number;
  targetPositionY: number;
  currentPositionY: number;
  jumpSpeed: number;
}
