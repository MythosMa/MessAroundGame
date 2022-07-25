export enum ScriptActionCommand {
  // 占位，标记命令起始枚举值，无实际意义
  START_DEFAULT = 100000,

  // 通用脚本
  SET_TASK_INFO,

  // 脚本命令(NPC)
  STAND,
  WALKING_RANDOM,

  // 跳转条件命令
  CHANGE_SCRIPT_NO_CONDITION,
  CHANGE_SCRIPT_DELAY_TIME,
  CHANGE_SCRIPT_TASK_INFO,
}
