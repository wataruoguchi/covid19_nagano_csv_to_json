const fs = require("fs");
const encoding = require("encoding-japanese");
const csv = require("csv-parser");
import { item, dirs, convertOptions } from "./types/types";
import { getFileNameFromPath, buildJsonPath } from "./utils";
import { configs } from "./configs";

function saveEncodedCSV(item: item, encoded: string, dirs: dirs) {
  // Just getting back up. The file name is same as they named.
  const rawFilePath = `${dirs.tmp}/${getFileNameFromPath(item.path)}`;
  fs.writeFileSync(rawFilePath, encoded);

  // In our system, we only use this.
  let cleanName: string = "";
  const regexRes = item.path.match(/(\d+).csv$/);
  if (regexRes && regexRes.length === 2 && regexRes[1]) {
    const numStr = regexRes[1];
    cleanName = `${item.type}${numStr}`;
  } else {
    cleanName = item.type;
  }
  const filePath = `${dirs.tmp}/${cleanName}.csv`;
  fs.writeFileSync(filePath, encoded);
  return filePath;
}

function converter(item: item, opts: convertOptions, dirs: dirs): Promise<any> {
  // 1. Encode the original CSV file from SHIFT-JIS to UNICODE, avoiding mojibake.
  // 2. Remove useless lines from top and bottom
  // 3. Convert CSV to JSON
  return new Promise((resolve, reject) => {
    const encoded = encoding.convert(item.data, ...configs.encoding);
    const filePath = saveEncodedCSV(item, encoded, dirs);
    try {
      const results: any[] = [];
      fs.createReadStream(filePath)
        .pipe(csv(opts.csv))
        .on("data", (data: any) => results.push(data))
        .on("end", () => {
          const newResults = opts.postProcess(results);
          fs.writeFileSync(
            buildJsonPath(item.type, dirs.dist || ""),
            JSON.stringify(newResults, null, 2)
          );
          resolve(newResults);
        });
    } catch (err) {
      reject(err);
    }
  });
}

export { converter, buildJsonPath };
