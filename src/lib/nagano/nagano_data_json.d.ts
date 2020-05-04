type patientRow = {
  リリース日: string;
  曜日: string;
  居住地: string;
  年代: string;
  性別: string;
  退院?: string;
  date: string;
};
type discharges_summaryRow = {
  日付: string;
  小計: number;
};
type mainStructure = {
  attr: string;
  value: number;
  children?: mainStructure[];
};
type inspectionRow = {
  判明日: string;
  検査検体数: number;
  疑い例検査: 0;
  接触者調査: 0;
  陰性確認: 0;
  "（小計①）": number;
  チャーター便: 0;
  クルーズ船: 0;
  陰性確認2: 0;
  "（小計②）": 0;
  raw_date: string;
};
type patients_summaryRow = {
  日付: string;
  小計: number;
  positive: number;
  negative: number;
  total: number;
};
type contactsRow = {
  日付: string;
  曜日: string;
  "9-13時": 0;
  "13-17時": 0;
  "17-21時": 0;
  date: string;
  w: number;
  short_date: string;
  小計: number;
  raw_date: string;
};

export type patients = {
  date: string;
  data: patientRow[];
};
export type discharges_summary = {
  date: string;
  data: discharges_summaryRow[];
};
export type main_summary = mainStructure;
export type inspections = {
  date: string;
  data: inspectionRow[];
};
export type inspections_summary = {
  date: string;
  data: {
    県内: number[];
    その他: number[];
    labels: string[];
  };
};
export type patients_summary = {
  date: string;
  data: patients_summaryRow[];
};
export type contacts = {
  date: string;
  data: contactsRow[];
};

export type mappedJson = {
  lastUpdate: string;
  patients: patients;
  discharges_summary: discharges_summary;
  main_summary: mainStructure;
  inspections: inspections;
  inspections_summary: inspections_summary;
  patients_summary: patients_summary;
  contacts: contacts;
};
