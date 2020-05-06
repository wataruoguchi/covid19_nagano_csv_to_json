import { mappedJson } from "./nagano_data_json";
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
  const [_a, _b] = [a, b].map((obj: mappedJson) => {
    const cloneObj = JSON.parse(JSON.stringify(obj));
    delete cloneObj.lastUpdate;
    if (cloneObj.patients) delete cloneObj.patients.date;
    if (cloneObj.discharges_summary) delete cloneObj.discharges_summary.date;
    if (cloneObj.inspections) delete cloneObj.inspections.date;
    if (cloneObj.inspections_summary) delete cloneObj.inspections_summary.date;
    if (cloneObj.patients_summary) delete cloneObj.patients_summary.date;
    if (cloneObj.contacts) delete cloneObj.contacts.date;
    return cloneObj;
  });
  return {
    lastUpdate: deepEqual(_a, _b) ? b.lastUpdate : a.lastUpdate,
    contacts: deepEqual(_a.contacts, _b.contacts) ? b.contacts : a.contacts,
    discharges_summary: deepEqual(_a.discharges_summary, _b.discharges_summary)
      ? b.discharges_summary
      : a.discharges_summary,
    inspections: deepEqual(_a.inspections, _b.inspections)
      ? b.inspections
      : a.inspections,
    inspections_summary: deepEqual(
      _a.inspections_summary,
      _b.inspections_summary
    )
      ? b.inspections_summary
      : a.inspections_summary,
    main_summary: deepEqual(_a.main_summary, _b.main_summary)
      ? b.main_summary
      : a.main_summary,
    patients: deepEqual(_a.patients, _b.patients) ? b.patients : a.patients,
    patients_summary: deepEqual(_a.patients_summary, _b.patients_summary)
      ? b.patients_summary
      : a.patients_summary
  };
}

export { finalizeData };
