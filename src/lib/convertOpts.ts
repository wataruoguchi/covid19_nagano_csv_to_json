import {
  kensa,
  soudan,
  hasseijoukyou,
  convertOptions,
  fileType
} from "./types";
import { convertProps } from "./utils";
import { CONST_KENSA, CONST_SOUDAN, CONST_HASSEI } from "./const";

function convertOpts(fileType: fileType): convertOptions {
  // options for different data sets. Read Only.
  const kensaOpt: convertOptions = {
    csv: {
      skipLines: 5, // Ignoring weird lines such as "新型コロナウイルス感染症に係る検査件数について"
      headers: ["date", "num_total", "num_sub1", "num_sub2", "misc"]
    },
    postProcess(results: kensa[]) {
      // Creating new columns from misc.
      return results
        .filter((row) => row.date !== "" && row.date !== "計")
        .map((row) => {
          // Convert wide number to normal number
          const newRow = convertProps.stringToNum(
            convertProps.stringScrub(row)
          );
          // NOTE: misc will be one of these: "", "すべて陰性", "うち1件陽性"
          newRow.positive = Number(newRow.misc.match(/\d+/) || "0");
          newRow.negative =
            typeof newRow.num_total === "number"
              ? newRow.num_total - newRow.positive
              : -1; // -1 ... something is wrong. Please make sure "misc" has expected string.
          return newRow;
        });
    }
  };
  const soudanOpts: convertOptions = {
    csv: {
      skipLines: 5, // Ignoring weird lines such as "新型コロナウイルス感染症に関する相談状況について"
      headers: [
        "date",
        "num_total",
        "num_has_symptom",
        "num_safety",
        "num_prevention",
        "num_treatment",
        "num_action",
        "num_others",
        "ignorable",
        "ignorable",
        "ignorable",
        "ignorable"
      ]
    },
    postProcess(results: soudan[]) {
      return results
        .filter((row) => row.date !== "" && row.date !== "計")
        .map((row) => {
          delete row.ignorable;
          return convertProps.stringToNum(convertProps.stringScrub(row));
        });
    }
  };
  const hasseijoukyouOpt: convertOptions = {
    csv: {
      skipLines: 5, // Ignoring weird lines such as "長野県内の新型コロナウイルス感染症患者の発生状況"
      headers: [
        "no",
        "date",
        "age_group",
        "gender",
        "area",
        "status",
        "status2",
        "misc"
      ]
    },
    postProcess(results: hasseijoukyou[]) {
      let groupNo = 1;
      return results
        .filter(
          (row) =>
            row.no !== "" &&
            !Number.isNaN(Number(row.no)) &&
            row.date !== "" &&
            row.age_group !== "" &&
            row.gender !== ""
        )
        .map((row, idx, rows) => {
          const newRow = convertProps.stringToNum(
            convertProps.stringScrub(row)
          );
          if (idx && rows[idx - 1]) {
            const currentNum = Number(rows[idx].no);
            const prevNum = Number(rows[idx - 1].no);
            if (prevNum > currentNum) {
              // If previous row's number ("No.") is bigger than the current row's number ("No."), increase "groupNo".
              groupNo++;
            }
          }
          newRow["group"] = groupNo;
          return newRow;
        });
    }
  };
  const opts: { [key: string]: convertOptions } = {};
  // TODO TS beginner - Can it be better?
  opts[CONST_KENSA] = kensaOpt;
  opts[CONST_SOUDAN] = soudanOpts;
  opts[CONST_HASSEI] = hasseijoukyouOpt;
  return opts[fileType];
}

export { convertOpts };
