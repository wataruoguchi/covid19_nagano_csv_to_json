import { getFileNameFromPath } from "../converter/utils";
import { CONST_PATIENTS, CONST_TEST_COUNT, CONST_CALL_CENTER } from "./const";

function determineFileTypeByFileName(filePath: string): string {
  const fileName = getFileNameFromPath(filePath);
  if (fileName === "200000_nagano_covid19_patients.csv") return CONST_PATIENTS;
  if (fileName === "200000_nagano_covid19_test_count.csv")
    return CONST_TEST_COUNT;
  if (fileName === "200000_nagano_covid19_call_center.csv")
    return CONST_CALL_CENTER;
  return CONST_CALL_CENTER;
}

export { determineFileTypeByFileName };
