import { Camera, Vec3, Node, view, size, math, screen } from "cc";

export const changePosition = (position, num, target = "x") => {
  let newPosition = new Vec3(0, 0, 0);
  newPosition[target] += num;
  Vec3.add(position, position, newPosition);
};

export const dealCoolDown = (time, deltaTime) => {
  if (time > 0) {
    time -= deltaTime;
  }
  return time > 0 ? time : 0;
};

export const getDesignResolutionSize = () => {
  return view.getDesignResolutionSize();
};

export const getScreenSize = () => {
  return view.getVisibleSize();
};

export const getCanvasSize = () => {
  return screen.windowSize;
};

export const getCameraSize = (camera: Camera) => {
  const visibleSize = view.getVisibleSize();
  const scale = visibleSize.height / camera.orthoHeight / 2;
  return size(visibleSize.width / scale, visibleSize.height / scale);
};

export const checkOutScreen = (object: Node, camera: Camera) => {
  const canvasSize = getCanvasSize();
  const nodePosition = getObjectInScreenPosition(object, camera);
  return (
    nodePosition.x < 0 ||
    nodePosition.x > canvasSize.width ||
    nodePosition.y < 0 ||
    nodePosition.y > canvasSize.height
  );
};

export const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getObjectInScreenPosition = (object: Node, camera: Camera) => {
  return camera.getComponent(Camera).worldToScreen(object.worldPosition);
};

export const getObjectInScreenPositionPercent = (
  object: Node,
  camera: Camera
) => {
  const position = getObjectInScreenPosition(object, camera);
  const windowSize = getCanvasSize();

  return position.x / windowSize.width;
};
