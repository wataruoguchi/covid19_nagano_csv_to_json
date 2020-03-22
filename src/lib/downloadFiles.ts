const download = require("download");
import { item } from "./types";

async function downloadFiles(urls: string[], dir: string): Promise<item[]> {
  // Download files (CSV file, probably made with MS Excel).
  const items: item[] = [];
  await Promise.all(
    urls.map(url => {
      download(url, dir, { encoding: "binary" })
        .then((data: string) => {
          items.push({ path: url, data });
        })
        .catch(() => console.log(`LOG: ${url} got an error.`));
    })
  );
  return items;
}

export { downloadFiles };
