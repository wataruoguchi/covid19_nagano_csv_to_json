const fs = require("fs");
const download = require("download");
const encoding = require("encoding-japanese");

const RAW_CSV_DIR = "csv";
const ENCODED_CSV_DIR = "encoded";
const OFFLINE_MODE = 1;

function getUrls(MMDD) {
  const pathPrefix =
    "https://www.pref.nagano.lg.jp/hoken-shippei/kenko/kenko/kansensho/joho/documents";
  return [`${pathPrefix}/kensa${MMDD}.csv`, `${pathPrefix}/soudan${MMDD}.csv`];
}

function getPaddedStr(num) {
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
  // Attempt with two dates
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
    [`${RAW_CSV_DIR}/kensa0319.csv`].map(filename => {
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
    })
  );
  return successItems;
}

function loadFilesToBeEncoded() {
  return OFFLINE_MODE ? openFiles() : downloadFiles();
}

loadFilesToBeEncoded().then(successItems => {
  successItems.map(item => {
    const encoded = encoding.convert(item.data, "UNICODE", "SJIS");
    fs.writeFileSync(
      `${ENCODED_CSV_DIR}/${getFilenameFromUrl(item.url)}`,
      encoded
    );
  });
});
