import { mappedJson } from "./nagano_data_json";
import { keys } from "../utils";
const deepEqual = require("deep-equal");

/*finalizeData*
 * cmpData
 * Compare old data and new data. IF the data is updated, set the updated data with updated date. Otherwise, do not update.
 * @param a old data
 * @param b new data
 * @returns finalizedData
 */
function finalizeData(a: mappedJson, b: mappedJson): mappedJson {
  // compare two data (except dates.)
  const [_a, _b] = [a, b].map((obj: mappedJson): any => {
    const cloneObj = JSON.parse(JSON.stringify(obj));
    delete cloneObj.lastUpdate;
    if (cloneObj.patients) delete cloneObj.patients.date;
    if (cloneObj.discharges_summary) delete cloneObj.discharges_summary.date;
    if (cloneObj.inspections) delete cloneObj.inspections.date;
    if (cloneObj.inspections_summary) delete cloneObj.inspections_summary.date;
    if (cloneObj.patients_summary) delete cloneObj.patients_summary.date;
    if (cloneObj.contacts) delete cloneObj.contacts.date;
    return {
      patients: cloneObj.patients,
      discharges_summary: cloneObj.discharges_summary,
      inspections: cloneObj.inspections,
      inspections_summary: cloneObj.inspections_summary,
      patients_summary: cloneObj.patients_summary,
      contacts: cloneObj.contacts,
      main_summary: cloneObj.main_summary
    };
  });
  let finalized: mappedJson = {
    ...a,
    lastUpdate: deepEqual(_a, _b) ? a.lastUpdate : b.lastUpdate
  };
  for (const key of keys(a)) {
    if (key !== "lastUpdate") {
      finalized[key] = deepEqual(_a[key], _b[key]) ? a[key] : b[key];
    }
  }
  return finalized;
}

export { finalizeData };
