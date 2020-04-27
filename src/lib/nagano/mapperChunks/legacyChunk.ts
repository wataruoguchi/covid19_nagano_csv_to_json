/**
 * It creates a JSON file that's following format of the following file:
 * https://github.com/tokyo-metropolitan-gov/covid19/blob/master/data/data.json
 *
 * Reference:
 * - https://docs.google.com/spreadsheets/d/1PWwV2bn9N9C2Cfox9-KdXDryIkRPh6LEpbXVZsAfwwM/edit#gid=0
 * - https://docs.google.com/spreadsheets/d/1SzMw0_Kg4MJJmgafq0NUeYEKdxAiyvPT_wWxWl-zrNw/edit#gid=0
 */

import { dataJsonSummaryType } from "../../types";
import { kensa, soudan, hasseijoukyou } from "../types";
import {
  setLabelFromJapaneseShortDateStr,
  addDate1
} from "../../converter/utils";

function calcByStatus(json: hasseijoukyou[], status: string): number {
  return json.reduce((acc, row: hasseijoukyou) => {
    if (row.status === status) {
      acc++;
    }
    return acc;
  }, 0);
}

function buildDataByKensa(kensaRows: kensa[]): object {
  return kensaRows && kensaRows.length
    ? {
        inspections: {
          date: setLabelFromJapaneseShortDateStr(
            kensaRows[kensaRows.length - 1].date,
            "",
            addDate1
          )("reportDate"),
          data: kensaRows.map((row) => {
            const dateToLabel = setLabelFromJapaneseShortDateStr(row.date, "");
            return {
              判明日: dateToLabel("判明日"),
              検査検体数: row.num_total,
              疑い例検査: 0,
              接触者調査: 0,
              陰性確認: 0,
              "（小計①）": row.num_total,
              チャーター便: 0,
              クルーズ船: 0,
              陰性確認2: 0,
              "（小計②）": 0,
              nagano_date_label: row.date
            };
          })
        },
        inspections_summary: {
          date: setLabelFromJapaneseShortDateStr(
            kensaRows[kensaRows.length - 1].date,
            "",
            addDate1
          )("reportDate"),
          data: {
            県内: kensaRows.map((row) => {
              return Number(row.num_total);
            }),
            その他: kensaRows.map(() => 0),
            labels: kensaRows.map((row) => {
              return setLabelFromJapaneseShortDateStr(
                row.date,
                row.date
              )("short_date");
            })
          }
        },
        patients_summary: {
          date: setLabelFromJapaneseShortDateStr(
            kensaRows[kensaRows.length - 1].date,
            "",
            addDate1
          )("reportDate"),
          data: kensaRows.map((row) => {
            const dateToLabel = setLabelFromJapaneseShortDateStr(row.date, "");
            return {
              日付: dateToLabel("日付"),
              小計: row.positive,
              positive: row.positive,
              negative: row.negative,
              total: row.num_total
            };
          })
        },
        lastUpdate: setLabelFromJapaneseShortDateStr(
          kensaRows[kensaRows.length - 1].date,
          "",
          addDate1
        )("reportDate")
      }
    : {};
}

function buildDataBySoudan(soudanRows: soudan[]): object {
  return soudanRows && soudanRows.length
    ? {
        contacts: {
          date: setLabelFromJapaneseShortDateStr(
            soudanRows[soudanRows.length - 1].date,
            "",
            addDate1
          )("reportDate"),
          data: soudanRows
            .filter((row) => row.date)
            .map((row) => {
              const dateToLabel = setLabelFromJapaneseShortDateStr(
                row.date,
                ""
              );
              return {
                日付: dateToLabel("日付"),
                曜日: dateToLabel("曜日"),
                "9-13時": 0,
                "13-17時": 0,
                "17-21時": 0,
                date: dateToLabel("yyyy-mm-dd"),
                w: dateToLabel("w"),
                short_date: dateToLabel("short_date"),
                小計: row.num_total,
                nagano_date_label: row.date
              };
            })
        }
      }
    : {};
}

function buildDataByHasseiAndKensa(
  hasseijoukyouRows: hasseijoukyou[],
  kensaRows: kensa[]
): object {
  return hasseijoukyouRows &&
    hasseijoukyouRows.length &&
    kensaRows &&
    kensaRows.length
    ? {
        patients: {
          date: setLabelFromJapaneseShortDateStr(
            kensaRows[kensaRows.length - 1].date,
            "",
            addDate1
          )("reportDate"),
          data: hasseijoukyouRows.map((row: hasseijoukyou) => {
            const dateToLabel = setLabelFromJapaneseShortDateStr(row.date, "");
            return {
              リリース日: dateToLabel("日付"),
              曜日: dateToLabel("w"),
              居住地: row.area,
              年代: row.age_group,
              性別: row.gender,
              退院: row.status === "退院" ? "〇" : null,
              date: dateToLabel("yyyy-mm-dd")
            };
          })
        },
        discharges_summary: {
          date: setLabelFromJapaneseShortDateStr(
            kensaRows[kensaRows.length - 1].date,
            "",
            addDate1
          )("reportDate"),
          data: (function (): dataJsonSummaryType[] {
            const hasseiMap = new Map();
            hasseijoukyouRows
              .filter((row: hasseijoukyou) => row.status === "退院")
              .forEach((row: hasseijoukyou) => {
                const val = hasseiMap.get(row.date);
                if (val) {
                  hasseiMap.set(row.date, val + 1);
                } else {
                  hasseiMap.set(row.date, 1);
                }
              });
            const hasseiArray: dataJsonSummaryType[] = [];
            hasseiMap.forEach((val, key) => {
              hasseiArray.push({
                日付: <string>setLabelFromJapaneseShortDateStr(key, "")("日付"),
                小計: val
              });
            });
            return hasseiArray.sort((a, b) => {
              if (a.日付 > b.日付) return 1;
              if (a.日付 < b.日付) return -1;
              return 0;
            });
          })()
        },
        main_summary: {
          attr: "検査実施人数",
          value: kensaRows.reduce((acc: number, row) => {
            return acc + (Number(row.num_total) || 0);
          }, 0),
          children: [
            {
              attr: "陽性患者数",
              value: hasseijoukyouRows.length,
              children: [
                {
                  attr: "入院中",
                  value: calcByStatus(hasseijoukyouRows, "入院中")
                },
                {
                  attr: "退院",
                  value: calcByStatus(hasseijoukyouRows, "退院")
                },
                {
                  attr: "死亡",
                  value: calcByStatus(hasseijoukyouRows, "死亡")
                }
              ]
            }
          ]
        }
      }
    : {};
}

export { buildDataBySoudan, buildDataByKensa, buildDataByHasseiAndKensa };
