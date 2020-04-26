import {
  item,
  scraperConfigType,
  determineFileTypeByFileNameInterface
} from "./lib/types";
import { launchCrawler } from "./lib/scraper";
import { downloadFiles } from "./lib/downloadFiles";

// Depending on Nagano open data format
import { scraperConfigs as naganoScraperConfigs } from "./lib/nagano/configs";
import { determineFileTypeByFileName as naganoDetermineFileTypeByFileName } from "./lib/nagano/fileType";

// Type Check
const scraperConfigs: scraperConfigType = naganoScraperConfigs;
const determineFileTypeByFileName: determineFileTypeByFileNameInterface = naganoDetermineFileTypeByFileName;

/**
 * fetchItemsByScraping
 *   1. Crawl the website and find CSV file links.
 *   2. Download CSV files.
 * @param rawCsvDir
 */
async function fetchItemsByScraping(rawCsvDir: string): Promise<item[]> {
  // Crawl the website and find CSV file links.
  const filePaths = (await launchCrawler(scraperConfigs)) || [];
  if (filePaths.length !== 3)
    throw new Error(
      "Hmm, we want to grab three files but only " + filePaths.length
    );

  // Download CSV files.
  const itemsWithNoType: item[] = await downloadFiles(filePaths, rawCsvDir);
  const items: item[] = itemsWithNoType.map((item) => {
    item.type = determineFileTypeByFileName(item.path);
    return item;
  });

  return items;
}

export { fetchItemsByScraping };
