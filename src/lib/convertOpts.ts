import {
  kensa,
  soudan,
  hasseijoukyou,
  nullType,
  convertOptions,
  fileType
} from "./types";
import { convertProps } from "./utils";
import { CONST_KENSA, CONST_SOUDAN, CONST_HASSEI, CONST_NULL } from "./const";

function convertOpts(fileType: fileType): convertOptions {
  // options for different data sets. Read Only.
  const kensaOpt: convertOptions = {
    csv: {
      skipLines: 5, // Ignoring weird lines such as "新型コロナウイルス感染症に係る検査件数について"
      headers: ["date", "num_total", "num_sub1", "num_sub2", "misc"]
    },
    postProcess(results: kensa[]) {
      results.pop(); // Dropping the empty line.
      results.pop(); // Dropping the sum line.
      // Creating new columns from misc.
      return results.map((row) => {
        // Convert wide number to normal number
        const misc = row.misc.replace(/[０-９]/g, (str: string) =>
          String.fromCharCode(str.charCodeAt(0) - 65248)
        );
        const newRow = convertProps.stringToNum({ ...row, ...{ misc } });
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
        "num_others"
      ]
    },
    postProcess(results: soudan[]) {
      results.pop(); // Dropping the empty line.
      results.pop(); // Dropping the sum line.
      return results.map((row) => {
        return convertProps.stringToNum(row);
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
        .filter((row) => row.no !== "" && !Number.isNaN(Number(row.no)))
        .map((row, idx, rows) => {
          const newRow = convertProps.stringToNum(
            convertProps.stringScrub(row)
          );
          if (idx && rows[idx - 1] && rows[idx - 1].no > rows[idx].no) {
            // If previous row's number ("No.") is bigger than the current row's number ("No."), increase "groupNo".
            groupNo++;
          }
          newRow["group"] = groupNo;
          return newRow;
        });
    }
  };
  const nullOpt: convertOptions = {
    csv: {},
    postProcess(results: nullType[]) {
      return results;
    }
  };
  const opts: { [key: string]: convertOptions } = {};
  // TODO TS beginner - Can it be better?
  opts[CONST_KENSA] = kensaOpt;
  opts[CONST_SOUDAN] = soudanOpts;
  opts[CONST_HASSEI] = hasseijoukyouOpt;
  opts[CONST_NULL] = nullOpt;
  return opts[fileType];
}

export { convertOpts };
