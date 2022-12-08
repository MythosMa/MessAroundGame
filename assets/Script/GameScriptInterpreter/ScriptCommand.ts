export enum ScriptActionCommand {
  // 占位，标记命令起始枚举值，无实际意义
  START_DEFAULT = 100000,

  // 通用脚本
  SET_CHARACTER_TASK_INFO, // 角色自身的任务值
  SET_SCENE_TASK_INFO, // 角色所处的场景的任务值
  SET_EVENT_TASK_INFO, // 角色所处的事件的任务值
  SET_PUBLIC_TASK_INFO, // 全局任务值

  // 脚本命令(NPC)
  STAND,
  WALKING,
  WALKING_RANDOM,

  // 跳转条件命令
  CHANGE_SCRIPT_NO_CONDITION,
  CHANGE_SCRIPT_DELAY_TIME,
  CHANGE_SCRIPT_BY_TASK_INFO,
}
