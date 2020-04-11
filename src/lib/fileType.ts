import { fileType } from "./types/types";
import { getFileNameFromPath } from "./utils";

import { CONST_KENSA, CONST_SOUDAN, CONST_HASSEI } from "./const";

function getFileTypes(): fileType[] {
  return [CONST_KENSA, CONST_SOUDAN, CONST_HASSEI];
}

function determineFileTypeByFileName(filePath: string): fileType {
  const fileName = getFileNameFromPath(filePath);
  // I know this is ugly, but they don't name properly...
  if (/^kensa/.test(fileName)) return CONST_KENSA;
  if (/^soudan/.test(fileName)) return CONST_SOUDAN;
  return CONST_HASSEI;
}

export { determineFileTypeByFileName, getFileTypes };
