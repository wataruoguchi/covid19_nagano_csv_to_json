const fs = require("fs");
import { dirs, kensa, soudan } from "./types";
import { buildJsonPath, setLabelFromDateStr } from "./utils";
/**
 * This is an optional script. It creates a JSON file that's following format of the following file:
 * https://github.com/tokyo-metropolitan-gov/covid19/blob/master/data/data.json
 *
 * Reference:
 * - https://docs.google.com/spreadsheets/d/1PWwV2bn9N9C2Cfox9-KdXDryIkRPh6LEpbXVZsAfwwM/edit#gid=0
 * - https://docs.google.com/spreadsheets/d/1SzMw0_Kg4MJJmgafq0NUeYEKdxAiyvPT_wWxWl-zrNw/edit#gid=0
 */

type summary = {
  json: (kensa & soudan)[];
  path: string;
};

async function mapper(resAll: summary[], dirs: dirs): Promise<void> {
  function addDate1(date: Date) {
    date.setDate(date.getDate() + 1);
  }
  const [soudanJson] = resAll
    .filter(res => /soudan/.test(res.path))
    .map(res => res.json);
  const [kensaJson] = resAll
    .filter(res => /kensa/.test(res.path))
    .map(res => res.json);
  const mappedJson = {
    contacts: {
      date: setLabelFromDateStr(
        soudanJson[soudanJson.length - 1].date,
        "",
        addDate1
      )("reportDate"),
      data: soudanJson.map(row => {
        const dateToLabel = setLabelFromDateStr(row.date, "");
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
    },
    inspections: {
      date: setLabelFromDateStr(
        kensaJson[kensaJson.length - 1].date,
        "",
        addDate1
      )("reportDate"),
      data: kensaJson.map(row => {
        const dateToLabel = setLabelFromDateStr(row.date, "");
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
      date: setLabelFromDateStr(
        kensaJson[kensaJson.length - 1].date,
        "",
        addDate1
      )("reportDate"),
      data: {
        県内: kensaJson.map(row => {
          return Number(row.num_total);
        }),
        その他: kensaJson.map(() => 0),
        labels: kensaJson.map(row => {
          return setLabelFromDateStr(row.date, row.date)("short_date");
        })
      }
    },
    patients_summary: {
      date: setLabelFromDateStr(
        kensaJson[kensaJson.length - 1].date,
        "",
        addDate1
      )("reportDate"),
      data: kensaJson.map(row => {
        const dateToLabel = setLabelFromDateStr(row.date, "");
        return {
          日付: dateToLabel("日付"),
          小計: row.positive,
          positive: row.positive,
          negative: row.negative,
          total: row.num_total
        };
      })
    }
  };

  return new Promise((resolve, reject) => {
    try {
      fs.writeFileSync(
        buildJsonPath("data.json", dirs.dist || ""),
        JSON.stringify(mappedJson, null, 2)
      );
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export { mapper };
