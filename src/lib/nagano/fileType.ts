import { getFileNameFromPath } from "../utils";
import { CONST_PATIENTS, CONST_TEST_COUNT, CONST_CALL_CENTER } from "./const";

function determineFileTypeByFileName(filePath: string): string {
  const fileName = getFileNameFromPath(filePath);

  if (fileName.startsWith("200000_nagano_covid19_patients"))
    return CONST_PATIENTS;
  if (fileName.startsWith("200000_nagano_covid19_test_count"))
    return CONST_TEST_COUNT;
  if (fileName.startsWith("200000_nagano_covid19_call_center"))
    return CONST_CALL_CENTER;

  return CONST_CALL_CENTER;
}


export { determineFileTypeByFileName };
