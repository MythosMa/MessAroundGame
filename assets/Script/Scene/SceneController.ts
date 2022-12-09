import { _decorator, Component, Prefab, Node, NodePool, instantiate, Vec2, UITransform, math, Camera, Vec3 } from "cc";
import { changePosition } from "../utils/nodeScriptTools";
const { ccclass, property } = _decorator;

@ccclass("SceneController")
export class SceneController extends Component {
  @property(Prefab)
  playerBulletPrefab = null;

  @property(Node)
  player = null;

  @property(Node)
  camera = null;

  @property(Node)
  map = null;

  @property(Node)
  canvas = null


  bulletPool: NodePool = null;
  mapSize: math.Size = null;
  canvasSize: math.Size = null;

  onLoad() {
    this.bulletPool = new NodePool();
    let initCount = 100;
    for (let i = 0; i < initCount; i++) {
      let bullet = instantiate(this.playerBulletPrefab);
      this.bulletPool.put(bullet);
    }
    this.mapSize = this.map.getComponent(UITransform).contentSize;
    this.canvasSize = this.canvas.getComponent(UITransform).contentSize;
  }

  start() {
    if (this.player) {
      this.player.getComponent("Player").setScene(this);
    }
  }

  update(deltaTime: number) {
    // this.changeCameraPosition();
    // console.log("update====================");
    // console.log(this.camera.position);
    // console.log(this.camera);
    // console.log("update====================");
    this.cameraMove()
  }

  changeCameraPosition() {
    let currentPosition = this.camera.position;
    changePosition(currentPosition, 10, "x");
    this.camera.setPosition(currentPosition);
  }

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

  cameraMove(){
    const playerInScreenPosition = this.camera.getComponent(Camera).worldToScreen(new Vec3(this.player.getPosition().x, this.player.getPosition().y, 0))
    const cameraPosition = this.camera.position
  }
}
