import { fileType } from "./types";

import { CONST_KENSA, CONST_SOUDAN, CONST_HASSEI, CONST_NULL } from "./const";

function getFileTypes(): fileType[] {
  return [CONST_KENSA, CONST_SOUDAN, CONST_HASSEI];
}

function getFileTypeByFilePath(filePath: string): fileType {
  const fileTypes: string[] = [
    CONST_KENSA,
    CONST_SOUDAN,
    CONST_HASSEI,
    CONST_NULL
  ];
  const fileTypeMap = new Map();
  for (const fileTypeIdx in fileTypes) {
    // TODO TS beginner - Can it be better?
    fileTypeMap.set(fileTypes[fileTypeIdx], fileTypes[fileTypeIdx]);
  }

  const re = new RegExp(`(${fileTypes.join("|")})`);
  const regRes = re.exec(filePath);
  const fileType = regRes && regRes.length > 0 ? regRes[0] : CONST_NULL;

  return fileTypeMap.get(fileType) ? fileTypeMap.get(fileType) : CONST_NULL;
}

export { getFileTypeByFilePath, getFileTypes };
