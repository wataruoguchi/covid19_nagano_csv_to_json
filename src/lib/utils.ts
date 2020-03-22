function formatToMMDD(date: Date): string {
  return [date.getMonth() + 1, date.getDate()]
    .map(num => `${num}`.padStart(2, "0"))
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

export { convertProps, formatToMMDD, MMDDToDate };
