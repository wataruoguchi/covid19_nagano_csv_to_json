type dateToLabelFormat =
  | "w"
  | "曜日"
  | "reportDate"
  | "yyyy-mm-dd"
  | "日付"
  | "short_date"
  | "判明日";
type setLabelInterface = (format: dateToLabelFormat) => string | number;

function numToStr2digs(number: number): string {
  return `${number}`.padStart(2, "0");
}

function formatToMMDD(date: Date): string {
  return [date.getMonth() + 1, date.getDate()]
    .map((num) => numToStr2digs(num))
    .join("");
}

function MMDDToDate(MMDD: string): Date {
  const newDate = new Date();
  const month = MMDD.slice(0, 2);
  const date = MMDD.slice(2, 4);
  if (!Number.isNaN(Number(month))) newDate.setMonth(Number(month) - 1);
  if (!Number.isNaN(Number(date))) newDate.setDate(Number(date));
  return newDate;
}

function getFileNameFromPath(str: string): string {
  return str.split("/").slice(-1)[0];
}

function buildJsonPath(name: string, dir: string): string {
  const fileNameWithExtension = /\.json$/.test(name) ? name : `${name}.json`;
  return `${dir}/${fileNameWithExtension}`;
}

function replaceWideNumStrToNumStr(orig: string): string {
  return orig.replace(/[０-９]/g, (str: string) =>
    String.fromCharCode(str.charCodeAt(0) - 65248)
  );
}

function setJapaneseTimeOffset(date: Date): Date {
  // Japan is 9 hours ahead of UTC.
  // 32400000 is 9 hours
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000 + 32400000);
}

function dateToLabel(date: Date, format: dateToLabelFormat): string | number {
  const _date = setJapaneseTimeOffset(date);
  function pad(num: number): string {
    return numToStr2digs(num);
  }
  switch (format) {
    case "w":
      return _date.getDay();
    case "曜日":
      return "日月火水木金土".slice(_date.getDay(), _date.getDay() + 1);
    case "reportDate":
      return (
        [_date.getFullYear(), _date.getMonth() + 1, _date.getDate()]
          .map(pad)
          .join("/") +
        " " +
        [_date.getHours(), pad(_date.getMinutes())].join(":")
      );
    case "yyyy-mm-dd":
      return [_date.getFullYear(), _date.getMonth() + 1, _date.getDate()]
        .map(pad)
        .join("-");
    case "日付":
      return _date.toISOString();
    case "short_date":
      return [_date.getMonth() + 1, _date.getDate()].map(pad).join("/");
    case "判明日":
      return [_date.getDate(), _date.getMonth() + 1, _date.getFullYear()]
        .map(pad)
        .join("/");
    default:
      return "Oops?";
  }
}

/**
 * @param japaneseShortDate : something like 2月15日
 */
function _japaneseShortDateToDate(japaneseShortDate: string): Date | null {
  const match = japaneseShortDate.match(/^(\d+)月(\d+)日$/);
  if (!match || match.length !== 3) return null;
  const newDate = new Date();
  // TODO: Assuming it's the year of 2020. Let's hope COVID19 extinct by end of 2020.
  newDate.setFullYear(2020);
  newDate.setMonth(Number(match[1]) - 1);
  newDate.setDate(Number(match[2]));
  return newDate;
}

/**
 * setLabelFromJapaneseShortDateStr
 * @param dateStr something like 2月15日
 * @param defaultVal label when parsing failed
 * @param dateModifier It could be 'addDate1' to modify the input date.
 */
function setLabelFromJapaneseShortDateStr(
  dateStr: string,
  defaultVal: string = "",
  dateModifier?: (date: Date) => void
): setLabelInterface {
  if (!dateStr) throw new Error("No dateStr is set");
  const isShortJapaneseDate = _japaneseShortDateToDate(dateStr) ? true : false;
  const date: Date = _japaneseShortDateToDate(dateStr) || new Date();
  if (dateModifier) {
    dateModifier(date);
  }
  return (format: dateToLabelFormat) => {
    return isShortJapaneseDate ? dateToLabel(date, format) : defaultVal;
  };
}

/**
 * @param  dateStr: something like '2020/2/15'
 */
function _dateStrToDate(dateStr: string): Date | null {
  const match = dateStr.match(/^(\d+)\/(\d+)\/(\d+)$/); // rough assumption
  if (!match || match.length !== 4) return null;
  const newDate = new Date();
  newDate.setFullYear(Number(match[1]));
  newDate.setMonth(Number(match[2]) - 1);
  newDate.setDate(Number(match[3]));
  newDate.setHours(0);
  newDate.setMinutes(0);
  newDate.setSeconds(0);
  newDate.setMilliseconds(0);
  return newDate;
}

/**
 * setLabelFromDateStr
 * @param dateStr something like '2020/2/15'
 * @param defaultVal label when parsing failed
 * @param dateModifier It could be 'addDate1' to modify the input date.
 */
function setLabelFromDateStr(
  dateStr: string,
  defaultVal: string = "",
  dateModifier?: (date: Date) => void
): setLabelInterface {
  if (!dateStr) throw new Error("No dateStr is set");
  const isShortJapaneseDate = _dateStrToDate(dateStr) ? true : false;
  const date: Date = _dateStrToDate(dateStr) || new Date();
  if (dateModifier) {
    dateModifier(date);
  }
  return (format: dateToLabelFormat) => {
    return isShortJapaneseDate ? dateToLabel(date, format) : defaultVal;
  };
}

// For TypeScript
function keys<O extends object>(obj: O): Array<keyof O> {
  return Object.keys(obj) as Array<keyof O>;
}

// NOTE: We may want to use it again when 'FIXME' gets fixed.
// function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]) {
//   obj[key] = value;
// }

type FIXME = any;
const convertProps = {
  stringToNum<O extends object>(obj: O) {
    // keys(obj).forEach(key => {
    //   if (typeof obj[key] === "string" && /^\d+$/.test(`${obj[key]}`))
    //     setProperty(obj, key, Number(obj[key]));
    // });
    const newObj: FIXME = {};
    keys(obj).forEach((key) => {
      newObj[key] =
        typeof obj[key] === "string" &&
        /^\d+|,$/.test(`${obj[key]}`) &&
        !Number.isNaN(Number(`${obj[key]}`.replace(",", "")))
          ? Number(`${obj[key]}`.replace(",", ""))
          : obj[key];
    });
    return newObj;
  },
  stringScrub<O extends object>(obj: O) {
    const newObj: FIXME = {};
    keys(obj).forEach((key) => {
      const col = obj[key];
      newObj[key] =
        typeof col === "string"
          ? replaceWideNumStrToNumStr(col).trim().replace(/\n/, " ")
          : col;
    });
    return newObj;
  }
};

function addDate1(date: Date): void {
  date.setDate(date.getDate() + 1);
}

function mkDirs(fs: any, dirPaths: string[]): void {
  dirPaths.forEach((dirName) => {
    // Create directories we'd use.
    try {
      fs.mkdirSync(dirName);
    } catch (e) {}
  });
}

export {
  keys,
  convertProps,
  formatToMMDD,
  MMDDToDate,
  getFileNameFromPath,
  buildJsonPath,
  setLabelFromJapaneseShortDateStr,
  setLabelFromDateStr,
  addDate1,
  dateToLabel,
  mkDirs
};
