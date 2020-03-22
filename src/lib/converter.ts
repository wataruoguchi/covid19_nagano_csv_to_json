const fs = require("fs");
const encoding = require("encoding-japanese");
const csv = require("csv-parser");
import { item, kensa, soudan, dirs } from "./types";
import { convertOpts } from "./convertOpts";
import { CONST_KENSA, CONST_SOUDAN } from "./const";

function getFileNameFromPath(str: string): string {
  return str.split("/").slice(-1)[0];
}

function converter(item: item, dirs: dirs) {
  // 1. Encode the original CSV file from SHIFT-JIS to UNICODE, avoiding mojibake.
  // 2. Remove useless lines from top and bottom
  // 3. Convert CSV to JSON
  const encoded = encoding.convert(item.data, "UNICODE", "SJIS");
  const filePath = `${dirs.tmp}/${getFileNameFromPath(item.path)}`;
  fs.writeFileSync(filePath, encoded);

  const opts = convertOpts()[
    /kensa/.test(item.path) ? CONST_KENSA : CONST_SOUDAN
  ];
  const results: (soudan & kensa)[] = [];
  fs.createReadStream(filePath)
    .pipe(csv(opts.csv))
    .on("data", (data: soudan & kensa) => results.push(data))
    .on("end", () => {
      const jsonFilePath = `${dirs.dist}/${getFileNameFromPath(item.path)
        .replace(/\d+/, "")
        .replace(/\.csv$/, ".json")}`;
      fs.writeFileSync(
        jsonFilePath,
        JSON.stringify(opts.postProcess(results), null, 2)
      );
    });
}

export { converter };
