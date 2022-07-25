import { JsonAsset, resources } from "cc";

const SCRIPTS_PATH = "/Scripts";

export const readFiles = (filePath, fileName, callback) => {
  resources.load(
    SCRIPTS_PATH + filePath + fileName,
    JsonAsset,
    (error, result) => {
      if (callback) {
        callback(error, result.json);
      }
    }
  );
};
