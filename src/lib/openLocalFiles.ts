const fs = require("fs");
import { item } from "./types";

async function openLocalFiles(filePaths: string[]): Promise<item[]> {
  // Open raw files (Not encoded to UNICODE, it should be encoded to "binary")
  const items: item[] = [];
  await Promise.all(
    filePaths.map((filePath) => {
      return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", function (err: any, data: string) {
          if (data) {
            // Keeping the same format as downloadFiles.
            items.push({ path: filePath, data });
            resolve();
          } else {
            reject(err);
          }
        });
      });
    })
  );
  return items;
}

export { openLocalFiles };
