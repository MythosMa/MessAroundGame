import { _decorator, Component, Node, Vec3 } from "cc";
import { readFiles } from "../../GameScriptInterpreter/ReadScriptFile";
import { changePosition, getRandomNumber } from "../../utils/nodeScriptTools";
import {
  CHARACTER_ACTION,
  CHARACTER_DIRECTION,
} from "../Commons/CharacterEnum";
import NpcBase from "./NpcBase";
import { NpcActionNodeTree } from "./NpcScriptTypes";

const { ccclass, property } = _decorator;

@ccclass("NpcBase")
export class NpcNodeScript extends Component {
  @property
  npcName: string = "";

  @property
  npcMoveSpeedMax: number = 0;

  @property
  npcMoveSpeedMin: number = 0;

  isScriptLoaded = false;
  npcScript = null;

  // npc状态属性
  npcMoveSpeed: number = 600;
  npcPosition = null;
  npcDirection: CHARACTER_DIRECTION = CHARACTER_DIRECTION.TO_RIGHT;

  npcActionNodeTree: NpcActionNodeTree = {
    parallelChildNodes: [],
    serialChildNodes: [],
    nodeFunction: undefined,
  };

  onLoad() {
    readFiles("/character/npc/", this.npcName, (error, result) => {
      if (!error) {
        this.npcScript = new NpcBase(result, this);
        this.isScriptLoaded = true;
        this.init();
      } else {
        this.node.removeFromParent();
      }
    });
  }

  init() {
    const movingNode: NpcActionNodeTree = {
      parallelChildNodes: [],
      serialChildNodes: [],
      nodeFunction: this.runAction.bind(this, CHARACTER_ACTION.MOVING),
    };

    const standNode: NpcActionNodeTree = {
      parallelChildNodes: [],
      serialChildNodes: [],
      nodeFunction: this.runAction.bind(this, CHARACTER_ACTION.STAND),
    };

    this.npcActionNodeTree.serialChildNodes = [movingNode, standNode];
  }

  start() {}

  update(deltaTime: number) {
    if (this.isScriptLoaded) {
      this.npcScript.scriptUpdate(deltaTime);

      // 递归遍历行为树
      /**
       *
       * @param node 当前所要验证的节点
       * @returns 节点中的函数是否执行，如执行其他串行节点不执行，同时执行同层级的并行节点
       */
      const runActionNodeTree = (node: NpcActionNodeTree): boolean => {
        let isPerformed = false;
        if (node.serialChildNodes.length) {
          for (let i = 0; i < node.serialChildNodes.length; i++) {
            let childNode = node.serialChildNodes[i];
            isPerformed = runActionNodeTree(childNode);
            if (isPerformed) {
              break;
            }
          }
        } else if (node.nodeFunction) {
          isPerformed = node.nodeFunction(deltaTime);
        }
        if (isPerformed && node.parallelChildNodes.length) {
          for (let i = 0; i < node.parallelChildNodes.length; i++) {
            runActionNodeTree(node.parallelChildNodes[i]);
          }
        }

        return isPerformed;
      };

      runActionNodeTree(this.npcActionNodeTree);
    }
  }

  // 影响坐标的行为处理函数
  runAction(actions: CHARACTER_ACTION, deltaTime: number) {
    let isPerformed = false;
    let currentPosition = this.node.getPosition(this.npcPosition);
    switch (actions) {
      case CHARACTER_ACTION.STAND:
        isPerformed = this.standNodeFunction();
        break;
      case CHARACTER_ACTION.MOVING:
        isPerformed = this.movingNodeFunction(deltaTime, currentPosition);
        break;
    }
    this.node.setPosition(currentPosition);

    return isPerformed;
  }

  standNodeFunction() {
    if (this.npcMoveSpeed === 0) {
      return true;
    }
    return false;
  }

  movingNodeFunction(deltaTime, currentPosition) {
    if (this.npcMoveSpeed !== 0) {
      let direction = CHARACTER_DIRECTION.TO_LEFT;
      if (this.npcMoveSpeed > 0) {
        direction = CHARACTER_DIRECTION.TO_RIGHT;
      }
      if (direction !== this.npcDirection) {
        const originScale = this.node.getScale();
        this.node.setScale(
          new Vec3(originScale.x * -1, originScale.y, originScale.z)
        );
        this.npcDirection = direction;
      }
      changePosition(currentPosition, this.npcMoveSpeed * deltaTime, "x");
      return true;
    }
    return false;
  }

  setNpcRandomMove() {
    let direction = getRandomNumber(0, 1);
    this.npcMoveSpeed =
      getRandomNumber(this.npcMoveSpeedMin, this.npcMoveSpeedMax) *
      (direction >= 1 ? 1 : -1);
  }

  setNpcMoveSpeed(speed: number) {
    this.npcMoveSpeed = speed;
  }
}
