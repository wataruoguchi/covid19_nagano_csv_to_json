export type item = {
  data: string;
  path: string;
};

export type kensa = {
  date: string;
  num_total: number | string;
  num_sub1: number | string;
  num_sub2: number | string;
  misc: string;
  positive?: number;
  negative?: number;
};

export type soudan = {
  date: string;
  num_total: number | string;
  num_has_symptom: number | string;
  num_safety: number | string;
  num_prevention: number | string;
  num_treatment: number | string;
  num_action: number | string;
  num_others: number | string;
};

export type hasseijoukyou = {
  no: number | string;
  date: string;
  age_group: string;
  gender: string;
  area: string;
  status: string;
  status2: string;
  misc: string;
  group?: number;
};

export type nullType = any;

export type dirs = {
  src?: string;
  tmp?: string;
  dist?: string;
};

export type convertOptions = {
  csv: object;
  postProcess: Function;
};

export type fileType = "kensa" | "soudan" | "hasseijoukyou" | "null";

export type summaryType = {
  日付: string;
  小計: number;
};
