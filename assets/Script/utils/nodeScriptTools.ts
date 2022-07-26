import { Vec3, view } from "cc";

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
  let designResolutionSize = null;
  if (!designResolutionSize) {
    designResolutionSize = view.getDesignResolutionSize();
  }
  return designResolutionSize;
};

export const checkOutScreen = (position) => {
  const size = getDesignResolutionSize();
  return (
    position.x < -size.width / 2 ||
    position.x > size.width ||
    position.y < -size.height / 2 ||
    position.y > size.height / 2
  );
};

export const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
