type configsType = {
  encoding: string[];
};

type scraperConfigType = {
  url: string;
  getEvaluatePage: Function;
};

// For debugging.
const isTest = process.env.TEST;

const configs: configsType = isTest
  ? {
      encoding: ["UNICODE"]
    }
  : {
      encoding: ["UNICODE", "SJIS"]
    };

const scraperConfigs: scraperConfigType = isTest
  ? {
      url: "",
      getEvaluatePage() {
        return function evaluatePage(): string[] {
          return [];
        };
      }
    }
  : {
      url:
        "https://www.pref.nagano.lg.jp/hoken-shippei/kenko/kenko/kansensho/joho/corona-doko.html",
      getEvaluatePage() {
        return function evaluatePage(): string[] {
          const csvFilePaths: string[] = [];
          const anchors = document.querySelectorAll(
            "#tmp_contents a[href$=csv]"
          );
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
export { configs, scraperConfigs };
