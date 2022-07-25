import CharacterBase from "../Commons/CharacterBase";
import { NpcScript, NpcSingleActionScript } from "./NpcScriptTypes";

class NpcBase extends CharacterBase {
  script: NpcScript;

  startActionScript: number;
  allActionScript: Array<NpcSingleActionScript>;

  currentActionScript: any;

  constructor(script: NpcScript) {
    super(script.init_data);
    this.script = script;

    this.startActionScript = this.script.action_data.start_script_id;
    this.allActionScript = this.script.action_data.all_action_script;
  }

  initScript() {
    this.changeScript(this.findScript(this.startActionScript));
  }

  runSCript() {}

  changeScript(script) {
    this.currentActionScript = script;
    for (let i = 0; i < this.currentActionScript.script.length; i++) {}
  }

  findScript(scriptId) {
    for (let i = 0; i < this.allActionScript.length; i++) {
      if (this.allActionScript[i].script_id === scriptId) {
        return this.allActionScript[i];
      }
    }
  }
}

export default NpcBase;
