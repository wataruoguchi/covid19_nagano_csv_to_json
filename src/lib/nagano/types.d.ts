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
  ignorable: any; // CSV cannot drop it. Maybe there's weird data in the column.
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
