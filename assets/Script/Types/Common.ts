export enum KEY_CODE {
  KEY_SPACE = 32,
  KEY_LEFT = 37,
  KEY_RIGHT = 39,
  KEY_X = 88,
  KEY_Z = 90,
}

export interface PlayerActionTreeNode {
  currentFunc: Function | null;
  toNextConditionFunc: Function | null;
  trueNext: PlayerActionTreeNode | null;
  falseNext: PlayerActionTreeNode | null;
}
