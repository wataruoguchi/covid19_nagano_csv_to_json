// CODE FROM https://github.com/wataruoguchi/covid19_nagano_scraper/blob/master/src/lib/crawler.ts

const HCCrawler = require("headless-chrome-crawler");
type crawlerOptions = {
  url: string;
  evaluatePage: Function;
  onSuccess: Function;
};

export async function crawler(opts: crawlerOptions) {
  const { url, evaluatePage, onSuccess } = opts;
  const crawler = await HCCrawler.launch({
    evaluatePage,
    onSuccess,
    args: ["--disable-dev-shm-usage", "--no-sandbox"]
  });
  // Queue a request
  await crawler.queue(url);
  await crawler.onIdle(); // Resolved when no queue is left
  await crawler.close(); // Close the crawler
}
