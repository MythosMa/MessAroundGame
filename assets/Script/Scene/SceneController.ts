import {
  _decorator,
  Component,
  Prefab,
  Node,
  NodePool,
  instantiate,
  Vec2,
  UITransform,
  math,
  Camera,
  Vec3,
} from "cc";
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
  canvas = null;

  @property(Number)
  cameraStartX = 0;

  @property(Number)
  camreaEndX = 0;

  bulletPool: NodePool = null;
  mapSize: math.Size = null;
  canvasSize: math.Size = null;
  cameraStartMoveDirection: number = 1;

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
    this.changeCameraPosition();
    // console.log("update====================");
    console.log(this.camera.position);
    // console.log(this.camera);
    // console.log("update====================");
    // this.cameraMove()
  }

  changeCameraPosition() {
    let currentPosition = this.camera.position;
    changePosition(currentPosition, 10 * this.cameraStartMoveDirection, "x");

    if (
      this.cameraStartMoveDirection > 0 &&
      currentPosition.x > this.camreaEndX
    ) {
      // this.cameraStartMoveDirection = -1;
      currentPosition.x = this.camreaEndX;
    } else if (
      this.cameraStartMoveDirection < 0 &&
      currentPosition.x < this.cameraStartX
    ) {
      this.cameraStartMoveDirection = 1;
      currentPosition.x = this.cameraStartX;
    }

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

  cameraMove() {
    const playerInScreenPosition = this.camera
      .getComponent(Camera)
      .worldToScreen(
        new Vec3(this.player.getPosition().x, this.player.getPosition().y, 0)
      );
    const cameraPosition = this.camera.position;
    // canvas的锚点是 0.5 0.5，所以在计算 角色在屏幕中的坐标时，为了精确需要补差值
    const playerInScreenPercent =
      (playerInScreenPosition.x + this.canvasSize.width / 2) /
      this.canvasSize.width;
    console.log("playerInScreenPercent================");
    console.log(playerInScreenPosition);
    console.log(this.canvasSize.width);
    console.log("playerInScreenPercent================");
  }
}
