export type dataJsonSummaryType = {
  日付: string;
  小計: number;
};

export type item = {
  type: string;
  data: string;
  path: string;
};

export type dirs = {
  src?: string;
  tmp?: string;
  dist?: string;
};

export type convertOptions = {
  csv: object;
  postProcess: Function;
  encoding: string[];
};

export type scraperConfigType = {
  url: string;
  getEvaluatePage: () => () => string[];
};

export type determineFileTypeByFileNameInterface = (filePath: string) => string;
export type convertOptsInterface = (fileType: string) => convertOptions;

export type summary = {
  json: object[];
  path: string;
  type: string;
};

export type mapperInterface = (resAll: summary[], dirs: dirs) => void;
