import { MMDDToDate } from "./utils";

// We don't know what date will be in the file name at what time. So let's queue multiple different dates.
// One of them should fail (gracefully) unless they forget removing it.
const dayBeforeYesterday = new Date(
  new Date().setDate(new Date().getDate() - 2)
);
const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
const today = new Date();
const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));

function dateDetermination(selectedDate: string): Date[] {
  return selectedDate && /\d{4}/.test(selectedDate)
    ? [MMDDToDate(selectedDate)]
    : [dayBeforeYesterday, yesterday, today, tomorrow];
}

export { dateDetermination };
