const download = require("download");
import { item } from "./types/types";
import { determineFileTypeByFileName } from "./fileType";

async function downloadFiles(urls: string[], dir: string): Promise<item[]> {
  // Download files (CSV file, probably made with MS Excel).
  const items: item[] = [];
  const promises = urls.map(async (url: string) => {
    try {
      const data: string = await download(url, dir, { encoding: "binary" });
      items.push({ path: url, data, type: determineFileTypeByFileName(url) });
    } catch (err) {
      console.log(`LOG: ${url} got an error.`);
      throw err;
    }
  });
  await Promise.all(promises);
  return items;
}

export { downloadFiles };
