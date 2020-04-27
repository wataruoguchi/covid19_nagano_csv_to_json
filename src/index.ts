const fs = require("fs");
const path = require("path");
const commander = require("commander");
import { item, convertOptsInterface, mapperInterface } from "./lib/types";
import { mkDirs } from "./lib/utils";
import { converter } from "./lib/converter";
import { fetchItemsByScraping } from "./fetchItemsByScraping";
import { slackNotifier } from "./lib/slack";

// Depending on Nagano open data format
import { convertOpts as naganoConvertOpts } from "./lib/nagano/convertOpts";
import { mapper as naganoMapper } from "./lib/nagano/mapper";
import { fetchItemsFromTestDir } from "./fetchItemsFromTestDir";

// Type Check
const convertOpts: convertOptsInterface = naganoConvertOpts;
const mapper: mapperInterface = naganoMapper;

const RAW_CSV_DIR = path.join(__dirname, ".csv");
const ENCODED_CSV_DIR = path.join(__dirname, ".encoded");
const JSON_DIR = path.join(__dirname, ".json");

commander
  .description(
    "The script that fetches Nagano COVID19 Open Data CSV then convert it into JSON files."
  )
  .parse(process.argv);

if (commander.help) {
  commander.outputHelp();
}

function getStackTrace() {
  let obj = { stack: "" };
  Error.captureStackTrace(obj, getStackTrace);
  return obj.stack;
}

(async function () {
  console.log("STARTED");
  try {
    // 1. Create directories to store files.
    mkDirs(fs, [RAW_CSV_DIR, ENCODED_CSV_DIR, JSON_DIR]);

    // 2. Crawl the website and find CSV file links.
    // 3. Download CSV files.
    const items: item[] = process.env.TEST
      ? await fetchItemsFromTestDir()
      : await fetchItemsByScraping(RAW_CSV_DIR);

    // 4. Convert files into re-encoded CSV and JSON
    const resAll = await Promise.all(
      items.map(async (item) => {
        const opts = convertOpts(item.type);
        const dataJson = await converter(item, opts, {
          tmp: ENCODED_CSV_DIR,
          dist: JSON_DIR
        });
        return { json: dataJson, path: item.path, type: item.type };
      })
    );

    // 5. Create data.json
    await mapper(resAll, { dist: JSON_DIR });
    await slackNotifier("log", {
      message: "Downloaded the following items and complete!",
      files: items.map((item) => item.path)
    });
    return (process.exitCode = 0);
  } catch (err) {
    await slackNotifier("error", getStackTrace());
    return (process.exitCode = 1);
  }
})();
