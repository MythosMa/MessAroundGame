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
import {
  changePosition,
  getObjectInScreenPosition,
  getObjectInScreenPositionPercent,
  checkOutScreen,
  getScreenSize,
  getCanvasSize,
  getDesignResolutionSize,
} from "../utils/nodeScriptTools";
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

  @property(Node)
  mapLeftTrap = null;

  @property(Node)
  mapRightTrap = null;

  @property(Number)
  cameraMoveLeftStart = 0;

  @property(Number)
  cameraMoveRightStart = 0;

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
    this.checkMapMoveToTrap();
  }

  getMainCamera() {
    return this.camera;
  }

  changeCameraPosition(moveDistance) {
    const playerPositionInScreen = getObjectInScreenPositionPercent(
      this.player,
      this.camera
    );
    const cameraLeftTrapPositionInScreen = getObjectInScreenPositionPercent(
      this.mapLeftTrap,
      this.camera
    );
    const cameraRightTrapPositionInScreen = getObjectInScreenPositionPercent(
      this.mapRightTrap,
      this.camera
    );
    if (
      (moveDistance > 0 &&
        playerPositionInScreen > this.cameraMoveRightStart &&
        cameraRightTrapPositionInScreen > 1) ||
      (moveDistance < 0 &&
        playerPositionInScreen < this.cameraMoveLeftStart &&
        cameraLeftTrapPositionInScreen < 0)
    ) {
      let currentPosition = this.camera.position;
      changePosition(currentPosition, moveDistance, "x");
      this.camera.setPosition(currentPosition);
    }
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

  checkNodeOutScreen(node: Node) {
    return checkOutScreen(node, this.camera);
  }

  objectInScreenPosition(object: Node) {
    return getObjectInScreenPosition(object, this.camera);
  }

  checkMapMoveToTrap() {}
}
