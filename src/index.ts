const fs = require("fs");
const path = require("path");
const commander = require("commander");
import { item, dirs } from "./lib/types";
import { openLocalFiles } from "./lib/openLocalFiles";
import { downloadFiles } from "./lib/downloadFiles";
import { converter } from "./lib/converter";
import { convertOpts } from "./lib/convertOpts";
import { mapper } from "./lib/mapper";
import { getFileTypes, getFileTypeByFilePath } from "./lib/fileType";
import { dateDetermination } from "./lib/fileNameDetermination";
import { formatToMMDD } from "./lib/utils";
import { configs } from "./lib/configs";

const RAW_CSV_DIR = path.join(__dirname, ".csv");
const ENCODED_CSV_DIR = path.join(__dirname, ".encoded");
const JSON_DIR = path.join(__dirname, ".json");

commander
  .description(
    "The script that fetches Nagano COVID19 Open Data CSV then convert it into JSON files."
  )
  .option("-d, --date <MMDD>", "To fetch the files with the date.")
  .option(
    "-o, --offline",
    "Offline mode. Once you've downloaded CSV files, it should be available. Useful for development."
  )
  .parse(process.argv);

if (commander.help) {
  commander.outputHelp();
}

const OFFLINE_MODE = commander.offline || false;

function loadFilesToBeEncoded(dates: Date[], dirs: dirs): Promise<item[]> {
  if (dates.length === 0) return Promise.reject("No dates given");
  if (!dirs.src) return Promise.reject("No dir given.");

  if (OFFLINE_MODE) {
    const localFileNames: string[] = getFileTypes().map(
      (fileType) => `${dirs.src}/${fileType}${formatToMMDD(dates[0])}.csv`
    );
    return openLocalFiles(localFileNames);
  } else {
    const remoteFileNames: string[] = getFileTypes()
      .map((fileType) => {
        return dates.map(
          (date: Date): string =>
            `${configs.remoteDir}/${fileType}${formatToMMDD(date)}.csv`
        );
      })
      .flat();
    return downloadFiles(remoteFileNames, dirs.src);
  }
}

function mkDirs(): void {
  [RAW_CSV_DIR, ENCODED_CSV_DIR, JSON_DIR].forEach((dirName) => {
    // Create directories we'd use.
    try {
      fs.mkdirSync(dirName);
    } catch (e) {}
  });
}

const dates = dateDetermination(commander.date);
(function () {
  console.log("STARTED");
  mkDirs();

  loadFilesToBeEncoded(dates, { src: RAW_CSV_DIR })
    .then(async (items: item[]) => {
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
      await mapper(resAll, { dist: JSON_DIR });
      console.log(
        `DONE for dates: ${dates.map((date) => formatToMMDD(date)).join(", ")}!`
      );
    })
    .catch((err) => console.error(err));
})();
