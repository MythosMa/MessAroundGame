import { _decorator, Component, Prefab, Node, NodePool, instantiate } from "cc";
const { ccclass, property } = _decorator;

@ccclass("SceneController")
export class SceneController extends Component {
  @property(Prefab)
  playerBulletPrefab = null;

  @property(Node)
  player = null;

  bulletPool: NodePool = null;

  onLoad() {
    this.bulletPool = new NodePool();
    let initCount = 100;
    for (let i = 0; i < initCount; i++) {
      let bullet = instantiate(this.playerBulletPrefab);
      this.bulletPool.put(bullet);
    }
  }

  start() {
    if (this.player) {
      this.player.getComponent("Player").setScene(this);
    }
  }

  update(deltaTime: number) {}

  playerShot(playerPosition, playerDirection) {
    let bullet = null;
    if (this.bulletPool.size() > 0) {
      bullet = this.bulletPool.get();
    }
    bullet.setPosition(playerPosition);
    bullet.parent = this.node;
    bullet.getComponent("Bullet").shot(playerDirection, this);
  }

  destoryBullet(bullet) {
    this.bulletPool.put(bullet);
  }
}
