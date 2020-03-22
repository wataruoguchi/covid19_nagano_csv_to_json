const fs = require("fs");
const path = require("path");
const commander = require("commander");
import { item, dirs } from "./lib/types";
import { openLocalFiles } from "./lib/openLocalFiles";
import { downloadFiles } from "./lib/downloadFiles";
import { converter } from "./lib/converter";
import { mapper } from "./lib/mapper";
import { formatToMMDD, MMDDToDate } from "./lib/utils";
import { CONST_KENSA, CONST_SOUDAN } from "./lib/const";

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

const RAW_CSV_DIR = path.join(__dirname, ".csv");
const ENCODED_CSV_DIR = path.join(__dirname, ".encoded");
const JSON_DIR = path.join(__dirname, ".json");
const OFFLINE_MODE = commander.offline || false;

// We don't know what date will be in the file name at what time. So let's queue multiple different dates.
// One of them should fail (gracefully) unless they forget removing it.
const today = new Date();
const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
const dates: Date[] =
  commander.date && /\d{4}/.test(commander.date)
    ? [MMDDToDate(commander.date)]
    : [today, tomorrow];

console.log("STARTED");
mkDirs();

loadFilesToBeEncoded(dates, { src: RAW_CSV_DIR })
  .then(async (items: item[]) => {
    const resAll = await Promise.all(
      items.map(async item => {
        const dataJson = await converter(item, {
          tmp: ENCODED_CSV_DIR,
          dist: JSON_DIR
        });
        return { json: dataJson, path: item.path };
      })
    );
    await mapper(resAll, { dist: JSON_DIR });
    console.log(
      `DONE for dates: ${dates.map(date => formatToMMDD(date)).join(", ")}!`
    );
  })
  .catch(err => console.error(err));

function loadFilesToBeEncoded(dates: Date[], dirs: dirs): Promise<item[]> {
  if (dates.length === 0) return new Promise(reject => reject());
  if (!dirs.src) return new Promise(reject => reject());

  function buildLocalFilePath(name: string): string {
    // It's for development purpose.
    return `${dirs.src}/${name}${formatToMMDD(dates[0])}.csv`;
  }
  function buildRemoteFilePath(dates: Date[]) {
    return (name: string): string[] => {
      return dates.map(
        (date: Date): string =>
          `https://www.pref.nagano.lg.jp/hoken-shippei/kenko/kenko/kansensho/joho/documents/${name}${formatToMMDD(
            date
          )}.csv`
      );
    };
  }

  const fileNames = [CONST_KENSA, CONST_SOUDAN];

  return OFFLINE_MODE
    ? openLocalFiles(fileNames.map(buildLocalFilePath))
    : downloadFiles(fileNames.map(buildRemoteFilePath(dates)).flat(), dirs.src);
}

function mkDirs(): void {
  [RAW_CSV_DIR, ENCODED_CSV_DIR, JSON_DIR].forEach(dirName => {
    // Create directories we'd use.
    try {
      fs.mkdirSync(dirName);
    } catch (e) {}
  });
}
