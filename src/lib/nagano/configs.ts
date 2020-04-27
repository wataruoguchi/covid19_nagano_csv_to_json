import { scraperConfigType } from "../types";

const scraperConfigs: scraperConfigType = {
  url:
    "https://www.pref.nagano.lg.jp/hoken-shippei/kenko/kenko/kansensho/joho/corona-doko.html",
  getEvaluatePage() {
    return function evaluatePage(): string[] {
      const csvFilePaths: string[] = [];
      const anchors = document.querySelectorAll("#tmp_contents a[href$=csv]");
      anchors.forEach((anchor) => {
        const href = anchor.getAttribute("href");
        if (href) {
          csvFilePaths.push(new URL(href, window.location.href).href);
        }
      });
      return csvFilePaths;
    };
  }
};
export { scraperConfigs };
