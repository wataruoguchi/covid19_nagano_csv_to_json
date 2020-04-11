const fs = require("fs");
const path = require("path");
const commander = require("commander");
import { item } from "./lib/types/types";
import { mkDirs } from "./lib/utils";
import { launchCrawler } from "./lib/scraper/scraper";
import { downloadFiles } from "./lib/downloadFiles";
import { converter } from "./lib/converter";
import { convertOpts } from "./lib/convertOpts";
import { mapper } from "./lib/mapper";

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

(async function () {
  console.log("STARTED");

  // 1. Create directories to store files.
  mkDirs(fs, [RAW_CSV_DIR, ENCODED_CSV_DIR, JSON_DIR]);

  // 2. Crawl the website and find CSV file links.
  const filePaths = (await launchCrawler()) || [];
  if (filePaths.length !== 3)
    throw new Error(
      "Hmm, we want to grab three files but only " + filePaths.length
    );

  try {
    // 3. Download CSV files
    const items: item[] = await downloadFiles(filePaths, RAW_CSV_DIR);

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
    console.log(`DONE: ${items.map((item) => item.path).join(", ")}!`);
  } catch (err) {
    console.error(err);
  }
})();
