import { scraperConfigs } from "./configs";
import { crawler } from "./crawler";

function launchCrawler(): Promise<string[]> {
  let filePaths: string[] = [];

  function onSuccess(res: { result: string[] }) {
    filePaths = res.result || [];
  }

  return new Promise((resolve, reject) => {
    // Set up parameters for the crawler
    crawler({
      url: scraperConfigs.url,
      evaluatePage: scraperConfigs.getEvaluatePage(),
      onSuccess
    })
      .then(() => {
        console.log("GOT SOME", filePaths);
        resolve(filePaths);
      })
      .catch((err) => {
        console.error("ERR", err);
        reject(err);
      });
  });
}

export { launchCrawler };
