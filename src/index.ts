const fs = require("fs");
const path = require("path");
const commander = require("commander");
import { item } from "./lib/types";
import { downloadFiles } from "./lib/downloadFiles";
import { converter } from "./lib/converter";
import { convertOpts } from "./lib/convertOpts";
import { mapper } from "./lib/mapper";
import { getFileTypes, getFileTypeByFilePath } from "./lib/fileType";
import { dateDetermination } from "./lib/fileNameDetermination";
import { formatToMMDD, mkDirs } from "./lib/utils";
import { configs } from "./lib/configs";

const RAW_CSV_DIR = path.join(__dirname, ".csv");
const ENCODED_CSV_DIR = path.join(__dirname, ".encoded");
const JSON_DIR = path.join(__dirname, ".json");

commander
  .description(
    "The script that fetches Nagano COVID19 Open Data CSV then convert it into JSON files."
  )
  .option("-d, --date <MMDD>", "To fetch the files with the date.")
  .parse(process.argv);

if (commander.help) {
  commander.outputHelp();
}

function buildRemoteFilePaths(dates: Date[]): string[] {
  return getFileTypes()
    .map((fileType) => {
      return dates.map(
        (date: Date): string =>
          `${configs.remoteDir}/${fileType}${formatToMMDD(date)}.csv`
      );
    })
    .flat();
}
const dates = dateDetermination(commander.date);

(function () {
  console.log("STARTED");

  // 1. Create directories to store files.
  mkDirs(fs, [RAW_CSV_DIR, ENCODED_CSV_DIR, JSON_DIR]);

  // 2. Download CSV files
  downloadFiles(buildRemoteFilePaths(dates), RAW_CSV_DIR)
    .then(async (items: item[]) => {
      // 3. Convert files into re-encoded CSV and JSON
      const resAll = await Promise.all(
        items.map(async (item) => {
          const fileType = getFileTypeByFilePath(item.path);
          const opts = convertOpts(fileType);
          const dataJson = await converter(item, opts, {
            tmp: ENCODED_CSV_DIR,
            dist: JSON_DIR
          });
          return { json: dataJson, path: item.path };
        })
      );

      // 4. Create data.json
      await mapper(resAll, { dist: JSON_DIR });
      console.log(`DONE: ${items.map((item) => item.path).join(", ")}!`);
    })
    .catch((err) => console.error(err));
})();
