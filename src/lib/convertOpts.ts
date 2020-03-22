import { kensa, soudan } from "./types";
import { convertProps } from "./utils";

function convertOpts() {
  // options for different data sets. Read Only.
  return {
    kensa: {
      csv: {
        skipLines: 5, // Ignoring weird lines such as "新型コロナウイルス感染症に係る検査件数について"
        headers: ["date", "num_total", "num_sub1", "num_sub2", "misc"]
      },
      postProcess(results: kensa[]) {
        results.pop(); // Dropping the empty line.
        results.pop(); // Dropping the sum line.
        // Creating new columns from misc.
        return results.map(row => {
          const newRow = convertProps.stringToNum(row);
          // NOTE: misc will be one of these: "", "すべて陰性", "うち1件陽性"
          newRow.positive = Number(newRow.misc.match(/\d+/) || "0");
          newRow.negative =
            typeof newRow.num_total === "number"
              ? newRow.num_total - newRow.positive
              : -1; // -1 ... something is wrong. Please make sure "misc" has expected string.
          return newRow;
        });
      }
    },
    soudan: {
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
        return results.map(row => {
          return convertProps.stringToNum(row);
        });
      }
    }
  };
}

export { convertOpts };
