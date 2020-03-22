function numToStr2digs(number: number): string {
  return `${number}`.padStart(2, "0");
}

function formatToMMDD(date: Date): string {
  return [date.getMonth() + 1, date.getDate()]
    .map(num => numToStr2digs(num))
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

function buildJsonPath(path: string, dir: string) {
  return `${dir}/${getFileNameFromPath(path)
    .replace(/\d+/, "")
    .replace(/\.csv$/, ".json")}`;
}

/**
 * @param japaneseShortDate : something like 2月15日
 */
function japaneseShortDateToDate(japaneseShortDate: string): Date | null {
  const match = japaneseShortDate.match(/^(\d+)月(\d+)日$/);
  if (!match || match.length !== 3) return null;
  const newDate = new Date();
  // TODO: Assuming it's the year of 2020. Let's hope so.
  newDate.setFullYear(2020);
  newDate.setMonth(Number(match[1]) - 1);
  newDate.setDate(Number(match[2]));
  return newDate;
}

function dateToLabel(date: Date, format: string): string | number {
  function pad(num: number): string {
    return numToStr2digs(num);
  }
  switch (format) {
    case "w":
      return date.getDay();
    case "曜日":
      return "日月火水木金土".slice(date.getDay(), date.getDay() + 1);
    case "reportDate":
      // TODO: May need to revisit. There's no trustworthy data. I saw ”令和2年3月15日午前9時現在” wasn't updated.
      return (
        [date.getFullYear(), date.getMonth() + 1, date.getDate()]
          .map(pad)
          .join("/") + " 9:00"
      );
    case "yyyy-mm-dd":
      return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
        .map(pad)
        .join("-");
    case "日付":
      return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      ).toISOString();
    case "short_date":
      return [date.getMonth() + 1, date.getDate()].map(pad).join("/");
    case "判明日":
      return [date.getDate(), date.getMonth() + 1, date.getFullYear()]
        .map(pad)
        .join("/");
    default:
      return "Oops?";
  }
}

function setLabelFromDateStr(dateStr: string, defaultVal: string = "") {
  const isShortJapaneseDate = japaneseShortDateToDate(dateStr) ? true : false;
  const date: Date = japaneseShortDateToDate(dateStr) || new Date();
  return (format: string) => {
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
    keys(obj).forEach(key => {
      newObj[key] =
        typeof obj[key] === "string" &&
        /^\d+$/.test(`${obj[key]}`) &&
        !Number.isNaN(Number(obj[key]))
          ? Number(obj[key])
          : obj[key];
    });
    return newObj;
  }
};

export {
  convertProps,
  formatToMMDD,
  MMDDToDate,
  getFileNameFromPath,
  buildJsonPath,
  setLabelFromDateStr
};
