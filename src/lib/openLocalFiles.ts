const fs = require("fs");

async function openLocalFiles(filePaths: string[]): Promise<string[]> {
  // Open raw files (Not encoded to UNICODE, it should be encoded to "binary")
  const fileContents: string[] = [];
  await Promise.all(
    filePaths.map((filePath) => {
      return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", function (err: any, data: string) {
          if (data) {
            // Keeping the same format as downloadFiles.
            fileContents.push(data);
            resolve();
          } else {
            reject(err);
          }
        });
      });
    })
  );
  return fileContents;
}

export { openLocalFiles };
