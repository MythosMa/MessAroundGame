import { Component } from "cc";
import { ScriptActionCommand } from "../../GameScriptInterpreter/ScriptCommand";
import { getRandomNumber } from "../../utils/nodeScriptTools";
import CharacterBase from "../Commons/CharacterBase";
import { NpcNodeScript } from "./NpcNodeScript";
import { NpcScript, NpcSingleActionScript } from "./NpcScriptTypes";

class NpcBase extends CharacterBase {
  script: NpcScript;
  nodeScript: NpcNodeScript;

  startActionScript: number;
  allActionScript: Array<NpcSingleActionScript>;

  currentActionScript: any;

  // 当前脚本运行的函数以及数据
  currentUpdateScriptFunction: any;
  currentUpdateScriptDate: any;

  constructor(script: NpcScript, nodeScript: NpcNodeScript) {
    super(script.init_data);
    this.script = script;
    this.nodeScript = nodeScript;

    this.startActionScript = this.script.action_data.start_script_id;
    this.allActionScript = this.script.action_data.all_action_script;

    this.initScript();
  }

  initScript() {
    this.changeScript(this.findScript(this.startActionScript));
  }

  scriptUpdate(deltaTime) {
    if (this.currentUpdateScriptFunction) {
      this.currentUpdateScriptFunction(deltaTime);
    }
  }

  changeScript(script) {
    this.currentUpdateScriptFunction = null;
    this.currentUpdateScriptDate = null;
    this.currentActionScript = script;
    for (let i = 0; i < this.currentActionScript.script.length; i++) {
      const script = this.currentActionScript.script[i];
      const scriptData = script.command_data;
      switch (script.command) {
        case ScriptActionCommand.STAND:
          this.nodeScript.setNpcMoveSpeed(0);
          break;
        case ScriptActionCommand.WALKING:
          this.nodeScript.setNpcMoveSpeed(scriptData.move_speed);
          break;
        case ScriptActionCommand.WALKING_RANDOM:
          this.nodeScript.setNpcRandomMove();
          break;
        case ScriptActionCommand.CHANGE_SCRIPT_DELAY_TIME:
          this.changeScriptDelayTime(scriptData);
          break;
        case ScriptActionCommand.CHANGE_SCRIPT_NO_CONDITION:
          break;
        case ScriptActionCommand.CHANGE_SCRIPT_BY_TASK_INFO:
          break;
      }
    }
  }

  findScript(scriptId) {
    for (let i = 0; i < this.allActionScript.length; i++) {
      if (this.allActionScript[i].script_id === scriptId) {
        return this.allActionScript[i];
      }
    }
  }

  changeScriptDelayTime(scriptData) {
    let delayTime =
      scriptData.delay_time === -1
        ? getRandomNumber(1, 2)
        : scriptData.delay_time;
    let targetScriptId =
      scriptData.target_script_id[
        getRandomNumber(0, scriptData.target_script_id.length - 1)
      ];

    this.currentUpdateScriptDate = {
      delayTime: delayTime,
      currentDelayTime: 0,
      targetScriptId: targetScriptId,
    };

    this.currentUpdateScriptFunction =
      this.changeScriptDelayTimeUpdate.bind(this);
  }

  changeScriptDelayTimeUpdate(deltaTime) {
    let currentDelayTime =
      this.currentUpdateScriptDate.currentDelayTime + deltaTime;
    if (currentDelayTime >= this.currentUpdateScriptDate.delayTime) {
      this.changeScript(
        this.findScript(this.currentUpdateScriptDate.targetScriptId)
      );
    } else {
      this.currentUpdateScriptDate.currentDelayTime = currentDelayTime;
    }
  }
}

export default NpcBase;
