const fs = require("fs");
const download = require("download");
const encoding = require("encoding-japanese");
const csv = require("csv-parser");

const RAW_CSV_DIR = "csv";
const ENCODED_CSV_DIR = "encoded";
const JSON_DIR = "json";
const OFFLINE_MODE = 0;

function getUrls(MMDD) {
  const pathPrefix =
    "https://www.pref.nagano.lg.jp/hoken-shippei/kenko/kenko/kansensho/joho/documents";
  return [`${pathPrefix}/kensa${MMDD}.csv`, `${pathPrefix}/soudan${MMDD}.csv`];
}

function getPaddedStr(num) {
  // printf('%02d')
  return `${num}`.padStart(2, "0");
}

function getMMDD(date) {
  return getPaddedStr(date.getMonth() + 1) + getPaddedStr(date.getDate());
}

function getFilenameFromUrl(str) {
  const filenameNodes = str.split("/");
  return filenameNodes[filenameNodes.length - 1];
}

// We don't know what date will be in the file name at what time. So let's queue two different dates.
const todayMMDD = getMMDD(new Date());
const tomorrowMMDD = getMMDD(
  new Date(new Date().setDate(new Date().getDate() + 1))
);

async function downloadFiles() {
  const successItems = [];
  // Attempt with two dates. One of them should fail unless they forget removing it.
  const MMDDs = [todayMMDD, tomorrowMMDD].map(MMDD => getUrls(MMDD)).flat();
  await Promise.all(
    MMDDs.map(url =>
      download(url, RAW_CSV_DIR, { encoding: "binary" })
        .then(data => {
          successItems.push({ url, data });
        })
        .catch(() => console.log(`LOG: ${url} got an error.`))
    )
  );
  return successItems;
}

async function openFiles() {
  // Imitate function for development
  const successItems = [];
  await Promise.all(
    [`${RAW_CSV_DIR}/kensa0319.csv`, `${RAW_CSV_DIR}/soudan0319.csv`].map(
      filename => {
        return new Promise((resolve, reject) => {
          fs.readFile(filename, "utf8", function(err, data) {
            if (data) {
              successItems.push({ url: filename, data });
              resolve();
            } else {
              reject(err);
            }
          });
        });
      }
    )
  );
  return successItems;
}

function loadFilesToBeEncoded() {
  // Create directories we'd use.
  try {
    fs.mkdirSync(RAW_CSV_DIR);
  } catch (e) {}
  try {
    fs.mkdirSync(ENCODED_CSV_DIR);
  } catch (e) {}
  try {
    fs.mkdirSync(JSON_DIR);
  } catch (e) {}
  return OFFLINE_MODE ? openFiles() : downloadFiles();
}

// options for different data sets
function getOptions() {
  return {
    kensa: {
      csv: {
        skipLines: 5, // Ignoring weird lines such as "新型コロナウイルス感染症に係る検査件数について"
        headers: ["date", "num_total", "num_sub1", "num_sub2", "misc"]
      },
      postProcess(results) {
        results.pop(); // Dropping the empty line.
        results.pop(); // Dropping the sum line.
        // Creating new columns from misc.
        return results.map(row => {
          Object.keys(row).forEach(key => {
            if (/^\d+$/.test(row[key])) row[key] = Number(row[key]);
          });
          // NOTE: misc will be one of these: "", "すべて陰性", "うち1件陽性"
          row.misc;
          row.positive = Number(row.misc.match(/\d+/) || "0");
          row.negative = row.num_total - row.positive;
          return row;
        });
      }
    },
    soudan: {
      csv: {
        skipLines: 5, // Ignoring weird lines such as "新型コロナウイルス感染症に関する相談状況について"
        headers: [
          "date",
          "num_total",
          "num_has_symptom",
          "num_safety",
          "num_prevention",
          "num_treatment",
          "num_action",
          "num_others"
        ]
      },
      postProcess(results) {
        results.pop(); // Dropping the empty line.
        results.pop(); // Dropping the sum line.
        return results.map(row => {
          Object.keys(row).forEach(key => {
            if (/^\d+$/.test(row[key])) row[key] = Number(row[key]);
          });
          return row;
        });
      }
    }
  };
}

loadFilesToBeEncoded().then(successItems => {
  successItems.map(item => {
    // Encode the original CSV file from SHIFT-JIS to UNICODE, avoiding moji-bake.
    const encoded = encoding.convert(item.data, "UNICODE", "SJIS");
    const filePath = `${ENCODED_CSV_DIR}/${getFilenameFromUrl(item.url)}`;
    fs.writeFileSync(filePath, encoded);

    const opts = getOptions()[/kensa/.test(item.url) ? "kensa" : "soudan"];

    // Read the encoded CSV file, and convert it to JSON
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv(opts.csv))
      .on("data", data => results.push(data))
      .on("end", () => {
        const jsonFilePath = `${JSON_DIR}/${getFilenameFromUrl(item.url)
          .replace(/\d+/, "")
          .replace(/\.csv$/, ".json")}`;
        fs.writeFileSync(
          jsonFilePath,
          JSON.stringify(opts.postProcess(results), null, 2)
        );
      });
  });
});
