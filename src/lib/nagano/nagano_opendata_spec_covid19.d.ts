/**
 * Data format for Nagano pref.
 * Nagano pref. extended the original format of opendata_spec_covid19.
 */

import {
  patients as patient,
  test_count as origTestCount,
  call_center as origCallCenter
} from "types_opendata_spec_covid19";

type testCount = origTestCount & {
  // 陽性_人数
  positiveNum: number | string;
  // 陰性_人数
  negativeNum: number | string;
};

type callCenter = origCallCenter & {
  // 再掲：有症相談
  hasSymptomNum: number | string;
  // 再掲：海外旅行安全性
  safetyNum: number | string;
  // 再掲：感染症予防
  preventionNum: number | string;
  // 再掲：感染症治療
  treatmentNum: number | string;
  // 再掲：発症時対応
  actionNum: number | string;
  // 再掲：その他
  otherNum: number | string;
};

export { patient, testCount, callCenter };
