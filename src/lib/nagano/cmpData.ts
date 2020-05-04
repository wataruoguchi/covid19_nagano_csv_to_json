import { mappedJson } from "./nagano_data_json";
const deepEqual = require("deep-equal");

/**
 * cmpData
 * If the data 'b' is not same as data 'a', return data 'b'. Otherwise, return null.
 * @param a old data
 * @param b new data
 */
function cmpData(a: mappedJson, b: mappedJson): mappedJson | null {
  // compare two data (except dates.)
  try {
    const [_a, _b] = [a, b].map((obj: mappedJson) => {
      const cloneObj = JSON.parse(JSON.stringify(obj));
      delete cloneObj.lastUpdate;
      if (cloneObj.patients) delete cloneObj.patients.date;
      if (cloneObj.discharges_summary) delete cloneObj.discharges_summary.date;
      if (cloneObj.inspections) delete cloneObj.inspections.date;
      if (cloneObj.inspections_summary)
        delete cloneObj.inspections_summary.date;
      if (cloneObj.patients_summary) delete cloneObj.patients_summary.date;
      if (cloneObj.contacts) delete cloneObj.contacts.date;
      return cloneObj;
    });
    return deepEqual(_a, _b) ? b : null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export { cmpData };
