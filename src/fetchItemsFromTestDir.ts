import { item } from "./lib/types";
import {
  CONST_PATIENTS,
  CONST_TEST_COUNT,
  CONST_CALL_CENTER
} from "./lib/nagano/const";
import { openLocalFile } from "./lib/openLocalFiles";

/**
 * fetchItemsFromTestDir
 *   1. Load files from local filesystem.
 */
async function fetchItemsFromTestDir(): Promise<item[]> {
  const files = [
    {
      name: "200000_nagano_covid19_patients.csv",
      type: CONST_PATIENTS
    },
    {
      name: "200000_nagano_covid19_test_count.csv",
      type: CONST_TEST_COUNT
    },
    {
      name: "200000_nagano_covid19_call_center.csv",
      type: CONST_CALL_CENTER
    }
  ];
  const items: item[] = [];
  await Promise.all(
    files.map(async (file) => {
      const filePath = `./test/files/${file.name}`;
      const csvData = await openLocalFile(filePath);
      const item: item = {
        type: file.type,
        path: filePath,
        data: csvData
      };
      items.push(item);
    })
  );
  return items;
}

export { fetchItemsFromTestDir };
