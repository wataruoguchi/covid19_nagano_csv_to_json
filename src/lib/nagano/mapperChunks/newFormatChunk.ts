/**
 * It creates a JSON file that's following format of the following file:
 * https://github.com/tokyo-metropolitan-gov/covid19/blob/master/data/data.json
 *
 * Disclaimer: This module should be localized as the output data.json could be different.
 *
 * Reference for Nagano:
 * - https://docs.google.com/spreadsheets/d/1L8AxdLLO8GUIiLwDrFKvz2oCFAKMakXbd4JJBFBo50U/edit#gid=2061199346
 */

import { dataJsonSummaryType } from "../../types";
import {
  patient,
  testCount,
  callCenter
} from "../nagano_opendata_spec_covid19";
import { setLabelFromDateStr, dateToLabel } from "../../converter/utils";
import {
  patients,
  discharges_summary,
  main_summary,
  inspections,
  inspections_summary,
  patients_summary,
  contacts
} from "../nagano_data_json";

function buildDataByPatientAndTestCount(reportDateStr: string) {
  return function (
    patientRows: patient[],
    testCountRows: testCount[]
  ):
    | {
        patients: patients;
        discharges_summary: discharges_summary;
        main_summary: main_summary;
      }
    | {} {
    if (
      patientRows &&
      patientRows.length &&
      testCountRows &&
      testCountRows.length
    ) {
      const dischargedNum: number = patientRows.filter(
        (row: patient) => row.discharged
      ).length;
      const deadNum: number = patientRows.filter(
        (row: patient) => row.status === "死亡"
      ).length;
      const criticalNum: number = patientRows.filter(
        (row: patient) => row.status === "重症"
      ).length;
      const hospitalizedNum: number =
        patientRows.length - dischargedNum - deadNum;

      return {
        patients: {
          date: reportDateStr,
          data: patientRows.map((row) => {
            const dateToLabel = setLabelFromDateStr(row.pubYMD, "");
            return {
              リリース日: dateToLabel("日付"),
              曜日: dateToLabel("w"),
              居住地: row.residentialArea,
              年代: row.ageRange,
              性別: row.gender,
              退院: row.discharged ? "〇" : null,
              date: dateToLabel("yyyy-mm-dd")
            };
          })
        },
        discharges_summary: {
          date: reportDateStr,
          data: (function (): dataJsonSummaryType[] {
            const dischargedDateMap = new Map();
            patientRows
              .filter((row: patient) => row.discharged)
              .forEach((row: patient) => {
                const val = dischargedDateMap.get(row.pubYMD) || 0;
                dischargedDateMap.set(row.pubYMD, val + 1);
              });
            const dischargedArray: dataJsonSummaryType[] = [];
            dischargedDateMap.forEach((val, key) => {
              dischargedArray.push({
                日付: <string>setLabelFromDateStr(key, "")("日付"),
                小計: val
              });
            });
            return dischargedArray.sort((a, b) => {
              if (a.日付 > b.日付) return 1;
              if (a.日付 < b.日付) return -1;
              return 0;
            });
          })()
        },
        main_summary: {
          attr: "検査実施人数",
          value: testCountRows.reduce((acc: number, row: testCount) => {
            return acc + (Number(row.testedNum) || 0);
          }, 0),
          children: [
            {
              attr: "陽性患者数",
              value: patientRows.length,
              children: [
                {
                  attr: "入院中",
                  value: hospitalizedNum
                },
                {
                  attr: "重症",
                  value: criticalNum
                },
                {
                  attr: "退院",
                  value: dischargedNum
                },
                {
                  attr: "死亡",
                  value: deadNum
                }
              ]
            }
          ]
        }
      };
    } else {
      return {};
    }
  };
}

function buildDataByTestCount(reportDateStr: string) {
  return function (
    testCountRows: testCount[]
  ):
    | {
        inspections: inspections;
        inspections_summary: inspections_summary;
        patients_summary: patients_summary;
      }
    | {} {
    if (testCountRows && testCountRows.length) {
      return {
        inspection: {
          date: reportDateStr,
          data: testCountRows.map((row) => {
            const dateToLabel = setLabelFromDateStr(row.YMD, "");
            return {
              判明日: dateToLabel("判明日"),
              検査検体数: row.testedNum,
              疑い例検査: 0,
              接触者調査: 0,
              陰性確認: 0,
              "（小計①）": row.testedNum,
              チャーター便: 0,
              クルーズ船: 0,
              陰性確認2: 0,
              "（小計②）": 0,
              raw_date: row.YMD
            };
          })
        },
        inspections_summary: {
          date: reportDateStr,
          data: {
            県内: testCountRows.map((row) => row.testedNum),
            その他: testCountRows.map(() => 0),
            labels: testCountRows.map((row) =>
              setLabelFromDateStr(row.YMD, row.YMD)("short_date")
            )
          }
        },
        patients_summary: {
          date: reportDateStr,
          data: testCountRows.map((row) => {
            return {
              日付: setLabelFromDateStr(row.YMD, "")("日付"),
              小計: row.positiveNum,
              positive: row.positiveNum,
              negative: row.negativeNum,
              total: row.testedNum
            };
          })
        },
        lastUpdate: reportDateStr
      };
    } else {
      return {};
    }
  };
}

function buildDataByCallCenter(reportDateStr: string) {
  return function (callCenterRows: callCenter[]): { contacts: contacts } | {} {
    return callCenterRows && callCenterRows.length
      ? {
          contacts: {
            date: reportDateStr,
            data: callCenterRows
              .filter((row) => row.YMD)
              .map((row) => {
                const dateToLabel = setLabelFromDateStr(row.YMD, "");
                return {
                  日付: dateToLabel("日付"),
                  曜日: dateToLabel("曜日"),
                  "9-13時": 0,
                  "13-17時": 0,
                  "17-21時": 0,
                  date: dateToLabel("yyyy-mm-dd"),
                  w: dateToLabel("w"),
                  short_date: dateToLabel("short_date"),
                  小計: row.num,
                  raw_date: row.YMD
                };
              })
          }
        }
      : {};
  };
}

export function buildData() {
  const updateDate = new Date(); // NOTE I want to give process.env.date
  const reportDateStr: string = <string>dateToLabel(updateDate, "reportDate");

  return {
    buildDataByPatientAndTestCount: buildDataByPatientAndTestCount(
      reportDateStr
    ),
    buildDataByTestCount: buildDataByTestCount(reportDateStr),
    buildDataByCallCenter: buildDataByCallCenter(reportDateStr)
  };
}
