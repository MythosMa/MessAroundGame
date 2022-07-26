import { CharacterData } from "../Commons/CharacterTypes";

export interface NpcSingleActionScript {
  script_id: number;
  script: Array<object>;
}

export interface NpcActionData {
  start_script_id: number;
  all_action_script: Array<NpcSingleActionScript>;
}

export interface NpcScript {
  init_data: CharacterData;
  action_data: NpcActionData;
}
export interface NpcActionNodeTree {
  parallelChildNodes: Array<NpcActionNodeTree>; // 并行子节点，即子节点串行节点中如果有满足执行条件的情况下，即可执行的子节点
  serialChildNodes: Array<NpcActionNodeTree>; // 串行子节点，递归检查是否有可执行的子节点
  nodeFunction: Function | undefined; // 当前节点的执行函数，返回 true 表示该节点满足执行条件并已成功执行
}
