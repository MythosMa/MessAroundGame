import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Player")
export class Player extends Component {
  onLoad() {
    console.log("onLoad==========");
    console.log("onLoad");
    console.log("onLoad==========");
  }

  start() {}

  update(deltaTime: number) {}
}
