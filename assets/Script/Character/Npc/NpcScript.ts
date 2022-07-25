import { _decorator, Component, Node } from "cc";
import { readFiles } from "../../GameScriptInterpreter/ReadScriptFile";
import NpcBase from "./NpcBase";

const { ccclass, property } = _decorator;

@ccclass("NpcBase")
export class NpcScript extends Component {
  @property
  npcName: string = "";

  isScriptLoaded = false;
  npcScript = null;

  onLoad() {
    readFiles("/character/npc/", this.npcName, (error, result) => {
      if (!error) {
        this.npcScript = new NpcBase(result);
        this.isScriptLoaded = true;
      } else {
        this.node.removeFromParent();
      }
    });
  }

  start() {}

  update(deltaTime: number) {
    if (this.isScriptLoaded) {
      
    }
  }
}
