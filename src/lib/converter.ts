const fs = require("fs");
const encoding = require("encoding-japanese");
const csv = require("csv-parser");
import { item, kensa, soudan, dirs, convertOptions } from "./types";
import { getFileNameFromPath, buildJsonPath } from "./utils";

function converter(item: item, opts: convertOptions, dirs: dirs): Promise<any> {
  // 1. Encode the original CSV file from SHIFT-JIS to UNICODE, avoiding mojibake.
  // 2. Remove useless lines from top and bottom
  // 3. Convert CSV to JSON
  return new Promise((resolve, reject) => {
    const encoded = encoding.convert(item.data, "UNICODE", "SJIS");
    const filePath = `${dirs.tmp}/${getFileNameFromPath(item.path)}`;
    fs.writeFileSync(filePath, encoded);

    try {
      const results: (soudan & kensa)[] = [];
      fs.createReadStream(filePath)
        .pipe(csv(opts.csv))
        .on("data", (data: soudan & kensa) => results.push(data))
        .on("end", () => {
          const newResults = opts.postProcess(results);
          fs.writeFileSync(
            buildJsonPath(item.path, dirs.dist || ""),
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
