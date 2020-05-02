import { convertOptions } from "../types";
import { convertProps } from "../converter/utils";
import { patient, testCount, callCenter } from "./nagano_opendata_spec_covid19";
import { CONST_PATIENTS, CONST_TEST_COUNT, CONST_CALL_CENTER } from "./const";

const encoding = ["UNICODE", "SJIS"];

function convertOpts(fileType: string): convertOptions {
  // options for different data sets. Read Only.
  const patientOpt: convertOptions = {
    encoding,
    csv: {
      skipLines: 2, // 陽性患者属性
      headers: [
        "no",
        "regionCode",
        "namePref",
        "nameMunicipal",
        "pubYMD",
        "onsetYMD",
        "residentialArea",
        "ageRange",
        "gender",
        "occupation",
        "status",
        "symptom",
        "hasTravelHistory",
        "discharged",
        "misc"
      ]
    },
    postProcess(results: patient[]) {
      return results.map((row) => {
        return convertProps.stringToNum(convertProps.stringScrub(row));
      });
    }
  };
  const testCountOpt: convertOptions = {
    encoding,
    csv: {
      skipLines: 2, // 検査実施状況
      headers: [
        "YMD",
        "regionCode",
        "namePref",
        "nameMunicipal",
        "testedNum",
        "misc",
        "positiveNum",
        "negativeNum"
      ]
    },
    postProcess(results: testCount[]) {
      return results.map((row) => {
        return convertProps.stringToNum(convertProps.stringScrub(row));
      });
    }
  };
  const callCenterOpt: convertOptions = {
    encoding,
    csv: {
      skipLines: 2, // 相談状況
      headers: [
        "YMD",
        "regionCode",
        "namePref",
        "nameMunicipal",
        "num",
        "misc",
        "hasSymptomNum",
        "safetyNum",
        "preventionNum",
        "treatmentNum",
        "actionNum",
        "otherNum"
      ]
    },
    postProcess(results: callCenter[]) {
      return results.map((row) => {
        return convertProps.stringToNum(convertProps.stringScrub(row));
      });
    }
  };
  const opts: { [key: string]: convertOptions } = {};
  // TODO TS beginner - Can it be better?
  opts[CONST_PATIENTS] = patientOpt;
  opts[CONST_TEST_COUNT] = testCountOpt;
  opts[CONST_CALL_CENTER] = callCenterOpt;
  return opts[fileType];
}

export { convertOpts };
