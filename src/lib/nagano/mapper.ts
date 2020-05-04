const fs = require("fs");
import { finalizeData } from "./finalizeData";
import { dirs, summary } from "../types";
import { buildJsonPath } from "../converter/utils";
import { openLocalFile } from "../openLocalFiles";
import { CONST_PATIENTS, CONST_TEST_COUNT, CONST_CALL_CENTER } from "./const";
import { patient, testCount, callCenter } from "./nagano_opendata_spec_covid19";
import { mappedJson } from "./nagano_data_json";
import { buildData } from "./mapperChunks/newFormatChunk";

async function mapper(resAll: summary[], dirs: dirs): Promise<void> {
  // Mapping multiple data into data.json

  // New format chunk
  const [patientRows] = resAll
    .filter((res) => res.type === CONST_PATIENTS)
    .map((res) => <patient[]>res.json);
  const [testCountRows] = resAll
    .filter((res) => res.type === CONST_TEST_COUNT)
    .map((res) => <testCount[]>res.json);
  const [callCenterRows] = resAll
    .filter((res) => res.type === CONST_CALL_CENTER)
    .map((res) => <callCenter[]>res.json);

  const {
    buildDataByPatientAndTestCount,
    buildDataByTestCount,
    buildDataByCallCenter
  } = buildData();
  const dataBasedOnPatientAndTestCount = buildDataByPatientAndTestCount(
    patientRows,
    testCountRows
  );
  const dataBasedOnTestCount = buildDataByTestCount(testCountRows);
  const dataBasedOnCallCenter = buildDataByCallCenter(callCenterRows);

  let currentDataItem;
  try {
    currentDataItem = await openLocalFile(
      buildJsonPath("data.json", dirs.dist || ""),
      "utf8"
    );
  } catch {
    currentDataItem = "{}";
  }

  const currentData: mappedJson = currentDataItem
    ? JSON.parse(currentDataItem) || {}
    : {};
  const mappedJson = {
    ...currentData,
    ...dataBasedOnPatientAndTestCount,
    ...dataBasedOnTestCount,
    ...dataBasedOnCallCenter
  };
  return new Promise((resolve, reject) => {
    try {
      fs.writeFileSync(
        buildJsonPath("data.json", dirs.dist || ""),
        JSON.stringify(finalizeData(currentData, mappedJson), null, 2)
      );
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export { mapper };
