type configsType = {
  remoteDir: string;
  encoding: string[];
};

// TEST OR PROD
const isTest = false;

const configs: configsType = isTest
  ? {
      remoteDir:
        "https://raw.githubusercontent.com/wataruoguchi/covid19_nagano_csv_to_json/master/src/.encoded",
      encoding: ["UNICODE"]
    }
  : {
      remoteDir:
        "https://www.pref.nagano.lg.jp/hoken-shippei/kenko/kenko/kansensho/joho/documents",
      encoding: ["UNICODE", "SJIS"]
    };

export { configs };
